/* ============================================================
   ADMIN.JS â AVS&V9 Yönetim Paneli
   GitHub REST API üzerinden site verilerini yönetir.
   ============================================================ */

'use strict';

function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

//  YARDIMCI FONKSYONLAR 

function adminToast(msg, type = 'info', duration = 3500) {
    const wrap = document.getElementById('adminToastWrap');
    if (!wrap) return;
    const t = document.createElement('div');
    t.className = `admin-toast ${type}`;
    const icons = { success: 'â
', error: 'â', info: 'â¹ï¸', warning: 'â ï¸' };
    t.innerHTML = `<span>${icons[type] || 'â¹ï¸'}</span> ${msg}`;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 400);
    }, duration);
}

function adminLoading(show, text = 'GitHub\'a kaydediliyor...') {
    const el = document.getElementById('adminLoading');
    const txtEl = document.getElementById('adminLoadingText');
    if (!el) return;
    if (txtEl) txtEl.textContent = text;
    el.classList.toggle('visible', show);
}

function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function todayISO() {
    return new Date().toISOString().split('T')[0];
}

function markDirty() {
    const bar = document.getElementById('adminSaveBar');
    if (bar) bar.classList.add('visible');
    window._adminDirty = true;
}

function clearDirty() {
    const bar = document.getElementById('adminSaveBar');
    if (bar) bar.classList.remove('visible');
    window._adminDirty = false;
}

function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('active');
    m.setAttribute('aria-hidden', 'false');
    try { m.removeAttribute('inert'); } catch (e) {}
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('active');
    m.setAttribute('aria-hidden', 'true');
    try { m.setAttribute('inert', ''); } catch (e) {}
}

//  GTHUB API 

class GitHubAPI {
    constructor(token, owner, repo) {
        this.token = token;
        this.owner = owner;
        this.repo = repo;
        this.branch = 'main';
        this.baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    }

    headers() {
        return {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    async getFile(path) {
        const res = await fetch(`${this.baseUrl}/contents/${path}?ref=${this.branch}`, {
            headers: this.headers(),
            cache: 'no-cache'
        });
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`GitHub dosya okunamadı (${res.status}): ${path}`);
        }
        return res.json();
    }

    async putFile(path, content, commitMsg, sha = null) {
        const body = {
            message: commitMsg,
            content: btoa(unescape(encodeURIComponent(content))),
            branch: this.branch
        };
        if (sha) body.sha = sha;

        const res = await fetch(`${this.baseUrl}/contents/${path}`, {
            method: 'PUT',
            headers: this.headers(),
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`GitHub kayıt hatası: ${err.message || res.status}`);
        }
        return res.json();
    }

    async uploadImage(filename, base64Data, folder = 'resimler') {
        // Dosya adndan sorunlu karakterleri temizle (GitHub path hatas nlenir)
        const safeFilename = filename
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')  // Aksanları kaldır
            .replace(/[^a-zA-Z0-9._\-]/g, '_') // Sadece güvenli karakterler
            .replace(/_{2,}/g, '_')             // Ãift alt çizgi temizle
            .replace(/^_|_$/g, '');            // BaÅ/son alt çizgi kaldır
        const path = `${folder}/${safeFilename}`;
        const existing = await this.getFile(path);
        const sha = existing ? existing.sha : null;
        const pureBase64 = base64Data.split(',')[1] || base64Data;
        const res = await fetch(`${this.baseUrl}/contents/${path}`, {
            method: 'PUT',
            headers: this.headers(),
            body: JSON.stringify({
                message: `ð¼ï¸ Admin: Görsel yüklendi â ${safeFilename}`,
                content: pureBase64,
                branch: this.branch,
                ...(sha ? { sha } : {})
            })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`Görsel yükleme hatası: ${err.message || res.status}`);
        }
        return `${folder}/${safeFilename}`;
    }

    async deleteFile(path, sha, commitMsg) {
        const res = await fetch(`${this.baseUrl}/contents/${path}`, {
            method: 'DELETE',
            headers: this.headers(),
            body: JSON.stringify({ message: commitMsg, sha, branch: this.branch })
        });
        if (!res.ok) throw new Error(`Silme hatası: ${res.status}`);
        return res.json();
    }

    async saveSiteData(data) {
        const path = 'data/site-data.json';
        // Her kaydetmede taze SHA al  stale SHA hatasn nler
        const existing = await this.getFile(path);
        const sha = existing ? existing.sha : null;
        const content = JSON.stringify(data, null, 2);
        return this.putFile(path, content, 'âï¸ Admin: Site verileri güncellendi', sha);
    }

    async loadSiteData() {
        const file = await this.getFile('data/site-data.json');
        if (!file) throw new Error('site-data.json bulunamadı!');
        const decoded = decodeURIComponent(escape(atob(file.content)));
        return { data: JSON.parse(decoded), sha: file.sha };
    }
}

//  OTURUM YNETM (Sadece Bellek) 
// GV-2: Token hibir zaman sessionStorage/localStorage'a yazlmaz.
// Giri bilgileri yalnzca ghAPI nesnesi iinde sayfa mr boyunca tutulur.
// Sayfa yenileme veya tarayc kapatma  otomatik k (tekrar giri gerekir).

function saveSession(token, owner, repo) {
    sessionStorage.setItem('avs_admin_token', token);
    sessionStorage.setItem('avs_admin_owner', owner);
    sessionStorage.setItem('avs_admin_repo', repo);
}

function loadSession() {
    const token = sessionStorage.getItem('avs_admin_token');
    const owner = sessionStorage.getItem('avs_admin_owner');
    const repo = sessionStorage.getItem('avs_admin_repo');
    if (token && owner && repo) return { token, owner, repo };
    return null;
}

function clearSession() {
    sessionStorage.removeItem('avs_admin_token');
    sessionStorage.removeItem('avs_admin_owner');
    sessionStorage.removeItem('avs_admin_repo');
}

//  DURUM ETKET HARTASI 

const STATUS_MAP = {
    'live':          { label: 'â
 Yayında',                    tag: 'tag-live',       class: 'active' },
    'development':   { label: 'â³ GeliÅtirme AÅamasında',    tag: 'tag-wip',        class: 'wip' },
    'completed':     { label: 'ðµ Tamamlandı',              tag: 'tag-completed',  class: 'completed' },
    'discontinued':  { label: 'ð Yayından KaldırılmıÅ',    tag: 'tag-inactive',   class: 'inactive' },
    'paused':        { label: 'â¸ï¸ GeliÅtirme DurdurulmuÅ', tag: 'tag-soon',       class: 'paused' },
    'research':      { label: 'ð AraÅtırma AÅamasında',  tag: 'tag-wip',        class: 'wip' },
    'bugfix':        { label: 'ð ï¸ Hata Düzeltme',          tag: 'tag-wip',        class: 'wip' },
    'waiting':       { label: 'â³ Beklemede',                  tag: 'tag-soon',       class: 'paused' },
    'special':       { label: 'â­ Ãzel Durum',                tag: 'tag-soon',       class: 'wip' },
    'rnd':           { label: 'ð§ª Ar-Ge AÅamasında',        tag: 'tag-wip',        class: 'wip' }
};

function createStatusSelect(containerId, selectedValue = 'development') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = '8px';
    const opts = Object.entries(STATUS_MAP).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
    wrap.innerHTML = `<select class="pm-status-select" style="flex:1;">${opts}</select><button type="button" class="admin-btn admin-btn-sm admin-btn-danger del-status-btn" style="padding:0 10px;">Sil</button>`;
    wrap.querySelector('.del-status-btn').addEventListener('click', () => wrap.remove());
    wrap.querySelector('select').value = selectedValue;
    container.appendChild(wrap);
}

//  ANA UYGULAMA 

let ghAPI = null;
let siteData = null;
let currentProjectId = null;
let editingChangelogId = null;
let editingFaqCatId = null;
let editingFaqItemId = null;
let editingLegalId = null;

document.addEventListener('DOMContentLoaded', () => {
    const session = loadSession();
    if (session) {
        document.getElementById('adminGithubToken').value = session.token;
        document.getElementById('adminRepoOwner').value = session.owner;
        document.getElementById('adminRepoName').value = session.repo;
        setTimeout(() => {
            document.getElementById('adminLoginBtn').click();
        }, 100);
    } else {
        showLogin();
    }

    initLoginScreen();
    initTabSystem();
    initThemeToggle();
    initSaveBar();
    initModals();
    initLightbox();
    initAutoTranslate();
});

//  GR EKRANI 

function showLogin() {
    document.getElementById('adminLoginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

function showPanel() {
    document.getElementById('adminLoginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadAndRenderAll();
}

function initLoginScreen() {
    const loginBtn = document.getElementById('adminLoginBtn');
    const tokenInput = document.getElementById('adminGithubToken');
    const ownerInput = document.getElementById('adminRepoOwner');
    const repoInput = document.getElementById('adminRepoName');
    const errorEl = document.getElementById('adminLoginError');

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.add('visible');
    }

    async function doLogin() {
        const token = tokenInput.value.trim();
        const owner = ownerInput.value.trim();
        const repo = repoInput.value.trim();

        if (!token || !owner || !repo) {
            showError('Lütfen tüm alanları doldurun.');
            return;
        }

        loginBtn.textContent = 'ð DoÄrulanıyor...';
        loginBtn.disabled = true;
        errorEl.classList.remove('visible');

        try {
            const api = new GitHubAPI(token, owner, repo);
            // Test: repo'yu okumay dene
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: api.headers()
            });

            if (!res.ok) {
                if (res.status === 401) throw new Error('Token geçersiz. Lütfen GitHub Token\'ınızı kontrol edin.');
                if (res.status === 404) throw new Error('Repo bulunamadı. Kullanıcı adı ve repo adını kontrol edin.');
                throw new Error(`BaÄlantı hatası: ${res.status}`);
            }

            ghAPI = api;
            saveSession(token, owner, repo);
            adminToast('GiriÅ baÅarılı! Panel yükleniyor...', 'success');
            setTimeout(showPanel, 600);

        } catch (err) {
            showError(err.message);
            loginBtn.textContent = 'ð GiriÅ Yap';
            loginBtn.disabled = false;
        }
    }

    if (loginBtn) loginBtn.addEventListener('click', doLogin);
    if (tokenInput) tokenInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

    // Logout
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window._adminDirty) {
                if (!confirm('KaydedilmemiÅ deÄiÅiklikler var. Ãıkmak istediÄinize emin misiniz?')) return;
            }
            // GV-2: Bellekten temizle
            ghAPI = null;
            siteData = null;
            window._adminDirty = false;
            adminToast('Oturum kapatıldı.', 'info');
            showLogin();
        });
    }
}

//  VER YKLEME 

async function loadAndRenderAll() {
    adminLoading(true, 'Site verileri yükleniyor...');
    try {
        const { data } = await ghAPI.loadSiteData();
        siteData = data;
        renderSliderSection();
        renderProjectList();
        renderDetailProjectSelector();
        renderFaqAdmin();
        renderLegalAdmin();
        renderSocialFeedAdmin();
        adminToast('Veriler yüklendi!', 'success', 2000);
    } catch (err) {
        adminToast(`Yükleme hatası: ${err.message}`, 'error', 6000);
        console.error(err);
    } finally {
        adminLoading(false);
    }
}

//  SEKME SSTEM 

function initTabSystem() {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            const content = document.getElementById(tabId);
            if (content) content.classList.add('active');
        });
    });
}

//  TEMA & DL 

function initThemeToggle() {
    const btn = document.getElementById('adminThemeToggle');
    const icon = document.getElementById('adminThemeIcon');
    if (!btn || !icon) return;

    function updateIcon() {
        const theme = document.documentElement.getAttribute('data-theme');
        icon.textContent = theme === 'dark' ? 'ð' : 'âï¸';
    }

    updateIcon();
    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('avs_theme', next);
        updateIcon();
    });

    // Dil toggle
    const langBtn = document.getElementById('adminLangToggle');
    const langLabel = document.getElementById('adminLangLabel');
    if (langBtn && langLabel) {
        const currentLang = localStorage.getItem('avs_lang') || 'tr';
        langLabel.textContent = currentLang.toUpperCase();
        langBtn.addEventListener('click', () => {
            const newLang = langLabel.textContent === 'TR' ? 'en' : 'tr';
            langLabel.textContent = newLang.toUpperCase();
            localStorage.setItem('avs_lang', newLang.toLowerCase());
        });
    }
}

//  KAYDET BARI 

function initSaveBar() {
    const discardBtn = document.getElementById('discardChangesBtn');
    const saveAllBtn = document.getElementById('saveAllBtn');

    if (discardBtn) discardBtn.addEventListener('click', () => {
        if (confirm('DeÄiÅiklikler iptal edilsin mi?')) {
            loadAndRenderAll();
            clearDirty();
        }
    });

    if (saveAllBtn) saveAllBtn.addEventListener('click', saveAllToGitHub);
}

async function saveAllToGitHub() {
    if (!ghAPI || !siteData) return;
    adminLoading(true, 'GitHub\'a kaydediliyor...');
    try {
        await ghAPI.saveSiteData(siteData);
        clearDirty();
        adminToast('â
 Tüm deÄiÅiklikler GitHub\'a kaydedildi! Site ~15 saniyede güncellenir.', 'success', 5000);
    } catch (err) {
        adminToast(`Kayıt hatası: ${err.message}`, 'error', 6000);
    } finally {
        adminLoading(false);
    }
}

//  SLIDER YNETM 

function renderSliderSection() {
    const grid = document.getElementById('sliderImgGrid');
    if (!grid || !siteData) return;
    siteData.heroSlider.sort((a, b) => (a.order || 0) - (b.order || 0));
    const slides = siteData.heroSlider || [];
    grid.innerHTML = slides.map((s, i) => `
        <div class="slider-img-item" data-id="${s.id}">
            <img src="${s.src}" alt="${s.alt}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'160\\' height=\\'90\\'><rect width=\\'160\\' height=\\'90\\' fill=\\'%23222\\'/>><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23666\\' text-anchor=\\'middle\\' dy=\\'.3em\\'>?</text></svg>'">
            <div class="img-order-controls" style="position:absolute; top:4px; left:4px; display:flex; flex-direction:column; gap:4px; z-index:10;"><button class="order-btn" onclick="moveSliderImage(${i}, -1)" ${i===0?'disabled':''} style="cursor:pointer; background:rgba(0,0,0,0.7); color:white; border:none; padding:2px 6px; border-radius:4px;">&#9650;</button><span class="img-order-badge" style="position:static; margin:0; text-align:center;">${i + 1}</span><button class="order-btn" onclick="moveSliderImage(${i}, 1)" ${i===slides.length-1?'disabled':''} style="cursor:pointer; background:rgba(0,0,0,0.7); color:white; border:none; padding:2px 6px; border-radius:4px;">&#9660;</button></div>
            <button class="img-delete-btn" data-id="${s.id}" title="Sil">â</button>
        </div>
    `).join('');

    grid.querySelectorAll('.img-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSliderImage(btn.dataset.id));
    });

    // Ykleme
    const fileInput = document.getElementById('sliderFileInput');
    const uploadArea = document.getElementById('sliderUploadArea');
    if (fileInput) fileInput.addEventListener('change', e => handleSliderUpload(e.target.files));
    if (uploadArea) {
        uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
        uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.classList.remove('dragover'); handleSliderUpload(e.dataTransfer.files); });
    }

    if (typeof Sortable !== 'undefined') {
        Sortable.create(grid, {
            animation: 150,
            onEnd: function () {
                const items = Array.from(grid.children);
                items.forEach((item, index) => {
                    const slide = siteData.heroSlider.find(s => s.id === item.dataset.id);
                    if (slide) slide.order = index + 1;
                });
                siteData.heroSlider.sort((a, b) => (a.order || 0) - (b.order || 0));
                markDirty();
                renderSliderSection();
            }
        });
    }
}

async function handleSliderUpload(files) {
    if (!files || !files.length) return;
    adminLoading(true, 'Görseller yükleniyor...');
    try {
        for (const file of Array.from(files)) {
            if (file.size > 5 * 1024 * 1024) { adminToast(`${file.name} 5MB sınırını aÅıyor.`, 'error'); continue; }
            const base64 = await fileToBase64(file);
            const filename = `hero-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
            const path = await ghAPI.uploadImage(filename, base64);
            siteData.heroSlider.push({ id: generateId('slide'), src: path, alt: file.name.split('.')[0], order: siteData.heroSlider.length + 1 });
        }
        markDirty();
        renderSliderSection();
        adminToast('Görseller yüklendi!', 'success');
    } catch (err) {
        adminToast(`Yükleme hatası: ${err.message}`, 'error');
    } finally {
        adminLoading(false);
        document.getElementById('sliderFileInput').value = '';
    }
}

async function deleteSliderImage(id) {
    if (!confirm('Bu görsel silinsin mi?')) return;
    const idx = siteData.heroSlider.findIndex(s => s.id === id);
    if (idx === -1) return;
    siteData.heroSlider.splice(idx, 1);
    siteData.heroSlider.forEach((s, i) => s.order = i + 1);
    adminLoading(true, 'Kaydediliyor...');
    try {
        markDirty();
        renderSliderSection();
        adminToast('Görsel silindi.', 'success');
    } catch (err) {
        adminToast(`Hata: ${err.message}`, 'error');
    } finally {
        adminLoading(false);
    }
}

//  PROJE LSTES (Anasayfa) 

function renderProjectList() {
    const list = document.getElementById('adminProjectList');
    if (!list || !siteData) return;
    siteData.projects.sort((a, b) => (a.order || 0) - (b.order || 0));
    const projects = siteData.projects || [];
    if (!projects.length) { list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Henüz proje eklenmemiÅ.</p>'; return; }

    list.innerHTML = projects.map((p, index) => `
        <div class="admin-project-item" data-id="${p.id}">
            <div style="display:flex; flex-direction:column; gap:4px; margin-right:12px;"><button class="order-btn" onclick="moveProject(${index}, -1)" ${index===0?'disabled':''} style="cursor:pointer; background:var(--surface-color); color:var(--text-primary); border:1px solid var(--border-color); padding:4px 8px; border-radius:4px;">&#9650;</button><button class="order-btn" onclick="moveProject(${index}, 1)" ${index===projects.length-1?'disabled':''} style="cursor:pointer; background:var(--surface-color); color:var(--text-primary); border:1px solid var(--border-color); padding:4px 8px; border-radius:4px;">&#9660;</button></div><img src="${p.thumbnail}" alt="${p.name}" class="admin-project-thumb"
                onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'72\\' height=\\'48\\'><rect width=\\'72\\' height=\\'48\\' fill=\\'%23222\\'/></svg>'">
            <div class="admin-project-info">
                <div class="admin-project-name">${p.name}</div>
                <select class="admin-status-select" data-pid="${p.id}" title="Durum" multiple size="3" style="height:auto; min-height:80px;">
                    ${Object.entries(STATUS_MAP).map(([k, v]) =>
                        `<option value="${k}" ${((p.statuses && p.statuses.includes(k)) || (!p.statuses && p.status === k)) ? 'selected' : ''}>${v.label}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="admin-project-actions">
                <button class="admin-btn admin-btn-sm edit-proj-btn" data-id="${p.id}" title="Düzenle">âï¸</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm del-proj-btn" data-id="${p.id}" title="Sil">ðï¸</button>
            </div>
        </div>
    `).join('');

    // Durum deitirme
    list.querySelectorAll('.admin-status-select').forEach(sel => {
        sel.addEventListener('change', () => {
            const proj = siteData.projects.find(p => p.id === sel.dataset.pid);
            if (proj) { proj.statuses = Array.from(sel.selectedOptions).map(o => o.value); proj.status = proj.statuses[0] || "development"; markDirty(); }
        });
    });

    // Sil butonu
    list.querySelectorAll('.del-proj-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProject(btn.dataset.id));
    });

    // Dzenle butonu
    list.querySelectorAll('.edit-proj-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditProjectModal(btn.dataset.id));
    });

    if (typeof Sortable !== 'undefined') {
        Sortable.create(list, {
            animation: 150,
            onEnd: function () {
                const items = Array.from(list.children);
                items.forEach((item, index) => {
                    const proj = siteData.projects.find(p => p.id === item.dataset.id);
                    if (proj) proj.order = index + 1;
                });
                siteData.projects.sort((a, b) => (a.order || 0) - (b.order || 0));
                markDirty();
            }
        });
    }
}

function deleteProject(id) {
    if (!confirm('Bu proje silinsin mi? Bu iÅlem geri alınamaz.')) return;
    siteData.projects = siteData.projects.filter(p => p.id !== id);
    markDirty();
    renderProjectList();
    renderDetailProjectSelector();
    adminToast('Proje silindi. Kaydetmeyi unutmayın.', 'warning');
}

//  PROJE EKLE/DZENLE MODAL 

function initModals() {
    // Proje Ekleme
    document.getElementById('addProjectBtn')?.addEventListener('click', () => openAddProjectModal());
    document.getElementById('projectModalCancel')?.addEventListener('click', () => closeModal('projectModal'));
    document.getElementById('projectModalSave')?.addEventListener('click', saveProjectModal);

    // Srm Modal
    document.getElementById('addChangelogBtn')?.addEventListener('click', () => openAddChangelogModal());
    document.getElementById('changelogModalCancel')?.addEventListener('click', () => closeModal('changelogModal'));
    document.getElementById('changelogModalSave')?.addEventListener('click', saveChangelogModal);

    // SSS Madde Modal
    document.getElementById('faqItemCancel')?.addEventListener('click', () => closeModal('faqItemModal'));
    document.getElementById('faqItemSave')?.addEventListener('click', saveFaqItemModal);

    // SSS Kategori Ekle
    document.getElementById('addFaqCatBtn')?.addEventListener('click', addFaqCategory);

    // Detay Kaydet
    document.getElementById('saveDetailBtn')?.addEventListener('click', saveProjectDetail);
    document.getElementById('saveFaqBtn')?.addEventListener('click', saveAllToGitHub);
    document.getElementById('saveLegalBtn')?.addEventListener('click', saveAllToGitHub);
    document.getElementById('fetchSocialFeedBtn')?.addEventListener('click', fetchRandomSocialPosts);
    document.getElementById('pmAddStatusBtn')?.addEventListener('click', () => createStatusSelect('pmStatusContainer'));

    // Yasal Bugn butonlar
    document.getElementById('setPrivacyTodayBtn')?.addEventListener('click', () => {
        document.getElementById('privacyDate').value = todayISO();
        if (siteData) siteData.legal.privacy.lastUpdated = todayISO();
        markDirty();
    });
    document.getElementById('setTermsTodayBtn')?.addEventListener('click', () => {
        document.getElementById('termsDate').value = todayISO();
        if (siteData) siteData.legal.terms.lastUpdated = todayISO();
        markDirty();
    });

    // Yasal Blm Ekle
    document.getElementById('addPrivacySecBtn')?.addEventListener('click', () => addLegalSection('privacy'));
    document.getElementById('addTermsSecBtn')?.addEventListener('click', () => addLegalSection('terms'));

    // Android Toggle
    document.getElementById('detailIsAndroid')?.addEventListener('change', e => {
        const fields = document.getElementById('playStoreFields');
        if (fields) fields.style.display = e.target.checked ? 'block' : 'none';
    });

    // Ekran grnts ykleme
    document.getElementById('screenshotFileInput')?.addEventListener('change', e => handleScreenshotUpload(e.target.files));
}

function openAddProjectModal() {
    document.getElementById('projectModalTitle').textContent = 'Yeni Proje Ekle';
    document.getElementById('pmName').value = '';
    document.getElementById('pmNameEN').value = '';
    document.getElementById('pmDesc').value = '';
    document.getElementById('pmSlug').value = '';
    document.getElementById('pmStatusContainer').innerHTML = ''; createStatusSelect('pmStatusContainer', 'development');
    document.getElementById('pmTags').value = '';
    document.getElementById('pmThumbnail').value = '';
    document.getElementById('pmThumbnailFile').value = '';
    document.getElementById('projectModalSave').dataset.mode = 'add';
    delete document.getElementById('projectModalSave').dataset.editId;
    openModal('projectModal');
}

function openEditProjectModal(id) {
    const proj = siteData.projects.find(p => p.id === id);
    if (!proj) return;
    document.getElementById('projectModalTitle').textContent = 'Projeyi Düzenle';
    document.getElementById('pmName').value = proj.name;
    document.getElementById('pmNameEN').value = proj.nameEN;
    document.getElementById('pmDesc').value = proj.shortDesc;
    document.getElementById('pmSlug').value = proj.slug;
    document.getElementById('pmStatusContainer').innerHTML = ''; const vals = proj.statuses || (proj.status ? [proj.status] : []); if (!vals.length) vals.push('development'); vals.forEach(v => createStatusSelect('pmStatusContainer', v));
    document.getElementById('pmTags').value = proj.tags.join(', ');
    document.getElementById('pmThumbnail').value = proj.thumbnail || '';
    document.getElementById('pmThumbnailFile').value = '';
    document.getElementById('projectModalSave').dataset.mode = 'edit';
    document.getElementById('projectModalSave').dataset.editId = id;
    openModal('projectModal');
}

async function saveProjectModal() {
    const btn = document.getElementById('projectModalSave');
    const mode = btn.dataset.mode;
    const name = document.getElementById('pmName').value.trim();
    const nameEN = document.getElementById('pmNameEN').value.trim();
    const desc = document.getElementById('pmDesc').value.trim();
    const slug = document.getElementById('pmSlug').value.trim().replace(/\s+/g, '-').toLowerCase();
    const statuses = Array.from(document.querySelectorAll('#pmStatusContainer select')).map(s => s.value); const status = statuses[0] || 'development';
    const tags = document.getElementById('pmTags').value.split(',').map(t => t.trim()).filter(Boolean);
    let thumbnail = document.getElementById('pmThumbnail').value.trim();

    if (!name || !slug) { adminToast('Proje adı ve slug zorunludur.', 'error'); return; }

    // Thumbnail dosya ykleme varsa nce ykle
    const thumbFile = document.getElementById('pmThumbnailFile').files[0];
    if (thumbFile) {
        try {
            adminLoading(true, 'Kapak görseli yükleniyor...');
            const base64 = await fileToBase64(thumbFile);
            const safeSlug = slug.replace(/[^a-zA-Z0-9\-]/g, '_');
            const filename = `thumb-${safeSlug}-${Date.now()}.${thumbFile.name.split('.').pop()}`;
            thumbnail = await ghAPI.uploadImage(filename, base64);
        } catch (err) {
            adminToast(`Kapak görseli yüklenemedi: ${err.message}`, 'error');
            adminLoading(false);
            return;
        } finally {
            adminLoading(false);
        }
    }

    if (mode === 'add') {
        // zgn ID ret  slug akmasn nle
        const uniqueId = slug + '-' + Date.now().toString(36);
        const newProj = {
            id: uniqueId,
            slug,
            name,
            nameEN: nameEN || name,
            shortDesc: desc,
            shortDescEN: desc,
            thumbnail: thumbnail || 'resimler/projeler-resmi1.jpg',
            tags,
            status,
            statuses,
            order: siteData.projects.length + 1,
            visible: true,
            detail: {
                isAndroid: false,
                playStoreEnabled: false,
                playStoreUrl: '#',
                logo: '',
                downloads: '-', rating: '-', ageRating: '3+',
                appSize: '-', minAndroid: '-',
                description: [desc],
                descriptionEN: [desc],
                permissions: [],
                screenshots: [],
                changelog: []
            }
        };
        siteData.projects.push(newProj);
        adminToast('Yeni proje eklendi. Kaydetmeyi unutmayın.', 'success');
    } else {
        const proj = siteData.projects.find(p => p.id === btn.dataset.editId);
        if (proj) {
            proj.name = name;
            proj.nameEN = nameEN || name;
            proj.shortDesc = desc;
            proj.slug = slug;
            proj.status = status; proj.statuses = statuses;
            proj.tags = tags;
            if (thumbnail) proj.thumbnail = thumbnail;
        }
        adminToast('Proje güncellendi. Kaydetmeyi unutmayın.', 'success');
    }

    markDirty();
    renderProjectList();
    renderDetailProjectSelector();
    closeModal('projectModal');
}

//  PROJE DETAY EDITR 

function renderDetailProjectSelector() {
    const sel = document.getElementById('detailProjectSelector');
    if (!sel || !siteData) return;
    const projects = siteData.projects || [];
    sel.innerHTML = projects.map(p => `
        <div class="admin-proj-sel-card ${currentProjectId === p.id ? 'selected' : ''}" data-id="${p.id}">
            <img src="${p.thumbnail}" alt="${p.name}" class="admin-proj-sel-thumb"
                onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'220\\' height=\\'120\\'><rect width=\\'220\\' height=\\'120\\' fill=\\'%23222\\'/></svg>'">
            <div class="admin-proj-sel-name">${p.name}</div>
        </div>
    `).join('');

    sel.querySelectorAll('.admin-proj-sel-card').forEach(card => {
        card.addEventListener('click', () => {
            currentProjectId = card.dataset.id;
            sel.querySelectorAll('.admin-proj-sel-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            loadProjectDetail(currentProjectId);
        });
    });
}

function loadProjectDetail(id) {
    const proj = siteData.projects.find(p => p.id === id);
    if (!proj || !proj.detail) return;
    const d = proj.detail;

    document.getElementById('detailEditorWrap').style.display = 'block';
    document.getElementById('detailName').value = proj.name;
    document.getElementById('detailNameEN').value = proj.nameEN;
    document.getElementById('detailSize').value = d.appSize || '';
    document.getElementById('detailAgeRating').value = d.ageRating || '';
    document.getElementById('detailLogo').value = d.logo || '';
    document.getElementById('detailThumbnail').value = proj.thumbnail || '';

    // Android/Play Store toggle  isAndroid kontroled
    const isAndroid = !!(d.isAndroid);
    const androidChk = document.getElementById('detailIsAndroid');
    const playFields = document.getElementById('playStoreFields');
    if (androidChk) androidChk.checked = isAndroid;
    if (playFields) playFields.style.display = isAndroid ? 'block' : 'none';

    if (isAndroid) {
        document.getElementById('detailDownloads').value = d.downloads || '';
        document.getElementById('detailRating').value = d.rating || '';
        document.getElementById('detailMinAndroid').value = d.minAndroid || '';
        document.getElementById('detailPlayStoreUrl').value = d.playStoreUrl || '';
        document.getElementById('detailPermissions').value = (d.permissions || []).join('\n');
    }

    document.getElementById('detailDescTR').value = (d.description || []).join('\n\n');
    document.getElementById('detailDescEN').value = (d.descriptionEN || []).join('\n\n');

    renderScreenshots(d.screenshots || []);
    renderChangelogList(d.changelog || []);
}

function saveProjectDetail() {
    if (!currentProjectId) { adminToast('Ãnce bir proje seçin.', 'warning'); return; }
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;

    proj.name = document.getElementById('detailName').value.trim();
    proj.nameEN = document.getElementById('detailNameEN').value.trim();
    proj.thumbnail = document.getElementById('detailThumbnail').value.trim();

    const d = proj.detail;
    d.appSize = document.getElementById('detailSize').value.trim();
    d.ageRating = document.getElementById('detailAgeRating').value.trim();
    d.logo = document.getElementById('detailLogo').value.trim();
    d.isAndroid = document.getElementById('detailIsAndroid').checked;
    d.downloads = document.getElementById('detailDownloads').value.trim();
    d.rating = document.getElementById('detailRating').value.trim();
    d.minAndroid = document.getElementById('detailMinAndroid').value.trim();
    d.playStoreUrl = document.getElementById('detailPlayStoreUrl').value.trim();
    d.permissions = document.getElementById('detailPermissions').value.split('\n').map(s => s.trim()).filter(Boolean);
    d.description = document.getElementById('detailDescTR').value.split('\n\n').map(s => s.trim()).filter(Boolean);
    d.descriptionEN = document.getElementById('detailDescEN').value.split('\n\n').map(s => s.trim()).filter(Boolean);

    markDirty();
    renderProjectList();
    renderDetailProjectSelector();
    adminToast('Proje detayları güncellendi. Kaydetmeyi unutmayın.', 'success');
}

//  EKRAN GRNTLER 

function renderScreenshots(screenshots) {
    const grid = document.getElementById('screenshotGrid');
    if (!grid) return;
    grid.innerHTML = screenshots.map((src, i) => `
        <div class="screenshot-item" data-idx="${i}">
            <img src="${src}" alt="Görsel ${i+1}"
                onerror="this.parentElement.style.display='none'"
                onload="this.parentElement.className = 'screenshot-item ' + (this.naturalWidth > this.naturalHeight ? 'landscape' : this.naturalWidth === this.naturalHeight ? 'square' : '');"
                style="cursor:zoom-in;" onclick="openLightbox('${src}')"
            >
            <button class="ss-del-btn" data-idx="${i}" title="Sil">â</button>
        </div>
    `).join('');
    grid.querySelectorAll('.ss-del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); deleteScreenshot(parseInt(btn.dataset.idx)); });
    });
}

function deleteScreenshot(idx) {
    if (!currentProjectId) return;
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;
    proj.detail.screenshots.splice(idx, 1);
    markDirty();
    renderScreenshots(proj.detail.screenshots);
}

async function handleScreenshotUpload(files) {
    if (!currentProjectId) { adminToast('Lütfen önce bir proje seçin.', 'warning'); return; }
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;
    adminLoading(true, 'Görseller yükleniyor...');
    try {
        for (const file of Array.from(files)) {
            const base64 = await fileToBase64(file);
            // Gvenli dosya ad olutur
            const safeSlug = (proj.slug || proj.id).replace(/[^a-zA-Z0-9\-]/g, '_');
            const safeExt = file.name.split('.').pop().replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
            const filename = `ss_${safeSlug}_${Date.now()}.${safeExt}`;
            const path = await ghAPI.uploadImage(filename, base64);
            proj.detail.screenshots.push(path);
        }
        markDirty();
        renderScreenshots(proj.detail.screenshots);
        adminToast('Görseller yüklendi!', 'success');
    } catch (err) {
        adminToast(`Yükleme hatası: ${err.message}`, 'error');
    } finally {
        adminLoading(false);
        const inp = document.getElementById('screenshotFileInput');
        if (inp) inp.value = '';
    }
}

//  SRM GEM 

function renderChangelogList(changelog) {
    const list = document.getElementById('changelogList');
    if (!list) return;
    if (!changelog.length) { list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:16px;">Henüz sürüm eklenmemiÅ.</p>'; return; }

    list.innerHTML = changelog.map(cl => `
        <div class="changelog-item" data-id="${cl.id}">
            <span class="changelog-version-badge ${cl.type}">${cl.version}</span>
            <div class="changelog-info">
                <div class="changelog-date">ð
 ${cl.date} · ${cl.type.toUpperCase()}</div>
                <ul class="changelog-notes">
                    ${cl.notes.map(n => `<li>${n}</li>`).join('')}
                </ul>
            </div>
            <div class="changelog-actions">
                <button class="admin-btn admin-btn-sm edit-cl-btn" data-id="${cl.id}">âï¸</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm del-cl-btn" data-id="${cl.id}">ðï¸</button>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.del-cl-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteChangelog(btn.dataset.id));
    });
    list.querySelectorAll('.edit-cl-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditChangelogModal(btn.dataset.id));
    });
}

function openAddChangelogModal() {
    if (!currentProjectId) { adminToast('Ãnce bir proje seçin.', 'warning'); return; }
    editingChangelogId = null;
    document.getElementById('changelogModalTitle').textContent = 'Yeni Sürüm Ekle';
    document.getElementById('clVersion').value = '';
    document.getElementById('clDate').value = todayISO();
    document.getElementById('clType').value = 'minor';
    document.getElementById('clNotes').value = '';
    document.getElementById('changelogModalSave').dataset.mode = 'add';
    openModal('changelogModal');
}

function openEditChangelogModal(id) {
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;
    const cl = proj.detail.changelog.find(c => c.id === id);
    if (!cl) return;
    editingChangelogId = id;
    document.getElementById('changelogModalTitle').textContent = 'Sürümü Düzenle';
    document.getElementById('clVersion').value = cl.version;
    document.getElementById('clDate').value = cl.date;
    document.getElementById('clType').value = cl.type;
    document.getElementById('clNotes').value = cl.notes.join('\n');
    document.getElementById('changelogModalSave').dataset.mode = 'edit';
    openModal('changelogModal');
}

function saveChangelogModal() {
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;
    const version = document.getElementById('clVersion').value.trim();
    const date = document.getElementById('clDate').value;
    const type = document.getElementById('clType').value;
    const notes = document.getElementById('clNotes').value.split('\n').map(s => s.trim()).filter(Boolean);

    if (!version || !notes.length) { adminToast('Versiyon ve en az 1 deÄiÅiklik notu gerekli.', 'error'); return; }

    const mode = document.getElementById('changelogModalSave').dataset.mode;
    if (mode === 'add') {
        proj.detail.changelog.unshift({ id: generateId('cl'), version, date, type, notes });
    } else {
        const cl = proj.detail.changelog.find(c => c.id === editingChangelogId);
        if (cl) { cl.version = version; cl.date = date; cl.type = type; cl.notes = notes; }
    }

    markDirty();
    renderChangelogList(proj.detail.changelog);
    closeModal('changelogModal');
    adminToast(`Sürüm ${mode === 'add' ? 'eklendi' : 'güncellendi'}. Kaydetmeyi unutmayın.`, 'success');
}

function deleteChangelog(id) {
    if (!confirm('Bu sürüm notu silinsin mi?')) return;
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;
    proj.detail.changelog = proj.detail.changelog.filter(c => c.id !== id);
    markDirty();
    renderChangelogList(proj.detail.changelog);
    adminToast('Sürüm silindi.', 'success');
}

//  SSS YNETM 

function renderFaqAdmin() {
    const list = document.getElementById('faqAdminList');
    if (!list || !siteData) return;
    const faq = siteData.faq || [];
    if (!faq.length) { list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Henüz SSS kategorisi eklenmemiÅ.</p>'; return; }

    list.innerHTML = faq.map(cat => `
        <div class="faq-admin-category" data-catid="${cat.id}">
            <div class="faq-admin-cat-header">
                <input type="text" class="faq-admin-cat-title" value="${cat.category}" data-catid="${cat.id}"
                    style="background:transparent;border:none;color:var(--admin-accent);font-weight:700;font-size:0.95rem;font-family:inherit;outline:none;flex:1;">
                <button class="admin-btn admin-btn-sm add-faq-item-btn" data-catid="${cat.id}">ï¼ Madde</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm del-faq-cat-btn" data-catid="${cat.id}">ðï¸</button>
            </div>
            <div class="faq-admin-items" id="faq-items-${cat.id}">
                ${cat.items.map(item => `
                    <div class="faq-admin-item" data-itemid="${item.id}">
                        <div class="faq-admin-item-q">${item.question}</div>
                        <div class="faq-admin-item-a">${item.answer}</div>
                        <div class="faq-admin-item-actions">
                            <button class="admin-btn admin-btn-sm edit-faq-item-btn" data-catid="${cat.id}" data-itemid="${item.id}">âï¸ Düzenle</button>
                            <button class="admin-btn admin-btn-danger admin-btn-sm del-faq-item-btn" data-catid="${cat.id}" data-itemid="${item.id}">ðï¸</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Kategori bal deitirme
    list.querySelectorAll('.faq-admin-cat-title').forEach(input => {
        input.addEventListener('input', () => {
            const cat = siteData.faq.find(c => c.id === input.dataset.catid);
            if (cat) { cat.category = input.value; markDirty(); }
        });
    });

    // Madde ekleme
    list.querySelectorAll('.add-faq-item-btn').forEach(btn => {
        btn.addEventListener('click', () => openAddFaqItemModal(btn.dataset.catid));
    });

    // Madde dzenleme
    list.querySelectorAll('.edit-faq-item-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditFaqItemModal(btn.dataset.catid, btn.dataset.itemid));
    });

    // Madde silme
    list.querySelectorAll('.del-faq-item-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteFaqItem(btn.dataset.catid, btn.dataset.itemid));
    });

    // Kategori silme
    list.querySelectorAll('.del-faq-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteFaqCategory(btn.dataset.catid));
    });
}

function addFaqCategory() {
    const cat = { id: generateId('faq-cat'), category: 'ð Yeni Kategori', items: [] };
    siteData.faq.push(cat);
    markDirty();
    renderFaqAdmin();
}

function deleteFaqCategory(catId) {
    if (!confirm('Bu kategori ve tüm maddeleri silinsin mi?')) return;
    siteData.faq = siteData.faq.filter(c => c.id !== catId);
    markDirty();
    renderFaqAdmin();
}

function openAddFaqItemModal(catId) {
    editingFaqCatId = catId;
    editingFaqItemId = null;
    document.getElementById('faqItemModalTitle').textContent = 'SSS Madde Ekle';
    document.getElementById('faqQ').value = '';
    document.getElementById('faqA').value = '';
    document.getElementById('faqItemSave').dataset.mode = 'add';
    openModal('faqItemModal');
}

function openEditFaqItemModal(catId, itemId) {
    const cat = siteData.faq.find(c => c.id === catId);
    if (!cat) return;
    const item = cat.items.find(i => i.id === itemId);
    if (!item) return;
    editingFaqCatId = catId;
    editingFaqItemId = itemId;
    document.getElementById('faqItemModalTitle').textContent = 'SSS Madde Düzenle';
    document.getElementById('faqQ').value = item.question;
    document.getElementById('faqA').value = item.answer;
    document.getElementById('faqItemSave').dataset.mode = 'edit';
    openModal('faqItemModal');
}

function saveFaqItemModal() {
    const q = document.getElementById('faqQ').value.trim();
    const a = document.getElementById('faqA').value.trim();
    if (!q || !a) { adminToast('Soru ve cevap boÅ bırakılamaz.', 'error'); return; }
    const cat = siteData.faq.find(c => c.id === editingFaqCatId);
    if (!cat) return;
    const mode = document.getElementById('faqItemSave').dataset.mode;
    if (mode === 'add') {
        cat.items.push({ id: generateId('faq'), question: q, answer: a });
    } else {
        const item = cat.items.find(i => i.id === editingFaqItemId);
        if (item) { item.question = q; item.answer = a; }
    }
    markDirty();
    renderFaqAdmin();
    closeModal('faqItemModal');
    adminToast('SSS maddesi kaydedildi. Kaydetmeyi unutmayın.', 'success');
}

function deleteFaqItem(catId, itemId) {
    if (!confirm('Bu SSS maddesi silinsin mi?')) return;
    const cat = siteData.faq.find(c => c.id === catId);
    if (!cat) return;
    cat.items = cat.items.filter(i => i.id !== itemId);
    markDirty();
    renderFaqAdmin();
}

//  YASAL SAYFALAR YNETM 

function renderLegalAdmin() {
    if (!siteData) return;

    // Tarihler
    const privDate = document.getElementById('privacyDate');
    const termsDate = document.getElementById('termsDate');
    if (privDate) privDate.value = siteData.legal.privacy.lastUpdated || todayISO();
    if (termsDate) termsDate.value = siteData.legal.terms.lastUpdated || todayISO();

    // Tarih deiimlerini dinle
    if (privDate) privDate.addEventListener('change', () => { siteData.legal.privacy.lastUpdated = privDate.value; markDirty(); });
    if (termsDate) termsDate.addEventListener('change', () => { siteData.legal.terms.lastUpdated = termsDate.value; markDirty(); });

    renderLegalSections('privacy');
    renderLegalSections('terms');
}

function renderLegalSections(type) {
    const listEl = document.getElementById(type === 'privacy' ? 'privacyAdminList' : 'termsAdminList');
    if (!listEl || !siteData) return;
    const sections = siteData.legal[type].content || [];

    listEl.innerHTML = sections.map((sec, i) => `
        <div class="legal-admin-section" data-id="${sec.id}">
            <div class="legal-admin-header">
                <input type="text" class="legal-admin-heading-text legal-heading-input"
                    value="${sec.heading}" data-type="${type}" data-id="${sec.id}"
                    style="background:transparent;border:none;color:var(--admin-accent);font-weight:700;font-size:0.9rem;font-family:inherit;outline:none;flex:1;">
                <button class="admin-btn admin-btn-danger admin-btn-sm del-legal-btn" data-type="${type}" data-id="${sec.id}">ðï¸</button>
            </div>
            <div class="legal-admin-body">
                <textarea class="admin-form-group legal-text-input" rows="3"
                    data-type="${type}" data-id="${sec.id}"
                    style="width:100%;background:rgba(255,71,87,0.04);border:1.5px solid var(--admin-border);border-radius:12px;color:var(--text-primary,#e8eaf0);font-family:inherit;font-size:0.85rem;padding:10px 14px;outline:none;box-sizing:border-box;resize:vertical;"
                >${sec.text}</textarea>
            </div>
        </div>
    `).join('');

    // Balk deiimi
    listEl.querySelectorAll('.legal-heading-input').forEach(input => {
        input.addEventListener('input', () => {
            const sec = siteData.legal[input.dataset.type].content.find(s => s.id === input.dataset.id);
            if (sec) { sec.heading = input.value; markDirty(); }
        });
    });

    // Metin deiimi
    listEl.querySelectorAll('.legal-text-input').forEach(ta => {
        ta.addEventListener('input', () => {
            const sec = siteData.legal[ta.dataset.type].content.find(s => s.id === ta.dataset.id);
            if (sec) { sec.text = ta.value; markDirty(); }
        });
    });

    // Silme
    listEl.querySelectorAll('.del-legal-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteLegalSection(btn.dataset.type, btn.dataset.id));
    });
}

function addLegalSection(type) {
    const sec = { id: generateId(`${type}-sec`), heading: 'Yeni Bölüm BaÅlıÄı', text: 'Bölüm içeriÄi buraya yazılacak.' };
    siteData.legal[type].content.push(sec);
    markDirty();
    renderLegalSections(type);
}

function deleteLegalSection(type, id) {
    if (!confirm('Bu bölüm silinsin mi?')) return;
    siteData.legal[type].content = siteData.legal[type].content.filter(s => s.id !== id);
    markDirty();
    renderLegalSections(type);
}

//  YARDIMCI: DOSYA  BASE64 

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

//  LGHTBOX 

function openLightbox(src) {
    const lb = document.getElementById('adminLightbox');
    const img = document.getElementById('adminLightboxImg');
    if (!lb || !img) return;
    img.src = src;
    lb.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('adminLightbox');
    if (!lb) return;
    lb.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(() => { document.getElementById('adminLightboxImg').src = ''; }, 300);
}

function initLightbox() {
    const closeBtn = document.getElementById('adminLightboxClose');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    const lb = document.getElementById('adminLightbox');
    if (lb) lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

//  SOSYAL MEDYA AKI YNETM 

function renderSocialFeedAdmin() {
    const list = document.getElementById('socialAdminList');
    const label = document.getElementById('socialLastUpdatedLabel');
    if (!list || !siteData) return;

    const social = siteData.socialFeed || { lastUpdated: '-', posts: [] };
    if (label) label.textContent = `Son Güncelleme: ${social.lastUpdated || '-'}`;

    const posts = social.posts || [];
    if (!posts.length) {
        list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;grid-column:1/-1;">Henüz sosyal medya gönderisi çekilmemiÅ. Yukarıdaki butona basarak rastgele gönderi çekebilirsiniz.</p>';
        return;
    }

    list.innerHTML = posts.map(p => `
        <div class="admin-card" style="margin-bottom:0;padding:16px;background:rgba(255,71,87,0.03);border:1px solid var(--admin-border);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <span class="admin-nav-badge" style="background:${p.badgeColor || '#ff4757'};color:#fff;border:none;">
                    ${p.platformName || p.platform}
                </span>
                <span style="font-size:0.72rem;color:var(--text-secondary);">${p.date || ''}</span>
            </div>
            <div style="aspect-ratio:16/9;border-radius:10px;overflow:hidden;margin-bottom:10px;background:#000;">
                <img src="${p.thumbnail}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='resimler/sosyalmedya_post1.png'">
            </div>
            <h4 style="font-size:0.88rem;font-weight:700;color:var(--text-primary,#e8eaf0);margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.title}</h4>
            <p style="font-size:0.78rem;color:var(--text-secondary);margin:0 0 10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.description}</p>
            <a href="${p.postUrl}" target="_blank" rel="noopener" class="admin-btn admin-btn-sm" style="width:100%;justify-content:center;">
                Orijinal Gönderi â
            </a>
        </div>
    `).join('');
}

// Havuz: Her platform iin rastgele seilebilecek gnderiler
const SOCIAL_POST_POOLS = {
    youtube: [
        {
            title: "ð Grup Konum V2 â Canlı Harita & Sohbet Testi",
            description: "Low-latency GPS senkronizasyonu ve entegre sohbet özelliklerinin detaylı canlı gösterimi.",
            thumbnail: "resimler/sosyalmedya_post2.png",
            postUrl: "https://youtube.com",
            author: "AVS&V9 Official",
            badgeColor: "#FF0000"
        },
        {
            title: "ð¦ V9 Kurye â Rota Optimizasyon Algoritması",
            description: "En kısa teslimat rotasını saniyeler içinde hesaplayan yeni harita altyapımız yayında.",
            thumbnail: "resimler/sosyalmedya_post1.png",
            postUrl: "https://youtube.com",
            author: "AVS&V9 Official",
            badgeColor: "#FF0000"
        },
        {
            title: "â¡ V9 Proje Ailesi â 2026 Sezonu Tanıtım Filmi",
            description: "GeliÅtirdiÄimiz tüm mobil uygulamalar ve gelecek projelerin toplu tanıtım videosu.",
            thumbnail: "resimler/sosyalmedya_post3.png",
            postUrl: "https://youtube.com",
            author: "AVS&V9 Official",
            badgeColor: "#FF0000"
        }
    ],
    instagram: [
        {
            title: "ð V9 Kurye â GeliÅtirme Sürecinden Kareler",
            description: "Gerçek zamanlı harita entegrasyonunun sahne arkasına dair özel fotoÄraflar ve kod parçaları.",
            thumbnail: "resimler/sosyalmedya_post1.png",
            postUrl: "https://instagram.com",
            author: "@avsv9_dev",
            badgeColor: "#E1306C"
        },
        {
            title: "ð¨ Yeni Karanlık Tema Arayüz Tasarımı",
            description: "Kullanıcı deneyimini üst seviyeye çıkaran yeni oval kart tasarımı ve neon kırmızı dokunuÅlar.",
            thumbnail: "resimler/sosyalmedya_post2.png",
            postUrl: "https://instagram.com",
            author: "@avsv9_dev",
            badgeColor: "#E1306C"
        },
        {
            title: "ð± Mobil Test Laboratuvarı â Sahadan Görüntüler",
            description: "Farklı Android cihazlarda gerçekleÅtirdiÄimiz GPS performans test günlüÄü.",
            thumbnail: "resimler/sosyalmedya_post3.png",
            postUrl: "https://instagram.com",
            author: "@avsv9_dev",
            badgeColor: "#E1306C"
        }
    ],
    tiktok: [
        {
            title: "â¡ Yeni Güncelleme â Canlı Harita Demosu",
            description: "Son güncellemeyle gelen canlı takip özelliklerinin 30 saniyelik eÄlenceli dikey videosu.",
            thumbnail: "resimler/sosyalmedya_post3.png",
            postUrl: "https://tiktok.com",
            author: "@avsv9_official",
            badgeColor: "#00f2fe"
        },
        {
            title: "ð Yazılımcı GünlüÄü â Gece Kodlaması",
            description: "V9 V2 mimarisini oluÅtururken karÅılaÅtıÄımız komik anlar ve performans testi sonuçları.",
            thumbnail: "resimler/sosyalmedya_post2.png",
            postUrl: "https://tiktok.com",
            author: "@avsv9_official",
            badgeColor: "#00f2fe"
        },
        {
            title: "ð 10 Saniyede Rota Nasıl Hesaplanır?",
            description: "Kurye uygulamamızın arkasındaki akıllı algoritmanın eÄlenceli görsel özeti.",
            thumbnail: "resimler/sosyalmedya_post1.png",
            postUrl: "https://tiktok.com",
            author: "@avsv9_official",
            badgeColor: "#00f2fe"
        }
    ],
    x: [
        {
            title: "ð£ V9 Harita Motoru Sürüm Notları",
            description: "Yeni rota optimizasyon algoritması ve bellek iyileÅtirmeleri hakkında detaylı teknik tweet dizisi.",
            thumbnail: "resimler/sosyalmedya_post1.png",
            postUrl: "https://x.com",
            author: "@avsv9_dev",
            badgeColor: "#1DA1F2"
        },
        {
            title: "ð¡ Performans Güncellemesi: Low-Latency GPS",
            description: "Anlık konum aktarımındaki gecikme süresini %40 düÅüren yeni sunucu güncellemesi yayında!",
            thumbnail: "resimler/sosyalmedya_post2.png",
            postUrl: "https://x.com",
            author: "@avsv9_dev",
            badgeColor: "#1DA1F2"
        },
        {
            title: "ð AVS&V9 Yönetim Paneli Yayında!",
            description: "Tüm site içeriÄini anlık olarak GitHub ile senkronize eden tam kontrollü admin panelimiz hazır.",
            thumbnail: "resimler/sosyalmedya_post3.png",
            postUrl: "https://x.com",
            author: "@avsv9_dev",
            badgeColor: "#1DA1F2"
        }
    ]
};

async function fetchRandomSocialPosts() {
    if (!ghAPI || !siteData) {
        adminToast('Ãnce panel verileri yüklenmelidir.', 'error');
        return;
    }

    adminLoading(true, 'Sosyal medya gönderileri çekiliyor...');

    try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const nowTimeStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

        const getRandomItem = arr => arr[Math.floor(Math.random() * arr.length)];

        // Her platformdan rastgele 1 gnderi se (Overwrite kural  eskinin zerine yazar)
        const newPosts = [
            {
                id: `soc-yt-${Date.now()}`,
                platform: 'youtube',
                platformName: 'YouTube',
                ...getRandomItem(SOCIAL_POST_POOLS.youtube),
                date: todayStr
            },
            {
                id: `soc-ig-${Date.now()}`,
                platform: 'instagram',
                platformName: 'Instagram',
                ...getRandomItem(SOCIAL_POST_POOLS.instagram),
                date: todayStr
            },
            {
                id: `soc-tt-${Date.now()}`,
                platform: 'tiktok',
                platformName: 'TikTok',
                ...getRandomItem(SOCIAL_POST_POOLS.tiktok),
                date: todayStr
            },
            {
                id: `soc-x-${Date.now()}`,
                platform: 'x',
                platformName: 'X (Twitter)',
                ...getRandomItem(SOCIAL_POST_POOLS.x),
                date: todayStr
            }
        ];

        // site-data.json iindeki socialFeed objesinin zerine yaz
        siteData.socialFeed = {
            lastUpdated: nowTimeStr,
            posts: newPosts
        };

        markDirty();

        renderSocialFeedAdmin();
        adminToast('â\n Yeni rastgele sosyal medya gönderileri çekildi ve kaydedildi!', 'success', 4000);

    } catch (err) {
        adminToast(`Gönderi çekme hatası: ${err.message}`, 'error', 5000);
    } finally {
        adminLoading(false);
    }
}


//  OTO EVR (Google Translate) 

function initAutoTranslate() {
    const btn = document.getElementById('adminAutoTranslateBtn');
    if (btn) btn.addEventListener('click', autoTranslateAll);
}

async function googleTranslate(text, sl = 'tr', tl = 'en') {
    if (!text) return text;
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data[0].map(s => s[0]).join('');
    } catch (e) {
        console.error('Translate error:', e);
        return text;
    }
}

async function translateArray(arr) {
    if (!Array.isArray(arr)) return arr;
    const res = [];
    for (const item of arr) {
        res.push(await googleTranslate(item));
    }
    return res;
}

async function autoTranslateAll() {
    if (!siteData) return;
    
    adminLoading(true, 'Otomatik çevriliyor (Google Translate)... Lütfen bekleyin.');
    
    try {
        let count = 0;

        // Projeler
        for (const proj of siteData.projects) {
            if (proj.name && !proj.nameEN) { proj.nameEN = await googleTranslate(proj.name); count++; }
            if (proj.shortDesc && !proj.shortDescEN) { proj.shortDescEN = await googleTranslate(proj.shortDesc); count++; }
            
            if (proj.detail) {
                if (proj.detail.statusText && !proj.detail.statusTextEN) {
                    proj.detail.statusTextEN = await googleTranslate(proj.detail.statusText);
                    count++;
                }
                if (proj.detail.description && proj.detail.description.length > 0 && (!proj.detail.descriptionEN || proj.detail.descriptionEN.length === 0)) {
                    proj.detail.descriptionEN = await translateArray(proj.detail.description);
                    count += proj.detail.description.length;
                }
                
                if (proj.detail.changelog) {
                    for (const cl of proj.detail.changelog) {
                        if (cl.notes && cl.notes.length > 0 && (!cl.notesEN || cl.notesEN.length === 0)) {
                            cl.notesEN = await translateArray(cl.notes);
                            count += cl.notes.length;
                        }
                    }
                }
            }
        }
        
        // SSS
        if (siteData.faq) {
            for (const cat of siteData.faq) {
                if (cat.category && !cat.categoryEN) { cat.categoryEN = await googleTranslate(cat.category); count++; }
                if (cat.items) {
                    for (const item of cat.items) {
                        if (item.question && !item.questionEN) { item.questionEN = await googleTranslate(item.question); count++; }
                        if (item.answer && !item.answerEN) { item.answerEN = await googleTranslate(item.answer); count++; }
                    }
                }
            }
        }
        
        // Yasal
        if (siteData.legal) {
            for (const type of ['privacy', 'terms']) {
                if (siteData.legal[type] && siteData.legal[type].content) {
                    for (const sec of siteData.legal[type].content) {
                        if (sec.heading && !sec.headingEN) { sec.headingEN = await googleTranslate(sec.heading); count++; }
                        if (sec.text && !sec.textEN) { sec.textEN = await googleTranslate(sec.text); count++; }
                    }
                }
            }
        }
        
        markDirty();
        renderProjectList();
        renderDetailProjectSelector();
        renderFaqAdmin();
        renderLegalAdmin();
        
        adminToast(`Çeviri tamamlandý. Toplam ${count} alan çevrildi. Deðiþiklikleri kaydetmeyi unutmayýn.`, 'success', 5000);
    } catch (e) {
        adminToast('Çeviri sýrasýnda bir hata oluþtu.', 'error');
        console.error(e);
    } finally {
        adminLoading(false);
    }
}


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



