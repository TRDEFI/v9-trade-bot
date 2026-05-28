#!/usr/bin/env python3
import json

with open('/workspace/v9-repo/self_evolution_log.json', 'r') as f:
    data = json.load(f)

print('Session started:', data['session_start'])
print('Total updates:', len(data['updates']))

if data['updates']:
    latest = data['updates'][-1]
    print('Latest timestamp:', latest.get('timestamp', 'N/A'))
    print('Latest capital:', latest.get('capital', 'N/A'))
    print('Latest trades analyzed:', latest.get('total_trades', 'N/A'))
    print('Latest PnL:', latest.get('total_pnl', 'N/A'))
    print('Latest win rate:', f"{latest.get('total_wins', 0)}/{latest.get('total_trades', 0)}")
    print('Suggestions:', latest.get('suggestions', []))
    print('Anomalies:', latest.get('anomalies', []))
    print('Consecutive losses:', latest.get('consecutive_losses', {}))
    print('Strategy performance:', latest.get('strategy_performance', []))
