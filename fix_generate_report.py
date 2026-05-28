import sys

with open('generate_cron_report.py', 'r') as f:
    lines = f.readlines()

new_lines = []
skip_next = False
for i, line in enumerate(lines):
    if skip_next:
        skip_next = False
        continue
    if 'efficiency = (autopsy' in line and 'tp_captured_pct_of_runner' in line:
        # Replace these two lines with safer code
        new_lines.append('        runner_pct = autopsy.get("runner_pct", 0)\n')
        new_lines.append('        tp_captured = autopsy["tp_captured_pct_of_runner"]\n')
        new_lines.append('        if runner_pct > 0:\n')
        new_lines.append('            efficiency = tp_captured / runner_pct * 100\n')
        new_lines.append('            tp_captured_str = f"{tp_captured*100:.1f}% of runner ({efficiency:.0f}% efficiency)"\n')
        new_lines.append('        else:\n')
        new_lines.append('            tp_captured_str = f"{tp_captured*100:.1f}% of runner (N/A)"\n')
        # Skip the next line which is the old - **TP Captured** line
        skip_next = True
        continue
    new_lines.append(line)

with open('generate_cron_report.py', 'w') as f:
    f.writelines(new_lines)

print("Fixed!")
