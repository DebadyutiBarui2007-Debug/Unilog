with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    text = f.read()

text = text.replace(r'\\`Map\\`', r'\`Map\`')

with open('src/components/InteractiveTutorial.tsx', 'w') as f:
    f.write(text)
