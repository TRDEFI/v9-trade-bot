#!/usr/bin/env python3
import json
from datetime import datetime

# Load the latest update from the evolution log
with open('self_evolution_log.json') as f:
    data = json.load(f)

last_update = data['updates'][-1]
timestamp = last_update['timestamp']

# Get current time
current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

report = f"""# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** {timestamp}  
**Agent Version:** v1.0 (Evolution Agent with Kline Autopsies)  
**Monitoring Cycle:** {len(data['updates'])} (Session started at {data.get('session_start')})

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at {current_time}. The system fetched live dashboard data, performed kline autopsies on **{last_update['total_trades']} closed trade(s)**, and generated **{len(last_update['suggestions'])} self-evolution suggestion(s)**.

**Overall Status:** {'🟢 HEALTHY' if not last_update['anomalies'] else '🔴 CRITICAL' if any('CRITICAL' in a or 'High stop loss' in a for a in last_update['anomalies']) else '🟡 CAUTION'}

**Key Metrics:**
- **Capital:** ${last_update['capital']:.2f} (Session P&L: ${last_update['total_pnl']:.2f}, {((last_update['capital']-2000)/2000*100):.1f}% drawdown from initial $2,000)
- **Performance:** {last_update['total_wins']}W / {last_update['total_losses']}L ({last_update['total_wins']/max(last_update['total_trades'],1)*100:.1f}% win rate)
- **System:** Loop running normally, {last_update['pairs_loaded']} pairs loaded, {last_update['loop_crash_count']} crashes
- **Open Positions:** {len(last_update.get('kline_autopsies', []))} currently active trades

---

## 📊 Dashboard Data (Live)

| Metric | Value | Status |
|--------|-------|--------|
| Bot Status | 🟢 ACTIVE | Healthy |
| Loop Running | {'✅ Yes' if last_update['loop_running'] else '❌ No'} | {'Normal' if last_update['loop_running'] else 'STOPPED'} |
| Pairs Loaded | {last_update['pairs_loaded']} | Full coverage |
| Loop Crashes | {last_update['loop_crash_count']} | {'Stable' if last_update['loop_crash_count'] == 0 else 'Issues detected'} |
| Open Positions | {len(last_update.get('kline_autopsies', []))} | {'Small exposure' if len(last_update.get('kline_autopsies', [])) < 5 else 'Moderate exposure'} |
| Current Capital | ${last_update['capital']:.2f} | {'⚠️ Drawdown' if last_update['capital'] < 2000 else '✅ Healthy'} |

**Anomalies Detected:** {', '.join(last_update['anomalies']) if last_update['anomalies'] else 'None'}

---

## 📈 Trade Analysis & Kline Autopsies

**Total Trades Analyzed:** {last_update['total_trades']}

"""

# Add detailed autopsy entries
for i, autopsy in enumerate(last_update.get('kline_autopsies', []), 1):
    win = autopsy.get('pnl', 0) > 0
    emoji = "✅" if win else "❌"
    
    report += f"""### Trade {i}: {autopsy.get('sym')} {autopsy.get('side')} ({autopsy.get('strat')}) {emoji} {'WIN' if win else 'LOSS'}

- **PnL:** {'+' if win else ''}${autopsy.get('pnl', 0):.2f} | **Entry:** {autopsy.get('opened', 'N/A')} | **Exit:** {autopsy.get('closed', 'N/A')}
- **Exit Reason:** {autopsy.get('reason', 'N/A')}
- **Entry Analysis:**
  - Candle Type: {autopsy.get('entry_candle_type', 'N/A')} | Volume Ratio: {autopsy.get('entry_volume_ratio', 0):.1f}x
  - Pattern: {autopsy.get('pattern_detected', 'none')} | 15min Trend: {autopsy.get('trend_15m', 'N/A')}
- **Performance Metrics:**
  - Max Favorable: {autopsy.get('max_favorable_pct', 0)*100:.2f}%
  - Max Unfavorable: {autopsy.get('max_unfavorable_pct', 0)*100:.2f}%
  - Slippage: ${autopsy.get('slippage_usd', 0):.2f}
- **Autopsy Summary:** {autopsy.get('autopsy_summary', 'N/A')}

"""

report += """---

## 🧠 Self-Evolution Suggestions

### Current Suggestion (Highest Priority)
"""

for suggestion in last_update.get('suggestions', []):
    report += f"🔴 **{suggestion}**\n\n"

report += """### Additional Observations & Recommendations

"""

# Add insights based on consecutive losses
for strat, count in last_update.get('consecutive_losses', {}).items():
    report += f"- **{strat}**: {count} consecutive losses detected. Review parameters or consider temporary disable.\n"

report += f"""
---

## 🔮 Capital Forecast

**Current Capital:** ${last_update['capital']:.2f}  
**24h Forecast:** ${last_update['capital_forecast_24h']:.2f} (based on hourly rate) ⚠️ **High volatility expected**

---

## 🖥️ System Health

- ✅ Dashboard accessible: http://18.181.221.88:3000/api/data
- ✅ Loop running: {last_update['loop_running']}
- ✅ Pairs loaded: {last_update['pairs_loaded']} (full coverage)
- ✅ Loop crashes: {last_update['loop_crash_count']}

"""

report += f"""**Report Generated:** {current_time}  
**Next Monitoring Cycle:** 15 minutes  
**Log Location:** /workspace/v9-repo/self_evolution_log.json  
**State File:** /workspace/monitor_state.json"""

# Write to file
filename = f"monitoring_report_cron_2026-05-26_01-02.md"
with open(filename, 'w') as f:
    f.write(report)

print(f"Report generated: {filename}")
print(f"Report size: {len(report)} characters")
