import json
with open('/workspace/v9-repo/self_evolution_log.json', 'r') as f:
    data = json.load(f)
updates = data.get('updates', [])
if updates:
    last = updates[-1]
    print('Strategy performance raw:')
    for s in last.get('strategy_performance', []):
        print(s)
    print()
    print('Consecutive losses:', last.get('consecutive_losses'))
    print('Kline autopsies count:', len(last.get('kline_autopsies', [])))
    print('Slippage:', last.get('slippage_heatmap'))
