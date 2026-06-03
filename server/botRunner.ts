import { BinanceClient } from './binanceClient.js';
import { getSignal, calcRsi, calcMa, calcSupertrend, calcEma } from './strategy.js';
import fs from 'fs';

export const USER_CONFIG = {
    budget:        2000,
    lev:           20,
    max_open:      4,
    margin:        250,     // Amount used per position
    top_pairs:     150,
    target_profit: 3,       // Default net target profit in USD
    strong_target_profit: 5,
    cut_loss:      -25,     // FIX: -150 → -25 (büyük kayıpları engelle)
    cooldown_min:  5,
    min_atr_pct:   0.15,    // 15m ATR must be large enough to cover fees + target
    strong_atr_pct: 0.30,
    max_atr_pct:   1.50,    // FIX: %4.0 -> %1.5 (stop -25$ @20x = %0.5, 3x guvenlik)
    max_5m_range_pct: 2.50, // Maks 5m mum range % (ani pump/dump korumasi)
    time_stop_soft_min: 30,   // FIX: 120 -> 30 min (scalping için 2 saat çok uzun)
    time_stop_hard_min: 60,   // FIX: 240 -> 60 min
    time_stop_min_favorable: 3,
    time_stop_loss_usd: -25,     // FIX: -20 → -25 (hard stop ile uyum)
    max_trades_per_sym: 3     // FIX: Aynı sembole max 3 trade/session (spam engelleme)
};

const MEAN_REVERSION_STRATS = new Set([
    'RSI_OVERSOLD',
    'RSI_OVERBOUGHT',
    'BB_REVERSION_LONG',
    'BB_REVERSION_SHORT',
    'SQUEEZE_LONG',
    'SQUEEZE_SHORT',
    'MA10_BOUNCE',
    'MA10_REJECT'
]);

const DISABLED_STRATS = new Set([
    'VOL_BREAKDN',
    'SQUEEZE_LONG',
    'EMA_CROSS_DN',
    'VOL_BREAKUP'
]);

interface TrendReq { align15m: 'UP' | 'DOWN' | 'ANY', align1h: 'UP' | 'DOWN' | 'ANY' }

const TREND_MATRIX: Record<string, TrendReq> = {
    'TREND_LONG':          { align15m: 'ANY',  align1h: 'ANY'  },
    'TREND_SHORT':         { align15m: 'ANY',  align1h: 'ANY'  },
    'RSI_OVERSOLD':        { align15m: 'UP',   align1h: 'ANY'  },
    'RSI_OVERBOUGHT':      { align15m: 'DOWN', align1h: 'DOWN' },
    'MA10_BOUNCE':         { align15m: 'UP',   align1h: 'ANY'  },
    'MA10_REJECT':         { align15m: 'DOWN', align1h: 'ANY'  },
    'BB_REVERSION_LONG':   { align15m: 'UP',   align1h: 'ANY'  },
    'BB_REVERSION_SHORT':  { align15m: 'DOWN', align1h: 'ANY'  },
    'EMA_CROSS_UP':        { align15m: 'UP',   align1h: 'DOWN' },
    'EMA_CROSS_DN':        { align15m: 'DOWN', align1h: 'ANY'  },
    'MOMENTUM_LONG':       { align15m: 'UP',   align1h: 'ANY'  },
    'MOMENTUM_SHORT':      { align15m: 'DOWN', align1h: 'ANY'  },
    'VOL_BREAKUP':         { align15m: 'ANY',  align1h: 'ANY'  },
    'VOL_BREAKDN':         { align15m: 'ANY',  align1h: 'ANY'  },
    'SQUEEZE_LONG':        { align15m: 'ANY',  align1h: 'ANY'  },
    'SQUEEZE_SHORT':       { align15m: 'DOWN',  align1h: 'ANY'  },
};

export interface SystemLog {
    time: string;
    msg: string;
    level: 'info' | 'warn' | 'error';
}

export class BotRunner {
    isScanning = false;
    openingPosition = false;  // mutex — race condition on multi-signal entry
    marginCallCooldown = 0;  // 5dk yeni pozisyon yok margin call sonrası
    binance = new BinanceClient();
    private fileLogStream = fs.createWriteStream('bot_scan.log', { flags: 'a' });
    private logLineCount = 0;
    private readonly MAX_LOG_LINES = 50000;  // FIX: ~5MB log, sonra rotate
    
    private logToFile(msg: string) {
        const time = new Date().toISOString();
        this.fileLogStream.write(`[${time}] ${msg}\n`);
        this.logLineCount++;
        
        // FIX: Log rotation - 50K satırdan sonra dosyayı sıfırla
        if (this.logLineCount >= this.MAX_LOG_LINES) {
            this.fileLogStream.end();
            const oldPath = `bot_scan.log.${Date.now()}.bak`;
            fs.renameSync('bot_scan.log', oldPath);
            this.fileLogStream = fs.createWriteStream('bot_scan.log', { flags: 'a' });
            this.logLineCount = 0;
            this.addLog(`Log rotated: ${oldPath}`, 'info');
        }
    }

    constructor() {
        // Start the background system loop immediately
        this.loop();
    }
    
    sessionStart = 0;  // FIX: start() içinde set edilecek, constructor'da değil
    sessionNum = 1;
    capital = USER_CONFIG.budget;
    reservedCapital = 0;
    totalRealizedPnl = 0;
    allTimeHigh = USER_CONFIG.budget;
    
    openPositions: Record<string, any> = {};
    closedPositions: any[] = [];
    reversalCooldown: Record<string, number> = {};
    tradesPerSymbol: Record<string, number> = {};  // FIX: Aynı sembole spam açılış sayacı
    strategyLossMemory: Record<string, number> = {};  // sym:strat → timestamp, blocks same strategy re-entry after loss
    cycleLongCount: number = 0;
    cycleShortCount: number = 0;
    
    pairIndex = 0;
    microVolBlocked = 0;
    microVolTotal = 0;
    maxRangePctDynamic = USER_CONFIG.max_5m_range_pct;
    lastAdaptiveAdjust = 0;
    atrBlocked = 0;
    atrTotal = 0;
    maxAtrPctDynamic = USER_CONFIG.max_atr_pct;
    minAtrPctDynamic = USER_CONFIG.min_atr_pct;
    lastAtrAdaptiveAdjust = 0;
    scanStats = {
        checked: 0, passed: 0, priceLow: 0, cooldown: 0, maxTrades: 0,
        microVol: 0, noSignal: 0, disabled: 0, lossMemory: 0,
        staleSignal: 0, atrOutOfRange: 0, microCap: 0, pullback: 0,
        rsi5m: 0, active1mMomentum: 0, lowVolume: 0, trendMatrix: 0,
        correlation: 0, insufficientMargin: 0, leverageBlocked: 0
    };
    lastKlineCheck: Record<string, number> = {};
    lastReversalCheck: Record<string, number> = {};
    lastBalanceCheck: number = 0;
    
    loopInterval: NodeJS.Timeout | null = null;
    startTimeStr: number = Date.now();
    downloadableLog: string | null = null;
    lastLoopTime: number = 0;
    loopCrashCount: number = 0;
    lastLoopDuration: number = 0;
    
    public systemLogs: SystemLog[] = [];

    public addLog(msg: string, level: 'info' | 'warn' | 'error' = 'info') {
        const time = new Date().toISOString().split('T')[1].split('.')[0]; // HH:mm:ss
        this.systemLogs.unshift({ time, msg, level });
        if (this.systemLogs.length > 500) {
            this.systemLogs.pop();
        }
    }

    activePairs: string[] = [];

    async start() {
        if (this.isScanning) return;
        this.isScanning = true;
        this.sessionStart = Date.now();
        if (!this.startTimeStr) this.startTimeStr = Date.now();
        console.log(`[Bot] Fetching Top ${USER_CONFIG.top_pairs} Volume Pairs...`);
        
        this.activePairs = await this.binance.getTop300VolumePairs(USER_CONFIG.top_pairs);
        if (this.activePairs.length === 0) {
            console.error('[Bot] Failed to loaded pairs. Fallback to BTCUSDT');
            this.activePairs = ['BTCUSDT'];
        }

        // Price filter: remove pairs below $0.01 to avoid thin-book slippage
        const allPrices = await this.binance.getAllPrices();
        const beforeCount = this.activePairs.length;
        this.activePairs = this.activePairs.filter(sym => {
            const px = allPrices[sym];
            return px !== undefined && px >= 0.01;
        });
        const removedCount = beforeCount - this.activePairs.length;
        if (removedCount > 0) {
            console.log(`[Bot] Price filter removed ${removedCount} pairs below $0.01. Remaining: ${this.activePairs.length}`);
            this.logToFile(`[Bot] Price filter removed ${removedCount} pairs below $0.01. Remaining: ${this.activePairs.length}`);
        }

        console.log(`[Bot] Scanning Started - ${this.activePairs.length} pairs loaded.`);
        this.logToFile(`[Bot] Scanning Started - ${this.activePairs.length} pairs loaded: ${this.activePairs.join(', ')}`);
        console.log('[Bot] Config:', JSON.stringify(USER_CONFIG));
        
        // Subscribe to Websocket for all tracked pairs and intervals
        this.binance.subscribeKlines(this.activePairs, ['1m', '5m', '15m', '1h']);
    }

    stop() {
        if (this.isScanning) {
            this.isScanning = false;
        }
        console.log('[Bot] Scanning Stopped. Managing open positions only.');
        this.generateLog();
    }

    generateLog() {
        if (this.closedPositions.length === 0) return;
        const headers = ['Kapanis Zamani', 'Aclis Zamani', 'Sembol', 'Yon', 'Giris_Price', 'Cikis_Price', 'Lev', 'Margin', 'P&L_USD', 'Neden', 'Strateji'];
        const rows = this.closedPositions.map(p => {
           return [
             new Date(p.closed).toISOString(),
             new Date(p.opened).toISOString(),
             p.sym, p.side, p.entry, p.closed_price, p.lev, p.size,
             p.pnl.toFixed(4), p.reason, p.strat
           ].join(',');
        });
        this.downloadableLog = [headers.join(','), ...rows].join('\n');
    }

    private async loop() {
        const loopStartTime = Date.now();
        try {
            const now = Date.now();
            
            // Sync real balance directly from Binance every 10 seconds
            if (now - this.lastBalanceCheck > 10000) {
                this.lastBalanceCheck = now;
                const realBalance = await this.binance.getFuturesBalance();
                if (realBalance !== null) {
                    this.capital = realBalance;
                }
                
                // Sync positions to fix PNL and Entry Price reporting discrepancy
                let activeBinancePos: any[] = [];
                try {
                    activeBinancePos = await this.binance.getActivePositions();
                } catch (e) {
                    this.addLog('[SYNC] getActivePositions failed, skipping position sync', 'warn');
                }
                
                if (activeBinancePos.length === 0) {
                    // No active positions from Binance (simulation mode or API error)
                    // Calculate reservedCapital from local openPositions instead of setting to 0
                    let updatedReservedCapital = 0;
                    for (const sym of Object.keys(this.openPositions)) {
                        const pos = this.openPositions[sym];
                        if (pos && pos.size) {
                            updatedReservedCapital += pos.size;
                        }
                    }
                    this.reservedCapital = updatedReservedCapital;
                } else {
                    let updatedReservedCapital = 0;
                    const activeBinanceSyms = new Set(activeBinancePos.map((p: any) => p.symbol));

                    for (const bPos of activeBinancePos) {
                    const sym = bPos.symbol;
                    const entryPrice = parseFloat(bPos.entryPrice);
                    const posAmt = parseFloat(bPos.positionAmt);
                    const absPosAmt = Math.abs(posAmt);
                    const lev = parseFloat(bPos.leverage);
                    const estNotional = absPosAmt * entryPrice;
                    const actualMarginUsd = estNotional / lev;

                    if (!this.openPositions[sym]) {
                        // Bot baslatildiginda onceden acik olan pozisyonlari yukle
                        this.openPositions[sym] = {
                            sym,
                            side: posAmt > 0 ? 'LONG' : 'SHORT',
                            entry: entryPrice,
                            size: actualMarginUsd,
                            filledQty: absPosAmt,
                            lev: lev,
                            strat: 'RESTORED',
                            opened_at: Date.now(),
                            openCommission: estNotional * 0.0005 // Tahmini komisyon (0.05% taker)
                        };
                    } else {
                        // Mevcut pozisyonu guncelle
                        this.openPositions[sym].entry = entryPrice;
                        this.openPositions[sym].lev = lev;
                        this.openPositions[sym].filledQty = absPosAmt;
                        this.openPositions[sym].size = actualMarginUsd; // Sync actual USD margin
                        
                        // Eger openCommission local'de yoksa, tahmin et (0.05% taker):
                        if (!this.openPositions[sym].openCommission) {
                            this.openPositions[sym].openCommission = estNotional * 0.0005; 
                        }
                    }
                    this.openPositions[sym].unRealizedProfit = parseFloat(bPos.unRealizedProfit);
                    updatedReservedCapital += actualMarginUsd;
                }
                
                // Binance tarafinda kapatilmis pozisyonlari local'den temizle ve PnL'i kaydet
                for (const openSym of Object.keys(this.openPositions)) {
                    if (!activeBinanceSyms.has(openSym)) {
                        const lostPos = this.openPositions[openSym];
                        const estNotional = lostPos.size * lostPos.lev;
                        const openCommission = lostPos.openCommission || (estNotional * 0.0005);
                        const estCloseCommission = estNotional * 0.0005;
                        const totalCommission = openCommission + estCloseCommission;

                        let netPnl: number;
                        if (lostPos.unRealizedProfit !== undefined) {
                            netPnl = lostPos.unRealizedProfit - totalCommission;
                        } else {
                            const closePx = lostPos.currentPrice || lostPos.entry;
                            const pnlRaw = lostPos.side === 'LONG'
                                ? ((closePx - lostPos.entry) / lostPos.entry)
                                : ((lostPos.entry - closePx) / lostPos.entry);
                            netPnl = (estNotional * pnlRaw) - totalCommission;
                        }

                        this.totalRealizedPnl += netPnl;
                        this.closedPositions.push({
                            sym: lostPos.sym,
                            side: lostPos.side,
                            entry: lostPos.entry,
                            closed_price: lostPos.currentPrice || lostPos.entry,
                            pnl: netPnl,
                            strat: lostPos.strat || 'UNKNOWN',
                            reason: 'STOP_MARKET',
                            lev: lostPos.lev,
                            size: lostPos.size,
                            opened: lostPos.opened_at,
                            closed: Date.now()
                        });

                        delete this.openPositions[openSym];
                    }
                }
                
                // Toplam capital (Kasa) ve Reserved (Kullanilan) Margin'i kalibre et
                this.reservedCapital = updatedReservedCapital;
                }
            }
            
            const currentPrices = await this.binance.getAllPrices();

            let currentTotalNetPnl = 0;

            // 1. Check open positions
            for (const sym of Object.keys(this.openPositions)) {
                const pos = this.openPositions[sym];
                const price = currentPrices[sym];
                if (!price) continue;

                pos.currentPrice = price;
                
                const notionalValue = pos.size * pos.lev;
                const estCloseCommission = notionalValue * 0.0005; // 0.05% expected taker fee for closing
                const openCommission = pos.openCommission || (notionalValue * 0.0005);
                const totalCommission = openCommission + estCloseCommission;
                
                const pnlRaw = pos.side === 'LONG' 
                    ? ((price - pos.entry) / pos.entry) 
                    : ((pos.entry - price) / pos.entry);
                const grossUsd = notionalValue * pnlRaw;
                const netPnlUsd = grossUsd - totalCommission;

                pos.netPnlUsd = netPnlUsd;
                pos.pnlPct = (netPnlUsd / pos.size) * 100;
                pos.maxNetPnlUsd = Math.max(pos.maxNetPnlUsd ?? netPnlUsd, netPnlUsd);
                pos.minNetPnlUsd = Math.min(pos.minNetPnlUsd ?? netPnlUsd, netPnlUsd);
                
                currentTotalNetPnl += netPnlUsd;

                const targetProfit = pos.targetProfit || USER_CONFIG.target_profit;
                if (netPnlUsd >= targetProfit) {
                    await this.closePosition(sym, 'TAKE_PROFIT');
                    continue;
                }

                // Hard stop-loss per position
                if (netPnlUsd <= USER_CONFIG.cut_loss) {
                    await this.closePosition(sym, 'HARD_STOP_LOSS');
                    continue;
                }

                // TIME_DECAY TP: After 15min, close if >= 80% of target reached
                // Prevents waiting forever for aggressive strategy-based TPs (e.g. BB SMA)
                // while still giving the trade time to run during initial momentum
                const ageMin = (now - pos.opened_at) / 60000;
                if (ageMin >= 15 && netPnlUsd >= targetProfit * 0.8) {
                    await this.closePosition(sym, 'TAKE_PROFIT_TIME_DECAY');
                    continue;
                }

                // MOMENTUM_STOP: Pozisyon max'dan ciddi dusmuste VE hacim cokmusse erken kapat
                // Amac: hedefe ulasamayacagi belli olan trade'leri -$25 stopa dusmeden once kapatmak
                // Hacim kontrolu olmadan basit trailing stop WLD gibi saglikli pullback'leri de keserdi
                const peakPnl = pos.maxNetPnlUsd ?? netPnlUsd;
                if (ageMin >= 3 && peakPnl > 0) {
                    const pctLost = (peakPnl - netPnlUsd) / peakPnl;
                    if (pctLost > 0.65 && netPnlUsd < 10) {
                        const c1m = await this.binance.getKlines(sym, '1m', 7);
                        if (c1m && c1m.length >= 6) {
                            const closed = c1m.slice(-6, -1);
                            const avgVol = closed.reduce((s, k) => s + k.v, 0) / 5;
                            const lastClosed = closed[closed.length - 1];
                            if (lastClosed.v < avgVol * 0.5) {
                                this.logToFile(`[${sym}] MOMENTUM_STOP: ${sym} retrace ${(pctLost*100).toFixed(0)}% from max $${peakPnl.toFixed(2)}, vol collapse (last=${lastClosed.v.toFixed(0)} vs avg=${avgVol.toFixed(0)})`);
                                await this.closePosition(sym, 'MOMENTUM_STOP');
                                continue;
                            }
                        }
                    }
                }

                if (
                    ageMin >= USER_CONFIG.time_stop_soft_min &&
                    netPnlUsd <= USER_CONFIG.time_stop_loss_usd
                ) {
                    await this.closePosition(sym, 'TIME_STOP_NO_BOUNCE');
                    continue;
                }

                if (ageMin >= USER_CONFIG.time_stop_hard_min && netPnlUsd < 0) {
                    await this.closePosition(sym, 'TIME_STOP_HARD');
                    continue;
                }
            }

            // Dynamic Margin Level & Drawdown Check
            // FIX: %80 -> %40 (daha erken koruma, GENIUS/BANANAS gibi felaketleri önler)
            const freeBalance = this.capital - this.reservedCapital;
            const maxDrawdownUsd = freeBalance * 0.40;

            if (currentTotalNetPnl < 0 && Math.abs(currentTotalNetPnl) >= maxDrawdownUsd && Object.keys(this.openPositions).length > 0) {
                let targetSym: string | null = null;
                let largestLoss = 0;  // en buyuk negatif = en cok zarar eden

                for (const sym of Object.keys(this.openPositions)) {
                    const pos = this.openPositions[sym];
                    // En buyuk negatif degeri bul (en cok zarar eden pozisyon)
                    if (pos.netPnlUsd !== undefined && pos.netPnlUsd < largestLoss) {
                        largestLoss = pos.netPnlUsd;
                        targetSym = sym;
                    }
                }

                // If somehow there are no negative positions, just close any to free margin
                if (!targetSym && Object.keys(this.openPositions).length > 0) {
                    targetSym = Object.keys(this.openPositions)[0];
                    largestLoss = this.openPositions[targetSym].netPnlUsd || 0;
                }

                if (targetSym) {
                    const absLoss = Math.abs(currentTotalNetPnl);
                    const logMsg = `[${targetSym}] Kritik Kasa Zarar Limiti! Toplam PNL ($${absLoss.toFixed(2)}) >= Limit ($${maxDrawdownUsd.toFixed(2)}). Kasayi rahatlatmak icin en cok zarar eden pozisyon kapatiliyor! (${largestLoss.toFixed(2)}$)`;
                    this.addLog(logMsg, 'error');
                    console.log(logMsg);
                    await this.closePosition(targetSym, 'MARGIN_CALL_LIQUIDATION');
                    
                    // Margin call sonrası 5 dk yeni pozisyon YOK
                    this.marginCallCooldown = Date.now() + 5 * 60 * 1000;
                    
                    currentTotalNetPnl -= largestLoss;
                }
            }

            // 2. Round-Robin Signal Lookup
            if (this.isScanning && this.activePairs.length > 0) {
                const openCount = Object.keys(this.openPositions).length;
                
                if (this.openingPosition) {
                    this.logToFile(`[BOT] SKIP: Opening mutex locked`);
                } else if (openCount < USER_CONFIG.max_open) {
                    this.cycleLongCount = 0;
                    this.cycleShortCount = 0;
                    this.openingPosition = true;  // mutex lock
                    let checked = 0;
                    let processed = 0;
                    while (checked < this.activePairs.length) {
                        const sym = this.activePairs[this.pairIndex % this.activePairs.length];
                        this.pairIndex++;
                        checked++;

                        if (this.openPositions[sym]) continue;
                        
                        // Margin call sonrası 5 dk yeni pozisyon YOK
                        if (Date.now() < this.marginCallCooldown) {
                            continue;
                        }
                        
                        if (this.reversalCooldown[sym] && now < this.reversalCooldown[sym]) {
                            // Sadece cooldown yeni basladiginda spam yapmamak icin sessizce gec, ama her pair icin 5sn gecikmeden sonra logla ki cok sismesin
                            continue;
                        }

                        const price = currentPrices[sym];
                        if (!price) continue;

                        // Minimum price filter: micro-cap coinlerde 1 tick = cok buyuk %
                        if (price < 0.008) {
                            this.logToFile(`[${sym}] REJECT: Price too low (${price})`);
                            this.scanStats.priceLow++;
                            continue;
                        }

                        // Minimal cooldown per pair (prevents double-process within same tick)
                        // REST rate limiting is handled by getKlines' 60s cooldown internally.
                        if (this.lastKlineCheck[sym] && now - this.lastKlineCheck[sym] < 100) continue;
                        this.lastKlineCheck[sym] = now;

                        if (this.reversalCooldown[sym] && now < this.reversalCooldown[sym]) {
                             this.logToFile(`[${sym}] REJECT: In cooldown until ${new Date(this.reversalCooldown[sym]).toLocaleTimeString()}`);
                             this.scanStats.cooldown++;
                             continue;
                        }

                        // FIX: Aynı sembole max trade limit kontrolü (PLAYUSDT 8x spam gibi)
                        const symTradeCount = this.tradesPerSymbol[sym] || 0;
                        if (symTradeCount >= USER_CONFIG.max_trades_per_sym) {
                            this.logToFile(`[${sym}] REJECT: Max trades per session reached (${symTradeCount}/${USER_CONFIG.max_trades_per_sym})`);
                            this.scanStats.maxTrades++;
                            continue;
                        }

                        // Startup protection removed - websocket cache loads fast enough
                        // if (now - this.sessionStart < 1000) {
                        //     this.logToFile(`[${sym}] REJECT: Startup protection active`);
                        //     continue;
                        // }

                        this.scanStats.checked++;
                        try {
                            // PRE-FETCH: fire next 3 pairs' klines in background (zero-latency pipeline)
                            for (let pf = 1; pf <= 3; pf++) {
                                const pfSym = this.activePairs[(this.pairIndex + pf) % this.activePairs.length];
                                if (!this.openPositions[pfSym]) {
                                    this.binance.getKlines(pfSym, '15m', 80, true).catch(() => {});
                                    this.binance.getKlines(pfSym, '5m', 15, true).catch(() => {});
                                    this.binance.getKlines(pfSym, '1m', 8, true).catch(() => {});
                                    this.binance.getKlines(pfSym, '1h', 80, true).catch(() => {});
                                }
                            }

                            // Fire all 4 timeframe kline fetches in parallel (minimizes REST wait)
                            const c15mPromise = this.binance.getKlines(sym, '15m', 80);
                            const c5mPromise = this.binance.getKlines(sym, '5m', 15);
                            const c1mPromise = this.binance.getKlines(sym, '1m', 8);
                            const c1hPromise = this.binance.getKlines(sym, '1h', 80);

                            const c15m = await c15mPromise;
                            if (!c15m || c15m.length < 55) {
                                continue;
                            }

                            const closed15m = c15m.slice(0, -1);
                            
                            const c5m = await c5mPromise;
                            if (!c5m || c5m.length < 11) {
                                this.logToFile(`[${sym}] REJECT: c5m data not sufficient (${c5m ? c5m.length : 0})`);
                                continue;
                            }
                            
                            const closed5m = c5m.slice(0, -1);

                            // Mikro-volatilite: son 10 kapali 5m mumundaki max range kontrol
                            let maxRange5mPct = 0;
                            const lookback5m = Math.min(10, closed5m.length);
                            for (let i = closed5m.length - lookback5m; i < closed5m.length; i++) {
                                const m = closed5m[i];
                                const range = (m.h - m.l) / m.l * 100;
                                if (range > maxRange5mPct) maxRange5mPct = range;
                            }
                            this.microVolTotal++;
                            if (maxRange5mPct > this.maxRangePctDynamic) {
                                this.microVolBlocked++;
                                this.scanStats.microVol++;
                                this.logToFile(`[${sym}] REJECT: 5m micro-volatility too high (max range ${maxRange5mPct.toFixed(2)}%)`);
                                continue;
                            }

                            const sig = getSignal(closed15m); // ONLY use closed candles
                            if (!sig || sig.score < 0.75) {  // FIX: 0.70 -> 0.75 (daha kaliteli sinyaller)
                                this.scanStats.noSignal++;
                                if (processed === 0 && !sig) {
                                    const rsi15 = closed15m.length >= 14 ? calcRsi(closed15m) : -1;
                                    const lastC = closed15m[closed15m.length - 1]?.c ?? 0;
                                    const dev = closed15m.length >= 10 ? ((lastC / calcMa(closed15m, 10)) - 1) * 100 : 0;
                                    console.log(`[NO_SIG] ${sym}: rsi=${rsi15.toFixed(1)} dev=${dev.toFixed(2)}%`);
                                    const prevKlines = closed15m.slice(0, -1);
                                    if (prevKlines.length >= 14) {
                                        const rsiPrev = calcRsi(prevKlines);
                                        console.log(`[NO_SIG] justOversold=${rsiPrev >= 30 && rsi15 < 30}, justOverbought=${rsiPrev <= 70 && rsi15 > 70}`);
                                    }
                                }
                                continue;
                            }

                            if (DISABLED_STRATS.has(sig.name)) {
                                this.scanStats.disabled++;
                                continue;
                            }

                            // Strategy loss memory check (same symbol+strategy lost recently)
                            const memKey = `${sym}:${sig.name}`;
                            if (this.strategyLossMemory[memKey] && now < this.strategyLossMemory[memKey]) {
                                this.scanStats.lossMemory++;
                                this.logToFile(`[${sym}] REJECT: Strategy ${sig.name} in loss cooldown (${Math.ceil((this.strategyLossMemory[memKey] - now) / 60000)}min remaining)`);
                                continue;
                            }

                            // Boost score for most profitable strategies
                            if (sig.name === 'TREND_LONG' || sig.name === 'MA10_REJECT') {
                                sig.score = Math.min(sig.score + 0.05, 1.0);
                            }

                            const sigCandle = closed15m[closed15m.length - 1];
                            const sigClosePrice = sigCandle.c;
                            const sigCloseTime = sigCandle.t + 15 * 60 * 1000;
                            const candleAgeMs = now - sigCloseTime;

                            // Fresh Signal: Valid for 20 minutes (1.3x candle duration)
                            // 15min eliminated timing staleness, but dead pairs (17-32min old candles) still blocked.
                            // 20min: catches pairs with 15-20min delayed candles; only truly dead (>20min) blocked.
                            if (candleAgeMs > 20 * 60 * 1000) {
                                this.scanStats.staleSignal++;
                                console.log(`[STALE] ${sym}: ${sig.name} candleAge=${(candleAgeMs/60000).toFixed(1)}min > 20min`);
                                continue;
                            }

                            const atrPct = (sig.avg_move / sigClosePrice) * 100;
                            this.atrTotal++;
                            if (atrPct < this.minAtrPctDynamic || atrPct > this.maxAtrPctDynamic) {
                                this.atrBlocked++;
                                this.scanStats.atrOutOfRange++;
                                this.logToFile(`[${sym}] REJECT: ATR% out of scalp range (${atrPct.toFixed(2)}%)`);
                                continue;
                            }

                            // RSI_OVERSOLD requires ATR > 0.6% (low-ATR coins have terrible R:R)
                            if (sig.name === 'RSI_OVERSOLD' && atrPct < 0.6) {
                                this.scanStats.atrOutOfRange++;
                                this.logToFile(`[${sym}] REJECT: RSI_OVERSOLD requires ATR > 0.6% (got ${atrPct.toFixed(2)}%)`);
                                continue;
                            }

                            // Mikro-cap filtre: $0.05 alti coinlerde tick granularity pozisyon yonetimini imkansiz kiliyor
                            if (price < 0.05) {
                                this.scanStats.microCap++;
                                this.logToFile(`[${sym}] REJECT: Micro-cap coin (< $0.05, price=${price})`);
                                continue;
                            }

                            // Pullback Control (0.5% allowed slippage) FIX: 0.3% -> 0.5%
                            if (sig.side === 'LONG' && price > sigClosePrice * 1.005) {
                                this.scanStats.pullback++;
                                this.logToFile(`[${sym}] REJECT: LONG Price too high (Price: ${price}, Limit: ${sigClosePrice * 1.005})`);
                                continue;
                            }
                            if (sig.side === 'SHORT' && price < sigClosePrice * 0.995) {
                                this.scanStats.pullback++;
                                this.logToFile(`[${sym}] REJECT: SHORT Price too low (Price: ${price}, Limit: ${sigClosePrice * 0.995})`);
                                continue;
                            }

                            // Alt zaman momentum (esnetildi)
                            const rsi5m = calcRsi(closed5m, 14);
                            if (sig.side === 'LONG' && rsi5m > 80) {
                                this.scanStats.rsi5m++;
                                this.logToFile(`[${sym}] REJECT: LONG RSI5m too high (${rsi5m.toFixed(2)})`);
                                continue;
                            }
                            if (sig.side === 'SHORT' && rsi5m < 20) {
                                this.scanStats.rsi5m++;
                                this.logToFile(`[${sym}] REJECT: SHORT RSI5m too low (${rsi5m.toFixed(2)})`);
                                continue;
                            }

                            // EMA_CROSS_UP specific: require RSI5m < 60 (buying pullback within 15m uptrend)
                            if (sig.name === 'EMA_CROSS_UP' && rsi5m > 60) {
                                this.scanStats.rsi5m++;
                                this.logToFile(`[${sym}] REJECT: EMA_CROSS_UP requires RSI5m < 60 (got ${rsi5m.toFixed(2)})`);
                                continue;
                            }

                            // Anlik hareket kontrolu
                            const active5m = c5m[c5m.length - 1];
                            if (sig.side === 'LONG' && active5m.c < active5m.o * 0.995) {
                                this.scanStats.active1mMomentum++;
                                this.logToFile(`[${sym}] REJECT: LONG Active 5m candle dropping (O: ${active5m.o}, C: ${active5m.c})`);
                                continue;
                            }
                            if (sig.side === 'SHORT' && active5m.c > active5m.o * 1.005) {
                                this.scanStats.active1mMomentum++;
                                this.logToFile(`[${sym}] REJECT: SHORT Active 5m candle rising (O: ${active5m.o}, C: ${active5m.c})`);
                                continue;
                            }

                            // 1dk momentum kontrolu: son 2 kapanan mumdan en az 1'i sinyal yonunde olmali
                            // RSI_OVERSOLD: son kapanan 1m mum KESINLIKLE YESIL olmali (en az 1'i degil)
                            // NOTE: c1m already being fetched in parallel via c1mPromise above
                            const c1m = await c1mPromise;
                            if (c1m && c1m.length >= 3) {
                                const last1m = c1m[c1m.length - 2];
                                const prev1m = c1m[c1m.length - 3];
                                const longAllowed = last1m.c >= last1m.o || prev1m.c >= prev1m.o;
                                const shortAllowed = last1m.c <= last1m.o || prev1m.c <= prev1m.o;
                                if (sig.side === 'LONG' && !longAllowed) {
                                    this.scanStats.active1mMomentum++;
                                    this.logToFile(`[${sym}] REJECT: LONG last 2 1m both red`);
                                    continue;
                                }
                                if (sig.side === 'SHORT' && !shortAllowed) {
                                    this.scanStats.active1mMomentum++;
                                    this.logToFile(`[${sym}] REJECT: SHORT last 2 1m both green`);
                                    continue;
                                }
                                // Aktif 1m mum sinyale ters yondeyse entry'yi engelle
                                if (c1m.length >= 2) {
                                    const active1m = c1m[c1m.length - 1];
                                    if (sig.side === 'LONG' && active1m.c < active1m.o) {
                                        this.scanStats.active1mMomentum++;
                                        const dropPct = ((1 - active1m.c / active1m.o) * 100).toFixed(2);
                                        this.logToFile(`[${sym}] REJECT: LONG active 1m red (-${dropPct}%)`);
                                        continue;
                                    }
                                    if (sig.side === 'SHORT' && active1m.c > active1m.o) {
                                        this.scanStats.active1mMomentum++;
                                        const risePct = ((active1m.c / active1m.o - 1) * 100).toFixed(2);
                                        this.logToFile(`[${sym}] REJECT: SHORT active 1m green (+${risePct}%)`);
                                        continue;
                                    }
                                }
                            }

                            // RSI_OVERSOLD: son kapanan 1m mum KESINLIKLE YESIL olmali
                            if (sig.name === 'RSI_OVERSOLD' && c1m && c1m.length >= 3) {
                                const last1m = c1m[c1m.length - 2];
                                if (last1m.c < last1m.o) {
                                    this.scanStats.active1mMomentum++;
                                    this.logToFile(`[${sym}] REJECT: RSI_OVERSOLD last closed 1m must be green`);
                                    continue;
                                }
                            }
                            if (sig.name === 'RSI_OVERBOUGHT' && c1m && c1m.length >= 3) {
                                const last1m = c1m[c1m.length - 2];
                                if (last1m.c > last1m.o) {
                                    this.scanStats.active1mMomentum++;
                                    this.logToFile(`[${sym}] REJECT: RSI_OVERBOUGHT last closed 1m must be red`);
                                    continue;
                                }
                            }

                            // Minimum 1m hacim kontrolu: son 5 kapanan mumun ortalama USD hacmi > $15K olmali
                            if (c1m && c1m.length >= 6) {
                                const closed1m = c1m.slice(-6, -1);
                                const avgBaseVol = closed1m.reduce((sum, k) => sum + k.v, 0) / 5;
                                const avgUsdVol = avgBaseVol * price;
                                if (avgUsdVol < 15000) {
                                    this.scanStats.lowVolume++;
                                    this.logToFile(`[${sym}] REJECT: Low 1m volume - avg $${avgUsdVol.toFixed(0)}/min (min $15000)`);
                                    continue;
                                }
                            }

                            const ema50_15m = calcEma(closed15m, 50);
                            const trend15m = sigClosePrice > ema50_15m ? 'UP' : 'DOWN';
                            const trendDistance15mPct = ema50_15m > 0 ? Math.abs((sigClosePrice - ema50_15m) / ema50_15m) * 100 : 0;

                            // 1h EMA50 trend filtresi — SADECE STRICT_TREND_STRATS icin (EMA_CROSS_UP, RSI_OVERBOUGHT)
                            // Mean-reversion stratejileri trend tersine calisir, 1h filtresi onlari korumaz
                            // NOTE: c1h already being fetched in parallel via c1hPromise above
                            const c1h = await c1hPromise;
                            let trend1h: 'UP' | 'DOWN' | 'UNKNOWN' = 'UNKNOWN';
                            if (c1h && c1h.length >= 55) {
                                const closed1h = c1h.slice(0, -1);
                                const ema50_1h = calcEma(closed1h, 50);
                                const price1h = closed1h[closed1h.length - 1]?.c;
                                if (price1h && ema50_1h > 0) {
                                    trend1h = price1h > ema50_1h ? 'UP' : 'DOWN';
                                }
                            }

                            // TREND_MATRIX: per-strategy trend alignment filter
                            const trendReq = TREND_MATRIX[sig.name];
                            if (trendReq) {
                                const ok15m = trendReq.align15m === 'ANY' || trendReq.align15m === trend15m;
                                const ok1h = trendReq.align1h === 'ANY' || trend1h === 'UNKNOWN' || trendReq.align1h === trend1h;
                                if (!ok15m || !ok1h) {
                                    this.scanStats.trendMatrix++;
                                    this.logToFile(`[${sym}] REJECT: ${sig.name} trend matrix requires 15m=${trendReq.align15m} (got ${trend15m}), 1h=${trendReq.align1h} (got ${trend1h})`);
                                    continue;
                                }
                            }

                            // Same-side correlation guard: max 2 positions per side total
                            const existingSameSide = Object.values(this.openPositions).filter(p => p.side === sig.side).length;
                            if (existingSameSide >= 2) {
                                this.scanStats.correlation++;
                                this.logToFile(`[${sym}] REJECT: Correlation guard - already ${existingSameSide} ${sig.side} positions`);
                                continue;
                            }
                            if (sig.side === 'LONG' && this.cycleLongCount >= 2) {
                                this.scanStats.correlation++;
                                this.logToFile(`[${sym}] REJECT: Correlation guard - max 2 LONG per cycle`);
                                continue;
                            }
                            if (sig.side === 'SHORT' && this.cycleShortCount >= 2) {
                                this.scanStats.correlation++;
                                this.logToFile(`[${sym}] REJECT: Correlation guard - max 2 SHORT per cycle`);
                                continue;
                            }

                            const configMarginUsd = USER_CONFIG.margin;
                            const freeBalance = this.capital - this.reservedCapital;
                            const maxDrawdownUsd = freeBalance * 0.40;  // FIX: %80 -> %40

                            if (configMarginUsd > freeBalance || (currentTotalNetPnl < 0 && Math.abs(currentTotalNetPnl) >= maxDrawdownUsd)) {
                                this.scanStats.insufficientMargin++;
                                this.logToFile(`[${sym}] REJECT: Insufficient Free Margin or Max Drawdown Block (Required: ${configMarginUsd}, Available: ${freeBalance})`);
                                continue;
                            }

                            const maxLev = await this.binance.getMaxLeverage(sym);
                            if (maxLev < USER_CONFIG.lev) {
                                this.scanStats.leverageBlocked++;
                                this.logToFile(`[${sym}] REJECT: ${USER_CONFIG.lev}x desteklenmiyor (max: ${maxLev}x)`);
                                this.addLog(`[${sym}] REJECT: Leverage ${USER_CONFIG.lev}x desteklenmiyor (max: ${maxLev}x)`, 'error');
                                continue;
                            }

                            // DIAG: RSI signal-time snapshot (debug for timing mismatch analysis)
                            const rsiAtEntry = calcRsi(closed15m, 14);
                            const ma10AtEntry = calcMa(closed15m, 10);
                            const ma20AtEntry = calcMa(closed15m, 20);
                            const devAtEntry = ((sigClosePrice / ma10AtEntry) - 1) * 100;

                            this.scanStats.passed++;
                            this.logToFile(`[${sym}] OPENED: side=${sig.side} price=${price} strat=${sig.name} rsi=${rsiAtEntry.toFixed(1)} dev=${devAtEntry.toFixed(2)}%`);

                            // FIX: Increment trade counter ON OPEN (not on close) to prevent spam
                            this.tradesPerSymbol[sym] = (this.tradesPerSymbol[sym] || 0) + 1;

                            // Aggressive limit order (maker fee: 0.02%)
                            const apiSide = sig.side === 'LONG' ? 'BUY' : 'SELL';
                            const result = await this.binance.placeLimitOrder(sym, apiSide, configMarginUsd, USER_CONFIG.lev, price);
                            
                            // BUG #1 FIX: Check if API order was successful before saving position
                            if (!result.success) {
                                this.logToFile(`[${sym}] REJECT: API placeMarketOrder failed.`);
                                this.addLog(`[${sym}] OPEN BASARISIZ! API reddetti.`, 'error');
                                continue; 
                            }

                            const actualMarginUsd = (result.filledQty * result.avgPrice) / USER_CONFIG.lev;
                            const notionalValue = actualMarginUsd * USER_CONFIG.lev;
                            
                            // DYNAMIC TP: Strategy TP → ATR-based → Fallback $3
                            let targetProfit = USER_CONFIG.target_profit; // Default $3
                            
                            if (sig.tp_target) {
                                // Strategy belirlediği fiyat hedefini kullan (BB, Momentum vb.)
                                const tpDistance = Math.abs(sig.tp_target - result.avgPrice);
                                const tpPct = tpDistance / result.avgPrice;
                                targetProfit = notionalValue * tpPct;
                                this.logToFile(`[${sym}] TP: Strategy-based $${targetProfit.toFixed(2)} (price target: ${sig.tp_target})`);
                            } else {
                                // ATR bazlı dinamik TP — R:R >= 1:1 garanti (target >= stopLoss)
                                const atrTarget = (atrPct / 100) * notionalValue;
                                const stopUsd = Math.abs(USER_CONFIG.cut_loss);
                                targetProfit = Math.max(USER_CONFIG.target_profit, Math.min(25, atrTarget), stopUsd);
                                this.logToFile(`[${sym}] TP: ATR-based $${targetProfit.toFixed(2)} (ATR%: ${atrPct.toFixed(2)}%, stop: $${stopUsd})`);
                            }

                            this.openPositions[sym] = {
                                sym, 
                                side: sig.side,
                                entry: result.avgPrice, 
                                size: actualMarginUsd, // actual USD margin used based on filled quote quantity
                                filledQty: result.filledQty, // store base asset quantity
                                lev: USER_CONFIG.lev,
                                strat: sig.name,
                                signalScore: sig.score,
                                atrPct,
                                trend15m,
                                trend1h,
                                targetProfit,
                                opened_at: now,
                                openCommission: result.totalCommission,
                                maxNetPnlUsd: -result.totalCommission,
                                minNetPnlUsd: -result.totalCommission,
                                // DIAG: kline state at signal time (RSI mismatch debugging)
                                rsi_at_entry: rsiAtEntry,
                                ma10_at_entry: ma10AtEntry,
                                ma20_at_entry: ma20AtEntry,
                                dev_at_entry: devAtEntry
                            };
                            this.reservedCapital += actualMarginUsd;
                            if (sig.side === 'LONG') this.cycleLongCount++;
                            else this.cycleShortCount++;

                            // SERVER-SIDE STOP-LOSS: Place STOP_MARKET order on Binance
                            // Primary protection at -$25 equivalent — triggers instantly via Binance engine, preventing MARKET-order slippage
                            const stopNotional = actualMarginUsd * USER_CONFIG.lev;
                            const stopLossPct = Math.max(0.008, Math.abs(USER_CONFIG.cut_loss) / stopNotional);
                            const stopPrice = sig.side === 'LONG'
                                ? result.avgPrice * (1 - stopLossPct)
                                : result.avgPrice * (1 + stopLossPct);
                            const slSide = sig.side === 'LONG' ? 'SELL' : 'BUY';
                            const slResult = await this.binance.placeStopLossOrder(sym, slSide, stopPrice, result.avgPrice);
                            if (slResult.success) {
                                this.logToFile(`[${sym}] STOP_MARKET placed @ ${stopPrice.toFixed(8)} (safety net: ${stopLossPct * 100}%)`);
                            } else {
                                this.logToFile(`[${sym}] WARNING: STOP_MARKET failed, relying on polling fallback`);
                            }
                            
                            const logMsg = 'OPEN ' + sig.side + ' ' + sym + ' @ ' + result.avgPrice.toFixed(4) + ' [' + sig.name + '] sz=' + actualMarginUsd.toFixed(2) + ' tp=' + targetProfit.toFixed(2) + ' atr=' + atrPct.toFixed(2) + '% t15=' + trend15m + ' t1h=' + trend1h;
                            this.addLog(`[${sym}] ${logMsg}`, 'info');
                            console.log('  ' + logMsg);

                            const newOpenCount = Object.keys(this.openPositions).length;
                            if (newOpenCount >= USER_CONFIG.max_open) {
                                break;
                            }

                        } catch (e: any) {
                             // silently skip on error
                        }

                        // Process up to 10 valid pair signal checks per tick
                        processed++;
                        if (processed >= 10) break;
                    }  // end while

                    // ADAPTIVE DIAG: reached after while loop
                    console.log(`[DIAG] after while: checked=${checked}, processed=${processed}, microVolTotal=${this.microVolTotal}, microVolBlocked=${this.microVolBlocked}, atrTotal=${this.atrTotal}, atrBlocked=${this.atrBlocked}`);

                    const ADAPTIVE_COOLDOWN = 15 * 60 * 1000; // 15dk cooldown (FIX: 30→15dk)

                    // Adaptive micro-volatility: bidirectional adjustment
                    // >80% blocked → expand (loosen), <20% blocked → contract (tighten)
                    if (this.microVolTotal >= 3) {
                        const blockRate = this.microVolBlocked / this.microVolTotal;
                        if (now - this.lastAdaptiveAdjust > ADAPTIVE_COOLDOWN) {
                            if (blockRate > 0.8) {
                                const nxt = Math.min(10, +((this.maxRangePctDynamic * 1.3).toFixed(2)));
                                this.logToFile(`[ADAPTIVE] max_5m_range_pct: ${this.maxRangePctDynamic.toFixed(2)}% → ${nxt}% (expand, ${(blockRate * 100).toFixed(0)}% blocked)`);
                                this.maxRangePctDynamic = nxt;
                                this.lastAdaptiveAdjust = now;
                            } else if (blockRate < 0.2) {
                                const minBound = USER_CONFIG.max_5m_range_pct;
                                const nxt = Math.max(minBound, +((this.maxRangePctDynamic * 0.95).toFixed(2)));
                                this.logToFile(`[ADAPTIVE] max_5m_range_pct: ${this.maxRangePctDynamic.toFixed(2)}% → ${nxt}% (contract, ${(blockRate * 100).toFixed(0)}% blocked)`);
                                this.maxRangePctDynamic = nxt;
                                this.lastAdaptiveAdjust = now;
                            }
                        }
                    }
                    this.microVolBlocked = 0;
                    this.microVolTotal = 0;

                    // Adaptive ATR: bidirectional adjustment
                    if (this.atrTotal >= 3) {
                        const atrBlockRate = this.atrBlocked / this.atrTotal;
                        if (now - this.lastAtrAdaptiveAdjust > ADAPTIVE_COOLDOWN) {
                            if (atrBlockRate > 0.8) {
                                const newMax = Math.min(10, +((this.maxAtrPctDynamic * 1.3).toFixed(2)));
                                const newMin = Math.max(0.01, +((this.minAtrPctDynamic * 0.7).toFixed(2)));
                                this.logToFile(`[ADAPTIVE] ATR range: ${this.minAtrPctDynamic.toFixed(2)}-${this.maxAtrPctDynamic.toFixed(2)}% → ${newMin.toFixed(2)}-${newMax.toFixed(2)}% (expand, ${(atrBlockRate * 100).toFixed(0)}% blocked)`);
                                this.maxAtrPctDynamic = newMax;
                                this.minAtrPctDynamic = newMin;
                                this.lastAtrAdaptiveAdjust = now;
                            } else if (atrBlockRate < 0.2) {
                                const newMax = Math.max(USER_CONFIG.max_atr_pct, +((this.maxAtrPctDynamic * 0.95).toFixed(2)));
                                const newMin = Math.min(USER_CONFIG.min_atr_pct, +((this.minAtrPctDynamic * 1.05).toFixed(2)));
                                this.logToFile(`[ADAPTIVE] ATR range: ${this.minAtrPctDynamic.toFixed(2)}-${this.maxAtrPctDynamic.toFixed(2)}% → ${newMin.toFixed(2)}-${newMax.toFixed(2)}% (contract, ${(atrBlockRate * 100).toFixed(0)}% blocked)`);
                                this.maxAtrPctDynamic = newMax;
                                this.minAtrPctDynamic = newMin;
                                this.lastAtrAdaptiveAdjust = now;
                            }
                        }
                    }
                    this.atrBlocked = 0;
                    this.atrTotal = 0;

                    this.openingPosition = false;  // mutex unlock AFTER while loop
                }  // end else if
            }
        } catch (e) {
            console.error('Bot Loop Error:', e);
            this.loopCrashCount++;
        }

        this.lastLoopTime = Date.now();
        this.lastLoopDuration = this.lastLoopTime - loopStartTime;
        this.loopInterval = setTimeout(() => this.loop(), 500);
    }

    public async closePosition(sym: string, reason: string, currentPrices?: Record<string, number>) {
        const pos = this.openPositions[sym];
        if (!pos) return;

        // Cancel server-side stop-loss order before closing
        await this.binance.cancelStopLossOrder(sym);

        let price = pos.currentPrice || pos.entry;
        if (currentPrices && currentPrices[sym]) {
            price = currentPrices[sym];
            pos.currentPrice = price;
        }

        // Execute API close real order
        const closeSide = pos.side === 'LONG' ? 'SELL' : 'BUY';
        
        // FIX: LIMIT order first, MARKET order fallback (prevents thin-book slippage)
        // HARD_STOP_LOSS: 0.5% slippage allowance, MARGIN_CALL: 0.5%, others: 0.3%
        let closeResult;
        const slippagePct = reason === 'HARD_STOP_LOSS' || reason === 'MARGIN_CALL_LIQUIDATION' ? 0.005 : 0.003;
        closeResult = await this.binance.closeLimitOrder(pos, sym, closeSide, price, slippagePct);
        if (!closeResult.success) {
            this.logToFile(`[${sym}] LIMIT close failed, trying MARKET order...`);
            closeResult = await this.binance.closeMarketOrder(pos, sym, closeSide, price);
            if (!closeResult.success) {
                this.addLog(`[${sym}] KAPATMA BASARISIZ! LIMIT+MARKET basarisiz. Nedeni: ${reason}`, 'error');
                return;
            }
            this.logToFile(`[${sym}] MARKET close used (slippage risk)`);
        }

        const closePrice = closeResult.avgPrice;
        let closeCommission = closeResult.totalCommission;
        if (closeCommission === 0) {
            closeCommission = pos.size * pos.lev * 0.0005; // Estimate close commission if 0 (e.g. in simulation mode)
        }
        const openCommission = pos.openCommission || (pos.size * pos.lev * 0.0005);
        const totalCommission = openCommission + closeCommission;

        const notional = pos.size * pos.lev;
        const pnlRaw = pos.side === 'LONG' 
            ? ((closePrice - pos.entry) / pos.entry) 
            : ((pos.entry - closePrice) / pos.entry);
        const grossUsd = notional * pnlRaw;
        const netPnlUsd = grossUsd - (totalCommission);

        this.totalRealizedPnl += netPnlUsd;
        // capital guncellemesini ayrica Binance'ten senkronize edecegiz ama local olarak guncelliyoruz:
        this.capital += netPnlUsd;

        this.closedPositions.push({
            sym, side: pos.side, entry: pos.entry,
            closed_price: closePrice, pnl: netPnlUsd,
            strat: pos.strat, reason, lev: pos.lev, size: pos.size,
            opened: pos.opened_at, closed: Date.now(),
            rsi_at_entry: pos.rsi_at_entry,
            ma10_at_entry: pos.ma10_at_entry,
            ma20_at_entry: pos.ma20_at_entry,
            dev_at_entry: pos.dev_at_entry
        });

        this.reservedCapital -= pos.size;
        delete this.openPositions[sym];
        
        // FIX: Her trade sonrası cooldown (sadece kayıp değil, kazanç sonrası da)
        // Kazanç: 3 dk, Kayıp: 5 dk cooldown
        const cooldownSec = netPnlUsd < 0 ? USER_CONFIG.cooldown_min : 3;
        this.reversalCooldown[sym] = Date.now() + cooldownSec * 60000;

        // Strategy loss memory: block same symbol+strategy for 30 min after loss
        if (netPnlUsd < 0) {
            const memKey = `${sym}:${pos.strat}`;
            this.strategyLossMemory[memKey] = Date.now() + 30 * 60 * 1000;
            this.logToFile(`[${sym}] Strategy loss memory set: ${memKey} blocked for 30min`);
        }

        this.logToFile(`[${sym}] CLOSED: side=${pos.side} entry=${pos.entry} close=${closePrice} pnl=${netPnlUsd.toFixed(2)} reason=${reason}`);
        console.log('  CLOSED ' + reason + ' ' + sym + ' ENTRY=' + pos.entry + ' CLOSE=' + closePrice + ' PNL=' + netPnlUsd.toFixed(2));
    }

    getFilterStats() {
        const s = this.scanStats;
        const total = s.checked;
        return {
            summary: {
                checked: s.checked,
                passed: s.passed,
                rejected: total - s.passed,
                reject_rate: total > 0 ? (((total - s.passed) / total) * 100).toFixed(1) + '%' : '0%'
            },
            breakdown: {
                price_low: s.priceLow,
                cooldown: s.cooldown,
                max_trades: s.maxTrades,
                micro_volatility: s.microVol,
                no_signal: s.noSignal,
                disabled_strategy: s.disabled,
                loss_memory: s.lossMemory,
                stale_signal: s.staleSignal,
                atr_out_of_range: s.atrOutOfRange,
                micro_cap: s.microCap,
                pullback_slippage: s.pullback,
                rsi_5m: s.rsi5m,
                active_1m_momentum: s.active1mMomentum,
                low_volume: s.lowVolume,
                trend_matrix: s.trendMatrix,
                correlation_guard: s.correlation,
                insufficient_margin: s.insufficientMargin,
                leverage_blocked: s.leverageBlocked
            },
            adaptive_state: {
                max_5m_range_pct: this.maxRangePctDynamic,
                max_atr_pct: this.maxAtrPctDynamic,
                min_atr_pct: this.minAtrPctDynamic
            }
        };
    }

    getDashboardData() {
        return {
            session_start: this.startTimeStr,
            session_num: this.sessionNum,
            is_active: this.isScanning,
            capital: this.capital,
            total_trades: this.closedPositions.length,
            total_wins: this.closedPositions.filter(p => p.pnl > 0).length,
            total_losses: this.closedPositions.filter(p => p.pnl <= 0).length,
            total_pnl: this.totalRealizedPnl,
            opens: Object.values(this.openPositions).map(p => ({
                sym: p.sym,
                side: p.side,
                entry: p.entry,
                current_price: p.currentPrice || p.entry,
                lev: p.lev,
                size: p.size,
                pnl_pct: p.pnlPct || 0,
                pnl_usd: p.netPnlUsd || 0,
                target_profit: p.targetProfit || USER_CONFIG.target_profit,
                max_pnl_usd: p.maxNetPnlUsd || 0,
                min_pnl_usd: p.minNetPnlUsd || 0,
                atr_pct: p.atrPct || 0,
                trend_15m: p.trend15m || 'UNKNOWN',
                trend_1h: p.trend1h || 'UNKNOWN',
                opened: p.opened_at,
                rsi_at_entry: p.rsi_at_entry,
                ma10_at_entry: p.ma10_at_entry,
                ma20_at_entry: p.ma20_at_entry,
                dev_at_entry: p.dev_at_entry,
            })),
            closed: this.closedPositions.slice(-1000).map(p => ({
                sym: p.sym, side: p.side, entry: p.entry,
                closed_price: p.closed_price, pnl: p.pnl,
                strat: p.strat, reason: p.reason,
                opened: p.opened, closed: p.closed,
                rsi_at_entry: p.rsi_at_entry,
                ma10_at_entry: p.ma10_at_entry,
                ma20_at_entry: p.ma20_at_entry,
                dev_at_entry: p.dev_at_entry,
            })),
            system_logs: this.systemLogs.slice(0, 50),
            server_time: Date.now(),
            elapsed: this.isScanning
                ? (() => {
                    const totalSeconds = Math.floor((Date.now() - this.sessionStart) / 1000);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    const secs = totalSeconds % 60;
                    if (hours > 0) return `${hours}sa ${minutes}dk ${secs}s`;
                    return `${minutes}dk ${secs}s`;
                })()
                : '0dk 0s',
            used_capital: this.reservedCapital,
            unrealized_pnl: Object.values(this.openPositions).reduce((s, p) => s + (p.netPnlUsd || 0), 0),
            has_downloadable_log: !!this.downloadableLog,
            loop_running: !!this.loopInterval,
            last_loop_time: this.lastLoopTime,
            last_loop_duration_ms: this.lastLoopDuration,
            loop_crash_count: this.loopCrashCount,
            pairs_loaded: this.activePairs.length
        };
    }
}


