with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    content = f.read()

# Replace pointer-events-auto on the backdrop to pointer-events-none
content = content.replace(
    'className="absolute inset-0 bg-[#060913]/70 backdrop-blur-sm pointer-events-auto transition-all duration-500"',
    'className="absolute inset-0 bg-[#060913]/70 backdrop-blur-sm transition-all duration-500"'
)

# Also wait, the parent has pointer-events-none, so the backdrop is already pointer-events-none if we remove auto.

# Add a global click handler to block clicks outside
effect_code = """  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Find if we clicked on the target element or inside the tutorial tooltip
      const targetElement = currentStep.elementId ? document.getElementById(currentStep.elementId) : null;
      
      const path = e.composedPath();
      const clickedOnTarget = targetElement && path.includes(targetElement);
      
      // If the user clicked outside the target element, block the click!
      // But wait, they need to be able to click INSIDE the tutorial tooltip (next button, etc)
      // The tutorial tooltip has a specific class or we can just look for z-[65]
      const clickedOnTooltip = (e.target as HTMLElement).closest('.tutorial-tooltip-container');
      
      if (!clickedOnTarget && !clickedOnTooltip) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    
    // Use capture phase to intercept before React synthetic events
    window.addEventListener('click', handleGlobalClick, true);
    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
    };
  }, [currentStep.elementId]);"""

# Insert it before handleNext
content = content.replace("  const handleNext = () => {", effect_code + "\n\n  const handleNext = () => {")

# Add class 'tutorial-tooltip-container' to the tooltip div
content = content.replace(
    'className="pointer-events-auto transition-all duration-500 ease-out"',
    'className="tutorial-tooltip-container pointer-events-auto transition-all duration-500 ease-out"'
)

with open('src/components/InteractiveTutorial.tsx', 'w') as f:
    f.write(content)

print("Applied click blocker patch.")
