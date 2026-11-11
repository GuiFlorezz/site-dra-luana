const carousel = document.querySelector('[data-carousel]');
const previousButton = document.querySelector('[data-carousel-prev]');
const nextButton = document.querySelector('[data-carousel-next]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (carousel && previousButton && nextButton) {
    const getStep = () => {
        const card = carousel.querySelector('.treatment-card');
        if (!card) return carousel.clientWidth;

        const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0;
        return card.getBoundingClientRect().width + gap;
    };

    const updateButtons = () => {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        previousButton.disabled = carousel.scrollLeft <= 1;
        nextButton.disabled = carousel.scrollLeft >= maxScroll - 1;
    };

    previousButton.addEventListener('click', () => {
        carousel.scrollBy({ left: -getStep(), behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    });

    nextButton.addEventListener('click', () => {
        carousel.scrollBy({ left: getStep(), behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    });

    carousel.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
}

const treatmentDialog = document.querySelector('#treatment-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogDescription = document.querySelector('#dialog-description');
const dialogCloseButton = document.querySelector('[data-dialog-close]');
const whatsappLink = document.querySelector('[data-whatsapp-link]');
let activeTreatmentCard = null;

const openTreatmentDialog = (card) => {
    if (!treatmentDialog || typeof treatmentDialog.showModal !== 'function') return;

    const treatmentName = card.querySelector('h3')?.textContent.trim();
    if (!treatmentName) return;

    activeTreatmentCard = card;
    dialogTitle.textContent = treatmentName;
    dialogDescription.textContent = card.dataset.treatmentDescription;

    const message = `Olá, Dra. Luana! Tenho interesse em ${treatmentName}. Gostaria de saber mais e agendar uma avaliação.`;
    whatsappLink.href = `https://wa.me/5551999296778?text=${encodeURIComponent(message)}`;

    document.documentElement.classList.add('dialog-open');
    treatmentDialog.showModal();
    dialogCloseButton.focus();
};

document.querySelectorAll('[data-treatment-open]').forEach((button) => {
    button.addEventListener('click', () => {
        const card = button.closest('.treatment-card');
        if (card) openTreatmentDialog(card);
    });
});

if (treatmentDialog) {
    dialogCloseButton?.addEventListener('click', () => treatmentDialog.close());
    treatmentDialog.addEventListener('click', (event) => {
        if (event.target === treatmentDialog) treatmentDialog.close();
    });
    treatmentDialog.addEventListener('close', () => {
        document.documentElement.classList.remove('dialog-open');
        activeTreatmentCard?.focus();
    });
}

const year = document.querySelector('[data-current-year]');
if (year) year.textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll('[data-reveal]');
const loader = document.querySelector('.site-loader');

const startRevealAnimations = () => {
    if (prefersReducedMotion.matches || !('IntersectionObserver' in window) || !revealItems.length) return;

    document.documentElement.classList.add('reveal-ready');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
};

const waitForHeroImage = () => new Promise((resolve) => {
    const heroImage = document.querySelector('.hero-visual img');
    if (!heroImage || heroImage.complete) {
        resolve();
        return;
    }

    const finish = () => {
        clearTimeout(timeoutId);
        resolve();
    };

    const timeoutId = setTimeout(finish, 1400);
    heroImage.addEventListener('load', finish, { once: true });
    heroImage.addEventListener('error', finish, { once: true });
});

const minimumLoaderTime = new Promise((resolve) => {
    setTimeout(resolve, prefersReducedMotion.matches ? 250 : 850);
});

Promise.all([minimumLoaderTime, waitForHeroImage()]).then(() => {
    startRevealAnimations();

    if (!loader) {
        document.documentElement.classList.remove('loader-active');
        return;
    }

    loader.setAttribute('aria-hidden', 'true');
    loader.classList.add('is-hidden');
    document.documentElement.classList.remove('loader-active');

    const removeLoader = () => {
        loader.hidden = true;
    };

    loader.addEventListener('transitionend', removeLoader, { once: true });
    setTimeout(removeLoader, prefersReducedMotion.matches ? 50 : 650);
});
