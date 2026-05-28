import json
with open('/workspace/v9-repo/self_evolution_log.json', 'r') as f:
    data = json.load(f)
updates = data.get('updates', [])
if updates:
    last = updates[-1]
    for i, a in enumerate(last.get('kline_autopsies', []), 1):
        print(f"Autopsy {i}:")
        for k, v in a.items():
            print(f"  {k}: {v}")
        print()
