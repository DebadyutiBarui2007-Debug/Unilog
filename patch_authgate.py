import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Inject the AuthGate inside App.tsx render
old_footer = """        )}
      </AnimatePresence>

      {/* Onboarding Interactive Tutorial Portal Overlay */}"""

new_footer = """        )}
      </AnimatePresence>

      {/* Secure Auth Gate for New Users */}
      <AnimatePresence>
        {!isBooting && !user && !authSkipped && (
          <AuthGate 
            login={login} 
            onSkip={() => setAuthSkipped(true)} 
            themeStyles={themeStyles} 
            isLight={isLight} 
            isAmber={isAmber} 
          />
        )}
      </AnimatePresence>

      {/* Onboarding Interactive Tutorial Portal Overlay */}"""

if old_footer in content:
    content = content.replace(old_footer, new_footer)
    with open("src/App.tsx", "w") as f:
        f.write(content)
    print("Successfully patched App.tsx with AuthGate.")
else:
    print("Could not find footer.")
