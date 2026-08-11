import re

with open("src/App.tsx", "r") as f:
    content = f.read()

old_chooser = """        {/* Theme Chooser Bar with Sliding Motion Pill */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121622]/80 border-slate-800/80'} backdrop-blur-md transition-colors duration-500`}>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 text-gray-400 font-mono flex items-center gap-1">
            <Palette size={12} className={isAmber ? 'text-amber-400' : isLight ? 'text-blue-600' : 'text-indigo-400'} />
            Theme:
          </span>
          <button
            onClick={() => handleThemeChange('cyber-cobalt')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 ${
              theme === 'cyber-cobalt' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Cyber Obsidian & Cobalt Dark"
          >
            {theme === 'cyber-cobalt' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-indigo-600 rounded-lg shadow-md shadow-indigo-600/30 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            A. Cyber Obsidian
          </button>
          <button
            onClick={() => handleThemeChange('clean-slate')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 ${
              theme === 'clean-slate' ? 'text-white' : 'text-gray-400 hover:text-slate-900'
            }`}
            title="Clean Slate Enterprise Light"
          >
            {theme === 'clean-slate' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-slate-900 rounded-lg shadow-md -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            B. Executive Light
          </button>
          <button
            onClick={() => handleThemeChange('titanium-amber')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 ${
              theme === 'titanium-amber' ? 'text-black font-bold' : 'text-gray-400 hover:text-amber-400'
            }`}
            title="Titanium & Warm Amber Industrial"
          >
            {theme === 'titanium-amber' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-amber-500 rounded-lg shadow-md shadow-amber-500/20 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            C. Titanium Amber
          </button>
        </div>"""

new_chooser = """        {/* Theme Chooser Bar with Sliding Motion Pill */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${themeStyles.navBg} backdrop-blur-md transition-colors duration-500 overflow-x-auto max-w-full custom-scrollbar`}>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 text-gray-400 font-mono flex items-center gap-1 whitespace-nowrap">
            <Palette size={12} className={themeStyles.accentText} />
            Theme:
          </span>
          <button
            onClick={() => handleThemeChange('cyber-cobalt')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 whitespace-nowrap ${
              theme === 'cyber-cobalt' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {theme === 'cyber-cobalt' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-indigo-600 rounded-lg shadow-md shadow-indigo-600/30 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Cyber Obsidian
          </button>
          <button
            onClick={() => handleThemeChange('clean-slate')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 whitespace-nowrap ${
              theme === 'clean-slate' ? 'text-white' : 'text-gray-400 hover:text-slate-900'
            }`}
          >
            {theme === 'clean-slate' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-slate-900 rounded-lg shadow-md -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Executive Light
          </button>
          <button
            onClick={() => handleThemeChange('titanium-amber')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 whitespace-nowrap ${
              theme === 'titanium-amber' ? 'text-black font-bold' : 'text-gray-400 hover:text-amber-400'
            }`}
          >
            {theme === 'titanium-amber' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-amber-500 rounded-lg shadow-md shadow-amber-500/20 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Titanium Amber
          </button>
          <button
            onClick={() => handleThemeChange('nordic-frost')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 whitespace-nowrap ${
              theme === 'nordic-frost' ? 'text-white' : 'text-gray-400 hover:text-[#5E81AC]'
            }`}
          >
            {theme === 'nordic-frost' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-[#5E81AC] rounded-lg shadow-md shadow-[#5E81AC]/20 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Nordic Frost
          </button>
          <button
            onClick={() => handleThemeChange('matcha-latte')}
            className={`relative px-3 py-1 text-[11px] font-mono rounded-lg font-semibold transition-colors duration-200 z-10 whitespace-nowrap ${
              theme === 'matcha-latte' ? 'text-white' : 'text-gray-400 hover:text-[#6D9F71]'
            }`}
          >
            {theme === 'matcha-latte' && (
              <motion.div
                layoutId="activeThemeHighlight"
                className="absolute inset-0 bg-[#6D9F71] rounded-lg shadow-md shadow-[#6D9F71]/20 -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            Matcha Latte
          </button>
        </div>"""

if old_chooser in content:
    content = content.replace(old_chooser, new_chooser)
    with open("src/App.tsx", "w") as f:
        f.write(content)
    print("Successfully patched theme chooser.")
else:
    print("Could not find old chooser.")
