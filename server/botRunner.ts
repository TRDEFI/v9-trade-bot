import { BinanceClient } from './binanceClient.js';
import { getSignal, getSignal5m, calcMa } from './strategy.js';

export const TOP100_PAIRS = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ZECUSDT', 'XRPUSDT', 'DOGEUSDT', 'FILUSDT',
    'TONUSDT', 'BNBUSDT', 'SUIUSDT', 'NEARUSDT', 'TAOUSDT', 'ICPUSDT', 'ENAUSDT',
    'LINKUSDT', 'ADAUSDT', 'AVAXUSDT', 'OPUSDT', 'SKYAIUSDT', 'ARBUSDT', 'UNIUSDT',
    'DASHUSDT', 'WLDUSDT', 'NOTUSDT', '1000BONKUSDT', 'LTCUSDT', 'AAVEUSDT', 'DOTUSDT',
    'TIAUSDT', 'APTUSDT', '1000LUNCUSDT', 'PENDLEUSDT', 'TRXUSDT', 'BCHUSDT', 'ORDIUSDT',
    '1000SHIBUSDT', 'JUPUSDT', 'INJUSDT', 'XLMUSDT', 'CHZUSDT', 'ETCUSDT', 'FETUSDT',
    'ALGOUSDT', 'WIFUSDT', 'MOVRUSDT', 'XMRUSDT', 'EIGENUSDT', 'ARUSDT', 'HBARUSDT',
    'SEIUSDT', 'ORCAUSDT', 'MAGICUSDT', 'GALAUSDT', 'DYDXUSDT', 'PEPEUSDT', 'BOMEUSDT',
    'ENSUSDT', 'FLOKIUSDT', 'RNDRUSDT', 'MATICUSDT', 'SANDUSDT', 'MANAUSDT', 'AXSUSDT',
    'SNXUSDT', 'THETAUSDT', 'KASUSDT', 'IMXUSDT', 'VETUSDT', 'GRTUSDT', 'EGLDUSDT',
    'RUNEUSDT', 'MKRUSDT', 'QNTUSDT', 'MNTUSDT', 'BEAMXUSDT', 'FLOWUSDT', 'CRVUSDT',
    'GMXUSDT', 'ZILUSDT', 'ENJUSDT', '1INCHUSDT', 'COMPUSDT', 'ROSEUSDT', 'MINAUSDT',
    'KAVAUSDT', 'WOOUSDT', 'APEUSDT', 'NEOUSDT', 'XTZUSDT', 'IOTAUSDT', 'ILVUSDT',
    'KSMUSDT', 'GNOUSDT', 'BLURUSDT', 'GLMRUSDT', 'MASKUSDT', 'JASMYUSDT', 'QTUMUSDT',
    'SUSHIUSDT', 'ONDOUSDT', 'OCEANUSDT', 'BICOUSDT', 'ZRXUSDT', 'BATUSDT', 'ONTUSDT',
    'METISUSDT', 'NKNUSDT', 'BANDUSDT', 'ICXUSDT', 'ZENUSDT', 'YFIUSDT', 'ZECUSDT',
    'BALUSDT', 'STORJUSDT', 'SKLUSDT', 'CVCUSDT', 'CTSIUSDT', 'RLCUSDT', 'TRBUSDT',
    'NMRUSDT', 'LPTUSDT', 'BAKEUSDT', 'ALPHAUSDT', 'SFPUSDT', 'BELUSDT', 'LITUSDT',
    'C98USDT', 'DARUSDT', 'ALICEUSDT', 'TLMUSDT', 'SLPUSDT', 'GTCUSDT', 'YGGUSDT',
    'ATAUSDT', 'RAYUSDT', 'FIDAUSDT', 'AGLDUSDT', 'RADUSDT', 'LRCUSDT', '1000PEPEUSDT',
    '1000FLOKIUSDT', '1000XECUSDT', '1000SATSUSDT', '1000RATSUSDT', 'MBOXUSDT', 'CFXUSDT',
    'ACHUSDT', 'SSVUSDT', 'JOEUSDT', 'BNXUSDT', 'HIGHUSDT', 'CVXUSDT', 'FXSUSDT'
];

export const USER_CONFIG = {
    budget:        5000,
    lev:           30,
    stop_pct:      0.5,      // Scalping Stop Loss: 0.5%
    min_score:     0.75,     
    max_open:      10,
    cooldown_min:  15,       // Cooldown increased to 15m as per Claude's suggestion
    run_minutes:   0,        // 0 -> run indefinitely
    tp_usd:        25,       // Target TP value in USD
    margin:        500,      // Amount used per position
};

export class BotRunner {
    isScanning = false;
    binance = new BinanceClient();
    
    constructor() {
        // Start the background system loop immediately
        this.loop();
    }
    
    sessionStart = Date.now();
    sessionNum = 1;
    capital = USER_CONFIG.budget;
    reservedCapital = 0;
    totalRealizedPnl = 0;
    allTimeHigh = USER_CONFIG.budget;
    
    openPositions: Record<string, any> = {};
    closedPositions: any[] = [];
    reversalCooldown: Record<string, number> = {};
    
    pairIndex = 0;
    lastKlineCheck: Record<string, number> = {};
    lastReversalCheck: Record<string, number> = {};
    
    loopInterval: NodeJS.Timeout | null = null;
    startTimeStr: number = Date.now();
    downloadableLog: string | null = null;
    scanningLogs: string[] = [];

    private logScan(msg: string) {
        const d = new Date();
        const t = d.toTimeString().split(' ')[0];
        this.scanningLogs.unshift(`[${t}] ${msg}`);
        if(this.scanningLogs.length > 50) this.scanningLogs.pop();
    }

    start() {
        if (this.isScanning) return;
        this.isScanning = true;
        this.sessionStart = Date.now();
        if (!this.startTimeStr) this.startTimeStr = Date.now();
        console.log('[Bot] Scanning Started - TOP100 scanner');
        console.log('[Bot] Config:', JSON.stringify(USER_CONFIG));
        
        // Subscribe to Websocket for all tracked pairs and intervals
        this.binance.subscribeKlines(TOP100_PAIRS, ['5m', '15m', '1h']);
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

    private lastLogScan: number = Date.now();

    private async loop() {
        try {
            const now = Date.now();
            if (now - this.lastLogScan > 60000 && this.isScanning) {
                this.logScan("Otomatik Tarama Devam Ediyor... (Filtreler: 5m Hacim, 15m Trend, 1h MA)");
                this.lastLogScan = now;
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
                const commissionUsd = notionalValue * 0.0004;
                const pnlRaw = pos.side === 'LONG' 
                    ? ((price - pos.entry) / pos.entry) 
                    : ((pos.entry - price) / pos.entry);
                const grossUsd = notionalValue * pnlRaw;
                const netPnlUsd = grossUsd - commissionUsd;

                pos.netPnlUsd = netPnlUsd;
                pos.pnlPct = (netPnlUsd / pos.size) * 100;

                const tpHit = pos.side === 'LONG' ? price >= pos.tp_price : price <= pos.tp_price;
                const slHit = pos.side === 'LONG' ? price <= pos.sl_price : price >= pos.sl_price;

                if (tpHit) {
                    this.closePosition(sym, 'TAKE_PROFIT');
                    continue;
                }
                if (slHit) {
                    this.closePosition(sym, 'STOP_LOSS');
                    continue;
                }
                
                // Smart Reversal Check (every 60 sec)
                if (!this.lastReversalCheck[sym] || now - this.lastReversalCheck[sym] > 60000) {
                    this.lastReversalCheck[sym] = now;
                    this.binance.getKlines(sym, '5m', 50).then(async c => { // 5m for fast scalping momentum
                        if (!c || c.length < 25) return;
                        const sig = getSignal5m(c.slice(0, -1)); // ONLY use closed candles
                        
                        // Calculate current PNL percentage
                        const pnlPct = pos.side === 'LONG' 
                             ? (price - pos.entry) / pos.entry 
                             : (pos.entry - price) / pos.entry;

                        const isLosing = pnlPct < 0;
                        const lossPct = isLosing ? Math.abs(pnlPct * 100) : 0;

                        if (sig && sig.score >= USER_CONFIG.min_score && sig.side !== pos.side) {
                            
                            // 15m Cross-Check (Replacing old 1h check for faster resolution)
                            try {
                                const c15m = await this.binance.getKlines(sym, '15m', 50);
                                if (c15m && c15m.length >= 20) {
                                    const sig15m = getSignal(c15m.slice(0, -1));
                                    // If 15m still strongly supports our ORIGINAL position, ignore the 5m reversal check
                                    if (sig15m && sig15m.side === pos.side && sig15m.score >= USER_CONFIG.min_score) {
                                        console.log(`[Bot] Ignored 5m reversal for ${sym} because 15m signal (${sig15m.side}) is still strong.`);
                                        return;
                                    }
                                }
                            } catch (e: any) {
                                console.error(`[Bot] 15m cross-check failed for ${sym}:`, e.message);
                            }

                            // Reversal sharpness evaluation
                            let isSharpReversal = false;
                            
                            // 1. Strong signal score indicates sharper reversal
                            if (sig.score >= 0.86) isSharpReversal = true;
                            
                            // 2. High momentum on the latest candle (e.g., > 0.4% move in 5min)
                            const lastK = c[c.length - 1];
                            const candleMove = Math.abs(lastK.c - lastK.o) / lastK.o * 100;
                            if (candleMove >= 0.4) isSharpReversal = true;

                            if (lossPct < 0.5) {
                                // If loss is small, require a sharp reversal to panic close
                                if (isSharpReversal) {
                                     console.log(`[Bot] Sharp reversal detected for ${sym}, changing from ${pos.side} to ${sig.side}. Closing position...`);
                                     this.closePosition(sym, 'REVERSAL_SHARP', { [sym]: lastK.c });
                                }
                            } else {
                                // If loss is already significant (> 0.5%), a reversal signal confirms the wrong direction, close to cut losses.
                                console.log(`[Bot] Reversal confirmed with >0.5% loss for ${sym}. Closing position...`);
                                this.closePosition(sym, 'REVERSAL', { [sym]: lastK.c });
                            }
                        }
                    }).catch(e => console.error("Reversal check err:", e.message));
                }
            }

            // 2. Round-Robin Signal Lookup
            if (this.isScanning) {
                const openCount = Object.keys(this.openPositions).length;
                
                if (openCount < USER_CONFIG.max_open) {
                    // Check up to 10 pairs per loop to speed up but still avoid rate limit blocking. 
                    // Or we can just check 1 pair as user's original logic. User had 1 loop/sec. Let's do 1 pair per tick.
                    let checked = 0;
                    while (checked < TOP100_PAIRS.length) {
                        const sym = TOP100_PAIRS[this.pairIndex % TOP100_PAIRS.length];
                        this.pairIndex++;
                        checked++;

                        if (this.openPositions[sym]) continue;
                        if (this.reversalCooldown[sym] && now < this.reversalCooldown[sym]) continue;

                        const price = currentPrices[sym];
                        if (!price) continue;

                        // 5-second cooldown per pair before re-checking klines to avoid API spam.
                        if (this.lastKlineCheck[sym] && now - this.lastKlineCheck[sym] < 5000) continue;
                        this.lastKlineCheck[sym] = now;

                        try {
                            // 1. Fast trigger on 5m
                            const c5m = await this.binance.getKlines(sym, '5m', 50);
                            if (!c5m || c5m.length < 20) continue;

                            const sig = getSignal5m(c5m.slice(0, -1)); // ONLY use closed candles
                            if (!sig || sig.score < USER_CONFIG.min_score) continue;
                            
                            this.logScan(`[${sym}] 5m Sinyal Olasılığı (${sig.side}) bulundu. Üst TF'ler inceleniyor...`);

                            // 2. Trend alignment on 15m
                            const c15m = await this.binance.getKlines(sym, '15m', 50);
                            if (!c15m || c15m.length < 20) continue;
                            const sig15m = getSignal(c15m.slice(0, -1));

                            if (sig15m && sig15m.score >= USER_CONFIG.min_score && sig15m.side !== sig.side) {
                                this.logScan(`[${sym}] İptal: 15m sinyali (${sig15m.side}) ters yönde.`);
                                continue;
                            }

                            // 3. Fakeout detection on 1h trend
                            const c1h = await this.binance.getKlines(sym, '1h', 50);
                            if (!c1h || c1h.length < 20) continue;
                            
                            const closed1hObj = c1h.slice(0, -1);
                            const ma1h20 = calcMa(closed1hObj, 20);
                            const p1h = closed1hObj[closed1hObj.length - 1].c;
                            
                            // Prevent going heavily against the 1h trend 
                            if (sig.side === 'LONG' && p1h < ma1h20) {
                                this.logScan(`[${sym}] İptal: LONG sinyali ancak fiyat 1h MA20 (Düşüş) altında.`);
                                continue;
                            }
                            if (sig.side === 'SHORT' && p1h > ma1h20) {
                                this.logScan(`[${sym}] İptal: SHORT sinyali ancak fiyat 1h MA20 (Yükseliş) üstünde.`);
                                continue;
                            }
                            
                            this.logScan(`[${sym}] Mükemmel eşleşme! Tüm zaman dilimleri onayladı. Pozisyon açılıyor.`);

                        const size = USER_CONFIG.margin;
                        const notional = size * USER_CONFIG.lev;

                        // Doğru TP Hesaplaması (komisyon dahil)
                        const commissionPerSide = notional * 0.0004;
                        const totalCommission = commissionPerSide * 2; // giriş + çıkış
                        const targetGross = USER_CONFIG.tp_usd + totalCommission;
                        const tpDist = price * (targetGross / notional);
                        const tp_price = sig.side === 'LONG' ? price + tpDist : price - tpDist;
                        
                        // Strict Stop Loss Calculation (USER_CONFIG.stop_pct)
                        const sl_price = sig.side === 'LONG'
                            ? price * (1 - USER_CONFIG.stop_pct / 100)
                            : price * (1 + USER_CONFIG.stop_pct / 100);

                        if (size > (this.capital - this.reservedCapital)) continue;

                        this.openPositions[sym] = {
                            sym, 
                            side: sig.side,
                            entry: price, 
                            tp_price, 
                            sl_price,
                            tp_abs: tpDist,
                            size, 
                            lev: USER_CONFIG.lev,
                            strat: sig.name,
                            opened_at: now,
                        };
                        this.reservedCapital += size;
                        console.log('  OPEN ' + sig.side + ' ' + sym + ' @ ' + price.toFixed(4) + ' TP=' + tp_price.toFixed(4) + ' SL=' + sl_price.toFixed(4) + ' [' + sig.name + '] sz=' + size);

                    } catch (e) {
                         // silently skip on error
                    }

                    // Only check 1 API call per tick
                    break;
                }
            }
            }
        } catch (e) {
            console.error('Bot Loop Error:', e);
        }

        this.loopInterval = setTimeout(() => this.loop(), 500);
    }

    public closePosition(sym: string, reason: string, currentPrices?: Record<string, number>) {
        const pos = this.openPositions[sym];
        if (!pos) return;

        let price = pos.currentPrice || pos.entry;
        if (currentPrices && currentPrices[sym]) {
            price = currentPrices[sym];
            pos.currentPrice = price;
        }

        const notionalValue = pos.size * pos.lev;
        const commissionUsd = notionalValue * 0.0004;
        const pnlRaw = pos.side === 'LONG' 
            ? ((price - pos.entry) / pos.entry) 
            : ((pos.entry - price) / pos.entry);
        const grossUsd = notionalValue * pnlRaw;
        const netPnlUsd = grossUsd - commissionUsd;

        this.totalRealizedPnl += netPnlUsd;
        this.capital += netPnlUsd;

        this.closedPositions.push({
            sym, side: pos.side, entry: pos.entry,
            closed_price: price, pnl: netPnlUsd,
            strat: pos.strat, reason,
            opened: pos.opened_at, closed: Date.now(),
            lev: pos.lev, size: pos.size
        });

        this.reservedCapital -= pos.size;
        delete this.openPositions[sym];
        this.reversalCooldown[sym] = Date.now() + USER_CONFIG.cooldown_min * 60000;

        console.log('  CLOSED ' + reason + ' ' + sym + ' PNL=' + netPnlUsd.toFixed(2));
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
                tp_price: p.tp_price,
                sl_price: p.sl_price,
                tp: p.tp_price,
                sl: p.sl_price,
                lev: p.lev,
                size: p.size,
                pnl_pct: p.pnlPct || 0,
                pnl_usd: p.netPnlUsd || 0,
                opened: p.opened_at,
            })),
            closed: this.closedPositions.slice(-50).map(p => ({
                sym: p.sym, side: p.side, entry: p.entry,
                closed_price: p.closed_price, pnl: p.pnl,
                strat: p.strat, reason: p.reason,
                opened: p.opened, closed: p.closed,
            })),
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
            scanning_logs: this.scanningLogs,
        };
    }
}


