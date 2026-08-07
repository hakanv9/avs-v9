/* ============================================================
   ADMIN.JS \xe2\x80\x94 AVS&V9 Y\xf6netim Paneli
   GitHub REST API \xfczerinden site verilerini y\xf6netir.
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
    const icons = { success: '\xe2\x9c
', error: '\xe2\x9d\x8c', info: '\xe2\x84\xb9\xef\xb8\x8f', warning: '\xe2\x9a\xa0\xef\xb8\x8f' };
    t.innerHTML = `<span>${icons[type] || '\xe2\x84\xb9\xef\xb8\x8f'}</span> ${msg}`;
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
            throw new Error(`GitHub dosya okunamad\u0131 (${res.status}): ${path}`);
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
            throw new Error(`GitHub kay\u0131t hatas\u0131: ${err.message || res.status}`);
        }
        return res.json();
    }

    async uploadImage(filename, base64Data, folder = 'resimler') {
        // Dosya adndan sorunlu karakterleri temizle (GitHub path hatas nlenir)
        const safeFilename = filename
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')  // Aksanlar\u0131 kald\u0131r
            .replace(/[^a-zA-Z0-9._\-]/g, '_') // Sadece g\xfcvenli karakterler
            .replace(/_{2,}/g, '_')             // \xc3\x87ift alt \xe7izgi temizle
            .replace(/^_|_$/g, '');            // Ba\xc5\x9f/son alt \xe7izgi kald\u0131r
        const path = `${folder}/${safeFilename}`;
        const existing = await this.getFile(path);
        const sha = existing ? existing.sha : null;
        const pureBase64 = base64Data.split(',')[1] || base64Data;
        const res = await fetch(`${this.baseUrl}/contents/${path}`, {
            method: 'PUT',
            headers: this.headers(),
            body: JSON.stringify({
                message: `\xf0\x9f\x96\xbc\xef\xb8\x8f Admin: G\xf6rsel y\xfcklendi \xe2\x80\x94 ${safeFilename}`,
                content: pureBase64,
                branch: this.branch,
                ...(sha ? { sha } : {})
            })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`G\xf6rsel y\xfckleme hatas\u0131: ${err.message || res.status}`);
        }
        return `${folder}/${safeFilename}`;
    }

    async deleteFile(path, sha, commitMsg) {
        const res = await fetch(`${this.baseUrl}/contents/${path}`, {
            method: 'DELETE',
            headers: this.headers(),
            body: JSON.stringify({ message: commitMsg, sha, branch: this.branch })
        });
        if (!res.ok) throw new Error(`Silme hatas\u0131: ${res.status}`);
        return res.json();
    }

    async saveSiteData(data) {
        const path = 'data/site-data.json';
        // Her kaydetmede taze SHA al  stale SHA hatasn nler
        const existing = await this.getFile(path);
        const sha = existing ? existing.sha : null;
        const content = JSON.stringify(data, null, 2);
        return this.putFile(path, content, '\xe2\x9a\x99\xef\xb8\x8f Admin: Site verileri g\xfcncellendi', sha);
    }

    async loadSiteData() {
        const file = await this.getFile('data/site-data.json');
        if (!file) throw new Error('site-data.json bulunamad\u0131!');
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
    'live':          { label: '\xe2\x9c
 Yay\u0131nda',                    tag: 'tag-live',       class: 'active' },
    'development':   { label: '\xe2\x8f\xb3 Geli\xc5\x9ftirme A\xc5\x9famas\u0131nda',    tag: 'tag-wip',        class: 'wip' },
    'completed':     { label: '\xf0\x9f\x94\xb5 Tamamland\u0131',              tag: 'tag-completed',  class: 'completed' },
    'discontinued':  { label: '\xf0\x9f\x93\x94 Yay\u0131ndan Kald\u0131r\u0131lm\u0131\xc5\x9f',    tag: 'tag-inactive',   class: 'inactive' },
    'paused':        { label: '\xe2\x8f\xb8\xef\xb8\x8f Geli\xc5\x9ftirme Durdurulmu\xc5\x9f', tag: 'tag-soon',       class: 'paused' },
    'research':      { label: '\xf0\x9f\x94\x8d Ara\xc5\x9ft\u0131rma A\xc5\x9famas\u0131nda',  tag: 'tag-wip',        class: 'wip' },
    'bugfix':        { label: '\xf0\x9f\x9b\xa0\xef\xb8\x8f Hata D\xfczeltme',          tag: 'tag-wip',        class: 'wip' },
    'waiting':       { label: '\xe2\x8f\xb3 Beklemede',                  tag: 'tag-soon',       class: 'paused' },
    'special':       { label: '\xe2\xad\x90 \xc3\x96zel Durum',                tag: 'tag-soon',       class: 'wip' },
    'rnd':           { label: '\xf0\x9f\xa7\xaa Ar-Ge A\xc5\x9famas\u0131nda',        tag: 'tag-wip',        class: 'wip' }
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
            showError('L\xfctfen t\xfcm alanlar\u0131 doldurun.');
            return;
        }

        loginBtn.textContent = '\xf0\x9f\x94\x84 Do\xc4\x9frulan\u0131yor...';
        loginBtn.disabled = true;
        errorEl.classList.remove('visible');

        try {
            const api = new GitHubAPI(token, owner, repo);
            // Test: repo'yu okumay dene
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: api.headers()
            });

            if (!res.ok) {
                if (res.status === 401) throw new Error('Token ge\xe7ersiz. L\xfctfen GitHub Token\'\u0131n\u0131z\u0131 kontrol edin.');
                if (res.status === 404) throw new Error('Repo bulunamad\u0131. Kullan\u0131c\u0131 ad\u0131 ve repo ad\u0131n\u0131 kontrol edin.');
                throw new Error(`Ba\xc4\x9flant\u0131 hatas\u0131: ${res.status}`);
            }

            ghAPI = api;
            saveSession(token, owner, repo);
            adminToast('Giri\xc5\x9f ba\xc5\x9far\u0131l\u0131! Panel y\xfckleniyor...', 'success');
            setTimeout(showPanel, 600);

        } catch (err) {
            showError(err.message);
            loginBtn.textContent = '\xf0\x9f\x94\x93 Giri\xc5\x9f Yap';
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
                if (!confirm('Kaydedilmemi\xc5\x9f de\xc4\x9fi\xc5\x9fiklikler var. \xc3\x87\u0131kmak istedi\xc4\x9finize emin misiniz?')) return;
            }
            // GV-2: Bellekten temizle
            ghAPI = null;
            siteData = null;
            window._adminDirty = false;
            adminToast('Oturum kapat\u0131ld\u0131.', 'info');
            showLogin();
        });
    }
}

//  VER YKLEME 

async function loadAndRenderAll() {
    adminLoading(true, 'Site verileri y\xfckleniyor...');
    try {
        const { data } = await ghAPI.loadSiteData();
        siteData = data;
        renderSliderSection();
        renderProjectList();
        renderDetailProjectSelector();
        renderFaqAdmin();
        renderLegalAdmin();
        renderSocialFeedAdmin();
        adminToast('Veriler y\xfcklendi!', 'success', 2000);
    } catch (err) {
        adminToast(`Y\xfckleme hatas\u0131: ${err.message}`, 'error', 6000);
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
        icon.textContent = theme === 'dark' ? '\xf0\x9f\x8c\x99' : '\xe2\x98\x80\xef\xb8\x8f';
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
        if (confirm('De\xc4\x9fi\xc5\x9fiklikler iptal edilsin mi?')) {
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
        adminToast('\xe2\x9c
 T\xfcm de\xc4\x9fi\xc5\x9fiklikler GitHub\'a kaydedildi! Site ~15 saniyede g\xfcncellenir.', 'success', 5000);
    } catch (err) {
        adminToast(`Kay\u0131t hatas\u0131: ${err.message}`, 'error', 6000);
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
            <button class="img-delete-btn" data-id="${s.id}" title="Sil">\xe2\x9c\x95</button>
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
    adminLoading(true, 'G\xf6rseller y\xfckleniyor...');
    try {
        for (const file of Array.from(files)) {
            if (file.size > 5 * 1024 * 1024) { adminToast(`${file.name} 5MB s\u0131n\u0131r\u0131n\u0131 a\xc5\x9f\u0131yor.`, 'error'); continue; }
            const base64 = await fileToBase64(file);
            const filename = `hero-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
            const path = await ghAPI.uploadImage(filename, base64);
            siteData.heroSlider.push({ id: generateId('slide'), src: path, alt: file.name.split('.')[0], order: siteData.heroSlider.length + 1 });
        }
        markDirty();
        renderSliderSection();
        adminToast('G\xf6rseller y\xfcklendi!', 'success');
    } catch (err) {
        adminToast(`Y\xfckleme hatas\u0131: ${err.message}`, 'error');
    } finally {
        adminLoading(false);
        document.getElementById('sliderFileInput').value = '';
    }
}

async function deleteSliderImage(id) {
    if (!confirm('Bu g\xf6rsel silinsin mi?')) return;
    const idx = siteData.heroSlider.findIndex(s => s.id === id);
    if (idx === -1) return;
    siteData.heroSlider.splice(idx, 1);
    siteData.heroSlider.forEach((s, i) => s.order = i + 1);
    adminLoading(true, 'Kaydediliyor...');
    try {
        markDirty();
        renderSliderSection();
        adminToast('G\xf6rsel silindi.', 'success');
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
    if (!projects.length) { list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Hen\xfcz proje eklenmemi\xc5\x9f.</p>'; return; }

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
                <button class="admin-btn admin-btn-sm edit-proj-btn" data-id="${p.id}" title="D\xfczenle">\xe2\x9c\x8f\xef\xb8\x8f</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm del-proj-btn" data-id="${p.id}" title="Sil">\xf0\x9f\x97\x91\xef\xb8\x8f</button>
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
    if (!confirm('Bu proje silinsin mi? Bu i\xc5\x9flem geri al\u0131namaz.')) return;
    siteData.projects = siteData.projects.filter(p => p.id !== id);
    markDirty();
    renderProjectList();
    renderDetailProjectSelector();
    adminToast('Proje silindi. Kaydetmeyi unutmay\u0131n.', 'warning');
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
    document.getElementById('projectModalTitle').textContent = 'Projeyi D\xfczenle';
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

    if (!name || !slug) { adminToast('Proje ad\u0131 ve slug zorunludur.', 'error'); return; }

    // Thumbnail dosya ykleme varsa nce ykle
    const thumbFile = document.getElementById('pmThumbnailFile').files[0];
    if (thumbFile) {
        try {
            adminLoading(true, 'Kapak g\xf6rseli y\xfckleniyor...');
            const base64 = await fileToBase64(thumbFile);
            const safeSlug = slug.replace(/[^a-zA-Z0-9\-]/g, '_');
            const filename = `thumb-${safeSlug}-${Date.now()}.${thumbFile.name.split('.').pop()}`;
            thumbnail = await ghAPI.uploadImage(filename, base64);
        } catch (err) {
            adminToast(`Kapak g\xf6rseli y\xfcklenemedi: ${err.message}`, 'error');
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
        adminToast('Yeni proje eklendi. Kaydetmeyi unutmay\u0131n.', 'success');
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
        adminToast('Proje g\xfcncellendi. Kaydetmeyi unutmay\u0131n.', 'success');
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
    if (!currentProjectId) { adminToast('\xc3\x96nce bir proje se\xe7in.', 'warning'); return; }
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
    adminToast('Proje detaylar\u0131 g\xfcncellendi. Kaydetmeyi unutmay\u0131n.', 'success');
}

//  EKRAN GRNTLER 

function renderScreenshots(screenshots) {
    const grid = document.getElementById('screenshotGrid');
    if (!grid) return;
    grid.innerHTML = screenshots.map((src, i) => `
        <div class="screenshot-item" data-idx="${i}">
            <img src="${src}" alt="G\xf6rsel ${i+1}"
                onerror="this.parentElement.style.display='none'"
                onload="this.parentElement.className = 'screenshot-item ' + (this.naturalWidth > this.naturalHeight ? 'landscape' : this.naturalWidth === this.naturalHeight ? 'square' : '');"
                style="cursor:zoom-in;" onclick="openLightbox('${src}')"
            >
            <button class="ss-del-btn" data-idx="${i}" title="Sil">\xe2\x9c\x95</button>
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
    if (!currentProjectId) { adminToast('L\xfctfen \xf6nce bir proje se\xe7in.', 'warning'); return; }
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;
    adminLoading(true, 'G\xf6rseller y\xfckleniyor...');
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
        adminToast('G\xf6rseller y\xfcklendi!', 'success');
    } catch (err) {
        adminToast(`Y\xfckleme hatas\u0131: ${err.message}`, 'error');
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
    if (!changelog.length) { list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:16px;">Hen\xfcz s\xfcr\xfcm eklenmemi\xc5\x9f.</p>'; return; }

    list.innerHTML = changelog.map(cl => `
        <div class="changelog-item" data-id="${cl.id}">
            <span class="changelog-version-badge ${cl.type}">${cl.version}</span>
            <div class="changelog-info">
                <div class="changelog-date">\xf0\x9f\x93
 ${cl.date} \xb7 ${cl.type.toUpperCase()}</div>
                <ul class="changelog-notes">
                    ${cl.notes.map(n => `<li>${n}</li>`).join('')}
                </ul>
            </div>
            <div class="changelog-actions">
                <button class="admin-btn admin-btn-sm edit-cl-btn" data-id="${cl.id}">\xe2\x9c\x8f\xef\xb8\x8f</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm del-cl-btn" data-id="${cl.id}">\xf0\x9f\x97\x91\xef\xb8\x8f</button>
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
    if (!currentProjectId) { adminToast('\xc3\x96nce bir proje se\xe7in.', 'warning'); return; }
    editingChangelogId = null;
    document.getElementById('changelogModalTitle').textContent = 'Yeni S\xfcr\xfcm Ekle';
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
    document.getElementById('changelogModalTitle').textContent = 'S\xfcr\xfcm\xfc D\xfczenle';
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

    if (!version || !notes.length) { adminToast('Versiyon ve en az 1 de\xc4\x9fi\xc5\x9fiklik notu gerekli.', 'error'); return; }

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
    adminToast(`S\xfcr\xfcm ${mode === 'add' ? 'eklendi' : 'g\xfcncellendi'}. Kaydetmeyi unutmay\u0131n.`, 'success');
}

function deleteChangelog(id) {
    if (!confirm('Bu s\xfcr\xfcm notu silinsin mi?')) return;
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;
    proj.detail.changelog = proj.detail.changelog.filter(c => c.id !== id);
    markDirty();
    renderChangelogList(proj.detail.changelog);
    adminToast('S\xfcr\xfcm silindi.', 'success');
}

//  SSS YNETM 

function renderFaqAdmin() {
    const list = document.getElementById('faqAdminList');
    if (!list || !siteData) return;
    const faq = siteData.faq || [];
    if (!faq.length) { list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Hen\xfcz SSS kategorisi eklenmemi\xc5\x9f.</p>'; return; }

    list.innerHTML = faq.map(cat => `
        <div class="faq-admin-category" data-catid="${cat.id}">
            <div class="faq-admin-cat-header">
                <input type="text" class="faq-admin-cat-title" value="${cat.category}" data-catid="${cat.id}"
                    style="background:transparent;border:none;color:var(--admin-accent);font-weight:700;font-size:0.95rem;font-family:inherit;outline:none;flex:1;">
                <button class="admin-btn admin-btn-sm add-faq-item-btn" data-catid="${cat.id}">\xef\xbc\x8b Madde</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm del-faq-cat-btn" data-catid="${cat.id}">\xf0\x9f\x97\x91\xef\xb8\x8f</button>
            </div>
            <div class="faq-admin-items" id="faq-items-${cat.id}">
                ${cat.items.map(item => `
                    <div class="faq-admin-item" data-itemid="${item.id}">
                        <div class="faq-admin-item-q">${item.question}</div>
                        <div class="faq-admin-item-a">${item.answer}</div>
                        <div class="faq-admin-item-actions">
                            <button class="admin-btn admin-btn-sm edit-faq-item-btn" data-catid="${cat.id}" data-itemid="${item.id}">\xe2\x9c\x8f\xef\xb8\x8f D\xfczenle</button>
                            <button class="admin-btn admin-btn-danger admin-btn-sm del-faq-item-btn" data-catid="${cat.id}" data-itemid="${item.id}">\xf0\x9f\x97\x91\xef\xb8\x8f</button>
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
    const cat = { id: generateId('faq-cat'), category: '\xf0\x9f\x93\x8c Yeni Kategori', items: [] };
    siteData.faq.push(cat);
    markDirty();
    renderFaqAdmin();
}

function deleteFaqCategory(catId) {
    if (!confirm('Bu kategori ve t\xfcm maddeleri silinsin mi?')) return;
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
    document.getElementById('faqItemModalTitle').textContent = 'SSS Madde D\xfczenle';
    document.getElementById('faqQ').value = item.question;
    document.getElementById('faqA').value = item.answer;
    document.getElementById('faqItemSave').dataset.mode = 'edit';
    openModal('faqItemModal');
}

function saveFaqItemModal() {
    const q = document.getElementById('faqQ').value.trim();
    const a = document.getElementById('faqA').value.trim();
    if (!q || !a) { adminToast('Soru ve cevap bo\xc5\x9f b\u0131rak\u0131lamaz.', 'error'); return; }
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
    adminToast('SSS maddesi kaydedildi. Kaydetmeyi unutmay\u0131n.', 'success');
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
                <button class="admin-btn admin-btn-danger admin-btn-sm del-legal-btn" data-type="${type}" data-id="${sec.id}">\xf0\x9f\x97\x91\xef\xb8\x8f</button>
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
    const sec = { id: generateId(`${type}-sec`), heading: 'Yeni B\xf6l\xfcm Ba\xc5\x9fl\u0131\xc4\x9f\u0131', text: 'B\xf6l\xfcm i\xe7eri\xc4\x9fi buraya yaz\u0131lacak.' };
    siteData.legal[type].content.push(sec);
    markDirty();
    renderLegalSections(type);
}

function deleteLegalSection(type, id) {
    if (!confirm('Bu b\xf6l\xfcm silinsin mi?')) return;
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
    if (label) label.textContent = `Son G\xfcncelleme: ${social.lastUpdated || '-'}`;

    const posts = social.posts || [];
    if (!posts.length) {
        list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;grid-column:1/-1;">Hen\xfcz sosyal medya g\xf6nderisi \xe7ekilmemi\xc5\x9f. Yukar\u0131daki butona basarak rastgele g\xf6nderi \xe7ekebilirsiniz.</p>';
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
                Orijinal G\xf6nderi \xe2\x86\x97
            </a>
        </div>
    `).join('');
}

// Havuz: Her platform iin rastgele seilebilecek gnderiler
const SOCIAL_POST_POOLS = {
    youtube: [
        {
            title: "\xf0\x9f\x93\x8d Grup Konum V2 \xe2\x80\x94 Canl\u0131 Harita & Sohbet Testi",
            description: "Low-latency GPS senkronizasyonu ve entegre sohbet \xf6zelliklerinin detayl\u0131 canl\u0131 g\xf6sterimi.",
            thumbnail: "resimler/sosyalmedya_post2.png",
            postUrl: "https://youtube.com",
            author: "AVS&V9 Official",
            badgeColor: "#FF0000"
        },
        {
            title: "\xf0\x9f\x93\xa6 V9 Kurye \xe2\x80\x94 Rota Optimizasyon Algoritmas\u0131",
            description: "En k\u0131sa teslimat rotas\u0131n\u0131 saniyeler i\xe7inde hesaplayan yeni harita altyap\u0131m\u0131z yay\u0131nda.",
            thumbnail: "resimler/sosyalmedya_post1.png",
            postUrl: "https://youtube.com",
            author: "AVS&V9 Official",
            badgeColor: "#FF0000"
        },
        {
            title: "\xe2\x9a\xa1 V9 Proje Ailesi \xe2\x80\x94 2026 Sezonu Tan\u0131t\u0131m Filmi",
            description: "Geli\xc5\x9ftirdi\xc4\x9fimiz t\xfcm mobil uygulamalar ve gelecek projelerin toplu tan\u0131t\u0131m videosu.",
            thumbnail: "resimler/sosyalmedya_post3.png",
            postUrl: "https://youtube.com",
            author: "AVS&V9 Official",
            badgeColor: "#FF0000"
        }
    ],
    instagram: [
        {
            title: "\xf0\x9f\x9a\x80 V9 Kurye \xe2\x80\x94 Geli\xc5\x9ftirme S\xfcrecinden Kareler",
            description: "Ger\xe7ek zamanl\u0131 harita entegrasyonunun sahne arkas\u0131na dair \xf6zel foto\xc4\x9fraflar ve kod par\xe7alar\u0131.",
            thumbnail: "resimler/sosyalmedya_post1.png",
            postUrl: "https://instagram.com",
            author: "@avsv9_dev",
            badgeColor: "#E1306C"
        },
        {
            title: "\xf0\x9f\x8e\xa8 Yeni Karanl\u0131k Tema Aray\xfcz Tasar\u0131m\u0131",
            description: "Kullan\u0131c\u0131 deneyimini \xfcst seviyeye \xe7\u0131karan yeni oval kart tasar\u0131m\u0131 ve neon k\u0131rm\u0131z\u0131 dokunu\xc5\x9flar.",
            thumbnail: "resimler/sosyalmedya_post2.png",
            postUrl: "https://instagram.com",
            author: "@avsv9_dev",
            badgeColor: "#E1306C"
        },
        {
            title: "\xf0\x9f\x93\xb1 Mobil Test Laboratuvar\u0131 \xe2\x80\x94 Sahadan G\xf6r\xfcnt\xfcler",
            description: "Farkl\u0131 Android cihazlarda ger\xe7ekle\xc5\x9ftirdi\xc4\x9fimiz GPS performans test g\xfcnl\xfc\xc4\x9f\xfc.",
            thumbnail: "resimler/sosyalmedya_post3.png",
            postUrl: "https://instagram.com",
            author: "@avsv9_dev",
            badgeColor: "#E1306C"
        }
    ],
    tiktok: [
        {
            title: "\xe2\x9a\xa1 Yeni G\xfcncelleme \xe2\x80\x94 Canl\u0131 Harita Demosu",
            description: "Son g\xfcncellemeyle gelen canl\u0131 takip \xf6zelliklerinin 30 saniyelik e\xc4\x9flenceli dikey videosu.",
            thumbnail: "resimler/sosyalmedya_post3.png",
            postUrl: "https://tiktok.com",
            author: "@avsv9_official",
            badgeColor: "#00f2fe"
        },
        {
            title: "\xf0\x9f\x94\x8d Yaz\u0131l\u0131mc\u0131 G\xfcnl\xfc\xc4\x9f\xfc \xe2\x80\x94 Gece Kodlamas\u0131",
            description: "V9 V2 mimarisini olu\xc5\x9ftururken kar\xc5\x9f\u0131la\xc5\x9ft\u0131\xc4\x9f\u0131m\u0131z komik anlar ve performans testi sonu\xe7lar\u0131.",
            thumbnail: "resimler/sosyalmedya_post2.png",
            postUrl: "https://tiktok.com",
            author: "@avsv9_official",
            badgeColor: "#00f2fe"
        },
        {
            title: "\xf0\x9f\x9a\x80 10 Saniyede Rota Nas\u0131l Hesaplan\u0131r?",
            description: "Kurye uygulamam\u0131z\u0131n arkas\u0131ndaki ak\u0131ll\u0131 algoritman\u0131n e\xc4\x9flenceli g\xf6rsel \xf6zeti.",
            thumbnail: "resimler/sosyalmedya_post1.png",
            postUrl: "https://tiktok.com",
            author: "@avsv9_official",
            badgeColor: "#00f2fe"
        }
    ],
    x: [
        {
            title: "\xf0\x9f\x93\xa3 V9 Harita Motoru S\xfcr\xfcm Notlar\u0131",
            description: "Yeni rota optimizasyon algoritmas\u0131 ve bellek iyile\xc5\x9ftirmeleri hakk\u0131nda detayl\u0131 teknik tweet dizisi.",
            thumbnail: "resimler/sosyalmedya_post1.png",
            postUrl: "https://x.com",
            author: "@avsv9_dev",
            badgeColor: "#1DA1F2"
        },
        {
            title: "\xf0\x9f\x92\xa1 Performans G\xfcncellemesi: Low-Latency GPS",
            description: "Anl\u0131k konum aktar\u0131m\u0131ndaki gecikme s\xfcresini %40 d\xfc\xc5\x9f\xfcren yeni sunucu g\xfcncellemesi yay\u0131nda!",
            thumbnail: "resimler/sosyalmedya_post2.png",
            postUrl: "https://x.com",
            author: "@avsv9_dev",
            badgeColor: "#1DA1F2"
        },
        {
            title: "\xf0\x9f\x8c\x90 AVS&V9 Y\xf6netim Paneli Yay\u0131nda!",
            description: "T\xfcm site i\xe7eri\xc4\x9fini anl\u0131k olarak GitHub ile senkronize eden tam kontroll\xfc admin panelimiz haz\u0131r.",
            thumbnail: "resimler/sosyalmedya_post3.png",
            postUrl: "https://x.com",
            author: "@avsv9_dev",
            badgeColor: "#1DA1F2"
        }
    ]
};

async function fetchRandomSocialPosts() {
    if (!ghAPI || !siteData) {
        adminToast('\xc3\x96nce panel verileri y\xfcklenmelidir.', 'error');
        return;
    }

    adminLoading(true, 'Sosyal medya g\xf6nderileri \xe7ekiliyor...');

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
        adminToast('\xe2\x9c
 Yeni rastgele sosyal medya g\xf6nderileri \xe7ekildi ve kaydedildi!', 'success', 4000);

    } catch (err) {
        adminToast(`G\xf6nderi \xe7ekme hatas\u0131: ${err.message}`, 'error', 5000);
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
    
    adminLoading(true, 'Otomatik \xe7evriliyor (Google Translate)... L\xfctfen bekleyin.');
    
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
        
        adminToast(`\xc7eviri tamamland\xfd. Toplam ${count} alan \xe7evrildi. De\xf0i\xfeiklikleri kaydetmeyi unutmay\xfdn.`, 'success', 5000);
    } catch (e) {
        adminToast('\xc7eviri s\xfdras\xfdnda bir hata olu\xfetu.', 'error');
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



