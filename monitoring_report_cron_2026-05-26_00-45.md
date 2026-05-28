# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-26T00:45:19.921474+00:00  
**Agent Version:** v1.0 (Evolution Agent with Kline Autopsies)  
**Monitoring Cycle:** 3  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at 2026-05-26T00:45:19 UTC. The system fetched live dashboard data, performed kline autopsies on **4 new closed trade(s)**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟢 HEALTHY

**Key Metrics:**
- **Capital:** $1,811.71 (Session P&L: $-188.29, -9.41% return)
- **Performance:** 6W / 11L (35.3% win rate this session)
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
| Current Capital | $1,811.71 | ⚠️ Drawdown |

**Anomalies Detected:** High stop loss count: 4

---

## 📈 Trade Analysis & Kline Autopsies

**Total New Trades Analyzed:** 4

### Detailed Kline Autopsy #1: PHAROSUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | PHAROSUSDT |
| **Direction** | SHORT |
| **Strategy** | EMA_CROSS_DN |
| **Entry Price** | $0.60580 |
| **Exit Price** | $0.60850 |
| **P&L** | $-24.28 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 00:30 UTC |
| **Exit Time** | 00:31 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** red
- **Entry Volume Ratio:** 0.68x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.50%
- **Max Unfavorable Move:** +0.20%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on red candle Stop hit on doji candle. PnL: $-24.28

---

### Detailed Kline Autopsy #2: SNDKUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | SNDKUSDT |
| **Direction** | SHORT |
| **Strategy** | EMA_CROSS_DN |
| **Entry Price** | $1528.79000 |
| **Exit Price** | $1535.40000 |
| **P&L** | $-23.62 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 00:30 UTC |
| **Exit Time** | 00:35 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** long_wick_up
- **Entry Volume Ratio:** 0.87x (normal)
- **Pattern Detected:** rejection_wick
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.43%
- **Max Unfavorable Move:** +0.10%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on long_wick_up candle Pattern: rejection_wick Stop hit on red candle. PnL: $-23.62

---

### Detailed Kline Autopsy #3: GMTUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | GMTUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.01110 |
| **Exit Price** | $0.01105 |
| **P&L** | $-24.52 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 00:30 UTC |
| **Exit Time** | 00:36 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.48x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.00%
- **Max Unfavorable Move:** -0.72%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on doji candle. PnL: $-24.52

---

### Detailed Kline Autopsy #4: ATOMUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | ATOMUSDT |
| **Direction** | LONG |
| **Strategy** | VOL_BREAKUP |
| **Entry Price** | $2.15200 |
| **Exit Price** | $2.14100 |
| **P&L** | $-27.56 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 00:15 UTC |
| **Exit Time** | 00:38 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** green
- **Entry Volume Ratio:** 0.51x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.23%
- **Max Unfavorable Move:** -0.60%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on green candle Stop hit on red candle. PnL: $-27.56

---

## 💡 Strategy Performance (Session)

| Strategy | Trades | Wins | Losses | Win% | Total PnL |
|----------|--------|------|--------|------|----------|
| RSI_OVERSOLD | 9 | 3 | 6 | 33.3% | $-109.11 |
| MOMENTUM_LONG | 1 | 1 | 0 | 100.0% | $+16.25 |
| EMA_CROSS_DN | 5 | 1 | 4 | 20.0% | $-85.24 |
| MOMENTUM_SHORT | 1 | 1 | 0 | 100.0% | $+17.37 |
| VOL_BREAKUP | 1 | 0 | 1 | 0.0% | $-27.56 |

**Note:** This session shows 17 total trades. Historical data from dashboard shows broader performance across all sessions.

---

## 🔍 Consecutive Loss Tracking

| Strategy | Consecutive Losses | Status |
|----------|-------------------|--------|
| EMA_CROSS_DN | 4 | ⚠️ WARNING |
| RSI_OVERSOLD | 3 | ⚠️ WARNING |
| VOL_BREAKUP | 1 | Monitor |

---

## 💨 Slippage Analysis

| Symbol | Expected Stop | Actual Loss | Slippage | Severity |
|--------|---------------|-------------|----------|----------|
| OPGUSDT | $-25.00 | $-25.61 | $-0.61 | 🟢 Low |
| MEUSDT | $-25.00 | $-27.77 | $-2.77 | 🟡 Medium |
| SOXLUSDT | $-25.00 | $-30.47 | $-5.47 | 🔴 High |
| ATOMUSDT | $-25.00 | $-27.56 | $-2.56 | 🟡 Medium |

---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

1. Disable EMA_CROSS_DN (consecutive 4 losses)

---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** $1,811.71
- **Session P&L:** $-188.29 (-9.41% return)
- **Session Duration:** 0.72 hours
- **Hourly Rate:** $-262.15/hour
- **Forecast (24h):** $-4,479.99
- **Trend:** Negative momentum

**Note:** Forecast based on current session performance only. Actual results may vary.

---

## 📋 Action Items

- [HIGH] Address anomalies: High stop loss count: 4
- [INFO] Next monitoring cycle in 15 minutes

---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Start: $1,894.32
Current: $1,811.71 (↓ $82.61)
```

### Win Rate by Strategy

RSI_OVERSOLD: ███ 33.3% (3/9)
MOMENTUM_LONG: ██████████ 100.0% (1/1)
EMA_CROSS_DN: ██ 20.0% (1/5)
MOMENTUM_SHORT: ██████████ 100.0% (1/1)
VOL_BREAKUP:  0.0% (0/1)

### P&L Distribution
- Winners: $0.00 total, avg $0.00
- Losers: $-99.98 total, avg $-25.00
- Profit Factor: 0.00

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
