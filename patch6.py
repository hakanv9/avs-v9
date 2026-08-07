# -*- coding: utf-8 -*-
import sys

def replace_in_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"NOT FOUND in {path}: {old[:50]}...")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

replacements_admin_js = [
    (
        "    async getFile(path) {\n        const res = await fetch(`${this.baseUrl}/contents/${path}?ref=${this.branch}`, {\n            headers: this.headers()\n        });",
        "    async getFile(path) {\n        const res = await fetch(`${this.baseUrl}/contents/${path}?ref=${this.branch}`, {\n            headers: this.headers(),\n            cache: 'no-cache'\n        });"
    ),
    (
        "    proj.statuses = Array.from(document.querySelectorAll('#detailStatusContainer select')).map(s => s.value); proj.status = proj.statuses[0] || 'development';\n",
        ""
    ),
    (
        "    document.getElementById('detailStatusContainer').innerHTML = ''; const dVals = proj.statuses || (proj.status ? [proj.status] : []); if (!dVals.length) dVals.push('development'); dVals.forEach(v => createStatusSelect('detailStatusContainer', v));\n",
        ""
    ),
    (
        "    document.getElementById('detailAddStatusBtn')?.addEventListener('click', () => createStatusSelect('detailStatusContainer'));\n",
        ""
    )
]

replacements_admin_html = [
    (
        '                  <div class="admin-form-group">\n                      <label>Durum</label>\n                      <div id="detailStatusContainer" style="display:flex; flex-direction:column; gap:8px;"></div>\n                      <button type="button" class="admin-btn admin-btn-sm" id="detailAddStatusBtn" style="margin-top:8px;">➕ Yeni Durum Ekle</button>\n                  </div>\n',
        ""
    )
]

replacements_script_js = [
    (
        "        if (descEl) descEl.innerHTML = proj.description.map(p => `<p>${escapeHTML(p)}</p>`).join('');\n\n        const permEl = document.getElementById('pdPermList');\n        if (permEl) {\n            permEl.innerHTML = proj.perms.map(p =>\n                `<span class=\"pd-tag\">${escapeHTML(p)}</span>`\n            ).join('');\n        }\n\n        const minEl = document.getElementById('pdMinAndroid');\n        if (minEl) minEl.textContent = proj.detail ? proj.detail.minAndroid : (proj.minAndroid || '');\n\n        const sizeEl = document.getElementById('pdAppSize');\n        if (sizeEl) sizeEl.textContent = proj.detail ? proj.detail.size : (proj.size || '');",
        """        const descArr = (lang === 'en' && proj.detail && proj.detail.descriptionEN) ? proj.detail.descriptionEN : (proj.detail && proj.detail.description ? proj.detail.description : (proj.description || []));
        if (descEl) descEl.innerHTML = descArr.map(p => `<p>${escapeHTML(p)}</p>`).join('');

        const permEl = document.getElementById('pdPermList');
        const permsArr = proj.detail && proj.detail.permissions ? proj.detail.permissions : (proj.perms || []);
        if (permEl) {
            permEl.innerHTML = permsArr.map(p =>
                `<span class="pd-tag">${escapeHTML(p)}</span>`
            ).join('');
        }

        const minEl = document.getElementById('pdMinAndroid');
        if (minEl) minEl.textContent = proj.detail ? proj.detail.minAndroid : (proj.minAndroid || '');

        const sizeEl = document.getElementById('pdAppSize');
        if (sizeEl) sizeEl.textContent = proj.detail ? proj.detail.appSize : (proj.size || '');
        
        const changelogEl = document.getElementById('pdChangelog');
        const clData = proj.detail && proj.detail.changelog ? proj.detail.changelog : [];
        if (changelogEl) {
            if (clData.length > 0) {
                changelogEl.innerHTML = clData.map(c => {
                    const title = lang === 'en' && c.titleEN ? c.titleEN : c.title;
                    const features = lang === 'en' && c.featuresEN ? c.featuresEN : c.features;
                    const fixes = lang === 'en' && c.fixesEN ? c.fixesEN : c.fixes;
                    const featStr = features.length ? `<p class="cl-subtitle">✨ ${lang === 'en' ? 'New Features' : 'Yeni Özellikler'}</p><ul>${features.map(f => `<li>${escapeHTML(f)}</li>`).join('')}</ul>` : '';
                    const bugStr = fixes.length ? `<p class="cl-subtitle">🐛 ${lang === 'en' ? 'Bug Fixes' : 'Hata Düzeltmeleri'}</p><ul>${fixes.map(f => `<li>${escapeHTML(f)}</li>`).join('')}</ul>` : '';
                    return `
                    <div class="faq-item">
                        <button class="faq-question">
                            <span>${escapeHTML(c.version)} - ${escapeHTML(title)}</span>
                            <span class="cl-date">${escapeHTML(c.date)}</span>
                            <span class="faq-icon">▼</span>
                        </button>
                        <div class="faq-answer">
                            <div class="faq-answer-inner">
                                ${featStr}
                                ${bugStr}
                            </div>
                        </div>
                    </div>`;
                }).join('');
            } else {
                changelogEl.innerHTML = `<p style="color:var(--text-secondary);">${lang === 'en' ? 'No release history yet.' : 'Henüz sürüm geçmişi bulunmuyor.'}</p>`;
            }
        }"""
    )
]

replace_in_file('admin.js', replacements_admin_js)
replace_in_file('admin.html', replacements_admin_html)
replace_in_file('script.js', replacements_script_js)

print("Done")
