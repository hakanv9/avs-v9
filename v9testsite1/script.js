// 1. SLIDER (Resim Geçiş Sistemi)
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function nextSlide() {
    // Sadece resim varsa çalışsın (hata vermemesi için güvenlik kontrolü)
    if(slides.length > 0) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
}
setInterval(nextSlide, 10000); // 10 saniye

// 2. MOBİL HAMBURGER MENÜ
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
});

// Mobilde menüden bir linke tıklayınca menüyü otomatik kapat
document.querySelectorAll(".nav-links a").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
}));

// 3. AŞAĞI KAYDIRMA ANİMASYONLARI
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-anim').forEach((el) => {
    observer.observe(el);
});

// 4. İLETİŞİM BUTONU - GÜVENLİK DOĞRULAMASI
const contactButton = document.getElementById('contactButton');
const verificationModal = document.getElementById('verificationModal');
const verifyButton = document.getElementById('verifyButton');
const contactStatus = document.getElementById('contactStatus');
const cancelButton = document.getElementById('cancelButton');
const captchaTrack = document.getElementById('captchaTrack');
const captchaFill = document.getElementById('captchaFill');
const captchaThumb = document.getElementById('captchaThumb');
const captchaStatus = document.getElementById('captchaStatus');
const sliderChallenge = document.getElementById('sliderChallenge');
const verificationIntro = document.getElementById('verificationIntro');

const successThreshold = 0.72;
let dragging = false;
let sliderInteracted = false;
let currentRatio = 0;
let activeChallengeType = 'slider';

function resetSlider() {
    currentRatio = 0;
    captchaFill.style.width = '0%';
    captchaThumb.style.left = '0%';
    captchaThumb.classList.remove('success');
    captchaStatus.textContent = 'Sürükleyip bırakın.';
}

function openVerificationModal() {
    verificationModal.classList.add('active');
    verificationModal.setAttribute('aria-hidden', 'false');

    sliderInteracted = false;
    activeChallengeType = 'slider';
    sliderChallenge.classList.remove('hidden');
    verificationIntro.textContent = 'Kaydırıcıyı güvenli bölgeye taşıyın.';
    resetSlider();
}

function closeVerificationModal() {
    verificationModal.classList.remove('active');
    verificationModal.setAttribute('aria-hidden', 'true');
    sliderInteracted = false;
}

function completeVerification() {
    closeVerificationModal();

    const email = 'hakangureli090@gmail.com';
    const subject = encodeURIComponent('Portfolyo İletişim');
    const body = encodeURIComponent('Merhaba, projeleriniz hakkında detay almak istiyorum.');
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    if (contactStatus) {
        contactStatus.textContent = 'E-posta istemcisi açılıyor...';
    }

    try {
        const mailLink = document.createElement('a');
        mailLink.href = mailtoUrl;
        mailLink.style.display = 'none';
        document.body.appendChild(mailLink);
        mailLink.click();
        document.body.removeChild(mailLink);
    } catch (error) {
        console.error('Mailto bağlantısı açılamadı:', error);
    }

    window.setTimeout(() => {
        if (contactStatus) {
            contactStatus.innerHTML = `E-posta istemcisi açılmadıysa lütfen <a href="mailto:${email}?subject=${subject}&body=${body}" style="color: #7ef0a8;">${email}</a> adresine yazın.`;
        }
    }, 1200);
}

function updateSlider(clientX) {
    const rect = captchaTrack.getBoundingClientRect();
    let ratio = (clientX - rect.left) / rect.width;
    ratio = Math.min(1, Math.max(0, ratio));
    currentRatio = ratio;
    captchaFill.style.width = `${ratio * 100}%`;
    captchaThumb.style.left = `${ratio * 100}%`;

    if (ratio >= successThreshold) {
        captchaThumb.classList.add('success');
        captchaStatus.textContent = 'Güvenli alan doğrulandı.';
    } else {
        captchaThumb.classList.remove('success');
        captchaStatus.textContent = 'Sürükleyip güvenli bölgeye taşıyın.';
    }
}

contactButton.addEventListener('click', openVerificationModal);
cancelButton.addEventListener('click', closeVerificationModal);

captchaThumb.addEventListener('pointerdown', (event) => {
    dragging = true;
    sliderInteracted = true;
    captchaThumb.setPointerCapture(event.pointerId);
    updateSlider(event.clientX);
});

captchaTrack.addEventListener('pointerdown', (event) => {
    if (event.target === captchaTrack) {
        dragging = true;
        sliderInteracted = true;
        updateSlider(event.clientX);
    }
});

document.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    updateSlider(event.clientX);
});

document.addEventListener('pointerup', () => {
    if (!dragging) {
        return;
    }

    dragging = false;

    if (activeChallengeType === 'slider' && sliderInteracted && currentRatio >= successThreshold) {
        completeVerification();
    } else if (activeChallengeType === 'slider' && sliderInteracted) {
        resetSlider();
    }

    sliderInteracted = false;
});

verifyButton.addEventListener('click', () => {
    if (currentRatio >= successThreshold) {
        completeVerification();
    } else {
        captchaStatus.textContent = 'Lütfen kaydırıcıyı yeterince ileri taşıyın.';
    }
});

verificationModal.addEventListener('click', (event) => {
    if (event.target === verificationModal) {
        closeVerificationModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && verificationModal.classList.contains('active')) {
        closeVerificationModal();
    }
});