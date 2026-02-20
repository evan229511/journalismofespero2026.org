// ===================================
// JOE - JURNAL OF ESPERO
// Enhanced JavaScript with Advanced Animations
// Version: 2.0
// ===================================

(function() {
    'use strict';

    // ===================================
    // CONSTANTS & CONFIGURATION
    // ===================================
    const CONFIG = {
        animationDuration: 600,
        scrollThreshold: 0.1,
        debounceDelay: 10,
        particleCount: 50,
        mouseTrailLength: 20,
        colors: {
            primary: '#FFD700',
            secondary: '#1A1A1A',
            accent: '#FFEB3B',
            white: '#FFFFFF'
        }
    };

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================
    
    /**
     * Debounce function to limit rate of function calls
     */
    function debounce(func, wait = CONFIG.debounceDelay) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function for performance optimization
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element, threshold = CONFIG.scrollThreshold) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 + threshold) &&
            rect.bottom >= -(window.innerHeight || document.documentElement.clientHeight) * threshold
        );
    }

    /**
     * Get random number between min and max
     */
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Get random color from config
     */
    function getRandomColor() {
        const colors = Object.values(CONFIG.colors);
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Easing functions for smooth animations
     */
    const Easing = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },
        easeOutElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),
        easeOutBounce: t => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        }
    };

    // ===================================
    // NAVIGATION FUNCTIONALITY
    // ===================================
    class Navigation {
        constructor() {
            this.navbar = document.querySelector('.navbar');
            this.navToggle = document.querySelector('.nav-toggle');
            this.navMenu = document.querySelector('.nav-menu');
            this.navLinks = document.querySelectorAll('.nav-menu a');
            this.lastScroll = 0;
            
            this.init();
        }

        init() {
            if (!this.navbar) {
                // Retry after DOM is fully loaded
                setTimeout(() => {
                    this.navbar = document.querySelector('.navbar');
                    this.navToggle = document.querySelector('.nav-toggle');
                    this.navMenu = document.querySelector('.nav-menu');
                    this.navLinks = document.querySelectorAll('.nav-menu a');
                    if (this.navbar) {
                        this.setupToggle();
                        this.setupScroll();
                        this.setupLinks();
                        this.setupHoverEffects();
                        this.setupActiveLink();
                    }
                }, 100);
                return;
            }
            
            this.setupToggle();
            this.setupScroll();
            this.setupLinks();
            this.setupHoverEffects();
            this.setupActiveLink();
        }

        setupToggle() {
            if (!this.navToggle || !this.navMenu) return;

            this.navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                const isClickInsideNav = this.navMenu.contains(e.target) || this.navToggle.contains(e.target);
                if (!isClickInsideNav && this.navMenu.classList.contains('active')) {
                    this.closeMenu();
                }
            });

            // Close on ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
                    this.closeMenu();
                }
            });
        }

        toggleMenu() {
            const isActive = this.navToggle.classList.toggle('active');
            this.navMenu.classList.toggle('active');
            
            // Animate menu items
            if (isActive) {
                this.animateMenuItems(true);
            }
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? 'hidden' : '';
        }

        closeMenu() {
            this.navToggle.classList.remove('active');
            this.navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        animateMenuItems(opening) {
            this.navLinks.forEach((link, index) => {
                if (opening) {
                    link.style.animation = `slideInRight 0.3s ${index * 0.1}s ease-out forwards`;
                } else {
                    link.style.animation = '';
                }
            });
        }

        setupScroll() {
            const scrollHandler = () => {
                const currentScroll = window.pageYOffset;
                
                // Change navbar style on scroll
                if (currentScroll > 50) {
                    this.navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
                    this.navbar.style.padding = '0.75rem 0';
                } else {
                    this.navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                    this.navbar.style.padding = '1rem 0';
                }

                // Hide/show navbar on scroll
                if (currentScroll > this.lastScroll && currentScroll > 100) {
                    this.navbar.style.transform = 'translateY(-100%)';
                } else {
                    this.navbar.style.transform = 'translateY(0)';
                }
                
                this.lastScroll = currentScroll;
            };

            window.addEventListener('scroll', throttle(scrollHandler, 100));
        }

        setupLinks() {
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Close mobile menu
                    if (this.navMenu.classList.contains('active')) {
                        this.closeMenu();
                    }

                    // Smooth scroll for anchor links
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            this.smoothScrollTo(target);
                        }
                    }
                });
            });
        }

        setupHoverEffects() {
            this.navLinks.forEach(link => {
                link.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                });
                
                link.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        }

        setupActiveLink() {
            const currentPath = window.location.pathname;
            this.navLinks.forEach(link => {
                if (link.getAttribute('href') === currentPath || 
                    (currentPath.includes(link.getAttribute('href')) && link.getAttribute('href') !== '/')) {
                    link.classList.add('active');
                }
            });
        }

        smoothScrollTo(target) {
            const navbarHeight = this.navbar.offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 800;
            let start = null;

            const animation = (currentTime) => {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = Easing.easeInOutCubic(timeElapsed / duration) * distance + startPosition;
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            };

            requestAnimationFrame(animation);
        }
    }

    // ===================================
    // SCROLL ANIMATIONS
    // ===================================
    class ScrollAnimations {
        constructor() {
            this.elements = [];
            this.init();
        }

        init() {
            this.observeElements();
            this.setupScrollIndicator();
            this.setupParallax();
            this.setupProgressBar();
        }

        observeElements() {
            const selectors = [
                '.program-card',
                '.value-card',
                '.team-card',
                '.regional-card',
                '.timeline-item',
                '.mission-item',
                '.stat-item',
                '.team-member-card',
                '.vm-card',
                '.story-content',
                '.section-header'
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(30px)';
                    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    this.elements.push(el);
                });
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100;
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, delay);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            this.elements.forEach(el => observer.observe(el));
        }

        setupScrollIndicator() {
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator) {
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 100) {
                        scrollIndicator.style.opacity = '0';
                        scrollIndicator.style.pointerEvents = 'none';
                    } else {
                        scrollIndicator.style.opacity = '1';
                        scrollIndicator.style.pointerEvents = 'auto';
                    }
                });

                // Smooth scroll on click
                scrollIndicator.addEventListener('click', () => {
                    window.scrollTo({
                        top: window.innerHeight,
                        behavior: 'smooth'
                    });
                });
            }
        }

        setupParallax() {
            const parallaxElements = document.querySelectorAll('.hero-background, .decoration-circle');
            
            window.addEventListener('scroll', throttle(() => {
                const scrolled = window.pageYOffset;
                
                parallaxElements.forEach((el, index) => {
                    const speed = 0.5 + (index * 0.1);
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                });
            }, 16));
        }

        setupProgressBar() {
            // Create progress bar
            const progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress-bar';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 4px;
                background: linear-gradient(90deg, ${CONFIG.colors.primary} 0%, ${CONFIG.colors.accent} 100%);
                z-index: 9999;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);

            window.addEventListener('scroll', throttle(() => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                progressBar.style.width = scrolled + '%';
            }, 16));
        }
    }

    // ===================================
    // ANIMATED COUNTER
    // ===================================
    class AnimatedCounter {
        constructor() {
            this.init();
        }

        init() {
            const statsSection = document.querySelector('.stats');
            if (!statsSection) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounters();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(statsSection);
        }

        animateCounters() {
            const statNumbers = document.querySelectorAll('.stat-number');
            
            statNumbers.forEach(stat => {
                const target = parseInt(stat.dataset.target);
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        stat.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.textContent = target;
                        this.addPulseEffect(stat);
                    }
                };
                
                requestAnimationFrame(updateCounter);
            });
        }

        addPulseEffect(element) {
            element.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }
    }

    // ===================================
    // PARTICLE SYSTEM
    // ===================================
    class ParticleSystem {
        constructor() {
            this.particles = [];
            this.canvas = null;
            this.ctx = null;
            this.init();
        }

        init() {
            // Only create particles on hero section
            const hero = document.querySelector('.hero');
            if (!hero) return;

            this.createCanvas(hero);
            this.createParticles();
            this.animate();
            this.handleResize();
        }

        createCanvas(container) {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            `;
            container.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
        }

        resizeCanvas() {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }

        createParticles() {
            for (let i = 0; i < CONFIG.particleCount; i++) {
                this.particles.push({
                    x: random(0, this.canvas.width),
                    y: random(0, this.canvas.height),
                    radius: random(1, 3),
                    speedX: random(-0.5, 0.5),
                    speedY: random(-0.5, 0.5),
                    opacity: random(0.1, 0.5)
                });
            }
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.particles.forEach(particle => {
                // Update position
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Wrap around edges
                if (particle.x < 0) particle.x = this.canvas.width;
                if (particle.x > this.canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.canvas.height;
                if (particle.y > this.canvas.height) particle.y = 0;

                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`;
                this.ctx.fill();
            });

            requestAnimationFrame(() => this.animate());
        }

        handleResize() {
            window.addEventListener('resize', debounce(() => {
                this.resizeCanvas();
            }, 250));
        }
    }

    // ===================================
    // MOUSE TRAIL EFFECT
    // ===================================
    class MouseTrail {
        constructor() {
            this.trail = [];
            this.maxLength = CONFIG.mouseTrailLength;
            this.canvas = null;
            this.ctx = null;
            this.mouseX = 0;
            this.mouseY = 0;
            this.init();
        }

        init() {
            this.createCanvas();
            this.setupMouseTracking();
            this.animate();
        }

        createCanvas() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9998;
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();

            window.addEventListener('resize', debounce(() => {
                this.resizeCanvas();
            }, 250));
        }

        resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        setupMouseTracking() {
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Add new point
            this.trail.push({
                x: this.mouseX,
                y: this.mouseY,
                life: 1
            });

            // Remove old points
            if (this.trail.length > this.maxLength) {
                this.trail.shift();
            }

            // Draw trail
            this.trail.forEach((point, index) => {
                const nextPoint = this.trail[index + 1];
                if (nextPoint) {
                    const progress = index / this.trail.length;
                    this.ctx.beginPath();
                    this.ctx.moveTo(point.x, point.y);
                    this.ctx.lineTo(nextPoint.x, nextPoint.y);
                    this.ctx.strokeStyle = `rgba(255, 215, 0, ${progress * 0.3})`;
                    this.ctx.lineWidth = 3 * progress;
                    this.ctx.stroke();
                }
            });

            requestAnimationFrame(() => this.animate());
        }
    }

    // ===================================
    // BUTTON RIPPLE EFFECT
    // ===================================
    class RippleEffect {
        constructor() {
            this.init();
        }

        init() {
            const buttons = document.querySelectorAll('.btn, .social-link');
            
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    this.createRipple(e, button);
                });
            });
        }

        createRipple(event, button) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            `;

            // Ensure button has position relative
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            
            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    }

    // ===================================
    // LAZY LOADING
    // ===================================
    class LazyLoader {
        constructor() {
            this.init();
        }

        init() {
            if ('IntersectionObserver' in window) {
                this.setupImageObserver();
            } else {
                this.loadAllImages();
            }
        }

        setupImageObserver() {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }

        loadAllImages() {
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.classList.add('loaded');
            });
        }
    }

    // ===================================
    // FORM VALIDATION
    // ===================================
    class FormValidator {
        constructor() {
            this.init();
        }

        init() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    if (!this.validateForm(form)) {
                        e.preventDefault();
                    }
                });

                // Real-time validation
                const inputs = form.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => {
                        this.validateInput(input);
                    });
                    input.addEventListener('input', () => {
                        if (input.classList.contains('error')) {
                            this.validateInput(input);
                        }
                    });
                });
            });
        }

        validateForm(form) {
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        validateInput(input) {
            const value = input.value.trim();
            let isValid = true;
            let errorMessage = '';

            // Required check
            if (input.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'Field ini wajib diisi';
            }

            // Email validation
            if (input.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Email tidak valid';
                }
            }

            // Phone validation
            if (input.type === 'tel' && value) {
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Nomor telepon tidak valid';
                }
            }

            // Update UI
            if (isValid) {
                input.classList.remove('error');
                this.removeErrorMessage(input);
            } else {
                input.classList.add('error');
                this.showErrorMessage(input, errorMessage);
            }

            return isValid;
        }

        showErrorMessage(input, message) {
            this.removeErrorMessage(input);
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.cssText = `
                color: #FF4B4B;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                animation: slideInDown 0.3s ease;
            `;
            
            input.parentNode.insertBefore(errorDiv, input.nextSibling);
        }

        removeErrorMessage(input) {
            const errorMessage = input.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    }

    // ===================================
    // DYNAMIC YEAR UPDATE
    // ===================================
    class YearUpdater {
        constructor() {
            this.init();
        }

        init() {
            const yearElements = document.querySelectorAll('.footer-bottom p');
            const currentYear = new Date().getFullYear();
            
            yearElements.forEach(el => {
                el.innerHTML = el.innerHTML.replace(/\d{4}/, currentYear);
            });
        }
    }

    // ===================================
    // LOADING ANIMATION
    // ===================================
    class LoadingAnimation {
        constructor() {
            this.init();
        }

        init() {
            window.addEventListener('load', () => {
                document.body.classList.add('loaded');
                this.animateHeroContent();
            });
        }

        animateHeroContent() {
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.opacity = '1';
            }
        }
    }

    // ===================================
    // ACCESSIBILITY ENHANCEMENTS
    // ===================================
    class AccessibilityManager {
        constructor() {
            this.init();
        }

        init() {
            this.setupKeyboardNavigation();
            this.setupFocusTrap();
            this.setupSkipLinks();
            this.setupAriaLabels();
        }

        setupKeyboardNavigation() {
            // Tab navigation for mobile menu
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        const focusableElements = navMenu.querySelectorAll('a, button');
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];

                        if (e.shiftKey && document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        } else if (!e.shiftKey && document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                });
            }
        }

        setupFocusTrap() {
            // Trap focus in modals or expanded menus
            const trapFocus = (element) => {
                const focusableElements = element.querySelectorAll(
                    'a[href], button, textarea, input, select'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        if (e.shiftKey && document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        } else if (!e.shiftKey && document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                });
            };

            // Apply to all dialogs
            document.querySelectorAll('[role="dialog"]').forEach(trapFocus);
        }

        setupSkipLinks() {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.className = 'skip-link';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 0;
                background: ${CONFIG.colors.primary};
                color: ${CONFIG.colors.secondary};
                padding: 8px 16px;
                text-decoration: none;
                z-index: 10000;
                transition: top 0.3s;
            `;

            skipLink.addEventListener('focus', function() {
                this.style.top = '0';
            });

            skipLink.addEventListener('blur', function() {
                this.style.top = '-40px';
            });

            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        setupAriaLabels() {
            // Add aria-labels to interactive elements without text
            document.querySelectorAll('button:not([aria-label])').forEach(button => {
                if (!button.textContent.trim()) {
                    button.setAttribute('aria-label', 'Button');
                }
            });

            document.querySelectorAll('a:not([aria-label])').forEach(link => {
                if (!link.textContent.trim()) {
                    link.setAttribute('aria-label', 'Link');
                }
            });
        }
    }

    // ===================================
    // TOOLTIP SYSTEM
    // ===================================
    class TooltipManager {
        constructor() {
            this.tooltip = null;
            this.init();
        }

        init() {
            this.createTooltip();
            this.setupEventListeners();
        }

        createTooltip() {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'custom-tooltip';
            this.tooltip.style.cssText = `
                position: absolute;
                background: ${CONFIG.colors.secondary};
                color: ${CONFIG.colors.white};
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 0.875rem;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s;
                z-index: 10000;
                white-space: nowrap;
            `;
            document.body.appendChild(this.tooltip);
        }

        setupEventListeners() {
            document.querySelectorAll('[data-tooltip]').forEach(element => {
                element.addEventListener('mouseenter', (e) => {
                    this.showTooltip(e, element.dataset.tooltip);
                });

                element.addEventListener('mouseleave', () => {
                    this.hideTooltip();
                });

                element.addEventListener('mousemove', (e) => {
                    this.updatePosition(e);
                });
            });
        }

        showTooltip(event, text) {
            this.tooltip.textContent = text;
            this.updatePosition(event);
            this.tooltip.style.opacity = '1';
        }

        hideTooltip() {
            this.tooltip.style.opacity = '0';
        }

        updatePosition(event) {
            const x = event.clientX + 10;
            const y = event.clientY + 10;
            this.tooltip.style.left = x + 'px';
            this.tooltip.style.top = y + 'px';
        }
    }

    // ===================================
    // PERFORMANCE MONITOR
    // ===================================
    class PerformanceMonitor {
        constructor() {
            this.metrics = {};
            this.init();
        }

        init() {
            if ('performance' in window) {
                this.measurePageLoad();
                this.measureResources();
            }
        }

        measurePageLoad() {
            window.addEventListener('load', () => {
                const perfData = performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const connectTime = perfData.responseEnd - perfData.requestStart;
                const renderTime = perfData.domComplete - perfData.domLoading;

                this.metrics.pageLoadTime = pageLoadTime;
                this.metrics.connectTime = connectTime;
                this.metrics.renderTime = renderTime;

                if (pageLoadTime > 3000) {
                    console.warn('Page load time is slow:', pageLoadTime + 'ms');
                }
            });
        }

        measureResources() {
            window.addEventListener('load', () => {
                const resources = performance.getEntriesByType('resource');
                const slowResources = resources.filter(r => r.duration > 1000);

                if (slowResources.length > 0) {
                    console.warn('Slow loading resources:', slowResources);
                }
            });
        }

        getMetrics() {
            return this.metrics;
        }
    }

    // ===================================
    // COOKIE CONSENT
    // ===================================
    class CookieConsent {
        constructor() {
            this.consentGiven = localStorage.getItem('cookieConsent') === 'true';
            this.init();
        }

        init() {
            if (!this.consentGiven) {
                this.showBanner();
            }
        }

        showBanner() {
            const banner = document.createElement('div');
            banner.className = 'cookie-consent';
            banner.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: ${CONFIG.colors.secondary};
                color: ${CONFIG.colors.white};
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 10000;
                animation: slideInUp 0.5s ease;
                flex-wrap: wrap;
                gap: 15px;
            `;

            banner.innerHTML = `
                <p style="margin: 0; flex: 1; min-width: 200px;">
                    Website ini menggunakan cookies untuk meningkatkan pengalaman Anda.
                </p>
                <div style="display: flex; gap: 10px;">
                    <button class="accept-cookies" style="
                        background: ${CONFIG.colors.primary};
                        color: ${CONFIG.colors.secondary};
                        border: none;
                        padding: 10px 20px;
                        cursor: pointer;
                        border-radius: 4px;
                        font-weight: 600;
                    ">Terima</button>
                    <button class="decline-cookies" style="
                        background: transparent;
                        color: ${CONFIG.colors.white};
                        border: 1px solid ${CONFIG.colors.white};
                        padding: 10px 20px;
                        cursor: pointer;
                        border-radius: 4px;
                    ">Tolak</button>
                </div>
            `;

            document.body.appendChild(banner);

            banner.querySelector('.accept-cookies').addEventListener('click', () => {
                this.acceptCookies();
                banner.remove();
            });

            banner.querySelector('.decline-cookies').addEventListener('click', () => {
                banner.remove();
            });
        }

        acceptCookies() {
            localStorage.setItem('cookieConsent', 'true');
            this.consentGiven = true;
        }
    }

    // ===================================
    // INITIALIZATION
    // ===================================
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize all components
        new Navigation();
        new ScrollAnimations();
        new AnimatedCounter();
        new ParticleSystem();
        new MouseTrail();
        new RippleEffect();
        new LazyLoader();
        new FormValidator();
        new YearUpdater();
        new LoadingAnimation();
        new AccessibilityManager();
        new TooltipManager();
        // Removed ThemeManager since we're using dark mode by default
        new PerformanceMonitor();
        new CookieConsent();
        new GalleryFilter();
        new ImageLightbox();

        // Add CSS animations
        addDynamicStyles();
        
        // Console message
        console.log('%c🚀 Website JOE', 'font-size: 20px; font-weight: bold; color: #FFD700;');
        console.log('%cJurnal Of Espero', 'font-size: 14px; color: #888888;');
        console.log('%cDikembangkan dengan ❤️', 'font-size: 12px; color: #1A1A1A;');
        console.log('%cTotal JS Lines: 1200+', 'font-size: 10px; color: #666;');
        console.log('%cDark Mode: Active', 'font-size: 10px; color: #FFD700;');
    });

    // ===================================
    // IMAGE LIGHTBOX (for aktivitas page)
    // ===================================
    class ImageLightbox {
        constructor() {
            this.lightbox = null;
            this.init();
        }

        init() {
            this.createLightbox();
            this.setupEventListeners();
        }

        createLightbox() {
            this.lightbox = document.createElement('div');
            this.lightbox.className = 'image-lightbox';
            this.lightbox.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 10000;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            this.lightbox.innerHTML = `
                <button class="lightbox-close" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: ${CONFIG.colors.primary};
                    color: ${CONFIG.colors.secondary};
                    border: none;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    font-size: 2rem;
                    cursor: pointer;
                    z-index: 10001;
                    transition: transform 0.3s;
                ">&times;</button>
                <img class="lightbox-image" style="
                    max-width: 90%;
                    max-height: 90%;
                    object-fit: contain;
                    border-radius: 10px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                " src="" alt="">
            `;

            document.body.appendChild(this.lightbox);

            // Close button hover
            const closeBtn = this.lightbox.querySelector('.lightbox-close');
            closeBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'rotate(90deg) scale(1.1)';
            });
            closeBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'rotate(0) scale(1)';
            });
        }

        setupEventListeners() {
            // Click on "Lihat Detail" button - menggunakan event delegation
            document.addEventListener('click', (e) => {
                // Cek apakah yang diklik adalah tombol view-btn atau parentnya
                const viewBtn = e.target.closest('.view-btn');
                if (viewBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const galleryItem = viewBtn.closest('.gallery-item');
                    if (galleryItem) {
                        const img = galleryItem.querySelector('.gallery-photo');
                        if (img) {
                            this.open(img.src, img.alt);
                        }
                    }
                }
            });

            // Click on gallery overlay
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('gallery-overlay')) {
                    const galleryItem = e.target.closest('.gallery-item');
                    if (galleryItem) {
                        const img = galleryItem.querySelector('.gallery-photo');
                        if (img) {
                            this.open(img.src, img.alt);
                        }
                    }
                }
            });

            // Click on close button
            const closeBtn = this.lightbox.querySelector('.lightbox-close');
            closeBtn.addEventListener('click', () => {
                this.close();
            });

            // Click on background to close
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) {
                    this.close();
                }
            });

            // ESC key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.lightbox.style.display === 'flex') {
                    this.close();
                }
            });
        }

        open(src, alt) {
            const img = this.lightbox.querySelector('.lightbox-image');
            img.src = src;
            img.alt = alt;
            
            this.lightbox.style.display = 'flex';
            setTimeout(() => {
                this.lightbox.style.opacity = '1';
            }, 10);

            document.body.style.overflow = 'hidden';
        }

        close() {
            this.lightbox.style.opacity = '0';
            setTimeout(() => {
                this.lightbox.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    // ===================================
    // GALLERY FILTER (for aktivitas page)
    // ===================================
    class GalleryFilter {
        constructor() {
            this.filterBtns = document.querySelectorAll('.filter-btn');
            this.galleryItems = document.querySelectorAll('.gallery-item');
            this.loadMoreBtn = document.querySelector('.load-more-btn');
            this.itemsPerPage = 9;
            this.currentItems = this.itemsPerPage;
            
            if (this.filterBtns.length > 0) {
                this.init();
            }
        }

        init() {
            this.setupFilters();
            this.setupLoadMore();
            this.hideExtraItems();
        }

        setupFilters() {
            this.filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active from all buttons
                    this.filterBtns.forEach(b => b.classList.remove('active'));
                    // Add active to clicked button
                    btn.classList.add('active');
                    
                    const filter = btn.dataset.filter;
                    this.filterGallery(filter);
                });
            });
        }

        filterGallery(filter) {
            let visibleCount = 0;
            
            this.galleryItems.forEach((item, index) => {
                const category = item.dataset.category;
                
                if (filter === 'all' || category === filter) {
                    if (visibleCount < this.currentItems) {
                        item.style.display = 'block';
                        item.style.animation = `fadeInCard 0.6s ${index * 0.1}s ease-out forwards`;
                        visibleCount++;
                    } else {
                        item.style.display = 'none';
                    }
                } else {
                    item.style.display = 'none';
                }
            });

            // Show/hide load more button
            const totalVisible = Array.from(this.galleryItems).filter(item => {
                return filter === 'all' || item.dataset.category === filter;
            }).length;

            if (this.loadMoreBtn) {
                this.loadMoreBtn.style.display = visibleCount < totalVisible ? 'inline-block' : 'none';
            }
        }

        hideExtraItems() {
            this.galleryItems.forEach((item, index) => {
                if (index >= this.itemsPerPage) {
                    item.style.display = 'none';
                }
            });
        }

        setupLoadMore() {
            if (this.loadMoreBtn) {
                this.loadMoreBtn.addEventListener('click', () => {
                    this.currentItems += this.itemsPerPage;
                    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
                    this.filterGallery(activeFilter);
                });
            }
        }
    }


    // ===================================
    // DYNAMIC STYLES
    // ===================================
    function addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }

            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }

            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .error {
                border-color: #FF4B4B !important;
                animation: shake 0.5s;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }

            .loaded {
                opacity: 1 !important;
                animation: fadeIn 0.5s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            [data-theme="dark"] {
                --bg-white: #1A1A1A;
                --bg-light: #252525;
                --text-dark: #FFFFFF;
                --text-muted: #B0B0B0;
            }

            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

})();