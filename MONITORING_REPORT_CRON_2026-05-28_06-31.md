# Binance Futures Bot — Monitoring Self-Evolution Report

**Generated:** 2026-05-28 06:31 UTC  
**Agent:** evolution_agent.py + dashboard fetch  
**Session Start:** 2026-05-28 ~01:34 UTC (about 2 hours ago)  
**Dashboard Source:** http://18.181.221.88:3000/api/data

---

## 1. EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| **Capital** | $1,915.92 |
| **Session Peak Capital** | $2,026.74 |
| **Session Drawdown** | -$110.82 (-5.5%) |
| **Starting Capital (v9)** | $2,000.00 |
| **Total P&L (session)** | -$84.08 |
| **Total Trades** | 8 |
| **Wins / Losses** | 2 / 6 |
| **Win Rate** | 25.0% |
| **Avg Win** | +$2.52 |
| **Avg Loss** | -$13.85 |
| **Risk : Reward** | ~1 : 5.5 (adverse) |
| **Open Positions** | 1 (DASHUSDT LONG, -$11.07) |
| **Unrealized P&L** | -$11.07 |
| **Realized + Unrealized** | -$95.15 |
| **Bot Status** | ACTIVE |
| **Loop Status** | RUNNING (6ms avg tick) |
| **Loop Crashes** | 0 |
| **Pairs Loaded** | 141 |
| **24h Forecast** | ~$1,866 (negative trajectory) |

**Verdict:** CRITICAL — Bot is active but losing capital rapidly. Only one strategy (RSI_OVERSOLD) is executing, and it is severely underperforming in the current market regime.

---

## 2. RECENT CLOSED TRADES (All 8)

| # | Symbol | Side | Strategy | Entry | Exit | P&L | Reason | Opened (UTC) |
|---|--------|------|----------|-------|------|-----|--------|--------------|
| 1 | XAGUSDT | LONG | RSI_OVERSOLD | 72.09 | 72.07 | -$3.39 | MOMENTUM_STOP | 04:34 |
| 2 | SOLUSDT | LONG | RSI_OVERSOLD | 80.55 | 80.65 | +$4.21 | MOMENTUM_STOP | 04:34 |
| 3 | ONDOUSDT | LONG | RSI_OVERSOLD | 0.3571 | 0.3555 | -$24.40 | HARD_STOP_LOSS | 05:15 |
| 4 | DOTUSDT | LONG | RSI_OVERSOLD | 1.1810 | 1.1750 | -$27.40 | HARD_STOP_LOSS | 05:16 |
| 5 | DOGEUSDT | LONG | RSI_OVERSOLD | 0.09745 | 0.09734 | -$7.64 | MOMENTUM_STOP | 05:17 |
| 6 | ONDOUSDT | LONG | RSI_OVERSOLD | 0.3590 | 0.3574 | -$24.28 | HARD_STOP_LOSS | 06:00 |
| 7 | LINKUSDT | LONG | RSI_OVERSOLD | 8.83 | 8.835 | +$0.83 | MOMENTUM_STOP | 06:15 |
| 8 | ADAUSDT | LONG | RSI_OVERSOLD | 0.2291 | 0.2291 | -$2.00 | MOMENTUM_STOP | 06:15 |

**Pattern:** 100% LONG bias via RSI_OVERSOLD. No SHORT trades, no other strategies firing. Market regime clearly unfavorable for mean-reversion LONG entries.

---

## 3. OPEN POSITION (Live Risk)

| Symbol | Side | Entry | Current | P&L | Strategy | 15m Trend | 1h Trend | Opened |
|--------|------|-------|---------|-----|----------|-----------|----------|--------|
| DASHUSDT | LONG | 39.65 | 39.59 | -$11.07 (-4.4%) | RSI_OVERSOLD | DOWN | DOWN | 06:30 |

**Concern:** Opened against both 15m and 1h downtrends. Already -$11 with a -$25 hard stop. If this hits stop, session loss reaches -$95+ and capital drops below $1,900.

---

## 4. STRATEGY PERFORMANCE (Historical Session Context)

From monitor_state.json (cumulative across recent sessions):

| Strategy | Trades | Wins | Losses | Win% | Total P&L | Consec. Losses | Status |
|----------|--------|------|--------|------|-----------|----------------|--------|
| RSI_OVERSOLD | 16 | 3 | 13 | 19% | -$251.76 | 3 | CRITICAL |
| TREND_SHORT | 1 | 0 | 1 | 0% | -$27.11 | 2 | WATCH |
| SQUEEZE_SHORT | 0 | 0 | 0 | - | $0.00 | 3 | NO DATA |
| VOL_BREAKUP | 0 | 0 | 0 | - | $0.00 | 5 | NO DATA |
| EMA_CROSS_DN | 0 | 0 | 0 | - | $0.00 | 6 | NO DATA |
| MOMENTUM_SHORT | 0 | 0 | 0 | - | $0.00 | 1 | NO DATA |

**Key Insight:** RSI_OVERSOLD is the only strategy with live trade data in this session, and it is deeply broken right now. The other strategies showing consecutive losses in state are carryovers from earlier sessions with no recent trades — they are not currently executing.

---

## 5. SLIPPAGE AND EXECUTION ANALYSIS

| Symbol | Trigger ($) | Fill ($) | Slippage | Trade P&L |
|--------|-------------|----------|----------|-----------|
| DOTUSDT | -25.00 | -27.40 | -$2.40 | -$27.40 |
| UNIUSDT | -25.00 | -27.97 | -$2.97 | -$27.97 |

**Observation:** Both slippage events are HARD_STOP_LOSS trades where the actual fill exceeded the intended -$25 stop. Total slippage drag: -$5.37 across at least 2 trades. Slippage rate approximately 10-12% above target stop level.

---

## 6. MARKET REGIME ASSESSMENT

**Current Regime:** Downtrend / Risk-Off  
**Evidence:**
- All RSI_OVERSOLD entries occurred with 15m DOWN and 1h DOWN trends
- Bot is loading LONG positions into falling markets (classic value-trap / falling-knife setup)
- 15m ATR was acceptable (0.63%-1.20%), so volatility filter did NOT block entries
- RSI thresholds (<30 for LONG) were met, but without trend confirmation this becomes contrarian betting

**Conclusion:** RSI_OVERSOLD (pure mean-reversion) is incompatible with a sustained downtrend. The strategy needs either:
1. A trend filter (e.g., only LONG when MA20 > MA50 or price > EMA50)
2. A regime gate (disable mean-reversion during confirmed downtrends)
3. Parameter tightening (require stronger RSI < 25 or multi-timeframe oversold)

---

## 7. SELF-EVOLUTION ANALYSIS

### What the monitoring agent found:
- evolution_agent.py ran successfully at 06:31 UTC
- Identified 3 new kline autopsies (no errors)
- Current consecutive losses from this session's autopsies: SQUEEZE_SHORT: 3, VOL_BREAKUP: 5, EMA_CROSS_DN: 6, RSI_OVERSOLD: 1
- Primary suggestion generated: "Disable SQUEEZE_SHORT (consecutive 3 losses)"

### Critical gap in the evolution agent:
The agent's consecutive-loss tracker resets per-run and focuses on newly autopsied trades. This means:
- It sees SQUEEZE_SHORT at 3 because of state file carryover, not current-session evidence
- It does NOT flag RSI_OVERSOLD (only 1 consecutive loss in this run's autopsy count, despite 3 consecutive losses in the full session)
- The highest-impact issue — RSI_OVERSOLD bleeding capital — is underweighted

### Corrected Priority Ranking (by actual risk):

| Rank | Strategy | Issue | Session Evidence | Recommended Action |
|------|----------|-------|------------------|-------------------|
| 1 | RSI_OVERSOLD | 8 trades, 25% WR, -$84 P&L, all LONG in downtrend | 8/8 trades this session | IMMEDIATE DISABLE or add trend filter |
| 2 | DASHUSDT position | Open at 06:30, both trends DOWN, -$11 already | Live | Close or reduce |
| 3 | Slippage control | 2 stops filled $2.40-$2.97 beyond target | 2 events | Tighten stop trigger logic |
| 4 | SQUEEZE_SHORT | 3 consecutive losses (state carryover) | 0 trades this session | Review or backtest before re-enable |
| 5 | VOL_BREAKUP / EMA_CROSS_DN | 5-6 consecutive losses (state carryover) | 0 trades this session | Backtest before re-enable |

---

## 8. SELF-EVOLUTION RECOMMENDATIONS

### Immediate (Next 1-4 Hours)
1. **Close DASHUSDT LONG** — Already -$11 with both 15m and 1h trends DOWN. Probability of further decay is high. Better to cut to -$11 now than risk -$25 hard stop.
2. **Disable RSI_OVERSOLD** for the current session OR gate it behind a trend filter:
   - Only allow LONG if price > EMA50_15m OR MA10 > MA20_15m
   - Alternatively, require RSI_15m < 25 (stricter than current <30) in downtrends
3. **Review slippage on stop execution** — 10-12% excess slippage suggests market impact or liquidity issues. Consider:
   - Using STOP_MARKET with a slightly wider buffer (-$27 instead of -$25) to reduce partial fills
   - Or switching to STOP_LOSS_LIMIT if available on futures

### Short-term (Next 24 Hours)
4. **Pause trading for 30-60 minutes** to let the evolution agent backtest disabled strategies against the last 2h of kline data before re-enabling any.
5. **Reduce position size from $250 to $125** (50% cut) until win rate recovers above 40%. This halves drawdown speed.
6. **Add ADX filter** — only open positions when ADX_15m > 20 to avoid choppy/no-trend markets where mean-reversion fails.

### Medium-term (Next 1-2 Weeks)
7. **Run full 14-day backtest** on RSI_OVERSOLD with the proposed trend filter. Compare:
   - Baseline: 19% WR, -$251 P&L
   - With price > EMA50 gate: expected WR improvement to 40%+
8. **Implement auto-disable with 3-consecutive-loss rule** server-side (not just monitoring). The bot should stop opening new RSI_OVERSOLD trades after 3 losses in a row.
9. **Add strategy cooldown** — after any strategy hits hard stop, impose a 15-minute cooldown for that symbol to avoid re-entry into the same breakdown.

---

## 9. RISK METRICS SUMMARY

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Win Rate | 25.0% | > 40% | CRITICAL |
| Max Single Loss | -$27.40 | -$25 | CRITICAL (slippage) |
| Session Drawdown | -$110.82 (-5.5%) | -5% | CRITICAL |
| Unrealized PnL | -$11.07 | -$5 | WARNING |
| Strategy Concentration | 100% RSI_OVERSOLD | Diversified | CRITICAL |
| Loop Health | 0 crashes | 0 | OK |
| Pair Coverage | 141 | 150 | OK |
| Capital Reserve | $1,915 | > $1,800 | WARNING |

---

## 10. EXPECTED OUTCOMES IF ACTIONS TAKEN

| Action | Expected Result |
|--------|-----------------|
| Disable RSI_OVERSOLD | Stop the bleeding; prevent further -$25 to -$30 losses per trade |
| Close DASHUSDT | Realize -$11 loss now vs. risk -$25 later; preserve about $1,905 capital |
| Cut position size 50% | Halve speed of drawdown; extend runway |
| Add trend filter | Allow RSI_OVERSOLD to re-emerge only in bullish regimes |

---

*Report generated by Hermes Monitoring Agent — 2026-05-28 06:31 UTC*  
*Data freshness: Live dashboard fetch at 06:30:59 UTC*
