/* ============================================================
   ADMIN.JS — AVS&V9 Yönetim Paneli
   GitHub REST API üzerinden site verilerini yönetir.
   ============================================================ */

'use strict';

// ─── YARDIMCI FONKSİYONLAR ───────────────────────────────────────────────────

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
    try { m.removeAttribute('inert'); } catch (e) {}
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('active');
    m.setAttribute('aria-hidden', 'true');
    try { m.setAttribute('inert', ''); } catch (e) {}
}

// ─── GİTHUB API ──────────────────────────────────────────────────────────────

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
            headers: this.headers()
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
        const path = `${folder}/${filename}`;
        const existing = await this.getFile(path);
        const sha = existing ? existing.sha : null;
        const pureBase64 = base64Data.split(',')[1] || base64Data;
        const res = await fetch(`${this.baseUrl}/contents/${path}`, {
            method: 'PUT',
            headers: this.headers(),
            body: JSON.stringify({
                message: `🖼️ Admin: Görsel yüklendi — ${filename}`,
                content: pureBase64,
                branch: this.branch,
                ...(sha ? { sha } : {})
            })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`Görsel yükleme hatası: ${err.message || res.status}`);
        }
        const data = await res.json();
        return `resimler/${filename}`;
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

// ─── OTURUMi YÖNETİMİ ────────────────────────────────────────────────────────

const SESSION_KEY = 'avs_admin_session';

function saveSession(token, owner, repo) {
    const s = { token, owner, repo, ts: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function loadSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        // 12 saatlik oturum süresi
        if (Date.now() - s.ts > 12 * 60 * 60 * 1000) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return s;
    } catch (e) { return null; }
}

function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

// ─── DURUM ETİKETİ HARİTASI ──────────────────────────────────────────────────

const STATUS_MAP = {
    'live':          { label: '✅ Yayında',                  tag: 'tag-live',         class: 'active' },
    'development':   { label: '⏳ Geliştirme Aşamasında',   tag: 'tag-wip',          class: 'wip' },
    'completed':     { label: '🔵 Tamamlandı',              tag: 'tag-completed',    class: 'completed' },
    'discontinued':  { label: '📴 Yayından Kaldırılmış',    tag: 'tag-inactive',     class: 'inactive' },
    'paused':        { label: '⏸️ Geliştirme Durdurulmuş', tag: 'tag-soon',         class: 'paused' }
};

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────

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
        ghAPI = new GitHubAPI(session.token, session.owner, session.repo);
        showPanel();
    } else {
        showLogin();
    }

    initLoginScreen();
    initTabSystem();
    initThemeToggle();
    initSaveBar();
    initModals();
});

// ─── GİRİŞ EKRANI ────────────────────────────────────────────────────────────

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
            // Test: repo'yu okumayı dene
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
            clearSession();
            ghAPI = null;
            siteData = null;
            adminToast('Oturum kapatıldı.', 'info');
            showLogin();
        });
    }
}

// ─── VERİ YÜKLEME ────────────────────────────────────────────────────────────

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
        adminToast('Veriler yüklendi!', 'success', 2000);
    } catch (err) {
        adminToast(`Yükleme hatası: ${err.message}`, 'error', 6000);
        console.error(err);
    } finally {
        adminLoading(false);
    }
}

// ─── SEKME SİSTEMİ ───────────────────────────────────────────────────────────

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

// ─── TEMA & DİL ──────────────────────────────────────────────────────────────

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

// ─── KAYDET BARI ─────────────────────────────────────────────────────────────

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

// ─── SLIDER YÖNETİMİ ─────────────────────────────────────────────────────────

function renderSliderSection() {
    const grid = document.getElementById('sliderImgGrid');
    if (!grid || !siteData) return;
    const slides = siteData.heroSlider || [];
    grid.innerHTML = slides.map((s, i) => `
        <div class="slider-img-item" data-id="${s.id}">
            <img src="${s.src}" alt="${s.alt}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'160\\' height=\\'90\\'><rect width=\\'160\\' height=\\'90\\' fill=\\'%23222\\'/>><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23666\\' text-anchor=\\'middle\\' dy=\\'.3em\\'>?</text></svg>'">
            <span class="img-order-badge">${i + 1}</span>
            <button class="img-delete-btn" data-id="${s.id}" title="Sil">✕</button>
        </div>
    `).join('');

    grid.querySelectorAll('.img-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSliderImage(btn.dataset.id));
    });

    // Yükleme
    const fileInput = document.getElementById('sliderFileInput');
    const uploadArea = document.getElementById('sliderUploadArea');
    if (fileInput) fileInput.addEventListener('change', e => handleSliderUpload(e.target.files));
    if (uploadArea) {
        uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
        uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.classList.remove('dragover'); handleSliderUpload(e.dataTransfer.files); });
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
        await ghAPI.saveSiteData(siteData);
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
        await ghAPI.saveSiteData(siteData);
        renderSliderSection();
        adminToast('Görsel silindi.', 'success');
    } catch (err) {
        adminToast(`Hata: ${err.message}`, 'error');
    } finally {
        adminLoading(false);
    }
}

// ─── PROJE LİSTESİ (Anasayfa) ────────────────────────────────────────────────

function renderProjectList() {
    const list = document.getElementById('adminProjectList');
    if (!list || !siteData) return;
    const projects = siteData.projects || [];
    if (!projects.length) { list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Henüz proje eklenmemiş.</p>'; return; }

    list.innerHTML = projects.map(p => `
        <div class="admin-project-item" data-id="${p.id}">
            <img src="${p.thumbnail}" alt="${p.name}" class="admin-project-thumb"
                onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'72\\' height=\\'48\\'><rect width=\\'72\\' height=\\'48\\' fill=\\'%23222\\'/></svg>'">
            <div class="admin-project-info">
                <div class="admin-project-name">${p.name}</div>
                <select class="admin-status-select" data-pid="${p.id}" title="Durum">
                    ${Object.entries(STATUS_MAP).map(([k, v]) =>
                        `<option value="${k}" ${p.status === k ? 'selected' : ''}>${v.label}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="admin-project-actions">
                <button class="admin-btn admin-btn-sm edit-proj-btn" data-id="${p.id}" title="Düzenle">✏️</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm del-proj-btn" data-id="${p.id}" title="Sil">🗑️</button>
            </div>
        </div>
    `).join('');

    // Durum değiştirme
    list.querySelectorAll('.admin-status-select').forEach(sel => {
        sel.addEventListener('change', () => {
            const proj = siteData.projects.find(p => p.id === sel.dataset.pid);
            if (proj) { proj.status = sel.value; markDirty(); }
        });
    });

    // Sil butonu
    list.querySelectorAll('.del-proj-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProject(btn.dataset.id));
    });

    // Düzenle butonu
    list.querySelectorAll('.edit-proj-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditProjectModal(btn.dataset.id));
    });
}

function deleteProject(id) {
    if (!confirm('Bu proje silinsin mi? Bu işlem geri alınamaz.')) return;
    siteData.projects = siteData.projects.filter(p => p.id !== id);
    markDirty();
    renderProjectList();
    renderDetailProjectSelector();
    adminToast('Proje silindi. Kaydetmeyi unutmayın.', 'warning');
}

// ─── PROJE EKLE/DÜZENLE MODALİ ───────────────────────────────────────────────

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

    // Yasal Bölüm Ekle
    document.getElementById('addPrivacySecBtn')?.addEventListener('click', () => addLegalSection('privacy'));
    document.getElementById('addTermsSecBtn')?.addEventListener('click', () => addLegalSection('terms'));

    // Android Toggle
    document.getElementById('detailIsAndroid')?.addEventListener('change', e => {
        const fields = document.getElementById('playStoreFields');
        if (fields) fields.style.display = e.target.checked ? 'block' : 'none';
    });

    // Ekran görüntüsü yükleme
    document.getElementById('screenshotFileInput')?.addEventListener('change', e => handleScreenshotUpload(e.target.files));
}

function openAddProjectModal() {
    document.getElementById('projectModalTitle').textContent = 'Yeni Proje Ekle';
    document.getElementById('pmName').value = '';
    document.getElementById('pmNameEN').value = '';
    document.getElementById('pmDesc').value = '';
    document.getElementById('pmSlug').value = '';
    document.getElementById('pmStatus').value = 'development';
    document.getElementById('pmTags').value = '';
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
    document.getElementById('pmStatus').value = proj.status;
    document.getElementById('pmTags').value = proj.tags.join(', ');
    document.getElementById('projectModalSave').dataset.mode = 'edit';
    document.getElementById('projectModalSave').dataset.editId = id;
    openModal('projectModal');
}

function saveProjectModal() {
    const btn = document.getElementById('projectModalSave');
    const mode = btn.dataset.mode;
    const name = document.getElementById('pmName').value.trim();
    const nameEN = document.getElementById('pmNameEN').value.trim();
    const desc = document.getElementById('pmDesc').value.trim();
    const slug = document.getElementById('pmSlug').value.trim().replace(/\s+/g, '-').toLowerCase();
    const status = document.getElementById('pmStatus').value;
    const tags = document.getElementById('pmTags').value.split(',').map(t => t.trim()).filter(Boolean);

    if (!name || !slug) { adminToast('Proje adı ve slug zorunludur.', 'error'); return; }

    if (mode === 'add') {
        const newProj = {
            id: slug,
            slug,
            name,
            nameEN: nameEN || name,
            shortDesc: desc,
            shortDescEN: desc,
            thumbnail: 'resimler/projeler-resmi1.jpg',
            tags,
            status,
            order: siteData.projects.length + 1,
            visible: true,
            detail: {
                isAndroid: false,
                playStoreEnabled: false,
                playStoreUrl: '#',
                logo: 'resimler/uygulama_logo.png',
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
            proj.status = status;
            proj.tags = tags;
        }
        adminToast('Proje güncellendi. Kaydetmeyi unutmayın.', 'success');
    }

    markDirty();
    renderProjectList();
    renderDetailProjectSelector();
    closeModal('projectModal');
}

// ─── PROJE DETAY EDITÖRÜ ─────────────────────────────────────────────────────

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
    document.getElementById('detailStatus').value = proj.status;
    document.getElementById('detailSize').value = d.appSize || '';
    document.getElementById('detailAgeRating').value = d.ageRating || '';
    document.getElementById('detailLogo').value = d.logo || '';
    document.getElementById('detailThumbnail').value = proj.thumbnail || '';

    const isAndroid = d.isAndroid || false;
    document.getElementById('detailIsAndroid').checked = isAndroid;
    document.getElementById('playStoreFields').style.display = isAndroid ? 'block' : 'none';

    document.getElementById('detailDownloads').value = d.downloads || '';
    document.getElementById('detailRating').value = d.rating || '';
    document.getElementById('detailMinAndroid').value = d.minAndroid || '';
    document.getElementById('detailPlayStoreUrl').value = d.playStoreUrl || '';
    document.getElementById('detailPermissions').value = (d.permissions || []).join('\n');

    document.getElementById('detailDescTR').value = (d.description || []).join('\n\n');
    document.getElementById('detailDescEN').value = (d.descriptionEN || []).join('\n\n');

    renderScreenshots(d.screenshots || []);
    renderChangelogList(d.changelog || []);
}

function saveProjectDetail() {
    if (!currentProjectId) { adminToast('Önce bir proje seçin.', 'warning'); return; }
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;

    proj.name = document.getElementById('detailName').value.trim();
    proj.nameEN = document.getElementById('detailNameEN').value.trim();
    proj.status = document.getElementById('detailStatus').value;
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

// ─── EKRAN GÖRÜNTÜLERİ ───────────────────────────────────────────────────────

function renderScreenshots(screenshots) {
    const grid = document.getElementById('screenshotGrid');
    if (!grid) return;
    grid.innerHTML = screenshots.map((src, i) => `
        <div class="screenshot-item" data-idx="${i}">
            <img src="${src}" alt="Ekran ${i+1}" onerror="this.src=''">
            <button class="ss-del-btn" data-idx="${i}" title="Sil">✕</button>
        </div>
    `).join('');
    grid.querySelectorAll('.ss-del-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteScreenshot(parseInt(btn.dataset.idx)));
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
    if (!currentProjectId) { adminToast('Önce bir proje seçin.', 'warning'); return; }
    const proj = siteData.projects.find(p => p.id === currentProjectId);
    if (!proj) return;
    adminLoading(true, 'Ekran görüntüleri yükleniyor...');
    try {
        for (const file of Array.from(files)) {
            const base64 = await fileToBase64(file);
            const filename = `ss-${proj.slug}-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
            const path = await ghAPI.uploadImage(filename, base64);
            proj.detail.screenshots.push(path);
        }
        await ghAPI.saveSiteData(siteData);
        renderScreenshots(proj.detail.screenshots);
        adminToast('Ekran görüntüleri yüklendi!', 'success');
    } catch (err) {
        adminToast(`Yükleme hatası: ${err.message}`, 'error');
    } finally {
        adminLoading(false);
        document.getElementById('screenshotFileInput').value = '';
    }
}

// ─── SÜRÜM GEÇMİŞİ ───────────────────────────────────────────────────────────

function renderChangelogList(changelog) {
    const list = document.getElementById('changelogList');
    if (!list) return;
    if (!changelog.length) { list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:16px;">Henüz sürüm eklenmemiş.</p>'; return; }

    list.innerHTML = changelog.map(cl => `
        <div class="changelog-item" data-id="${cl.id}">
            <span class="changelog-version-badge ${cl.type}">${cl.version}</span>
            <div class="changelog-info">
                <div class="changelog-date">📅 ${cl.date} · ${cl.type.toUpperCase()}</div>
                <ul class="changelog-notes">
                    ${cl.notes.map(n => `<li>${n}</li>`).join('')}
                </ul>
            </div>
            <div class="changelog-actions">
                <button class="admin-btn admin-btn-sm edit-cl-btn" data-id="${cl.id}">✏️</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm del-cl-btn" data-id="${cl.id}">🗑️</button>
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
    if (!currentProjectId) { adminToast('Önce bir proje seçin.', 'warning'); return; }
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

    if (!version || !notes.length) { adminToast('Versiyon ve en az 1 değişiklik notu gerekli.', 'error'); return; }

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

// ─── SSS YÖNETİMİ ────────────────────────────────────────────────────────────

function renderFaqAdmin() {
    const list = document.getElementById('faqAdminList');
    if (!list || !siteData) return;
    const faq = siteData.faq || [];
    if (!faq.length) { list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Henüz SSS kategorisi eklenmemiş.</p>'; return; }

    list.innerHTML = faq.map(cat => `
        <div class="faq-admin-category" data-catid="${cat.id}">
            <div class="faq-admin-cat-header">
                <input type="text" class="faq-admin-cat-title" value="${cat.category}" data-catid="${cat.id}"
                    style="background:transparent;border:none;color:var(--admin-accent);font-weight:700;font-size:0.95rem;font-family:inherit;outline:none;flex:1;">
                <button class="admin-btn admin-btn-sm add-faq-item-btn" data-catid="${cat.id}">＋ Madde</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm del-faq-cat-btn" data-catid="${cat.id}">🗑️</button>
            </div>
            <div class="faq-admin-items" id="faq-items-${cat.id}">
                ${cat.items.map(item => `
                    <div class="faq-admin-item" data-itemid="${item.id}">
                        <div class="faq-admin-item-q">${item.question}</div>
                        <div class="faq-admin-item-a">${item.answer}</div>
                        <div class="faq-admin-item-actions">
                            <button class="admin-btn admin-btn-sm edit-faq-item-btn" data-catid="${cat.id}" data-itemid="${item.id}">✏️ Düzenle</button>
                            <button class="admin-btn admin-btn-danger admin-btn-sm del-faq-item-btn" data-catid="${cat.id}" data-itemid="${item.id}">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Kategori başlığı değiştirme
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

    // Madde düzenleme
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
    const cat = { id: generateId('faq-cat'), category: '📌 Yeni Kategori', items: [] };
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
    if (!q || !a) { adminToast('Soru ve cevap boş bırakılamaz.', 'error'); return; }
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

// ─── YASAL SAYFALAR YÖNETİMİ ─────────────────────────────────────────────────

function renderLegalAdmin() {
    if (!siteData) return;

    // Tarihler
    const privDate = document.getElementById('privacyDate');
    const termsDate = document.getElementById('termsDate');
    if (privDate) privDate.value = siteData.legal.privacy.lastUpdated || todayISO();
    if (termsDate) termsDate.value = siteData.legal.terms.lastUpdated || todayISO();

    // Tarih değişimlerini dinle
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
                <button class="admin-btn admin-btn-danger admin-btn-sm del-legal-btn" data-type="${type}" data-id="${sec.id}">🗑️</button>
            </div>
            <div class="legal-admin-body">
                <textarea class="admin-form-group legal-text-input" rows="3"
                    data-type="${type}" data-id="${sec.id}"
                    style="width:100%;background:rgba(255,71,87,0.04);border:1.5px solid var(--admin-border);border-radius:12px;color:var(--text-primary,#e8eaf0);font-family:inherit;font-size:0.85rem;padding:10px 14px;outline:none;box-sizing:border-box;resize:vertical;"
                >${sec.text}</textarea>
            </div>
        </div>
    `).join('');

    // Başlık değişimi
    listEl.querySelectorAll('.legal-heading-input').forEach(input => {
        input.addEventListener('input', () => {
            const sec = siteData.legal[input.dataset.type].content.find(s => s.id === input.dataset.id);
            if (sec) { sec.heading = input.value; markDirty(); }
        });
    });

    // Metin değişimi
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
    const sec = { id: generateId(`${type}-sec`), heading: 'Yeni Bölüm Başlığı', text: 'Bölüm içeriği buraya yazılacak.' };
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

// ─── YARDIMCI: DOSYA → BASE64 ─────────────────────────────────────────────────

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
