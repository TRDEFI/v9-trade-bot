# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-26 00:02:24 UTC  
**Agent Version:** v1.0  
**Monitoring Cycle:** 1  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at 00:02 UTC. The system fetched live dashboard data, performed kline autopsies on **12 closed trades**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟡 CAUTION

**Key Metrics:**
- **Capital:** $1894.32 (Session P&L: $-105.68, -5.3% drawdown)
- **Performance:** 5W / 7L (41.7% win rate)
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
| Capital | $1894.32 | ⚠️ Drawdown |

**Anomalies Detected:** High stop loss count: 7

---

## 📈 Trade Analysis & Kline Autopsies

**Total Trades Analyzed:** 12

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

---

## 💡 Self-Evolution Insights

### Strategy Performance Summary

| Strategy | Trades | Wins | Losses | Win% | Total PnL |
|----------|--------|------|--------|------|----------|
| RSI_OVERSOLD | 8 | 3 | 5 | 37.5% | $-84.59 |
| MOMENTUM_LONG | 1 | 1 | 0 | 100.0% | $16.25 |
| EMA_CROSS_DN | 3 | 1 | 2 | 33.3% | $-37.34 |

### Key Observations

- **EMA_CROSS_DN** has 2 consecutive losses - consider disabling
- **RSI_OVERSOLD** has 2 consecutive losses - consider disabling
- Large loss detected: OPGUSDT LONG ($-25.61) on HARD_STOP_LOSS
- Large loss detected: AIGENSYNUSDT LONG ($-24.85) on HARD_STOP_LOSS
- Large loss detected: RAVEUSDT LONG ($-23.63) on HARD_STOP_LOSS
- Large loss detected: BCHUSDT SHORT ($-23.64) on HARD_STOP_LOSS
- Large loss detected: MEUSDT LONG ($-27.77) on HARD_STOP_LOSS
- Large loss detected: SOXLUSDT SHORT ($-30.47) on HARD_STOP_LOSS
- Large loss detected: PROVEUSDT LONG ($-24.80) on HARD_STOP_LOSS
- High slippage on SOXLUSDT: $-5.47 (expected -$25.00)
- Rejection wick pattern led to 1 loss(es) - consider filtering
- Low volume entries (<0.5x) associated with 2 loss(es)

### Slippage Analysis

| Symbol | Expected Stop | Actual Loss | Slippage | Severity |
|--------|---------------|-------------|----------|----------|
| OPGUSDT | $-25.00 | $-25.61 | $-0.61 | 🟢 NORMAL |
| MEUSDT | $-25.00 | $-27.77 | $-2.77 | 🟢 NORMAL |
| SOXLUSDT | $-25.00 | $-30.47 | $-5.47 | 🟡 MODERATE |

---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

1. Reduce margin for SOXLUSDT (slippage $-5.47)


---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** $1894.32
- **Session P&L:** $-105.68 (-5.3% drawdown)
- **Forecast (24h):** $1077.01
- **Trend:** Negative momentum

**Recovery Analysis:** To recover the current drawdown of $105.68, the bot needs approximately 11 winning trades (based on average win of $10.28).

---

## 📋 Action Items

- [HIGH] Review EMA_CROSS_DN strategy (2 consecutive losses)
- [HIGH] Review RSI_OVERSOLD strategy (2 consecutive losses)
- [HIGH] Investigate large loss on SOXLUSDT: $-30.47
- [MEDIUM] Add rejection wick filter for entries
- [MEDIUM] Implement volume confirmation threshold (>0.8x)
- [MEDIUM] Implement automatic strategy disable after 3 consecutive losses

---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Start: $2000.00
Current: $1894.32 (↓ $105.68)
```

### Win Rate by Strategy
RSI_OVERSOLD    ███████░░░░░░░░░░░░░ 37.5%
MOMENTUM_LONG   ████████████████████ 100.0%
EMA_CROSS_DN    ██████░░░░░░░░░░░░░░ 33.3%

### P&L Distribution
- Winners: $75.09 total, avg $15.02
- Losers: $-180.76 total, avg $-25.82
- Profit Factor: 0.42

---

*Report generated by Hermes Evolution Agent v1.0*  
*Data source: http://18.181.221.88:3000/api/data*  
*Next scheduled run: every 15 minutes*
