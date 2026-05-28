import json

with open('/workspace/monitor_state.json', 'r') as f:
    state = json.load(f)

fixed = False
for strat, data in state.get('strategy_performance', {}).items():
    if isinstance(data, dict):
        if 'pnl' in data and 'total_pnl' not in data:
            data['total_pnl'] = data.pop('pnl')
            fixed = True
        elif 'pnl' in data:
            data['total_pnl'] = data.pop('pnl')
            fixed = True

if fixed:
    with open('/workspace/monitor_state.json', 'w') as f:
        json.dump(state, f, indent=2)
    print('Fixed monitor_state.json: renamed pnl -> total_pnl')
else:
    print('No schema fixes needed')
