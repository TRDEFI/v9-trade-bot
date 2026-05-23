#!/bin/bash
set -e
cd /workspace/v9-repo

# Fetch latest from origin
git fetch origin

# Stash any local changes (including modifications to self_evolution_log.json) so we can rebase cleanly
if ! git diff-index --quiet HEAD --; then
    git stash push -m "stash before hourly push"
fi

# Rebase onto origin/main to incorporate any remote changes
git rebase origin/main

# If we had stashed changes, pop them back
if git stash list | grep -q "stash before hourly push"; then
    git stash pop || echo "Warning: stash pop failed, but continuing"
fi

# Now add the log file (which should reflect the agent's latest updates)
git add self_evolution_log.json

# Get latest capital and pnl from the log
CAPITAL_PNL=$(python3 -c "import sys,json; d=json.load(open('self_evolution_log.json')); u=d['updates'][-1]; print(f'Capital {u[\"capital\"]} PnL {u[\"total_pnl\"]}')" 2>/dev/null || echo "Capital N/A PnL N/A")

git commit -m "evolution: hourly update $CAPITAL_PNL"
git push origin main