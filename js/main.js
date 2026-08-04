window.addEventListener('DOMContentLoaded', () => {
    
    // 1. Register GSAP plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // 2. Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 3. Custom cursor
    const cursor = document.getElementById('cursor');
    if (cursor && !prefersReducedMotion) {
        window.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        const interactiveSelectors = 'a, button, .set-card, .detail__close';
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactiveSelectors)) {
                cursor.classList.add('big');
            }
        });
        document.body.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactiveSelectors)) {
                cursor.classList.remove('big');
            }
        });
    } else if (cursor) {
        cursor.style.display = 'none';
    }

    // 4. HUD Clock
    const hudClock = document.getElementById('hudClock');
    if (hudClock) {
        setInterval(() => {
            const now = new Date();
            hudClock.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        }, 1000);
    }

    // 5. Hero Parallax
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        const heroTitle = document.getElementById('heroTitle');
        if (heroTitle) {
            window.addEventListener('mousemove', (e) => {
                const nx = (e.clientX / window.innerWidth - 0.5) * 2;
                const ny = (e.clientY / window.innerHeight - 0.5) * 2;
                gsap.to(heroTitle, {
                    x: nx * 26,
                    y: ny * 12,
                    duration: 1,
                    ease: 'power2.out'
                });
            });

            ScrollTrigger.create({
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                animation: gsap.to(heroTitle, { yPercent: 24, opacity: 0, ease: 'none' })
            });
        }
    }

    // 6. Ambient shadow flicker
    const heroFlicker = document.getElementById('heroFlicker');
    const hudState = document.getElementById('hudState');
    if (heroFlicker && !prefersReducedMotion) {
        function triggerFlicker() {
            gsap.to(heroFlicker, {
                opacity: 0.2,
                duration: 0.05,
                yoyo: true,
                repeat: 3,
                onComplete: () => {
                    gsap.set(heroFlicker, { opacity: 0 });
                }
            });
            
            if (hudState) {
                const orig = hudState.textContent;
                hudState.textContent = 'SHADOW ENERGY DETECTED';
                hudState.style.color = '#A78BFA';
                setTimeout(() => {
                    hudState.textContent = orig;
                    hudState.style.color = '';
                }, 800);
            }
            
            setTimeout(triggerFlicker, 2500 + Math.random() * 2500);
        }
        setTimeout(triggerFlicker, 2000);
    }

    // 7. Character letter flicker
    if (!prefersReducedMotion) {
        const factionColors = ['#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'];
        
        function flickerLetters() {
            const chars = window.SF3?.heroChars;
            if (chars && chars.length > 0) {
                const numToFlicker = Math.floor(Math.random() * 2) + 2; // 2-3 chars
                for (let i = 0; i < numToFlicker; i++) {
                    const idx = Math.floor(Math.random() * chars.length);
                    const ch = chars[idx];
                    const col = factionColors[Math.floor(Math.random() * factionColors.length)];
                    
                    gsap.to(ch, {
                        color: col,
                        x: (Math.random() - 0.5) * 4,
                        y: (Math.random() - 0.5) * 4,
                        duration: 0.05,
                        yoyo: true,
                        repeat: 5,
                        onComplete: () => {
                            gsap.set(ch, { color: '', x: 0, y: 0 });
                        }
                    });
                }
            }
            setTimeout(flickerLetters, 1500 + Math.random() * 1500);
        }
        setTimeout(flickerLetters, 3000);
    }

    // 8. Scroll reveal for [data-reveal]
    const revealElements = document.querySelectorAll('[data-reveal]:not(.hero [data-reveal])');
    if (revealElements.length > 0 && typeof IntersectionObserver !== 'undefined') {
        const revObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gsap.fromTo(entry.target, 
                        { y: 50, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
                    );
                    revObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        revealElements.forEach(el => revObs.observe(el));
    }

    // 9. Initialize modules
    if (window.SF3) {
        if (window.SF3.particles) {
            window.SF3.particles.initHero();
            window.SF3.particles.initFaction();
        }
        if (window.SF3.preloader) {
            window.SF3.preloader.init();
        }
        if (window.SF3.factions) {
            window.SF3.factions.init();
        }
        if (window.SF3.sets) {
            window.SF3.sets.init();
        }
    }

});
