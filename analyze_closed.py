import json

with open('/tmp/dashboard_latest.json') as f:
    d = json.load(f)

closed = d.get('closed', [])
opens = d.get('opens', [])

print("=== SESSION SUMMARY ===")
print(f"Capital: ${d['capital']:.2f}")
print(f"Total Trades: {d['total_trades']}")
print(f"Wins: {d['total_wins']}, Losses: {d['total_losses']}")
print(f"Win Rate: {d['total_wins']/d['total_trades']*100:.1f}%")
print(f"Total PNL: ${d['total_pnl']:.2f}")
print(f"Elapsed: {d['elapsed']}")
print()

print(f"=== CLOSED POSITIONS ({len(closed)}) ===")
print(f"{'#':<3} {'Symbol':<15} {'Side':<6} {'Entry':<10} {'Close':<10} {'PNL':<10} {'Reason':<20} {'Strat':<15}")
print("-" * 90)

wins = []
losses = []
by_strat = {}
by_reason = {}

for i, p in enumerate(closed):
    pnl = p['pnl']
    sym = p['sym']
    side = p['side']
    entry = p['entry']
    close = p['closed_price']
    reason = p['reason']
    strat = p['strat']
    
    if pnl > 0:
        wins.append(pnl)
    else:
        losses.append(pnl)
    
    by_strat[strat] = by_strat.get(strat, []) + [pnl]
    by_reason[reason] = by_reason.get(reason, []) + [pnl]
    
    pnl_str = f"+${pnl:.2f}" if pnl > 0 else f"-${abs(pnl):.2f}"
    print(f"{i+1:<3} {sym:<15} {side:<6} {entry:<10} {close:<10} {pnl_str:<10} {reason:<20} {strat:<15}")

print()
print("=== STRATEGY PERFORMANCE ===")
for strat, pnls in sorted(by_strat.items(), key=lambda x: sum(x[1]), reverse=True):
    w = len([p for p in pnls if p > 0])
    l = len([p for p in pnls if p <= 0])
    total = sum(pnls)
    avg = total / len(pnls) if pnls else 0
    print(f"  {strat:<15} | {len(pnls):>2} trades | {w}W/{l}L | Total: ${total:>8.2f} | Avg: ${avg:>7.2f}")

print()
print("=== CLOSE REASONS ===")
for reason, pnls in sorted(by_reason.items(), key=lambda x: sum(x[1]), reverse=True):
    total = sum(pnls)
    print(f"  {reason:<25} | {len(pnls):>2} trades | Total: ${total:>8.2f}")

print()
print(f"=== OPEN POSITIONS ({len(opens)}) ===")
for p in opens:
    pnl_str = f"+${p['pnl_usd']:.2f}" if p['pnl_usd'] > 0 else f"-${abs(p['pnl_usd']):.2f}"
    print(f"  {p['sym']:<15} {p['side']:<6} entry={p['entry']:<10} current={p['current_price']:<10} PNL={pnl_str:<10} strat={p.get('strat','?')}")
