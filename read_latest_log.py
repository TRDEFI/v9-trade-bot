#!/usr/bin/env python3
import json

with open('self_evolution_log.json', 'r') as f:
    data = json.load(f)

last = data['updates'][-1]
print("=== LATEST MONITORING REPORT ===")
print(f"Timestamp: {last['timestamp']}")
print(f"Capital: ${last['capital']:.2f}")
print(f"Total Trades: {last['total_trades']}")
print(f"Wins/Losses: {last['total_wins']}/{last['total_losses']}")
print(f"Total P&L: ${last['total_pnl']:.2f}")
if last['total_trades'] > 0:
    print(f"Win Rate: {last['total_wins']/last['total_trades']*100:.1f}%")
print()
print("Strategy Performance:")
for strat in last['strategy_performance']:
    print(f"  {strat['strat']}: {strat['trades']} trades, {strat['win_pct']:.1f}% win, P&L: ${strat['total_pnl']:.2f}")
print()
print(f"Consecutive Losses: {last['consecutive_losses']}")
print(f"Anomalies: {last['anomalies']}")
print(f"Suggestions: {last['suggestions']}")
print(f"Capital Forecast 24h: ${last['capital_forecast_24h']:.2f}")
print(f"Loop Running: {last['loop_running']}")
print(f"Pairs Loaded: {last['pairs_loaded']}")
print(f"Loop Crash Count: {last['loop_crash_count']}")
