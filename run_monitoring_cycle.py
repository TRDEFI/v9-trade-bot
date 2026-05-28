#!/usr/bin/env python3
"""Run the monitoring agent and generate a fresh comprehensive report."""
import json
import requests
import time
import os
from datetime import datetime, timezone, timedelta

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

def format_time(ts):
    if not ts:
        return "N/A"
    return datetime.fromtimestamp(ts/1000 if ts > 1e12 else ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

def format_duration(ms):
    if not ms:
        return "N/A"
    seconds = int(ms / 1000) if ms > 1e12 else int(ms)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h}h {m}m {s}s"

def main():
    print("Fetching live dashboard data...")
    data = fetch_dashboard()
    if not data:
        print("Failed to fetch dashboard")
        return
    
    # Load state
    state = {
        "consecutive_losses": {},
        "strategy_performance": {},
        "peak_capital": 0,
        "session_start": int(time.time() * 1000),
    }
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                saved = json.load(f)
                state["consecutive_losses"] = saved.get("consecutive_losses", {})
                state["strategy_performance"] = saved.get("strategy_performance", {})
                state["peak_capital"] = saved.get("peak_capital", 0)
                if saved.get("session_start"):
                    state["session_start"] = saved["session_start"]
        except Exception as e:
            print(f"Error loading state: {e}")
    
    # Parse dashboard
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
    
    # Update peak capital
    if capital > state["peak_capital"]:
        state["peak_capital"] = capital
    
    # Analyze closed trades for strategy performance
    closed_seen = set()
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                saved = json.load(f)
                closed_seen = set(saved.get("closed_seen", []))
        except:
            pass
    
    new_closed = []
    for t in closed_trades:
        trade_id = f"{t.get('sym', '')}_{t.get('opened', '')}_{t.get('closed', '')}"
        if trade_id not in closed_seen:
            new_closed.append(t)
            closed_seen.add(trade_id)
    
    # Update strategy stats from ALL closed trades (not just new ones) for current snapshot
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
    
    # Also update consecutive losses from state
    for s, count in state.get("consecutive_losses", {}).items():
        if s not in all_strategy_stats:
            all_strategy_stats[s] = {"trades": 0, "wins": 0, "losses": 0, "pnl": 0, "consec_losses": count}
        all_strategy_stats[s]["consec_losses"] = max(all_strategy_stats[s]["consec_losses"], count)
    
    # Calculate metrics
    win_rate = (total_wins / total_trades * 100) if total_trades > 0 else 0
    avg_win = (total_pnl / total_wins) if total_wins > 0 else 0
    avg_loss = (total_pnl / total_losses) if total_losses > 0 else 0
    session_duration_ms = int(time.time() * 1000) - state["session_start"]
    
    # Capital forecast
    if session_duration_ms > 0 and total_pnl != 0:
        hourly_rate = total_pnl / (session_duration_ms / 3600000)
        forecast_24h = capital + (hourly_rate * 24)
    else:
        forecast_24h = capital
    
    # Identify critical issues
    anomalies = []
    if win_rate < 40 and total_trades >= 5:
        anomalies.append(f"Win rate {win_rate:.1f}% critically low")
    if total_pnl < -100:
        anomalies.append(f"Total loss ${abs(total_pnl):.2f} exceeds threshold")
    
    critical_strategies = []
    for s, stats in all_strategy_stats.items():
        if stats["consec_losses"] >= 3:
            anomalies.append(f"{s} has {stats['consec_losses']} consecutive losses")
            critical_strategies.append(s)
    
    # Slippage analysis
    slippage_issues = []
    for t in closed_trades[-20:]:
        pnl = t.get("pnl", 0)
        if pnl < -25:
            slippage = abs(pnl) - 25
            slippage_issues.append({
                "sym": t.get("sym", "N/A"),
                "strategy": t.get("strat", "N/A"),
                "pnl": pnl,
                "slippage_est": slippage,
            })
    
    # Generate suggestion
    suggestion = "Monitor for pattern emergence and optimize entry timing"
    if critical_strategies:
        suggestion = f"Disable {critical_strategies[0]} (consecutive {all_strategy_stats[critical_strategies[0]]['consec_losses']} losses)"
    elif slippage_issues:
        suggestion = f"Review stop-loss execution — {len(slippage_issues)} trades with significant slippage"
    
    # Build report
    now = datetime.now(timezone.utc)
    report = {
        "timestamp": now.isoformat(),
        "capital": round(capital, 2),
        "total_trades": total_trades,
        "total_wins": total_wins,
        "total_losses": total_losses,
        "total_pnl": round(total_pnl, 2),
        "win_rate": round(win_rate, 1),
        "avg_win": round(avg_win, 2),
        "avg_loss": round(avg_loss, 2),
        "forecast_24h": round(forecast_24h, 2),
        "session_duration": format_duration(session_duration_ms),
        "bot_active": is_active,
        "loop_running": loop_running,
        "loop_crashes": loop_crashes,
        "pairs_loaded": pairs_loaded,
        "open_positions_count": len(open_positions),
        "closed_count": len(closed_trades),
        "strategy_performance": all_strategy_stats,
        "anomalies": anomalies,
        "suggestions": [suggestion],
        "slippage_issues": slippage_issues[-5:],
        "consecutive_losses": {k: v.get("consec_losses", 0) for k, v in all_strategy_stats.items()},
    }
    
    # Save raw report data
    with open(f"{REPORT_DIR}/monitoring_raw_{now.strftime('%Y%m%d_%H%M%S')}.json", 'w') as f:
        json.dump(report, f, indent=2)
    
    # Save state
    state_to_save = {
        "last_check": int(time.time() * 1000),
        "closed_seen": list(closed_seen),
        "consecutive_losses": {k: v.get("consec_losses", 0) for k, v in all_strategy_stats.items()},
        "strategy_performance": all_strategy_stats,
        "session_start": state["session_start"],
        "peak_capital": state["peak_capital"],
    }
    with open(STATE_FILE, 'w') as f:
        json.dump(state_to_save, f, indent=2)
    
    # Update evolution log
    log_data = {"session_start": state["session_start"], "updates": []}
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, 'r') as f:
                log_data = json.load(f)
        except:
            pass
    log_data["updates"].append(report)
    if len(log_data["updates"]) > 100:
        log_data["updates"] = log_data["updates"][-100:]
    with open(LOG_FILE, 'w') as f:
        json.dump(log_data, f, indent=2)
    
    # Print report
    print(f"\n{'='*60}")
    print(f"BINANCE FUTURES BOT MONITORING REPORT")
    print(f"Generated: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"{'='*60}")
    print(f"\n## EXECUTIVE SUMMARY")
    print(f"| Metric | Value |")
    print(f"|--------|-------|")
    print(f"| **Capital** | ${capital:.2f} |")
    print(f"| **Total P&L** | ${total_pnl:.2f} |")
    print(f"| **Total Trades** | {total_trades} |")
    print(f"| **Win Rate** | {win_rate:.1f}% ({total_wins}W / {total_losses}L) |")
    print(f"| **Avg Win** | ${avg_win:.2f} |")
    print(f"| **Avg Loss** | ${avg_loss:.2f} |")
    print(f"| **24h Forecast** | ${forecast_24h:.2f} |")
    print(f"| **Bot Status** | {'ACTIVE' if is_active else 'INACTIVE'} |")
    print(f"| **Loop Status** | {'RUNNING' if loop_running else 'STOPPED'} |")
    print(f"| **Pairs Loaded** | {pairs_loaded} |")
    
    print(f"\n## STRATEGY PERFORMANCE")
    if all_strategy_stats:
        print(f"| Strategy | Trades | Win % | Total P&L | Consec. Losses | Status |")
        print(f"|----------|--------|-------|-----------|----------------|--------|")
        for s, stats in sorted(all_strategy_stats.items(), key=lambda x: x[1]["pnl"]):
            wr = stats["wins"] / max(stats["trades"], 1) * 100
            cl = stats["consec_losses"]
            status = "OK" if cl < 3 else ("WARNING" if cl < 5 else "CRITICAL")
            print(f"| {s} | {stats['trades']} | {wr:.0f}% | ${stats['pnl']:.2f} | {cl} | {status} |")
    else:
        print("No trade data available yet.")
    
    print(f"\n## OPEN POSITIONS")
    if open_positions:
        for p in open_positions[:5]:
            print(f"  {p.get('sym', 'N/A')} {p.get('side', 'N/A')} | PnL: ${p.get('pnl', 0):.2f} | Strategy: {p.get('strat', 'N/A')}")
    else:
        print("  No open positions.")
    
    print(f"\n## RECENT CLOSED TRADES (Last 5)")
    for t in closed_trades[-5:]:
        pnl = t.get("pnl", 0)
        emoji = "W" if pnl > 0 else "L"
        reason = t.get("close_reason", "N/A")
        print(f"  {emoji} {t.get('sym', 'N/A')} {t.get('side', 'N/A')} [{t.get('strat', 'N/A')}] | PnL: ${pnl:.2f} | {reason}")
    
    if anomalies:
        print(f"\n## ANOMALIES")
        for a in anomalies:
            print(f"  WARNING: {a}")
    
    if slippage_issues:
        print(f"\n## SLIPPAGE ISSUES")
        for s in slippage_issues:
            print(f"  {s['sym']} [{s['strategy']}] | PnL: ${s['pnl']:.2f} | Est. slippage: ${s['slippage_est']:.2f}")
    
    print(f"\n## SELF-EVOLUTION SUGGESTION")
    print(f"  **{suggestion}**")
    
    print(f"\n## ACTION ITEMS")
    if critical_strategies:
        for s in critical_strategies:
            cl = all_strategy_stats[s]["consec_losses"]
            print(f"  1. DISABLE {s} — {cl} consecutive losses")
    if slippage_issues and len(slippage_issues) >= 3:
        print(f"  2. Review stop-loss execution — {len(slippage_issues)} trades with >$3 slippage")
    if win_rate < 40 and total_trades >= 5:
        print(f"  3. Reduce position size 50% until win rate improves above 45%")
    
    print(f"\n## SYSTEM HEALTH")
    print(f"  Loop Crashes: {loop_crashes} (session peak)")
    print(f"  Session Duration: {format_duration(session_duration_ms)}")
    print(f"  Last Check: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    
    print(f"\n{'='*60}")
    print("Monitoring cycle complete.")
    
    return report

if __name__ == "__main__":
    main()
