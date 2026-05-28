#!/bin/bash
set -e
cd /workspace/v9-repo

# Stash local changes
git stash push -m "stash before hourly push" || true

# Reapply our changes (stash)
if git stash list | grep -q "stash before hourly push"; then
    git stash pop || echo "Warning: stash pop failed, but continuing"
fi

# If there are conflicts, resolve them by taking our version (the stash) for self_evolution_log.json
if git diff --name-only --diff-filter=U | grep -q self_evolution_log.json; then
    git checkout --ours self_evolution_log.json
fi
