import { BinanceClient } from './binanceClient.js';
import { getSignal, calcRsi } from './strategy.js';

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
    lev:           40,
    stop_pct:      2.0,      // User updated config: SL %2, uzak SL.
    min_score:     0.75,     
    max_open:      13,
    cooldown_min:  5,
    run_minutes:   0,        // 0 -> run indefinitely
    tp_pct:        1.0,      // Avg tp ratio calculation base
    margin:        250,     // Amount used per position
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
    globalRiskHalted = false;
    
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
        if (this.isScanning) return;
        this.isScanning = true;
        this.sessionStart = Date.now();
        if (!this.startTimeStr) this.startTimeStr = Date.now();
        console.log('[Bot] Scanning Started - TOP100 scanner');
        console.log('[Bot] Config:', JSON.stringify(USER_CONFIG));
        
        // Subscribe to Websocket for all tracked pairs and intervals
        this.binance.subscribeKlines(TOP100_PAIRS, ['15m', '1h']);
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
            const currentPrices = await this.binance.getAllPrices();

            let currentTotalNetPnl = 0;

            // 1. Check open positions
            for (const sym of Object.keys(this.openPositions)) {
                const pos = this.openPositions[sym];
                const price = currentPrices[sym];
                if (!price) continue;

                pos.currentPrice = price;
                
                const notionalValue = pos.size * pos.lev;
                const commissionUsd = notionalValue * 0.0010; // 0.05% taker * 2
                const pnlRaw = pos.side === 'LONG' 
                    ? ((price - pos.entry) / pos.entry) 
                    : ((pos.entry - price) / pos.entry);
                const grossUsd = notionalValue * pnlRaw;
                const netPnlUsd = grossUsd - commissionUsd;

                pos.netPnlUsd = netPnlUsd;
                pos.pnlPct = (netPnlUsd / pos.size) * 100;
                
                currentTotalNetPnl += netPnlUsd;

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
            }

            // Global Risk Check
            if (!this.globalRiskHalted && currentTotalNetPnl <= -400) {
                this.globalRiskHalted = true;
                console.log(`[Bot] Global Risk Halt TRIGGERED! Unrealized PnL: ${currentTotalNetPnl.toFixed(2)} <= -400`);
            } else if (this.globalRiskHalted && currentTotalNetPnl > -390) {
                this.globalRiskHalted = false;
                console.log(`[Bot] Global Risk Halt LIFTED! Unrealized PnL: ${currentTotalNetPnl.toFixed(2)} > -390`);
            }

            // 2. Round-Robin Signal Lookup
            if (this.isScanning && !this.globalRiskHalted) {
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
                            const c15m = await this.binance.getKlines(sym, '15m', 50);
                            if (!c15m || c15m.length < 20) continue;

                            const closed15m = c15m.slice(0, -1);
                            const last10_15m = closed15m.slice(-10);

                            const getVolatility = (candles: any[]) => {
                                const maxH = Math.max(...candles.map(c => c.h));
                                const minL = Math.min(...candles.map(c => c.l));
                                if (minL === 0) return 0;
                                return ((maxH - minL) / minL) * 100;
                            };

                            // Her bir chartın son 10 mumunda min %0.5 hareketlilik olmali
                            if (getVolatility(last10_15m) < 0.5) continue;

                            const c5m = await this.binance.getKlines(sym, '5m', 15);
                            if (!c5m || c5m.length < 11) continue;
                            
                            const closed5m = c5m.slice(0, -1);
                            const last10_5m = closed5m.slice(-10);

                            if (getVolatility(last10_5m) < 0.5) continue;

                            const sig = getSignal(closed15m); // ONLY use closed candles
                            if (!sig || sig.score < USER_CONFIG.min_score) continue;

                            const sigCandle = closed15m[closed15m.length - 1];
                            const sigClosePrice = sigCandle.c;
                            // A 15m candle's "t" is open time, so close time is t + 15m
                            const sigCloseTime = sigCandle.t + 15 * 60 * 1000;
                            const candleAgeMs = now - sigCloseTime;

                            // 1. ZAMAN AŞIMI KONTROLÜ (Fresh Signal): Sinyal kapanalı 5 dkyı geçtiyse girme.
                            if (candleAgeMs > 5 * 60 * 1000) continue;

                            // 2. FİYAT KAYMASI (Slippage) / PULLBACK KONTROLÜ: 
                            // İşleme girerken mevcut fiyatın sinyal fiyatından (mum kapanışı) en fazla %0.1 daha kötü olmasına izin veriyoruz.
                            // Çok uçmuşsa (tren kaçtıysa) girmez, ya da fiyat istenilen yere çekilince (pullback) girer.
                            if (sig.side === 'LONG' && price > sigClosePrice * 1.001) continue;
                            if (sig.side === 'SHORT' && price < sigClosePrice * 0.999) continue;

                            // 3. 5M ALT ZAMAN DİLİMİ MOMENTUM TEYİDİ:
                            // Yönün odmah terse dönmemesi için alt periyotta RSI uyumsuz olmamalı.
                            const rsi5m = calcRsi(closed5m, 14);
                            if (sig.side === 'LONG' && rsi5m > 70) continue; // 5 dk'lıkta aşırı alınmışsa long girme
                            if (sig.side === 'SHORT' && rsi5m < 30) continue; // 5 dk'lıkta aşırı satılmışsa short girme

                            // 4. ANLIK AKTİF MUM YÖN & SERT HAREKET TEYİDİ:
                            // Anlık fiyatta işlemin tersine çok sert bir hareket varsa (düşen bıçak) bekle.
                            const active5m = c5m[c5m.length - 1];
                            if (sig.side === 'LONG' && active5m.c < active5m.o * 0.998) continue; // Çok sert düşüyorsa bekle
                            if (sig.side === 'SHORT' && active5m.c > active5m.o * 1.002) continue; // Çok sert çıkıyorsa bekle

                        const size = USER_CONFIG.margin;
                        const notional = size * USER_CONFIG.lev;

                        // Tahmini komisyon %0.1:
                        const estimatedCommissionUsd = notional * 0.0010;
                        
                        // Hedef NET $10 kar
                        const targetNetProfitUsd = 10;
                        const requiredGrossProfitUsd = targetNetProfitUsd + estimatedCommissionUsd;
                        const tpDist = price * (requiredGrossProfitUsd / notional);
                        const tp_price = sig.side === 'LONG' ? price + tpDist : price - tpDist;
                        
                        // %2 Price Drop Stop Loss (Kripto fiyatinda %2 degisim)
                        const slDist = price * (USER_CONFIG.stop_pct / 100);
                        const sl_price = sig.side === 'LONG' ? price - slDist : price + slDist;

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
        const commissionUsd = notionalValue * 0.0010; // 0.05% taker * 2
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
        
        // Sadece zarar edilen islemlerde cooldown (5 dakika) beklemesi yap
        if (netPnlUsd < 0) {
            this.reversalCooldown[sym] = Date.now() + USER_CONFIG.cooldown_min * 60000;
        }

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
                tp: ((Math.abs(p.tp_price - p.entry) / p.entry) * 100).toFixed(2),
                sl: ((Math.abs(p.sl_price - p.entry) / p.entry) * 100).toFixed(2),
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
            global_risk_halted: this.globalRiskHalted,
        };
    }
}


