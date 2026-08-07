import sys

def replace_in_file(path, old, new):
    with open(path, 'rb') as f:
        content = f.read()
    
    content = content.replace(old, new)
    
    with open(path, 'wb') as f:
        f.write(content)

old_str = b"""              <div class="admin-project-info">
                  <div class="admin-project-name">${p.name}</div>
                  <select class="admin-status-select" data-pid="${p.id}" title="Durum" multiple size="3" style="height:auto; min-height:80px;">
                      ${Object.entries(STATUS_MAP).map(([k, v]) =>
                          `<option value="${k}" ${((p.statuses && p.statuses.includes(k)) || (!p.statuses && p.status === k)) ? 'selected' : ''}>${v.label}</option>`
                      ).join('')}
                  </select>
              </div>"""

new_str = b"""              <div class="admin-project-info">
                  <div class="admin-project-name">${p.name}</div>
                  <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">
                      ${(p.statuses || (p.status ? [p.status] : [])).map(s => { const st = STATUS_MAP[s] || {label:s}; return `<span style="font-size:11px; padding:2px 6px; border-radius:12px; background:var(--bg-color); border:1px solid var(--border-color);">${st.label}</span>`; }).join('')}
                  </div>
              </div>"""

replace_in_file('admin.js', old_str, new_str)

print("Done")
