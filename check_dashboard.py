#!/usr/bin/env python3
import json

with open('/workspace/v9-repo/current_dashboard_latest.json') as f:
    data = json.load(f)

print(f"Total trades: {data['total_trades']}")
print(f"Total wins: {data['total_wins']}")
print(f"Total losses: {data['total_losses']}")
print(f"Total PnL: {data['total_pnl']:.4f}")
print(f"Capital: {data['capital']:.4f}")
print(f"\nClosed trades:")
for i, trade in enumerate(data['closed'], 1):
    print(f"{i}. {trade['sym']} {trade['side']} - PnL: {trade['pnl']:.2f} - {trade['strat']} - {trade['reason']}")
