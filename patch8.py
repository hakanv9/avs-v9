# -*- coding: utf-8 -*-
import sys

def replace_in_file(path, replacements):
    with open(path, 'rb') as f:
        content = f.read()
    
    for old, new in replacements:
        old_b = old.encode('utf-8')
        new_b = new.encode('utf-8')
        if old_b in content:
            content = content.replace(old_b, new_b)
        else:
            print(f"NOT FOUND in {path}: {old[:50]}...")
    
    with open(path, 'wb') as f:
        f.write(content)


replacements_admin_html = [
    (
        '                                <div class="admin-form-group">\n                                    <label>Durum</label>\n                                    <div id="detailStatusContainer" style="display:flex; flex-direction:column; gap:8px;"></div>\n                                    <button type="button" class="admin-btn admin-btn-sm" id="detailAddStatusBtn" style="margin-top:8px;">➕ Yeni Durum Ekle</button>\n                                </div>\n',
        ""
    )
]

replace_in_file('admin.html', replacements_admin_html)

print("Done")
