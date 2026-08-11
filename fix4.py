import re

with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    text = f.read()

text = re.sub(r'    \{\n    \{\n      id: 18,', r'    {\n      id: 18,', text)

with open('src/components/InteractiveTutorial.tsx', 'w') as f:
    f.write(text)
