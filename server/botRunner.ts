import { BinanceClient } from './binanceClient.js';
import { getSignal } from './strategy.js';

// ── FINAL CONFIG ──────────────────────────────────────────────
export const USER_CONFIG = {
    budget:        5000,
    lev:           5,         // 5x leverage
    stop_pct:      2.0,      // SL = 2% (→ -$25 per trade)
    min_score:     0.80,     // Higher threshold = fewer but quality trades
    max_open:      3,         // Keep 1/3 capital in reserve
    cooldown_min:  5,         // 5 min cooldown after close
    run_minutes:   0,         // Infinite mode (run forever)
    tp_pct:        1.0,      // TP = 1% (→ +$25 per trade) ← key change
    margin:        500,       // $500 per position (notional = $2500)
};

export const PAIRS = [
    'XAUUSDT',   // Gold         — highest volume
    'XAGUSDT',   // Silver       — high volume, volatile
    'INTCUSDT',  // Intel        — hot stock
    'BZUSDT',    // Brent Oil    — stable commodity
    'TSLAUSDT',  // Tesla        — strong trend
    'NVDAUSDT',  // NVIDIA       — tech leader
];
// ──────────────────────────────────────────────────────────────

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

    loopInterval: NodeJS.Timeout | null = null;
    startTimeStr: number = Date.now();
    lastKlineCheck: Record<string, number> = {};

    downloadableLog: string | null = null;
    dynamicConfig: any = {};
    sessionDurationSec = 0;

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.sessionStart = Date.now();
        if (!this.startTimeStr) this.startTimeStr = Date.now();
        console.log('[Bot] Starting with:', JSON.stringify(USER_CONFIG));
        console.log('[Bot] Pairs:', PAIRS.join(', '));
        this.loop();
    }

    stop() {
        if (this.isRunning) {
            this.sessionDurationSec += Math.floor((Date.now() - this.sessionStart) / 1000);
        }
        this.isRunning = false;
        if (this.loopInterval) {
            clearTimeout(this.loopInterval);
            this.loopInterval = null;
        }
        this.generateLog();
    }

    generateLog() {
        if (this.closedPositions.length === 0) return;
        const headers = ['Kapanis Zamani', 'Aclis Zamani', 'Sembol', 'Yon', 'Giris_Price', 'Cikis_Price', 'Lev', 'Margin', 'P&L_USD', 'Neden', 'Strateji'];
        const rows = this.closedPositions.map(p => [
            new Date(p.closed).toISOString(),
            new Date(p.opened).toISOString(),
            p.sym, p.side, p.entry.toFixed(4), p.closed_price.toFixed(4),
            p.lev, p.size.toFixed(2), p.pnl.toFixed(4), p.reason, p.strat
        ].join(','));
        this.downloadableLog = [headers.join(','), ...rows].join('\n');
    }

    async loop() {
        if (!this.isRunning) return;
        try {
            await this.tick();
        } catch (e) {
            console.error('[Bot] tick error', e);
        }
        if (this.isRunning) {
            this.loopInterval = setTimeout(() => this.loop(), 1000); // 1 sec scan
        }
    }

    async closePosition(sym: string, reason: string, currentPrices: any) {
        const pos = this.openPositions[sym];
        if (!pos) return;
        const now = Date.now();
        const p = currentPrices[sym];
        if (!p) return;

        const notionalValue = pos.size * pos.lev;
        // Taker fee 0.04% + exit fee (TP=0%, SL=0.04%)
        const exitFeeRate = reason === 'TP' ? 0 : 0.0004;
        const commissionUsd = notionalValue * (0.0004 + exitFeeRate);
        const rawPnl = pos.side === 'LONG'
            ? ((p - pos.entry) / pos.entry)
            : ((pos.entry - p) / pos.entry);
        const grossPnl = notionalValue * rawPnl;
        const netPnlUsd = grossPnl - commissionUsd;

        this.totalRealizedPnl += netPnlUsd;
        this.capital = USER_CONFIG.budget + this.totalRealizedPnl;
        this.reservedCapital -= pos.size;

        if (this.capital > this.allTimeHigh) {
            this.allTimeHigh = this.capital;
        }

        this.closedPositions.push({
            sym, side: pos.side, entry: pos.entry, closed_price: p,
            lev: pos.lev, size: pos.size, pnl: netPnlUsd, strat: pos.strat,
            reason, opened: pos.opened_at, closed: now
        });

        console.log(`  CLOSED ${reason} ${sym} PNL=${netPnlUsd.toFixed(2)}`);

        delete this.openPositions[sym];

        // Cooldown on SL, shorter on TP
        const coolMs = (reason === 'SL' ? 5 : 3) * 60 * 1000;
        this.reversalCooldown[sym] = now + coolMs;
    }

    async tick() {
        const now = Date.now();
        const currentPrices = await this.binance.getAllPrices();

        // ── 1. Check open positions ──────────────────────────────────
        let currentTotalNetPnl = 0;
        for (const sym of Object.keys(this.openPositions)) {
            const pos = this.openPositions[sym];
            const p = currentPrices[sym];
            if (!p) continue;

            const notionalValue = pos.size * pos.lev;
            const commissionUsd = notionalValue * 0.0004;
            const pnlRaw = pos.side === 'LONG'
                ? ((p - pos.entry) / pos.entry)
                : ((pos.entry - p) / pos.entry);
            const grossUsd = notionalValue * pnlRaw;
            const netPnlUsd = grossUsd - commissionUsd;

            pos.currentPrice = p;
            pos.netPnlUsd = netPnlUsd;
            pos.pnlPct = (netPnlUsd / pos.size) * 100;
            currentTotalNetPnl += netPnlUsd;

            // ── TP/SL Check ──
            let reason = null;
            if (pos.side === 'LONG') {
                if (p >= pos.tp_price) reason = 'TP';
                if (p <= pos.sl_price) reason = 'SL';
            } else {
                if (p <= pos.tp_price) reason = 'TP';
                if (p >= pos.sl_price) reason = 'SL';
            }

            if (reason) {
                await this.closePosition(sym, reason, currentPrices);
            }
        }

        // ── 2. Open new positions ────────────────────────────────────
        if (Object.keys(this.openPositions).length >= USER_CONFIG.max_open) return;
        if (this.capital <= USER_CONFIG.budget * 0.5) {
            console.log('[Bot] DRAWDOWN LIMIT — pausing');
            this.stop();
            return;
        }

        // ── 3. Scan pairs for signals ────────────────────────────────
        for (const sym of PAIRS) {
            if (Object.keys(this.openPositions).length >= USER_CONFIG.max_open) return;
            if (this.openPositions[sym]) continue;
            if (this.reversalCooldown[sym] && now < this.reversalCooldown[sym]) continue;

            const p = currentPrices[sym];
            if (!p) continue;

            // Rate limit kline checks: one pair per loop tick
            if (!this.lastKlineCheck[sym] || now - this.lastKlineCheck[sym] > 10000) {
                this.lastKlineCheck[sym] = now;
            } else {
                continue; // skip this tick
            }

            try {
                const c = await this.binance.getKlines(sym, '1h', 50);
                if (!c || c.length < 20) continue;

                const sig = getSignal(c);
                if (!sig || sig.score < USER_CONFIG.min_score) continue;

                const size = USER_CONFIG.margin;
                const avgp = sig.avg_move > 0 ? sig.avg_move : p * 0.005;

                // TP = entry ± avg_move * tp_pct
                const tpDist = avgp * USER_CONFIG.tp_pct;
                const tp_price = sig.side === 'LONG' ? p + tpDist : p - tpDist;
                const sl_price = sig.side === 'LONG'
                    ? p * (1 - USER_CONFIG.stop_pct / 100)
                    : p * (1 + USER_CONFIG.stop_pct / 100);

                if (size > (this.capital - this.reservedCapital)) continue;

                this.openPositions[sym] = {
                    sym, side: sig.side,
                    entry: p, tp_price, sl_price,
                    tp_abs: tpDist,
                    size, lev: USER_CONFIG.lev,
                    strat: sig.name,
                    opened_at: now,
                };
                this.reservedCapital += size;
                console.log(`  OPEN ${sig.side} ${sym} @ ${p.toFixed(4)} TP=${tp_price.toFixed(4)} SL=${sl_price.toFixed(4)} [${sig.name}] sz=${size}`);

            } catch (e) {
                // silent fail per pair
            }
        }
    }

    // ── Dashboard data ──────────────────────────────────────────
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
                tp: p.tp_abs,
                sl: USER_CONFIG.stop_pct,
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
                ? `${Math.floor((Date.now() - this.sessionStart) / 60000)}m ${Math.floor((Date.now() - this.sessionStart) % 60000 / 1000)}s`
                : `${Math.floor(this.sessionDurationSec / 60)}m ${this.sessionDurationSec % 60}s`,
            used_capital: this.reservedCapital,
            unrealized_pnl: Object.values(this.openPositions).reduce((s, p) => s + (p.netPnlUsd || 0), 0),
            has_downloadable_log: this.downloadableLog !== null,
        };
    }
}

export { getSignal };