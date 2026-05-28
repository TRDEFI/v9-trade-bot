import requests
import json
from datetime import datetime, timezone

try:
    r = requests.get('http://18.181.221.88:3000/api/data', timeout=10)
    data = r.json()
    
    # Save raw dashboard
    with open('current_dashboard_now.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    # Summary
    print(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print(f"Capital: ${data.get('capital', 0):.2f}")
    print(f"Total Trades: {data.get('total_trades', 0)}")
    print(f"Wins/Losses: {data.get('total_wins', 0)}/{data.get('total_losses', 0)}")
    print(f"Total P&L: ${data.get('total_pnl', 0):.2f}")
    print(f"Win Rate: {data.get('total_wins', 0)/max(data.get('total_trades', 1), 1)*100:.1f}%")
    print(f"Bot Active: {data.get('is_active', False)}")
    print(f"Loop Running: {data.get('loop_running', False)}")
    print(f"Loop Crashes: {data.get('loop_crash_count', 0)}")
    print(f"Pairs Loaded: {data.get('pairs_loaded', 0)}")
    print(f"Open Positions: {len(data.get('open', []))}")
    print(f"Closed Trades: {len(data.get('closed', []))}")
    
    if data.get('open'):
        print("\n=== OPEN POSITIONS ===")
        for p in data['open'][:5]:
            print(f"  {p.get('sym')} {p.get('side')} | PnL: ${p.get('pnl', 0):.2f} | Strategy: {p.get('strat', 'N/A')}")
    
    if data.get('closed'):
        print("\n=== RECENT CLOSED TRADES (Last 5) ===")
        for p in data['closed'][-5:]:
            print(f"  {p.get('sym')} {p.get('side')} | PnL: ${p.get('pnl', 0):.2f} | Strategy: {p.get('strat', 'N/A')} | Reason: {p.get('close_reason', 'N/A')}")
    
    # Check strategies from server code
    print("\n=== STRATEGY DATA FROM DASHBOARD ===")
    closed = data.get('closed', [])
    if closed:
        strat_stats = {}
        for t in closed:
            s = t.get('strat', 'UNKNOWN')
            if s not in strat_stats:
                strat_stats[s] = {'trades': 0, 'wins': 0, 'losses': 0, 'pnl': 0}
            strat_stats[s]['trades'] += 1
            if t.get('pnl', 0) > 0:
                strat_stats[s]['wins'] += 1
            else:
                strat_stats[s]['losses'] += 1
            strat_stats[s]['pnl'] += t.get('pnl', 0)
        
        for s, stats in sorted(strat_stats.items(), key=lambda x: x[1]['pnl']):
            wr = stats['wins']/max(stats['trades'], 1)*100
            print(f"  {s}: {stats['trades']} trades | {wr:.0f}% WR | PnL: ${stats['pnl']:.2f}")
            
except Exception as e:
    print(f'Error: {e}')
