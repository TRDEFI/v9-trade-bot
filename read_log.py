#!/usr/bin/env python3
import json

with open('self_evolution_log.json', 'r') as f:
    data = json.load(f)

print(f"Session start: {data['session_start']}")
print(f"Number of updates: {len(data['updates'])}\n")

if data['updates']:
    latest = data['updates'][-1]
    print(f"Latest update timestamp: {latest['timestamp']}")
    print(f"Capital: {latest['capital']}")
    print(f"Total PnL: {latest['total_pnl']}")
    print(f"Total trades: {latest['total_trades']}")
    print(f"Wins: {latest['total_wins']}, Losses: {latest['total_losses']}")
    print(f"Suggestions: {latest['suggestions']}")
    print(f"Anomalies: {latest['anomalies']}")
    print(f"Loop running: {latest['loop_running']}")
    print(f"Pairs loaded: {latest['pairs_loaded']}")
    print(f"Consecutive losses: {latest['consecutive_losses']}")
    print(f"\nNumber of kline autopsies: {len(latest.get('kline_autopsies', []))}")
    if latest.get('kline_autopsies'):
        print("\nFirst autopsy:")
        print(json.dumps(latest['kline_autopsies'][0], indent=2))
