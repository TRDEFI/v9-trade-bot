#!/usr/bin/env python3
import re

with open('/home/ubuntu/v9-trade-bot/bot_scan.log', 'r') as f:
    lines = f.readlines()

closed = [l for l in lines if 'CLOSED' in l]
print(f"Total closed positions: {len(closed)}")

pnls = []
reasons = {}
symbols = {}
sides = {}

for line in closed:
    # Extract PNL
    pnl_match = re.search(r'pnl=(-?\d+\.?\d*)', line)
    reason_match = re.search(r'reason=(\w+)', line)
    sym_match = re.search(r'\[(\w+)\] CLOSED', line)
    side_match = re.search(r'side=(\w+)', line)
    
    if pnl_match:
        pnl = float(pnl_match.group(1))
        pnls.append(pnl)
    
    if reason_match:
        r = reason_match.group(1)
        reasons[r] = reasons.get(r, 0) + 1
    
    if sym_match:
        s = sym_match.group(1)
        symbols[s] = symbols.get(s, 0) + 1
    
    if side_match:
        sd = side_match.group(1)
        sides[sd] = sides.get(sd, 0) + 1

wins = [p for p in pnls if p > 0]
losses = [p for p in pnls if p <= 0]

print(f"\n=== PNL SUMMARY ===")
print(f"Total PNL: ${sum(pnls):.2f}")
print(f"Wins: {len(wins)}, Losses: {len(losses)}")
print(f"Win Rate: {len(wins)/len(pnls)*100:.1f}%")
print(f"Avg Win: ${sum(wins)/len(wins):.2f}" if wins else "Avg Win: N/A")
print(f"Avg Loss: ${sum(losses)/len(losses):.2f}" if losses else "Avg Loss: N/A")
print(f"Best Trade: ${max(pnls):.2f}")
print(f"Worst Trade: ${min(pnls):.2f}")

print(f"\n=== REASONS ===")
for r, c in sorted(reasons.items(), key=lambda x: -x[1]):
    print(f"  {r}: {c}")

print(f"\n=== SIDES ===")
for s, c in sorted(sides.items(), key=lambda x: -x[1]):
    print(f"  {s}: {c}")

print(f"\n=== TOP 15 SYMBOLS ===")
for s, c in sorted(symbols.items(), key=lambda x: -x[1])[:15]:
    print(f"  {s}: {c} trades")

# Big losses
big_losses = [(p, l) for p, l in zip(pnls, closed) if p < -50]
print(f"\n=== BIG LOSSES (>-$50) ===")
for p, l in big_losses:
    sym = re.search(r'\[(\w+)\]', l)
    reason = re.search(r'reason=(\w+)', l)
    print(f"  PNL: ${p:.2f} | {sym.group(1) if sym else '?'} | {reason.group(1) if reason else '?'}")
