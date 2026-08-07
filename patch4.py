import sys

def replace_in_file(path, old, new):
    with open(path, 'rb') as f:
        content = f.read()
    
    content = content.replace(old, new)
    
    with open(path, 'wb') as f:
        f.write(content)

old_str = b"wrap.innerHTML = `<select class=\"pm-status-select\" style=\"flex:1;\">${opts}</select><button type=\"button\" class=\"admin-btn admin-btn-sm admin-btn-danger\" onclick=\"this.parentElement.remove()\" style=\"padding:0 10px;\">Sil</button>`;\n    wrap.querySelector('select').value = selectedValue;"
new_str = b"wrap.innerHTML = `<select class=\"pm-status-select\" style=\"flex:1;\">${opts}</select><button type=\"button\" class=\"admin-btn admin-btn-sm admin-btn-danger del-status-btn\" style=\"padding:0 10px;\">Sil</button>`;\n    wrap.querySelector('.del-status-btn').addEventListener('click', () => wrap.remove());\n    wrap.querySelector('select').value = selectedValue;"

replace_in_file('admin.js', old_str, new_str)

print("Done")
