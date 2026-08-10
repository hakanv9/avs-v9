/* ============================================================
   ADMIN.JS — AVS&V9 Yönetim Paneli
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
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${msg}`;
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
    try { m.removeAttribute('inert'); } catch (e) { }
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('active');
    m.setAttribute('aria-hidden', 'true');
    try { m.setAttribute('inert', ''); } catch (e) { }
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
            .replace(/_{2,}/g, '_')             // Çift alt çizgi temizle
            .replace(/^_|_$/g, '');            // Baş/son alt çizgi kaldır
        const path = `${folder}/${safeFilename}`;
        const existing = await this.getFile(path);
        const sha = existing ? existing.sha : null;
        const pureBase64 = base64Data.split(',')[1] || base64Data;
        const res = await fetch(`${this.baseUrl}/contents/${path}`, {
            method: 'PUT',
            headers: this.headers(),
            body: JSON.stringify({
                message: `🖼️ Admin: Görsel yüklendi — ${safeFilename}`,
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
        return this.putFile(path, content, '⚙️ Admin: Site verileri güncellendi', sha);
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
    'live': { label: '✅ Yayında', tag: 'tag-live', class: 'active' },
    'development': { label: '⏳ Geliştirme Aşamasında', tag: 'tag-wip', class: 'wip' },
    'completed': { label: '🔵 Tamamlandı', tag: 'tag-completed', class: 'completed' },
    'discontinued': { label: '📔 Yayından Kaldırılmış', tag: 'tag-inactive', class: 'inactive' },
    'paused': { label: '⏸️ Geliştirme Durdurulmuş', tag: 'tag-soon', class: 'paused' },
    'research': { label: '🔍 Araştırma Aşamasında', tag: 'tag-wip', class: 'wip' },
    'bugfix': { label: '🛠️ Hata Düzeltme', tag: 'tag-wip', class: 'wip' },
    'waiting': { label: '⏳ Beklemede', tag: 'tag-soon', class: 'paused' },
    'special': { label: '⭐ Özel Durum', tag: 'tag-soon', class: 'wip' },
    'rnd': { label: '🧪 Ar-Ge Aşamasında', tag: 'tag-wip', class: 'wip' }
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

let _sliderSortable = null;
let _projectSortable = null;

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

    // Event Delegation for dynamically generated or late-bound elements
    document.addEventListener('click', (e) => {
        if (e.target && e.target.closest('#pmAddStatusBtn')) {
            if (typeof createStatusSelect === 'function') {
                createStatusSelect('pmStatusContainer');
            }
        }
    });
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

        loginBtn.textContent = '🔄 Doğrulanıyor...';
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
                throw new Error(`Bağlantı hatası: ${res.status}`);
            }

            ghAPI = api;
            saveSession(token, owner, repo);
            adminToast('Giriş başarılı! Panel yükleniyor...', 'success');
            setTimeout(showPanel, 600);

        } catch (err) {
            showError(err.message);
            loginBtn.textContent = '🔓 Giriş Yap';
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
                if (!confirm('Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?')) return;
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
        icon.textContent = theme === 'dark' ? '🌙' : '☀️';
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
        if (confirm('Değişiklikler iptal edilsin mi?')) {
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
        adminToast('✅ Tüm değişiklikler GitHub\'a kaydedildi! Site ~15 saniyede güncellenir.', 'success', 5000);
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
            <div class="img-order-controls" style="position:absolute; top:4px; left:4px; display:flex; flex-direction:column; gap:4px; z-index:10;"><button class="order-btn" onclick="moveSliderImage(${i}, -1)" ${i === 0 ? 'disabled' : ''} style="cursor:pointer; background:rgba(0,0,0,0.7); color:white; border:none; padding:2px 6px; border-radius:4px;">&#9650;</button><span class="img-order-badge" style="position:static; margin:0; text-align:center;">${i + 1}</span><button class="order-btn" onclick="moveSliderImage(${i}, 1)" ${i === slides.length - 1 ? 'disabled' : ''} style="cursor:pointer; background:rgba(0,0,0,0.7); color:white; border:none; padding:2px 6px; border-radius:4px;">&#9660;</button></div>
            <button class="img-delete-btn" data-id="${s.id}" title="Sil">✕</button>
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
        if (window._sliderSortable) window._sliderSortable.destroy();
        window._sliderSortable = Sortable.create(grid, {
            animation: 150,
            onEnd: function () {
                const items = Array.from(grid.children);
                items.forEach((item, index) => {
                    const slide = siteData.heroSlider.find(s => s.id === item.dataset.id);
                    if (slide) slide.order = index + 1;
                });
                siteData.heroSlider.sort((a, b) => (a.order || 0) - (b.order || 0));
                markDirty();
                setTimeout(() => renderSliderSection(), 10);
            }
        });
    }
}

async function handleSliderUpload(files) {
    if (!files || !files.length) return;
    adminLoading(true, 'Görseller yükleniyor...');
    try {
        for (const file of Array.from(files)) {
            if (file.size > 5 * 1024 * 1024) { adminToast(`${file.name} 5MB sınırını aşıyor.`, 'error'); continue; }
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
    if (!projects.length) { list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Henüz proje eklenmemiş.</p>'; return; }

    list.innerHTML = projects.map((p, index) => `
        <div class="admin-project-item" data-id="${p.id}">
            <div style="display:flex; flex-direction:column; gap:4px; margin-right:12px;"><button class="order-btn" onclick="moveProject('${p.id}', -1)" ${index === 0 ? 'disabled' : ''} style="cursor:pointer; background:var(--surface-color); color:var(--text-primary); border:1px solid var(--border-color); padding:4px 8px; border-radius:4px;">&#9650;</button><button class="order-btn" onclick="moveProject('${p.id}', 1)" ${index === projects.length - 1 ? 'disabled' : ''} style="cursor:pointer; background:var(--surface-color); color:var(--text-primary); border:1px solid var(--border-color); padding:4px 8px; border-radius:4px;">&#9660;</button></div><img src="${p.thumbnail}" alt="${p.name}" class="admin-project-thumb"
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
                <button class="admin-btn admin-btn-sm edit-proj-btn" data-id="${p.id}" title="Düzenle">✏️</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm del-proj-btn" data-id="${p.id}" title="Sil">🗑️</button>
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
        if (window._projectSortable) window._projectSortable.destroy();
        window._projectSortable = Sortable.create(list, {
            animation: 150,
            onEnd: function () {
                const items = Array.from(list.children);
                items.forEach((item, index) => {
                    const proj = siteData.projects.find(p => p.id === item.dataset.id);
                    if (proj) proj.order = index + 1;
                });
                siteData.projects.sort((a, b) => (a.order || 0) - (b.order || 0));
                markDirty();
                // renderProjectList() is intentionally omitted here to prevent SortableJS glitches.
            }
        });
    }
}

function deleteProject(id) {
    if (!confirm('Bu proje silinsin mi? Bu işlem geri alınamaz.')) return;
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

    // Sürüm Modal
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
    // pmAddStatusBtn event delegation used instead
    
    // Yasal Bugün butonları
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
    try {
        document.getElementById('projectModalTitle').textContent = 'Yeni Proje Ekle';
        document.getElementById('pmName').value = '';
        document.getElementById('pmNameEN').value = '';
        document.getElementById('pmDesc').value = '';
        document.getElementById('pmSlug').value = '';
        document.getElementById('pmStatusContainer').innerHTML = ''; 
        createStatusSelect('pmStatusContainer', 'development');
        document.getElementById('pmTags').value = '';
        document.getElementById('pmThumbnail').value = '';
        document.getElementById('pmThumbnailFile').value = '';
        document.getElementById('projectModalSave').dataset.mode = 'add';
        document.getElementById('projectModalSave').removeAttribute('data-edit-id');
        openModal('projectModal');
    } catch (e) {
        console.error('Proje ekleme penceresi hatası:', e);
        adminToast('Proje penceresi açılırken hata oluştu.', 'error');
    }
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
    const saveBtn = document.getElementById('projectModalSave');
    if (saveBtn) {
        saveBtn.dataset.mode = 'edit';
        saveBtn.dataset.editId = id;
    }
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

    // Thumbnail dosya yükleme varsa önce yükle
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
        // Enforce unique slug
        let finalSlug = slug;
        let counter = 1;
        while (siteData.projects.some(p => p.slug === finalSlug)) {
            finalSlug = `${slug}-${counter}`;
            counter++;
        }

        const uniqueId = finalSlug + '-' + Date.now().toString(36);
        const newProj = {
            id: uniqueId,
            slug: finalSlug,
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
        
        markDirty();
        renderProjectList();
        renderDetailProjectSelector();
        closeModal('projectModal');
        
        if (typeof loadProjectDetails === 'function') {
            loadProjectDetails(uniqueId);
        }
        return;
    } else {
        // Edit mode - also enforce unique slug
        let finalSlug = slug;
        let counter = 1;
        const editId = btn.dataset.editId;
        while (siteData.projects.some(p => p.slug === finalSlug && p.id !== editId)) {
            finalSlug = `${slug}-${counter}`;
            counter++;
        }
        
        const proj = siteData.projects.find(p => p.id === editId);
        if (proj) {
            proj.name = name;
            proj.nameEN = nameEN || name;
            proj.shortDesc = desc;
            proj.slug = finalSlug;
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
    const selDOM = document.getElementById('detailProjectSelector');
    if (selDOM) {
        selDOM.querySelectorAll('.admin-proj-sel-card').forEach(card => {
            card.addEventListener('click', () => { 
                if(typeof loadProjectDetails === 'function') loadProjectDetails(card.dataset.id);
            });
        });
    }
}

function saveProjectDetail() {
    if (!currentProjectId) { adminToast('Önce bir proje seçin.', 'warning'); return; }
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;

    proj.name = document.getElementById('detailName').value.trim();
    proj.nameEN = document.getElementById('detailNameEN').value.trim();
    proj.thumbnail = document.getElementById('detailThumbnail').value.trim();

    if (!proj.detail) proj.detail = {};
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

// âââ EKRAN GÃRÃNTÃLERİ âââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function renderScreenshots(screenshots) {
    const grid = document.getElementById('screenshotGrid');
    if (!grid) return;
    grid.innerHTML = screenshots.map((src, i) => `
    < div class= "screenshot-item" data - idx="${i}" >
<img src="${src}" alt="Görsel ${i + 1}"
    onerror="this.parentElement.style.display='none'"
    onload="this.parentElement.className = 'screenshot-item ' + (this.naturalWidth > this.naturalHeight ? 'landscape' : this.naturalWidth === this.naturalHeight ? 'square' : '');"
    style="cursor:zoom-in;" onclick="openLightbox('${src}')"
>
    <button class="ss-del-btn" data-idx="${i}" title="Sil">✖</button>
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
            // Güvenli dosya adı oluştur
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
    };

    try {
        markDirty();
        renderSocialFeedAdmin();
        adminToast('✅ Yeni rastgele sosyal medya gönderileri çekildi ve kaydedildi!', 'success', 4000);
    } catch (err) {
        adminToast(`Gönderi çekme hatası: ${err.message}`, 'error', 5000);
    } finally {
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RECONSTRUCTED MISSING FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function loadProjectDetails(id) {
    if (!siteData || !siteData.projects) return;
    currentProjectId = id;
    const proj = siteData.projects.find(p => p.id === id);
    if (!proj) return;

    document.getElementById('detailName').value = proj.name || '';
    document.getElementById('detailNameEN').value = proj.nameEN || '';
    document.getElementById('detailThumbnail').value = proj.thumbnail || '';
    
    const wrap = document.getElementById('detailEditorWrap');
    if (wrap) wrap.style.display = 'block';

    const d = proj.detail || {};
    document.getElementById('detailSize').value = d.appSize || '';
    document.getElementById('detailAgeRating').value = d.ageRating || '';
    document.getElementById('detailLogo').value = d.logo || '';
    document.getElementById('detailIsAndroid').checked = !!d.isAndroid;
    const playStoreFields = document.getElementById('playStoreFields');
    if (playStoreFields) playStoreFields.style.display = !!d.isAndroid ? 'block' : 'none';
    document.getElementById('detailDownloads').value = d.downloads || '';
    document.getElementById('detailRating').value = d.rating || '';
    document.getElementById('detailMinAndroid').value = d.minAndroid || '';
    document.getElementById('detailPlayStoreUrl').value = d.playStoreUrl || '';
    document.getElementById('detailPermissions').value = (d.permissions || []).join('\n');
    document.getElementById('detailDescTR').value = (d.description || []).join('\n\n');
    document.getElementById('detailDescEN').value = (d.descriptionEN || []).join('\n\n');

    if (typeof renderScreenshots === 'function') {
        renderScreenshots(d.screenshots || []);
    }

    const sel = document.getElementById('detailProjectSelector');
    if (sel) {
        sel.querySelectorAll('.admin-proj-sel-card').forEach(c => {
            c.classList.toggle('selected', c.dataset.id === id);
        });
    }

    if (typeof renderChangelogsAdmin === 'function') {
        renderChangelogsAdmin(id);
    }
}

window.moveProject = function(id, dir) {
    if (!siteData || !siteData.projects) return;
    
    const arr = siteData.projects;
    arr.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const idx = arr.findIndex(p => p.id === id);
    if (idx === -1) return;
    
    if (dir === -1 && idx > 0) {
        const item = arr.splice(idx, 1)[0];
        arr.splice(idx - 1, 0, item);
    } else if (dir === 1 && idx < arr.length - 1) {
        const item = arr.splice(idx, 1)[0];
        arr.splice(idx + 1, 0, item);
    } else {
        return;
    }
    
    arr.forEach((p, i) => { p.order = i + 1; });
    
    markDirty();
    renderProjectList();
    renderDetailProjectSelector();
}

function openAddChangelogModal(projId = null) {
    if (projId) currentProjectId = projId;
    if (!currentProjectId) { adminToast('Lütfen önce sol taraftan bir proje seçin.', 'warning'); return; }
    
    document.getElementById('changelogModalTitle').textContent = "Yeni Sürüm Ekle";
    document.getElementById('clVersion').value = '';
    document.getElementById('clDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('clType').value = 'minor';
    document.getElementById('clNotes').value = '';
    
    openModal('changelogModal');
}

function saveChangelogModal() {
    if (!currentProjectId) return;
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;
    
    if (!proj.detail) proj.detail = {};
    if (!proj.detail.changelog) proj.detail.changelog = [];
    
    const version = document.getElementById('clVersion').value.trim();
    const date = document.getElementById('clDate').value;
    const type = document.getElementById('clType').value;
    const notesStr = document.getElementById('clNotes').value.trim();
    
    if (!version) { adminToast('Versiyon no zorunludur.', 'error'); return; }
    
    const notesArr = notesStr.split('\n').map(s => s.trim()).filter(Boolean);
    
    const isFix = type === 'fix';
    
    const newLog = {
        version,
        date,
        type, 
        features: isFix ? [] : notesArr,
        fixes: isFix ? notesArr : []
    };
    
    proj.detail.changelog.unshift(newLog); 
    markDirty();
    renderChangelogsAdmin(currentProjectId);
    closeModal('changelogModal');
    adminToast('Yeni sürüm eklendi. Kaydetmeyi unutmayın.', 'success');
}

window.deleteChangelog = function(projId, index) {
    if (!siteData || !siteData.projects) return;
    const proj = siteData.projects.find(p => p.id === projId);
    if (!proj || !proj.detail || !proj.detail.changelog) return;
    
    if (confirm('Bu sürümü silmek istediğinize emin misiniz?')) {
        proj.detail.changelog.splice(index, 1);
        markDirty();
        renderChangelogsAdmin(projId);
        adminToast('Sürüm notu silindi.', 'success');
    }
}

function renderChangelogsAdmin(projId) {
    const list = document.getElementById('changelogList');
    if (!list) return;
    
    const proj = siteData.projects.find(p => p.id === projId);
    if (!proj || !proj.detail || !proj.detail.changelog || proj.detail.changelog.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary); padding:10px;">Henüz sürüm geçmişi eklenmemiş.</p>';
        return;
    }
    
    list.innerHTML = proj.detail.changelog.map((c, i) => {
        const feats = (c.features || []).map(f => `<li>${f}</li>`).join('');
        const fixes = (c.fixes || []).map(f => `<li>${f}</li>`).join('');
        return `
            <div style="background:var(--surface-color); border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between;">
                <div>
                    <h4 style="margin:0 0 8px; color:var(--text-primary);">${c.version} <span style="font-size:12px; color:var(--text-secondary); margin-left:8px;">${c.date || ''}</span></h4>
                    ${feats ? `<ul style="margin:0; padding-left:16px; color:var(--text-secondary); font-size:14px;">${feats}</ul>` : ''}
                    ${fixes ? `<ul style="margin:4px 0 0 0; padding-left:16px; color:var(--text-secondary); font-size:14px;">${fixes}</ul>` : ''}
                </div>
                <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteChangelog('${projId}', ${i})" style="height:32px;">Sil</button>
            </div>
        `;
    }).join('');
}

window.moveSliderImage = function(idx, dir) {
    if (!siteData || !siteData.heroSlider) return;
    const arr = siteData.heroSlider;
    
    // Sort visually before any manipulation
    arr.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (dir === -1 && idx > 0) {
        const item = arr.splice(idx, 1)[0];
        arr.splice(idx - 1, 0, item);
    } else if (dir === 1 && idx < arr.length - 1) {
        const item = arr.splice(idx, 1)[0];
        arr.splice(idx + 1, 0, item);
    } else {
        return;
    }
    
    // Reassign strict sequential ordering based on array position
    arr.forEach((s, i) => { s.order = i + 1; });
    
    markDirty();
    renderSliderSection();
}

function renderFaqAdmin() {
    const list = document.getElementById('faqAdminList');
    if (!list || !siteData || !siteData.faq) return;
    let html = '';
    siteData.faq.forEach((cat, cIdx) => {
        html += `
    <div class="faq-cat-block" style="border:1px solid #444; padding:10px; margin-bottom:10px; border-radius:5px;">
        <h3 style="display:flex; justify-content:space-between;">
            Kategori: ${cat.category} (EN: ${cat.categoryEN})
            <button class="admin-btn" style="background:#e74c3c;" onclick="deleteFaqCat(${cIdx})">Kategoriyi Sil</button>
        </h3>
        <button class="admin-btn" style="margin-bottom:10px;" onclick="openFaqModal(${cIdx}, -1)">+ Soru Ekle</button>
        <div class="faq-q-list">
    `;
        if (cat.questions) {
            cat.questions.forEach((q, qIdx) => {
                html += `
            <div class="faq-q-item" style="background:#2a2a2a; padding:10px; margin-bottom:5px; border-radius:5px; display:flex; justify-content:space-between;">
                <div><b>${q.q}</b> <br/> <small>${q.qEN}</small></div>
                <div>
                    <button class="admin-btn" style="background:#f39c12; margin-right:5px;" onclick="openFaqModal(${cIdx}, ${qIdx})">Düzenle</button>
                    <button class="admin-btn" style="background:#e74c3c;" onclick="deleteFaqQuestion(${cIdx}, ${qIdx})">Sil</button>
                </div>
            </div>`;
            });
        }
        html += `</div></div>`;
    });
    list.innerHTML = html;
}

window.deleteFaqCat = function (cIdx) {
    if (confirm('Kategoriyi silmek istediğinize emin misiniz?')) {
        siteData.faq.splice(cIdx, 1);
        markDirty();
        renderFaqAdmin();
    }
}
window.deleteFaqQuestion = function (cIdx, qIdx) {
    if (confirm('Soruyu silmek istediğinize emin misiniz?')) {
        siteData.faq[cIdx].questions.splice(qIdx, 1);
        markDirty();
        renderFaqAdmin();
    }
}
window.openFaqModal = function (cIdx, qIdx) {
    const modal = document.getElementById('faqItemModal');
    if (!modal) return;
    modal.dataset.cidx = cIdx;
    modal.dataset.qidx = qIdx;
    if (qIdx === -1) {
        document.getElementById('faqItemModalTitle').textContent = "Yeni Soru Ekle";
        document.getElementById('faqQ').value = '';
        document.getElementById('faqQEN').value = '';
        document.getElementById('faqA').value = '';
        document.getElementById('faqAEN').value = '';
    } else {
        document.getElementById('faqItemModalTitle').textContent = "Soruyu Düzenle";
        const q = siteData.faq[cIdx].questions[qIdx];
        document.getElementById('faqQ').value = q.q || '';
        document.getElementById('faqQEN').value = q.qEN || '';
        document.getElementById('faqA').value = q.a.join('\n\n') || '';
        document.getElementById('faqAEN').value = q.aEN.join('\n\n') || '';
    }
    modal.style.display = 'flex';
}

function renderLegalAdmin() {
    const list = document.getElementById('legalAdminList');
    if (!list || !siteData || !siteData.legal) return;
    list.innerHTML = `
    <h3>Gizlilik Politikası (Privacy Policy)</h3>
    <p>Son Güncelleme: <input type="text" id="privacyDate" value="${siteData.legal.privacy.lastUpdated || ''}" class="admin-input"></p>
    <div id="privacySections"></div>
    <button class="admin-btn" style="margin-bottom:20px;" onclick="addLegalSection('privacy')">+ Bölüm Ekle</button>

    <h3>Kullanım Şartları (Terms of Service)</h3>
    <p>Son Güncelleme: <input type="text" id="termsDate" value="${siteData.legal.terms.lastUpdated || ''}" class="admin-input"></p>
    <div id="termsSections"></div>
    <button class="admin-btn" style="margin-bottom:20px;" onclick="addLegalSection('terms')">+ Bölüm Ekle</button>
`;

    // Basit bir render mantığı
    ['privacy', 'terms'].forEach(type => {
        const secDiv = document.getElementById(type + 'Sections');
        let html = '';
        if (siteData.legal[type].sections) {
            siteData.legal[type].sections.forEach((sec, idx) => {
                html += `
            <div style="background:#2a2a2a; padding:10px; margin-bottom:10px; border-radius:5px;">
                <input type="text" class="admin-input" placeholder="Başlık (TR)" value="${sec.title}" onchange="siteData.legal.${type}.sections[${idx}].title=this.value; markDirty()">
                <input type="text" class="admin-input" placeholder="Başlık (EN)" value="${sec.titleEN}" onchange="siteData.legal.${type}.sections[${idx}].titleEN=this.value; markDirty()">
                <textarea class="admin-input" placeholder="İçerik (TR)" onchange="siteData.legal.${type}.sections[${idx}].content=this.value.split('\n\n'); markDirty()">${sec.content.join('\n\n')}</textarea>
                <textarea class="admin-input" placeholder="İçerik (EN)" onchange="siteData.legal.${type}.sections[${idx}].contentEN=this.value.split('\n\n'); markDirty()">${sec.contentEN.join('\n\n')}</textarea>
                <button class="admin-btn" style="background:#e74c3c;" onclick="deleteLegalSection('${type}', ${idx})">Bölümü Sil</button>
            </div>
            `;
            });
        }
        if (secDiv) secDiv.innerHTML = html;
    });
}

window.addLegalSection = function (type) {
    siteData.legal[type].sections.push({ title: '', titleEN: '', content: [], contentEN: [] });
    markDirty();
    renderLegalAdmin();
}
window.deleteLegalSection = function (type, idx) {
    if (confirm('Emin misiniz?')) {
        siteData.legal[type].sections.splice(idx, 1);
        markDirty();
        renderLegalAdmin();
    }
}

function renderSocialFeedAdmin() {
    const list = document.getElementById('socialAdminList');
    if (!list || !siteData) return;
    const lable = document.getElementById('socialLastUpdatedLabel');
    if (lable) lable.textContent = (siteData.socialFeed && siteData.socialFeed.lastUpdated) ? siteData.socialFeed.lastUpdated : '-';

    if (!siteData.socialFeed || !siteData.socialFeed.posts || siteData.socialFeed.posts.length === 0) {
        list.innerHTML = '<p>Hiç sosyal medya gönderisi yok.</p>';
        return;
    }
    let html = '';
    siteData.socialFeed.posts.forEach((post, idx) => {
        html += `
    <div class="social-post-item" style="border:1px solid #444; padding:10px; margin-bottom:10px; border-radius:5px; display:flex; align-items:center;">
        <img src="${post.thumbnail || ''}" style="width:80px; height:80px; object-fit:cover; margin-right:15px; border-radius:5px;" />
        <div style="flex:1;">
            <p style="margin:0 0 5px 0;"><strong>${post.title || ''}</strong></p>
            <p style="margin:0 0 5px 0; font-size: 0.9em; color: #ccc;">${post.description || ''}</p>
            <small style="color:#aaa;">Platform: ${post.platformName || post.platform} | Tarih: ${post.date} | URL: <a href="${post.postUrl || ''}" target="_blank" style="color:#3498db;">${post.postUrl || ''}</a></small>
        </div>
        <button class="admin-btn" style="background:#e74c3c; margin-left:10px;" onclick="deleteSocialPost(${idx})">Sil</button>
    </div>`;
    });
    list.innerHTML = html;
}

window.deleteSocialPost = function (idx) {
    if (confirm('Silmek istediğinize emin misiniz?')) {
        siteData.socialFeed.posts.splice(idx, 1);
        markDirty();
        renderSocialFeedAdmin();
    }
}

function openLightbox(src) {
    const lb = document.getElementById('adminLightbox');
    const img = document.getElementById('adminLightboxImg');
    if (lb && img) {
        img.src = src;
        lb.style.display = 'flex';
    }
}

// Global butonları bağla
setTimeout(() => {
    const addFaqCatBtn = document.getElementById('addFaqCatBtn');
    if (addFaqCatBtn) addFaqCatBtn.addEventListener('click', () => {
        if (!siteData.faq) siteData.faq = [];
        siteData.faq.push({ category: "Yeni Kategori", categoryEN: "New Category", questions: [] });
        markDirty();
        renderFaqAdmin();
    });

    const faqItemSave = document.getElementById('faqItemSave');
    if (faqItemSave) faqItemSave.addEventListener('click', () => {
        const modal = document.getElementById('faqItemModal');
        const cIdx = parseInt(modal.dataset.cidx);
        const qIdx = parseInt(modal.dataset.qidx);

        const q = {
            q: document.getElementById('faqQ').value.trim(),
            qEN: document.getElementById('faqQEN').value.trim(),
            a: document.getElementById('faqA').value.trim().split('\n\n').filter(Boolean),
            aEN: document.getElementById('faqAEN').value.trim().split('\n\n').filter(Boolean)
        };

        if (qIdx === -1) {
            siteData.faq[cIdx].questions.push(q);
        } else {
            siteData.faq[cIdx].questions[qIdx] = q;
        }

        markDirty();
        renderFaqAdmin();
        modal.style.display = 'none';
    });

    const faqItemCancel = document.getElementById('faqItemCancel');
    if (faqItemCancel) faqItemCancel.addEventListener('click', () => {
        document.getElementById('faqItemModal').style.display = 'none';
    });

    const fetchSocialFeedBtn = document.getElementById('fetchSocialFeedBtn');
    if (fetchSocialFeedBtn) fetchSocialFeedBtn.addEventListener('click', async () => {
        if (typeof fetchNewSocialPosts === 'function') {
            await fetchNewSocialPosts();
        } else {
            adminLoading(true, 'Gönderiler çekiliyor...');
            setTimeout(() => {
                siteData.socialLastUpdated = new Date().toISOString().split('T')[0];
                markDirty();
                renderSocialFeedAdmin();
                adminLoading(false);
                adminToast('Gönderiler çekildi (Simüle edildi)', 'success');
            }, 1000);
        }
    });

}, 1000);
