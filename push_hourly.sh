#!/bin/bash
set -e
cd /workspace/v9-repo
git pull --rebase origin main 2>/dev/null || true
# Get latest capital and pnl from the log
CAPITAL_PNL=$(python3 -c "import sys,json; d=json.load(open('self_evolution_log.json')); u=d['updates'][-1]; print(f'Capital {u[\"capital\"]} PnL {u[\"total_pnl\"]}')" 2>/dev/null || echo "Capital N/A PnL N/A")
git add self_evolution_log.json
git commit -m "evolution: hourly update $CAPITAL_PNL"
git push origin main