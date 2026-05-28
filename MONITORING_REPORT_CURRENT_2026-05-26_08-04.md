# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-26T08:02:41.720657+00:00  
**Agent Version:** v1.0  
**Monitoring Cycle:** 1  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully. The system fetched live dashboard data, performed kline autopsies on **40 closed trades**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟡 CAUTION

**Key Metrics:**
- **Capital:** $1684.98 (Session P&L: $-315.02, -15.8% drawdown from $2000 baseline)
- **Performance:** 17W / 23L (42.5% win rate)
- **System:** Loop running normally, 141 pairs loaded, 0 crashes
- **Anomalies:** Large loss: SKYAIUSDT $-51.92, High stop loss count: 22

---

## 📊 Dashboard Data (Live)

| Metric | Value | Status |
|--------|-------|--------|
| Bot Status | 🟢 ACTIVE | Healthy |
| Loop Running | ✅ Yes | Normal |
| Pairs Loaded | 141 | Full coverage |
| Loop Crashes | 0 | Stable |
| Open Positions | 40 | Monitoring |
| Capital | $1684.98 | ⚠️ Drawdown |
| Total Trades | 40 | Active |
| Total P&L | $-315.02 | Loss |

---

## 📈 Strategy Performance Analysis

| Strategy | Trades | Wins | Losses | Win % | Total P&L | Status |
|----------|--------|------|--------|-------|-----------|--------|
| RSI_OVERSOLD | 25 | 9 | 16 | 36.0% | $-269.28 | ❌ |
| MOMENTUM_LONG | 1 | 1 | 0 | 100.0% | $16.25 | ✅ |
| EMA_CROSS_DN | 7 | 3 | 4 | 42.9% | $-45.80 | ❌ |
| MOMENTUM_SHORT | 1 | 1 | 0 | 100.0% | $17.37 | ✅ |
| VOL_BREAKUP | 3 | 1 | 2 | 33.3% | $-33.44 | ❌ |
| SQUEEZE_SHORT | 1 | 1 | 0 | 100.0% | $12.14 | ✅ |
| TREND_SHORT | 2 | 1 | 1 | 50.0% | $-12.25 | ❌ |

---

## 🔍 Kline Autopsies Summary

**Total Trades Analyzed:** 40  
**Kline Data Errors:** 0

### Recent Trade Highlights:

#### Trade 1: PLUMEUSDT LONG (RSI_OVERSOLD) ✅ WIN
- **PnL:** $18.76 | **Entry:** 21:30 | **Exit:** 21:40 | **Duration:** 10 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.11x
  - Pattern: none
  - 15min Trend: sideways
  - Entry Against Trend: ✅ No
- **Performance Metrics:**
  - Max Favorable: 0.55%
  - Max Unfavorable: -0.21%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on doji candle. PnL: $18.76

#### Trade 2: OPGUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-25.61 | **Entry:** 22:00 | **Exit:** 22:03 | **Duration:** 3 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 0.50x
  - Pattern: none
  - 15min Trend: sideways
  - Entry Against Trend: ✅ No
- **Performance Metrics:**
  - Max Favorable: -0.09%
  - Max Unfavorable: -1.75%
  - Slippage: $-0.61
- **Autopsy Summary:** Entry on doji candle Stop hit on red candle. PnL: $-25.61

#### Trade 3: AIGENSYNUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-24.85 | **Entry:** 22:03 | **Exit:** 22:04 | **Duration:** 1 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 1.58x
  - Pattern: none
  - 15min Trend: sideways
  - Entry Against Trend: ✅ No
- **Performance Metrics:**
  - Max Favorable: -0.16%
  - Max Unfavorable: -0.78%
  - Slippage: $0.15
- **Autopsy Summary:** Entry on doji candle with 1.6x volume Stop hit on doji candle. PnL: $-24.85

#### Trade 4: SOXLUSDT LONG (MOMENTUM_LONG) ✅ WIN
- **PnL:** $16.25 | **Entry:** 22:15 | **Exit:** 22:26 | **Duration:** 11 min
- **Exit Reason:** TAKE_PROFIT_TIME_DECAY
- **Entry Analysis:**
  - Candle Type: long_wick_down
  - Volume Ratio: 0.24x
  - Pattern: rejection_wick
  - 15min Trend: sideways
  - Entry Against Trend: ✅ No
- **Performance Metrics:**
  - Max Favorable: 0.36%
  - Max Unfavorable: -0.04%
  - Slippage: $0.00
- **Autopsy Summary:** Entry on long_wick_down candle Pattern: rejection_wick. PnL: $16.25

#### Trade 5: RAVEUSDT LONG (RSI_OVERSOLD) ❌ LOSS
- **PnL:** $-23.63 | **Entry:** 22:00 | **Exit:** 22:29 | **Duration:** 29 min
- **Exit Reason:** HARD_STOP_LOSS
- **Entry Analysis:**
  - Candle Type: doji
  - Volume Ratio: 1.08x
  - Pattern: none
  - 15min Trend: sideways
  - Entry Against Trend: ✅ No
- **Performance Metrics:**
  - Max Favorable: 0.20%
  - Max Unfavorable: -0.67%
  - Slippage: $1.37
- **Autopsy Summary:** Entry on doji candle Stop hit on long_wick_down candle. PnL: $-23.63

---

## ⚠️ Anomalies Detected

- Large loss: SKYAIUSDT $-51.92
- High stop loss count: 22

---

## 💡 Self-Evolution Suggestions

**Latest Suggestion (Cycle 1):**
> Reduce margin for SOXLUSDT (slippage $-5.47)

### Consecutive Losses Tracking:
- **TREND_SHORT**: 1 consecutive losses
- **RSI_OVERSOLD**: 1 consecutive losses

---

## 📉 Capital Forecast

- **Current Capital:** $1684.98
- **24h Forecast:** $1004.35 (based on session hourly rate)
- **Drawdown from Peak:** -15.8%

---

## 🔄 System Health

- **Loop Status:** 🟢 Running
- **Last Loop Duration:** N/Ams
- **Pairs Loaded:** 141/150 target
- **Session Uptime:** 0.0 hours

---

## 🎯 Action Items

1. **Review large losses:** SKYAIUSDT $-51.92 requires investigation
2. **Address consecutive losses:** TREND_SHORT and RSI_OVERSOLD strategies showing patterns
3. **Implement suggestion:** Reduce margin for SOXLUSDT (slippage $-5.47)
4. **Monitor stop loss frequency:** 22 stop losses indicates potential entry timing issues

---

*Report generated by Binance Futures Trading Bot Monitoring Agent v1.0*
*Next monitoring cycle in 15 minutes*
