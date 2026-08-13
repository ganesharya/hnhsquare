// HNHSquare - Main JavaScript
// Navigation, animations, testimonials, modal, UI enhancements

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initPageLoad();
        initNavigation();
        initScrollUI();
        initTestimonials();
        initScrollEffects();
        initModal();
        initContactForm();
        initIntersectionAnimations();
        initRippleEffect();
        initMagneticButtons();
        initStaggerAnimations();
    }

    // Page load animation
    function initPageLoad() {
        document.body.classList.add('page-loading');
        requestAnimationFrame(() => {
            document.body.classList.remove('page-loading');
            document.body.classList.add('page-loaded');
        });
    }

    // Navigation with overlay and scroll state
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const navbar = document.getElementById('navbar');
        let overlay = document.querySelector('.nav-overlay');

        // Create overlay if not exists
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
        }

        function closeMenu() {
            navMenu?.classList.remove('active');
            overlay?.classList.remove('active');
            navToggle?.setAttribute('aria-expanded', 'false');
        }

        function openMenu() {
            navMenu?.classList.add('active');
            overlay?.classList.add('active');
            navToggle?.setAttribute('aria-expanded', 'true');
        }

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isOpen = navMenu.classList.contains('active');
                isOpen ? closeMenu() : openMenu();
            });

            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMenu);
            });

            overlay.addEventListener('click', closeMenu);
        }

        // Navbar scroll state with class toggle
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 100) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // Scroll progress bar + back-to-top
    function initScrollUI() {
        let progressBar = document.querySelector('.scroll-progress');
        let backToTop = document.querySelector('.back-to-top');

        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            document.body.appendChild(progressBar);
        }

        if (!backToTop) {
            backToTop = document.createElement('button');
            backToTop.className = 'back-to-top';
            backToTop.setAttribute('aria-label', 'Back to top');
            backToTop.innerHTML = '↑';
            document.body.appendChild(backToTop);
        }

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset;
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                    progressBar.style.width = progress + '%';

                    if (scrollTop > 600) {
                        backToTop.classList.add('visible');
                    } else {
                        backToTop.classList.remove('visible');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // Testimonials Slider
    function initTestimonials() {
        const slider = document.getElementById('testimonialsSlider');
        const dotsContainer = document.getElementById('testimonialDots');
        if (!slider || !dotsContainer) return;

        const cards = slider.querySelectorAll('.testimonial-card');
        if (cards.length === 0) return;
        let current = 0;

        cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        function goToSlide(index) {
            cards.forEach((card, i) => {
                card.classList.toggle('active', i === index);
            });
            dotsContainer.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            current = index;
        }

        const interval = setInterval(() => {
            if (!document.hidden) {
                goToSlide((current + 1) % cards.length);
            }
        }, 5000);

        // Pause on hover
        slider.addEventListener('mouseenter', () => clearInterval(interval));
    }

    // Scroll Effects for cards
    function initScrollEffects() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

        document.querySelectorAll('.feature-card, .category-card, .product-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Intersection Observer for animation classes
    function initIntersectionAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-scale, .observe-anim').forEach(el => {
            observer.observe(el);
        });
    }

    // Modal
    function initModal() {
        const modal = document.getElementById('quickViewModal');
        const closeBtn = document.getElementById('modalClose');
        if (!modal) return;

        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.classList.remove('active');
        });
    }

    // Contact Form
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Thank you! We will get back to you within 24 hours.');
            form.reset();
        });
    }

    // Ripple effect on buttons
    function initRippleEffect() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // Magnetic button hover effect
    function initMagneticButtons() {
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (isTouch) return;

        document.querySelectorAll('.btn, .feature-card, .category-card').forEach(el => {
            el.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                this.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px)`;
            });
            el.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    // Stagger children animations
    function initStaggerAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.stagger-children').forEach(el => {
            observer.observe(el);
        });
    }

    // Toast
    window.showToast = function(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };
})();
