import json

with open('/workspace/v9-repo/self_evolution_log.json') as f:
    data = json.load(f)

latest = data['updates'][-1]
print(f"Timestamp: {latest['timestamp']}")
print(f"Capital: ${latest['capital']:.2f}")
print(f"Total PnL: ${latest['total_pnl']:.2f}")
print(f"Trades: {latest['total_trades']}")
print(f"Autopsies: {len(latest['kline_autopsies'])}")
for i, a in enumerate(latest['kline_autopsies'], 1):
    print(f"{i}. {a['sym']} {a['side']}: ${a['pnl']:.2f} ({a['reason']})")
