#!/bin/bash
echo "=== DASHBOARD STATUS ==="
python3 /workspace/v9-repo/check_dashboard.py 2>/dev/null || echo "Dashboard check script not found"
echo ""
echo "=== EVOLUTION LOG SUMMARY ==="
python3 /workspace/v9-repo/verify_trades.py
echo ""
echo "=== LATEST REPORT ==="
ls -lh /workspace/v9-repo/monitoring_report_final_*.md | tail -1
