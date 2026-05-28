import json
with open('/workspace/v9-repo/self_evolution_log.json', 'r') as f:
    data = json.load(f)
updates = data.get('updates', [])
if updates:
    last = updates[-1]
    print('Last update keys:', list(last.keys()))
    print('Timestamp:', last.get('timestamp'))
    print('Capital:', last.get('capital'))
    print('Total PnL:', last.get('total_pnl'))
    print('Trades:', last.get('total_trades'))
    print('Wins:', last.get('total_wins'))
    print('Losses:', last.get('total_losses'))
    print('Suggestions:', last.get('suggestions'))
    print('Anomalies:', last.get('anomalies'))
    print('Loop running:', last.get('loop_running'))
    print('Crash count:', last.get('loop_crash_count'))
    print('Pairs loaded:', last.get('pairs_loaded'))
    print('Capital forecast:', last.get('capital_forecast_24h'))
    print('Strategy perf keys:', [s.get('strategy') for s in last.get('strategy_performance', [])])
else:
    print('No updates found in log')
