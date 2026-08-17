import re

with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    content = f.read()

return_idx = content.find("return (")
if return_idx != -1:
    before_return = content[:return_idx]
    
    # Write back the before_return + new_render_str
    
    with open('src/components/InteractiveTutorial.tsx', 'w') as f:
        f.write(before_return)
        
print("Done cutting.")
