#!/usr/bin/env python3
import json

with open('/workspace/v9-repo/self_evolution_log.json', 'r') as f:
    data = json.load(f)

print(f"Session start: {data['session_start']}")
print(f"Number of updates: {len(data['updates'])}")
if data['updates']:
    latest = data['updates'][-1]
    print(f"\nLatest update timestamp: {latest['timestamp']}")
    print(f"Capital: {latest['capital']}")
    print(f"Total PnL: {latest['total_pnl']}")
    print(f"Total trades: {latest['total_trades']}")
    print(f"Wins: {latest['total_wins']}, Losses: {latest['total_losses']}")
    print(f"Suggestions: {latest['suggestions']}")
