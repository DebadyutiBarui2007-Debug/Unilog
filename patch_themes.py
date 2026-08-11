import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Update theme state
content = content.replace(
    "const [theme, setTheme] = useState<'cyber-cobalt' | 'clean-slate' | 'titanium-amber'>('cyber-cobalt');",
    "const [theme, setTheme] = useState<'cyber-cobalt' | 'clean-slate' | 'titanium-amber' | 'nordic-frost' | 'matcha-latte'>('cyber-cobalt');"
)

# Update handleThemeChange signature and mapping
old_handle = """  const handleThemeChange = (newTheme: 'cyber-cobalt' | 'clean-slate' | 'titanium-amber') => {
    if (newTheme === theme) return;
    setTheme(newTheme);
    const themeLabels = {
      'cyber-cobalt': 'Cyber Obsidian Dark',
      'clean-slate': 'Executive Light',
      'titanium-amber': 'Titanium Amber Industrial'
    };"""

new_handle = """  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  
  const handleThemeChange = (newTheme: 'cyber-cobalt' | 'clean-slate' | 'titanium-amber' | 'nordic-frost' | 'matcha-latte') => {
    if (newTheme === theme) return;
    setIsThemeTransitioning(true);
    setTimeout(() => {
      setTheme(newTheme);
      setIsThemeTransitioning(false);
    }, 200); // Wait for fade out

    const themeLabels = {
      'cyber-cobalt': 'Cyber Obsidian Dark',
      'clean-slate': 'Executive Light',
      'titanium-amber': 'Titanium Amber Industrial',
      'nordic-frost': 'Nordic Frost',
      'matcha-latte': 'Matcha Latte'
    };"""
content = content.replace(old_handle, new_handle)

# Update theme booleans
old_bools = """  // Theme Styling Helpers
  const isLight = theme === 'clean-slate';
  const isAmber = theme === 'titanium-amber';"""

new_bools = """  // Theme Styling Helpers
  const isLight = theme === 'clean-slate' || theme === 'matcha-latte';
  const isAmber = theme === 'titanium-amber';
  const isNordic = theme === 'nordic-frost';
  const isMatcha = theme === 'matcha-latte';"""
content = content.replace(old_bools, new_bools)

# Update themeStyles
old_styles = """  const themeStyles = {
    bg: isLight ? 'bg-[#F8FAFC] text-slate-800' : isAmber ? 'bg-[#101114] text-gray-200' : 'bg-[#0A0D14] text-gray-200',
    headerBg: isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isAmber ? 'bg-[#18191E] border-[#2A2D35] text-white' : 'bg-[#0F131E] border-[#1E2638] text-white',
    cardBg: isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : isAmber ? 'bg-[#1A1C22] border-[#2B2E38]' : 'bg-[#121622] border-[#1E2638]',
    innerBg: isLight ? 'bg-[#F1F5F9] border-slate-200 text-slate-900' : isAmber ? 'bg-[#111216] border-[#2B2E38] text-white' : 'bg-[#0A0D14] border-[#1E2638] text-white',
    textMain: isLight ? 'text-slate-900' : 'text-white',
    textMuted: isLight ? 'text-slate-500' : 'text-gray-400',
    accentBtn: isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : isAmber ? 'bg-amber-500 hover:bg-amber-600 text-black font-bold' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    accentText: isLight ? 'text-blue-600' : isAmber ? 'text-amber-400' : 'text-blue-400',
    accentBorder: isLight ? 'border-blue-600' : isAmber ? 'border-amber-500' : 'border-blue-500',
    navBg: isLight ? 'bg-slate-100 border-slate-200' : isAmber ? 'bg-[#131418] border-[#2B2E38]' : 'bg-[#0B0E17] border-[#1E2638]'
  };"""

new_styles = """  const themeStyles = {
    bg: isMatcha ? 'bg-[#F4F7F4] text-slate-800' : isNordic ? 'bg-[#ECEFF4] text-[#2E3440]' : isLight ? 'bg-[#F8FAFC] text-slate-800' : isAmber ? 'bg-[#101114] text-gray-200' : 'bg-[#0A0D14] text-gray-200',
    headerBg: isMatcha ? 'bg-[#E8EDE8] border-[#D1DDD1] text-slate-900 shadow-sm' : isNordic ? 'bg-[#E5E9F0] border-[#D8DEE9] text-[#2E3440] shadow-sm' : isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : isAmber ? 'bg-[#18191E] border-[#2A2D35] text-white' : 'bg-[#0F131E] border-[#1E2638] text-white',
    cardBg: isMatcha ? 'bg-white border-[#D1DDD1] text-slate-800 shadow-sm' : isNordic ? 'bg-[#ECEFF4] border-[#D8DEE9] text-[#3B4252] shadow-sm' : isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : isAmber ? 'bg-[#1A1C22] border-[#2B2E38]' : 'bg-[#121622] border-[#1E2638]',
    innerBg: isMatcha ? 'bg-[#F9FAF9] border-[#D1DDD1] text-slate-900' : isNordic ? 'bg-[#FFFFFF] border-[#D8DEE9] text-[#2E3440]' : isLight ? 'bg-[#F1F5F9] border-slate-200 text-slate-900' : isAmber ? 'bg-[#111216] border-[#2B2E38] text-white' : 'bg-[#0A0D14] border-[#1E2638] text-white',
    textMain: isMatcha ? 'text-slate-900' : isNordic ? 'text-[#2E3440]' : isLight ? 'text-slate-900' : 'text-white',
    textMuted: isMatcha ? 'text-slate-500' : isNordic ? 'text-[#4C566A]' : isLight ? 'text-slate-500' : 'text-gray-400',
    accentBtn: isMatcha ? 'bg-[#6D9F71] hover:bg-[#5C8960] text-white shadow-sm' : isNordic ? 'bg-[#5E81AC] hover:bg-[#81A1C1] text-white shadow-sm' : isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : isAmber ? 'bg-amber-500 hover:bg-amber-600 text-black font-bold' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    accentText: isMatcha ? 'text-[#6D9F71]' : isNordic ? 'text-[#5E81AC]' : isLight ? 'text-blue-600' : isAmber ? 'text-amber-400' : 'text-blue-400',
    accentBorder: isMatcha ? 'border-[#6D9F71]' : isNordic ? 'border-[#5E81AC]' : isLight ? 'border-blue-600' : isAmber ? 'border-amber-500' : 'border-blue-500',
    navBg: isMatcha ? 'bg-[#E8EDE8] border-[#D1DDD1]' : isNordic ? 'bg-[#E5E9F0] border-[#D8DEE9]' : isLight ? 'bg-slate-100 border-slate-200' : isAmber ? 'bg-[#131418] border-[#2B2E38]' : 'bg-[#0B0E17] border-[#1E2638]'
  };"""
content = content.replace(old_styles, new_styles)

# Inject AnimatePresence overlay for cross-fading themes at the start of return
old_return = """  return (
    <div className={`min-h-screen ${themeStyles.bg} flex flex-col font-sans transition-colors duration-500 relative overflow-hidden`}>"""

new_return = """  return (
    <div className={`min-h-screen ${themeStyles.bg} flex flex-col font-sans transition-colors duration-500 relative overflow-hidden`}>
      <AnimatePresence>
        {isThemeTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute inset-0 z-[100] ${themeStyles.bg} pointer-events-none`}
          />
        )}
      </AnimatePresence>"""
content = content.replace(old_return, new_return)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Successfully patched themes.")
