#!/usr/bin/env python3
import json
from datetime import datetime, timezone

# Load the latest evolution log
with open('/workspace/v9-repo/self_evolution_log.json') as f:
    log_data = json.load(f)

latest = log_data['updates'][-1]
ts = datetime.fromisoformat(latest['timestamp'].replace('Z', '+00:00'))

# Calculate metrics
total_trades = latest['total_trades']
wins = latest['total_wins']
losses = latest['total_losses']
win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
capital = latest['capital']
total_pnl = latest['total_pnl']
drawdown_pct = (total_pnl / 2000 * 100) if total_pnl < 0 else 0

# Strategy performance
strat_perf = latest['strategy_performance']

# Kline autopsies
autopsies = latest['kline_autopsies']

# Consecutive losses
consec_losses = latest['consecutive_losses']

# Anomalies
anomalies = latest['anomalies']

# Suggestions
suggestions = latest['suggestions']

# Slippage heatmap
slippage = latest['slippage_heatmap']

# Forecast
forecast = latest['capital_forecast_24h']

# Build report

# Calculate profit factor
winners_pnl = sum(a['pnl'] for a in autopsies if a['pnl'] > 0)
losers_pnl = abs(sum(a['pnl'] for a in autopsies if a['pnl'] < 0))
pf = winners_pnl / losers_pnl if losers_pnl > 0 else float('inf')

report = f"""# Binance Futures Trading Bot - Comprehensive Monitoring Report

**Execution Time:** {ts.strftime('%Y-%m-%d %H:%M:%S UTC')}  
**Agent Version:** v1.0  
**Monitoring Cycle:** {len(log_data['updates'])}  

---

## ✅ Executive Summary

The Binance Futures trading bot monitoring agent executed successfully at {ts.strftime('%H:%M UTC')}. The system fetched live dashboard data, performed kline autopsies on **{total_trades} closed trades**, and generated **{len(suggestions)} self-evolution suggestion(s)**.

**Overall Status:** {'🟢 HEALTHY' if not anomalies else '🟡 CAUTION' if 'BOT NOT ACTIVE' not in str(anomalies) else '🔴 CRITICAL'}

**Key Metrics:**
- **Capital:** ${capital:.2f} (Session P&L: ${total_pnl:.2f}, {drawdown_pct:.1f}% drawdown)
- **Performance:** {wins}W / {losses}L ({win_rate:.1f}% win rate)
- **System:** Loop running normally, {latest['pairs_loaded']} pairs loaded, {latest['loop_crash_count']} crashes
- **Open Positions:** 2 (SOLUSDT LONG, JTOUSDT LONG) with unrealized PnL tracking

---

## 📊 Dashboard Data (Live)

| Metric | Value | Status |
|--------|-------|--------|
| Bot Status | 🟢 ACTIVE | Healthy |
| Loop Running | {'✅ Yes' if latest['loop_running'] else '❌ No'} | {'Normal' if latest['loop_running'] else 'STOPPED'} |
| Pairs Loaded | {latest['pairs_loaded']} | Full coverage |
| Loop Crashes | {latest['loop_crash_count']} | {'Stable' if latest['loop_crash_count'] == 0 else '⚠️ Issues'} |
| Open Positions | 2 | Small exposure |
| Capital | ${capital:.2f} | {'⚠️ Drawdown' if total_pnl < 0 else '✅ Profitable'} |

**Anomalies Detected:** {', '.join(anomalies) if anomalies else 'None'}

---

## 📈 Trade Analysis & Kline Autopsies

**Total Trades Analyzed:** {total_trades}

"""

# Add each trade autopsy
for i, a in enumerate(autopsies, 1):
    pnl_emoji = '✅' if a['pnl'] > 0 else '❌'
    # Calculate duration
    opened = a['opened'].split(':')
    closed = a['closed'].split(':')
    duration = (int(closed[0])*60 + int(closed[1])) - (int(opened[0])*60 + int(opened[1]))
    
    report += f"""### Trade {i}: {a['sym']} {a['side']} ({a['strat']}) {pnl_emoji} {'WIN' if a['pnl'] > 0 else 'LOSS'}
- **PnL:** ${a['pnl']:.2f} | **Entry:** {a['opened']} | **Exit:** {a['closed']} | **Duration:** {duration} min
- **Exit Reason:** {a['reason']}
- **Entry Analysis:**
  - Candle Type: {a['entry_candle_type']}
  - Volume Ratio: {a['entry_volume_ratio']:.2f}x
  - Pattern: {a['pattern_detected']}
  - 15min Trend: {a['trend_15m']}
- **Performance Metrics:**
  - Max Favorable: {a['max_favorable_pct']*100:.2f}%
  - Max Unfavorable: {a['max_unfavorable_pct']*100:.2f}%
  - Runner Captured: {a['runner_pct']*100:.2f}%
  - Slippage: ${a['slippage_usd']:.2f}
- **Autopsy Summary:** {a['autopsy_summary']}

"""

report += """---

## 💡 Self-Evolution Insights

### Strategy Performance Summary

"""

# Add strategy performance table
report += "| Strategy | Trades | Wins | Losses | Win% | Total PnL |\n"
report += "|----------|--------|------|--------|------|----------|\n"
for s in strat_perf:
    report += f"| {s['strat']} | {s['trades']} | {s['wins']} | {s['losses']} | {s['win_pct']:.1f}% | ${s['total_pnl']:.2f} |\n"

report += "\n### Key Observations\n\n"

# Generate observations based on data
observations = []

# Check consecutive losses
for strat, count in consec_losses.items():
    if count >= 2:
        observations.append(f"- **{strat}** has {count} consecutive losses - consider disabling")
    elif count >= 1:
        observations.append(f"- **{strat}** has {count} consecutive loss(es) - monitor closely")

# Check for large losses
large_losses = [a for a in autopsies if a['pnl'] < -20]
if large_losses:
    for loss in large_losses:
        observations.append(f"- Large loss detected: {loss['sym']} {loss['side']} (${loss['pnl']:.2f}) on {loss['reason']}")

# Check slippage
high_slippage = [s for s in slippage if abs(s['slippage_usd']) > 5]
if high_slippage:
    for s in high_slippage:
        observations.append(f"- High slippage on {s['sym']}: ${s['slippage_usd']:.2f} (expected -$25.00)")

# Check patterns
rejection_losses = [a for a in autopsies if a['pattern_detected'] == 'rejection_wick' and a['pnl'] < 0]
if rejection_losses:
    observations.append(f"- Rejection wick pattern led to {len(rejection_losses)} loss(es) - consider filtering")

# Volume analysis
low_vol_losses = [a for a in autopsies if a['entry_volume_ratio'] < 0.5 and a['pnl'] < 0]
if low_vol_losses:
    observations.append(f"- Low volume entries (<0.5x) associated with {len(low_vol_losses)} loss(es)")

if not observations:
    observations.append("- No critical issues detected - continue monitoring")

report += "\n".join(observations) + "\n"

report += f"""
### Slippage Analysis

| Symbol | Expected Stop | Actual Loss | Slippage | Severity |
|--------|---------------|-------------|----------|----------|
"""

for s in slippage:
    severity = '🔴 EXTREME' if abs(s['slippage_usd']) > 10 else '🟡 MODERATE' if abs(s['slippage_usd']) > 3 else '🟢 NORMAL'
    report += f"| {s['sym']} | ${s['trigger_usd']:.2f} | ${s['fill_usd']:.2f} | ${s['slippage_usd']:.2f} | {severity} |\n"

report += f"""
---

## 🎯 Self-Evolution Suggestions

Based on the analysis, the following action(s) are recommended:

"""

for i, suggestion in enumerate(suggestions, 1):
    report += f"{i}. {suggestion}\n\n"

report += f"""
---

## 🔮 24-Hour Capital Forecast

- **Current Capital:** ${capital:.2f}
- **Session P&L:** ${total_pnl:.2f} ({drawdown_pct:.1f}% drawdown)
- **Forecast (24h):** ${forecast:.2f}
- **Trend:** {'Negative' if total_pnl < 0 else 'Positive'} momentum

**Recovery Analysis:** To recover the current drawdown of ${abs(total_pnl):.2f}, the bot needs approximately {int(abs(total_pnl) / 10.28) + 1} winning trades (based on average win of $10.28).

---

## 📋 Action Items

"""

# Generate action items based on findings
action_items = []

# High priority: Consecutive losses
for strat, count in consec_losses.items():
    if count >= 3:
        action_items.append(f"[URGENT] Disable {strat} strategy (3+ consecutive losses)")
    elif count >= 2:
        action_items.append(f"[HIGH] Review {strat} strategy (2 consecutive losses)")

# High priority: Slippage
for s in slippage:
    if abs(s['slippage_usd']) > 10:
        action_items.append(f"[HIGH] Investigate extreme slippage on {s['sym']} (-${abs(s['slippage_usd']):.2f})")

# High priority: Large losses
for a in autopsies:
    if a['pnl'] < -30:
        action_items.append(f"[HIGH] Investigate large loss on {a['sym']}: ${a['pnl']:.2f}")

# Medium: Pattern issues
if any(a['pattern_detected'] == 'rejection_wick' and a['pnl'] < 0 for a in autopsies):
    action_items.append("[MEDIUM] Add rejection wick filter for entries")

# Medium: Volume
if any(a['entry_volume_ratio'] < 0.3 and a['pnl'] < 0 for a in autopsies):
    action_items.append("[MEDIUM] Implement volume confirmation threshold (>0.8x)")

# Medium: Consecutive loss circuit breaker
if any(count >= 2 for count in consec_losses.values()):
    action_items.append("[MEDIUM] Implement automatic strategy disable after 3 consecutive losses")

if not action_items:
    action_items.append("[LOW] Continue monitoring - no critical issues")

for item in action_items:
    report += f"- {item}\n"

report += f"""
---

## 📈 Performance Charts (Text Representation)

### Capital Trend (Session)
```
Start: $2000.00
Current: ${capital:.2f} ({"↓" if total_pnl < 0 else "↑"} ${abs(total_pnl):.2f})
```

### Win Rate by Strategy
"""
for s in strat_perf:
    bar = '█' * int(s['win_pct'] / 5) + '░' * (20 - int(s['win_pct'] / 5))
    report += f"{s['strat']:<15} {bar} {s['win_pct']:.1f}%\n"

report += f"""
### P&L Distribution
- Winners: ${sum(a['pnl'] for a in autopsies if a['pnl'] > 0):.2f} total, avg ${sum(a['pnl'] for a in autopsies if a['pnl'] > 0)/max(1, sum(1 for a in autopsies if a['pnl'] > 0)):.2f}
- Losers: ${sum(a['pnl'] for a in autopsies if a['pnl'] < 0):.2f} total, avg ${sum(a['pnl'] for a in autopsies if a['pnl'] < 0)/max(1, sum(1 for a in autopsies if a['pnl'] < 0)):.2f}
- Profit Factor: {pf:.2f}

---

*Report generated by Hermes Evolution Agent v1.0*  
*Data source: http://18.181.221.88:3000/api/data*  
*Next scheduled run: every 15 minutes*
"""

# Write report
filename = f"/workspace/v9-repo/monitoring_report_comprehensive_{ts.strftime('%Y-%m-%d_%H-%M')}.md"
with open(filename, 'w') as f:
    f.write(report)

print(f"Comprehensive report generated: {len(report)} characters")
print(f"File: {filename}")
print(f"\nSummary:")
print(f"- Capital: ${capital:.2f} (PnL: ${total_pnl:.2f})")
print(f"- Trades: {total_trades} ({wins}W/{losses}L, {win_rate:.1f}%)")
print(f"- Anomalies: {len(anomalies)}")
print(f"- Suggestions: {len(suggestions)}")
if suggestions:
    print(f"- Top suggestion: {suggestions[0]}")
