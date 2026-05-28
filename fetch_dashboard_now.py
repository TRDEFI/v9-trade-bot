import requests
import json
try:
    r = requests.get('http://18.181.221.88:3000/api/data', timeout=10)
    data = r.json()
    summary = {
        'capital': data.get('capital'),
        'total_trades': data.get('total_trades'),
        'total_wins': data.get('total_wins'),
        'total_losses': data.get('total_losses'),
        'total_pnl': data.get('total_pnl'),
        'is_active': data.get('is_active'),
        'loop_running': data.get('loop_running'),
        'loop_crash_count': data.get('loop_crash_count'),
        'pairs_loaded': data.get('pairs_loaded'),
        'open_positions': len(data.get('open', [])),
        'closed_count': len(data.get('closed', [])),
    }
    print(json.dumps(summary, indent=2))
except Exception as e:
    print(f'Error: {e}')
