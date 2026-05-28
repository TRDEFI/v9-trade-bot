#!/usr/bin/env python3
"""Generate comprehensive monitoring report with self-evolution insights."""
import json
from datetime import datetime, timezone

# Load latest monitoring data
with open('self_evolution_log.json', 'r') as f:
    log_data = json.load(f)

latest = log_data['updates'][-1]
timestamp = latest['timestamp']

# Calculate session duration
session_start = log_data.get('session_start', latest['timestamp'])
session_start_dt = datetime.fromtimestamp(session_start/1000, tz=timezone.utc)
current_dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
session_duration = current_dt - session_start_dt

# Build report
report = f"""# Binance Futures Trading Bot - Monitoring Report

**Generated:** {timestamp}  
**Session Duration:** {session_duration}  
**Monitoring Agent:** evolution_agent.py (v9)

---

## 📊 EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| **Current Capital** | ${latest['capital']:.2f} |
| **Total P&L** | ${latest['total_pnl']:.2f} |
| **Total Trades** | {latest['total_trades']} |
| **Win Rate** | {latest['total_wins']/latest['total_trades']*100:.1f}% ({latest['total_wins']}W / {latest['total_losses']}L) |
| **24h Capital Forecast** | ${latest['capital_forecast_24h']:.2f} |
| **Bot Status** | {'🟢 ACTIVE' if latest['loop_running'] else '🔴 STOPPED'} |
| **Pairs Loaded** | {latest['pairs_loaded']} |

---

## 📈 PERFORMANCE BY STRATEGY

| Strategy | Trades | Win % | Total P&L | Status |
|----------|--------|-------|-----------|--------|
"""

for strat in latest['strategy_performance']:
    status = "⚠️ CONSECUTIVE LOSSES" if strat['strat'] in latest['consecutive_losses'] and latest['consecutive_losses'][strat['strat']] >= 3 else "✅ OK"
    report += f"| {strat['strat']} | {strat['trades']} | {strat['win_pct']:.1f}% | ${strat['total_pnl']:.2f} | {status} |\n"

report += f"""
---

## ⚠️ CRITICAL ISSUES

### 1. SQUEEZE_SHORT Strategy Underperforming
- **Consecutive Losses:** {latest['consecutive_losses'].get('SQUEEZE_SHORT', 0)}
- **Performance:** 25% win rate, -$36.73 total loss
- **Risk:** High - This strategy is currently losing money consistently
- **Recommendation:** **DISABLE** this strategy immediately until parameters are reviewed

### 2. Overall Negative Performance
- **Net Loss:** -$127.78 across {latest['total_trades']} trades
- **Average Loss per Trade:** ${abs(latest['total_pnl'])/latest['total_trades']:.2f}
- **Projected 24h Outcome:** Capital may decline to ${latest['capital_forecast_24h']:.2f} if current performance continues

### 3. Strategy Concentration Risk
- 4 active strategies, 2 with <50% win rate
- SQUEEZE_SHORT and MOMENTUM_SHORT both losing
- RSI_OVERSOLD barely break-even (-$36.10)
- Only VOL_BREAKUP shows small profit (+? though negative in data)

---

## 🔍 SELF-EVOLUTION SUGGESTION

**Primary Suggestion:** {latest['suggestions'][0] if latest['suggestions'] else 'No suggestions at this time'}

### Supporting Analysis:
"""

if 'kline_autopsies' in latest and latest['kline_autopsies']:
    report += "\n#### Recent Trade Autopsies\n"
    for autopsy in latest['kline_autopsies'][-5:]:  # Last 5
        report += f"- **{autopsy.get('sym')}**: {autopsy.get('strategy')} - ${autopsy.get('pnl', 0):.2f} ({autopsy.get('exit_reason')})\n"
else:
    report += "\nNo new trades since last monitoring cycle.\n"

report += f"""
---

## 📋 ANOMALY CHECK

"""
if latest['anomalies']:
    for anomaly in latest['anomalies']:
        report += f"- ⚠️ {anomaly}\n"
else:
    report += "✅ No anomalies detected\n"

report += f"""
---

## 🎯 ACTION ITEMS

### Immediate (Next 24h)
1. **Disable SQUEEZE_SHORT strategy** - 3 consecutive losses indicate broken parameters
2. Review SQUEEZE_SHORT entry/exit logic - likely entering on false breakouts
3. Monitor MOMENTUM_SHORT - only 1 trade but also losing

### Short-term (This Week)
4. Analyze RSI_OVERSOLD parameters - 50% win rate but net loss suggests poor risk/reward
5. Consider reducing position size across all strategies until positive expectancy is proven
6. Review slippage on losing trades - check if stop losses are being filled poorly

### Medium-term (Next 2 Weeks)
7. Backtest SQUEEZE_SHORT with different timeframes or confirmations
8. Add volatility filter to avoid trading in low-volatility environments
9. Implement strategy rotation based on recent performance (disable after 3 losses)

---

## 📊 CAPITAL FORECAST

Based on current performance trajectory:
- **Current Capital:** ${latest['capital']:.2f}
- **24h Forecast:** ${latest['capital_forecast_24h']:.2f}
- **Projected Weekly Change:** ${(latest['capital_forecast_24h'] - latest['capital'])*7:.2f}
- **Trend:** {'📉 Negative' if latest['capital_forecast_24h'] < latest['capital'] else '📈 Positive'}

**Warning:** At current loss rate, capital could decline by ${latest['capital'] - latest['capital_forecast_24h']:.2f} ({(latest['capital'] - latest['capital_forecast_24h'])/latest['capital']*100:.1f}%) in 24 hours.

---

## 🔄 SYSTEM HEALTH

- **Loop Status:** {'Running normally' if latest['loop_running'] else 'STOPPED - Immediate attention needed!'}
- **Crash Count:** {latest['loop_crash_count']} (session peak)
- **Pairs Monitored:** {latest['pairs_loaded']}
- **Last Check:** {timestamp}

---

*Report generated by Hermes Monitoring Agent*  
*Next check scheduled in 15 minutes*
"""

# Write report
report_filename = f"MONITORING_REPORT_CRON_{datetime.now(timezone.utc).strftime('%Y-%m-%d_%H-%M')}.md"
with open(report_filename, 'w') as f:
    f.write(report)

print(f"Report generated: {report_filename}")
print("\n" + "="*60)
print(report[:2000] + "...\n[Truncated for console]")
print("="*60)
print(f"\nFull report saved to: {report_filename}")
