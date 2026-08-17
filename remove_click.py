with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    lines = f.readlines()

out = []
skip = False
for line in lines:
    if "useEffect(() => {" in line and "handleGlobalClick" in lines[lines.index(line) + 1]:
        skip = True
    
    if skip:
        if "}, [currentStep.elementId]);" in line:
            skip = False
        continue
        
    out.append(line)

with open('src/components/InteractiveTutorial.tsx', 'w') as f:
    f.writelines(out)

