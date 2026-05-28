#!/usr/bin/env python3
import json

with open('self_evolution_log.json', 'r') as f:
    data = json.load(f)

last = data['updates'][-1]
print("=== KLINE AUTOPSIES FROM LATEST CYCLE ===")
if 'kline_autopsies' in last and last['kline_autopsies']:
    for i, autopsy in enumerate(last['kline_autopsies'], 1):
        print(f"\nTrade {i}: {autopsy.get('sym', 'N/A')} {autopsy.get('side', 'N/A')}")
        print(f"  Entry: {autopsy.get('entry_time', 'N/A')} -> Exit: {autopsy.get('exit_time', 'N/A')}")
        print(f"  P&L: ${autopsy.get('pnl', 0):.2f}")
        print(f"  Strategy: {autopsy.get('strategy', 'N/A')}")
        print(f"  Exit Reason: {autopsy.get('exit_reason', 'N/A')}")
        print(f"  Slippage: ${autopsy.get('slippage_usd', 0):.2f}")
        print(f"  Pattern Detected: {autopsy.get('pattern_detected', 'None')}")
        if 'candle_analysis' in autopsy:
            ca = autopsy['candle_analysis']
            print(f"  Entry Candle: {ca.get('entry_candle_type', 'N/A')}")
            print(f"  Exit Candle: {ca.get('exit_candle_type', 'N/A')}")
            print(f"  Trend Alignment: {ca.get('trend_alignment', 'N/A')}")
else:
    print("No new kline autopsies in this cycle")
