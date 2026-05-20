import { BinanceClient } from './binanceClient.js';
import { getSignal, calcRsi, calcSupertrend, calcEma } from './strategy.js';
import fs from 'fs';

export const USER_CONFIG = {
    budget:        2000,
    lev:           20,
    max_open:      4,
    margin:        250,     // Amount used per position
    top_pairs:     150,
    target_profit: 3,       // Default net target profit in USD
    strong_target_profit: 5,
    cut_loss:      -75,    // Net max loss per position in USD
    cooldown_min:  5,
    min_atr_pct:   0.15,    // 15m ATR must be large enough to cover fees + target
    strong_atr_pct: 0.30,
    max_atr_pct:   4.00,
    time_stop_soft_min: 30,   // FIX: 120 -> 30 min (scalping için 2 saat çok uzun)
    time_stop_hard_min: 60,   // FIX: 240 -> 60 min
    time_stop_min_favorable: 3,
    time_stop_loss_usd: -20,
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
    'VOL_BREAKDN'
]);

const STRICT_TREND_STRATS = new Set([
    'EMA_CROSS_UP',
    'RSI_OVERBOUGHT'
]);

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
    
    pairIndex = 0;
    lastKlineCheck: Record<string, number> = {};
    lastReversalCheck: Record<string, number> = {};
    lastBalanceCheck: number = 0;
    
    loopInterval: NodeJS.Timeout | null = null;
    startTimeStr: number = Date.now();
    downloadableLog: string | null = null;
    
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

        console.log(`[Bot] Scanning Started - ${this.activePairs.length} pairs loaded.`);
        this.logToFile(`[Bot] Scanning Started - ${this.activePairs.length} pairs loaded: ${this.activePairs.join(', ')}`);
        console.log('[Bot] Config:', JSON.stringify(USER_CONFIG));
        
        // Subscribe to Websocket for all tracked pairs and intervals
        this.binance.subscribeKlines(this.activePairs, ['5m', '15m', '1h']);
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
                
                // Binance tarafinda manuel kapatilmis pozisyonlari local'den temizle
                for (const openSym of Object.keys(this.openPositions)) {
                    if (!activeBinanceSyms.has(openSym)) {
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
                
                let netPnlUsd = 0;
                if (pos.unRealizedProfit !== undefined) {
                    netPnlUsd = pos.unRealizedProfit - totalCommission; 
                } else {
                    const pnlRaw = pos.side === 'LONG' 
                        ? ((price - pos.entry) / pos.entry) 
                        : ((pos.entry - price) / pos.entry);
                    const grossUsd = notionalValue * pnlRaw;
                    netPnlUsd = grossUsd - totalCommission;
                }

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

                // FIX: Hard stop-loss per position (USER_CONFIG.cut_loss = -75)
                if (netPnlUsd <= USER_CONFIG.cut_loss) {
                    await this.closePosition(sym, 'HARD_STOP_LOSS');
                    continue;
                }

                // TIME_DECAY TP: After 10min, close if >= 60% of target reached
                // Prevents waiting forever for aggressive strategy-based TPs (e.g. BB SMA)
                // while still giving the trade time to run during initial momentum
                const ageMin = (now - pos.opened_at) / 60000;
                if (ageMin >= 10 && netPnlUsd >= targetProfit * 0.6) {
                    await this.closePosition(sym, 'TAKE_PROFIT_TIME_DECAY');
                    continue;
                }

                const bestSeen = pos.maxNetPnlUsd ?? netPnlUsd;
                if (
                    ageMin >= USER_CONFIG.time_stop_soft_min &&
                    netPnlUsd <= USER_CONFIG.time_stop_loss_usd &&
                    bestSeen < USER_CONFIG.time_stop_min_favorable
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

                        // 5-second cooldown per pair before re-checking klines to avoid API spam.
                        if (this.lastKlineCheck[sym] && now - this.lastKlineCheck[sym] < 5000) continue;
                        this.lastKlineCheck[sym] = now;

                        if (this.reversalCooldown[sym] && now < this.reversalCooldown[sym]) {
                             this.logToFile(`[${sym}] REJECT: In cooldown until ${new Date(this.reversalCooldown[sym]).toLocaleTimeString()}`);
                             continue;
                        }

                        // FIX: Aynı sembole max trade limit kontrolü (PLAYUSDT 8x spam gibi)
                        const symTradeCount = this.tradesPerSymbol[sym] || 0;
                        if (symTradeCount >= USER_CONFIG.max_trades_per_sym) {
                            this.logToFile(`[${sym}] REJECT: Max trades per session reached (${symTradeCount}/${USER_CONFIG.max_trades_per_sym})`);
                            continue;
                        }

                        // Startup protection removed - websocket cache loads fast enough
                        // if (now - this.sessionStart < 1000) {
                        //     this.logToFile(`[${sym}] REJECT: Startup protection active`);
                        //     continue;
                        // }

                        try {
                            const c15m = await this.binance.getKlines(sym, '15m', 80);
                            if (!c15m || c15m.length < 55) {
                                continue;
                            }

                            const closed15m = c15m.slice(0, -1);
                            
                            const c5m = await this.binance.getKlines(sym, '5m', 15);
                            if (!c5m || c5m.length < 11) {
                                this.logToFile(`[${sym}] REJECT: c5m data not sufficient (${c5m ? c5m.length : 0})`);
                                continue;
                            }
                            
                            const closed5m = c5m.slice(0, -1);
                            
                            const sig = getSignal(closed15m); // ONLY use closed candles
                            if (!sig || sig.score < 0.75) {  // FIX: 0.70 -> 0.75 (daha kaliteli sinyaller)
                                continue;
                            }

                            if (DISABLED_STRATS.has(sig.name)) {
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

                            // Fresh Signal: Valid for 7 minutes (15m strategy)
                            if (candleAgeMs > 7 * 60 * 1000) {
                                continue;
                            }

                            const atrPct = (sig.avg_move / sigClosePrice) * 100;
                            if (atrPct < USER_CONFIG.min_atr_pct || atrPct > USER_CONFIG.max_atr_pct) {
                                this.logToFile(`[${sym}] REJECT: ATR% out of scalp range (${atrPct.toFixed(2)}%)`);
                                continue;
                            }

                            // Pullback Control (0.5% allowed slippage) FIX: 0.3% -> 0.5%
                            if (sig.side === 'LONG' && price > sigClosePrice * 1.005) {
                                this.logToFile(`[${sym}] REJECT: LONG Price too high (Price: ${price}, Limit: ${sigClosePrice * 1.005})`);
                                continue;
                            }
                            if (sig.side === 'SHORT' && price < sigClosePrice * 0.995) {
                                this.logToFile(`[${sym}] REJECT: SHORT Price too low (Price: ${price}, Limit: ${sigClosePrice * 0.995})`);
                                continue;
                            }

                            // Alt zaman momentum (esnetildi)
                            const rsi5m = calcRsi(closed5m, 14);
                            if (sig.side === 'LONG' && rsi5m > 80) {
                                this.logToFile(`[${sym}] REJECT: LONG RSI5m too high (${rsi5m.toFixed(2)})`);
                                continue;
                            }
                            if (sig.side === 'SHORT' && rsi5m < 20) {
                                this.logToFile(`[${sym}] REJECT: SHORT RSI5m too low (${rsi5m.toFixed(2)})`);
                                continue;
                            }

                            // Anlik hareket kontrolu
                            const active5m = c5m[c5m.length - 1];
                            if (sig.side === 'LONG' && active5m.c < active5m.o * 0.99) {
                                this.logToFile(`[${sym}] REJECT: LONG Active 5m candle dropping (O: ${active5m.o}, C: ${active5m.c})`);
                                continue;
                            }
                            if (sig.side === 'SHORT' && active5m.c > active5m.o * 1.01) {
                                this.logToFile(`[${sym}] REJECT: SHORT Active 5m candle rising (O: ${active5m.o}, C: ${active5m.c})`);
                                continue;
                            }

                            const ema50_15m = calcEma(closed15m, 50);
                            const trend15m = sigClosePrice > ema50_15m ? 'UP' : 'DOWN';
                            const trendDistance15mPct = ema50_15m > 0 ? Math.abs((sigClosePrice - ema50_15m) / ema50_15m) * 100 : 0;

                            // 1h EMA50 trend filtresi — SADECE STRICT_TREND_STRATS icin (EMA_CROSS_UP, RSI_OVERBOUGHT)
                            // Mean-reversion stratejileri trend tersine calisir, 1h filtresi onlari korumaz
                            const c1h = await this.binance.getKlines(sym, '1h', 80);
                            let trend1h: 'UP' | 'DOWN' | 'UNKNOWN' = 'UNKNOWN';
                            if (c1h && c1h.length >= 55) {
                                const closed1h = c1h.slice(0, -1);
                                const ema50_1h = calcEma(closed1h, 50);
                                const price1h = closed1h[closed1h.length - 1]?.c;
                                if (price1h && ema50_1h > 0) {
                                    trend1h = price1h > ema50_1h ? 'UP' : 'DOWN';
                                }
                            }

                            if (STRICT_TREND_STRATS.has(sig.name)) {
                                const aligned15m = (sig.side === 'LONG' && trend15m === 'UP') || (sig.side === 'SHORT' && trend15m === 'DOWN');
                                const aligned1h = trend1h === 'UNKNOWN' || (sig.side === 'LONG' && trend1h === 'UP') || (sig.side === 'SHORT' && trend1h === 'DOWN');
                                if (!aligned15m || !aligned1h) {
                                    this.logToFile(`[${sym}] REJECT: strict trend filter for ${sig.name} failed (15m=${trend15m}, 1h=${trend1h})`);
                                    continue;
                                }
                            }

                            const configMarginUsd = USER_CONFIG.margin;
                            const freeBalance = this.capital - this.reservedCapital;
                            const maxDrawdownUsd = freeBalance * 0.40;  // FIX: %80 -> %40

                            if (configMarginUsd > freeBalance || (currentTotalNetPnl < 0 && Math.abs(currentTotalNetPnl) >= maxDrawdownUsd)) {
                                this.logToFile(`[${sym}] REJECT: Insufficient Free Margin or Max Drawdown Block (Required: ${configMarginUsd}, Available: ${freeBalance})`);
                                continue;
                            }

                            const maxLev = await this.binance.getMaxLeverage(sym);
                            if (maxLev < USER_CONFIG.lev) {
                                this.logToFile(`[${sym}] REJECT: ${USER_CONFIG.lev}x desteklenmiyor (max: ${maxLev}x)`);
                                this.addLog(`[${sym}] REJECT: Leverage ${USER_CONFIG.lev}x desteklenmiyor (max: ${maxLev}x)`, 'error');
                                continue;
                            }

                            this.logToFile(`[${sym}] OPENED: side=${sig.side} price=${price} strat=${sig.name}`);

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
                                // ATR bazlı dinamik TP
                                const atrTarget = (atrPct / 100) * notionalValue * 0.5; // ATR'nin yarısı
                                targetProfit = Math.max(USER_CONFIG.target_profit, Math.min(10, atrTarget));
                                this.logToFile(`[${sym}] TP: ATR-based $${targetProfit.toFixed(2)} (ATR%: ${atrPct.toFixed(2)}%)`);
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
                                minNetPnlUsd: -result.totalCommission
                            };
                            this.reservedCapital += actualMarginUsd;
                            
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
                    this.openingPosition = false;  // mutex unlock AFTER while loop
                }  // end else if
            }
        } catch (e) {
            console.error('Bot Loop Error:', e);
        }

        this.loopInterval = setTimeout(() => this.loop(), 500);
    }

    public async closePosition(sym: string, reason: string, currentPrices?: Record<string, number>) {
        const pos = this.openPositions[sym];
        if (!pos) return;

        let price = pos.currentPrice || pos.entry;
        if (currentPrices && currentPrices[sym]) {
            price = currentPrices[sym];
            pos.currentPrice = price;
        }

        // Execute API close real order
        const closeSide = pos.side === 'LONG' ? 'SELL' : 'BUY';
        
        // BUG #2 FIX: Verify actual closing
        const closeResult = await this.binance.closeMarketOrder(pos, sym, closeSide, price);
        if (!closeResult.success) {
            this.addLog(`[${sym}] KAPATMA BASARISIZ! API reddetti. 10sn sonra tekrar denenecek. Nedeni: ${reason}`, 'error');
            return; // Pozisyonu dashboard'da acik birakmaya devam et!
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
            opened: pos.opened_at, closed: Date.now()
        });

        this.reservedCapital -= pos.size;
        delete this.openPositions[sym];
        
        // FIX: Her trade sonrası cooldown (sadece kayıp değil, kazanç sonrası da)
        // Kazanç: 3 dk, Kayıp: 5 dk cooldown
        const cooldownSec = netPnlUsd < 0 ? USER_CONFIG.cooldown_min : 3;
        this.reversalCooldown[sym] = Date.now() + cooldownSec * 60000;

        this.logToFile(`[${sym}] CLOSED: side=${pos.side} entry=${pos.entry} close=${closePrice} pnl=${netPnlUsd.toFixed(2)} reason=${reason}`);
        console.log('  CLOSED ' + reason + ' ' + sym + ' ENTRY=' + pos.entry + ' CLOSE=' + closePrice + ' PNL=' + netPnlUsd.toFixed(2));
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
            })),
            closed: this.closedPositions.slice(-1000).map(p => ({
                sym: p.sym, side: p.side, entry: p.entry,
                closed_price: p.closed_price, pnl: p.pnl,
                strat: p.strat, reason: p.reason,
                opened: p.opened, closed: p.closed,
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
            has_downloadable_log: !!this.downloadableLog
        };
    }
}


