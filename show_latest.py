import json
with open('self_evolution_log.json', 'r') as f:
    data = json.load(f)
latest = data['updates'][-1]
print(json.dumps(latest, indent=2))
