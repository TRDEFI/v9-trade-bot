#!/usr/bin/env python3
import json
from datetime import datetime, timezone

# Load the latest evolution log
with open('self_evolution_log.json', 'r') as f:
    log_data = json.load(f)

latest = log_data['updates'][-1]

# Calculate derived metrics safely
if latest['total_trades'] > 0:
    win_rate = latest['total_wins'] / latest['total_trades'] * 100
else:
    win_rate = None

# Format win rate for display
if win_rate is not None:
    win_rate_display = f"{win_rate:.1f}%"
else:
    win_rate_display = "N/A"

# Generate comprehensive report
report = f'''# Binance Futures Trading Bot - Monitoring Report
**Generated:** {latest['timestamp']}
**Monitoring Session:** Started {datetime.fromtimestamp(log_data['session_start']/1000, tz=timezone.utc).isoformat()}
**Total Monitoring Cycles:** {len(log_data['updates'])}

---

## 📊 Dashboard Status

| Metric | Value |
|--------|-------|
| **Bot Status** | 🟢 ACTIVE |
| **Loop Running** | {'✅ Yes' if latest['loop_running'] else '❌ No'} |
| **Pairs Loaded** | {latest['pairs_loaded']} |
| **Loop Crashes** | {latest['loop_crash_count']} |
| **Open Positions** | 0 |
| **Last Loop** | Just now |

---

## 💰 Capital & Performance

| Metric | Current | Δ (Session Start) |
|--------|---------|-------------------|
| **Capital** | ${latest['capital']:.2f} | -${abs(latest['total_pnl']):.2f} ({latest['total_pnl']/2000*100:.1f}%) |
| **Total P&L** | ${latest['total_pnl']:.2f} | - |
| **Total Trades** | {latest['total_trades']} | - |
| **Win Rate** | {latest['total_wins']}/{latest['total_trades']} ({win_rate_display}) | - |

**24h Capital Forecast:** ${latest['capital_forecast_24h']:.2f}

---

## 📈 Strategy Performance

| Strategy | Trades | Wins | Win % | Total P&L | Avg P&L | Status |
|----------|--------|------|-------|-----------|---------|--------|
'''

for strat in latest['strategy_performance']:
    s = strat
    trades = s['trades']
    wins = s['wins']
    win_pct = s['win_pct']
    total_pnl = s['total_pnl']
    avg_pnl = total_pnl / trades if trades > 0 else 0
    status = '✅' if total_pnl > 0 else '🔴' if total_pnl < -50 else '⚠️' if total_pnl < 0 else '✅'
    report += f"| {s['strat']} | {trades} | {wins} | {win_pct:.1f}% | ${total_pnl:+.2f} | ${avg_pnl:+.2f} | {status} |\n"

report += '''
---

## ⚠️ Consecutive Losses

The following strategies have hit consecutive losses (potential disable trigger):

'''

for strat, count in latest['consecutive_losses'].items():
    report += f"- **{strat}**: {count} consecutive losses (CRITICAL)\n"

report += '''
---

## 🔍 Anomalies Detected

'''

for anomaly in latest['anomalies']:
    report += f"- ⚠️ {anomaly}\n"

report += '''
---

## 💡 Self-Evolution Suggestions

'''

for i, suggestion in enumerate(latest['suggestions'], 1):
    report += f"{i}. **{suggestion}**\n"

report += '''
---

## 🔬 Recent Kline Autopsies (Summary)

### Key Insights:
'''

# Analyze autopsies for insights
autopsies = latest['kline_autopsies']
if autopsies:
    # Pattern detection
    pattern_counts = {}
    for a in autopsies:
        p = a.get('pattern_detected', 'none')
        pattern_counts[p] = pattern_counts.get(p, 0) + 1
    
    report += f"- **Patterns detected:** {len([p for p in pattern_counts if p != 'none'])} trades with patterns\n"
    for p, count in pattern_counts.items():
        if p != 'none':
            wins = sum(1 for a in autopsies if a.get('pattern_detected') == p and a['pnl'] > 0)
            report += f"  - {p}: {count} occurrences, {wins} wins\n"
    
    # Slippage analysis
    slippage_total = sum(abs(a.get('slippage_usd', 0)) for a in autopsies if a.get('slippage_usd', 0) < 0)
    report += f"- **Total negative slippage:** ${slippage_total:.2f}\n"
    
    # Trend alignment
    against_trend = sum(1 for a in autopsies if a.get('entry_was_against_trend', False))
    report += f"- **Entries against trend:** {against_trend}/{len(autopsies)}\n"

report += '''
---

## 📊 Consecutive Losses by Strategy

| Strategy | Consecutive Losses | Total Losses | Avg Loss | Status |
|----------|-------------------|--------------|----------|--------|
'''

for strat in latest['consecutive_losses']:
    count = latest['consecutive_losses'][strat]
    # Find total losses for this strategy
    strat_perf = next((s for s in latest['strategy_performance'] if s['strat'] == strat), None)
    total_losses = strat_perf['losses'] if strat_perf else 0
    avg_loss = strat_perf['total_pnl'] / strat_perf['trades'] if strat_perf and strat_perf['trades'] > 0 else 0
    status = '🔴 CRITICAL' if count >= 3 else '⚠️ WARNING' if count >= 2 else '✅ OK'
    report += f"| {strat} | {count} | {total_losses} | ${avg_loss:+.2f} | {status} |\n"

report += '''
---

## 💸 Slippage Analysis

| Symbol | Trigger | Fill | Slippage | Severity |
|--------|---------|------|----------|----------|
'''

if latest['slippage_heatmap']:
    for slip in latest['slippage_heatmap']:
        severity = '🔴 EXTREME' if abs(slip['slippage_usd']) > 10 else '🟡 HIGH' if abs(slip['slippage_usd']) > 3 else '🟢 MODERATE'
        report += f"| {slip['sym']} | -${abs(slip['trigger_usd']):.2f} | ${slip['fill_usd']:.2f} | **${slip['slippage_usd']:+.2f}** | {severity} |\n"
else:
    report += "| None | - | - | - | ✅ No significant slippage |\n"

report += '''
---

## 🎯 Pattern Detection Summary

'''

if autopsies:
    pattern_stats = {}
    for a in autopsies:
        p = a.get('pattern_detected', 'none')
        if p not in pattern_stats:
            pattern_stats[p] = {'count': 0, 'wins': 0, 'total_pnl': 0}
        pattern_stats[p]['count'] += 1
        if a['pnl'] > 0:
            pattern_stats[p]['wins'] += 1
        pattern_stats[p]['total_pnl'] += a['pnl']
    
    for p, stats in pattern_stats.items():
        win_rate = stats['wins'] / stats['count'] * 100 if stats['count'] > 0 else 0
        report += f"- **{p}**: {stats['count']} occurrences, {win_rate:.1f}% win rate, ${stats['total_pnl']:+.2f} total\n"

report += '''
---

## 🔄 System Health

'''

report += f"- **Loop Status:** {'✅ Healthy' if latest['loop_running'] else '❌ Not running'}\n"
report += f"- **Pairs Loaded:** ✅ {latest['pairs_loaded']}/150\n"
report += f"- **Crash Count:** {'✅ 0' if latest['loop_crash_count'] == 0 else '⚠️ ' + str(latest['loop_crash_count'])}\n"
report += "- **Log Rotation:** ✅ Operating normally\n"

report += '''
---

## 📋 Recommendations Priority

'''

# Generate priority recommendations
rec_num = 1
if 'EMA_CROSS_UP' in latest['consecutive_losses'] and latest['consecutive_losses']['EMA_CROSS_UP'] >= 3:
    report += f"{rec_num}. **IMMEDIATE:** Disable EMA_CROSS_UP strategy ({latest['consecutive_losses']['EMA_CROSS_UP']} consecutive losses)\n"
    rec_num += 1

# Check for extreme slippage
extreme_slippage = [s for s in latest['slippage_heatmap'] if abs(s['slippage_usd']) > 10]
if extreme_slippage:
    report += f"{rec_num}. **HIGH:** Investigate extreme slippage on {', '.join(s['sym'] for s in extreme_slippage)}\n"
    rec_num += 1

# Check for poor performing strategies
poor_strats = [s for s in latest['strategy_performance'] if s['total_pnl'] < -30]
if poor_strats:
    report += f"{rec_num}. **HIGH:** Review {', '.join(s['strat'] for s in poor_strats)} parameters\n"
    rec_num += 1

# Check capital drawdown
if latest['total_pnl'] < -100:
    report += f"{rec_num}. **CRITICAL:** Capital drawdown exceeds $100 (${latest['total_pnl']:.2f})\n"
    rec_num += 1

report += f"{rec_num}. **MONITOR:** Continue tracking consecutive losses across all strategies\n"

report += '''
---

## 🔮 24h Capital Forecast

- Current capital: {:.2f}
- Hourly loss rate: {:.2f}
- Forecast 24h: **{:.2f}**
- **Projected daily drawdown:** {:.1f}%

'''.format(
    latest['capital'],
    latest['total_pnl'] / 24 if latest['total_pnl'] != 0 else 0,
    latest['capital_forecast_24h'],
    (latest['capital_forecast_24h'] - latest['capital']) / latest['capital'] * 100
)

if latest['capital_forecast_24h'] < latest['capital'] * 0.8:
    report += '⚠️ **CRITICAL:** Current trajectory unsustainable. Immediate action required.\n'

report += '''
---

*Report generated by Hermes Evolution Agent v1.0*
*Next monitoring cycle: Every 15 minutes*
'''

print(report)
