import re

with open('admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add move functions at the end of the file
move_funcs = """
// --- ORDER FUNCTIONS ---
window.moveSliderImage = function(idx, dir) {
    const arr = siteData.heroSlider;
    if (idx + dir < 0 || idx + dir >= arr.length) return;
    const temp = arr[idx];
    arr[idx] = arr[idx + dir];
    arr[idx + dir] = temp;
    arr.forEach((s, i) => s.order = i + 1);
    markDirty();
    renderSliderSection();
};

window.moveProject = function(idx, dir) {
    const arr = siteData.projects;
    if (idx + dir < 0 || idx + dir >= arr.length) return;
    const temp = arr[idx];
    arr[idx] = arr[idx + dir];
    arr[idx + dir] = temp;
    arr.forEach((p, i) => p.order = i + 1);
    markDirty();
    renderProjectList();
};

window.moveScreenshot = function(idx, dir) {
    if (!currentProjectId) return;
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;
    const arr = proj.detail.screenshots;
    if (idx + dir < 0 || idx + dir >= arr.length) return;
    const temp = arr[idx];
    arr[idx] = arr[idx + dir];
    arr[idx + dir] = temp;
    markDirty();
    renderScreenshots(arr);
};
"""
if "window.moveSliderImage =" not in content:
    content += move_funcs

# 2. Patch renderSliderSection
slider_old = """<span class="img-order-badge">${i + 1}</span>"""
slider_new = """<div class="img-order-controls" style="position:absolute; top:4px; left:4px; display:flex; flex-direction:column; gap:4px; z-index:10;">
                <button class="order-btn" onclick="moveSliderImage(${i}, -1)" ${i===0?'disabled':''} style="cursor:pointer; background:rgba(0,0,0,0.7); color:white; border:none; padding:2px 6px; border-radius:4px;">&#9650;</button>
                <span class="img-order-badge" style="position:static; margin:0; text-align:center;">${i + 1}</span>
                <button class="order-btn" onclick="moveSliderImage(${i}, 1)" ${i===slides.length-1?'disabled':''} style="cursor:pointer; background:rgba(0,0,0,0.7); color:white; border:none; padding:2px 6px; border-radius:4px;">&#9660;</button>
            </div>"""
content = content.replace(slider_old, slider_new)

# 3. Patch renderProjectList
proj_old = """<img src="${p.thumbnail}" alt="${p.name}" class="admin-project-thumb" """
proj_new = """<div style="display:flex; flex-direction:column; gap:4px; margin-right:12px;">
                  <button class="order-btn" onclick="moveProject(${index}, -1)" ${index===0?'disabled':''} style="cursor:pointer; background:var(--surface-color); color:var(--text-primary); border:1px solid var(--border-color); padding:4px 8px; border-radius:4px;">&#9650;</button>
                  <button class="order-btn" onclick="moveProject(${index}, 1)" ${index===projects.length-1?'disabled':''} style="cursor:pointer; background:var(--surface-color); color:var(--text-primary); border:1px solid var(--border-color); padding:4px 8px; border-radius:4px;">&#9660;</button>
              </div>
              <img src="${p.thumbnail}" alt="${p.name}" class="admin-project-thumb" """
if "list.innerHTML = projects.map(p => `" in content:
    content = content.replace("list.innerHTML = projects.map(p => `", "list.innerHTML = projects.map((p, index) => `")
    content = content.replace(proj_old, proj_new)

# 4. Patch renderScreenshots
ss_old = """<button class="ss-del-btn" data-idx="${i}" title="Sil">🗑</button>"""
ss_new = """<div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.7); padding:4px; display:flex; justify-content:space-between; z-index:10;">
                  <button class="order-btn" onclick="moveScreenshot(${i}, -1)" ${i===0?'disabled':''} style="cursor:pointer; background:transparent; color:white; border:none; padding:2px 8px;">&#9664;</button>
                  <button class="order-btn" onclick="moveScreenshot(${i}, 1)" ${i===screenshots.length-1?'disabled':''} style="cursor:pointer; background:transparent; color:white; border:none; padding:2px 8px;">&#9654;</button>
              </div>
              <button class="ss-del-btn" data-idx="${i}" title="Sil">🗑</button>"""
content = content.replace(ss_old, ss_new)

with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied successfully")
