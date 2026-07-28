/* === RENKLER === */
:root {
    --bg-color: #121212;
    --surface-color: #1e1e1e;
    --text-primary: #e0e0e0;
    --text-secondary: #a0a0a0;
    --accent-color: #00adb5;
    --bg-gradient-start: rgba(6, 8, 15, 0.72);
    --bg-gradient-end: rgba(8, 12, 20, 0.78);
    --nav-bg: rgba(18, 18, 18, 0.8);
    --info-panel-bg: rgba(30, 30, 30, 0.9);
    --color-success: #2ecc71;
    --color-success-bg: rgba(46, 204, 113, 0.05);
    --color-success-ring: rgba(46, 204, 113, 0.12);
    --color-error: #e74c3c;
    --color-error-bg: rgba(231, 76, 60, 0.05);
    --color-error-ring: rgba(231, 76, 60, 0.12);
    --color-warning: #f0c830;
    --color-warning-bg: rgba(255, 200, 50, 0.10);
    --color-warning-border: rgba(255, 200, 50, 0.30);
    --card-max-width: min(95vw, 980px);
}

/* === SCROLLBAR === */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: var(--bg-color);
}

::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--accent-color);
}

/* === RESET === */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
}

button:focus-visible,
a:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: 3px;
    border-radius: 4px;
}

html {
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
}

body {
    min-height: 100vh;
    background:
        linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end)),
        url("resimler/arkaplan.png") center/cover no-repeat fixed;
    color: var(--text-primary);
    overflow-x: hidden;
}

/* === SCROLL SNAP === */
.snap-container {
    min-height: 100vh;
    background: transparent;
}

.snap-page {
    scroll-snap-align: start;
    scroll-snap-stop: always;
}

/* === NAV === */
.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    padding: 20px 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--nav-bg);
    backdrop-filter: blur(15px);
    z-index: 1000;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

.logo {
    font-weight: bold;
    font-size: 1.5rem;
    color: var(--text-primary);
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 30px;
}

.nav-links a {
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    position: relative;
    padding-bottom: 2px;
    transition: color 0.3s ease;
}

/* Sliding underline */
.nav-links a::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent-color);
    border-radius: 2px;
    transition: width 0.3s ease;
}

.nav-links a:hover,
.nav-links a.active {
    color: var(--accent-color);
}

.nav-links a:hover::after,
.nav-links a.active::after {
    width: 100%;
}

/* === HAMBURGER === */
.hamburger {
    display: none;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    line-height: 0;
}

.hamburger:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: 4px;
    border-radius: 4px;
}

.hamburger .bar {
    display: block;
    width: 25px;
    height: 3px;
    margin: 5px auto;
    background-color: var(--text-primary);
    transition: all 0.3s ease-in-out;
    border-radius: 3px;
}

/* === BÖLÜMLER === */
.fullscreen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 90px 20px 30px 20px;
}

.section-title {
    font-size: 2.5rem;
    margin-bottom: 20px;
    background: var(--surface-color);
    padding: 10px 40px;
    border-radius: 50px;
    border: 1px solid #333;
    display: inline-block;
    max-width: min(90vw, 600px);
    word-break: break-word;
    text-align: center;
}

.section-intro {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 28px;
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.7;
}

.info-panel {
    background: var(--info-panel-bg);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 18px 24px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
}

.hero-panel {
    width: var(--card-max-width);
    max-width: var(--card-max-width);
    text-align: center;
    margin: 0 auto;
}

.hero-panel h1 {
    margin-bottom: 8px;
    font-size: clamp(2rem, 4vw, 3rem);
}

.hero-panel p {
    color: var(--text-secondary);
    font-size: 1.05rem;
    line-height: 1.7;
}

.scroll-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-top: 18px;
    color: var(--text-secondary);
    font-size: 0.78rem;
    letter-spacing: 0.05em;
    opacity: 0.8;
}

.arrow-down {
    width: 10px;
    height: 10px;
    border-right: 2px solid var(--accent-color);
    border-bottom: 2px solid var(--accent-color);
    transform: rotate(45deg);
    animation: scrollBounce 1.8s infinite;
}

@keyframes scrollBounce {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0) rotate(45deg);
    }

    40% {
        transform: translateY(6px) rotate(45deg);
    }

    60% {
        transform: translateY(3px) rotate(45deg);
    }
}

/* === SLIDER === */
.slider-container {
    width: var(--card-max-width);
    max-width: var(--card-max-width);
    height: clamp(360px, 58vh, 660px);
    position: relative;
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    margin-bottom: 30px;
    background: #000;
}

.slide {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    position: absolute;
    opacity: 0;
    transition: opacity 1s ease-in-out;
}

.slide.active {
    opacity: 1;
}

/* === BENTO GRID === */
.bento-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: var(--card-max-width);
    max-width: var(--card-max-width);
    margin: 0 auto;
}

.bento-card {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    min-height: 180px;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: var(--surface-color);
    cursor: pointer;
    transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1),
        box-shadow 0.35s cubic-bezier(0.25, 0.8, 0.25, 1),
        border-color 0.35s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.bento-large {
    box-shadow: inset 4px 0 0 var(--accent-color), 0 6px 28px rgba(0, 173, 181, 0.14), 0 2px 8px rgba(0, 0, 0, 0.3);
}

.bento-small {
    flex: 1;
}

.bento-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 38px rgba(0, 173, 181, 0.22), 0 2px 8px rgba(0, 0, 0, 0.4);
    border-color: var(--accent-color);
}

.bento-img-wrap {
    position: relative;
    width: 220px;
    flex-shrink: 0;
    overflow: hidden;
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-color);
}

.bento-large .bento-img-wrap {
    width: 280px;
}

.bento-small .bento-img-wrap {
    width: 220px;
}

.bento-img-wrap img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    transition: transform 0.45s ease;
}

.bento-card:hover .bento-img-wrap img {
    transform: scale(1.06);
}

/* Resimden yazıya geçiş */
.bento-overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 25px;
    background: linear-gradient(to right, transparent, var(--surface-color));
    pointer-events: none;
}

.bento-body {
    flex: 1;
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    background: var(--surface-color);
}

.bento-large .bento-body {
    padding: 22px 28px;
}

.bento-body h3 {
    font-size: 1rem;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.35;
}

.bento-large .bento-body h3 {
    font-size: 1.2rem;
}

.bento-body p {
    font-size: 0.83rem;
    color: var(--text-secondary);
    line-height: 1.55;
    margin: 0;
}

/* === ETİKETLER === */
.bento-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 6px;
}

.tag {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 600;
    background: rgba(0, 173, 181, 0.12);
    color: var(--accent-color);
    border: 1px solid rgba(0, 173, 181, 0.25);
    letter-spacing: 0.02em;
}

.tag-live {
    background: rgba(0, 200, 120, 0.12);
    border-color: rgba(0, 200, 120, 0.35);
    color: var(--color-success);
}

.tag-soon {
    background: var(--color-warning-bg);
    border-color: var(--color-warning-border);
    color: var(--color-warning);
}

.tag-wip {
    background: rgba(100, 180, 255, 0.12);
    border-color: rgba(100, 180, 255, 0.35);
    color: #64b4ff;
}

.tag-inactive {
    background: rgba(160, 160, 160, 0.08);
    border-color: rgba(160, 160, 160, 0.20);
    color: var(--text-secondary);
    text-decoration: line-through;
    opacity: 0.75;
}

/* === HAKKINDA === */
.about-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.skills-box {
    background: var(--surface-color);
    border: 1px solid #333;
    border-radius: 28px;
    padding: 22px 28px 24px;
    margin-top: 12px;
    width: var(--card-max-width);
    max-width: var(--card-max-width);
    text-align: center;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}

.skills-box-title {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin: 0 0 14px;
}

.skills-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
}

.skill-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 173, 181, 0.07);
    border: 1px solid rgba(0, 173, 181, 0.18);
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: default;
    transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease;
}

.skill-chip:hover {
    transform: translateY(-3px);
    background: rgba(0, 173, 181, 0.15);
    border-color: var(--accent-color);
}

.skill-chip span {
    font-size: 1rem;
    line-height: 1;
}

/* Projeler & Hakkında intro balonu */
.project-intro-box,
.about-intro-box {
    background: rgba(0, 173, 181, 0.06);
    border: 1px solid rgba(0, 173, 181, 0.20);
    border-radius: 28px;
    padding: 18px 28px;
    width: var(--card-max-width);
    max-width: var(--card-max-width);
    text-align: center;
    margin: 0 auto 20px;
    box-shadow: 0 4px 16px rgba(0, 173, 181, 0.08);
}

.project-intro-box p,
.about-intro-box p {
    color: var(--text-primary);
    font-size: 1.05rem;
    line-height: 1.65;
    font-weight: 500;
}

/* === KUTU ORTAK === */
.about-oval-box,
.contact-box {
    background: var(--surface-color);
    padding: clamp(24px, 4vw, 44px);
    border-radius: 40px;
    width: var(--card-max-width);
    max-width: var(--card-max-width);
    margin: 0 auto;
    text-align: center;
    border: 1px solid #333;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.about-oval-box p,
.contact-box p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

/* === İLETİŞİM SVG === */
.contact-illustration {
    width: 110px;
    height: 110px;
    margin: 24px auto 10px;
    color: var(--accent-color);
}

.contact-illustration svg {
    width: 100%;
    height: 100%;
    display: block;
}

/* === BUTON === */
.oval-btn {
    display: inline-block;
    margin-top: 20px;
    padding: 15px 40px;
    background: var(--accent-color);
    color: #121212;
    text-decoration: none;
    border: none;
    border-radius: 50px;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s ease,
        transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
        box-shadow 0.3s ease;
    box-shadow: 0 4px 14px rgba(0, 173, 181, 0.2);
}

.oval-btn:hover {
    background: #008b92;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 173, 181, 0.40);
}

.oval-btn:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 173, 181, 0.25);
}

/* === FORM === */
.contact-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    max-width: min(100%, 500px);
    margin: 0 auto;
}

.form-field {
    text-align: left;
}

.form-field label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 6px;
    letter-spacing: 0.03em;
}

.form-field input {
    width: 100%;
    padding: 12px 18px;
    border-radius: 50px;
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
}

.form-field input::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
}

.form-field input:focus {
    border-color: var(--accent-color);
    background: rgba(0, 173, 181, 0.05);
    box-shadow: 0 0 15px rgba(0, 173, 181, 0.25);
}

/* Mesaj alanı */
.form-field textarea {
    width: 100%;
    padding: 12px 18px;
    border-radius: 16px;
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
}

.form-field textarea::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
}

.form-field textarea:focus {
    border-color: var(--accent-color);
    background: rgba(0, 173, 181, 0.05);
    box-shadow: 0 0 15px rgba(0, 173, 181, 0.25);
}

.form-field.valid textarea {
    border-color: var(--color-success);
    background: var(--color-success-bg);
    box-shadow: 0 0 0 3px var(--color-success-ring);
}

.form-field.invalid textarea {
    border-color: var(--color-error);
    background: var(--color-error-bg);
    box-shadow: 0 0 0 3px var(--color-error-ring);
}

.form-field.valid input {
    border-color: var(--color-success);
    background: var(--color-success-bg);
    box-shadow: 0 0 0 3px var(--color-success-ring);
}

.form-field.invalid input {
    border-color: var(--color-error);
    background: var(--color-error-bg);
    box-shadow: 0 0 0 3px var(--color-error-ring);
}

.field-hint {
    display: block;
    font-size: 0.75rem;
    margin-top: 5px;
    padding-left: 16px;
    min-height: 1.1em;
    transition: color 0.3s ease;
}

.form-field.valid .field-hint {
    color: var(--color-success);
}

.form-field.invalid .field-hint {
    color: var(--color-error);
}

.contact-status {
    margin-top: 14px;
    min-height: 1.4em;
    color: var(--accent-color);
    font-weight: 600;
    font-size: 0.95rem;
}

/* === DOĞRULAMA MODALI === */
.verification-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 2000;
}

.verification-modal.active {
    display: flex;
}

.verification-card {
    background: var(--surface-color);
    border: 1px solid #333;
    border-radius: 24px;
    padding: 28px;
    width: min(90vw, 360px);
    text-align: center;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
}

.verification-card h3 {
    margin-bottom: 10px;
}

.challenge-panel {
    margin: 16px 0 8px;
}

.challenge-panel.hidden {
    display: none;
}

/* Matematik captcha */
.math-stage {
    margin: 18px 0 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
}

.math-question-display {
    font-size: 2rem;
    font-weight: 800;
    color: var(--accent-color);
    letter-spacing: 0.04em;
    line-height: 1;
}

.math-input-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.math-input {
    width: 90px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 700;
    text-align: center;
    outline: none;
    font-family: inherit;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    -moz-appearance: textfield;
}

.math-input::-webkit-outer-spin-button,
.math-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.math-input:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(0, 173, 181, 0.15);
}

.math-input.correct {
    border-color: var(--color-success);
    box-shadow: 0 0 0 3px var(--color-success-ring);
}

.math-input.wrong {
    border-color: var(--color-error);
    box-shadow: 0 0 0 3px var(--color-error-ring);
    animation: shake 0.35s ease;
}

.math-icon {
    font-size: 1.4rem;
    width: 28px;
    transition: color 0.25s;
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
    }

    75% {
        transform: translateX(5px);
    }
}

.captcha-status {
    min-height: 22px;
    color: var(--color-warning);
    font-size: 0.95rem;
    margin: 10px 0 8px;
}

.verification-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 8px;
}

.verify-btn,
.cancel-btn {
    border: none;
    border-radius: 999px;
    padding: 10px 16px;
    cursor: pointer;
    font-weight: 600;
    font-family: inherit;
    font-size: 0.9rem;
}

.verify-btn {
    background: var(--accent-color);
    color: #121212;
}

.cancel-btn {
    background: #444;
    color: var(--text-primary);
}

/* === SCROLL ANİMASYON === */
.scroll-anim {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.scroll-anim.show {
    opacity: 1;
    transform: translateY(0);
}

/* === MOBİL === */
@media (max-width: 768px) {
    html {
        scroll-snap-type: y proximity;
    }

    .fullscreen {
        padding: 85px 14px 24px 14px;
    }

    .about-oval-box,
    .contact-box {
        padding: 24px 16px;
    }

    .project-intro-box,
    .about-intro-box {
        padding: 14px 16px;
        margin-bottom: 14px;
    }

    .about-oval-box p {
        font-size: 0.95rem;
        line-height: 1.6;
    }

    .hamburger {
        display: block;
    }

    .hamburger.active .bar:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active .bar:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }

    .hamburger.active .bar:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }

    /* 1. SLIDER RESİMLERİNİ MOBİLDE SIGDIRMA (KIRPILMAYI ÖNLER) */
    .slide {
        object-fit: contain;
    }

    .nav-links {
        position: fixed;
        left: -100%;
        top: 70px;
        flex-direction: column;
        background: var(--surface-color);
        width: 100%;
        text-align: center;
        transition: 0.3s;
        box-shadow: 0 10px 10px rgba(0, 0, 0, 0.5);
        border-bottom-left-radius: 20px;
        border-bottom-right-radius: 20px;
        padding: 20px 0;
    }

    .nav-links.active {
        left: 0;
    }

    .bento-grid {
        max-width: 100%;
        gap: 12px;
    }

    .bento-card {
        flex-direction: column;
    }

    /* 2. PROJE KART RESİMLERİNİ MOBİLDE YATAYDA TAM YAYMA */
    .bento-img-wrap,
    .bento-large .bento-img-wrap {
        width: 100%;
        height: 200px;
        flex-shrink: 0;
        padding: 0;
    }

    .bento-img-wrap img {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
        object-position: center;
    }

    /* Alt kenar fade */
    .bento-overlay {
        top: auto;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 28px;
        background: linear-gradient(to bottom, transparent, var(--surface-color));
    }

    .bento-large {
        box-shadow: inset 0 4px 0 var(--accent-color), 0 6px 28px rgba(0, 173, 181, 0.14);
    }

    .section-title {
        font-size: 1.7rem;
        padding: 8px 24px;
    }

    .slider-container {
        height: clamp(250px, 44vh, 420px);
    }

    .pgallery-box {
        width: 95vw;
        padding: 20px 14px 14px;
    }

    .pgallery-track {
        height: clamp(340px, 58vh, 520px);
    }

    #projeler,
    #hakkinda,
    #iletisim {
        scroll-snap-align: none;
        min-height: auto;
        height: auto;
        padding-bottom: 40px;
    }
}

/* === GALERİ BUTONU === */
.gallery-open-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 8px;
    padding: 4px 13px;
    border: 1px solid rgba(0, 173, 181, 0.30);
    border-radius: 999px;
    font-size: 0.73rem;
    font-weight: 600;
    color: var(--accent-color);
    background: rgba(0, 173, 181, 0.05);
    cursor: pointer;
    letter-spacing: 0.02em;
    font-family: inherit;
    transition: background 0.22s ease, color 0.22s ease,
        transform 0.22s ease, border-color 0.22s ease;
}

.gallery-open-btn:hover {
    background: var(--accent-color);
    color: #121212;
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(0, 173, 181, 0.25);
}

/* Gizli veri tutucu */
.gallery-data {
    display: none;
}

/* === GALERİ POPUP === */
.pgallery-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    z-index: 4000;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(6px);
}

.pgallery-overlay.open {
    display: flex;
    animation: pgFadeIn 0.25s ease;
}

@keyframes pgFadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.pgallery-box {
    position: relative;
    background: var(--surface-color);
    border: 1px solid #333;
    border-radius: 24px;
    padding: 24px 20px 18px;
    width: min(92vw, 440px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: pgSlideUp 0.28s cubic-bezier(0.34, 1.36, 0.64, 1);
}

@keyframes pgSlideUp {
    from {
        transform: translateY(30px) scale(0.96);
        opacity: 0;
    }

    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}

.pgallery-close {
    position: absolute;
    top: 12px;
    right: 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid #444;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    transition: background 0.2s, color 0.2s;
}

.pgallery-close:hover {
    background: var(--color-error);
    color: #fff;
    border-color: var(--color-error);
}

.pgallery-title {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
}

.pgallery-track {
    width: 100%;
    height: clamp(380px, 64vh, 640px);
    border-radius: 16px;
    overflow: hidden;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pgallery-track img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    animation: pgImgIn 0.22s ease;
}

@keyframes pgImgIn {
    from {
        opacity: 0;
        transform: scale(0.97);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.pgallery-nav {
    display: flex;
    align-items: center;
    gap: 20px;
}

.pgallery-arrow {
    background: rgba(0, 173, 181, 0.08);
    border: 1px solid rgba(0, 173, 181, 0.25);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
    color: var(--accent-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    transition: background 0.2s, transform 0.2s;
}

.pgallery-arrow:hover {
    background: var(--accent-color);
    color: #121212;
    transform: scale(1.1);
}

.pgallery-arrow:disabled {
    opacity: 0.3;
    cursor: default;
    transform: none;
}

.pgallery-counter {
    font-size: 0.82rem;
    color: var(--text-secondary);
    font-weight: 600;
    min-width: 40px;
    text-align: center;
}

/* === BAŞARI ANİMASYONU === */
@keyframes successPop {
    0% {
        transform: scale(0.7);
        opacity: 0;
    }

    60% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.success-msg {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    animation: successPop 0.45s cubic-bezier(0.34, 1.36, 0.64, 1) forwards;
    color: var(--color-success);
    font-weight: 700;
}