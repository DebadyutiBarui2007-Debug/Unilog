with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    text = f.read()

def find_mismatch(text):
    stack = []
    for i, c in enumerate(text):
        if c in '({':
            stack.append((c, i))
        elif c in ')}':
            if not stack:
                print(f"Extra closing {c} at {i}")
                return
            top_c, top_i = stack.pop()
            if (top_c == '(' and c != ')') or (top_c == '{' and c != '}'):
                print(f"Mismatch at {i}: {c} doesn't match {top_c} at {top_i}")
                return
    if stack:
        print(f"Unclosed braces/parens: {stack}")
        for c, i in stack:
            # print line around i
            start = max(0, i-20)
            end = min(len(text), i+20)
            print(text[start:end])

find_mismatch(text)
