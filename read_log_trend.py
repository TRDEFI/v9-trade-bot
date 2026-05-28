import json
with open('/workspace/v9-repo/self_evolution_log.json', 'r') as f:
    data = json.load(f)
updates = data.get('updates', [])
if len(updates) >= 5:
    print("=== Last 5 monitoring cycles ===")
    for u in updates[-5:]:
        ts = u.get('timestamp', 'N/A')
        cap = u.get('capital', 'N/A')
        pnl = u.get('total_pnl', 'N/A')
        trades = u.get('total_trades', 'N/A')
        wins = u.get('total_wins', 'N/A')
        losses = u.get('total_losses', 'N/A')
        suggestions = u.get('suggestions', [])
        anomalies = u.get('anomalies', [])
        print(f"[{ts}] Capital=${cap} PnL=${pnl} Trades={trades}({wins}W/{losses}L) Suggestions={suggestions} Anomalies={anomalies}")
else:
    print("Not enough updates for trend")
