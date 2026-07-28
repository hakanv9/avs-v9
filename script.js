// === SLIDER ===
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function nextSlide() {
    if (slides.length > 0) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
}

let slideInterval = setInterval(nextSlide, 10000);

// Sekme gizlince durdur, geri gelince devam et
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(slideInterval);
    } else {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 10000);
    }
});

// === HAMBURGER ===
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', String(!isOpen));
    });

    document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }));
}

// === SCROLL ANİMASYONLARI ===
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            obs.unobserve(entry.target);
        }
    });
}, {
    root: null,
    rootMargin: '-50px',
    threshold: 0.25
});

document.querySelectorAll('.scroll-anim').forEach(el => observer.observe(el));

// === NAV AKTİF SEKSİYON TAKİBİ ===
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navAnchors.forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { threshold: 0.4 });

sections.forEach(sec => navObserver.observe(sec));

// === FORM DOĞRULAMA ===
const contactNameInput    = document.getElementById('contactName');
const contactEmailInput   = document.getElementById('contactEmail');
const contactMessageInput = document.getElementById('contactMessage');
const nameField           = document.getElementById('nameField');
const emailField          = document.getElementById('emailField');
const messageField        = document.getElementById('messageField');
const nameHint            = document.getElementById('nameHint');
const emailHint           = document.getElementById('emailHint');
const messageHint         = document.getElementById('messageHint');

function validateName() {
    const val = contactNameInput.value.trim();
    if (val.length === 0)  { setFieldState(nameField, nameHint, null,  ''); return false; }
    if (val.length < 2)    { setFieldState(nameField, nameHint, false, 'En az 2 karakter giriniz.'); return false; }
    setFieldState(nameField, nameHint, true, '✓ Güzel!');
    return true;
}

function validateEmail() {
    const val = contactEmailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val.length === 0)          { setFieldState(emailField, emailHint, null,  ''); return false; }
    if (!emailRegex.test(val))     { setFieldState(emailField, emailHint, false, 'Geçerli bir e-posta adresi girin.'); return false; }
    setFieldState(emailField, emailHint, true, '✓ E-posta adresi geçerli.');
    return true;
}

function validateMessage() {
    const val = contactMessageInput ? contactMessageInput.value.trim() : '';
    if (!messageField || !messageHint) return true;
    if (val.length === 0) { setFieldState(messageField, messageHint, null,  ''); return false; }
    if (val.length < 5)   { setFieldState(messageField, messageHint, false, 'Mesajınızı biraz daha uzun yazın.'); return false; }
    setFieldState(messageField, messageHint, true, '✓ Hazır!');
    return true;
}

function setFieldState(fieldEl, hintEl, isValid, message) {
    fieldEl.classList.remove('valid', 'invalid');
    if (isValid === true)  fieldEl.classList.add('valid');
    if (isValid === false) fieldEl.classList.add('invalid');
    hintEl.textContent = message;
}

contactNameInput.addEventListener('input', validateName);
contactEmailInput.addEventListener('input', validateEmail);
if (contactMessageInput) contactMessageInput.addEventListener('input', validateMessage);

contactNameInput.addEventListener('blur', () => {
    if (contactNameInput.value.trim().length > 0) validateName();
});
contactEmailInput.addEventListener('blur', () => {
    if (contactEmailInput.value.trim().length > 0) validateEmail();
});
if (contactMessageInput) {
    contactMessageInput.addEventListener('blur', () => {
        if (contactMessageInput.value.trim().length > 0) validateMessage();
    });
}

// === İLETİŞİM BUTONU & MATEMATİK CAPTCHA ===
const contactButton      = document.getElementById('contactButton');
const verificationModal  = document.getElementById('verificationModal');
const verifyButton       = document.getElementById('verifyButton');
const cancelButton       = document.getElementById('cancelButton');
const contactStatus      = document.getElementById('contactStatus');
const captchaStatus      = document.getElementById('captchaStatus');
const verificationIntro  = document.getElementById('verificationIntro');
const mathQuestion       = document.getElementById('mathQuestion');
const mathAnswerInput    = document.getElementById('mathAnswer');
const mathCheckIcon      = document.getElementById('mathCheckIcon');

let correctAnswer = null;
let mathVerified  = false;

// CSS değişkeninden renk oku (tema bağımsız)
function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMath() {
    const x = rand(1, 10);
    const y = rand(1, 10);
    correctAnswer = x + y;
    mathVerified  = false;
    mathQuestion.textContent     = `${x} + ${y} = ?`;
    mathAnswerInput.value        = '';
    mathAnswerInput.className    = 'math-input';
    mathCheckIcon.textContent    = '';
    captchaStatus.textContent    = 'Sonucu yazın ve devam edin.';
}

mathAnswerInput.addEventListener('input', () => {
    const val = parseInt(mathAnswerInput.value, 10);

    if (mathAnswerInput.value === '' || isNaN(val)) {
        mathAnswerInput.className = 'math-input';
        mathCheckIcon.textContent = '';
        captchaStatus.textContent = 'Sonucu yazın ve devam edin.';
        mathVerified = false;
        return;
    }

    if (val === correctAnswer) {
        mathAnswerInput.className  = 'math-input correct';
        mathCheckIcon.textContent  = '✓';
        mathCheckIcon.style.color  = cssVar('--color-success');
        captchaStatus.textContent  = '✓ Doğru! Yönlendiriliyorsunuz...';
        mathVerified = true;
        setTimeout(completeVerification, 600);
    } else {
        mathAnswerInput.className  = 'math-input wrong';
        mathCheckIcon.textContent  = '✗';
        mathCheckIcon.style.color  = cssVar('--color-error');
        captchaStatus.textContent  = 'Yanlış cevap, tekrar deneyin.';
        mathVerified = false;
        setTimeout(() => {
            if (!mathVerified) mathAnswerInput.className = 'math-input';
        }, 400);
    }
});

let modalTriggerEl = null;

function openVerificationModal(triggerEl) {
    modalTriggerEl = triggerEl || document.activeElement;
    verificationModal.classList.add('active');
    verificationModal.setAttribute('aria-hidden', 'false');
    verificationModal.removeAttribute('inert');
    verificationIntro.textContent = 'Aşağıdaki matematik sorusunu cevaplayın.';
    generateMath();
    setTimeout(() => mathAnswerInput.focus(), 150);
}

function closeVerificationModal() {
    verificationModal.classList.remove('active');
    verificationModal.setAttribute('aria-hidden', 'true');
    verificationModal.setAttribute('inert', '');
    mathVerified = false;
    if (modalTriggerEl) modalTriggerEl.focus();
}

verificationModal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(verificationModal.querySelectorAll(
        'button, input, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
});

function completeVerification() {
    if (!mathVerified) return;
    closeVerificationModal();

    const name    = contactNameInput.value.trim();
    const email   = contactEmailInput.value.trim();
    const message = contactMessageInput ? contactMessageInput.value.trim() : '';
    // E-posta base64 koruması — kaynak kodda açık metin yok
    const senderEmail = atob('aGFrYW5ndXJlbGkwOTBAZ21haWwuY29t');
    const subject = encodeURIComponent('Portfolyo İletişim');
    const body    = encodeURIComponent(
        `Merhaba,\n\nAdım: ${name}\nE-postam: ${email}\n\nMesajım:\n${message}`
    );
    const mailtoUrl = `mailto:${senderEmail}?subject=${subject}&body=${body}`;

    if (contactStatus) {
        contactStatus.textContent = '';
        const prepSpan = document.createElement('span');
        prepSpan.className = 'success-msg';
        prepSpan.textContent = '✅ E-posta hazırlanıyor...';
        contactStatus.appendChild(prepSpan);
    }

    contactButton.disabled       = true;
    contactButton.style.opacity  = '0.5';
    contactButton.style.cursor   = 'not-allowed';
    window.setTimeout(() => {
        contactButton.disabled       = false;
        contactButton.style.opacity  = '';
        contactButton.style.cursor   = '';
    }, 5000);

    try {
        const mailLink = document.createElement('a');
        mailLink.href  = mailtoUrl;
        mailLink.style.display = 'none';
        document.body.appendChild(mailLink);
        mailLink.click();
        document.body.removeChild(mailLink);
    } catch (err) {
        console.error('Mailto açılamadı:', err);
    }

    window.setTimeout(() => {
        if (contactStatus) {
            // k4: e-posta encode koruması korundu; link DOM ile güvenli oluşturuldu
            const span = document.createElement('span');
            span.className = 'success-msg';
            span.textContent = '✅ Gönderildi! ';

            const link = document.createElement('a');
            link.href  = `mailto:${senderEmail}?subject=${subject}&body=${body}`;
            link.style.color = '#7ef0a8';
            link.textContent = senderEmail;

            contactStatus.textContent = '';
            contactStatus.appendChild(span);
            contactStatus.appendChild(link);
            contactStatus.insertAdjacentText('beforeend', ' adresine yazabilirsiniz.');
        }
    }, 1200);
}

verifyButton.addEventListener('click', () => {
    if (mathVerified) {
        completeVerification();
    } else {
        captchaStatus.textContent = 'Lütfen önce soruyu doğru cevaplayın.';
        mathAnswerInput.focus();
    }
});

contactButton.addEventListener('click', () => {
    const nameOk    = validateName();
    const emailOk   = validateEmail();
    const messageOk = validateMessage();

    if (!nameOk    && contactNameInput.value.trim().length === 0)
        setFieldState(nameField, nameHint, false, 'Lütfen adınızı girin.');
    if (!emailOk   && contactEmailInput.value.trim().length === 0)
        setFieldState(emailField, emailHint, false, 'Lütfen e-posta adresinizi girin.');
    if (!messageOk && contactMessageInput && contactMessageInput.value.trim().length === 0)
        setFieldState(messageField, messageHint, false, 'Lütfen mesajınızı girin.');

    if (nameOk && emailOk && messageOk) {
        openVerificationModal(contactButton);
    }
});

cancelButton.addEventListener('click', closeVerificationModal);

verificationModal.addEventListener('click', e => {
    if (e.target === verificationModal) closeVerificationModal();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && verificationModal.classList.contains('active')) {
        closeVerificationModal();
    }
});

// === BENTO KART TIKLAMALARI ===
document.querySelectorAll('.bento-img-wrap img').forEach(img => {
    img.style.cursor = 'zoom-in';
});

document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('click', e => {
        if (e.target.closest('.gallery-open-btn')) return;
        const galleryBtn = card.querySelector('.gallery-open-btn');
        if (galleryBtn) galleryBtn.click();
    });
});

// === GALERİ POPUP ===
(function () {
    const overlay  = document.getElementById('pgalleryOverlay');
    const track    = document.getElementById('pgalleryTrack');
    const titleEl  = document.getElementById('pgalleryTitle');
    const counter  = document.getElementById('pgalleryCounter');
    const btnClose = document.getElementById('pgalleryClose');
    const btnPrev  = document.getElementById('pgalleryPrev');
    const btnNext  = document.getElementById('pgalleryNext');

    if (!overlay) return;

    let images  = [];
    let current = 0;
    let galleryTriggerEl = null; // Focus dönüş noktası

    function showImage(idx) {
        current     = Math.max(0, Math.min(idx, images.length - 1));
        track.innerHTML = '';
        const img   = document.createElement('img');
        img.src     = images[current].src;
        img.alt     = images[current].alt;
        track.appendChild(img);
        counter.textContent    = `${current + 1} / ${images.length}`;
        btnPrev.disabled       = current === 0;
        btnNext.disabled       = current === images.length - 1;
    }

    function openGallery(galleryId, cardTitle, triggerEl) {
        const dataDiv = document.getElementById(`gallery-${galleryId}`);
        if (!dataDiv) return;
        images = Array.from(dataDiv.querySelectorAll('img'));
        if (images.length === 0) return;
        galleryTriggerEl        = triggerEl || document.activeElement;
        titleEl.textContent     = cardTitle ? `${cardTitle} — Ekran Görüntüleri` : 'Ekran Görüntüleri';
        showImage(0);
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        overlay.removeAttribute('inert');
        btnClose.focus();
    }

    function closeGallery() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('inert', '');
        images = [];
        if (galleryTriggerEl) galleryTriggerEl.focus();
    }

    // Mobil kaydırma (Swipe) desteği
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (diff > 40) {
            showImage(current + 1);
        } else if (diff < -40) {
            showImage(current - 1);
        }
    }, { passive: true });

    // Focus trap
    overlay.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        const focusable = Array.from(overlay.querySelectorAll(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
    });

    document.querySelectorAll('.gallery-open-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id    = btn.dataset.gallery;
            const card  = btn.closest('.bento-card');
            const title = card ? card.querySelector('h3')?.textContent : '';
            openGallery(id, title, btn);
        });
    });

    btnClose.addEventListener('click', closeGallery);
    btnPrev.addEventListener('click',  () => showImage(current - 1));
    btnNext.addEventListener('click',  () => showImage(current + 1));

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeGallery();
    });

    document.addEventListener('keydown', e => {
        if (!overlay.classList.contains('open')) return;
        if (e.key === 'Escape')     closeGallery();
        if (e.key === 'ArrowLeft')  showImage(current - 1);
        if (e.key === 'ArrowRight') showImage(current + 1);
    });
})();
