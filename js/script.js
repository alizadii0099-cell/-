// ============================================
// VIDEO HERO SECTION (Autoplay Safe)
// ============================================

const heroVideo = document.getElementById('heroVideo');

if (heroVideo) {
    heroVideo.muted = true; // Ensure autoplay works on all browsers
    heroVideo.loop = true;  // Optional: loop video
    heroVideo.addEventListener('loadedmetadata', () => {
        heroVideo.play().catch(err => console.log('Video autoplay failed:', err));
    });

    window.addEventListener('load', () => heroVideo.load());
    heroVideo.addEventListener('error', e => console.error('Video loading error:', e));
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================

const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        const isActive = mobileMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open', isActive);
    });

    // Close on link click (event delegation)
    mobileMenu.addEventListener('click', e => {
        if (e.target.classList.contains('mobile-nav-link')) {
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Close on backdrop click
    document.addEventListener('click', e => {
        if (document.body.classList.contains('menu-open') &&
            !mobileMenu.contains(e.target) &&
            !mobileMenuButton.contains(e.target)) {
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

// ============================================
// OWNER MODAL (Accessible + Focus Trap)
// ============================================

const ownerModal = document.getElementById('owner-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const closeModalBtn = document.getElementById('close-modal');
const modalTriggers = [
    document.getElementById('owner-link'),
    document.getElementById('owner-link-mobile'),
    document.getElementById('owner-link-footer')
].filter(Boolean);

const openModal = (e) => {
    e.preventDefault();
    if (!ownerModal) return;

    ownerModal.classList.remove('hidden');
    ownerModal.setAttribute('aria-hidden', 'false');
    ownerModal.setAttribute('aria-modal', 'true');
    document.body.style.overflow = 'hidden';

    // Focus trap
    const focusable = ownerModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();

    const handleFocus = (e) => {
        if (!ownerModal.contains(e.target)) focusable[0].focus();
    };
    document.addEventListener('focus', handleFocus, true);
    ownerModal._removeFocusTrap = () => document.removeEventListener('focus', handleFocus, true);
};

const closeModal = () => {
    if (!ownerModal) return;

    ownerModal.classList.add('hidden');
    ownerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';

    // Remove focus trap
    if (ownerModal._removeFocusTrap) ownerModal._removeFocusTrap();
};

modalTriggers.forEach(trigger => trigger.addEventListener('click', openModal));
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ownerModal && !ownerModal.classList.contains('hidden')) closeModal();
});

// ============================================
// SCROLL ANIMATIONS (IntersectionObserver + Cleanup)
// ============================================

const animatedElements = document.querySelectorAll('.fade-in-up, .scale-in, .fade-in, .slide-in-left, .slide-in-right');
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target); // Cleanup for performance
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

animatedElements.forEach(el => observer.observe(el));

// Cards stagger
const cards = document.querySelectorAll('.feature-card-advanced, .command-card');
cards.forEach((card, i) => card.style.transitionDelay = `${i * 0.08}s`);

// ============================================
// NAVBAR SCROLL EFFECT (Debounced)
// ============================================

const header = document.getElementById('header');

const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 100);
};

let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(onScroll, 50);
});

// ============================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;

        const offset = header ? header.offsetHeight : 0;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });

        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
});

// ============================================
// PAGE LOAD ANIMATIONS (Optional)
// ============================================

window.addEventListener('load', () => {
    animatedElements.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            setTimeout(() => el.classList.add('is-visible'), i * 100);
        }
    });
});

// ============================================
// DYNAMIC YEAR IN FOOTER
// ============================================

document.querySelectorAll('.footer-year').forEach(el => el.textContent = new Date().getFullYear());

// ============================================
// CONSOLE MESSAGE
// ============================================

console.log('%c🚀 KIRA-MD Bot Platform', 'color: #ec407a; font-size: 24px; font-weight: bold;');
console.log('%cThe best free WhatsApp bot - No server required', 'color: #7b1fa2; font-size: 16px;');
console.log('%cDeveloped by Sumon Roy', 'color: #ff6b9d; font-size: 14px;');
