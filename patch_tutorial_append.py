new_render_str = r"""  return (
    <div className="fixed inset-0 z-[60] pointer-events-none font-mono flex items-center justify-center">
      {/* Dimmed Background Overlay */}
      <div className="absolute inset-0 bg-[#060913]/70 backdrop-blur-sm pointer-events-auto transition-all duration-500" />

      {/* Spotlight glowing indicator over the active element */}
      {targetRect && (
        <motion.div
          layoutId="tutorialSpotlight"
          initial={false}
          animate={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="fixed border-2 border-cyan-400 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.4)] bg-cyan-400/10 animate-pulse pointer-events-none z-[61] flex items-center justify-center"
        >
          {/* Animated pointer finger indicating direct interaction */}
          <div className="absolute -bottom-10 right-1/2 translate-x-1/2 text-cyan-950 font-black bg-cyan-400 border border-cyan-200 px-3 py-1 rounded-md text-[10px] flex items-center gap-1.5 uppercase tracking-wider shadow-xl animate-bounce whitespace-nowrap">
            <MousePointerClick size={12} />
            <span>Interactive Action</span>
          </div>
        </motion.div>
      )}

      {/* Floating Tutorial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIdx}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            top: tooltipPos.top,
            left: tooltipPos.left
          }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 250, damping: 25 }}
          className={`fixed w-[400px] max-h-[85vh] overflow-y-auto global-scroll-container bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[62] pointer-events-auto flex flex-col ${
            isLight ? 'bg-white border-blue-600 text-slate-800 shadow-2xl' : 'text-gray-100'
          }`}
          style={{ position: 'fixed' }}
        >
          {/* Progress Bar (Top) */}
          <div className="w-full h-1.5 bg-slate-800 rounded-t-2xl overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIdx + 1) / tutorialSteps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* Inner Content Padding */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                  <Sparkles className="text-cyan-400 animate-pulse" size={16} />
                </div>
                <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase tracking-widest">
                  Expert Tutorial
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-cyan-300 font-bold bg-cyan-900/40 border border-cyan-800 px-2.5 py-1 rounded-full shadow-inner">
                  {currentStepIdx + 1} of {tutorialSteps.length}
                </span>
                <button 
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
                  title="Exit Tutorial"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Title */}
            <h4 className={`text-[15px] font-black mb-3 tracking-wide leading-tight ${isLight ? 'text-indigo-600' : 'text-white'}`}>
              {currentStep.title}
            </h4>

            {/* Description */}
            <p className={`text-[12px] leading-relaxed mb-5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {currentStep.description}
            </p>

            {/* Objective Action Box */}
            <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-5 shadow-inner ${isLight ? 'bg-slate-50 border-slate-200' : ''}`}>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase font-black mb-2 tracking-wider">
                <CheckCircle2 size={12} /> Expected Action
              </div>
              <div className={`text-[11px] leading-relaxed flex items-start gap-2 ${isLight ? 'text-slate-700' : 'text-slate-200'} font-semibold`}>
                <ArrowRight size={13} className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <span>{currentStep.expectedActionMessage}</span>
              </div>

              {/* Quick Simulation Option */}
              {currentStep.elementId && (
                <button
                  onClick={handleSimulateAndProceed}
                  className="mt-4 w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg"
                >
                  <Cpu size={12} className="text-cyan-400" /> Auto-Simulate & Proceed
                </button>
              )}
            </div>

            {/* Navigation & Tech details */}
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-700/50">
              <button
                onClick={() => setShowLearnMore(true)}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2 py-1.5 -ml-2 rounded-lg hover:bg-cyan-500/10"
              >
                <Info size={13} />
                Architecture Deep Dive
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIdx === 0}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-slate-300 transition-colors"
                  title="Previous Step"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>{currentStepIdx === tutorialSteps.length - 1 ? "Finish & Explore" : "Next Step"}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide-out Learn More Tech Deep Dive Panel */}
      <AnimatePresence>
        {showLearnMore && (
          <div className="fixed inset-0 z-[70] bg-[#060913]/90 backdrop-blur-md flex justify-end pointer-events-auto">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-[#0C101C] border-l border-cyan-500/30 h-full p-8 flex flex-col justify-between overflow-y-auto text-slate-300 shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                      <BookOpen size={20} className="text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">
                      Engineering Architecture Log
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowLearnMore(false)}
                    className="text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors bg-slate-900 border border-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                <h2 className="text-lg font-black text-cyan-400 tracking-wide mb-6">
                  {currentStep.learnMoreTitle}
                </h2>

                <div className="text-[13px] leading-relaxed space-y-5 font-mono text-slate-400">
                  {currentStep.learnMoreMarkdown.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('###')) {
                      return (
                        <h4 key={pIdx} className="text-sm font-black text-white uppercase border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-cyan-500 rounded-sm inline-block"></span>
                          {paragraph.replace('###', '').trim()}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('-') || paragraph.startsWith('*') || re.match(r'^\d\.', paragraph)):
                      # We'll just render it raw for now due to python escaping limits, 
                      # wait, I can just use JS to render this dynamically.
                      pass
                      
                    # ... The original JS logic was fine. Let's just output it exactly.
                    pass
                  })}
                  {/* Actually let's just insert the exact original JS code block here */}
"""

# Let's write the exact React code string for the slide-out panel map
new_render_str_part2 = r"""                  {currentStep.learnMoreMarkdown.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('###')) {
                      return (
                        <h4 key={pIdx} className="text-sm font-black text-white uppercase border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-cyan-500 rounded-sm inline-block"></span>
                          {paragraph.replace('###', '').trim()}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('-') || paragraph.startsWith('*') || paragraph.match(/^\d\./)) {
                      return (
                        <ul key={pIdx} className="space-y-2 pl-2">
                          {paragraph.split('\n').map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2">
                              <span className="text-cyan-500 mt-1 shrink-0">•</span>
                              <span className="text-slate-300">{item.replace(/^-\s*|^\*\s*|^\d\.\s*/, '').trim()}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={pIdx} className="text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 shadow-inner">{paragraph}</p>;
                  })}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800 mt-8 flex justify-end">
                <button
                  onClick={() => setShowLearnMore(false)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-colors flex items-center gap-2"
                >
                  <ArrowRight size={14} /> Return to Tutorial
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
"""

with open('src/components/InteractiveTutorial.tsx', 'a') as f:
    f.write(new_render_str)
    f.write(new_render_str_part2)

