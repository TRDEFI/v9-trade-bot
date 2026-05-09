import { BinanceClient } from './binanceClient.js';
import { getSignal } from './strategy.js';

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
    lev:           5,
    stop_pct:      2.0,      // User updated config: SL %2, uzak SL.
    min_score:     0.75,     
    max_open:      5,
    cooldown_min:  5,
    run_minutes:   0,        // 0 -> run indefinitely
    tp_pct:        1.0,      // Avg tp ratio calculation base
    margin:        1000,     // Amount used per position
};

export class BotRunner {
    isRunning = false;
    binance = new BinanceClient();
    
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

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.sessionStart = Date.now();
        if (!this.startTimeStr) this.startTimeStr = Date.now();
        console.log('[Bot] Starting - TOP100 scanner');
        console.log('[Bot] Config:', JSON.stringify(USER_CONFIG));
        
        // Subscribe to Websocket for all tracked pairs and intervals
        this.binance.subscribeKlines(TOP100_PAIRS, ['15m', '1h']);
        
        this.loop();
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
        }
        if (this.loopInterval) {
            clearTimeout(this.loopInterval);
            this.loopInterval = null;
        }
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
        if (!this.isRunning) return;

        try {
            const now = Date.now();
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
                    this.binance.getKlines(sym, '15m', 20).then(async c => { // 15m for short-term momentum
                        if (!c || c.length < 20) return;
                        const sig = getSignal(c);
                        
                        // Calculate current PNL percentage
                        const pnlPct = pos.side === 'LONG' 
                             ? (price - pos.entry) / pos.entry 
                             : (pos.entry - price) / pos.entry;

                        const isLosing = pnlPct < 0;
                        const lossPct = isLosing ? Math.abs(pnlPct * 100) : 0;

                        if (sig && sig.score >= USER_CONFIG.min_score && sig.side !== pos.side) {
                            
                            // 1h Cross-Check 
                            try {
                                const c1h = await this.binance.getKlines(sym, '1h', 50);
                                if (c1h && c1h.length >= 20) {
                                    const sig1h = getSignal(c1h);
                                    // If 1h still strongly supports our ORIGINAL position, ignore the 15m reversal
                                    if (sig1h && sig1h.side === pos.side && sig1h.score >= USER_CONFIG.min_score) {
                                        console.log(`[Bot] Ignored 15m reversal for ${sym} because 1h signal (${sig1h.side}) is still strong.`);
                                        return;
                                    }
                                }
                            } catch (e: any) {
                                console.error(`[Bot] 1h cross-check failed for ${sym}:`, e.message);
                            }

                            // Reversal sharpness evaluation
                            let isSharpReversal = false;
                            
                            // 1. Strong signal score indicates sharper reversal
                            if (sig.score >= 0.86) isSharpReversal = true;
                            
                            // 2. High momentum on the latest candle (e.g., > 0.4% move in 15min)
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
                        const c = await this.binance.getKlines(sym, '1h', 50);
                        if (!c || c.length < 20) continue;

                        const sig = getSignal(c);
                        if (!sig || sig.score < USER_CONFIG.min_score) continue;

                        const size = USER_CONFIG.margin;
                        const notional = size * USER_CONFIG.lev;

                        // Dynamic TP distance based on avg_move
                        const avg = sig.avg_move > 0 ? sig.avg_move : price * 0.005;

                        let tpDist = avg * USER_CONFIG.tp_pct;
                        
                        // Limit Kar Hedefi : Sabit $5
                        const minTpDist = price * (5 / notional);
                        const maxTpDist = price * (5 / notional);

                        if (tpDist < minTpDist) tpDist = minTpDist;
                        else if (tpDist > maxTpDist) tpDist = maxTpDist;

                        const tp_price = sig.side === 'LONG' ? price + tpDist : price - tpDist;
                        
                        // %2 strict Stop Loss (USER_CONFIG.stop_pct)
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
            opened: pos.opened_at, closed: Date.now()
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
            is_active: this.isRunning,
            capital: this.capital,
            total_trades: this.closedPositions.length,
            total_pnl: this.totalRealizedPnl,
            opens: Object.values(this.openPositions).map(p => ({
                sym: p.sym,
                side: p.side,
                entry: p.entry,
                current_price: p.currentPrice || p.entry,
                tp_price: p.tp_price,
                sl_price: p.sl_price,
                tp: (p.tp_abs / p.entry) * 100 * p.lev,
                sl: USER_CONFIG.stop_pct * p.lev,
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
            elapsed: this.isRunning
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
        };
    }
}


