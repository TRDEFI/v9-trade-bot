#!/usr/bin/env python3
import json

with open('/workspace/v9-repo/self_evolution_log.json') as f:
    data = json.load(f)

last = data['updates'][-1]
print('=== STRATEGY PERFORMANCE ===')
for s in last.get('strategy_performance', []):
    print(f"{s['strat']:20s} Trades:{s['trades']:3d} Win%:{s['win_pct']:5.1f}% PnL:${s['total_pnl']:8.2f}")
print()
print('=== CONSECUTIVE LOSSES ===')
for strat, count in last.get('consecutive_losses', {}).items():
    print(f'{strat}: {count} consecutive losses')
print()
print('=== SUGGESTIONS ===')
for i, sug in enumerate(last.get('suggestions', []), 1):
    print(f'{i}. {sug}')
print()
print('=== SYSTEM HEALTH ===')
print(f"Loop running: {last['loop_running']}")
print(f"Pairs loaded: {last['pairs_loaded']}")
print(f"Loop crashes: {last['loop_crash_count']}")
print(f"Capital: ${last['capital']:.2f}")
print(f"Total PnL: ${last['total_pnl']:.2f}")
print(f"Win rate: {last['total_wins']/max(last['total_trades'],1)*100:.1f}%")
print(f"24h forecast: ${last['capital_forecast_24h']:.2f}")
print()
print('=== RECENT TRADES (Last 5) ===')
for autopsy in last.get('kline_autopsies', [])[-5:]:
    win = autopsy.get('pnl', 0) > 0
    print(f"{autopsy.get('sym')} {autopsy.get('side')} {autopsy.get('strat')}: {'WIN' if win else 'LOSS'} ${autopsy.get('pnl', 0):.2f}")
