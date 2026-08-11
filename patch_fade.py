import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# I want to add `transitionTheme` state
state_search = "  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);"
state_replace = """  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<'cyber-cobalt' | 'clean-slate' | 'titanium-amber' | 'nordic-frost' | 'matcha-latte' | null>(null);"""

if state_search in content:
    content = content.replace(state_search, state_replace)

old_handle = """  const handleThemeChange = (newTheme: 'cyber-cobalt' | 'clean-slate' | 'titanium-amber' | 'nordic-frost' | 'matcha-latte') => {
    if (newTheme === theme) return;
    setIsThemeTransitioning(true);
    setTimeout(() => {
      setTheme(newTheme);
      setIsThemeTransitioning(false);
    }, 200); // Wait for fade out"""

new_handle = """  const handleThemeChange = (newTheme: 'cyber-cobalt' | 'clean-slate' | 'titanium-amber' | 'nordic-frost' | 'matcha-latte') => {
    if (newTheme === theme) return;
    setTransitionTarget(newTheme);
    setIsThemeTransitioning(true);
    
    // Framer motion fade sequence:
    setTimeout(() => {
      setTheme(newTheme); // underlying theme changes while hidden
      setTimeout(() => {
        setIsThemeTransitioning(false);
        setTransitionTarget(null);
      }, 50);
    }, 300); // Wait 300ms for overlay to fade in completely"""

if old_handle in content:
    content = content.replace(old_handle, new_handle)

# We need a helper to get the bg color of the transition target
helper_search = "  const isMatcha = theme === 'matcha-latte';"
helper_replace = """  const isMatcha = theme === 'matcha-latte';
  
  // Overlay Helper for smooth cross-fade
  const tTheme = transitionTarget || theme;
  const overlayBg = tTheme === 'matcha-latte' ? 'bg-[#F4F7F4]' : tTheme === 'nordic-frost' ? 'bg-[#ECEFF4]' : tTheme === 'clean-slate' ? 'bg-[#F8FAFC]' : tTheme === 'titanium-amber' ? 'bg-[#101114]' : 'bg-[#0A0D14]';"""

if helper_search in content:
    content = content.replace(helper_search, helper_replace)

old_overlay = """            className={`absolute inset-0 z-[100] ${themeStyles.bg} pointer-events-none`}"""
new_overlay = """            className={`absolute inset-0 z-[100] ${overlayBg} pointer-events-none`}"""

if old_overlay in content:
    content = content.replace(old_overlay, new_overlay)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Fade sequence patched.")
