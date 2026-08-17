with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    content = f.read()

bad_str = """                  {currentStep.learnMoreMarkdown.split('\\n\\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('###')) {
                      return (
                        <h4 key={pIdx} className="text-sm font-black text-white uppercase border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-cyan-500 rounded-sm inline-block"></span>
                          {paragraph.replace('###', '').trim()}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('-') || paragraph.startsWith('*') || re.match(r'^\\d\\.', paragraph)):
                      # We'll just render it raw for now due to python escaping limits, 
                      # wait, I can just use JS to render this dynamically.
                      pass
                      
                    # ... The original JS logic was fine. Let's just output it exactly.
                    pass
                  })}
                  {/* Actually let's just insert the exact original JS code block here */}"""

content = content.replace(bad_str, "")

with open('src/components/InteractiveTutorial.tsx', 'w') as f:
    f.write(content)
