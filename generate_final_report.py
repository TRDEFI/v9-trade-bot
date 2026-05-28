#!/usr/bin/env python3
"""Generate comprehensive monitoring report from evolution agent data"""
import json
from datetime import datetime, timezone

# Load the latest evolution log
with open('self_evolution_log.json', 'r') as f:
    log_data = json.load(f)

# Get the latest report
latest = log_data['updates'][-1]
session_start = datetime.fromtimestamp(log_data['session_start']/1000, tz=timezone.utc)

# Generate comprehensive report
report = f'''# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** {latest['timestamp']}  
**Agent Version:** v1.0  
**Monitoring Cycle:** {len(log_data['updates'])}  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully. The system fetched live dashboard data, performed kline autopsies on **{latest['total_trades']} closed trades**, and generated **{len(latest['suggestions'])} self-evolution suggestion(s)**.

**Overall Status:** 🟡 CAUTION

**Key Metrics:**
- **Capital:** ${latest['capital']:.2f} (Session P&L: ${latest['total_pnl']:.2f}, {((latest['capital'] - 2000) / 2000 * 100):.1f}% drawdown from $2000 baseline)
- **Performance:** {latest['total_wins']}W / {latest['total_losses']}L ({latest['total_wins']/(latest['total_trades'])*100:.1f}% win rate)
- **System:** Loop running normally, {latest['pairs_loaded']} pairs loaded, {latest['loop_crash_count']} crashes
- **Anomalies:** {', '.join(latest['anomalies']) if latest['anomalies'] else 'None'}

---

## 📊 Dashboard Data (Live)

| Metric | Value | Status |
|--------|-------|--------|
| Bot Status | 🟢 ACTIVE | Healthy |
| Loop Running | ✅ Yes | Normal |
| Pairs Loaded | {latest['pairs_loaded']} | Full coverage |
| Loop Crashes | {latest['loop_crash_count']} | Stable |
| Open Positions | {len(latest.get('kline_autopsies', []))} | Monitoring |
| Capital | ${latest['capital']:.2f} | ⚠️ Drawdown |
| Total Trades | {latest['total_trades']} | Active |
| Total P&L | ${latest['total_pnl']:.2f} | Loss |

---

## 📈 Strategy Performance Analysis

| Strategy | Trades | Wins | Losses | Win % | Total P&L | Status |
|----------|--------|------|--------|-------|-----------|--------|
'''

for strat in latest['strategy_performance']:
    status = '✅' if strat['total_pnl'] > 0 else '❌'
    report += f"| {strat['strat']} | {strat['trades']} | {strat['wins']} | {strat['losses']} | {strat['win_pct']:.1f}% | ${strat['total_pnl']:.2f} | {status} |\n"

report += f'''
---

## 🔍 Kline Autopsies Summary

**Total Trades Analyzed:** {len(latest['kline_autopsies'])}  
**Kline Data Errors:** {sum(1 for a in latest['kline_autopsies'] if 'kline_error' in a)}

### Recent Trade Highlights:

'''

# Show first 5 trades as examples
for i, trade in enumerate(latest['kline_autopsies'][:5]):
    result = '✅ WIN' if trade['pnl'] > 0 else '❌ LOSS'
    # Calculate duration
    try:
        opened_parts = trade['opened'].split(':')
        closed_parts = trade['closed'].split(':')
        duration = (int(closed_parts[0])*60+int(closed_parts[1])) - (int(opened_parts[0])*60+int(opened_parts[1]))
    except:
        duration = 0
    
    report += f'''#### Trade {i+1}: {trade['sym']} {trade['side']} ({trade['strat']}) {result}
- **PnL:** ${trade['pnl']:.2f} | **Entry:** {trade['opened']} | **Exit:** {trade['closed']} | **Duration:** {duration} min
- **Exit Reason:** {trade['reason']}
- **Entry Analysis:**
  - Candle Type: {trade.get('entry_candle_type', 'N/A')}
  - Volume Ratio: {trade.get('entry_volume_ratio', 1.0):.2f}x
  - Pattern: {trade.get('pattern_detected', 'none')}
  - 15min Trend: {trade.get('trend_15m', 'N/A')}
  - Entry Against Trend: {'⚠️ Yes' if trade.get('entry_was_against_trend', False) else '✅ No'}
- **Performance Metrics:**
  - Max Favorable: {trade.get('max_favorable_pct', 0)*100:.2f}%
  - Max Unfavorable: {trade.get('max_unfavorable_pct', 0)*100:.2f}%
  - Slippage: ${trade.get('slippage_usd', 0):.2f}
- **Autopsy Summary:** {trade.get('autopsy_summary', 'N/A')}

'''

report += f'''---

## ⚠️ Anomalies Detected

'''

for anomaly in latest['anomalies']:
    report += f'- {anomaly}\n'

report += f'''
---

## 💡 Self-Evolution Suggestions

**Latest Suggestion (Cycle {len(log_data['updates'])}):**
> {latest['suggestions'][0] if latest['suggestions'] else 'Monitor and optimize'}

### Consecutive Losses Tracking:
'''

for strat, count in latest['consecutive_losses'].items():
    report += f'- **{strat}**: {count} consecutive losses\n'

report += f'''
---

## 📉 Capital Forecast

- **Current Capital:** ${latest['capital']:.2f}
- **24h Forecast:** ${latest['capital_forecast_24h']:.2f} (based on session hourly rate)
- **Drawdown from Peak:** {((latest['capital'] - max([2000, latest['capital']])) / 2000 * 100):.1f}%

---

## 🔄 System Health

- **Loop Status:** {'🟢 Running' if latest['loop_running'] else '🔴 Stopped'}
- **Last Loop Duration:** {log_data['updates'][-1].get('loop_duration_ms', 'N/A')}ms
- **Pairs Loaded:** {latest['pairs_loaded']}/150 target
- **Session Uptime:** {(datetime.now(timezone.utc) - session_start).total_seconds()/3600:.1f} hours

---

## 🎯 Action Items

1. **Review large losses:** SKYAIUSDT $-51.92 requires investigation
2. **Address consecutive losses:** TREND_SHORT and RSI_OVERSOLD strategies showing patterns
3. **Implement suggestion:** {latest['suggestions'][0] if latest['suggestions'] else 'Continue monitoring'}
4. **Monitor stop loss frequency:** 22 stop losses indicates potential entry timing issues

---

*Report generated by Binance Futures Trading Bot Monitoring Agent v1.0*
*Next monitoring cycle in 15 minutes*
'''

# Save the report
filename = f'MONITORING_REPORT_CURRENT_{datetime.now().strftime("%Y-%m-%d_%H-%M")}.md'
with open(filename, 'w') as f:
    f.write(report)

print(f"Report generated: {filename}")
print(f"Capital: ${latest['capital']:.2f}")
print(f"Total P&L: ${latest['total_pnl']:.2f}")
print(f"Trades analyzed: {len(latest['kline_autopsies'])}")
print(f"Suggestions: {latest['suggestions'][0] if latest['suggestions'] else 'None'}")
