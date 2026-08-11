import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace the loader header
old_header = """              {/* Loader Header */}
              <div className="space-y-1.5">
                <h1 className="text-xl font-black text-white tracking-wider uppercase">
                  UNILOG <span className="font-light text-indigo-400">PRODUCT INTELLIGENCE</span>
                </h1>
                
                {/* Dynamic Status Readout */}
                <div className="h-6 flex items-center justify-center">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    bootProgress < 25 ? "bg-indigo-950/80 text-indigo-300 border-indigo-800/50" :
                    bootProgress < 50 ? "bg-teal-950/80 text-teal-300 border-teal-800/50" :
                    bootProgress < 75 ? "bg-purple-950/80 text-purple-300 border-purple-800/50" :
                    "bg-amber-950/80 text-amber-300 border-amber-800/50"
                  }`}>
                    {bootProgress < 25 && "⚡ [Stage 1/4] Loading ETIM Dictionary Schema"}
                    {bootProgress >= 25 && bootProgress < 50 && "🛰️ [Stage 2/4] Indexing UNSPSC Classifications"}
                    {bootProgress >= 50 && bootProgress < 75 && "🧬 [Stage 3/4] Warming Gemini 3.6 Parse Pipes"}
                    {bootProgress >= 75 && "🚀 [Stage 4/4] Establishing Secure Firestore Sync"}
                  </span>
                </div>
              </div>"""

new_header = """              {/* Welcome Loader Header */}
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-3xl font-black text-white tracking-wider"
                >
                  Welcome to <span className="font-light text-indigo-400">Unilog</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="text-slate-300 font-sans text-lg"
                >
                  We're preparing your Product Intelligence Workspace...
                </motion.p>
                
                {/* Dynamic Status Readout */}
                <div className="h-6 flex items-center justify-center mt-4">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-colors duration-500 ${
                    bootProgress < 25 ? "bg-indigo-950/80 text-indigo-300 border-indigo-800/50" :
                    bootProgress < 50 ? "bg-teal-950/80 text-teal-300 border-teal-800/50" :
                    bootProgress < 75 ? "bg-purple-950/80 text-purple-300 border-purple-800/50" :
                    "bg-amber-950/80 text-amber-300 border-amber-800/50"
                  }`}>
                    {bootProgress < 25 && "Gathering your tools..."}
                    {bootProgress >= 25 && bootProgress < 50 && "Loading intelligence models..."}
                    {bootProgress >= 50 && bootProgress < 75 && "Organizing your dashboard..."}
                    {bootProgress >= 75 && "Almost there..."}
                  </span>
                </div>
              </div>"""

if old_header in content:
    content = content.replace(old_header, new_header)
    with open("src/App.tsx", "w") as f:
        f.write(content)
    print("Successfully replaced loader header.")
else:
    print("Could not find old header.")
