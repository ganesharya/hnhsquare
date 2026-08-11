// HNHSquare - Main JavaScript
// Navigation, animations, testimonials, modal

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initNavigation();
        initTestimonials();
        initScrollEffects();
        initModal();
        initContactForm();
        initIntersectionAnimations();
    }

    // Navigation
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const navbar = document.getElementById('navbar');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                const isOpen = navMenu.classList.contains('active');
                navToggle.setAttribute('aria-expanded', isOpen);
            });

            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 100) {
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // Testimonials Slider
    function initTestimonials() {
        const slider = document.getElementById('testimonialsSlider');
        const dotsContainer = document.getElementById('testimonialDots');
        if (!slider || !dotsContainer) return;

        const cards = slider.querySelectorAll('.testimonial-card');
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

        setInterval(() => {
            goToSlide((current + 1) % cards.length);
        }, 5000);
    }

    // Scroll Effects
    function initScrollEffects() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

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
        }, { threshold: 0.1 });

        document.querySelectorAll('.observe-anim').forEach(el => {
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

    // Toast
    window.showToast = function(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };
})();
