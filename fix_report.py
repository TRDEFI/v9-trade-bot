#!/usr/bin/env python3
import json
from datetime import datetime

# Load the latest update
with open('self_evolution_log.json') as f:
    data = json.load(f)

last_update = data['updates'][-1]

# Get actual open positions count from dashboard (fetch or use known value)
# For this run we know from earlier curl: 2 open positions
open_positions = 2

# Read the existing report
filename = "monitoring_report_cron_2026-05-26_01-02.md"
with open(filename, 'r') as f:
    report = f.read()

# Fix the open positions line
report = report.replace(
    "| **Open Positions** | 19 currently active trades |",
    f"| **Open Positions** | {open_positions} (BCHUSDT SHORT, ATOMUSDT SHORT) |"
)

# Also fix the "Open Positions" line in executive summary
report = report.replace(
    "- **Open Positions:** 19 currently active trades",
    f"- **Open Positions:** {open_positions} (BCHUSDT SHORT, ATOMUSDT SHORT)"
)

# Fix the "Open Positions" line in system health
report = report.replace(
    "| Open Positions | 19 | Moderate exposure |",
    f"| Open Positions | {open_positions} | {'Small exposure' if open_positions < 3 else 'Moderate exposure'} |"
)

# Write back
with open(filename, 'w') as f:
    f.write(report)

print(f"Report updated: {filename}")
