# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-26T04:03:07.190653+00:00  
**Agent Version:** v1.0 (Evolution Agent with Kline Autopsies)  
**Monitoring Cycle:** 1  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at 2026-05-26T04:03:07 UTC. The system fetched live dashboard data, performed kline autopsies on **32 new closed trade(s)**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟢 HEALTHY

**Key Metrics:**
- **Capital:** $1,700.38 (Session P&L: $-299.62, -14.98% return)
- **Performance:** 12W / 20L (37.5% win rate this session)
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
| Current Capital | $1,700.38 | ⚠️ Drawdown |

**Anomalies Detected:** High stop loss count: 19

---

## 📈 Trade Analysis & Kline Autopsies

**Total New Trades Analyzed:** 32

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

### Detailed Kline Autopsy #13: EWYUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | EWYUSDT |
| **Direction** | SHORT |
| **Strategy** | MOMENTUM_SHORT |
| **Entry Price** | $191.03000 |
| **Exit Price** | $190.29000 |
| **P&L** | +$17.37 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 23:30 UTC |
| **Exit Time** | 00:10 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** red
- **Entry Volume Ratio:** 2.08x (high)
- **Pattern Detected:** spike
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.41%
- **Max Unfavorable Move:** -0.76%
- **Runner Potential:** 0.41%

#### Autopsy Summary

> Entry on red candle with 2.1x volume Pattern: spike. PnL: $17.37

---

### Detailed Kline Autopsy #14: PHAROSUSDT SHORT

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

### Detailed Kline Autopsy #15: SNDKUSDT SHORT

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

### Detailed Kline Autopsy #16: GMTUSDT LONG

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

### Detailed Kline Autopsy #17: ATOMUSDT LONG

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

### Detailed Kline Autopsy #18: WIFUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | WIFUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.19100 |
| **Exit Price** | $0.19010 |
| **P&L** | $-25.56 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 00:45 UTC |
| **Exit Time** | 00:52 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.12x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.16%
- **Max Unfavorable Move:** -0.68%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on doji candle. PnL: $-25.56

---

### Detailed Kline Autopsy #19: XRPUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | XRPUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $1.34180 |
| **Exit Price** | $1.33560 |
| **P&L** | $-25.10 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 00:45 UTC |
| **Exit Time** | 00:53 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.56x (normal)
- **Pattern Detected:** rejection_wick
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.07%
- **Max Unfavorable Move:** -0.58%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Pattern: rejection_wick Stop hit on green candle. PnL: $-25.10

---

### Detailed Kline Autopsy #20: ATOMUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | ATOMUSDT |
| **Direction** | SHORT |
| **Strategy** | EMA_CROSS_DN |
| **Entry Price** | $2.13100 |
| **Exit Price** | $2.11800 |
| **P&L** | +$28.50 |
| **Exit Reason** | TAKE_PROFIT |
| **Entry Time** | 01:00 UTC |
| **Exit Time** | 01:03 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** red
- **Entry Volume Ratio:** 0.70x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** -0.09%
- **Max Unfavorable Move:** -0.66%
- **Runner Potential:** -0.09%

#### Autopsy Summary

> Entry on red candle. PnL: $28.50

---

### Detailed Kline Autopsy #21: BCHUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | BCHUSDT |
| **Direction** | SHORT |
| **Strategy** | EMA_CROSS_DN |
| **Entry Price** | $347.78000 |
| **Exit Price** | $346.88000 |
| **P&L** | +$10.94 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 00:45 UTC |
| **Exit Time** | 01:08 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** high_wave
- **Entry Volume Ratio:** 0.20x (low)
- **Pattern Detected:** rejection_wick
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.28%
- **Max Unfavorable Move:** -0.37%
- **Runner Potential:** 0.28%

#### Autopsy Summary

> Entry on high_wave candle Pattern: rejection_wick. PnL: $10.94

---

### Detailed Kline Autopsy #22: DOGEUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | DOGEUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.10094 |
| **Exit Price** | $0.10047 |
| **P&L** | $-25.28 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 01:30 UTC |
| **Exit Time** | 01:34 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.12x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** -0.03%
- **Max Unfavorable Move:** -0.48%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on doji candle. PnL: $-25.28

---

### Detailed Kline Autopsy #23: SOLUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | SOLUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $84.25000 |
| **Exit Price** | $83.88000 |
| **P&L** | $-23.96 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 01:30 UTC |
| **Exit Time** | 01:34 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** red
- **Entry Volume Ratio:** 0.48x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.00%
- **Max Unfavorable Move:** -0.46%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on red candle Stop hit on green candle. PnL: $-23.96

---

### Detailed Kline Autopsy #24: DASHUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | DASHUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $43.69000 |
| **Exit Price** | $43.86000 |
| **P&L** | +$17.46 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 01:34 UTC |
| **Exit Time** | 01:52 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** green
- **Entry Volume Ratio:** 0.26x (low)
- **Pattern Detected:** engulfing_bullish
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.57%
- **Max Unfavorable Move:** -0.18%
- **Runner Potential:** 0.57%

#### Autopsy Summary

> Entry on green candle Pattern: engulfing_bullish. PnL: $17.46

---

### Detailed Kline Autopsy #25: LINKUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | LINKUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $9.37500 |
| **Exit Price** | $9.40400 |
| **P&L** | +$13.47 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 01:34 UTC |
| **Exit Time** | 01:53 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** green
- **Entry Volume Ratio:** 0.32x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.37%
- **Max Unfavorable Move:** -0.05%
- **Runner Potential:** 0.37%

#### Autopsy Summary

> Entry on green candle. PnL: $13.47

---

### Detailed Kline Autopsy #26: BZUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | BZUSDT |
| **Direction** | SHORT |
| **Strategy** | SQUEEZE_SHORT |
| **Entry Price** | $95.50000 |
| **Exit Price** | $95.23000 |
| **P&L** | +$12.14 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 01:45 UTC |
| **Exit Time** | 01:56 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** high_wave
- **Entry Volume Ratio:** 0.47x (low)
- **Pattern Detected:** rejection_wick
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.08%
- **Max Unfavorable Move:** -0.29%
- **Runner Potential:** 0.08%

#### Autopsy Summary

> Entry on high_wave candle Pattern: rejection_wick. PnL: $12.14

---

### Detailed Kline Autopsy #27: SUPERUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | SUPERUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.12000 |
| **Exit Price** | $0.11940 |
| **P&L** | $-27.00 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 02:00 UTC |
| **Exit Time** | 02:01 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 0.56x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** -0.42%
- **Max Unfavorable Move:** -0.58%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on doji candle. PnL: $-27.00

---

### Detailed Kline Autopsy #28: TRUMPUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | TRUMPUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $2.05000 |
| **Exit Price** | $2.04100 |
| **P&L** | $-23.95 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 02:00 UTC |
| **Exit Time** | 02:30 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** long_wick_down
- **Entry Volume Ratio:** 0.67x (normal)
- **Pattern Detected:** rejection_wick
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.05%
- **Max Unfavorable Move:** -0.44%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on long_wick_down candle Pattern: rejection_wick Stop hit on none candle. PnL: $-23.95

---

### Detailed Kline Autopsy #29: ZENUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | ZENUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $6.11400 |
| **Exit Price** | $6.08700 |
| **P&L** | $-24.08 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 02:31 UTC |
| **Exit Time** | 03:00 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** green
- **Entry Volume Ratio:** 0.68x (normal)
- **Pattern Detected:** gap
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.38%
- **Max Unfavorable Move:** -0.69%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on green candle Pattern: gap Stop hit on none candle. PnL: $-24.08

---

### Detailed Kline Autopsy #30: XRPUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | XRPUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $1.33750 |
| **Exit Price** | $1.33570 |
| **P&L** | $-8.73 |
| **Exit Reason** | TIME_STOP_HARD |
| **Entry Time** | 02:01 UTC |
| **Exit Time** | 03:01 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** green
- **Entry Volume Ratio:** 0.38x (low)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.11%
- **Max Unfavorable Move:** -0.19%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on green candle. PnL: $-8.73

---

### Detailed Kline Autopsy #31: SOLUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | SOLUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $83.82000 |
| **Exit Price** | $84.08000 |
| **P&L** | +$13.51 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 03:15 UTC |
| **Exit Time** | 03:32 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** long_wick_up
- **Entry Volume Ratio:** 0.16x (low)
- **Pattern Detected:** rejection_wick
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.32%
- **Max Unfavorable Move:** -0.04%
- **Runner Potential:** 0.32%

#### Autopsy Summary

> Entry on long_wick_up candle Pattern: rejection_wick. PnL: $13.51

---

### Detailed Kline Autopsy #32: PROVEUSDT LONG

| Field | Value |
|-------|-------|
| **Symbol** | PROVEUSDT |
| **Direction** | LONG |
| **Strategy** | RSI_OVERSOLD |
| **Entry Price** | $0.25380 |
| **Exit Price** | $0.25270 |
| **P&L** | $-23.67 |
| **Exit Reason** | HARD_STOP_LOSS |
| **Entry Time** | 03:32 UTC |
| **Exit Time** | 03:43 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** doji
- **Entry Volume Ratio:** 1.12x (normal)
- **Pattern Detected:** none
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.04%
- **Max Unfavorable Move:** -0.43%
- **Runner Potential:** 0.00%

#### Autopsy Summary

> Entry on doji candle Stop hit on doji candle. PnL: $-23.67

---

## 💡 Strategy Performance (Session)

| Strategy | Trades | Wins | Losses | Win% | Total PnL |
|----------|--------|------|--------|------|----------|
| RSI_OVERSOLD | 21 | 6 | 15 | 28.6% | $-272.01 |
| MOMENTUM_LONG | 1 | 1 | 0 | 100.0% | $+16.25 |
| EMA_CROSS_DN | 7 | 3 | 4 | 42.9% | $-45.80 |
| MOMENTUM_SHORT | 1 | 1 | 0 | 100.0% | $+17.37 |
| VOL_BREAKUP | 1 | 0 | 1 | 0.0% | $-27.56 |
| SQUEEZE_SHORT | 1 | 1 | 0 | 100.0% | $+12.14 |

**Note:** This session shows 32 total trades. Historical data from dashboard shows broader performance across all sessions.

---

## 🔍 Consecutive Loss Tracking

| Strategy | Consecutive Losses | Status |
|----------|-------------------|--------|
| VOL_BREAKUP | 1 | Monitor |
| RSI_OVERSOLD | 1 | Monitor |

---

## 💨 Slippage Analysis

| Symbol | Expected Stop | Actual Loss | Slippage | Severity |
|--------|---------------|-------------|----------|----------|
| OPGUSDT | $-25.00 | $-25.61 | $-0.61 | 🟢 Low |
| MEUSDT | $-25.00 | $-27.77 | $-2.77 | 🟡 Medium |
| SOXLUSDT | $-25.00 | $-30.47 | $-5.47 | 🔴 High |
| ATOMUSDT | $-25.00 | $-27.56 | $-2.56 | 🟡 Medium |
| WIFUSDT | $-25.00 | $-25.56 | $-0.56 | 🟢 Low |
| XRPUSDT | $-25.00 | $-25.10 | $-0.10 | 🟢 Low |
| DOGEUSDT | $-25.00 | $-25.28 | $-0.28 | 🟢 Low |
| SUPERUSDT | $-25.00 | $-27.00 | $-2.00 | 🟡 Medium |

---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

1. Reduce margin for SOXLUSDT (slippage $-5.47)

---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** $1,700.38
- **Session P&L:** $-299.62 (-14.98% return)
- **Session Duration:** 0.01 hours
- **Hourly Rate:** $-29,472.43/hour
- **Forecast (24h):** $-705,637.94
- **Trend:** Negative momentum

**Note:** Forecast based on current session performance only. Actual results may vary.

---

## 📋 Action Items

- [HIGH] Address anomalies: High stop loss count: 19
- [INFO] Next monitoring cycle in 15 minutes

---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Current: $1,700.38
```

### Win Rate by Strategy

RSI_OVERSOLD: ██ 28.6% (6/21)
MOMENTUM_LONG: ██████████ 100.0% (1/1)
EMA_CROSS_DN: ████ 42.9% (3/7)
MOMENTUM_SHORT: ██████████ 100.0% (1/1)
VOL_BREAKUP:  0.0% (0/1)
SQUEEZE_SHORT: ██████████ 100.0% (1/1)

### P&L Distribution
- Winners: $188.46 total, avg $15.71
- Losers: $-488.08 total, avg $-24.40
- Profit Factor: 0.39

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
