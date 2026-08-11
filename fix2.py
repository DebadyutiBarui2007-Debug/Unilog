with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if line.strip() == 'title: "6. Compare View (Side-by-Side Mode)",':
        if 'id: 6' not in lines[i-1]:
            new_lines.append('    {\n')
            new_lines.append('      id: 6,\n')
    elif line.strip() == '{' and 'id: 6' in lines[i+1] and 'title:' not in lines[i+2]:
        # skip malformed insertions
        continue
    elif line.strip() == 'id: 6,' and 'elementId' in lines[i+1]:
        continue
    new_lines.append(line)

with open('src/components/InteractiveTutorial.tsx', 'w') as f:
    f.writelines(new_lines)
