# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-26T20:46:36.228488+00:00  
**Agent Version:** v1.0 (Evolution Agent with Kline Autopsies)  
**Monitoring Cycle:** 1  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at 2026-05-26T20:46:36 UTC. The system fetched live dashboard data, performed kline autopsies on **5 new closed trade(s)**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟢 HEALTHY

**Key Metrics:**
- **Capital:** $2,008.56 (Session P&L: $+8.56, +0.43% return)
- **Performance:** 3W / 2L (60.0% win rate this session)
- **System:** Loop running normally, 142 pairs loaded, 0 crashes
- **Open Positions:** 0 currently open

---

## 📊 Dashboard Data (Live)

| Metric | Value | Status |
|--------|-------|--------|
| Bot Status | 🟢 ACTIVE | Healthy |
| Loop Running | ✅ Yes | Normal (10ms duration) |
| Pairs Loaded | 142 | Full coverage |
| Loop Crashes | 0 | Stable |
| Open Positions | 0 | Small exposure |
| Current Capital | $2,008.56 | ✅ Profitable |

**Anomalies Detected:** None

---

## 📈 Trade Analysis & Kline Autopsies

**Total New Trades Analyzed:** 5

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

## 💡 Strategy Performance (Session)

| Strategy | Trades | Wins | Losses | Win% | Total PnL |
|----------|--------|------|--------|------|----------|
| SQUEEZE_SHORT | 2 | 1 | 1 | 50.0% | $-9.04 |
| RSI_OVERSOLD | 3 | 2 | 1 | 66.7% | $+17.60 |

**Note:** This session shows 5 total trades. Historical data from dashboard shows broader performance across all sessions.

---

## 🔍 Consecutive Loss Tracking

| Strategy | Consecutive Losses | Status |
|----------|-------------------|--------|
| SQUEEZE_SHORT | 1 | Monitor |

---

## 💨 Slippage Analysis

| Symbol | Expected Stop | Actual Loss | Slippage | Severity |
|--------|---------------|-------------|----------|----------|
| SOXLUSDT | $-25.00 | $-36.50 | $-11.50 | 🔴 High |

---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

1. Reduce margin for SOXLUSDT (slippage $-11.50)

---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** $2,008.56
- **Session P&L:** $+8.56 (+0.43% return)
- **Session Duration:** 0.00 hours
- **Hourly Rate:** $+4,174.48/hour
- **Forecast (24h):** $102,196.04
- **Trend:** Strong positive momentum

**Note:** Forecast based on current session performance only. Actual results may vary.

---

## 📋 Action Items

- [OBSERVE] Reduce margin for SOXLUSDT (slippage $-11.50)
- [INFO] Next monitoring cycle in 15 minutes

---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Current: $2,008.56
```

### Win Rate by Strategy

SQUEEZE_SHORT: █████ 50.0% (1/2)
RSI_OVERSOLD: ██████ 66.7% (2/3)

### P&L Distribution
- Winners: $68.87 total, avg $22.96
- Losers: $-60.31 total, avg $-30.15
- Profit Factor: 1.14

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
