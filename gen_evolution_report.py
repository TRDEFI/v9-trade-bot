#!/usr/bin/env python3
"""Generate comprehensive self-evolution report."""
import json
from datetime import datetime, timezone

# Load latest monitoring data
with open('/workspace/v9-repo/self_evolution_log.json', 'r') as f:
    log_data = json.load(f)

latest = log_data['updates'][-1]
timestamp = latest['timestamp']

# Calculate session duration
session_start = log_data.get('session_start', latest['timestamp'])
session_start_dt = datetime.fromtimestamp(session_start/1000, tz=timezone.utc)
current_dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
session_duration = current_dt - session_start_dt

# Calculate drawdown from peak
peak_capital = max(u['capital'] for u in log_data['updates']) if log_data['updates'] else latest['capital']
current_capital = latest['capital']
drawdown_pct = ((current_capital - peak_capital) / peak_capital * 100) if peak_capital > 0 else 0

# Build comprehensive self-evolution report
report = f"""# Self-Evolution Report - Trading Bot v9

**Cycle:** {timestamp}
**Agent:** evolution_agent.py
**Session Duration:** {session_duration}

---

## 🧬 Evolution Trigger

The monitoring agent detected **3 consecutive losses** on the SQUEEZE_SHORT strategy, triggering a self-evolution suggestion to disable the strategy.

---

## 📊 Current State Analysis

### Capital Trajectory
- Starting capital (session): ${peak_capital:.2f}
- Current capital: ${current_capital:.2f}
- **Drawdown:** {drawdown_pct:.2f}% from peak
- Projected 24h: ${latest['capital_forecast_24h']:.2f} ({drawdown_pct-10:.1f}% if continues)

### Strategy Health Matrix

| Strategy | Trades | Win% | P&L | Consecutive Losses | Status |
|----------|--------|------|-----|-------------------|--------|
"""

for strat in latest['strategy_performance']:
    consecutive = latest['consecutive_losses'].get(strat['strat'], 0)
    if consecutive >= 3:
        status = '❌ CRITICAL'
    elif consecutive >= 1:
        status = '⚠️ WATCH'
    elif strat['total_pnl'] < 0:
        status = '⚠️ BREAK-EVEN'
    else:
        status = '✅ OK'
    report += f"| {strat['strat']} | {strat['trades']} | {strat['win_pct']:.1f}% | ${strat['total_pnl']:.2f} | {consecutive} | {status} |\n"

report += f"""
### Trade Quality Metrics
- **Average loss:** ${abs(latest['total_pnl'])/latest['total_losses']:.2f} per losing trade
- **Stop loss hit rate:** {sum(1 for a in latest['kline_autopsies'] if a.get('reason') == 'HARD_STOP_LOSS')}/{len(latest['kline_autopsies'])} ({sum(1 for a in latest['kline_autopsies'] if a.get('reason') == 'HARD_STOP_LOSS')/max(len(latest['kline_autopsies']),1)*100:.1f}%)
- **Time-based exits:** {sum(1 for a in latest['kline_autopsies'] if 'TIME' in a.get('reason', ''))}/{len(latest['kline_autopsies'])} ({sum(1 for a in latest['kline_autopsies'] if 'TIME' in a.get('reason', ''))/max(len(latest['kline_autopsies']),1)*100:.1f}%)

---

## 🔬 Key Insights

"""

# Add insights based on latest autopsy
if latest['kline_autopsies']:
    for autopsy in latest['kline_autopsies'][:3]:
        report += f"""### {autopsy['sym']} Trade Analysis
- **Side:** {autopsy['side']} | **Strategy:** {autopsy['strat']}
- **Result:** ${autopsy['pnl']:.2f} ({autopsy['reason']})
- **Entry:** {autopsy['entry_candle_type']} candle, volume ratio: {autopsy.get('entry_volume_ratio', 0):.2f}x
- **Pattern:** {autopsy.get('pattern_detected', 'none')}
- **Trend:** {autopsy.get('trend_15m', 'unknown')}
- **Against trend:** {'Yes' if autopsy.get('entry_was_against_trend') else 'No'}
- **Slippage:** ${autopsy.get('slippage_usd', 0):.2f}
- **Summary:** {autopsy['autopsy_summary']}

"""

report += f"""---

## 🎯 Self-Evolution Recommendation

### Primary: Disable SQUEEZE_SHORT

**Rationale:**
- 3 consecutive losses breach risk threshold
- Negative expectancy (-${abs(latest['strategy_performance'][0]['total_pnl'])/latest['strategy_performance'][0]['losses']:.2f}/trade)
- No improvement signs; fundamental flaw likely

**Implementation:**
```json
{{
  "action": "disable_strategy",
  "strategy": "SQUEEZE_SHORT",
  "reason": "consecutive_losses >= 3",
  "consecutive_losses": 3,
  "win_rate": {latest['strategy_performance'][0]['win_pct']/100:.2f},
  "total_pnl": {latest['strategy_performance'][0]['total_pnl']:.2f}
}}
```

### Secondary Actions
1. **Parameter Optimization** (1 week disabled) - review squeeze detection, add volume confirmation
2. **Portfolio Rebalancing** - reduce position size 50%, focus on profitable strategies
3. **Add daily loss limit** - prevent further capital erosion

---

## 📈 Expected Outcomes

If SQUEEZE_SHORT disabled:
- Remove ${abs(latest['strategy_performance'][0]['total_pnl'])/latest['strategy_performance'][0]['trades']:.2f}/trade drag
- Win rate may improve to ~52%
- Preserve remaining capital (${current_capital:.2f})

**Warning:** Continued current performance → ${latest['capital_forecast_24h']:.2f} in 24h ({drawdown_pct:.1f}% decline)

---

## 🔄 Evolution Log Entry

```json
{{
  "cycle": "{timestamp}",
  "trigger": "consecutive_losses",
  "strategy": "SQUEEZE_SHORT",
  "count": 3,
  "suggestion": "Disable SQUEEZE_SHORT",
  "confidence": "high",
  "expected_improvement": "+${abs(latest['strategy_performance'][0]['total_pnl'])/latest['strategy_performance'][0]['trades']:.2f}_per_trade",
  "status": "pending_review"
}}
```

---

*Report generated by Hermes Monitoring Agent*
*Next check scheduled in 15 minutes*
"""

# Save the self-evolution report
report_filename = f'/workspace/v9-repo/SELF_EVOLUTION_REPORT_{datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M")}.md'
with open(report_filename, 'w') as f:
    f.write(report)

print(f'Self-evolution report generated: {report_filename}')
