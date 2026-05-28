#!/usr/bin/env python3
import json

with open('self_evolution_log.json') as f:
    data = json.load(f)

print(f"Session start: {data.get('session_start')}")
print(f"Total updates: {len(data.get('updates', []))}")
print()

last_update = data['updates'][-1]
print(f"Last update timestamp: {last_update.get('timestamp')}")
print(f"Capital: ${last_update.get('capital'):.2f}")
print(f"Total P&L: ${last_update.get('total_pnl'):.2f}")
print(f"Total trades: {last_update.get('total_trades')}")
print(f"Total wins: {last_update.get('total_wins')}")
print(f"Total losses: {last_update.get('total_losses')}")
print()

print("Kline autopsies analyzed:")
for autopsy in last_update.get('kline_autopsies', []):
    print(f"- {autopsy.get('sym')} {autopsy.get('side')}: PnL ${autopsy.get('pnl'):.2f} | {autopsy.get('autopsy_summary')}")

print()
print("Slippage heatmap:")
for item in last_update.get('slippage_heatmap', []):
    print(f"- {item.get('sym')}: trigger ${item.get('trigger_usd'):.2f}, fill ${item.get('fill_usd'):.2f}, slippage ${item.get('slippage_usd'):.2f}")

print()
print("Strategy performance:")
for perf in last_update.get('strategy_performance', []):
    print(f"- {perf.get('strat')}: {perf.get('trades')} trades, {perf.get('win_pct')}% win rate, PnL ${perf.get('total_pnl'):.2f}")

print()
print("Consecutive losses:")
for strat, count in last_update.get('consecutive_losses', {}).items():
    print(f"- {strat}: {count} consecutive losses")

print()
print("Anomalies:")
for anomaly in last_update.get('anomalies', []):
    print(f"- {anomaly}")

print()
print("Suggestions:")
for suggestion in last_update.get('suggestions', []):
    print(f"- {suggestion}")

print()
print(f"Capital forecast (24h): ${last_update.get('capital_forecast_24h'):.2f}")
print(f"Loop running: {last_update.get('loop_running')}")
print(f"Loop crash count: {last_update.get('loop_crash_count')}")
print(f"Pairs loaded: {last_update.get('pairs_loaded')}")
