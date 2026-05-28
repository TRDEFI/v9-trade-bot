# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-26T00:02:24.977181+00:00  
**Agent Version:** v1.0 (Evolution Agent with Kline Autopsies)  
**Monitoring Cycle:** 1  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at 2026-05-26T00:02:24 UTC. The system fetched live dashboard data, performed kline autopsies on **12 new closed trade(s)**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟢 HEALTHY

**Key Metrics:**
- **Capital:** $1,894.32 (Session P&L: $-105.68, -5.28% return)
- **Performance:** 5W / 7L (41.7% win rate this session)
- **System:** Loop running normally, 141 pairs loaded, 0 crashes
- **Open Positions:** 0 currently open

---

## 📊 Dashboard Data (Live)

| Metric | Value | Status |
|--------|-------|--------|
| Bot Status | 🟢 ACTIVE | Healthy |
| Loop Running | ✅ Yes | Normal (10ms duration) |
| Pairs Loaded | 141 | Full coverage |
| Loop Crashes | 0 | Stable |
| Open Positions | 0 | Small exposure |
| Current Capital | $1,894.32 | ⚠️ Drawdown |

**Anomalies Detected:** High stop loss count: 7

---

## 📈 Trade Analysis & Kline Autopsies

**Total New Trades Analyzed:** 12

### Detailed Kline Autopsy #1: PLUMEUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | PLUMEUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.01445 |
| **Exit Price** | $0.01451 |
| **P&L** | +$18.76 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 21:30 UTC |
| **Exit Time** | 21:40 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.11x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.55%
- **Max Unfavorable Move:** -0.21%
- **Runner Potential:** 0.55%

#### Autopsy Summary

> Entry on doji candle. PnL: $18.76

---

### Detailed Kline Autopsy #2: OPGUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | OPGUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.21180 |
| **Exit Price** | $0.21080 |
| **P&L** | $-25.61 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 22:00 UTC |
| **Exit Time** | 22:03 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.50x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** -0.09%
- **Max Unfavorable Move:** -1.75%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on red candle. PnL: $-25.61

---

### Detailed Kline Autopsy #3: AIGENSYNUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | AIGENSYNUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.03064 |
| **Exit Price** | $0.03050 |
| **P&L** | $-24.85 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 22:03 UTC |
| **Exit Time** | 22:04 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 1.58x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** -0.16%
- **Max Unfavorable Move:** -0.78%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle with 1.6x volume Stop hit on doji candle. PnL: $-24.85

---

### Detailed Kline Autopsy #4: SOXLUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | SOXLUSDT |
| **Direction** | LONG |
| **Strategy** | MOMENTUM_LONG |
| **Entry Price** | $208.26000 |
| **Exit Price** | $209.02000 |
| **P&L** | +$16.25 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 22:15 UTC |
| **Exit Time** | 22:26 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** long_wick_down
- **Entry Volume Ratio:** 0.24x (low)
- **Pattern Detected:** rejection_wick
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.36%
- **Max Unfavorable Move:** -0.04%
- **Runner Potential:** 0.36%

#### Autopsy Summary

> Entry on long_wick_down candle Pattern: rejection_wick. PnL: $16.25

---

### Detailed Kline Autopsy #5: RAVEUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | RAVEUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.55480 |
| **Exit Price** | $0.55240 |
| **P&L** | $-23.63 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 22:00 UTC |
| **Exit Time** | 22:29 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 1.08x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.20%
- **Max Unfavorable Move:** -0.67%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on long_wick_down candle. PnL: $-23.63

---

### Detailed Kline Autopsy #6: ICPUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | ICPUSDT |
| **Direction** | SHORT |
| **Strategy** | EMA_CROSS_DN |
| **Entry Price** | $2.66300 |
| **Exit Price** | $2.65300 |
| **P&L** | +$16.78 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 22:45 UTC |
| **Exit Time** | 22:59 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** red
- **Entry Volume Ratio:** 0.98x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.30%
- **Max Unfavorable Move:** -0.45%
- **Runner Potential:** 0.30%

#### Autopsy Summary

> Entry on red candle. PnL: $16.78

---

### Detailed Kline Autopsy #7: DOGEUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | DOGEUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.10181 |
| **Exit Price** | $0.10207 |
| **P&L** | +$10.77 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 22:45 UTC |
| **Exit Time** | 23:18 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.43x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.33%
- **Max Unfavorable Move:** -0.23%
- **Runner Potential:** 0.33%

#### Autopsy Summary

> Entry on doji candle. PnL: $10.77

---

### Detailed Kline Autopsy #8: AVAXUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | AVAXUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $9.28900 |
| **Exit Price** | $9.31600 |
| **P&L** | +$12.53 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 22:45 UTC |
| **Exit Time** | 23:32 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** red
- **Entry Volume Ratio:** 0.34x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.32%
- **Max Unfavorable Move:** -0.26%
- **Runner Potential:** 0.32%

#### Autopsy Summary

> Entry on red candle. PnL: $12.53

---

### Detailed Kline Autopsy #9: BCHUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | BCHUSDT |
| **Direction** | SHORT |
| **Strategy** | EMA_CROSS_DN |
| **Entry Price** | $348.93000 |
| **Exit Price** | $350.44000 |
| **P&L** | $-23.64 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 22:45 UTC |
| **Exit Time** | 23:34 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** red
- **Entry Volume Ratio:** 0.15x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.45%
- **Max Unfavorable Move:** -0.22%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on red candle Stop hit on green candle. PnL: $-23.64

---

### Detailed Kline Autopsy #10: MEUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | MEUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.09700 |
| **Exit Price** | $0.09650 |
| **P&L** | $-27.77 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 23:32 UTC |
| **Exit Time** | 23:35 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 2.01x (high)
- **Pattern Detected:** rejection_wick
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** -0.10%
- **Max Unfavorable Move:** -0.62%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle with 2.0x volume Pattern: rejection_wick Stop hit on doji candle. PnL: $-27.77

---

### Detailed Kline Autopsy #11: SOXLUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | SOXLUSDT |
| **Direction** | SHORT |
| **Strategy** | EMA_CROSS_DN |
| **Entry Price** | $205.45000 |
| **Exit Price** | $206.62000 |
| **P&L** | $-30.47 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 23:34 UTC |
| **Exit Time** | 23:49 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** red
- **Entry Volume Ratio:** 0.06x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +1.25%
- **Max Unfavorable Move:** -0.32%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on red candle Stop hit on green candle. PnL: $-30.47

---

### Detailed Kline Autopsy #12: PROVEUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | PROVEUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.26320 |
| **Exit Price** | $0.26200 |
| **P&L** | $-24.80 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 23:30 UTC |
| **Exit Time** | 23:50 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.60x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.11%
- **Max Unfavorable Move:** -0.65%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on doji candle. PnL: $-24.80

---

## 💡 Strategy Performance (Session)

| Strategy | Trades | Wins | Losses | Win% | Total PnL |
|----------|--------|------|--------|------|----------|
| RSI_OVERSOLD | 8 | 3 | 5 | 37.5% | $-84.59 |
| MOMENTUM_LONG | 1 | 1 | 0 | 100.0% | $+16.25 |
| EMA_CROSS_DN | 3 | 1 | 2 | 33.3% | $-37.34 |

**Note:** This session shows 12 total trades. Historical data from dashboard shows broader performance across all sessions.

---

## 🔍 Consecutive Loss Tracking

| Strategy | Consecutive Losses | Status |
|----------|-------------------|--------|
| EMA_CROSS_DN | 2 | Monitor |
| RSI_OVERSOLD | 2 | Monitor |

---

## 💨 Slippage Analysis

| Symbol | Expected Stop | Actual Loss | Slippage | Severity |
|--------|---------------|-------------|----------|----------|
| OPGUSDT | $-25.00 | $-25.61 | $-0.61 | 🟢 Low |
| MEUSDT | $-25.00 | $-27.77 | $-2.77 | 🟡 Medium |
| SOXLUSDT | $-25.00 | $-30.47 | $-5.47 | 🔴 High |

---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

1. Reduce margin for SOXLUSDT (slippage $-5.47)

---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** $1,894.32
- **Session P&L:** $-105.68 (-5.28% return)
- **Session Duration:** 0.02 hours
- **Hourly Rate:** $-6,090.77/hour
- **Forecast (24h):** $-144,284.25
- **Trend:** Negative momentum

**Note:** Forecast based on current session performance only. Actual results may vary.

---

## 📋 Action Items

- [HIGH] Address anomalies: High stop loss count: 7
- [INFO] Next monitoring cycle in 15 minutes

---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Current: $1,894.32
```

### Win Rate by Strategy

RSI_OVERSOLD: ███ 37.5% (3/8)
MOMENTUM_LONG: ██████████ 100.0% (1/1)
EMA_CROSS_DN: ███ 33.3% (1/3)

### P&L Distribution
- Winners: $75.09 total, avg $15.02
- Losers: $-180.76 total, avg $-25.82
- Profit Factor: 0.42

---

## 🕐 System Health Log

- **Last Loop Duration:** 10ms (✅ Excellent)
- **Last Loop Time:** 13:03:40 UTC
- **Pairs Scanned:** 150/159 loaded
- **Session Elapsed:** 8sa 50dk 18s
- **Server Time:** 13:03:40 UTC

---

*Report generated by Hermes Evolution Agent v1.0*  
*Data source: http://18.181.221.88:3000/api/data*  
*Next scheduled run: every 15 minutes*
