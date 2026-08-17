import re

with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    content = f.read()

# Replace tutorialSteps array
with open('steps.ts', 'r') as f:
    new_steps = f.read()

content = re.sub(
    r'const tutorialSteps: TutorialStep\[\] = \[\s*\{.*?\}\s*\];', 
    new_steps, 
    content, 
    flags=re.DOTALL
)

# Patch useEffect for scrolling
old_use_effect = """  useEffect(() => {
    setTimeout(updateTargetCoordinates, 80);
  }, [currentStepIdx, activeTab]);"""

new_use_effect = """  useEffect(() => {
    setTimeout(() => {
      if (currentStep.elementId) {
        const element = document.getElementById(currentStep.elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      updateTargetCoordinates();
    }, 150);
  }, [currentStepIdx, activeTab]);"""

content = content.replace(old_use_effect, new_use_effect)

with open('src/components/InteractiveTutorial.tsx', 'w') as f:
    f.write(content)

print("Patch applied successfully.")
