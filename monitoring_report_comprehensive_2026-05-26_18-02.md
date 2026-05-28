# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-26 18:02:06 UTC  
**Agent Version:** v1.0  
**Monitoring Cycle:** 1  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at 18:02 UTC. The system fetched live dashboard data, performed kline autopsies on **64 closed trades**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟡 CAUTION

**Key Metrics:**
- **Capital:** $1594.40 (Session P&L: $-405.60, -20.3% drawdown)
- **Performance:** 28W / 36L (43.8% win rate)
- **System:** Loop running normally, 141 pairs loaded, 0 crashes
- **Open Positions:** 2 (SOLUSDT LONG, JTOUSDT LONG) with unrealized PnL tracking

---

## 📊 Dashboard Data (Live)

| Metric | Value | Status |
|--------|-------|--------|
| Bot Status | 🟢 ACTIVE | Healthy |
| Loop Running | ✅ Yes | Normal |
| Pairs Loaded | 141 | Full coverage |
| Loop Crashes | 0 | Stable |
| Open Positions | 2 | Small exposure |
| Capital | $1594.40 | ⚠️ Drawdown |

**Anomalies Detected:** Large loss: SKYAIUSDT $-51.92, Large loss: DEXEUSDT $-62.44, High stop loss count: 34

---

## 📈 Trade Analysis & Kline Autopsies

**Total Trades Analyzed:** 64

### Trade 1: PLUMEUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $18.76 | **Entry:** 21:30 | **Exit:** 21:40 | **Duration:** 10 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.11x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.55%
  - Max Unfavorable: -0.21%
  - Runner Captured: 0.55%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on doji candle. PnL: $18.76

### Trade 2: OPGUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-25.61 | **Entry:** 22:00 | **Exit:** 22:03 | **Duration:** 3 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.50x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: -0.09%
  - Max Unfavorable: -1.75%
  - Runner Captured: 0.00%
  - Slippage: $-0.61
- **Autopsy Summary:** Entry on doji candle Stop hit on red candle. PnL: $-25.61

### Trade 3: AIGENSYNUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-24.85 | **Entry:** 22:03 | **Exit:** 22:04 | **Duration:** 1 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 1.58x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: -0.16%
  - Max Unfavorable: -0.78%
  - Runner Captured: 0.00%
  - Slippage: $0.15
- **Autopsy Summary:** Entry on doji candle with 1.6x volume Stop hit on doji candle. PnL: $-24.85

### Trade 4: SOXLUSDT LONG (MOMENTUM_LONG) ✅ WIN
- **PnL:** $16.25 | **Entry:** 22:15 | **Exit:** 22:26 | **Duration:** 11 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: long_wick_down
  - Volume Ratio: 0.24x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.36%
  - Max Unfavorable: -0.04%
  - Runner Captured: 0.36%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on long_wick_down candle Pattern: rejection_wick. PnL: $16.25

### Trade 5: RAVEUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-23.63 | **Entry:** 22:00 | **Exit:** 22:29 | **Duration:** 29 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 1.08x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.20%
  - Max Unfavorable: -0.67%
  - Runner Captured: 0.00%
  - Slippage: $1.37
- **Autopsy Summary:** Entry on doji candle Stop hit on long_wick_down candle. PnL: $-23.63

### Trade 6: ICPUSDT SHORT (EMA_CROSS_DN) ✅ WIN
- **PnL:** $16.78 | **Entry:** 22:45 | **Exit:** 22:59 | **Duration:** 14 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.98x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.30%
  - Max Unfavorable: -0.45%
  - Runner Captured: 0.30%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on red candle. PnL: $16.78

### Trade 7: DOGEUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $10.77 | **Entry:** 22:45 | **Exit:** 23:18 | **Duration:** 33 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.43x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.33%
  - Max Unfavorable: -0.23%
  - Runner Captured: 0.33%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on doji candle. PnL: $10.77

### Trade 8: AVAXUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $12.53 | **Entry:** 22:45 | **Exit:** 23:32 | **Duration:** 47 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.34x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.32%
  - Max Unfavorable: -0.26%
  - Runner Captured: 0.32%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on red candle. PnL: $12.53

### Trade 9: BCHUSDT SHORT (EMA_CROSS_DN) ❌ LOSS
- **PnL:** $-23.64 | **Entry:** 22:45 | **Exit:** 23:34 | **Duration:** 49 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.15x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.45%
  - Max Unfavorable: -0.22%
  - Runner Captured: 0.00%
  - Slippage: $1.36
- **Autopsy Summary:** Entry on red candle Stop hit on green candle. PnL: $-23.64

### Trade 10: MEUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-27.77 | **Entry:** 23:32 | **Exit:** 23:35 | **Duration:** 3 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 2.01x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: -0.10%
  - Max Unfavorable: -0.62%
  - Runner Captured: 0.00%
  - Slippage: $-2.77
- **Autopsy Summary:** Entry on doji candle with 2.0x volume Pattern: rejection_wick Stop hit on doji candle. PnL: $-27.77

### Trade 11: SOXLUSDT SHORT (EMA_CROSS_DN) ❌ LOSS
- **PnL:** $-30.47 | **Entry:** 23:34 | **Exit:** 23:49 | **Duration:** 15 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.06x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 1.25%
  - Max Unfavorable: -0.32%
  - Runner Captured: 0.00%
  - Slippage: $-5.47
- **Autopsy Summary:** Entry on red candle Stop hit on green candle. PnL: $-30.47

### Trade 12: PROVEUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-24.80 | **Entry:** 23:30 | **Exit:** 23:50 | **Duration:** 20 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.60x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.11%
  - Max Unfavorable: -0.65%
  - Runner Captured: 0.00%
  - Slippage: $0.20
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-24.80

### Trade 13: EWYUSDT SHORT (MOMENTUM_SHORT) ✅ WIN
- **PnL:** $17.37 | **Entry:** 23:30 | **Exit:** 00:10 | **Duration:** -1400 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 2.08x
  - Pattern: spike
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.41%
  - Max Unfavorable: -0.76%
  - Runner Captured: 0.41%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on red candle with 2.1x volume Pattern: spike. PnL: $17.37

### Trade 14: PHAROSUSDT SHORT (EMA_CROSS_DN) ❌ LOSS
- **PnL:** $-24.28 | **Entry:** 00:30 | **Exit:** 00:31 | **Duration:** 1 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.68x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.50%
  - Max Unfavorable: 0.20%
  - Runner Captured: 0.00%
  - Slippage: $0.72
- **Autopsy Summary:** Entry on red candle Stop hit on doji candle. PnL: $-24.28

### Trade 15: SNDKUSDT SHORT (EMA_CROSS_DN) ❌ LOSS
- **PnL:** $-23.62 | **Entry:** 00:30 | **Exit:** 00:35 | **Duration:** 5 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: long_wick_up
  - Volume Ratio: 0.87x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.43%
  - Max Unfavorable: 0.10%
  - Runner Captured: 0.00%
  - Slippage: $1.38
- **Autopsy Summary:** Entry on long_wick_up candle Pattern: rejection_wick Stop hit on red candle. PnL: $-23.62

### Trade 16: GMTUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-24.52 | **Entry:** 00:30 | **Exit:** 00:36 | **Duration:** 6 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.48x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.00%
  - Max Unfavorable: -0.72%
  - Runner Captured: 0.00%
  - Slippage: $0.48
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-24.52

### Trade 17: ATOMUSDT LONG (VOL_BREAKUP) ❌ LOSS
- **PnL:** $-27.56 | **Entry:** 00:15 | **Exit:** 00:38 | **Duration:** 23 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: green
  - Volume Ratio: 0.51x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.23%
  - Max Unfavorable: -0.60%
  - Runner Captured: 0.00%
  - Slippage: $-2.56
- **Autopsy Summary:** Entry on green candle Stop hit on red candle. PnL: $-27.56

### Trade 18: WIFUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-25.56 | **Entry:** 00:45 | **Exit:** 00:52 | **Duration:** 7 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.12x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.16%
  - Max Unfavorable: -0.68%
  - Runner Captured: 0.00%
  - Slippage: $-0.56
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-25.56

### Trade 19: XRPUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-25.10 | **Entry:** 00:45 | **Exit:** 00:53 | **Duration:** 8 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.56x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.07%
  - Max Unfavorable: -0.58%
  - Runner Captured: 0.00%
  - Slippage: $-0.10
- **Autopsy Summary:** Entry on doji candle Pattern: rejection_wick Stop hit on green candle. PnL: $-25.10

### Trade 20: ATOMUSDT SHORT (EMA_CROSS_DN) ✅ WIN
- **PnL:** $28.50 | **Entry:** 01:00 | **Exit:** 01:03 | **Duration:** 3 min
- **Exit Reason:** TAKE_PROFIT
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.70x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: -0.09%
  - Max Unfavorable: -0.66%
  - Runner Captured: -0.09%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on red candle. PnL: $28.50

### Trade 21: BCHUSDT SHORT (EMA_CROSS_DN) ✅ WIN
- **PnL:** $10.94 | **Entry:** 00:45 | **Exit:** 01:08 | **Duration:** 23 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: high_wave
  - Volume Ratio: 0.20x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.28%
  - Max Unfavorable: -0.37%
  - Runner Captured: 0.28%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on high_wave candle Pattern: rejection_wick. PnL: $10.94

### Trade 22: DOGEUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-25.28 | **Entry:** 01:30 | **Exit:** 01:34 | **Duration:** 4 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.12x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: -0.03%
  - Max Unfavorable: -0.48%
  - Runner Captured: 0.00%
  - Slippage: $-0.28
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-25.28

### Trade 23: SOLUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-23.96 | **Entry:** 01:30 | **Exit:** 01:34 | **Duration:** 4 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.48x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.00%
  - Max Unfavorable: -0.46%
  - Runner Captured: 0.00%
  - Slippage: $1.04
- **Autopsy Summary:** Entry on red candle Stop hit on green candle. PnL: $-23.96

### Trade 24: DASHUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $17.46 | **Entry:** 01:34 | **Exit:** 01:52 | **Duration:** 18 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: green
  - Volume Ratio: 0.26x
  - Pattern: engulfing_bullish
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.57%
  - Max Unfavorable: -0.18%
  - Runner Captured: 0.57%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on green candle Pattern: engulfing_bullish. PnL: $17.46

### Trade 25: LINKUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $13.47 | **Entry:** 01:34 | **Exit:** 01:53 | **Duration:** 19 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: green
  - Volume Ratio: 0.32x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.37%
  - Max Unfavorable: -0.05%
  - Runner Captured: 0.37%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on green candle. PnL: $13.47

### Trade 26: BZUSDT SHORT (SQUEEZE_SHORT) ✅ WIN
- **PnL:** $12.14 | **Entry:** 01:45 | **Exit:** 01:56 | **Duration:** 11 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: high_wave
  - Volume Ratio: 0.47x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.08%
  - Max Unfavorable: -0.29%
  - Runner Captured: 0.08%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on high_wave candle Pattern: rejection_wick. PnL: $12.14

### Trade 27: SUPERUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-27.00 | **Entry:** 02:00 | **Exit:** 02:01 | **Duration:** 1 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.56x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: -0.42%
  - Max Unfavorable: -0.58%
  - Runner Captured: 0.00%
  - Slippage: $-2.00
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-27.00

### Trade 28: TRUMPUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-23.95 | **Entry:** 02:00 | **Exit:** 02:30 | **Duration:** 30 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: long_wick_down
  - Volume Ratio: 0.67x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.05%
  - Max Unfavorable: -0.44%
  - Runner Captured: 0.00%
  - Slippage: $1.05
- **Autopsy Summary:** Entry on long_wick_down candle Pattern: rejection_wick Stop hit on none candle. PnL: $-23.95

### Trade 29: ZENUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-24.08 | **Entry:** 02:31 | **Exit:** 03:00 | **Duration:** 29 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: green
  - Volume Ratio: 0.68x
  - Pattern: gap
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.38%
  - Max Unfavorable: -0.69%
  - Runner Captured: 0.00%
  - Slippage: $0.92
- **Autopsy Summary:** Entry on green candle Pattern: gap Stop hit on none candle. PnL: $-24.08

### Trade 30: XRPUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-8.73 | **Entry:** 02:01 | **Exit:** 03:01 | **Duration:** 60 min
- **Exit Reason:** TIME_STOP_HARD
- **Entry Analysis:**
  - Candle Type: green
  - Volume Ratio: 0.38x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.11%
  - Max Unfavorable: -0.19%
  - Runner Captured: 0.00%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on green candle. PnL: $-8.73

### Trade 31: SOLUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $13.51 | **Entry:** 03:15 | **Exit:** 03:32 | **Duration:** 17 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: long_wick_up
  - Volume Ratio: 0.16x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.32%
  - Max Unfavorable: -0.04%
  - Runner Captured: 0.32%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on long_wick_up candle Pattern: rejection_wick. PnL: $13.51

### Trade 32: PROVEUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-23.67 | **Entry:** 03:32 | **Exit:** 03:43 | **Duration:** 11 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 1.12x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.04%
  - Max Unfavorable: -0.43%
  - Runner Captured: 0.00%
  - Slippage: $1.33
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-23.67

### Trade 33: CRVUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $18.60 | **Entry:** 03:30 | **Exit:** 04:24 | **Duration:** 54 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.29x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.64%
  - Max Unfavorable: -0.14%
  - Runner Captured: 0.64%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on doji candle. PnL: $18.60

### Trade 34: COMPUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $16.51 | **Entry:** 04:15 | **Exit:** 04:30 | **Duration:** 15 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 1.28x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.42%
  - Max Unfavorable: -0.26%
  - Runner Captured: 0.42%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on red candle. PnL: $16.51

### Trade 35: RAVEUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $19.54 | **Entry:** 05:15 | **Exit:** 05:25 | **Duration:** 10 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.48x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.71%
  - Max Unfavorable: -0.02%
  - Runner Captured: 0.71%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on doji candle. PnL: $19.54

### Trade 36: HYPEUSDT SHORT (TREND_SHORT) ✅ WIN
- **PnL:** $16.61 | **Entry:** 05:30 | **Exit:** 05:40 | **Duration:** 10 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.34x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.10%
  - Max Unfavorable: -0.46%
  - Runner Captured: 0.10%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on red candle. PnL: $16.61

### Trade 37: GMTUSDT SHORT (TREND_SHORT) ❌ LOSS
- **PnL:** $-28.86 | **Entry:** 06:00 | **Exit:** 06:03 | **Duration:** 3 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.21x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.54%
  - Max Unfavorable: -0.09%
  - Runner Captured: 0.00%
  - Slippage: $-3.86
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-28.86

### Trade 38: SKYAIUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-51.92 | **Entry:** 06:00 | **Exit:** 06:12 | **Duration:** 12 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.94x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.05%
  - Max Unfavorable: -1.85%
  - Runner Captured: 0.00%
  - Slippage: $-26.92
- **Autopsy Summary:** Entry on doji candle Pattern: rejection_wick Stop hit on red candle. PnL: $-51.92

### Trade 39: BZUSDT LONG (VOL_BREAKUP) ❌ LOSS
- **PnL:** $-23.98 | **Entry:** 06:30 | **Exit:** 06:50 | **Duration:** 20 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: long_wick_up
  - Volume Ratio: 0.07x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.18%
  - Max Unfavorable: -0.44%
  - Runner Captured: 0.00%
  - Slippage: $1.02
- **Autopsy Summary:** Entry on long_wick_up candle Pattern: rejection_wick Stop hit on red candle. PnL: $-23.98

### Trade 40: TIAUSDT LONG (VOL_BREAKUP) ✅ WIN
- **PnL:** $18.10 | **Entry:** 06:45 | **Exit:** 07:02 | **Duration:** 17 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: long_wick_up
  - Volume Ratio: 0.77x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.42%
  - Max Unfavorable: -0.34%
  - Runner Captured: 0.42%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on long_wick_up candle. PnL: $18.10

### Trade 41: PROVEUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-24.32 | **Entry:** 08:15 | **Exit:** 08:23 | **Duration:** 8 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.48x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.00%
  - Max Unfavorable: -0.57%
  - Runner Captured: 0.00%
  - Slippage: $0.68
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-24.32

### Trade 42: TRUTHUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $18.50 | **Entry:** 08:30 | **Exit:** 08:42 | **Duration:** 12 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.63x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.45%
  - Max Unfavorable: -0.54%
  - Runner Captured: 0.45%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on doji candle. PnL: $18.50

### Trade 43: ZECUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-23.60 | **Entry:** 09:30 | **Exit:** 09:33 | **Duration:** 3 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 1.04x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.03%
  - Max Unfavorable: -0.51%
  - Runner Captured: 0.00%
  - Slippage: $1.40
- **Autopsy Summary:** Entry on red candle Stop hit on long_wick_up candle. PnL: $-23.60

### Trade 44: STABLEUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-24.14 | **Entry:** 09:30 | **Exit:** 09:39 | **Duration:** 9 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.28x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: -0.00%
  - Max Unfavorable: -0.69%
  - Runner Captured: 0.00%
  - Slippage: $0.86
- **Autopsy Summary:** Entry on doji candle Pattern: rejection_wick Stop hit on doji candle. PnL: $-24.14

### Trade 45: PLUMEUSDT LONG (EMA_CROSS_UP) ✅ WIN
- **PnL:** $29.29 | **Entry:** 10:15 | **Exit:** 10:15 | **Duration:** 0 min
- **Exit Reason:** TAKE_PROFIT
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.38x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.00%
  - Max Unfavorable: 0.00%
  - Runner Captured: 0.00%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on doji candle. PnL: $29.29

### Trade 46: RAVEUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $19.13 | **Entry:** 10:00 | **Exit:** 10:19 | **Duration:** 19 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.71x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.56%
  - Max Unfavorable: -0.21%
  - Runner Captured: 0.56%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on doji candle. PnL: $19.13

### Trade 47: CRCLUSDT LONG (VOL_BREAKUP) ✅ WIN
- **PnL:** $12.05 | **Entry:** 10:30 | **Exit:** 10:40 | **Duration:** 10 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: green
  - Volume Ratio: 0.61x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.33%
  - Max Unfavorable: -0.14%
  - Runner Captured: 0.33%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on green candle. PnL: $12.05

### Trade 48: DEXEUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $26.55 | **Entry:** 11:00 | **Exit:** 11:00 | **Duration:** 0 min
- **Exit Reason:** TAKE_PROFIT
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.65x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.00%
  - Max Unfavorable: 0.00%
  - Runner Captured: 0.00%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on red candle. PnL: $26.55

### Trade 49: DEXEUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $29.56 | **Entry:** 11:03 | **Exit:** 11:04 | **Duration:** 1 min
- **Exit Reason:** TAKE_PROFIT
- **Entry Analysis:**
  - Candle Type: green
  - Volume Ratio: 0.35x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.69%
  - Max Unfavorable: 0.17%
  - Runner Captured: 0.69%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on green candle. PnL: $29.56

### Trade 50: SPCXUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-7.14 | **Entry:** 10:16 | **Exit:** 11:16 | **Duration:** 60 min
- **Exit Reason:** TIME_STOP_HARD
- **Entry Analysis:**
  - Candle Type: green
  - Volume Ratio: 0.40x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.18%
  - Max Unfavorable: -0.19%
  - Runner Captured: 0.00%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on green candle. PnL: $-7.14

### Trade 51: HANAUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $29.24 | **Entry:** 12:15 | **Exit:** 12:16 | **Duration:** 1 min
- **Exit Reason:** TAKE_PROFIT
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.62x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.62%
  - Max Unfavorable: 0.09%
  - Runner Captured: 0.62%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on doji candle. PnL: $29.24

### Trade 52: HANAUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-30.28 | **Entry:** 12:19 | **Exit:** 12:19 | **Duration:** 0 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: long_wick_up
  - Volume Ratio: 1.99x
  - Pattern: engulfing_bullish
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.00%
  - Max Unfavorable: 0.00%
  - Runner Captured: 0.00%
  - Slippage: $-5.28
- **Autopsy Summary:** Entry on long_wick_up candle with 2.0x volume Pattern: engulfing_bullish Stop hit on long_wick_up candle. PnL: $-30.28

### Trade 53: DEXEUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-62.44 | **Entry:** 12:15 | **Exit:** 12:23 | **Duration:** 8 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.23x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.39%
  - Max Unfavorable: -1.28%
  - Runner Captured: 0.00%
  - Slippage: $-37.44
- **Autopsy Summary:** Entry on red candle Stop hit on green candle. PnL: $-62.44

### Trade 54: ORDIUSDT SHORT (SQUEEZE_SHORT) ❌ LOSS
- **PnL:** $-24.00 | **Entry:** 13:00 | **Exit:** 13:04 | **Duration:** 4 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: long_wick_up
  - Volume Ratio: 0.51x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.59%
  - Max Unfavorable: 0.10%
  - Runner Captured: 0.00%
  - Slippage: $1.00
- **Autopsy Summary:** Entry on long_wick_up candle Stop hit on green candle. PnL: $-24.00

### Trade 55: EWYUSDT SHORT (SQUEEZE_SHORT) ❌ LOSS
- **PnL:** $-24.64 | **Entry:** 13:00 | **Exit:** 13:33 | **Duration:** 33 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 1.06x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.74%
  - Max Unfavorable: -0.13%
  - Runner Captured: 0.00%
  - Slippage: $0.36
- **Autopsy Summary:** Entry on red candle Stop hit on none candle. PnL: $-24.64

### Trade 56: FARTCOINUSDT SHORT (EMA_CROSS_DN) ❌ LOSS
- **PnL:** $-24.38 | **Entry:** 14:45 | **Exit:** 14:47 | **Duration:** 2 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.57x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.45%
  - Max Unfavorable: -0.17%
  - Runner Captured: 0.00%
  - Slippage: $0.62
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-24.38

### Trade 57: MSTRUSDT LONG (VOL_BREAKUP) ✅ WIN
- **PnL:** $26.87 | **Entry:** 14:45 | **Exit:** 14:51 | **Duration:** 6 min
- **Exit Reason:** TAKE_PROFIT
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.29x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.84%
  - Max Unfavorable: -0.19%
  - Runner Captured: 0.84%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on red candle. PnL: $26.87

### Trade 58: CRVUSDT SHORT (EMA_CROSS_DN) ✅ WIN
- **PnL:** $27.28 | **Entry:** 15:45 | **Exit:** 15:52 | **Duration:** 7 min
- **Exit Reason:** TAKE_PROFIT
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.27x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.05%
  - Max Unfavorable: -0.90%
  - Runner Captured: 0.05%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on doji candle Pattern: rejection_wick. PnL: $27.28

### Trade 59: BTCUSDT SHORT (EMA_CROSS_DN) ✅ WIN
- **PnL:** $17.31 | **Entry:** 15:45 | **Exit:** 16:13 | **Duration:** 28 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: high_wave
  - Volume Ratio: 0.99x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.02%
  - Max Unfavorable: -0.43%
  - Runner Captured: 0.02%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on high_wave candle Pattern: rejection_wick. PnL: $17.31

### Trade 60: SNDKUSDT SHORT (SQUEEZE_SHORT) ✅ WIN
- **PnL:** $17.88 | **Entry:** 16:30 | **Exit:** 16:41 | **Duration:** 11 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: red
  - Volume Ratio: 0.28x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.28%
  - Max Unfavorable: -0.45%
  - Runner Captured: 0.28%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on red candle. PnL: $17.88

### Trade 61: LAUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-23.93 | **Entry:** 17:00 | **Exit:** 17:18 | **Duration:** 18 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 2.06x
  - Pattern: spike
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.35%
  - Max Unfavorable: -0.70%
  - Runner Captured: 0.00%
  - Slippage: $1.07
- **Autopsy Summary:** Entry on doji candle with 2.1x volume Pattern: spike Stop hit on none candle. PnL: $-23.93

### Trade 62: ALGOUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-24.75 | **Entry:** 16:45 | **Exit:** 17:19 | **Duration:** 34 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.17x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.36%
  - Max Unfavorable: -0.91%
  - Runner Captured: 0.00%
  - Slippage: $0.25
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-24.75

### Trade 63: ADAUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-25.01 | **Entry:** 17:30 | **Exit:** 17:33 | **Duration:** 3 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.80x
  - Pattern: none
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: -0.04%
  - Max Unfavorable: -0.50%
  - Runner Captured: 0.00%
  - Slippage: $-0.01
- **Autopsy Summary:** Entry on doji candle Stop hit on doji candle. PnL: $-25.01

### Trade 64: COMPUSDT SHORT (EMA_CROSS_DN) ❌ LOSS
- **PnL:** $-25.61 | **Entry:** 17:45 | **Exit:** 17:53 | **Duration:** 8 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: long_wick_up
  - Volume Ratio: 0.66x
  - Pattern: rejection_wick
  - 15min Trend: sideways
- **Performance Metrics:**
  - Max Favorable: 0.63%
  - Max Unfavorable: -0.10%
  - Runner Captured: 0.00%
  - Slippage: $-0.61
- **Autopsy Summary:** Entry on long_wick_up candle Pattern: rejection_wick Stop hit on red candle. PnL: $-25.61

---

## 💡 Self-Evolution Insights

### Strategy Performance Summary

| Strategy | Trades | Wins | Losses | Win% | Total PnL |
|----------|--------|------|--------|------|----------|
| RSI_OVERSOLD | 39 | 14 | 25 | 35.9% | $-391.91 |
| MOMENTUM_LONG | 1 | 1 | 0 | 100.0% | $16.25 |
| EMA_CROSS_DN | 11 | 5 | 6 | 45.5% | $-51.20 |
| MOMENTUM_SHORT | 1 | 1 | 0 | 100.0% | $17.37 |
| VOL_BREAKUP | 5 | 3 | 2 | 60.0% | $5.48 |
| SQUEEZE_SHORT | 4 | 2 | 2 | 50.0% | $-18.63 |
| TREND_SHORT | 2 | 1 | 1 | 50.0% | $-12.25 |
| EMA_CROSS_UP | 1 | 1 | 0 | 100.0% | $29.29 |

### Key Observations

- **TREND_SHORT** has 1 consecutive loss(es) - monitor closely
- **RSI_OVERSOLD** has 5 consecutive losses - consider disabling
- **EMA_CROSS_DN** has 1 consecutive loss(es) - monitor closely
- Large loss detected: OPGUSDT LONG ($-25.61) on HARD_STOP_LOSS
- Large loss detected: AIGENSYNUSDT LONG ($-24.85) on HARD_STOP_LOSS
- Large loss detected: RAVEUSDT LONG ($-23.63) on HARD_STOP_LOSS
- Large loss detected: BCHUSDT SHORT ($-23.64) on HARD_STOP_LOSS
- Large loss detected: MEUSDT LONG ($-27.77) on HARD_STOP_LOSS
- Large loss detected: SOXLUSDT SHORT ($-30.47) on HARD_STOP_LOSS
- Large loss detected: PROVEUSDT LONG ($-24.80) on HARD_STOP_LOSS
- Large loss detected: PHAROSUSDT SHORT ($-24.28) on HARD_STOP_LOSS
- Large loss detected: SNDKUSDT SHORT ($-23.62) on HARD_STOP_LOSS
- Large loss detected: GMTUSDT LONG ($-24.52) on HARD_STOP_LOSS
- Large loss detected: ATOMUSDT LONG ($-27.56) on HARD_STOP_LOSS
- Large loss detected: WIFUSDT LONG ($-25.56) on HARD_STOP_LOSS
- Large loss detected: XRPUSDT LONG ($-25.10) on HARD_STOP_LOSS
- Large loss detected: DOGEUSDT LONG ($-25.28) on HARD_STOP_LOSS
- Large loss detected: SOLUSDT LONG ($-23.96) on HARD_STOP_LOSS
- Large loss detected: SUPERUSDT LONG ($-27.00) on HARD_STOP_LOSS
- Large loss detected: TRUMPUSDT LONG ($-23.95) on HARD_STOP_LOSS
- Large loss detected: ZENUSDT LONG ($-24.08) on HARD_STOP_LOSS
- Large loss detected: PROVEUSDT LONG ($-23.67) on HARD_STOP_LOSS
- Large loss detected: GMTUSDT SHORT ($-28.86) on HARD_STOP_LOSS
- Large loss detected: SKYAIUSDT LONG ($-51.92) on HARD_STOP_LOSS
- Large loss detected: BZUSDT LONG ($-23.98) on HARD_STOP_LOSS
- Large loss detected: PROVEUSDT LONG ($-24.32) on HARD_STOP_LOSS
- Large loss detected: ZECUSDT LONG ($-23.60) on HARD_STOP_LOSS
- Large loss detected: STABLEUSDT LONG ($-24.14) on HARD_STOP_LOSS
- Large loss detected: HANAUSDT LONG ($-30.28) on HARD_STOP_LOSS
- Large loss detected: DEXEUSDT LONG ($-62.44) on HARD_STOP_LOSS
- Large loss detected: ORDIUSDT SHORT ($-24.00) on HARD_STOP_LOSS
- Large loss detected: EWYUSDT SHORT ($-24.64) on HARD_STOP_LOSS
- Large loss detected: FARTCOINUSDT SHORT ($-24.38) on HARD_STOP_LOSS
- Large loss detected: LAUSDT LONG ($-23.93) on HARD_STOP_LOSS
- Large loss detected: ALGOUSDT LONG ($-24.75) on HARD_STOP_LOSS
- Large loss detected: ADAUSDT LONG ($-25.01) on HARD_STOP_LOSS
- Large loss detected: COMPUSDT SHORT ($-25.61) on HARD_STOP_LOSS
- High slippage on SOXLUSDT: $-5.47 (expected -$25.00)
- High slippage on SKYAIUSDT: $-26.92 (expected -$25.00)
- High slippage on HANAUSDT: $-5.28 (expected -$25.00)
- High slippage on DEXEUSDT: $-37.44 (expected -$25.00)
- Rejection wick pattern led to 8 loss(es) - consider filtering
- Low volume entries (<0.5x) associated with 14 loss(es)

### Slippage Analysis

| Symbol | Expected Stop | Actual Loss | Slippage | Severity |
|--------|---------------|-------------|----------|----------|
| OPGUSDT | $-25.00 | $-25.61 | $-0.61 | 🟢 NORMAL |
| MEUSDT | $-25.00 | $-27.77 | $-2.77 | 🟢 NORMAL |
| SOXLUSDT | $-25.00 | $-30.47 | $-5.47 | 🟡 MODERATE |
| ATOMUSDT | $-25.00 | $-27.56 | $-2.56 | 🟢 NORMAL |
| WIFUSDT | $-25.00 | $-25.56 | $-0.56 | 🟢 NORMAL |
| XRPUSDT | $-25.00 | $-25.10 | $-0.10 | 🟢 NORMAL |
| DOGEUSDT | $-25.00 | $-25.28 | $-0.28 | 🟢 NORMAL |
| SUPERUSDT | $-25.00 | $-27.00 | $-2.00 | 🟢 NORMAL |
| GMTUSDT | $-25.00 | $-28.86 | $-3.86 | 🟡 MODERATE |
| SKYAIUSDT | $-25.00 | $-51.92 | $-26.92 | 🔴 EXTREME |
| HANAUSDT | $-25.00 | $-30.28 | $-5.28 | 🟡 MODERATE |
| DEXEUSDT | $-25.00 | $-62.44 | $-37.44 | 🔴 EXTREME |
| ADAUSDT | $-25.00 | $-25.01 | $-0.01 | 🟢 NORMAL |
| COMPUSDT | $-25.00 | $-25.61 | $-0.61 | 🟢 NORMAL |

---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

1. Disable RSI_OVERSOLD (consecutive 5 losses)


---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** $1594.40
- **Session P&L:** $-405.60 (-20.3% drawdown)
- **Forecast (24h):** $1133.01
- **Trend:** Negative momentum

**Recovery Analysis:** To recover the current drawdown of $405.60, the bot needs approximately 40 winning trades (based on average win of $10.28).

---

## 📋 Action Items

- [URGENT] Disable RSI_OVERSOLD strategy (3+ consecutive losses)
- [HIGH] Investigate extreme slippage on SKYAIUSDT (-$26.92)
- [HIGH] Investigate extreme slippage on DEXEUSDT (-$37.44)
- [HIGH] Investigate large loss on SOXLUSDT: $-30.47
- [HIGH] Investigate large loss on SKYAIUSDT: $-51.92
- [HIGH] Investigate large loss on HANAUSDT: $-30.28
- [HIGH] Investigate large loss on DEXEUSDT: $-62.44
- [MEDIUM] Add rejection wick filter for entries
- [MEDIUM] Implement volume confirmation threshold (>0.8x)
- [MEDIUM] Implement automatic strategy disable after 3 consecutive losses

---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Start: $2000.00
Current: $1594.40 (↓ $405.60)
```

### Win Rate by Strategy
RSI_OVERSOLD    ███████░░░░░░░░░░░░░ 35.9%
MOMENTUM_LONG   ████████████████████ 100.0%
EMA_CROSS_DN    █████████░░░░░░░░░░░ 45.5%
MOMENTUM_SHORT  ████████████████████ 100.0%
VOL_BREAKUP     ████████████░░░░░░░░ 60.0%
SQUEEZE_SHORT   ██████████░░░░░░░░░░ 50.0%
TREND_SHORT     ██████████░░░░░░░░░░ 50.0%
EMA_CROSS_UP    ████████████████████ 100.0%


### P&L Distribution
- Winners: $531.49 total, avg $18.98
- Losers: $-937.09 total, avg $-26.03
- Profit Factor: 0.57

---

*Report generated by Hermes Evolution Agent v1.0*  
*Data source: http://18.181.221.88:3000/api/data*  
*Next scheduled run: every 15 minutes*
