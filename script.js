// =============================================
// === AVS&V9 ANA SCRIPT (STABİL & HATASIZ) ===
// =============================================

// ─── GÜV-3: XSS KORUMA YARDIMCISI ─────────────────────────────────────────────
// JSON'dan gelen tüm içerikler bu fonksiyondan geçirilir.
function sanitize(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function addSwipeListener(element, onSwipeLeft, onSwipeRight) {
    if (!element) return;
    let touchStartX = 0;
    let touchEndX = 0;
    element.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    element.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    function handleSwipe() {
        const threshold = 50;
        if (touchStartX - touchEndX > threshold && onSwipeLeft) onSwipeLeft();
        else if (touchEndX - touchStartX > threshold && onSwipeRight) onSwipeRight();
    }
}

// ─── PERF-3: HERO SLIDER YÖNETİCİSİ ──────────────────────────────────────────
// Tek interval kaydedici â€” çift setInterval bellek sızıntısını önler.
let _heroSlideInterval = null;

function startHeroSlider(slidesNodeList) {
    clearInterval(_heroSlideInterval);
    if (!slidesNodeList || slidesNodeList.length < 2) return;
    let cur = Array.from(slidesNodeList).findIndex(s => s.classList.contains('active'));
    if (cur < 0) cur = 0;
    
    function goNext() {
        slidesNodeList[cur].classList.remove('active');
        cur = (cur + 1) % slidesNodeList.length;
        slidesNodeList[cur].classList.add('active');
        startTimer();
    }
    function goPrev() {
        slidesNodeList[cur].classList.remove('active');
        cur = (cur - 1 + slidesNodeList.length) % slidesNodeList.length;
        slidesNodeList[cur].classList.add('active');
        startTimer();
    }
    function startTimer() {
        clearInterval(_heroSlideInterval);
        _heroSlideInterval = setInterval(goNext, 10000);
    }
    
    startTimer();
    
    const container = document.querySelector('.slider-container');
    if (container && !container.hasAttribute('data-swipe-added')) {
        addSwipeListener(container, goNext, goPrev);
        container.setAttribute('data-swipe-added', 'true');
    }
}

// ─── KOD-1: DUPLİKE FONKSİYONLAR KALDIRILDI ─────────────────────────────────
// (Tüm fonksiyonların tek ve doğru versiyonları aşağıda tanımlanmıştır)

// Durum etiketi CSS sınıfı ve metnini döndürür
function getStatusTag(status) {
    const map = {
        'live':         { cls: 'tag-live',      text: '🟢 Yayında' },
        'development':  { cls: 'tag-wip',       text: '⏳ Geliştirme Aşamasında' },
        'completed':    { cls: 'tag-completed', text: '✅ Tamamlandı' },
        'discontinued': { cls: 'tag-inactive',  text: '❌ Yayından Kaldırılmış' },
        'paused':       { cls: 'tag-soon',      text: '⏸️ Geliştirme Durdurulmuş' },
        'research':     { cls: 'tag-wip',       text: '🔍 Araştırma Aşamasında' },
        'bugfix':       { cls: 'tag-wip',       text: '🛠️ Hata Düzeltme' },
        'waiting':      { cls: 'tag-soon',      text: '⏱ Beklemede' },
        'special':      { cls: 'tag-wip',       text: '⭐ Özel Durum' },
        'rnd':          { cls: 'tag-wip',       text: '🧪 Ar-Ge Aşamasında' }
    };
    return map[status] || { cls: '', text: String(status) };
}

let TRANSLATIONS = {};

async function loadTranslations() {
    try {
        const res = await fetch('data/translations.json', { cache: 'no-cache' });
        if (res.ok) {
            let text = await res.text();
            if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
            TRANSLATIONS = JSON.parse(text);
        } else {
            TRANSLATIONS = window.EMBEDDED_TRANSLATIONS || {};
        }
    } catch (e) {
        console.warn('translations.json fetch edilemedi, embedded fallback kullanılıyor:', e);
        TRANSLATIONS = window.EMBEDDED_TRANSLATIONS || {};
    }
    const savedLang = localStorage.getItem('avs_lang') || 'tr';
    applyLang(savedLang);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DİNAMİK VERİ FONKSİYONLARI â€” site-data.json üzerinden içerik güncelleme
// ═══════════════════════════════════════════════════════════════════════════════

// PERF-5: ?v=Date.now() kaldırıldı â€” vercel.json'daki no-cache headerı ile ETag tabantılı doğrulama yapılır.
async function loadSiteData() {
    try {
        const res = await fetch('data/site-data.json', { cache: 'no-cache' });
        if (res.ok) {
            let text = await res.text();
            if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
            return JSON.parse(text);
        }
    } catch (e) {
        console.warn('site-data.json fetch edilemedi, embedded fallback kullanılıyor:', e);
    }
    return window.EMBEDDED_SITE_DATA || null;
}

// KOD-4: img tag kullanılıyor (div+backgroundImage kaldırıldı) â€” erişilebilir ve SEO dostu.
function initDynamicHeroSlider(data) {
    const slides = data.heroSlider;
    if (!slides || !slides.length) return;
    const container = document.querySelector('.slider-container');
    if (!container) return;

    // Mevcut slaytları kaldır
    container.querySelectorAll('.slide').forEach(s => s.remove());

    slides
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .forEach((slide, idx) => {
            const img = document.createElement('img');
            img.src = sanitize(slide.src);
            img.alt = sanitize(slide.alt || '');
            img.className = 'slide' + (idx === 0 ? ' active' : '');
            img.loading = idx === 0 ? 'eager' : 'lazy';
            container.appendChild(img);
        });

    // PERF-3: Yeni slaytlağırlığıa tek bir interval başlat
    startHeroSlider(container.querySelectorAll('.slide'));
}

function initDynamicProjectsList(data) {
    const projects = data.projects;
    if (!projects || !projects.length) return;

    const listContainer = document.querySelector('.projects-list');
    if (!listContainer) return;

    const lang = localStorage.getItem('avs_lang') || 'tr';

    const visible = projects
        .filter(p => p.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (!visible.length) return;

    listContainer.innerHTML = visible.map((p, i) => {
        const statuses = p.statuses || (p.status ? [p.status] : []); const statusHTML = statuses.map(s => { const st = getStatusTag(s); return `<span class="${st.cls} tag">${st.text}</span>`; }).join('');
        const extraTags = p.tags || [];
        const name = (lang === 'en' && p.nameEN) ? p.nameEN : p.name;
        const desc = (lang === 'en' && p.shortDescEN) ? p.shortDescEN : (p.shortDesc || '');
        const detailLabel = lang === 'en' ? 'View Details' : 'Detayları İncele';
        return `
        <a href="proje-detay.html?p=${sanitize(p.slug)}" class="project-oval-box scroll-anim" aria-label="${sanitize(name)} Detayları">
            <img src="${sanitize(p.thumbnail)}" alt="${sanitize(name)}" class="project-oval-img" loading="${i === 0 ? 'eager' : 'lazy'}">
            <div class="project-oval-info">
                <div class="project-oval-title">${sanitize(name)}</div>
                <div class="project-oval-desc">${sanitize(desc)}</div>
                <div class="project-oval-tags">
                    ${statusHTML}
                    ${extraTags.map(t => `<span class="tag">📌 ${sanitize(t)}</span>`).join('')}
                </div>
            </div>
            <div class="project-oval-btn">${sanitize(detailLabel)}</div>
        </a>
        `;
    }).join('');

    // Animasyon observera kaydet
    const newItems = listContainer.querySelectorAll('.scroll-anim');
    if (window._scrollObserver) {
        newItems.forEach(item => window._scrollObserver.observe(item));
    }
}

// UIUX-2: Fallback resmi Yakindabos.png (yoksa yeşil placeholder).
function initDynamicSocialFeed(data) {
    if (!data || !data.socialFeed || !data.socialFeed.posts || !data.socialFeed.posts.length) return;
    const smSlider = document.getElementById('smSlider');
    if (!smSlider) return;

    const lang = localStorage.getItem('avs_lang') || 'tr';
    
    const SVG_ICONS = {
        youtube: `<svg class="sm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        instagram: `<svg class="sm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
        tiktok: `<svg class="sm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
        x: `<svg class="sm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
    };

    const BADGE_CLASSES = {
        youtube: 'sm-badge-youtube',
        instagram: 'sm-badge-instagram',
        tiktok: 'sm-badge-tiktok',
        x: 'sm-badge-x'
    };

    smSlider.innerHTML = data.socialFeed.posts.map(p => {
        const pKey = (p.platform || 'youtube').toLowerCase();
        const iconSvg = SVG_ICONS[pKey] || SVG_ICONS.youtube;
        const badgeCls = BADGE_CLASSES[pKey] || 'sm-badge-youtube';
        // UIUX-2: Resim yoksa Yakindabos.png göster
        const fallbackSrc = 'resimler/Yakindabos.png';
        return `
            <div class="sm-slide">
                <div class="sm-slide-img-wrap">
                    <img src="${sanitize(p.thumbnail)}" alt="${sanitize(p.title)}" loading="lazy"
                         onerror="this.onerror=null; this.src='${fallbackSrc}'">
                </div>
                <div class="sm-slide-body">
                    <div class="sm-platform-badge ${badgeCls}">
                        ${iconSvg}
                        ${sanitize(p.platformName || p.platform)}
                    </div>
                    <h3 class="sm-slide-title">${sanitize(p.title)}</h3>
                    <p class="sm-slide-desc">${sanitize(p.description)}</p>
                    <a href="${sanitize(p.postUrl)}" class="sm-slide-btn" target="_blank" rel="noopener noreferrer">
                        ${(lang === 'en' ? 'View Post ↗' : 'Gönderiyi İncele ↗')}
                    </a>
                </div>
            </div>
        `;
    }).join('');

    const smDots = document.getElementById('smDots');
    if (smDots) {
        smDots.innerHTML = data.socialFeed.posts.map((_, idx) => `
            <button class="sm-dot ${idx === 0 ? 'active' : ''}" data-idx="${idx}" role="tab"
                aria-selected="${idx === 0 ? 'true' : 'false'}" aria-label="Slayt ${idx + 1}"></button>
        `).join('');
    }
}

function initDynamicFaq(data) {

    const faq = data.faq;
    if (!faq || !faq.length) return;

    const main = document.querySelector('.subpage-main');
    if (!main) return;
    
    const lang = localStorage.getItem('avs_lang') || 'tr';

    // Mevcut SSS gruplarını ve başlıklarını temizle
    main.querySelectorAll('.faq-section-title, .faq-list-group, .faq-cta-card').forEach(el => el.remove());

    faq.forEach(cat => {
        if (!cat.questions || !cat.questions.length) return;

        const h2 = document.createElement('h2');
        h2.className = 'section-title faq-section-title';
        h2.textContent = (lang === 'en' && cat.categoryEN) ? cat.categoryEN : cat.category;
        main.appendChild(h2);

        const list = document.createElement('div');
        list.className = 'faq-list faq-list-group';

        cat.questions.forEach(item => {
            const qText = (lang === 'en' && item.qEN) ? item.qEN : item.q;
            const aText = (lang === 'en' && item.aEN) ? item.aEN : item.a;
            const div = document.createElement('div');
            div.className = 'faq-item';
            div.innerHTML = `
                <button class="faq-question">
                    ${sanitize(qText)}
                    <span class="faq-icon">»</span>
                </button>
                <div class="faq-answer">
                    <div class="faq-answer-inner">${sanitize(aText)}</div>
                </div>`;
            list.appendChild(div);
        });

        main.appendChild(list);
    });

    // CTA kartını EN SONA ekle
    const cta = document.createElement('section');
    cta.className = 'pd-content-card faq-cta-card';
    const ctaTitle = lang === 'en' ? 'Did you not find what you were looking for?' : 'Aradığınız cevabı bulamadınız mı?';
    const ctaSub = lang === 'en' ? 'If you have a different question or a technical request, you can contact the developer directly.' : 'Farklı bir sorunuz veya teknik bir talebiniz varsa doğrudan geliştiriciye ulaşabilirsiniz.';
    const ctaBtn = lang === 'en' ? 'Contact Directly →' : 'Doğrudan İletişime Geçin →';
    cta.innerHTML = `
        <h3 class="faq-cta-title">${sanitize(ctaTitle)}</h3>
        <p class="faq-cta-sub">${sanitize(ctaSub)}</p>
        <a href="index.html#iletisim" class="oval-btn pd-cta-btn">${sanitize(ctaBtn)}</a>`;
    main.appendChild(cta);
}


function initDynamicLegal(data) {
    const legal = data.legal;
    if (!legal) return;

    const lang = localStorage.getItem('avs_lang') || 'tr';

    // Cta Kartı HTML Şablonu
    const ctaTitle = lang === 'en' ? 'Have Questions or Legal Inquiries?' : 'Yasal Konularda Sorunuz mu Var?';
    const ctaSub = lang === 'en' ? 'For data privacy requests or detailed inquiries, you can contact the developer directly.' : 'Kişisel veri talepleriniz veya detaylı yasal sorularınız için doğrudan iletişime geçebilirsiniz.';
    const ctaBtn = lang === 'en' ? 'Contact Directly →' : 'Doğrudan İletişime Geçin →';
    const ctaHtml = `
        <div class="pd-content-card faq-cta-card" style="margin-top: 30px;">
            <h3 class="faq-cta-title">${sanitize(ctaTitle)}</h3>
            <p class="faq-cta-sub">${sanitize(ctaSub)}</p>
            <a href="index.html#iletisim" class="oval-btn pd-cta-btn">${sanitize(ctaBtn)}</a>
        </div>`;

    // Gizlilik politikası
    const privSec = document.getElementById('panel-privacy');
    if (privSec && legal.privacy) {
        const dateEl = privSec.querySelector('.legal-date');
        if (dateEl && legal.privacy.lastUpdated) dateEl.textContent = (lang === 'en' ? `Last updated: ` : `Son güncelleme: `) + legal.privacy.lastUpdated;
        const contentEl = privSec.querySelector('.legal-content');
        if (contentEl && legal.privacy.content) {
            contentEl.innerHTML = legal.privacy.content.map(sec => `
                <h3>${sanitize((lang === 'en' && sec.headingEN) ? sec.headingEN : sec.heading)}</h3>
                <p>${(lang === 'en' && sec.textEN) ? sec.textEN : sec.text}</p>`).join('');
            
            // Eski CTA varsa kaldır, yenisini ekle
            privSec.querySelectorAll('.faq-cta-card').forEach(el => el.remove());
            privSec.insertAdjacentHTML('beforeend', ctaHtml);
        }
    }

    // Kullanım koşulları
    const termsSec = document.getElementById('panel-terms');
    if (termsSec && legal.terms) {
        const dateEl = termsSec.querySelector('.legal-date');
        if (dateEl && legal.terms.lastUpdated) dateEl.textContent = (lang === 'en' ? `Last updated: ` : `Son güncelleme: `) + legal.terms.lastUpdated;
        const contentEl = termsSec.querySelector('.legal-content');
        if (contentEl && legal.terms.content) {
            contentEl.innerHTML = legal.terms.content.map(sec => `
                <h3>${sanitize((lang === 'en' && sec.headingEN) ? sec.headingEN : sec.heading)}</h3>
                <p>${(lang === 'en' && sec.textEN) ? sec.textEN : sec.text}</p>`).join('');
            
            // Eski CTA varsa kaldır, yenisini ekle
            termsSec.querySelectorAll('.faq-cta-card').forEach(el => el.remove());
            termsSec.insertAdjacentHTML('beforeend', ctaHtml);
        }
    }
}

// --- Tema ---
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('avs_theme', theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

// --- Dil ---
function applyLang(lang) {
    if (TRANSLATIONS && Object.keys(TRANSLATIONS).length > 0) {
        const t = TRANSLATIONS[lang] || TRANSLATIONS['tr'];
        if (t) {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (t[key] !== undefined) el.textContent = t[key];
            });
        }
    }
    const label = document.getElementById('langLabel');
    if (label) label.textContent = lang.toUpperCase();
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('avs_lang', lang);

    // DİNAMİK BÖLÜMLERİ F5 YAPMADAN RE-RENDER ET
    if (window.CURRENT_SITE_DATA) {
        const isIndex = !!document.querySelector('.slider-container');
        const isFaq = !!document.querySelector('.faq-list');
        const isLegal = !!document.getElementById('panel-privacy');
        const isProjectDetail = !!document.getElementById('pdAppSlider');

        if (isIndex) {
            initDynamicProjectsList(window.CURRENT_SITE_DATA);
            initDynamicSocialFeed(window.CURRENT_SITE_DATA);
        }
        if (isFaq) initDynamicFaq(window.CURRENT_SITE_DATA);
        if (isLegal) initDynamicLegal(window.CURRENT_SITE_DATA);
        if (isProjectDetail && window.CURRENT_PROJECT) {
            initProjectDetail(window.CURRENT_PROJECT);
        }
    }
}

function toggleLang() {
    const current = localStorage.getItem('avs_lang') || 'tr';
    applyLang(current === 'tr' ? 'en' : 'tr');
}

// Tercihleri anında başlat (HTML render aşamasında renk yanıp sönmesin)
(function () {
    const savedTheme = localStorage.getItem('avs_theme') || 'dark';
    const savedLang = localStorage.getItem('avs_lang') || 'tr';
    applyTheme(savedTheme);
    applyLang(savedLang);
})();

// --- DOM HAZIR OLUNCA ÇALIŞACAK TÜM DİNLEYİCİLER ---
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations(); // TRANSLATIONS'i yükle
    // ─── DİNAMİK VERİ YÜKLEME (site-data.json) ───────────────────────────────
    // Admin panelinden yapılan değişiklikler burada okunur ve sayfalar güncellenir.
    // Admin paneli sayfasında bu blok çalışmaz (data-admin-page kontrolü).
    if (!document.documentElement.hasAttribute('data-admin-page')) {
        const isIndex = !!document.querySelector('.slider-container');
        if (isIndex) {
            const listContainer = document.querySelector('.projects-list');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div class="project-oval-box skeleton-box"></div>
                    <div class="project-oval-box skeleton-box"></div>
                    <div class="project-oval-box skeleton-box"></div>
                `;
            }
        }
        loadSiteData().then(data => {
            if (!data) return; // JSON yoksa statik HTML'e devam et
            window.CURRENT_SITE_DATA = data;

            // Hangi sayfada olduğumuzu anla
            const isIndex = !!document.querySelector('.slider-container');
            const isFaq = !!document.querySelector('.faq-list');
            const isLegal = !!document.getElementById('panel-privacy');
            const isProjectDetail = !!document.getElementById('pdAppSlider');

            if (isIndex) {
                initDynamicHeroSlider(data);
                initDynamicProjectsList(data);
                initDynamicSocialFeed(data);
            }
            if (isFaq) initDynamicFaq(data);
            if (isLegal) initDynamicLegal(data);
            
            if (isProjectDetail && data.projects && data.projects.length > 0) {
                const params = new URLSearchParams(window.location.search);
                const projKey = params.get('p') || data.projects[0].slug;
                const proj = data.projects.find(p => p.slug === projKey || p.id === projKey) || data.projects[0];
                window.CURRENT_PROJECT = proj;
                if (proj) initProjectDetail(proj);
            }
        });
    }

    // --- Butonlara Tema/Dil Dinleyicisi ---
    const themeToggleBtn = document.getElementById('themeToggle');
    const langToggleBtn = document.getElementById('langToggle');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (langToggleBtn) langToggleBtn.addEventListener('click', toggleLang);

    // --- Çerez Banner ---
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    if (banner && localStorage.getItem('avs_cookie_accepted') !== 'true') {
        setTimeout(() => banner.classList.add('visible'), 1200);
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('avs_cookie_accepted', 'true');
                banner.classList.remove('visible');
            });
        }
    }

    // --- Ana Sayfa Hero Slayt (Statik HTML fallback) ---
    const staticSlides = document.querySelectorAll('.slide');
    if (staticSlides.length > 0) {
        // PERF-3: startHeroSlider ile tek interval â€” JSON gelince zaten override edilir.
        startHeroSlider(staticSlides);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(_heroSlideInterval);
            } else {
                startHeroSlider(document.querySelectorAll('.slide'));
            }
        });
    }

    // --- HAMBURGER MOBİL MENÜ ---
    document.addEventListener('click', e => {
        const burgerBtn = e.target.closest('.hamburger');
        if (burgerBtn) {
            const nav = burgerBtn.parentElement ? burgerBtn.parentElement.querySelector('.nav-links') : document.querySelector('.nav-links');
            if (nav) {
                const isOpen = burgerBtn.getAttribute('aria-expanded') === 'true';
                burgerBtn.classList.toggle('active', !isOpen);
                nav.classList.toggle('active', !isOpen);
                burgerBtn.setAttribute('aria-expanded', String(!isOpen));
            }
            return;
        }

        const link = e.target.closest('.nav-links a');
        if (link) {
            const nav = link.closest('.nav-links');
            if (nav) {
                nav.classList.remove('active');
                const burger = nav.parentElement ? nav.parentElement.querySelector('.hamburger') : document.querySelector('.hamburger');
                if (burger) {
                    burger.classList.remove('active');
                    burger.setAttribute('aria-expanded', 'false');
                }
            }
        }
    });

    // --- SCROLL ANİMASYONLARI ---
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '-50px', threshold: 0.15 });

    // KOD-2: Global kaydedildi â€” dinamik eklenen kartlar da observe edilebilsin
    window._scrollObserver = observer;
    document.querySelectorAll('.scroll-anim').forEach(el => observer.observe(el));

    // --- NAV AKTİF SEKSİYON TAKİBİ ---
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');
    if (sections.length && navAnchors.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navAnchors.forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { threshold: 0.15 });

        sections.forEach(sec => navObserver.observe(sec));
    }

    // --- FORM DOĞRULAMA (İletişim) ---
    const contactNameInput = document.getElementById('contactName');
    const contactEmailInput = document.getElementById('contactEmail');
    const contactMessageInput = document.getElementById('contactMessage');
    const nameField = document.getElementById('nameField');
    const emailField = document.getElementById('emailField');
    const messageField = document.getElementById('messageField');
    const nameHint = document.getElementById('nameHint');
    const emailHint = document.getElementById('emailHint');
    const messageHint = document.getElementById('messageHint');

    function setFieldState(fieldEl, hintEl, isValid, message) {
        if (!fieldEl || !hintEl) return;
        fieldEl.classList.remove('valid', 'invalid');
        if (isValid === true) fieldEl.classList.add('valid');
        if (isValid === false) fieldEl.classList.add('invalid');
        hintEl.textContent = message;
    }

    function validateName() {
        if (!contactNameInput) return true;
        const val = contactNameInput.value.trim();
        if (val.length === 0) { setFieldState(nameField, nameHint, null, ''); return false; }
        if (val.length < 2) { setFieldState(nameField, nameHint, false, 'En az 2 karakter giriniz.'); return false; }
        setFieldState(nameField, nameHint, true, '✓ Güzel!');
        return true;
    }

    function validateEmail() {
        if (!contactEmailInput) return true;
        const val = contactEmailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (val.length === 0) { setFieldState(emailField, emailHint, null, ''); return false; }
        if (!emailRegex.test(val)) { setFieldState(emailField, emailHint, false, 'Geçerli bir e-posta adresi girin.'); return false; }
        setFieldState(emailField, emailHint, true, '✓ E-posta adresi geçerli.');
        return true;
    }

    function validateMessage() {
        if (!contactMessageInput) return true;
        const val = contactMessageInput.value.trim();
        if (!messageField || !messageHint) return true;
        if (val.length === 0) { setFieldState(messageField, messageHint, null, ''); return false; }
        if (val.length < 5) { setFieldState(messageField, messageHint, false, 'Mesajınızı biraz daha uzun yazın.'); return false; }
        setFieldState(messageField, messageHint, true, '✓ Hazır!');
        return true;
    }

    if (contactNameInput) contactNameInput.addEventListener('input', validateName);
    if (contactEmailInput) contactEmailInput.addEventListener('input', validateEmail);
    if (contactMessageInput) contactMessageInput.addEventListener('input', validateMessage);

    // --- DRY MATEMATİK CAPTCHA YARDIMCISI ---
    function setupMathCaptcha({ questionEl, inputEl, iconEl, statusEl, onVerifySuccess }) {
        let correctAnswer = null;
        let isVerified = false;

        function generate() {
            const x = Math.floor(Math.random() * 10) + 1;
            const y = Math.floor(Math.random() * 10) + 1;
            correctAnswer = x + y;
            isVerified = false;
            if (questionEl) questionEl.textContent = `${x} + ${y} = ?`;
            if (inputEl) { inputEl.value = ''; inputEl.className = 'math-input'; }
            if (iconEl) iconEl.textContent = '';
            if (statusEl) statusEl.textContent = 'Sonucu yazın ve devam edin.';
        }

        if (inputEl) {
            inputEl.addEventListener('input', () => {
                const val = parseInt(inputEl.value, 10);
                if (inputEl.value === '' || isNaN(val)) {
                    inputEl.className = 'math-input';
                    if (iconEl) iconEl.textContent = '';
                    if (statusEl) statusEl.textContent = 'Sonucu yazın ve devam edin.';
                    isVerified = false;
                    return;
                }
                if (val === correctAnswer) {
                    inputEl.className = 'math-input correct';
                    if (iconEl) { iconEl.textContent = '✓'; iconEl.style.color = '#2ecc71'; }
                    if (statusEl) statusEl.textContent = '✓ Doğru! Yönlendiriliyorsunuz...';
                    isVerified = true;
                    setTimeout(() => { if (onVerifySuccess) onVerifySuccess(); }, 600);
                } else {
                    inputEl.className = 'math-input wrong';
                    if (iconEl) { iconEl.textContent = '✗'; iconEl.style.color = '#e74c3c'; }
                    if (statusEl) statusEl.textContent = 'Yanlış cevap! Soru yenileniyor...';
                    isVerified = false;
                    setTimeout(generate, 800);
                }
            });
        }

        return {
            generate,
            reset: () => { isVerified = false; },
            isVerified: () => isVerified
        };
    }

    // --- İLETİŞİM FORMU & MATEMATİK CAPTCHA ---
    const contactButton = document.getElementById('contactButton');
    const verificationModal = document.getElementById('verificationModal');
    const verifyButton = document.getElementById('verifyButton');
    const cancelButton = document.getElementById('cancelButton');
    const contactStatus = document.getElementById('contactStatus');
    const captchaStatus = document.getElementById('captchaStatus');
    const mathQuestion = document.getElementById('mathQuestion');
    const mathAnswerInput = document.getElementById('mathAnswer');
    const mathCheckIcon = document.getElementById('mathCheckIcon');

    const contactCaptcha = setupMathCaptcha({
        questionEl: mathQuestion,
        inputEl: mathAnswerInput,
        iconEl: mathCheckIcon,
        statusEl: captchaStatus,
        onVerifySuccess: completeVerification
    });

    function lockScroll() {
        document.body.classList.add('modal-open');
    }

    function unlockScroll() {
        setTimeout(() => {
            const hasActiveModal = document.querySelector('.verification-modal.active, .pgallery-overlay.open');
            if (!hasActiveModal) {
                document.body.classList.remove('modal-open');
            }
        }, 50);
    }

    function openVerificationModal() {
        if (!verificationModal) return;
        contactCaptcha.generate();
        verificationModal.classList.add('active');
        verificationModal.setAttribute('aria-hidden', 'false');
        lockScroll();
        try { verificationModal.removeAttribute('inert'); } catch (e) { }
        setTimeout(() => { if (mathAnswerInput) mathAnswerInput.focus(); }, 150);
    }

    function closeVerificationModal() {
        if (!verificationModal) return;
        verificationModal.classList.remove('active');
        verificationModal.setAttribute('aria-hidden', 'true');
        unlockScroll();
        try { verificationModal.setAttribute('inert', ''); } catch (e) { }
        contactCaptcha.reset();
    }

    function completeVerification() {
        closeVerificationModal();

        const name = contactNameInput ? contactNameInput.value.trim() : '';
        const email = contactEmailInput ? contactEmailInput.value.trim() : '';
        const message = contactMessageInput ? contactMessageInput.value.trim() : '';
        const rawEmail = atob('YWd2cnNwLnY5QGdtYWlsLmNvbQ==');
        const subject = encodeURIComponent(`Portfolyo İletişim - ${name}`);
        const body = encodeURIComponent(`Merhaba,\n\nAdım: ${name}\nE-postam: ${email}\n\nMesajım:\n${message}`);
        const mailtoUrl = `mailto:${rawEmail}?subject=${subject}&body=${body}`;

        if (contactStatus) {
            // KOD-3: innerHTML kullan ama onclick YOK â€” aşağıda addEventListener ile bağlan
            contactStatus.innerHTML = `
                <div class="mail-success-card">
                    <p class="mail-success-title">✅ Güvenlik Doğrulaması Başarılı!</p>
                    <p class="mail-success-sub">Mesajınız e-posta istemcinize aktarıldı. Otomatik açılmadıysa aşağıdaki butona basabilir veya adrese doğrudan mail atabilirsiniz:</p>
                    <div class="mail-success-actions">
                        <a href="${mailtoUrl}" class="mail-direct-btn">✉️ E-postayı Gönder (${rawEmail})</a>
                        <button type="button" class="mail-copy-btn" id="mailCopyBtn">ğŸ“‹ Adresi Kopyala</button>
                    </div>
                </div>
            `;
            // KOD-3: CSP uyumlu event listener â€” onclick attribute yok
            const copyBtn = document.getElementById('mailCopyBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(rawEmail).then(() => {
                        copyBtn.textContent = '✓ Kopyalandı!';
                        setTimeout(() => { copyBtn.textContent = 'ğŸ“‹ Adresi Kopyala'; }, 2000);
                    }).catch(() => {
                        copyBtn.textContent = rawEmail; // Fallback: metni göster
                    });
                });
            }
        }

        try {
            const mailLink = document.createElement('a');
            mailLink.href = mailtoUrl;
            mailLink.style.display = 'none';
            document.body.appendChild(mailLink);
            mailLink.click();
            document.body.removeChild(mailLink);
        } catch (err) {
            console.error('Mailto hatası:', err);
        }
    }

    if (verifyButton) verifyButton.addEventListener('click', () => { if (contactCaptcha.isVerified()) completeVerification(); else if (captchaStatus) captchaStatus.textContent = 'Lütfen soruyu doğru cevaplayın.'; });
    if (cancelButton) cancelButton.addEventListener('click', closeVerificationModal);
    if (verificationModal) verificationModal.addEventListener('click', e => { if (e.target === verificationModal) closeVerificationModal(); });

    if (contactButton) {
        contactButton.addEventListener('click', () => {
            const nameOk = validateName();
            const emailOk = validateEmail();
            const messageOk = validateMessage();

            if (!nameOk && contactNameInput && contactNameInput.value.trim().length === 0)
                setFieldState(nameField, nameHint, false, 'Lütfen adınızı girin.');
            if (!emailOk && contactEmailInput && contactEmailInput.value.trim().length === 0)
                setFieldState(emailField, emailHint, false, 'Lütfen e-posta adresinizi girin.');
            if (!messageOk && contactMessageInput && contactMessageInput.value.trim().length === 0)
                setFieldState(messageField, messageHint, false, 'Lütfen mesajınızı girin.');

            if (nameOk && emailOk && messageOk) openVerificationModal();
        });
    }

    // --- BENTO KART TIKLAMALARI VE KLAVYE ERİŞİLEBİLİRLİĞİ ---
    document.addEventListener('click', e => {
        const card = e.target.closest('.bento-card[data-href]');
        if (card) {
            if (e.target.closest('.bento-detail-btn')) return;
            window.location.href = card.dataset.href;
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            const card = e.target.closest('.bento-card[data-href]');
            if (card && (e.target === card || e.target.closest('.bento-card') === card)) {
                if (e.target.closest('.bento-detail-btn')) return;
                e.preventDefault();
                window.location.href = card.dataset.href;
            }
        }
    });

    // --- SSS & CHANGELOG AKORDİYON ---
    document.addEventListener('click', e => {
        const btn = e.target.closest('.faq-question');
        if (!btn) return;

        const item = btn.closest('.faq-item');
        if (!item) return;

        const isOpen = item.classList.contains('open');
        const container = item.closest('.faq-list') || item.parentElement;

        if (container) {
            container.querySelectorAll('.faq-item.open').forEach(openItem => {
                if (openItem !== item) openItem.classList.remove('open');
            });
        }

        item.classList.toggle('open', !isOpen);
    });

    // --- YASAL SEKMELER (yasal.html) ---
    document.querySelectorAll('.legal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            document.querySelectorAll('.legal-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.legal-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById(target);
            if (panel) panel.classList.add('active');
        });
    });

    // --- SOSYAL MEDYA SLIDER ---
    const smSlider = document.getElementById('smSlider');
    if (smSlider) {
        const smSlides = Array.from(smSlider.querySelectorAll('.sm-slide'));
        const smDotsEl = document.getElementById('smDots');
        const smDots = smDotsEl ? Array.from(smDotsEl.querySelectorAll('.sm-dot')) : [];
        const smPrev = document.getElementById('smPrev');
        const smNext = document.getElementById('smNext');
        let smCurrent = 0;
        let smTimer = null;

        if (smSlides[0]) smSlides[0].classList.add('active');

        function smGoTo(idx, direction = 'next') {
            if (idx === smCurrent) return;
            const prev = smCurrent;
            smCurrent = (idx + smSlides.length) % smSlides.length;

            smSlides[prev].classList.add(direction === 'next' ? 'exit-left' : 'exit-right');
            smSlides[prev].classList.remove('active');

            requestAnimationFrame(() => { smSlides[smCurrent].classList.add('active'); });

            setTimeout(() => {
                smSlides[prev].classList.remove('exit-left', 'exit-right');
            }, 560);

            smDots.forEach((d, i) => {
                d.classList.toggle('active', i === smCurrent);
                d.setAttribute('aria-selected', String(i === smCurrent));
            });
        }

        function smGoNext() { smGoTo((smCurrent + 1) % smSlides.length, 'next'); }
        function smGoPrev() { smGoTo((smCurrent - 1 + smSlides.length) % smSlides.length, 'prev'); }

        function smStartTimer() {
            clearInterval(smTimer);
            smTimer = setInterval(smGoNext, 10000);
        }

        smStartTimer();

        if (smPrev) smPrev.addEventListener('click', () => { smGoPrev(); smStartTimer(); });
        if (smNext) smNext.addEventListener('click', () => { smGoNext(); smStartTimer(); });
        
        const smContainer = document.querySelector('.sm-slider-container');
        if (smContainer) {
            addSwipeListener(smContainer, 
                () => { smGoNext(); smStartTimer(); }, 
                () => { smGoPrev(); smStartTimer(); }
            );
        }

        smDots.forEach((dot, i) => {
            dot.addEventListener('click', () => { smGoTo(i, i > smCurrent ? 'next' : 'prev'); smStartTimer(); });
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) clearInterval(smTimer);
            else smStartTimer();
        });
    }

    // --- PROJE DETAY SAYFASI DİNAMİK VERİ HARİTASI ---
function initProjectDetail(proj) {
    if (!proj) return;
    window.CURRENT_PROJECT = proj;
    const lang = localStorage.getItem('avs_lang') || 'tr';
    const detail = proj.detail || {};

    const name = lang === 'en' ? (proj.nameEN || proj.name || 'Project Details') : (proj.name || 'Proje Detayları');
    const desc = lang === 'en' ? (proj.shortDescEN || proj.shortDesc || '') : (proj.shortDesc || '');

    // Title & Breadcrumb
    document.title = `${name} | AVS&V9`;
    const bc = document.getElementById('pdBreadcrumbName');
    if (bc) bc.textContent = name;

    // Header Name
    const pdTitle = document.getElementById('pdAppName');
    if (pdTitle) pdTitle.textContent = name;

    // Logo
    const logoEl = document.getElementById('pdAppLogo');
    if (logoEl) {
        logoEl.src = detail.logo || proj.logo || 'resimler/uygulama_logo.png';
        logoEl.alt = name;
    }

    // Stats
    const dlEl = document.getElementById('pdDownloads');
    if (dlEl) dlEl.textContent = detail.downloads || 'N/A';

    const ratingEl = document.getElementById('pdRating');
    if (ratingEl) ratingEl.textContent = detail.rating || 'N/A';

    const ageEl = document.getElementById('pdAgeRating');
    if (ageEl) ageEl.textContent = detail.ageRating || detail.age || '3+';

    // Status Badges
    const badgeContainer = document.getElementById('pdStatusBadgeContainer');
    if (badgeContainer) {
        let statuses = proj.statuses || (proj.status ? [proj.status] : []);
        let trStatus = detail.statusText || proj.statusText || '';
        let enStatus = detail.statusTextEN || proj.statusTextEN || '';
        
        badgeContainer.innerHTML = statuses.map(s => {
            let cls = 'pd-status-badge';
            if (s === 'inactive' || s === 'discontinued') cls += ' inactive';
            else if (s === 'wip' || s === 'paused' || s === 'waiting' || s === 'research' || s === 'development') cls += ' wip';
            let text = '';
            if (trStatus && statuses.length === 1 && s === proj.status) {
                text = lang === 'en' ? enStatus : trStatus;
            } else {
                text = getStatusTag(s).text;
            }
            return `<div class="${cls}"><span>${escapeHTML(text)}</span></div>`;
        }).join('');
    }

    // Android & Play Store Visibility
    const isAndroid = detail.isAndroid !== false; // Default true unless explicitly false
    const playStoreUrl = detail.playStoreUrl || proj.playUrl || '';
    const hasPlayUrl = playStoreUrl && playStoreUrl !== '#' && playStoreUrl.trim().length > 0;

    const plinkEl = document.getElementById('pdPlayStoreLink');
    if (plinkEl) {
        if (isAndroid && hasPlayUrl) {
            plinkEl.style.display = 'inline-flex';
            plinkEl.href = playStoreUrl;
        } else {
            plinkEl.style.display = 'none';
        }
    }

    // Store Stats Bar (Hide if not Android & no downloads)
    const storeStats = document.querySelector('.pd-store-stats');
    if (storeStats) {
        if (!isAndroid && !detail.downloads && !detail.rating) {
            storeStats.style.display = 'none';
        } else {
            storeStats.style.display = 'flex';
        }
    }

    // System Requirements & Permissions Grid
    const reqGrid = document.querySelector('.pd-req-grid');
    if (reqGrid) {
        if (isAndroid) {
            reqGrid.style.display = 'grid';
        } else {
            reqGrid.style.display = 'none';
        }
    }

    const minEl = document.getElementById('pdMinAndroid');
    if (minEl) minEl.textContent = detail.minAndroid || 'Android 8.0+';

    const sizeEl = document.getElementById('pdAppSize');
    if (sizeEl) sizeEl.textContent = detail.appSize || proj.size || '~15 MB';

    const permEl = document.getElementById('pdPermList');
    const permsArr = detail.permissions || proj.perms || [];
    if (permEl) {
        if (permsArr.length > 0) {
            permEl.innerHTML = permsArr.map(p => `<span class="pd-tag">📌 ${escapeHTML(p)}</span>`).join('');
        } else {
            permEl.innerHTML = `<span class="pd-tag">${lang === 'en' ? 'No special permissions required' : 'Özel izin gerektirmez'}</span>`;
        }
    }

    // Description (Hakkında)
    const descEl = document.getElementById('pdDescription');
    let rawDesc = (lang === 'en' && detail.descriptionEN && detail.descriptionEN.length) ? detail.descriptionEN : (detail.description && detail.description.length ? detail.description : desc);
    if (typeof rawDesc === 'string') {
        rawDesc = rawDesc.split('

').map(s => s.trim()).filter(Boolean);
    }
    if (descEl) {
        if (Array.isArray(rawDesc) && rawDesc.length > 0) {
            descEl.innerHTML = rawDesc.map(p => `<p>${escapeHTML(p)}</p>`).join('');
        } else {
            descEl.innerHTML = `<p>${escapeHTML(desc)}</p>`;
        }
    }

    // Changelog
    const changelogEl = document.getElementById('pdChangelog');
    const clData = detail.changelog || [];
    if (changelogEl) {
        if (clData && clData.length > 0) {
            changelogEl.innerHTML = clData.map(c => {
                const cTitle = lang === 'en' && c.titleEN ? c.titleEN : (c.title || '');
                const features = lang === 'en' && c.featuresEN ? c.featuresEN : (c.features || []);
                const fixes = lang === 'en' && c.fixesEN ? c.fixesEN : (c.fixes || []);
                const featStr = features.length ? `<p class="cl-subtitle">✨ ${lang === 'en' ? 'New Features' : 'Yeni Özellikler'}</p><ul>${features.map(f => `<li>${escapeHTML(f)}</li>`).join('')}</ul>` : '';
                const bugStr = fixes.length ? `<p class="cl-subtitle">🐛 ${lang === 'en' ? 'Bug Fixes' : 'Hata Düzeltmeleri'}</p><ul>${fixes.map(f => `<li>${escapeHTML(f)}</li>`).join('')}</ul>` : '';
                return `
                <div class="faq-item">
                    <button class="faq-question">
                        <span>${escapeHTML(c.version || '')} ${cTitle ? '- ' + escapeHTML(cTitle) : ''}</span>
                        <span class="cl-date">${escapeHTML(c.date || '')}</span>
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
            changelogEl.innerHTML = `<p style="color:var(--text-secondary); padding: 12px 0;">${lang === 'en' ? 'No release history published for this project yet.' : 'Bu proje için henüz sürüm geçmişi yayınlanmadı.'}</p>`;
        }
    }

    // Screenshots / Slider
    const pdAppSlider = document.getElementById('pdAppSlider');
    const slides = detail.screenshots || proj.slides || [];
    if (pdAppSlider && slides && slides.length > 0) {
        pdAppSlider.innerHTML = slides.map((src, i) =>
            `<div class="pd-app-slide${i === 0 ? ' active' : ''}">
               <img src="${src}" alt="${escapeHTML(name)} Screen ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" title="${lang === 'en' ? 'Click to zoom' : 'Büyütmek için tıklayın'}">
             </div>`
        ).join('');
    }
}

    // --- Proje Detay Feedback / E-posta Gönderimi (pdSendBtn) ---
    const pdSendBtn = document.getElementById('pdSendBtn');
    const pdVerifyModal = document.getElementById('pdVerifyModal');
    const pdMathQ = document.getElementById('pdMathQ');
    const pdMathA = document.getElementById('pdMathA');
    const pdMathIcon = document.getElementById('pdMathIcon');
    const pdCapStatus = document.getElementById('pdCaptchaStatus');
    const pdVerifyBtn = document.getElementById('pdVerifyBtn');
    const pdCancelBtn = document.getElementById('pdCancelBtn');
    const pdStatus = document.getElementById('pdStatus');

    const pdCaptcha = setupMathCaptcha({
        questionEl: pdMathQ,
        inputEl: pdMathA,
        iconEl: pdMathIcon,
        statusEl: pdCapStatus,
        onVerifySuccess: completePdVerify
    });

    function closePdModal() {
        if (!pdVerifyModal) return;
        pdVerifyModal.classList.remove('active');
        pdVerifyModal.setAttribute('aria-hidden', 'true');
        unlockScroll();
        try { pdVerifyModal.setAttribute('inert', ''); } catch (e) { }
        pdCaptcha.reset();
    }

    function completePdVerify() {
        closePdModal();
        const name = document.getElementById('pdName')?.value.trim() || 'İsimsiz';
        const email = document.getElementById('pdEmail')?.value.trim() || '';
        const subj = document.getElementById('pdSubject')?.value || 'diğer';
        const msg = document.getElementById('pdMessage')?.value.trim() || '';

        const mailtoUrl = `mailto:${atob('YWd2cnNwLnY5QGdtYWlsLmNvbQ==')}?subject=${encodeURIComponent(`[AVS&V9 - ${subj.toUpperCase()}] ${name}`)}&body=${encodeURIComponent(`Gönderen: ${name}\nE-posta: ${email}\n\nMesaj:\n${msg}`)}`;
        window.location.href = mailtoUrl;

        if (pdStatus) {
            pdStatus.style.display = 'block';
            pdStatus.innerHTML = `
                <div style="background: rgba(0,173,181,0.08); border: 1px solid var(--accent-color); border-radius: 16px; padding: 16px; margin-top: 14px; text-align: left;">
                    <p style="margin: 0 0 8px; color: var(--accent-color); font-weight: 700;">✓ E-posta istemciniz açıldı!</p>
                    <p style="margin: 0 0 8px; font-size: 0.85rem; color: var(--text-secondary);">Açılmadıysa doğrudan e-posta atabilirsiniz: <strong>${atob('YWd2cnNwLnY5QGdtYWlsLmNvbQ==')}</strong></p>
                    <button type="button" id="copyPdMailBtn" class="bento-detail-btn" style="font-size: 0.78rem; padding: 5px 12px;">ğŸ“‹ E-postayı Kopyala</button>
                </div>
            `;
            const copyBtn = document.getElementById('copyPdMailBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(atob('YWd2cnNwLnY5QGdtYWlsLmNvbQ=='));
                    copyBtn.textContent = '✓ Kopyalandı!';
                    setTimeout(() => { copyBtn.textContent = 'ğŸ“‹ E-postayı Kopyala'; }, 2000);
                });
            }
        }
    }

    if (pdSendBtn) {
        pdSendBtn.addEventListener('click', () => {
            const name = document.getElementById('pdName')?.value.trim();
            const email = document.getElementById('pdEmail')?.value.trim();
            const msg = document.getElementById('pdMessage')?.value.trim();

            if (!name || !email || !msg) {
                if (pdStatus) {
                    pdStatus.style.display = 'block';
                    pdStatus.innerHTML = `<span style="color: #e74c3c;">Lütfen tüm gerekli alanları (Ad, E-posta, Mesaj) doldurun.</span>`;
                }
                return;
            }

            if (!pdVerifyModal) return;
            pdCaptcha.generate();
            pdVerifyModal.classList.add('active');
            pdVerifyModal.setAttribute('aria-hidden', 'false');
            lockScroll();
            try { pdVerifyModal.removeAttribute('inert'); } catch (e) { }
            setTimeout(() => { if (pdMathA) pdMathA.focus(); }, 150);
        });
    }

    if (pdCancelBtn) pdCancelBtn.addEventListener('click', closePdModal);
    if (pdVerifyBtn) {
        pdVerifyBtn.addEventListener('click', () => {
            if (pdCaptcha.isVerified()) completePdVerify();
            else if (pdCapStatus) pdCapStatus.textContent = 'Lütfen soruyu doğru cevaplayın.';
        });
    }

});


