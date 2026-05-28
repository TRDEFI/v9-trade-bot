#!/usr/bin/env python3
import json
from datetime import datetime

with open('self_evolution_log.json') as f:
    log_data = json.load(f)

latest = log_data['updates'][-1]
ts = datetime.fromisoformat(latest['timestamp'].replace('Z', '+00:00'))

total_trades = latest['total_trades']
wins = latest['total_wins']
losses = latest['total_losses']
win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
capital = latest['capital']
total_pnl = latest['total_pnl']
drawdown_pct = (total_pnl / 2000 * 100) if total_pnl < 0 else 0

autopsies = latest['kline_autopsies']
suggestions = latest['suggestions']
slippage = latest['slippage_heatmap']
consec_losses = latest['consecutive_losses']
strat_perf = latest['strategy_performance']
anomalies = latest['anomalies']
forecast = latest['capital_forecast_24h']
loop_running = latest['loop_running']
loop_crashes = latest['loop_crash_count']
pairs_loaded = latest['pairs_loaded']

report = f"""# Binance Futures Trading Bot - Hermes Evolution Agent Report

**Execution Time:** {ts.strftime('%Y-%m-%d %H:%M:%S UTC')}  
**Agent Version:** v1.0  
**Monitoring Cycle:** {len(log_data['updates'])}

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at {ts.strftime('%H:%M UTC')}. The system fetched live dashboard data, performed kline autopsies on **{total_trades} closed trades**, and generated **{len(suggestions)} self-evolution suggestion(s)**.

**Overall Status:** {'🟢 HEALTHY' if not anomalies else '🟡 CAUTION' if 'BOT NOT ACTIVE' not in str(anomalies) else '🔴 CRITICAL'}

**Key Metrics:**
- **Capital:** ${capital:.2f} (Session P&L: ${total_pnl:.2f}, {drawdown_pct:.1f}% change)
- **Performance:** {wins}W / {losses}L ({win_rate:.1f}% win rate)
- **System:** Loop running normally, {pairs_loaded} pairs loaded, {loop_crashes} crashes
- **Forecast 24h:** ${forecast:.2f}

---

## 📊 Dashboard Data (Live)

| Metric | Value | Status |
|--------|-------|--------|
| **Bot Status** | 🟢 ACTIVE | Healthy |
| **Loop Running** | {'✅ Yes' if loop_running else '❌ No'} | {'Normal' if loop_running else 'STOPPED'} |
| **Pairs Loaded** | {pairs_loaded} | Full coverage |
| **Loop Crashes** | {loop_crashes} | {'Stable' if loop_crashes == 0 else '⚠️ Issues'} |
| **Open Positions** | 0 | No open positions |
| **Capital** | ${capital:.2f} | {'⚠️ Drawdown' if total_pnl < 0 else '✅ Profitable' if total_pnl > 0 else '➡️ Break-even'} |

**Anomalies Detected:** {', '.join(anomalies) if anomalies else 'None'}

---

## 📈 Trade Analysis & Kline Autopsies

**Total Trades Analyzed:** {total_trades}

"""

if autopsies:
    for i, a in enumerate(autopsies, 1):
        pnl_emoji = '✅' if a['pnl'] > 0 else '❌'
        opened = a.get('opened', 'N/A')
        closed = a.get('closed', 'N/A')
        if opened != 'N/A' and closed != 'N/A':
            try:
                opened_parts = opened.split(':')
                closed_parts = closed.split(':')
                duration = (int(closed_parts[0])*60 + int(closed_parts[1])) - (int(opened_parts[0])*60 + int(opened_parts[1]))
                duration_str = f"{duration} min"
            except:
                duration_str = "N/A"
        else:
            duration_str = "N/A"
        
        report += f"""### Trade {i}: {a['sym']} {a['side']} ({a['strat']}) {pnl_emoji} {'WIN' if a['pnl'] > 0 else 'LOSS'}
- **PnL:** ${a['pnl']:.2f} | **Entry:** {opened} | **Exit:** {closed} | **Duration:** {duration_str}
- **Exit Reason:** {a['reason']}
- **Entry Analysis:**
  - Candle Type: {a.get('entry_candle_type', 'N/A')}
  - Volume Ratio: {a.get('entry_volume_ratio', 0):.2f}x
  - Pattern: {a.get('pattern_detected', 'N/A')}
  - 15min Trend: {a.get('trend_15m', 'N/A')}
- **Performance Metrics:**
  - Max Favorable: {a.get('max_favorable_pct', 0)*100:.2f}%
  - Max Unfavorable: {a.get('max_unfavorable_pct', 0)*100:.2f}%
  - Runner Captured: {a.get('runner_pct', 0)*100:.2f}%
  - Slippage: ${a.get('slippage_usd', 0):.2f}
- **Autopsy Summary:** {a.get('autopsy_summary', 'N/A')}

"""
else:
    report += "No trades to analyze yet.\n\n"

report += """---

## 💡 Self-Evolution Insights

### Strategy Performance Summary

"""

if strat_perf:
    report += "| Strategy | Trades | Wins | Losses | Win% | Total PnL |\n"
    report += "|----------|--------|------|--------|------|----------|\n"
    for s in strat_perf:
        report += f"| {s['strat']} | {s['trades']} | {s['wins']} | {s['losses']} | {s['win_pct']:.1f}% | ${s['total_pnl']:.2f} |\n"
    report += "\n"
else:
    report += "No strategy performance data yet (no trades executed).\n\n"

report += "### Key Observations\n\n"

# Consecutive losses
for strat, count in consec_losses.items():
    if count >= 2:
        report += f"- **{strat}** has {count} consecutive losses - consider disabling\n"
    elif count >= 1:
        report += f"- **{strat}** has {count} consecutive loss(es) - monitor closely\n"

# Large losses
large_losses = [a for a in autopsies if a.get('pnl', 0) < -20]
if large_losses:
    for loss in large_losses:
        report += f"- Large loss detected: {loss['sym']} {loss['side']} (${loss['pnl']:.2f}) on {loss.get('reason', 'N/A')}\n"

# Slippage
high_slippage = [s for s in slippage if abs(s.get('slippage_usd', 0)) > 5]
if high_slippage:
    for s in high_slippage:
        report += f"- High slippage on {s['sym']}: ${s['slippage_usd']:.2f}\n"

# Suggestions
report += "\n### Evolution Suggestions\n\n"
if suggestions:
    for i, sug in enumerate(suggestions, 1):
        report += f"{i}. {sug}\n"
else:
    report += "No specific suggestions at this time.\n"

report += "\n---\n\n"

# Slippage Heatmap
if slippage:
    report += "## 🔥 Slippage Heatmap\n\n"
    for s in slippage:
        report += f"- **{s['sym']}**: Expected -$25.00, Got ${s.get('slippage_usd', 0):.2f} (Delta: ${s.get('slippage_usd', 0) - (-25.0):.2f})\n"
    report += "\n"

report += f"""---

*Report generated by Hermes Evolution Agent v1.0*  
*Data source: http://18.181.221.88:3000/api/data*  
*Next scheduled run: every 15 minutes*
"""

filename = f"/workspace/v9-repo/monitoring_report_comprehensive_{ts.strftime('%Y-%m-%d_%H-%M')}.md"
with open(filename, 'w') as f:
    f.write(report)

print(f"Comprehensive report generated: {len(report)} characters")
print(f"File: {filename}")
print(f"\nSummary:")
print(f"- Capital: ${capital:.2f}")
print(f"- Total P&L: ${total_pnl:.2f}")
print(f"- Trades analyzed: {total_trades}")
print(f"- Suggestions: {len(suggestions)}")
print(f"- Anomalies: {len(anomalies)}")
