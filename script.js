/* ═══════════════════════════════════════════════════════════ */
/*  CELESTIAL KONUNG — SCROLLYTELLING ENGINE                   */
/*  GSAP ScrollTrigger + Canvas Particle Systems               */
/* ═══════════════════════════════════════════════════════════ */

// ── WAIT FOR DOM ──
document.addEventListener('DOMContentLoaded', () => {

    // ── REGISTER GSAP PLUGINS ──
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // ── MOBILE HAMBURGER MENU ──
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
        // Close on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
            }
        });
        // Close on scroll
        window.addEventListener('scroll', () => {
            if (navLinks.classList.contains('open')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
            }
        }, { passive: true });
    }

    // ═══════════════════════════════════════
    //  PRELOADER
    // ═══════════════════════════════════════
    const loader = document.getElementById('loader');
    const images = document.querySelectorAll('img');
    let loadedCount = 0;

    function checkLoaded() {
        loadedCount++;
        if (loadedCount >= images.length) {
            setTimeout(() => {
                loader.classList.add('hidden');
                initAnimations();
                initParticles();
                initSnow();
            }, 500);
        }
    }

    images.forEach(img => {
        if (img.complete) {
            checkLoaded();
        } else {
            img.addEventListener('load', checkLoaded);
            img.addEventListener('error', checkLoaded);
        }
    });

    // Fallback: force load after 4 seconds
    setTimeout(() => {
        if (!loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
            initAnimations();
            initParticles();
            initSnow();
        }
    }, 4000);

    // ═══════════════════════════════════════
    //  GSAP SCROLL ANIMATIONS
    // ═══════════════════════════════════════
    function initAnimations() {

        // ── NAV VISIBILITY ──
        const nav = document.getElementById('main-nav');
        ScrollTrigger.create({
            trigger: '#overview',
            start: 'top 80%',
            onEnter: () => nav.classList.add('visible'),
            onLeaveBack: () => nav.classList.remove('visible'),
        });

        // ── SCROLL PROGRESS BAR ──
        const progressBar = document.getElementById('scroll-progress');
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                progressBar.style.width = `${self.progress * 100}%`;
            }
        });

        // ── SCROLL INDICATOR ──
        const scrollIndicator = document.getElementById('scroll-indicator');
        ScrollTrigger.create({
            trigger: '#hero',
            start: 'top top',
            end: 'bottom 60%',
            onLeave: () => scrollIndicator.classList.add('hidden'),
            onEnterBack: () => scrollIndicator.classList.remove('hidden'),
        });

        // ── HERO ANIMATIONS ──
        const heroTL = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '+=100%',
                pin: true,
                scrub: 1.2,
                anticipatePin: 1,
            }
        });

        // Initial entrance (non-scroll)
        gsap.timeline({ delay: 0.3 })
            .to('#hero-subtitle', {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out'
            })
            .to('.title-line', {
                opacity: 1,
                y: 0,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.5')
            .to('#hero-tagline', {
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.3')
            .to('#hero-divider', {
                width: '120px',
                duration: 1,
                ease: 'power2.out'
            }, '-=0.5');

        // Scroll-driven hero exit
        heroTL
            .to('.hero-image', {
                scale: 1.3,
                opacity: 0.2,
                filter: 'brightness(0.3) contrast(1.5) saturate(0.5)',
                ease: 'none'
            })
            .to('.hero-content', {
                y: -100,
                opacity: 0,
                ease: 'none'
            }, '<')
            .to('#hero', {
                '--frost-opacity': 1,
                ease: 'none'
            }, '<');


        // ── OVERVIEW SECTION ──
        const overviewTL = gsap.timeline({
            scrollTrigger: {
                trigger: '#overview',
                start: 'top top',
                end: '+=120%',
                pin: true,
                scrub: 1,
                anticipatePin: 1,
            }
        });

        gsap.set('.overview-image-panel', { opacity: 0, x: -80 });
        gsap.set('.overview-text-panel', { opacity: 0, x: 80 });

        overviewTL
            .to('.overview-image-panel', {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: 'power3.out'
            })
            .to('.overview-text-panel', {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.7')
            .to('.stat-item', {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: 'power2.out'
            }, '-=0.5');

        // Set initial states for stat items
        gsap.set('.stat-item', { opacity: 0, y: 20 });


        // ── LEVEL PANELS — SCROLL-TRIGGERED ──
        document.querySelectorAll('.level-panel').forEach((panel, i) => {
            const imgSide = panel.querySelector('.level-image-side');
            const infoSide = panel.querySelector('.level-info-side');
            const cards = panel.querySelectorAll('.ability-card');
            const badge = panel.querySelector('.level-badge');
            const levelName = panel.querySelector('.level-name');
            const tag = panel.querySelector('.level-type-tag');
            const flavor = panel.querySelector('.level-flavor');

            // Set initial states
            gsap.set(imgSide, { opacity: 0, scale: 1.1 });
            gsap.set(infoSide, { opacity: 0 });
            gsap.set(badge, { opacity: 0, scale: 0.5, rotation: -180 });
            gsap.set(levelName, { opacity: 0, x: -40 });
            gsap.set(tag, { opacity: 0, x: -20 });
            gsap.set(cards, { opacity: 0, y: 40 });
            if (flavor) gsap.set(flavor, { opacity: 0, y: 20 });

            const panelTL = gsap.timeline({
                scrollTrigger: {
                    trigger: panel,
                    start: 'top 70%',
                    end: 'top 10%',
                    scrub: 0.8,
                }
            });

            panelTL
                .to(imgSide, {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: 'power2.out'
                })
                .to(infoSide, {
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power2.out'
                }, '-=0.7')
                .to(badge, {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 0.6,
                    ease: 'back.out(1.7)'
                }, '-=0.5')
                .to(levelName, {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                }, '-=0.4')
                .to(tag, {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                }, '-=0.3')
                .to(cards, {
                    opacity: 1,
                    y: 0,
                    stagger: 0.08,
                    duration: 0.5,
                    ease: 'power2.out'
                }, '-=0.3');

            if (flavor) {
                panelTL.to(flavor, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                }, '-=0.2');
            }

            // Parallax on images
            gsap.to(panel.querySelector('.level-img'), {
                yPercent: -15,
                ease: 'none',
                scrollTrigger: {
                    trigger: panel,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });


        // ── SUMMARY SECTION — STAGGERED CARDS ──
        const summaryCards = document.querySelectorAll('.summary-card');
        const summaryTitle = document.querySelector('.summary-wrapper .section-title');
        const summaryLabel = document.querySelector('.summary-wrapper .section-label');
        const summaryIntro = document.querySelector('.summary-intro');

        if (summaryCards.length) {
            gsap.set(summaryLabel, { opacity: 0, y: 20 });
            gsap.set(summaryTitle, { opacity: 0, y: 30 });
            gsap.set(summaryIntro, { opacity: 0, y: 20 });
            gsap.set(summaryCards, { opacity: 0, y: 50, scale: 0.95 });

            const summaryTL = gsap.timeline({
                scrollTrigger: {
                    trigger: '#summary',
                    start: 'top 70%',
                    end: 'top 10%',
                    scrub: 0.8,
                }
            });

            summaryTL
                .to(summaryLabel, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                })
                .to(summaryTitle, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                }, '-=0.2')
                .to(summaryIntro, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                }, '-=0.3')
                .to(summaryCards, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    stagger: 0.06,
                    duration: 0.5,
                    ease: 'power2.out'
                }, '-=0.2');
        }


        // ── PERKS SECTION — SCROLL-TRIGGERED ──
        const perksImagePanel = document.querySelector('.perks-image-panel');
        const perksContentLabel = document.querySelector('.perks-content-panel .section-label');
        const perksContentTitle = document.querySelector('.perks-content-panel .section-title');
        const perksIntro = document.querySelector('.perks-intro');
        const perkCategories = document.querySelectorAll('.perk-category');
        const allPerkCards = document.querySelectorAll('.perk-card');

        if (perksImagePanel) {
            gsap.set(perksImagePanel, { opacity: 0, x: -60 });
            gsap.set(perksContentLabel, { opacity: 0, y: 20 });
            gsap.set(perksContentTitle, { opacity: 0, y: 30 });
            gsap.set(perksIntro, { opacity: 0, y: 20 });
            gsap.set(perkCategories, { opacity: 0, y: 30 });
            gsap.set(allPerkCards, { opacity: 0, x: 30 });

            const perksTL = gsap.timeline({
                scrollTrigger: {
                    trigger: '#perks',
                    start: 'top 70%',
                    end: 'top 10%',
                    scrub: 0.8,
                }
            });

            perksTL
                .to(perksImagePanel, {
                    opacity: 1,
                    x: 0,
                    duration: 0.6,
                    ease: 'power2.out'
                })
                .to(perksContentLabel, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                }, '-=0.4')
                .to(perksContentTitle, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                }, '-=0.2')
                .to(perksIntro, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                }, '-=0.2')
                .to(perkCategories, {
                    opacity: 1,
                    y: 0,
                    stagger: 0.08,
                    duration: 0.4,
                    ease: 'power2.out'
                }, '-=0.1')
                .to(allPerkCards, {
                    opacity: 1,
                    x: 0,
                    stagger: 0.04,
                    duration: 0.4,
                    ease: 'power2.out'
                }, '-=0.3');
        }


        // ── ULTIMATE / ASCENSION SECTION ──
        const ultimateTL = gsap.timeline({
            scrollTrigger: {
                trigger: '#ultimate',
                start: 'top top',
                end: '+=150%',
                pin: true,
                scrub: 1,
                anticipatePin: 1,
            }
        });

        gsap.set('.ultimate-content', { opacity: 0, y: 60 });
        gsap.set('.ultimate-label', { opacity: 0, letterSpacing: '1em' });
        gsap.set('.ultimate-title', { opacity: 0, y: 40 });
        gsap.set('.ultimate-desc', { opacity: 0, y: 30 });
        gsap.set('.ultimate-badge', { opacity: 0, scale: 0.8 });

        ultimateTL
            .to('.ultimate-img', {
                scale: 1,
                opacity: 0.6,
                filter: 'brightness(0.7) contrast(1.2) saturate(1.3)',
                duration: 1,
                ease: 'power2.out'
            })
            .to('.ultimate-content', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.5')
            .to('.ultimate-label', {
                opacity: 1,
                letterSpacing: '0.6em',
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.6')
            .to('.ultimate-title', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.5')
            .to('.ultimate-desc', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.4')
            .to('.ultimate-badge', {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: 'back.out(1.7)'
            }, '-=0.3');


        // ── ACTIVE NAV LINK TRACKING ──
        const sections = ['#hero', '#overview', '#levels', '#perks', '#ultimate'];
        const navLinks = document.querySelectorAll('.nav-link');

        sections.forEach((sec, i) => {
            ScrollTrigger.create({
                trigger: sec,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => setActiveNav(i),
                onEnterBack: () => setActiveNav(i),
            });
        });

        function setActiveNav(index) {
            navLinks.forEach(l => l.classList.remove('active'));
            if (navLinks[index]) navLinks[index].classList.add('active');
        }

        // ── NAV SMOOTH SCROLL ──
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                gsap.to(window, {
                    scrollTo: { y: target, offsetY: 0 },
                    duration: 1.5,
                    ease: 'power3.inOut'
                });
            });
        });

        // ── HERO PARALLAX ON MOUSEMOVE ──
        const heroImg = document.getElementById('hero-img');
        document.getElementById('hero').addEventListener('mousemove', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(heroImg, {
                x: x * 20,
                y: y * 15,
                rotateY: x * 3,
                rotateX: -y * 3,
                duration: 1.2,
                ease: 'power2.out'
            });
        });
    }


    // ═══════════════════════════════════════
    //  BLUE ICE PARTICLE SYSTEM
    // ═══════════════════════════════════════
    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animFrame;
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Track mouse
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        class IceParticle {
            constructor() {
                this.reset();
            }

            reset() {
                // Spawn from various zones to simulate emanating from character
                const zone = Math.random();
                if (zone < 0.35) {
                    // Center — sword area
                    this.x = canvas.width * 0.5 + (Math.random() - 0.5) * 120;
                    this.y = canvas.height * 0.5 + (Math.random() - 0.5) * 200;
                } else if (zone < 0.6) {
                    // Upper center — horns area
                    this.x = canvas.width * 0.5 + (Math.random() - 0.5) * 200;
                    this.y = canvas.height * 0.25 + (Math.random() - 0.5) * 100;
                } else if (zone < 0.8) {
                    // Shoulder/armor area
                    this.x = canvas.width * 0.5 + (Math.random() - 0.5) * 350;
                    this.y = canvas.height * 0.4 + (Math.random() - 0.5) * 150;
                } else {
                    // Random ambient
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                }

                this.originX = this.x;
                this.originY = this.y;
                this.size = Math.random() * 3 + 0.5;
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.speedY = -Math.random() * 2 - 0.3;
                this.opacity = Math.random() * 0.7 + 0.3;
                this.life = 1;
                this.decay = Math.random() * 0.008 + 0.003;
                this.hue = 190 + Math.random() * 30; // cyan-blue range
                this.saturation = 80 + Math.random() * 20;
                this.pulse = Math.random() * Math.PI * 2;
                this.pulseSpeed = Math.random() * 0.05 + 0.02;
                this.wobble = Math.random() * Math.PI * 2;
                this.wobbleSpeed = Math.random() * 0.03 + 0.01;
                this.wobbleAmplitude = Math.random() * 1.5;
            }

            update() {
                this.life -= this.decay;
                this.pulse += this.pulseSpeed;
                this.wobble += this.wobbleSpeed;

                // Mouse interaction — gentle repulsion
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150 * 0.5;
                    this.speedX += (dx / dist) * force;
                    this.speedY += (dy / dist) * force;
                }

                // Apply wind based on scroll velocity
                this.speedX += Math.sin(this.wobble) * this.wobbleAmplitude * 0.1;

                this.x += this.speedX;
                this.y += this.speedY;

                // Dampen
                this.speedX *= 0.995;
                this.speedY *= 0.995;

                if (this.life <= 0) this.reset();
            }

            draw() {
                const pulseFactor = 0.6 + Math.sin(this.pulse) * 0.4;
                const alpha = this.opacity * this.life * pulseFactor;

                // Outer glow
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 4
                );
                gradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, 70%, ${alpha * 0.6})`);
                gradient.addColorStop(0.3, `hsla(${this.hue}, ${this.saturation}%, 55%, ${alpha * 0.3})`);
                gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, 40%, 0)`);

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core bright dot
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 100%, 85%, ${alpha * 0.9})`;
                ctx.fill();
            }
        }

        // Create particle pool
        const PARTICLE_COUNT = 120;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new IceParticle());
        }

        // ── ANIMATION LOOP ──
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Global compositing for glow stacking
            ctx.globalCompositeOperation = 'screen';

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            ctx.globalCompositeOperation = 'source-over';

            // Draw subtle connection lines between close particles
            ctx.strokeStyle = 'rgba(0, 191, 255, 0.03)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 80) {
                        const alpha = (1 - dist / 80) * 0.06 * particles[i].life * particles[j].life;
                        ctx.strokeStyle = `rgba(0, 191, 255, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animFrame = requestAnimationFrame(animateParticles);
        }

        animateParticles();

        // Scroll velocity influence on particles
        let lastScrollY = window.scrollY;
        let scrollVelocity = 0;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            scrollVelocity = Math.abs(currentScrollY - lastScrollY);
            lastScrollY = currentScrollY;

            // Burst particles on fast scroll
            if (scrollVelocity > 20) {
                const burstCount = Math.min(Math.floor(scrollVelocity / 5), 15);
                for (let i = 0; i < burstCount && i < particles.length; i++) {
                    const p = particles[Math.floor(Math.random() * particles.length)];
                    p.speedY -= scrollVelocity * 0.05;
                    p.speedX += (Math.random() - 0.5) * scrollVelocity * 0.08;
                    p.opacity = Math.min(1, p.opacity + 0.3);
                }
            }
        });
    }


    // ═══════════════════════════════════════
    //  SNOW PARTICLE SYSTEM (Background)
    // ═══════════════════════════════════════
    function initSnow() {
        const canvas = document.getElementById('snow-canvas');
        const ctx = canvas.getContext('2d');
        let snowflakes = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Snowflake {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.3;
                this.speedY = Math.random() * 0.8 + 0.2;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.wobble = Math.random() * Math.PI * 2;
                this.wobbleSpeed = Math.random() * 0.01 + 0.005;
            }

            update() {
                this.y += this.speedY;
                this.wobble += this.wobbleSpeed;
                this.x += this.speedX + Math.sin(this.wobble) * 0.3;

                if (this.y > canvas.height) {
                    this.y = -5;
                    this.x = Math.random() * canvas.width;
                }
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 220, 255, ${this.opacity})`;
                ctx.fill();
            }
        }

        const SNOW_COUNT = 180;
        for (let i = 0; i < SNOW_COUNT; i++) {
            snowflakes.push(new Snowflake());
        }

        function animateSnow() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            snowflakes.forEach(s => {
                s.update();
                s.draw();
            });
            requestAnimationFrame(animateSnow);
        }

        animateSnow();
    }

    // ── AUTO-SCROLL FEATURE ──
    const autoScrollBtn = document.getElementById('auto-scroll-btn');
    let isAutoScrolling = false;
    let autoScrollReq;
    const autoScrollSpeed = 1.2; // Smooth cinematic pace

    if (autoScrollBtn) {
        autoScrollBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isAutoScrolling = !isAutoScrolling;
            if (isAutoScrolling) {
                autoScrollBtn.classList.add('active');
                autoScrollBtn.innerText = 'PAUSE SCROLL';
                autoScrollLoop();
            } else {
                autoScrollBtn.classList.remove('active');
                autoScrollBtn.innerText = 'AUTO SCROLL';
                cancelAnimationFrame(autoScrollReq);
            }
        });

        // Interrupt if user manually scrolls/interacts
        const stopAutoScroll = () => {
            if (isAutoScrolling) {
                isAutoScrolling = false;
                autoScrollBtn.classList.remove('active');
                autoScrollBtn.innerText = 'AUTO SCROLL';
                cancelAnimationFrame(autoScrollReq);
            }
        };

        window.addEventListener('wheel', stopAutoScroll, { passive: true });
        window.addEventListener('touchstart', stopAutoScroll, { passive: true });
        
        function autoScrollLoop() {
            if (!isAutoScrolling) return;
            window.scrollBy(0, autoScrollSpeed);
            
            // Check if reached bottom
            if ((window.innerHeight + Math.ceil(window.scrollY)) >= document.body.offsetHeight) {
                stopAutoScroll();
                return;
            }
            
            autoScrollReq = requestAnimationFrame(autoScrollLoop);
        }
    }

});
