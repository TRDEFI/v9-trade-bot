# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** 2026-05-26T16:15:43.204829+00:00  
**Agent Version:** v1.0 (Evolution Agent with Kline Autopsies)  
**Monitoring Cycle:** 2  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at 2026-05-26T16:15:43 UTC. The system fetched live dashboard data, performed kline autopsies on **1 new closed trade(s)**, and generated **1 self-evolution suggestion(s)**.

**Overall Status:** 🟢 HEALTHY

**Key Metrics:**
- **Capital:** $1,675.82 (Session P&L: $-324.18, -16.21% return)
- **Performance:** 27W / 32L (45.8% win rate this session)
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
| Current Capital | $1,675.82 | ⚠️ Drawdown |

**Anomalies Detected:** None

---

## 📈 Trade Analysis & Kline Autopsies

**Total New Trades Analyzed:** 1

### Detailed Kline Autopsy #1: BTCUSDT SHORT

| Field | Value |
|-------|-------|
| **Symbol** | BTCUSDT |
| **Direction** | SHORT |
| **Strategy** | EMA_CROSS_DN |
| **Entry Price** | $76503.70000 |
| **Exit Price** | $76208.20000 |
| **P&L** | +$17.31 |
| **Exit Reason** | TAKE_PROFIT_TIME_DECAY |
| **Entry Time** | 15:45 UTC |
| **Exit Time** | 16:13 UTC |

#### Candlestick Analysis

- **Entry Candle Type:** high_wave
- **Entry Volume Ratio:** 0.99x (normal)
- **Pattern Detected:** rejection_wick
- **15m Trend:** sideways
- **Entry Against Trend:** ✅ No (with trend)

#### Price Action Metrics

- **Max Favorable Move:** +0.02%
- **Max Unfavorable Move:** -0.43%
- **Runner Potential:** 0.02%

#### Autopsy Summary

> Entry on high_wave candle Pattern: rejection_wick. PnL: $17.31

---

## 💡 Strategy Performance (Session)

| Strategy | Trades | Wins | Losses | Win% | Total PnL |
|----------|--------|------|--------|------|----------|
| RSI_OVERSOLD | 36 | 14 | 22 | 38.9% | $-318.22 |
| MOMENTUM_LONG | 1 | 1 | 0 | 100.0% | $+16.25 |
| EMA_CROSS_DN | 10 | 5 | 5 | 50.0% | $-25.59 |
| MOMENTUM_SHORT | 1 | 1 | 0 | 100.0% | $+17.37 |
| VOL_BREAKUP | 5 | 3 | 2 | 60.0% | $+5.48 |
| SQUEEZE_SHORT | 3 | 1 | 2 | 33.3% | $-36.51 |
| TREND_SHORT | 2 | 1 | 1 | 50.0% | $-12.25 |
| EMA_CROSS_UP | 1 | 1 | 0 | 100.0% | $+29.29 |

**Note:** This session shows 59 total trades. Historical data from dashboard shows broader performance across all sessions.

---

## 🔍 Consecutive Loss Tracking

| Strategy | Consecutive Losses | Status |
|----------|-------------------|--------|
| TREND_SHORT | 1 | Monitor |
| RSI_OVERSOLD | 2 | Monitor |
| SQUEEZE_SHORT | 2 | Monitor |

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
| GMTUSDT | $-25.00 | $-28.86 | $-3.86 | 🟡 Medium |
| SKYAIUSDT | $-25.00 | $-51.92 | $-26.92 | 🔴 High |
| HANAUSDT | $-25.00 | $-30.28 | $-5.28 | 🔴 High |
| DEXEUSDT | $-25.00 | $-62.44 | $-37.44 | 🔴 High |

---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

1. Monitor for pattern emergence and optimize entry timing

---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** $1,675.82
- **Session P&L:** $-324.18 (-16.21% return)
- **Session Duration:** 0.23 hours
- **Hourly Rate:** $-1,401.51/hour
- **Forecast (24h):** $-31,960.52
- **Trend:** Negative momentum

**Note:** Forecast based on current session performance only. Actual results may vary.

---

## 📋 Action Items

- [OBSERVE] Monitor for pattern emergence and optimize entry timing
- [INFO] Next monitoring cycle in 15 minutes

---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Start: $1,658.51
Current: $1,675.82 (↑ $17.31)
```

### Win Rate by Strategy

RSI_OVERSOLD: ███ 38.9% (14/36)
MOMENTUM_LONG: ██████████ 100.0% (1/1)
EMA_CROSS_DN: █████ 50.0% (5/10)
MOMENTUM_SHORT: ██████████ 100.0% (1/1)
VOL_BREAKUP: ██████ 60.0% (3/5)
SQUEEZE_SHORT: ███ 33.3% (1/3)
TREND_SHORT: █████ 50.0% (1/2)
EMA_CROSS_UP: ██████████ 100.0% (1/1)

### P&L Distribution
- Winners: $17.31 total, avg $17.31
- Losers: $0.00 total, avg $0.00
- Profit Factor: inf

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
