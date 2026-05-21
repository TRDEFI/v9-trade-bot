import json
from datetime import datetime

with open('/tmp/dashboard_latest.json') as f:
    d = json.load(f)

closed = d.get('closed', [])

lines = []
lines.append("=" * 100)
lines.append("V9 TRADE BOT - CLOSED POSITIONS LOG")
lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
lines.append("=" * 100)
lines.append("")
lines.append(f"Total Trades: {d['total_trades']}")
lines.append(f"Wins: {d['total_wins']}, Losses: {d['total_losses']}")
lines.append(f"Win Rate: {d['total_wins']/d['total_trades']*100:.1f}%")
lines.append(f"Total PNL: ${d['total_pnl']:.2f}")
lines.append(f"Elapsed: {d['elapsed']}")
lines.append(f"Capital: ${d['capital']:.2f}")
lines.append("")
lines.append("-" * 100)
lines.append(f"{'#':<4} {'Symbol':<15} {'Side':<6} {'Entry':<12} {'Close':<12} {'PNL':<12} {'Reason':<22} {'Strat':<18}")
lines.append("-" * 100)

for i, p in enumerate(closed):
    pnl = p['pnl']
    pnl_str = f"+${pnl:.2f}" if pnl > 0 else f"-${abs(pnl):.2f}"
    lines.append(f"{i+1:<4} {p['sym']:<15} {p['side']:<6} {p['entry']:<12} {p['closed_price']:<12} {pnl_str:<12} {p['reason']:<22} {p['strat']:<18}")

lines.append("")
lines.append("-" * 100)
lines.append("OPEN POSITIONS")
lines.append("-" * 100)

for p in d.get('opens', []):
    pnl_str = f"+${p['pnl_usd']:.2f}" if p['pnl_usd'] > 0 else f"-${abs(p['pnl_usd']):.2f}"
    lines.append(f"  {p['sym']:<15} {p['side']:<6} entry={p['entry']:<12} current={p['current_price']:<12} PNL={pnl_str:<12} strat={p.get('strat','?')}")

lines.append("")
lines.append("=" * 100)

output = "\n".join(lines)
print(output)

# Save to file
timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
filename = f"/tmp/closed_positions_{timestamp}.txt"
with open(filename, 'w', encoding='utf-8') as f:
    f.write(output)

print(f"\nSaved to: {filename}")
