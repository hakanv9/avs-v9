// =============================================
// === AVS&V9 ANA SCRIPT (STABİL & HATASIZ) ===
// =============================================

// ─── SITE-DATA.JSON DİNAMİK YÜKLEME ─────────────────────────────────────────
// Admin panelinden yapılan tüm değişiklikler buradan okunur.

window.SITE_DATA = null;

async function loadSiteData() {
    try {
        const res = await fetch(`data/site-data.json?t=${Date.now()}`);
        if (!res.ok) throw new Error('site-data.json yüklenemedi');
        window.SITE_DATA = await res.json();
        return window.SITE_DATA;
    } catch (e) {
        console.warn('site-data.json okunamadı, statik içerik kullanılıyor:', e);
        return null;
    }
}

// Durum etiketi CSS sınıfı ve metnini döndürür
function getStatusTag(status) {
    const map = {
        'live':         { cls: 'tag-live',     text: '✅ Yayında' },
        'development':  { cls: 'tag-wip',      text: '⏳ Geliştirme Aşamasında' },
        'completed':    { cls: 'tag-completed', text: '🔵 Tamamlandı' },
        'discontinued': { cls: 'tag-inactive',  text: '📴 Yayından Kaldırılmış' },
        'paused':       { cls: 'tag-soon',      text: '⏸️ Geliştirme Durdurulmuş' },
    };
    return map[status] || { cls: '', text: status };
}

// Anasayfadaki hero slider'ı JSON verisiyle günceller
function initDynamicHeroSlider(data) {
    const container = document.querySelector('.slider-container');
    if (!container || !data || !data.heroSlider || !data.heroSlider.length) return;
    const slides = data.heroSlider.sort((a, b) => (a.order || 0) - (b.order || 0));
    container.innerHTML = slides.map((s, i) =>
        `<img src="${s.src}" class="slide${i === 0 ? ' active' : ''}" alt="${s.alt || ''}" loading="${i === 0 ? 'eager' : 'lazy'}">`
    ).join('');
}

// Anasayfadaki bento grid'i JSON verisiyle oluşturur
function initDynamicBentoGrid(data) {
    const grid = document.querySelector('.bento-grid');
    if (!grid || !data || !data.projects) return;

    const visible = data.projects.filter(p => p.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!visible.length) return;

    grid.innerHTML = visible.map((p, i) => {
        const isLarge = i === 0;
        const statusTag = getStatusTag(p.status);
        const extraTags = p.tags || [];
        return `
        <div class="bento-card ${isLarge ? 'bento-large' : 'bento-small'} scroll-anim"
             data-href="proje-detay.html?p=${p.slug}" tabindex="0" role="link"
             aria-label="${p.name} Detayları">
            <div class="bento-img-wrap">
                <img src="${p.thumbnail}" alt="${p.name}" loading="${i === 0 ? 'eager' : 'lazy'}">
                <div class="bento-overlay"></div>
            </div>
            <div class="bento-body">
                <div class="bento-tags">
                    ${extraTags.map(t => `<span class="tag">${t}</span>`).join('')}
                    <span class="tag ${statusTag.cls}">${statusTag.text}</span>
                </div>
                <h3>${p.name}</h3>
                <p>${p.shortDesc || ''}</p>
                <div class="bento-actions">
                    <a href="proje-detay.html?p=${p.slug}" class="bento-detail-btn" data-i18n="card.details">🔍 Detayları İncele</a>
                </div>
            </div>
        </div>`;
    }).join('');
}

// SSS sayfasını JSON'dan dinamik render eder
function initDynamicFaq(data) {
    const container = document.querySelector('.subpage-main');
    if (!container || !data || !data.faq) return;
    const heroEl = container.querySelector('.subpage-hero');
    const existingFaqContent = container.querySelectorAll('.section-title.faq-section-title, .faq-list');
    if (!existingFaqContent.length) return; // Statik içerik yoksa dur (çift render önlemi)

    // Statik SSS içeriğini temizle ve JSON'dan yeniden oluştur
    existingFaqContent.forEach(el => el.remove());
    container.querySelectorAll('h2.section-title.faq-section-title').forEach(el => el.remove());

    data.faq.forEach(cat => {
        const h2 = document.createElement('h2');
        h2.className = 'section-title faq-section-title';
        h2.textContent = cat.category;
        container.appendChild(h2);

        const list = document.createElement('div');
        list.className = 'faq-list faq-list-group';
        list.innerHTML = cat.items.map(item => `
            <div class="faq-item">
                <button class="faq-question">${item.question}<span class="faq-icon">»</span></button>
                <div class="faq-answer"><div class="faq-answer-inner">${item.answer}</div></div>
            </div>
        `).join('');
        container.appendChild(list);
    });
}

// Yasal sayfayı JSON'dan render eder
function initDynamicLegal(data) {
    if (!data || !data.legal) return;

    const privacyPanel = document.getElementById('privacy');
    const termsPanel = document.getElementById('terms');

    if (privacyPanel && data.legal.privacy) {
        const prv = data.legal.privacy;
        const dateEl = privacyPanel.querySelector('.legal-update-date');
        if (dateEl) dateEl.textContent = `Son Güncelleme: ${prv.lastUpdated || ''}`;
        const contentArea = privacyPanel.querySelector('.legal-content');
        if (contentArea && prv.content) {
            contentArea.innerHTML = prv.content.map(sec =>
                `<h3>${sec.heading}</h3><p>${sec.text}</p>`
            ).join('');
        }
    }

    if (termsPanel && data.legal.terms) {
        const trm = data.legal.terms;
        const dateEl = termsPanel.querySelector('.legal-update-date');
        if (dateEl) dateEl.textContent = `Son Güncelleme: ${trm.lastUpdated || ''}`;
        const contentArea = termsPanel.querySelector('.legal-content');
        if (contentArea && trm.content) {
            contentArea.innerHTML = trm.content.map(sec =>
                `<h3>${sec.heading}</h3><p>${sec.text}</p>`
            ).join('');
        }
    }
}


// --- Dil çevirileri ---
const TRANSLATIONS = {
    tr: {
        'nav.home': 'Ana Sayfa',
        'nav.projects': 'Projelerim',
        'nav.about': 'Hakkında',
        'nav.contact': 'İletişim',
        'nav.faq': 'SSS',
        'nav.legal': 'Yasal',
        'hero.title': 'HOŞGELDİN YOLCU',
        'hero.subtitle': 'Basit ama etkili yazılımlar, kullanıcı dostu deneyimler ve modern çözümlerle yolculuğumuza devam ediyoruz.',
        'hero.scroll': 'Aşağı Kaydır',
        'projects.title': 'Projelerim',
        'projects.intro': 'Kullanıcı deneyimini ön planda tutan, sade tasarımlı ve işlevsel çözümler geliştirmeye odaklanıyorum.',
        'about.title': 'Hakkında',
        'about.intro': 'Geliştirdiğim projeler, teknik beceri ve kullanıcı odaklı düşünme yaklaşımının birleşiminden doğuyor.',
        'about.body1': 'Bu yolculuk, kişisel gelişim ve teknolojiye duyulan merakla başladı; bugünse daha büyük hedeflere hizmet eden güçlü ve sürdürülebilir projelere dönüştü. Sektördeki deneyimlerim, farklı iş kollarından gelen bakış açıları ve sürekli öğrenme isteğim, ortaya koyduğum çözümlerin temelini oluşturuyor.',
        'about.body2': 'Amacım, karmaşık görünen fikirleri sade, hızlı ve etkili dijital deneyimlere dönüştürmek. Her proje, kullanıcıyla kurulan bağı güçlendiren ve gerçek bir ihtiyaçtan beslenen bir yaklaşım üzerine inşa ediliyor.',
        'about.skills': '💻 Beceriler & Bilgi Alanları',
        'contact.title': 'İletişim',
        'contact.intro': 'Projeler, fikirler ya da iş birlikleri hakkında konuşmak isterseniz mesaj bırakın.',
        'contact.name': 'Adınız',
        'contact.email': 'E-posta Adresiniz',
        'contact.message': 'Mesajınız',
        'contact.send': 'E-posta Gönder',
        'captcha.title': 'Güvenlik doğrulaması',
        'captcha.intro': 'Bir doğrulama işlemi yapın.',
        'captcha.hint': 'Aşağıdaki soruyu cevaplayın.',
        'captcha.continue': 'Devam Et',
        'captcha.cancel': 'İptal',
        'footer.copy': '© 2026  AVS&V9 — Tüm hakları saklıdır.',
        'cookie.text': '🍪 Bu site, deneyiminizi iyileştirmek için yerel tercih verileri (tema, dil) saklar. Hiçbir kişisel veri üçüncü taraflarla paylaşılmaz.',
        'cookie.accept': 'Kabul Et',
        'cookie.more': 'Daha Fazla',

        'nav.social': 'Sosyal Medya',
        'nav.proj1': '📦 Kurye Takip Sistemi',
        'nav.proj2': '🗺️ Grup Konum V1',
        'nav.proj3': '📍 Grup Konum V2',
        'card.details': '🔍 Detayları İncele',
        'detail.downloads': 'İndirme',
        'detail.rating': 'Puan',
        'detail.agerating': 'Yaş',
        'detail.getapp': 'Google Play\'den İndir',
        'detail.about': '📋 Uygulama Hakkında',
        'detail.requirements': '📱 Sistem Gereksinimleri',
        'detail.minandroid': 'Minimum Android',
        'detail.connection': 'Bağlantı',
        'detail.connval': 'İnternet bağlantısı gerekli (Wi-Fi / Mobil veri)',
        'detail.size': 'Boyut',
        'detail.permissions': '🔐 Gerekli İzinler',
        'detail.perm.location': '📍 Konum (Ön plan & Arka plan)',
        'detail.perm.notif': '🔔 Bildirimler',
        'detail.perm.net': '📶 İnternet Erişimi',
        'detail.perm.bg': '⚡ Arka Plan Servisi',
        'detail.changelog': '📝 Sürüm Geçmişi',
        'detail.feedback': '💬 Görüş, İstek & Öneri',
        'detail.feedbacksub': 'Bu uygulama hakkında bir hata bildirimi, öneri veya istek göndermek istiyorsanız aşağıdaki formu kullanın.',
        'detail.subject': 'Konu Türü',
        'detail.subj.bug': '🐛 Hata Bildirimi',
        'detail.subj.feature': '💡 Özellik İsteği',
        'detail.subj.question': '❓ Soru',
        'detail.subj.other': '💬 Diğer',
        'detail.cta': 'Farklı bir sorunuz mu var?',
        'detail.ctabtn': 'Doğrudan İletişime Geçin →',
        'social.title': 'Sosyal Medya',
        'social.intro': 'Güncel paylaşımlar, uygulama duyuruları ve geliştirme sürecinden kareler.',
        'social.slide1.title': '🚀 V9 Kurye — Geliştirme Süreci',
        'social.slide1.desc': 'Gerçek zamanlı harita entegrasyonunun sahne arkasına dair özel kareler ve teknik ayrıntılar.',
        'social.slide2.title': '📍 Grup Konum V2 — Tanıtım Videosu',
        'social.slide2.desc': 'Low-latency GPS senkronizasyonu ve entegre sohbet özelliklerini gösteren tam tanıtım videosu.',
        'social.slide3.title': '⚡ Yeni Güncelleme — Canlı Demo',
        'social.slide3.desc': 'Son güncellemeyle gelen yeni özelliklerin kısa ve eğlenceli tanıtım videosu.',
        'social.viewpost': 'Gönderiyi İncele ↗',
        'social.follow': 'Takip Et',
        'social.subscribe': 'Abone Ol',
        'social.getapp': 'Uygulamayı İndir',

        'faq.page.title': 'Sıkça Sorulan Sorular',
        'faq.page.sub': 'Uygulamalar hakkında merak edilen tüm sorular burada.',
        'legal.page.title': 'Yasal Bilgiler',
        'legal.page.sub': 'Gizlilik Politikamız ve Kullanım Koşullarımız.',
        'legal.tab.privacy': 'Gizlilik Politikası',
        'legal.tab.terms': 'Kullanım Koşulları',
    },
    en: {
        'nav.home': 'Home',
        'nav.projects': 'Projects',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'nav.faq': 'FAQ',
        'nav.legal': 'Legal',
        'hero.title': 'WELCOME, TRAVELLER',
        'hero.subtitle': 'Simple yet powerful software, user-friendly experiences, and modern solutions — our journey continues.',
        'hero.scroll': 'Scroll Down',
        'projects.title': 'My Projects',
        'projects.intro': 'Focused on developing clean, functional solutions that put user experience first.',
        'about.title': 'About',
        'about.intro': 'My projects are born from the combination of technical skill and a user-centred mindset.',
        'about.body1': 'This journey began with a curiosity for technology and personal growth; today it has evolved into powerful, sustainable projects that serve greater goals. My industry experience, diverse perspectives, and constant drive to learn form the foundation of every solution I build.',
        'about.body2': 'My goal is to transform seemingly complex ideas into simple, fast, and effective digital experiences. Every project is built on an approach that strengthens the bond with the user and is rooted in a real need.',
        'about.skills': '💻 Skills & Knowledge Areas',
        'contact.title': 'Contact',
        'contact.intro': 'If you would like to talk about projects, ideas, or collaborations, leave a message.',
        'contact.name': 'Your Name',
        'contact.email': 'Your Email Address',
        'contact.message': 'Your Message',
        'contact.send': 'Send Email',
        'captcha.title': 'Security Verification',
        'captcha.intro': 'Please complete a verification step.',
        'captcha.hint': 'Answer the question below.',
        'captcha.continue': 'Continue',
        'captcha.cancel': 'Cancel',
        'footer.copy': '© 2026  AVS&V9 — All rights reserved.',
        'cookie.text': '🍪 This site stores local preference data (theme, language) to improve your experience. No personal data is shared with third parties.',
        'cookie.accept': 'Accept',
        'cookie.more': 'Learn More',

        'nav.social': 'Social Media',
        'nav.proj1': '📦 Courier Tracking',
        'nav.proj2': '🗺️ Group Location V1',
        'nav.proj3': '📍 Group Location V2',
        'card.details': '🔍 View Details',
        'detail.downloads': 'Downloads',
        'detail.rating': 'Rating',
        'detail.agerating': 'Age',
        'detail.getapp': 'Get it on Google Play',
        'detail.about': '📋 About the App',
        'detail.requirements': '📱 System Requirements',
        'detail.minandroid': 'Minimum Android',
        'detail.connection': 'Connection',
        'detail.connval': 'Internet connection required (Wi-Fi / Mobile data)',
        'detail.size': 'Size',
        'detail.permissions': '🔐 Required Permissions',
        'detail.perm.location': '📍 Location (Foreground & Background)',
        'detail.perm.notif': '🔔 Notifications',
        'detail.perm.net': '📶 Internet Access',
        'detail.perm.bg': '⚡ Background Service',
        'detail.changelog': '📝 Version History',
        'detail.feedback': '💬 Feedback & Suggestions',
        'detail.feedbacksub': 'Use the form below to report a bug, request a feature, or ask a question about this app.',
        'detail.subject': 'Subject Type',
        'detail.subj.bug': '🐛 Bug Report',
        'detail.subj.feature': '💡 Feature Request',
        'detail.subj.question': '❓ Question',
        'detail.subj.other': '💬 Other',
        'detail.cta': 'Have a different question?',
        'detail.ctabtn': 'Contact Us Directly →',
        'social.title': 'Social Media',
        'social.intro': 'Latest posts, app announcements, and behind-the-scenes moments from development.',
        'social.slide1.title': '🚀 V9 Courier — Development Process',
        'social.slide1.desc': 'Exclusive behind-the-scenes shots and technical details from the real-time map integration.',
        'social.slide2.title': '📍 Group Location V2 — Showcase Video',
        'social.slide2.desc': 'Full showcase video demonstrating low-latency GPS sync and integrated chat features.',
        'social.slide3.title': '⚡ New Update — Live Demo',
        'social.slide3.desc': 'A short, fun teaser video of the features arriving in the latest update.',
        'social.viewpost': 'View Post ↗',
        'social.follow': 'Follow',
        'social.subscribe': 'Subscribe',
        'social.getapp': 'Get the App',

        'faq.page.title': 'Frequently Asked Questions',
        'faq.page.sub': 'All common questions about our apps, answered here.',
        'legal.page.title': 'Legal Information',
        'legal.page.sub': 'Our Privacy Policy and Terms of Service.',
        'legal.tab.privacy': 'Privacy Policy',
        'legal.tab.terms': 'Terms of Service',
    }
};

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
    const t = TRANSLATIONS[lang] || TRANSLATIONS['tr'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
    });
    const label = document.getElementById('langLabel');
    if (label) label.textContent = lang.toUpperCase();
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('avs_lang', lang);
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

    // ─── DİNAMİK VERİ YÜKLEME (site-data.json) ───────────────────────────────
    // Admin panelinden yapılan değişiklikler burada okunur ve sayfalar güncellenir.
    // Admin paneli sayfasında bu blok çalışmaz (data-admin-page kontrolü).
    if (!document.documentElement.hasAttribute('data-admin-page')) {
        loadSiteData().then(data => {
            if (!data) return; // JSON yoksa statik HTML'e devam et
            // Hangi sayfada olduğumuzu anla
            const isIndex = !!document.querySelector('.slider-container');
            const isFaq = !!document.querySelector('.faq-list');
            const isLegal = !!document.getElementById('privacy');
            const isProjectDetail = !!document.getElementById('pdAppSlider');

            if (isIndex) {
                initDynamicHeroSlider(data);
                initDynamicBentoGrid(data);
                // Slider'ı JSON'dan aldıktan sonra timer'ı yeniden başlat
                const newSlides = document.querySelectorAll('.slide');
                if (newSlides.length > 1) {
                    let cur = 0;
                    setInterval(() => {
                        newSlides[cur].classList.remove('active');
                        cur = (cur + 1) % newSlides.length;
                        newSlides[cur].classList.add('active');
                    }, 10000);
                }
            }
            if (isFaq) initDynamicFaq(data);
            if (isLegal) initDynamicLegal(data);
            // Proje detay sayfası için PROJECT_DATA güncelleme
            if (isProjectDetail && data.projects) {
                // PROJECT_DATA'yı JSON ile üzerine yaz (geriye dönük uyumlu)
                window._SITE_PROJECTS_FROM_JSON = {};
                data.projects.forEach(p => {
                    window._SITE_PROJECTS_FROM_JSON[p.slug] = p;
                });
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

    // --- Ana Sayfa Hero Slayt ---
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    if (slides.length > 0) {
        let slideInterval = setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 10000);

        document.addEventListener('visibilitychange', () => {
            clearInterval(slideInterval);
            if (!document.hidden) {
                slideInterval = setInterval(() => {
                    slides[currentSlide].classList.remove('active');
                    currentSlide = (currentSlide + 1) % slides.length;
                    slides[currentSlide].classList.add('active');
                }, 10000);
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
        const rawEmail = 'hakangureli090@gmail.com';
        const subject = encodeURIComponent(`Portfolyo İletişim - ${name}`);
        const body = encodeURIComponent(`Merhaba,\n\nAdım: ${name}\nE-postam: ${email}\n\nMesajım:\n${message}`);
        const mailtoUrl = `mailto:${rawEmail}?subject=${subject}&body=${body}`;

        if (contactStatus) {
            contactStatus.innerHTML = `
                <div class="mail-success-card">
                    <p class="mail-success-title">✅ Güvenlik Doğrulaması Başarılı!</p>
                    <p class="mail-success-sub">Mesajınız e-posta istemcinize aktarıldı. Otomatik açılmadıysa aşağıdaki butona basabilir veya adrese doğrudan mail atabilirsiniz:</p>
                    <div class="mail-success-actions">
                        <a href="${mailtoUrl}" class="mail-direct-btn">✉️ E-postayı Gönder (${rawEmail})</a>
                        <button type="button" class="mail-copy-btn" onclick="navigator.clipboard.writeText('${rawEmail}'); this.textContent='✓ Kopyalandı!';">📋 Adresi Kopyala</button>
                    </div>
                </div>
            `;
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

        smDots.forEach((dot, i) => {
            dot.addEventListener('click', () => { smGoTo(i, i > smCurrent ? 'next' : 'prev'); smStartTimer(); });
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) clearInterval(smTimer);
            else smStartTimer();
        });
    }

    // --- PROJE DETAY SAYFASI DİNAMİK VERİ HARİTASI ---
    const pdAppSlider = document.getElementById('pdAppSlider');
    if (pdAppSlider) {
        const PROJECT_DATA = {
            'kurye': {
                name: 'V9 Kurye Uygulaması',
                nameEN: 'V9 Courier App',
                status: 'inactive',
                statusText: '📴 Yayından Kaldırılmış',
                statusTextEN: '📴 Discontinued',
                downloads: '5B+',
                rating: '4.5 ★',
                age: '3+',
                size: '~18 MB',
                minAndroid: 'Android 8.0 (Oreo) / API 26',
                playUrl: '#',
                logo: 'resimler/uygulama_logo.png',
                slides: ['resimler/uygulama_ekran1.png', 'resimler/uygulama_ekran2.png'],
                description: [
                    'V9 Kurye Uygulaması, teslimat süreçlerini uçtan uca yöneten bir mobil çözümdür.',
                    'Gerçek zamanlı GPS takibi ile kuryenin tüm hareketleri anlık olarak izlenebilir. Dinamik rota optimizasyonu, teslimat süresini ve yakıt tüketimini önemli ölçüde azaltır.',
                    '📍 Gerçek Zamanlı Harita Takibi | 🗺️ Dinamik Rota | 🔔 Anlık Bildirimler | 🚀 Akıllı Teslimat'
                ],
                perms: ['📍 Konum (Ön plan & Arka plan)', '🔔 Bildirimler', '📶 İnternet Erişimi', '⚡ Arka Plan Servisi', '📷 Kamera (teslimat fotoğrafı)']
            },
            'grup-v1': {
                name: 'V9 Grup Konum Paylaşımı',
                nameEN: 'V9 Group Location Sharing',
                status: 'wip',
                statusText: '⏸️ Geliştirme Durduruldu',
                statusTextEN: '⏸️ Development Paused',
                downloads: '10B+',
                rating: '4.8 ★',
                age: '3+',
                size: '~12 MB',
                minAndroid: 'Android 8.0 (Oreo) / API 26',
                playUrl: '#',
                logo: 'resimler/uygulama_logo.png',
                slides: ['resimler/uygulama_ekran1.png', 'resimler/uygulama_ekran2.png'],
                description: [
                    'V9 Grup Konum Paylaşımı (v1.0), bir grup içindeki tüm üyelerin konumunu aynı anda haritada göstermeye yarayan mobil bir uygulamadır.',
                    'Saniyeler içinde oda oluşturun, davet bağlantısı paylaşın ve grubunuzun tüm üyelerini anlık olarak haritada izleyin. Akıllı toplanma noktası hesaplaması ile herkese en yakın buluşma noktası belirlenir.',
                    '👥 Dinamik Grup Yönetimi | 📍 Gerçek Zamanlı Çoklu Takip | 🔋 Optimize Pil Kullanımı | 🎯 Akıllı Toplanma Noktaları'
                ],
                perms: ['📍 Konum (Ön plan & Arka plan)', '🔔 Bildirimler', '📶 İnternet Erişimi', '⚡ Arka Plan Servisi']
            },
            'grup-v2': {
                name: 'V9 Grup Konum V2',
                nameEN: 'V9 Group Location V2',
                status: 'active',
                statusText: '✅ Geliştirme Aşamasında',
                statusTextEN: '✅ In Development',
                downloads: '-',
                rating: '-',
                age: '3+',
                size: '~15 MB',
                minAndroid: 'Android 8.0 (Oreo) / API 26',
                playUrl: '#',
                logo: 'resimler/uygulama_logo.png',
                slides: ['resimler/uygulama_ekran1.png', 'resimler/uygulama_ekran2.png'],
                description: [
                    'V9 Grup Konum Paylaşımı V2, birinci sürümün üzerine inşa edilmiş, entegre sohbet özelliği ve low-latency GPS senkronizasyonu ile donatılmış gelişmiş bir sürümdür.',
                    'Yönetici yetkileri, oda kapasite ayarları ve gerçek zamanlı mesajlaşma ile grup yönetimi tamamen yeniden tasarlandı. Modüler mimari sayesinde gelecekteki özellikler kolayca entegre edilebilir.',
                    '🚀 Low-latency GPS | 💬 Entegre Sohbet | ⚙️ Yönetici Paneli | 🔄 Ölçeklenebilir Mimari'
                ],
                perms: ['📍 Konum (Ön plan & Arka plan)', '🔔 Bildirimler', '📶 İnternet Erişimi', '⚡ Arka Plan Servisi', '💬 İnternet Mesajlaşma']
            }
        };

        const params = new URLSearchParams(window.location.search);
        const projKey = params.get('p') || 'grup-v1';
        const proj = PROJECT_DATA[projKey] || PROJECT_DATA['grup-v1'];
        const lang = localStorage.getItem('avs_lang') || 'tr';

        const bc = document.getElementById('pdBreadcrumbName');
        if (bc) bc.textContent = lang === 'en' ? proj.nameEN : proj.name;

        document.title = `${lang === 'en' ? proj.nameEN : proj.name} | AVS&V9`;

        const nameEl = document.getElementById('pdAppName');
        if (nameEl) nameEl.textContent = lang === 'en' ? proj.nameEN : proj.name;

        const logoEl = document.getElementById('pdAppLogo');
        if (logoEl) { logoEl.src = proj.logo; logoEl.alt = proj.name; }

        const dlEl = document.getElementById('pdDownloads');
        if (dlEl) dlEl.textContent = proj.downloads;

        const ratingEl = document.getElementById('pdRating');
        if (ratingEl) ratingEl.textContent = proj.rating;

        const ageEl = document.getElementById('pdAgeRating');
        if (ageEl) ageEl.textContent = proj.age;

        const plinkEl = document.getElementById('pdPlayStoreLink');
        if (plinkEl) plinkEl.href = proj.playUrl;

        const badge = document.getElementById('pdStatusBadge');
        const statusTxt = document.getElementById('pdStatusText');
        if (badge && statusTxt) {
            badge.className = 'pd-status-badge';
            if (proj.status === 'inactive') badge.classList.add('inactive');
            else if (proj.status === 'wip') badge.classList.add('wip');
            statusTxt.textContent = lang === 'en' ? proj.statusTextEN : proj.statusText;
        }

        const descEl = document.getElementById('pdDescription');
        if (descEl) descEl.innerHTML = proj.description.map(p => `<p>${p}</p>`).join('');

        const permEl = document.getElementById('pdPermList');
        if (permEl) {
            permEl.innerHTML = proj.perms.map(p =>
                `<li><span class="pd-perm-badge">${p.split(' ')[0]}</span><span>${p.slice(p.indexOf(' ') + 1)}</span></li>`
            ).join('');
        }

        const minEl = document.getElementById('pdMinAndroid');
        if (minEl) minEl.textContent = proj.minAndroid;

        const sizeEl = document.getElementById('pdAppSize');
        if (sizeEl) sizeEl.textContent = proj.size;

        const dotsEl = document.getElementById('pdDots');
        const pdPrev = document.getElementById('pdPrev');
        const pdNext = document.getElementById('pdNext');

        if (proj.slides && proj.slides.length) {
            pdAppSlider.innerHTML = proj.slides.map((src, i) =>
                `<div class="pd-app-slide${i === 0 ? ' active' : ''}">
                   <img src="${src}" alt="Ekran ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" title="Büyütmek için tıklayın 🔍">
                 </div>`
            ).join('');

            // T11: Lightbox Zoom
            pdAppSlider.style.cursor = 'zoom-in';
            const lbModal = document.getElementById('pdLightboxModal');
            const lbImg = document.getElementById('pdLightboxImg');
            const lbClose = document.getElementById('pdLightboxClose');

            function closeLightbox() {
                if (lbModal) {
                    lbModal.classList.remove('open');
                    lbModal.setAttribute('aria-hidden', 'true');
                    unlockScroll();
                    try { lbModal.setAttribute('inert', ''); } catch (err) { }
                }
            }

            pdAppSlider.addEventListener('click', e => {
                const img = e.target.closest('img');
                if (img && lbModal && lbImg) {
                    lbImg.src = img.src;
                    lbModal.classList.add('open');
                    lbModal.setAttribute('aria-hidden', 'false');
                    lockScroll();
                    try { lbModal.removeAttribute('inert'); } catch (err) { }
                }
            });

            if (lbClose) lbClose.addEventListener('click', closeLightbox);
            if (lbModal) {
                lbModal.addEventListener('click', evt => {
                    if (evt.target === lbModal) closeLightbox();
                });
            }
            document.addEventListener('keydown', evt => {
                if (evt.key === 'Escape') closeLightbox();
            });

            if (dotsEl) {
                dotsEl.innerHTML = proj.slides.map((_, i) =>
                    `<button class="pd-dot${i === 0 ? ' active' : ''}" data-idx="${i}" role="tab" aria-selected="${i === 0}"></button>`
                ).join('');
            }

            let pdCurrent = 0;
            let pdTimer = null;

            const pdSlides = Array.from(pdAppSlider.querySelectorAll('.pd-app-slide'));
            const pdDots = dotsEl ? Array.from(dotsEl.querySelectorAll('.pd-dot')) : [];

            function pdGoTo(idx) {
                if (idx === pdCurrent) return;
                pdSlides[pdCurrent].classList.remove('active');
                pdDots[pdCurrent]?.classList.remove('active');
                pdCurrent = (idx + pdSlides.length) % pdSlides.length;
                pdSlides[pdCurrent].classList.add('active');
                pdDots[pdCurrent]?.classList.add('active');
            }

            function pdDoNext() { pdGoTo((pdCurrent + 1) % pdSlides.length); }
            function pdDoPrev() { pdGoTo((pdCurrent - 1 + pdSlides.length) % pdSlides.length); }

            function pdStartTimer() {
                clearInterval(pdTimer);
                pdTimer = setInterval(pdDoNext, 10000);
            }

            pdStartTimer();

            if (pdPrev) pdPrev.addEventListener('click', () => { pdDoPrev(); pdStartTimer(); });
            if (pdNext) pdNext.addEventListener('click', () => { pdDoNext(); pdStartTimer(); });

            pdDots.forEach((d, i) => d.addEventListener('click', () => { pdGoTo(i); pdStartTimer(); }));

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) clearInterval(pdTimer);
                else pdStartTimer();
            });
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

        const mailtoUrl = `mailto:hakangureli090@gmail.com?subject=${encodeURIComponent(`[AVS&V9 - ${subj.toUpperCase()}] ${name}`)}&body=${encodeURIComponent(`Gönderen: ${name}\nE-posta: ${email}\n\nMesaj:\n${msg}`)}`;
        window.location.href = mailtoUrl;

        if (pdStatus) {
            pdStatus.style.display = 'block';
            pdStatus.innerHTML = `
                <div style="background: rgba(0,173,181,0.08); border: 1px solid var(--accent-color); border-radius: 16px; padding: 16px; margin-top: 14px; text-align: left;">
                    <p style="margin: 0 0 8px; color: var(--accent-color); font-weight: 700;">✓ E-posta istemciniz açıldı!</p>
                    <p style="margin: 0 0 8px; font-size: 0.85rem; color: var(--text-secondary);">Açılmadıysa doğrudan e-posta atabilirsiniz: <strong>hakangureli090@gmail.com</strong></p>
                    <button type="button" id="copyPdMailBtn" class="bento-detail-btn" style="font-size: 0.78rem; padding: 5px 12px;">📋 E-postayı Kopyala</button>
                </div>
            `;
            const copyBtn = document.getElementById('copyPdMailBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText('hakangureli090@gmail.com');
                    copyBtn.textContent = '✓ Kopyalandı!';
                    setTimeout(() => { copyBtn.textContent = '📋 E-postayı Kopyala'; }, 2000);
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
