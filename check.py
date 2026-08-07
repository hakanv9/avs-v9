import sys

with open('c:\\Users\\Vroth\\OneDrive\\Masaüstü\\Vrother9\\site proje\\v9testsite1\\script.js', 'r', encoding='utf-8') as f:
    code = f.read()

depth = 0
in_str = False
str_char = ''
in_ml_comment = False
in_sl_comment = False
escape = False

line_num = 1
i = 0
out_lines = []
line_str = []
while i < len(code):
    char = code[i]
    if char == '\n':
        if in_sl_comment:
            in_sl_comment = False
        if line_str:
            out_lines.append(f"L{line_num}: {' '.join(line_str)}")
            line_str = []
        line_num += 1
        i += 1
        continue
    
    if escape:
        escape = False
        i += 1
        continue

    if char == '\\':
        escape = True
        i += 1
        continue

    if in_sl_comment:
        i += 1
        continue

    if in_ml_comment:
        if char == '*' and i+1 < len(code) and code[i+1] == '/':
            in_ml_comment = False
            i += 1
        i += 1
        continue

    # Regex literals hack: if we see / and we aren't in a string, 
    # it might be a regex. JS regex parsing is complex, but let's just assume 
    # regex doesn't contain '{' or '}' in this file. (Or we can just ignore strings too if we want, 
    # but strings DO contain them!)
    # Actually, in script.js there are ONLY template literals containing { for ${...}.
    # The normal strings '' and "" don't have braces in this file except in innerHTML.

    if in_str:
        if char == str_char:
            in_str = False
        i += 1
        continue

    if char in '"\'`':
        # ONLY treat as string if it's not a regex quote? No, quotes in regex are rare.
        # Wait, earlier we saw .replace(/"/g). This broke our string parser.
        # Let's add a hack: if char is ' or " and the next char is /g or similar... no, that's too hard.
        pass

    # Better approach: just ignore strings!
    # Braces inside template literals `${}` DO balance!
    # Braces inside HTML strings `<div class="...">` DO balance if they are just normal strings! Wait, no, HTML doesn't have braces.
    # What if a string has "{" ?
    # Let's search script.js for "{" and '}'.
    
    if char == '{': 
        depth += 1
        line_str.append(f'+{depth}')
    elif char == '}': 
        depth -= 1
        line_str.append(f'-{depth}')
        
    i += 1
        
with open('c:\\Users\\Vroth\\OneDrive\\Masaüstü\\Vrother9\\site proje\\v9testsite1\\trace.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out_lines))
    f.write(f'\nFinal depth: {depth}')
