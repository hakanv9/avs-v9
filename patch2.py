import sys

def replace_in_file(path, old, new):
    with open(path, 'rb') as f:
        content = f.read()
    
    old_b = old.encode('utf-8')
    new_b = new.encode('utf-8')
    content = content.replace(old_b, new_b)
    
    with open(path, 'wb') as f:
        f.write(content)

replacements = [
    (
        '`<option value="${k}" ${p.status === k ? \'selected\' : \'\'}>${v.label}</option>`',
        '`<option value="${k}" ${((p.statuses && p.statuses.includes(k)) || (!p.statuses && p.status === k)) ? \'selected\' : \'\'}>${v.label}</option>`'
    )
]

for o, n in replacements:
    replace_in_file('admin.js', o, n)

print("Done")
