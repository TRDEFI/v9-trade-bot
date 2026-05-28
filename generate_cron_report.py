#!/usr/bin/env python3
"""
Generate comprehensive monitoring report with self-evolution analysis.
"""
import json
import os
import sys
from datetime import datetime, timezone

WORKDIR = "/workspace/v9-repo"
STATE_FILE = "/workspace/monitor_state.json"
LOG_FILE = os.path.join(WORKDIR, "self_evolution_log.json")
DASHBOARD_URL = "http://18.181.221.88:3000/api/data"

def load_json(path):
    if os.path.exists(path):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading {path}: {e}")
    return {}

def main():
    now = datetime.now(timezone.utc)
    timestamp = now.strftime("%Y-%m-%d_%H-%M")
    
    # Fetch dashboard
    import requests
    try:
        resp = requests.get(DASHBOARD_URL, timeout=15)
        dashboard = resp.json()
    except Exception as e:
        print(f"Failed to fetch dashboard: {e}")
        sys.exit(1)
    
    state = load_json(STATE_FILE)
    log_data = load_json(LOG_FILE)
    
    # Parse dashboard data
    capital = dashboard.get("capital", 0)
    total_trades = dashboard.get("total_trades", 0)
    total_wins = dashboard.get("total_wins", 0)
    total_losses = dashboard.get("total_losses", 0)
    total_pnl = dashboard.get("total_pnl", 0)
    is_active = dashboard.get("is_active", False)
    loop_running = dashboard.get("loop_running", False)
    loop_crash_count = dashboard.get("loop_crash_count", 0)
    pairs_loaded = dashboard.get("pairs_loaded", 0)
    session_start = dashboard.get("session_start", 0)
    elapsed = dashboard.get("elapsed", "unknown")
    used_capital = dashboard.get("used_capital", 0)
    unrealized_pnl = dashboard.get("unrealized_pnl", 0)
    
    opens = dashboard.get("opens", [])
    closed = dashboard.get("closed", [])
    system_logs = dashboard.get("system_logs", [])
    
    # Calculate metrics
    win_rate = (total_wins / total_trades * 100) if total_trades > 0 else 0
    avg_win = sum(t.get("pnl", 0) for t in closed if t.get("pnl", 0) > 0) / total_wins if total_wins > 0 else 0
    avg_loss = sum(t.get("pnl", 0) for t in closed if t.get("pnl", 0) < 0) / total_losses if total_losses > 0 else 0
    
    # Strategy breakdown
    strategies = {}
    for t in closed:
        strat = t.get("strat", "UNKNOWN")
        if strat not in strategies:
            strategies[strat] = {"trades": 0, "wins": 0, "losses": 0, "total_pnl": 0}
        strategies[strat]["trades"] += 1
        if t.get("pnl", 0) > 0:
            strategies[strat]["wins"] += 1
        else:
            strategies[strat]["losses"] += 1
        strategies[strat]["total_pnl"] += t.get("pnl", 0)
    
    # Consecutive losses from state
    consecutive_losses = state.get("consecutive_losses", {})
    
    # Anomalies
    anomalies = []
    if not is_active:
        anomalies.append("CRITICAL: Bot is NOT active")
    if not loop_running:
        anomalies.append("CRITICAL: Bot loop is STOPPED")
    if loop_crash_count > 0:
        anomalies.append(f"WARNING: {loop_crash_count} loop crashes detected")
    if pairs_loaded == 0:
        anomalies.append("CRITICAL: No pairs loaded - scanning broken")
    if win_rate < 35 and total_trades >= 10:
        anomalies.append(f"WARNING: Win rate {win_rate:.1f}% is critically low")
    if total_pnl < -100:
        anomalies.append(f"WARNING: Total loss ${abs(total_pnl):.2f} exceeds threshold")
    for strat, count in consecutive_losses.items():
        if count >= 3:
            anomalies.append(f"WARNING: {strat} has {count} consecutive losses")
    
    # Self-evolution suggestions
    suggestions = []
    for strat, count in consecutive_losses.items():
        if count >= 4:
            suggestions.append(f"DISABLE {strat} immediately — {count} consecutive losses, maximum risk threshold breached")
        elif count >= 3:
            suggestions.append(f"REDUCE position size for {strat} by 50% — {count} consecutive losses indicate strategy failure")
    
    # Check for large losses
    large_losses = [t for t in closed if t.get("pnl", 0) < -40]
    if large_losses:
        suggestions.append(f"Review stop-loss calibration — {len(large_losses)} trades lost >$40, slippage may be excessive")
    
    # Check unrealized
    if unrealized_pnl < -20:
        suggestions.append("Consider closing open position XRPUSDT — unrealized loss approaching stop threshold")
    
    # Trend conflict check
    trend_conflicts = 0
    for t in closed:
        if t.get("reason") == "HARD_STOP_LOSS":
            trend_conflicts += 1
    if trend_conflicts > 5:
        suggestions.append("Add trend-filter gate to prevent entries against dominant trend direction")
    
    if not suggestions:
        suggestions.append("Continue monitoring — no critical strategy failures detected this cycle")
    
    # Build report
    report = f"""# Binance Futures Bot Monitoring Report
**Generated:** {timestamp} UTC  
**Session Elapsed:** {elapsed}  
**Cron Run #:** {state.get('run_count', 0) + 1}

---

## 📊 Dashboard Summary

| Metric | Value |
|--------|-------|
| **Capital** | ${capital:,.2f} |
| **Used Capital** | ${used_capital:,.2f} |
| **Unrealized P&L** | ${unrealized_pnl:,.2f} |
| **Total Trades** | {total_trades} |
| **Wins / Losses** | {total_wins} / {total_losses} |
| **Win Rate** | {win_rate:.1f}% |
| **Total P&L** | ${total_pnl:,.2f} |
| **Avg Win** | ${avg_win:,.2f} |
| **Avg Loss** | ${avg_loss:,.2f} |
| **Bot Active** | {'✅ Yes' if is_active else '❌ NO'} |
| **Loop Running** | {'✅ Yes' if loop_running else '❌ NO'} |
| **Loop Crashes** | {loop_crash_count} |
| **Pairs Loaded** | {pairs_loaded} |

---

## 📈 Open Positions

"""
    if opens:
        for o in opens:
            report += f"- **{o['sym']}** {o['side']} @ ${o['entry']} | P&L: ${o['pnl_usd']:,.2f} ({o['pnl_pct']:.1f}%) | ATR: {o['atr_pct']:.2f}% | t15={o['trend_15m']} t1h={o['trend_1h']}\n"
    else:
        report += "No open positions.\n"
    
    report += "\n---\n\n## 🔄 Recent Closed Trades (Last 10)\n\n"
    recent = closed[:10]
    for t in recent:
        pnl_emoji = "✅" if t.get("pnl", 0) > 0 else "❌"
        report += f"- {pnl_emoji} **{t['sym']}** {t['side']} [{t['strat']}] → {t['reason']} | P&L: ${t['pnl']:,.2f}\n"
    
    report += "\n---\n\n## 🧠 Strategy Performance\n\n"
    report += "| Strategy | Trades | Wins | Losses | Win % | Total P&L |\n"
    report += "|----------|--------|------|--------|-------|----------|\n"
    for strat, data in sorted(strategies.items(), key=lambda x: x[1]["total_pnl"]):
        wp = (data["wins"] / data["trades"] * 100) if data["trades"] > 0 else 0
        report += f"| {strat} | {data['trades']} | {data['wins']} | {data['losses']} | {wp:.0f}% | ${data['total_pnl']:,.2f} |\n"
    
    report += "\n---\n\n## ⚠️ Anomalies & Risk Flags\n\n"
    if anomalies:
        for a in anomalies:
            report += f"- {a}\n"
    else:
        report += "- No anomalies detected.\n"
    
    report += "\n---\n\n## 🧬 Self-Evolution Suggestions\n\n"
    for i, s in enumerate(suggestions, 1):
        report += f"{i}. {s}\n"
    
    report += "\n---\n\n## 📋 Consecutive Loss Tracking\n\n"
    if consecutive_losses:
        for strat, count in consecutive_losses.items():
            status = "🔴 CRITICAL" if count >= 4 else "🟡 WARNING" if count >= 3 else "🟢 OK"
            report += f"- **{strat}**: {count} consecutive losses — {status}\n"
    else:
        report += "- No consecutive losses tracked.\n"
    
    # Slippage data
    slippage = state.get("slippage_data", {})
    if slippage:
        report += "\n---\n\n## 💧 Slippage Analysis\n\n"
        report += "| Symbol | Trigger | Fill | Slippage |\n"
        report += "|--------|---------|------|----------|\n"
        for sym, entries in slippage.items():
            for e in entries[-3:]:
                report += f"| {sym} | ${e['trigger']:,.2f} | ${e['fill']:,.2f} | ${e['slippage']:,.2f} |\n"
    
    report += f"\n---\n\n*Report generated by evolution_agent.py | State file: {STATE_FILE}*\n"
    
    # Save report
    report_path = os.path.join(WORKDIR, f"MONITORING_REPORT_CRON_{timestamp}.md")
    with open(report_path, 'w') as f:
        f.write(report)
    
    # Also update latest
    latest_path = os.path.join(WORKDIR, "MONITORING_REPORT_CRON_LATEST.md")
    with open(latest_path, 'w') as f:
        f.write(report)
    
    print(f"Report saved: {report_path}")
    print(f"Latest updated: {latest_path}")
    print(f"\nSummary: Capital=${capital:,.2f} | P&L=${total_pnl:,.2f} | WinRate={win_rate:.1f}% | Trades={total_trades}")
    print(f"Anomalies: {len(anomalies)} | Suggestions: {len(suggestions)}")
    
    # Update run count
    state["run_count"] = state.get("run_count", 0) + 1
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

if __name__ == "__main__":
    main()
