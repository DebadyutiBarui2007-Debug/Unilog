with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    text = f.read()

text = text.replace("paragraph.match(/^\d\./)", "paragraph.match(new RegExp('^\\\\d\\\\.'))")
text = text.replace("item.replace(/^-\s*|^\*\s*|^\d\.\s*/, '')", "item.replace(new RegExp('^-\\\\s*|^\\\\*\\\\s*|^\\\\d\\\\.\\\\s*'), '')")

with open('src/components/InteractiveTutorial.tsx', 'w') as f:
    f.write(text)
