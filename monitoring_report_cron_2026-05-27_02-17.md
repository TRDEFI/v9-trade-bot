# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-27T02:16:51.308384+00:00  
**Agent Version:** v1.0 (Evolution Agent with Kline Autopsies)  
**Monitoring Cycle:** 1  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at 2026-05-27T02:16:51 UTC. The system fetched live dashboard data, performed kline autopsies on **14 new closed trade(s)**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟢 HEALTHY

**Key Metrics:**
- **Capital:** $1,826.51 (Session P&L: $-173.49, -8.67% return)
- **Performance:** 5W / 9L (35.7% win rate this session)
- **System:** Loop running normally, 142 pairs loaded, 0 crashes
- **Open Positions:** 1 currently open

---

## 📊 Dashboard Data (Live)

| Metric | Value | Status |
|--------|-------|--------|
| Bot Status | 🟢 ACTIVE | Healthy |
| Loop Running | ✅ Yes | Normal (6ms duration) |
| Pairs Loaded | 142 | Full coverage |
| Loop Crashes | 0 | Stable |
| Open Positions | 1 | Small exposure |
| Current Capital | $1,826.51 | ⚠️ Drawdown |

**Anomalies Detected:** Large loss: BLUAIUSDT $-45.70, High stop loss count: 8

---

## 📈 Trade Analysis & Kline Autopsies

**Total New Trades Analyzed:** 14

### Detailed Kline Autopsy #1: SOXLUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | SOXLUSDT |
| **Direction** | SHORT |
| **Strategy** | SQUEEZE_SHORT |
| **Entry Price** | $224.03000 |
| **Exit Price** | $222.71000 |
| **P&L** | +$27.46 |
| **Exit Reason** | TAKE_PROFIT |
| **Entry Time** | 18:32 UTC |
| **Exit Time** | 18:44 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** green
- **Entry Volume Ratio:** 0.27x (low)
- **Pattern Detected:** engulfing_bullish
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.20%
- **Max Unfavorable Move:** -0.60%
- **Runner Potential:** 0.20%

#### Autopsy Summary

> Entry on green candle Pattern: engulfing_bullish. PnL: $27.46

---

### Detailed Kline Autopsy #2: CRCLUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | CRCLUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $105.49000 |
| **Exit Price** | $105.03000 |
| **P&L** | $-23.80 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 18:32 UTC |
| **Exit Time** | 18:49 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** green
- **Entry Volume Ratio:** 0.69x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.25%
- **Max Unfavorable Move:** -0.46%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on green candle Stop hit on red candle. PnL: $-23.80

---

### Detailed Kline Autopsy #3: SKYAIUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | SKYAIUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.23497 |
| **Exit Price** | $0.23602 |
| **P&L** | +$20.34 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 18:32 UTC |
| **Exit Time** | 19:24 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 1.66x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.66%
- **Max Unfavorable Move:** -0.58%
- **Runner Potential:** 0.66%

#### Autopsy Summary

> Entry on doji candle with 1.7x volume. PnL: $20.34

---

### Detailed Kline Autopsy #4: ALGOUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | ALGOUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.10840 |
| **Exit Price** | $0.10890 |
| **P&L** | +$21.06 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 19:15 UTC |
| **Exit Time** | 19:43 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.97x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.55%
- **Max Unfavorable Move:** -0.18%
- **Runner Potential:** 0.55%

#### Autopsy Summary

> Entry on doji candle. PnL: $21.06

---

### Detailed Kline Autopsy #5: SOXLUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | SOXLUSDT |
| **Direction** | SHORT |
| **Strategy** | SQUEEZE_SHORT |
| **Entry Price** | $226.07000 |
| **Exit Price** | $227.63000 |
| **P&L** | $-36.50 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 19:45 UTC |
| **Exit Time** | 19:48 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** green
- **Entry Volume Ratio:** 0.63x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +1.90%
- **Max Unfavorable Move:** +0.01%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on green candle Stop hit on long_wick_up candle. PnL: $-36.50

---

### Detailed Kline Autopsy #6: EDENUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | EDENUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.06610 |
| **Exit Price** | $0.06581 |
| **P&L** | $-23.94 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 20:45 UTC |
| **Exit Time** | 20:46 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 1.33x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** -0.23%
- **Max Unfavorable Move:** -0.56%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on doji candle. PnL: $-23.94

---

### Detailed Kline Autopsy #7: MRVLUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | MRVLUSDT |
| **Direction** | SHORT |
| **Strategy** | SQUEEZE_SHORT |
| **Entry Price** | $211.59000 |
| **Exit Price** | $212.50000 |
| **P&L** | $-23.50 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 21:00 UTC |
| **Exit Time** | 21:52 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** red
- **Entry Volume Ratio:** 0.12x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.60%
- **Max Unfavorable Move:** -0.18%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on red candle Stop hit on long_wick_up candle. PnL: $-23.50

---

### Detailed Kline Autopsy #8: AMDUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | AMDUSDT |
| **Direction** | SHORT |
| **Strategy** | SQUEEZE_SHORT |
| **Entry Price** | $504.64000 |
| **Exit Price** | $504.86000 |
| **P&L** | $-4.18 |
| **Exit Reason** | TIME_STOP_HARD |
| **Entry Time** | 21:00 UTC |
| **Exit Time** | 22:00 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** long_wick_up
- **Entry Volume Ratio:** 0.54x (normal)
- **Pattern Detected:** rejection_wick
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.16%
- **Max Unfavorable Move:** -0.11%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on long_wick_up candle Pattern: rejection_wick. PnL: $-4.18

---

### Detailed Kline Autopsy #9: ZEREBROUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | ZEREBROUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.02160 |
| **Exit Price** | $0.02148 |
| **P&L** | $-30.93 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 22:45 UTC |
| **Exit Time** | 22:51 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.42x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.13%
- **Max Unfavorable Move:** -1.08%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on doji candle. PnL: $-30.93

---

### Detailed Kline Autopsy #10: SKYAIUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | SKYAIUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.22112 |
| **Exit Price** | $0.22126 |
| **P&L** | +$1.17 |
| **Exit Reason** | TIME_STOP_HARD |
| **Entry Time** | 22:30 UTC |
| **Exit Time** | 23:30 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.43x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.40%
- **Max Unfavorable Move:** -0.37%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle. PnL: $1.17

---

### Detailed Kline Autopsy #11: ARKMUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | ARKMUSDT |
| **Direction** | SHORT |
| **Strategy** | MOMENTUM_SHORT |
| **Entry Price** | $0.15340 |
| **Exit Price** | $0.15430 |
| **P&L** | $-31.34 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 00:15 UTC |
| **Exit Time** | 00:30 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** long_wick_down
- **Entry Volume Ratio:** 1.73x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.72%
- **Max Unfavorable Move:** -1.37%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on long_wick_down candle with 1.7x volume Stop hit on doji candle. PnL: $-31.34

---

### Detailed Kline Autopsy #12: ASTERUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | ASTERUSDT |
| **Direction** | LONG |
| **Strategy** | VOL_BREAKUP |
| **Entry Price** | $0.68380 |
| **Exit Price** | $0.68410 |
| **P&L** | +$0.19 |
| **Exit Reason** | TIME_STOP_HARD |
| **Entry Time** | 23:30 UTC |
| **Exit Time** | 00:38 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.25x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.12%
- **Max Unfavorable Move:** -0.22%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle. PnL: $0.19

---

### Detailed Kline Autopsy #13: MSTRUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | MSTRUSDT |
| **Direction** | LONG |
| **Strategy** | VOL_BREAKUP |
| **Entry Price** | $160.42000 |
| **Exit Price** | $159.72000 |
| **P&L** | $-23.82 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 01:00 UTC |
| **Exit Time** | 01:21 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** red
- **Entry Volume Ratio:** 0.04x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** -0.04%
- **Max Unfavorable Move:** -0.54%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on red candle Stop hit on none candle. PnL: $-23.82

---

### Detailed Kline Autopsy #14: BLUAIUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | BLUAIUSDT |
| **Direction** | SHORT |
| **Strategy** | EMA_CROSS_DN |
| **Entry Price** | $0.01190 |
| **Exit Price** | $0.01200 |
| **P&L** | $-45.70 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 02:00 UTC |
| **Exit Time** | 02:00 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.43x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.00%
- **Max Unfavorable Move:** +0.00%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on doji candle. PnL: $-45.70

---

## 💡 Strategy Performance (Session)

| Strategy | Trades | Wins | Losses | Win% | Total PnL |
|----------|--------|------|--------|------|----------|
| SQUEEZE_SHORT | 4 | 1 | 3 | 25.0% | $-36.73 |
| RSI_OVERSOLD | 6 | 3 | 3 | 50.0% | $-36.10 |
| MOMENTUM_SHORT | 1 | 0 | 1 | 0.0% | $-31.34 |
| VOL_BREAKUP | 2 | 1 | 1 | 50.0% | $-23.62 |
| EMA_CROSS_DN | 1 | 0 | 1 | 0.0% | $-45.70 |

**Note:** This session shows 14 total trades. Historical data from dashboard shows broader performance across all sessions.

---

## 🔍 Consecutive Loss Tracking

| Strategy | Consecutive Losses | Status |
|----------|-------------------|--------|
| SQUEEZE_SHORT | 3 | ⚠️ WARNING |
| MOMENTUM_SHORT | 1 | Monitor |
| VOL_BREAKUP | 1 | Monitor |
| EMA_CROSS_DN | 1 | Monitor |

---

## 💨 Slippage Analysis

| Symbol | Expected Stop | Actual Loss | Slippage | Severity |
|--------|---------------|-------------|----------|----------|
| SOXLUSDT | $-25.00 | $-36.50 | $-11.50 | 🔴 High |
| ZEREBROUSDT | $-25.00 | $-30.93 | $-5.93 | 🔴 High |
| ARKMUSDT | $-25.00 | $-31.34 | $-6.34 | 🔴 High |
| BLUAIUSDT | $-25.00 | $-45.70 | $-20.70 | 🔴 High |

---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

1. Disable SQUEEZE_SHORT (consecutive 3 losses)

---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** $1,826.51
- **Session P&L:** $-173.49 (-8.67% return)
- **Session Duration:** 0.01 hours
- **Hourly Rate:** $-13,845.97/hour
- **Forecast (24h):** $-330,476.76
- **Trend:** Negative momentum

**Note:** Forecast based on current session performance only. Actual results may vary.

---

## 📋 Action Items

- [HIGH] Address anomalies: Large loss: BLUAIUSDT $-45.70, High stop loss count: 8
- [INFO] Next monitoring cycle in 15 minutes

---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Current: $1,826.51
```

### Win Rate by Strategy

SQUEEZE_SHORT: ██ 25.0% (1/4)
RSI_OVERSOLD: █████ 50.0% (3/6)
MOMENTUM_SHORT:  0.0% (0/1)
VOL_BREAKUP: █████ 50.0% (1/2)
EMA_CROSS_DN:  0.0% (0/1)

### P&L Distribution
- Winners: $70.23 total, avg $14.05
- Losers: $-243.71 total, avg $-27.08
- Profit Factor: 0.29

---

## 🕐 System Health Log

- **Last Loop Duration:** 6ms (✅ Excellent)
- **Last Loop Time:** 23:01:52 UTC
- **Pairs Scanned:** 142/151 loaded
- **Session Elapsed:** 4sa 29dk 15s
- **Server Time:** 23:01:53 UTC

---

*Report generated by Hermes Evolution Agent v1.0*  
*Data source: http://18.181.221.88:3000/api/data*  
*Next scheduled run: every 15 minutes*
