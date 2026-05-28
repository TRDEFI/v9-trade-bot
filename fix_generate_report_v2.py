with open('generate_cron_report.py', 'r') as f:
    content = f.read()

# Remove the incorrectly inserted lines
content = content.replace(
    '        runner_pct = autopsy.get("runner_pct", 0)\n        tp_captured = autopsy["tp_captured_pct_of_runner"]\n        if runner_pct > 0:\n            efficiency = tp_captured / runner_pct * 100\n            tp_captured_str = f"{tp_captured*100:.1f}% of runner ({efficiency:.0f}% efficiency)"\n        else:\n            tp_captured_str = f"{tp_captured*100:.1f}% of runner (N/A)"\n',
    ''
)

# Now find the line with the problematic TP Captured and replace it with a safer inline conditional
# The original line was:
# - **TP Captured:** {autopsy['tp_captured_pct_of_runner']*100:.1f}% of runner ({autopsy['tp_captured_pct_of_runner']/autopsy['runner_pct']*100:.0f}% efficiency) if autopsy['runner_pct'] > 0 else 'N/A'

# Replace with a safer version that uses a nested conditional to avoid division by zero
# We'll use: {autopsy['tp_captured_pct_of_runner']/autopsy['runner_pct']*100:.0f} but only if runner_pct > 0
# Actually, we can use a lambda or precompute, but within f-string we can do:
# {autopsy['tp_captured_pct_of_runner']/autopsy['runner_pct']*100:.0f if autopsy.get('runner_pct',0) > 0 else ''} but that still divides

# Better approach: use a helper function or compute before f-string. Since we're inside a loop,
# we can add code before the f-string to compute the value. Let's restructure.

# Find the block that builds the autopsy report
# We need to insert code before the f-string that computes the efficiency string
old_block = '''for i, autopsy in enumerate(latest['kline_autopsies'], 1):
        report += f\"\"\"### Detailed Kline Autopsy #{i}: {autopsy['sym']} {autopsy['side']}'''

new_block = '''for i, autopsy in enumerate(latest['kline_autopsies'], 1):
        # Pre-compute TP captured efficiency to avoid division by zero in f-string
        runner_pct = autopsy.get('runner_pct', 0)
        tp_captured_pct = autopsy['tp_captured_pct_of_runner']
        if runner_pct > 0:
            efficiency = tp_captured_pct / runner_pct * 100
            tp_captured_display = f"{tp_captured_pct*100:.1f}% of runner ({efficiency:.0f}% efficiency)"
        else:
            tp_captured_display = f"{tp_captured_pct*100:.1f}% of runner (N/A)"
        
        report += f\"\"\"### Detailed Kline Autopsy #{i}: {autopsy['sym']} {autopsy['side']}'''

content = content.replace(old_block, new_block)

# Now replace the TP Captured line to use the precomputed variable
content = content.replace(
    "- **TP Captured:** {autopsy['tp_captured_pct_of_runner']*100:.1f}% of runner ({autopsy['tp_captured_pct_of_runner']/autopsy['runner_pct']*100:.0f}% efficiency) if autopsy['runner_pct'] > 0 else 'N/A'",
    "- **TP Captured:** {tp_captured_display}"
)

with open('generate_cron_report.py', 'w') as f:
    f.write(content)

print("Fixed v2!")
