import sys

def replace_in_file(path, old, new):
    with open(path, 'rb') as f:
        content = f.read()
    
    content = content.replace(old, new)
    
    with open(path, 'wb') as f:
        f.write(content)

old_str = b"tag-wip',        class: 'wip' }\n};"
new_str = b"tag-wip',        class: 'wip' }\n};\n\nfunction createStatusSelect(containerId, selectedValue = 'development') {\n    const container = document.getElementById(containerId);\n    if (!container) return;\n    const wrap = document.createElement('div');\n    wrap.style.display = 'flex';\n    wrap.style.gap = '8px';\n    const opts = Object.entries(STATUS_MAP).map(([k, v]) => `<option value=\"${k}\">${v.label}</option>`).join('');\n    wrap.innerHTML = `<select class=\"pm-status-select\" style=\"flex:1;\">${opts}</select><button type=\"button\" class=\"admin-btn admin-btn-sm admin-btn-danger\" onclick=\"this.parentElement.remove()\" style=\"padding:0 10px;\">Sil</button>`;\n    wrap.querySelector('select').value = selectedValue;\n    container.appendChild(wrap);\n}"

replace_in_file('admin.js', old_str, new_str)

print("Done")
