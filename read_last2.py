import json
with open('/workspace/v9-repo/self_evolution_log.json', 'r') as f:
    data = json.load(f)
updates = data.get('updates', [])
if len(updates) >= 2:
    prev = updates[-2]
    print('Previous update keys:', list(prev.keys()))
    print('Timestamp:', prev.get('timestamp'))
    print('Capital:', prev.get('capital'))
    print('Total PnL:', prev.get('total_pnl'))
    print('Trades:', prev.get('total_trades'))
    print('Wins:', prev.get('total_wins'))
    print('Losses:', prev.get('total_losses'))
    print('Suggestions:', prev.get('suggestions'))
    print('Anomalies:', prev.get('anomalies'))
    print('Loop running:', prev.get('loop_running'))
    print('Crash count:', prev.get('loop_crash_count'))
    print('Pairs loaded:', prev.get('pairs_loaded'))
    print('Capital forecast:', prev.get('capital_forecast_24h'))
    print('Strategy perf keys:', [s.get('strategy') for s in prev.get('strategy_performance', [])])
    print('Kline autopsies count:', len(prev.get('kline_autopsies', [])))
    print('Slippage:', prev.get('slippage_heatmap'))
    print('Consecutive losses:', prev.get('consecutive_losses'))
else:
    print('Not enough updates')
