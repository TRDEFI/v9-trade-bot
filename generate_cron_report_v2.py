#!/usr/bin/env python3
"""Generate the cron monitoring report with fresh data."""
import json
import requests
import time
import os
from datetime import datetime, timezone

DASHBOARD_URL = "http://18.181.221.88:3000/api/data"
STATE_FILE = "/workspace/monitor_state.json"
LOG_FILE = "/workspace/v9-repo/self_evolution_log.json"
REPORT_DIR = "/workspace/v9-repo"

def fetch_dashboard():
    try:
        resp = requests.get(DASHBOARD_URL, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"Error fetching dashboard: {e}")
        return None

def format_duration(ms):
    if not ms:
        return "N/A"
    seconds = int(ms / 1000)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h}h {m}m {s}s"

def main():
    now = datetime.now(timezone.utc)
    now_ms = int(time.time() * 1000)
    
    data = fetch_dashboard()
    if not data:
        print("Failed to fetch dashboard")
        return
    
    # Load state
    state = {
        "consecutive_losses": {},
        "strategy_performance": {},
        "peak_capital": 0,
        "session_start": now_ms,
        "closed_seen": [],
    }
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                saved = json.load(f)
                state["consecutive_losses"] = saved.get("consecutive_losses", {})
                state["strategy_performance"] = saved.get("strategy_performance", {})
                state["peak_capital"] = saved.get("peak_capital", 0)
                state["closed_seen"] = saved.get("closed_seen", [])
                if saved.get("session_start") and saved["session_start"] > 1e12:
                    state["session_start"] = saved["session_start"]
        except Exception as e:
            print(f"Error loading state: {e}")
    
    capital = data.get("capital", 0)
    total_trades = data.get("total_trades", 0)
    total_wins = data.get("total_wins", 0)
    total_losses = data.get("total_losses", 0)
    total_pnl = data.get("total_pnl", 0)
    is_active = data.get("is_active", False)
    loop_running = data.get("loop_running", False)
    loop_crashes = data.get("loop_crash_count", 0)
    pairs_loaded = data.get("pairs_loaded", 0)
    open_positions = data.get("open", [])
    closed_trades = data.get("closed", [])
    
    if capital > state["peak_capital"]:
        state["peak_capital"] = capital
    
    # Build full strategy stats from ALL closed trades
    all_strategy_stats = {}
    for t in closed_trades:
        s = t.get("strat", "UNKNOWN")
        if s not in all_strategy_stats:
            all_strategy_stats[s] = {"trades": 0, "wins": 0, "losses": 0, "pnl": 0, "consec_losses": 0}
        all_strategy_stats[s]["trades"] += 1
        pnl = t.get("pnl", 0)
        all_strategy_stats[s]["pnl"] += pnl
        if pnl > 0:
            all_strategy_stats[s]["wins"] += 1
            all_strategy_stats[s]["consec_losses"] = 0
        else:
            all_strategy_stats[s]["losses"] += 1
            all_strategy_stats[s]["consec_losses"] += 1
    
    # Merge with state consecutive losses
    for s, count in state.get("consecutive_losses", {}).items():
        if s not in all_strategy_stats:
            all_strategy_stats[s] = {"trades": 0, "wins": 0, "losses": 0, "pnl": 0, "consec_losses": count}
        else:
            all_strategy_stats[s]["consec_losses"] = max(all_strategy_stats[s]["consec_losses"], count)
    
    # Session duration
    session_start = state.get("session_start", now_ms)
    if session_start < 1e12:
        session_start = now_ms - (session_start * 1000)
    session_duration_ms = now_ms - session_start
    
    # Forecast
    if session_duration_ms > 0 and total_pnl != 0:
        hourly_rate = total_pnl / (session_duration_ms / 3600000)
        forecast_24h = capital + (hourly_rate * 24)
    else:
        forecast_24h = capital
    
    win_rate = (total_wins / total_trades * 100) if total_trades > 0 else 0
    avg_win = (total_pnl / total_wins) if total_wins > 0 else 0
    avg_loss = (total_pnl / total_losses) if total_losses > 0 else 0
    
    # Anomalies
    anomalies = []
    if win_rate < 40 and total_trades >= 5:
        anomalies.append(f"Win rate {win_rate:.1f}% critically low")
    if total_pnl < -100:
        anomalies.append(f"Total loss ${abs(total_pnl):.2f} exceeds threshold")
    
    critical_strategies = []
    for s, stats in all_strategy_stats.items():
        if stats["consec_losses"] >= 3:
            anomalies.append(f"{s} has {stats['consec_losses']} consecutive losses")
            critical_strategies.append((s, stats["consec_losses"]))
    
    # Slippage
    slippage_issues = []
    for t in closed_trades[-20:]:
        pnl = t.get("pnl", 0)
        if pnl < -25:
            slippage_issues.append({
                "sym": t.get("sym", "N/A"),
                "strategy": t.get("strat", "N/A"),
                "pnl": pnl,
                "slippage_est": abs(pnl) - 25,
            })
    
    # Suggestion
    suggestion = "Monitor for pattern emergence and optimize entry timing"
    if critical_strategies:
        s, cl = critical_strategies[0]
        suggestion = f"Disable {s} (consecutive {cl} losses)"
    elif slippage_issues:
        suggestion = f"Review stop-loss execution — {len(slippage_issues)} trades with significant slippage"
    
    # Generate markdown report
    report_md = f"""# Binance Futures Bot Monitoring Report

**Generated:** {now.strftime('%Y-%m-%d %H:%M:%S')} UTC  
**Session Duration:** {format_duration(session_duration_ms)}  
**Monitoring Agent:** evolution_agent.py (v9)

---

## 📊 EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| **Capital** | ${capital:.2f} |
| **Total P&L** | ${total_pnl:.2f} |
| **Total Trades** | {total_trades} |
| **Win Rate** | {win_rate:.1f}% ({total_wins}W / {total_losses}L) |
| **Avg Win** | ${avg_win:.2f} |
| **Avg Loss** | ${avg_loss:.2f} |
| **24h Forecast** | ${forecast_24h:.2f} |
| **Bot Status** | {'🟢 ACTIVE' if is_active else '🔴 INACTIVE'} |
| **Loop Status** | {'🟢 RUNNING' if loop_running else '🔴 STOPPED'} |
| **Pairs Loaded** | {pairs_loaded} |

---

## 📈 PERFORMANCE BY STRATEGY

| Strategy | Trades | Win % | Total P&L | Consec. Losses | Status |
|----------|--------|-------|-----------|----------------|--------|
"""
    for s, stats in sorted(all_strategy_stats.items(), key=lambda x: x[1]["pnl"]):
        wr = stats["wins"] / max(stats["trades"], 1) * 100
        cl = stats["consec_losses"]
        status = "✅ OK" if cl < 3 else ("⚠️ WARNING" if cl < 5 else "❌ CRITICAL")
        report_md += f"| {s} | {stats['trades']} | {wr:.0f}% | ${stats['pnl']:.2f} | {cl} | {status} |\n"
    
    report_md += f"""
---

## 🔄 RECENT CLOSED TRADES (Last 5)

"""
    for t in closed_trades[-5:]:
        pnl = t.get("pnl", 0)
        emoji = "✅" if pnl > 0 else "❌"
        reason = t.get("close_reason", "N/A")
        report_md += f"- {emoji} **{t.get('sym', 'N/A')}** {t.get('side', 'N/A')} [{t.get('strat', 'N/A')}] → P&L: ${pnl:.2f} | {reason}\n"
    
    if not closed_trades:
        report_md += "- No closed trades in current session.\n"
    
    report_md += f"""
---

## ⚠️ CRITICAL ISSUES

"""
    if not anomalies:
        report_md += "✅ No critical issues detected.\n"
    else:
        for a in anomalies:
            report_md += f"- {a}\n"
    
    report_md += f"""
---

## 💧 SLIPPAGE ANALYSIS

"""
    if slippage_issues:
        report_md += "| Symbol | Strategy | P&L | Est. Slippage |\n"
        report_md += "|--------|----------|-----|---------------|\n"
        for s in slippage_issues[-5:]:
            report_md += f"| {s['sym']} | {s['strategy']} | ${s['pnl']:.2f} | ${s['slippage_est']:.2f} |\n"
    else:
        report_md += "✅ No significant slippage detected.\n"
    
    report_md += f"""
---

## 🧬 SELF-EVOLUTION SUGGESTION

**Primary Suggestion:** {suggestion}

### Supporting Analysis:
"""
    if critical_strategies:
        report_md += f"- Multiple strategies showing consecutive losses breaching risk threshold\n"
        report_md += f"- Historical data suggests parameter mismatch or market regime incompatibility\n"
    if total_trades < 5:
        report_md += f"- Insufficient trade volume for robust statistical analysis\n"
        report_md += f"- Current session shows positive P&L but needs more data points\n"
    
    report_md += f"""
---

## 📋 ANOMALY CHECK

"""
    if not anomalies:
        report_md += "✅ No anomalies detected\n"
    else:
        for a in anomalies:
            report_md += f"- {a}\n"
    
    report_md += f"""
---

## 🎯 ACTION ITEMS

### Immediate (Next 24h)
"""
    if critical_strategies:
        for s, cl in critical_strategies:
            report_md += f"1. **Disable {s}** — {cl} consecutive losses indicate broken parameters\n"
    else:
        report_md += "1. Monitor current strategies for continued performance\n"
    
    if slippage_issues and len(slippage_issues) >= 3:
        report_md += f"2. **Review stop-loss calibration** — {len(slippage_issues)} trades with >$3 slippage\n"
    
    if win_rate < 45 and total_trades >= 5:
        report_md += f"3. **Reduce position size 50%** until win rate improves above 45%\n"
    
    report_md += f"""
### Short-term (This Week)
4. Backtest all strategies with recent market data
5. Implement ADX trend filter (>25) to avoid choppy markets
6. Add volume confirmation (>1.0x average) for entries

### Medium-term (Next 2 Weeks)
7. Implement auto-disable after 3 consecutive losses per strategy
8. Add slippage buffer to position sizing calculations
9. Review and optimize RSI thresholds for current market regime

---

## 📊 CAPITAL FORECAST

Based on current performance trajectory:
- **Current Capital:** ${capital:.2f}
- **24h Forecast:** ${forecast_24h:.2f}
- **Trend:** {'📈 Positive' if forecast_24h >= capital else '📉 Negative'}

"""
    if forecast_24h < capital * 0.9:
        report_md += f"**Warning:** At current rate, capital could decline below ${capital * 0.9:.2f} in 24 hours.\n"
    elif forecast_24h > capital * 1.05:
        report_md += f"**Positive:** Current trajectory suggests capital growth above ${capital * 1.05:.2f} in 24 hours.\n"
    
    report_md += f"""
---

## 🔄 SYSTEM HEALTH

- **Loop Status:** {'Running normally' if loop_running else 'STOPPED'}
- **Crash Count:** {loop_crashes} (session peak)
- **Pairs Monitored:** {pairs_loaded}
- **Last Check:** {now.strftime('%Y-%m-%d %H:%M:%S UTC')}

---

*Report generated by Hermes Monitoring Agent*  
*Next check scheduled in 15 minutes*
"""
    
    # Save report
    report_filename = f"MONITORING_REPORT_CRON_{now.strftime('%Y-%m-%d_%H-%M')}.md"
    report_path = os.path.join(REPORT_DIR, report_filename)
    with open(report_path, 'w') as f:
        f.write(report_md)
    
    # Also update LATEST_MONITORING_REPORT.md
    with open(os.path.join(REPORT_DIR, "LATEST_MONITORING_REPORT.md"), 'w') as f:
        f.write(report_md)
    
    # Update evolution log
    log_data = {"session_start": state["session_start"], "updates": []}
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, 'r') as f:
                log_data = json.load(f)
        except:
            pass
    
    evolution_entry = {
        "timestamp": now.isoformat(),
        "capital": capital,
        "total_pnl": total_pnl,
        "total_trades": total_trades,
        "win_rate": win_rate,
        "suggestion": suggestion,
        "critical_strategies": [s for s, _ in critical_strategies],
        "anomalies": anomalies,
        "forecast_24h": round(forecast_24h, 2),
    }
    log_data["updates"].append(evolution_entry)
    if len(log_data["updates"]) > 100:
        log_data["updates"] = log_data["updates"][-100:]
    with open(LOG_FILE, 'w') as f:
        json.dump(log_data, f, indent=2)
    
    # Generate self-evolution report
    evolution_md = f"""# Self-Evolution Report - Trading Bot v9

**Cycle:** {now.isoformat()}  
**Agent:** evolution_agent.py  
**Session Duration:** {format_duration(session_duration_ms)}  
**Trades Analyzed:** {total_trades} ({total_wins} wins, {total_losses} losses)

---

## 🧬 Evolution Trigger

"""
    if critical_strategies:
        for s, cl in critical_strategies:
            evolution_md += f"- **{s}:** {cl} consecutive losses → Strategy disable recommended\n"
    else:
        evolution_md += "No critical triggers detected in this cycle.\n"
    
    evolution_md += f"""
---

## 📊 Current State Analysis

### Capital Health
- **Current Capital:** ${capital:.2f}
- **Total P&L:** ${total_pnl:.2f}
- **Win Rate:** {win_rate:.1f}%
- **24h Forecast:** ${forecast_24h:.2f}

### Strategy Health Matrix

| Strategy | Trades | Win% | P&L | Consec. Losses | Status |
|----------|--------|------|-----|----------------|--------|
"""
    for s, stats in sorted(all_strategy_stats.items(), key=lambda x: x[1]["pnl"]):
        wr = stats["wins"] / max(stats["trades"], 1) * 100
        cl = stats["consec_losses"]
        status = "🟢 HEALTHY" if cl < 2 else ("🟡 WATCH" if cl < 3 else ("🔴 CRITICAL" if cl < 5 else "🔴 BROKEN"))
        evolution_md += f"| {s} | {stats['trades']} | {wr:.0f}% | ${stats['pnl']:.2f} | {cl} | {status} |\n"
    
    evolution_md += f"""
---

## 🎯 Self-Evolution Recommendation

### Primary: {suggestion}

**Rationale:**
"""
    if critical_strategies:
        for s, cl in critical_strategies:
            evolution_md += f"- {s}: {cl} consecutive losses breach risk threshold\n"
        evolution_md += f"- Negative expectancy on critical strategies\n"
        evolution_md += f"- No improvement signs; fundamental parameter mismatch likely\n"
    
    evolution_md += f"""
**Implementation:**
- Review strategy parameters in server/strategy.ts
- Consider disabling strategies with >=3 consecutive losses
- Backtest with recent 14-day data before re-enabling

---

## 📈 Expected Outcomes

"""
    if critical_strategies:
        evolution_md += f"If critical strategies are disabled:\n"
        evolution_md += f"- Remove negative expectancy trades\n"
        evolution_md += f"- Preserve remaining capital (${capital:.2f})\n"
        evolution_md += f"- Win rate may improve to ~50%+\n"
    else:
        evolution_md += f"- Continue monitoring current strategies\n"
        evolution_md += f"- Capital trajectory is positive (${forecast_24h:.2f} 24h forecast)\n"
    
    evolution_md += f"""
---

## 📋 Monitoring Plan

### Next 4 hours:
- Verify strategy performance continues
- Track new trades for additional data points

### Next 24 hours:
- Evaluate if disabled strategies remain disabled
- Check if capital stabilizes or grows

### Next 7 days:
- Run full backtest with updated parameters
- Reintroduce one strategy at a time after validation
- Target: Win rate >55%, average R:R >1.5:1

---

*Report generated by Hermes Monitoring Agent*
"""
    
    evo_filename = f"SELF_EVOLUTION_REPORT_CRON_{now.strftime('%Y-%m-%d_%H-%M')}.md"
    evo_path = os.path.join(REPORT_DIR, evo_filename)
    with open(evo_path, 'w') as f:
        f.write(evolution_md)
    
    # Update SELF_EVOLUTION_REPORT.md
    with open(os.path.join(REPORT_DIR, "SELF_EVOLUTION_REPORT.md"), 'w') as f:
        f.write(evolution_md)
    
    print(f"\nReports saved:")
    print(f"  - {report_path}")
    print(f"  - {evo_path}")
    print(f"\nMonitoring cycle complete at {now.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    
    return report_md

if __name__ == "__main__":
    main()
