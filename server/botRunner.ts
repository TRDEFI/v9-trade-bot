import { BinanceClient } from './binanceClient.js';
import { getSignal, calcRsi, calcSupertrend } from './strategy.js';
import fs from 'fs';

export const USER_CONFIG = {
    budget:        2000,
    lev:           20,
    max_open:      4,
    margin:        250,     // Amount used per position
    target_profit: 1,       // Net target profit in USD
    cut_loss:      -200,    // Net max loss per position in USD
    cooldown_min:  5
};

export interface SystemLog {
    time: string;
    msg: string;
    level: 'info' | 'warn' | 'error';
}

export class BotRunner {
    isScanning = false;
    binance = new BinanceClient();
    private fileLogStream = fs.createWriteStream('bot_scan.log', { flags: 'a' });
    
    private logToFile(msg: string) {
        const time = new Date().toISOString();
        this.fileLogStream.write(`[${time}] ${msg}\n`);
    }

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
        console.log('[Bot] Fetching Top 300 Volume Pairs...');
        
        this.activePairs = await this.binance.getTop300VolumePairs();
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
                
                currentTotalNetPnl += netPnlUsd;

                if (netPnlUsd >= USER_CONFIG.target_profit) {
                    await this.closePosition(sym, 'TAKE_PROFIT');
                    continue;
                }
            }

            // Dynamic Margin Level & Drawdown Check
            // Toplam 'Free Balance'in (capital - reservedCapital) %80'ine ulasirsa net zarar, kasayi rahatlatmak icin islem kapatir.
            const freeBalance = this.capital - this.reservedCapital;
            const maxDrawdownUsd = freeBalance * 0.80;

            if (currentTotalNetPnl < 0 && Math.abs(currentTotalNetPnl) >= maxDrawdownUsd && Object.keys(this.openPositions).length > 0) {
                let targetSym: string | null = null;
                let smallestLoss = -Infinity;

                for (const sym of Object.keys(this.openPositions)) {
                    const pos = this.openPositions[sym];
                    // -100 is > -400, so we want the maximum value that is still negative
                    if (pos.netPnlUsd !== undefined && pos.netPnlUsd < 0 && pos.netPnlUsd > smallestLoss) {
                        smallestLoss = pos.netPnlUsd;
                        targetSym = sym;
                    }
                }

                // If somehow there are no negative positions, just close any to free margin
                if (!targetSym && Object.keys(this.openPositions).length > 0) {
                    targetSym = Object.keys(this.openPositions)[0];
                    smallestLoss = this.openPositions[targetSym].netPnlUsd || 0;
                }

                if (targetSym) {
                    const absLoss = Math.abs(currentTotalNetPnl);
                    const logMsg = `[${targetSym}] Kritik Kasa Zarar Limiti! Toplam PNL ($${absLoss.toFixed(2)}) >= Limit ($${maxDrawdownUsd.toFixed(2)}). Kasayi rahatlatmak icin en az zarar eden pozisyon kapatiliyor! (${smallestLoss.toFixed(2)}$)`;
                    this.addLog(logMsg, 'error');
                    console.log(logMsg);
                    await this.closePosition(targetSym, 'MARGIN_CALL_LIQUIDATION');
                    
                    currentTotalNetPnl -= smallestLoss;
                }
            }

            // 2. Round-Robin Signal Lookup
            if (this.isScanning && this.activePairs.length > 0) {
                const openCount = Object.keys(this.openPositions).length;
                
                if (openCount < USER_CONFIG.max_open) {
                    let checked = 0;
                    let processed = 0;
                    while (checked < this.activePairs.length) {
                        const sym = this.activePairs[this.pairIndex % this.activePairs.length];
                        this.pairIndex++;
                        checked++;

                        if (this.openPositions[sym]) continue;
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

                        // Startup protection: Wait 15 seconds so websocket cache loads, preventing stale signals
                        if (now - this.sessionStart < 15000) {
                            this.logToFile(`[${sym}] REJECT: Startup protection active`);
                            continue;
                        }

                        try {
                            const c15m = await this.binance.getKlines(sym, '15m', 50);
                            if (!c15m || c15m.length < 20) {
                                this.logToFile(`[${sym}] REJECT: c15m data not sufficient (${c15m ? c15m.length : 0})`);
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
                            if (!sig || sig.score < 0.70) {
                                this.logToFile(`[${sym}] REJECT: No signal or score < 0.70`);
                                continue;
                            }

                            const sigCandle = closed15m[closed15m.length - 1];
                            const sigClosePrice = sigCandle.c;
                            const sigCloseTime = sigCandle.t + 15 * 60 * 1000;
                            const candleAgeMs = now - sigCloseTime;

                            // Fresh Signal: Valid for 7 minutes (15m strategy)
                            if (candleAgeMs > 7 * 60 * 1000) {
                                this.logToFile(`[${sym}] REJECT: Signal too old (Age: ${(candleAgeMs / 60000).toFixed(1)} mins)`);
                                continue;
                            }

                            // Pullback Control (0.3% allowed slippage)
                            if (sig.side === 'LONG' && price > sigClosePrice * 1.003) {
                                this.logToFile(`[${sym}] REJECT: LONG Price too high (Price: ${price}, Limit: ${sigClosePrice * 1.003})`);
                                continue;
                            }
                            if (sig.side === 'SHORT' && price < sigClosePrice * 0.997) {
                                this.logToFile(`[${sym}] REJECT: SHORT Price too low (Price: ${price}, Limit: ${sigClosePrice * 0.997})`);
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

                            const configMarginUsd = USER_CONFIG.margin;
                            const freeBalance = this.capital - this.reservedCapital;
                            const maxDrawdownUsd = freeBalance * 0.80;

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

                            // Send actual API request
                            const apiSide = sig.side === 'LONG' ? 'BUY' : 'SELL';
                            const result = await this.binance.placeMarketOrder(sym, apiSide, configMarginUsd, USER_CONFIG.lev, price);
                            
                            // BUG #1 FIX: Check if API order was successful before saving position
                            if (!result.success) {
                                this.logToFile(`[${sym}] REJECT: API placeMarketOrder failed.`);
                                this.addLog(`[${sym}] OPEN BASARISIZ! API reddetti.`, 'error');
                                continue; 
                            }

                            const actualMarginUsd = (result.filledQty * result.avgPrice) / USER_CONFIG.lev;

                            this.openPositions[sym] = {
                                sym, 
                                side: sig.side,
                                entry: result.avgPrice, 
                                size: actualMarginUsd, // actual USD margin used based on filled quote quantity
                                filledQty: result.filledQty, // store base asset quantity
                                lev: USER_CONFIG.lev,
                                strat: sig.name,
                                opened_at: now,
                                openCommission: result.totalCommission
                            };
                            this.reservedCapital += actualMarginUsd;
                            
                            const logMsg = 'OPEN ' + sig.side + ' ' + sym + ' @ ' + result.avgPrice.toFixed(4) + ' [' + sig.name + '] sz=' + actualMarginUsd.toFixed(2);
                            this.addLog(`[${sym}] ${logMsg}`, 'info');
                            console.log('  ' + logMsg);

                            const newOpenCount = Object.keys(this.openPositions).length;
                            if (newOpenCount >= USER_CONFIG.max_open) {
                                break;
                            }

                        } catch (e: any) {
                             // silently skip on error
                        }

                        // Process up to 10 valid pair signal checks per tick to speed up 300-pair scan
                        processed++;
                        if (processed >= 10) break;
                    }
                }
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
        const closeResult = await this.binance.closeMarketOrder(sym, closeSide, price);
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


