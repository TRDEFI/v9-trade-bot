# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-26 17:31:04 UTC  
**Agent Version:** v1.0  
**Monitoring Cycle:** 2  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at 17:31 UTC. The system fetched live dashboard data, performed kline autopsies on **62 closed trades**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟢 HEALTHY

**Key Metrics:**
- **Capital:** $1645.02 (Session P&L: $-354.98, -17.7% drawdown)
- **Performance:** 28W / 34L (45.2% win rate)
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
| Capital | $1645.02 | ⚠️ Drawdown |

**Anomalies Detected:** None

---

## 📈 Trade Analysis & Kline Autopsies

**Total Trades Analyzed:** 62

### Trade 1: LAUSDT LONG (RSI_OVERSOLD) ❌ LOSS
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

### Trade 2: ALGOUSDT LONG (RSI_OVERSOLD) ❌ LOSS
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

---

## 💡 Self-Evolution Insights

### Strategy Performance Summary

| Strategy | Trades | Wins | Losses | Win% | Total PnL |
|----------|--------|------|--------|------|----------|
| RSI_OVERSOLD | 38 | 14 | 24 | 36.8% | $-366.90 |
| MOMENTUM_LONG | 1 | 1 | 0 | 100.0% | $16.25 |
| EMA_CROSS_DN | 10 | 5 | 5 | 50.0% | $-25.59 |
| MOMENTUM_SHORT | 1 | 1 | 0 | 100.0% | $17.37 |
| VOL_BREAKUP | 5 | 3 | 2 | 60.0% | $5.48 |
| SQUEEZE_SHORT | 4 | 2 | 2 | 50.0% | $-18.63 |
| TREND_SHORT | 2 | 1 | 1 | 50.0% | $-12.25 |
| EMA_CROSS_UP | 1 | 1 | 0 | 100.0% | $29.29 |

### Key Observations

- **TREND_SHORT** has 1 consecutive loss(es) - monitor closely
- **RSI_OVERSOLD** has 4 consecutive losses - consider disabling
- Large loss detected: LAUSDT LONG ($-23.93) on HARD_STOP_LOSS
- Large loss detected: ALGOUSDT LONG ($-24.75) on HARD_STOP_LOSS
- High slippage on SOXLUSDT: $-5.47 (expected -$25.00)
- High slippage on SKYAIUSDT: $-26.92 (expected -$25.00)
- High slippage on HANAUSDT: $-5.28 (expected -$25.00)
- High slippage on DEXEUSDT: $-37.44 (expected -$25.00)
- Low volume entries (<0.5x) associated with 1 loss(es)

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

---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

1. Disable RSI_OVERSOLD (consecutive 4 losses)


---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** $1645.02
- **Session P&L:** $-354.98 (-17.7% drawdown)
- **Forecast (24h):** $1231.07
- **Trend:** Negative momentum

**Recovery Analysis:** To recover the current drawdown of $354.98, the bot needs approximately 35 winning trades (based on average win of $10.28).

---

## 📋 Action Items

- [URGENT] Disable RSI_OVERSOLD strategy (3+ consecutive losses)
- [HIGH] Investigate extreme slippage on SKYAIUSDT (-$26.92)
- [HIGH] Investigate extreme slippage on DEXEUSDT (-$37.44)
- [MEDIUM] Implement volume confirmation threshold (>0.8x)
- [MEDIUM] Implement automatic strategy disable after 3 consecutive losses

---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Start: $2000.00
Current: $1645.02 (↓ $354.98)
```

### Win Rate by Strategy
RSI_OVERSOLD    ███████░░░░░░░░░░░░░ 36.8%
MOMENTUM_LONG   ████████████████████ 100.0%
EMA_CROSS_DN    ██████████░░░░░░░░░░ 50.0%
MOMENTUM_SHORT  ████████████████████ 100.0%
VOL_BREAKUP     ████████████░░░░░░░░ 60.0%
SQUEEZE_SHORT   ██████████░░░░░░░░░░ 50.0%
TREND_SHORT     ██████████░░░░░░░░░░ 50.0%
EMA_CROSS_UP    ████████████████████ 100.0%


### P&L Distribution
- Winners: $0.00 total, avg $0.00
- Losers: $-48.68 total, avg $-24.34
- Profit Factor: 0.00

---

*Report generated by Hermes Evolution Agent v1.0*  
*Data source: http://18.181.221.88:3000/api/data*  
*Next scheduled run: every 15 minutes*
