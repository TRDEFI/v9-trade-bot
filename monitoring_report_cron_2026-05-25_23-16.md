# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-25T23:16:00.138330+00:00  
**Agent Version:** v1.0 (Evolution Agent with Kline Autopsies)  
**Monitoring Cycle:** 1  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at 2026-05-25T23:16:00 UTC. The system fetched live dashboard data, performed kline autopsies on **6 new closed trade(s)**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟢 HEALTHY

**Key Metrics:**
- **Capital:** $1,977.70 (Session P&L: $-22.30, -1.11% return)
- **Performance:** 3W / 3L (50.0% win rate this session)
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
| Current Capital | $1,977.70 | ⚠️ Drawdown |

**Anomalies Detected:** None

---

## 📈 Trade Analysis & Kline Autopsies

**Total New Trades Analyzed:** 6

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

## 💡 Strategy Performance (Session)

| Strategy | Trades | Wins | Losses | Win% | Total PnL |
|----------|--------|------|--------|------|----------|
| RSI_OVERSOLD | 4 | 1 | 3 | 25.0% | $-55.32 |
| MOMENTUM_LONG | 1 | 1 | 0 | 100.0% | $+16.25 |
| EMA_CROSS_DN | 1 | 1 | 0 | 100.0% | $+16.78 |

**Note:** This session shows 6 total trades. Historical data from dashboard shows broader performance across all sessions.

---

## 🔍 Consecutive Loss Tracking

| Strategy | Consecutive Losses | Status |
|----------|-------------------|--------|
| RSI_OVERSOLD | 3 | ⚠️ WARNING |

---

## 💨 Slippage Analysis

| Symbol | Expected Stop | Actual Loss | Slippage | Severity |
|--------|---------------|-------------|----------|----------|
| OPGUSDT | $-25.00 | $-25.61 | $-0.61 | 🟢 Low |

---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

1. Disable RSI_OVERSOLD (consecutive 3 losses)

---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** $1,977.70
- **Session P&L:** $-22.30 (-1.11% return)
- **Session Duration:** 0.00 hours
- **Hourly Rate:** $-4,723.19/hour
- **Forecast (24h):** $-111,378.77
- **Trend:** Negative momentum

**Note:** Forecast based on current session performance only. Actual results may vary.

---

## 📋 Action Items

- [OBSERVE] Disable RSI_OVERSOLD (consecutive 3 losses)
- [INFO] Next monitoring cycle in 15 minutes

---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Current: $1,977.70
```

### Win Rate by Strategy

RSI_OVERSOLD: ██ 25.0% (1/4)
MOMENTUM_LONG: ██████████ 100.0% (1/1)
EMA_CROSS_DN: ██████████ 100.0% (1/1)

### P&L Distribution
- Winners: $51.78 total, avg $17.26
- Losers: $-74.08 total, avg $-24.69
- Profit Factor: 0.70

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
