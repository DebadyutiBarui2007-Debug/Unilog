import re

with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    content = f.read()

# I will extract the whole tutorialSteps array
start_idx = content.find("const tutorialSteps: TutorialStep[] = [")
end_idx = content.find("  ];\n  const currentStep = tutorialSteps[currentStepIdx];")

if start_idx != -1 and end_idx != -1:
    pre = content[:start_idx]
    post = content[end_idx:]
    array_content = content[start_idx:end_idx]
    
    # We can split the array by "    {"
    steps_raw = array_content.split("    {\n")
    
    # Clean up
    steps = []
    for step in steps_raw:
        if step.strip() == "const tutorialSteps: TutorialStep[] = [":
            continue
        if step.strip():
            steps.append("    {\n" + step)

    # Let's clean out the badly inserted steps (they might be merged or malformed)
    # The safest way is to rebuild it using the clean blocks
    # I can just re-download or if there's no backup, I have to parse the malformed array
