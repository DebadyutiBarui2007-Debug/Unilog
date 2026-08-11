import re

with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    text = f.read()

text = re.sub(r'      id: 18,\n    \{\n      id: 18,', r'    {\n      id: 18,', text)
text = re.sub(r'    \},\n      title: "19. System Engine Settings",', r'    },\n    {\n      id: 19,\n      title: "19. System Engine Settings",', text)

with open('src/components/InteractiveTutorial.tsx', 'w') as f:
    f.write(text)
