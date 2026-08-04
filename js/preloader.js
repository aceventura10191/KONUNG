window.SF3 = window.SF3 || {};

window.SF3.preloader = (function() {
    let heroChars = [];

    function init() {
        const titleEl = document.querySelector('.hero__title');
        if (titleEl) {
            const text = titleEl.textContent;
            titleEl.textContent = '';
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (char === ' ') {
                    titleEl.appendChild(document.createTextNode(' '));
                } else {
                    const span = document.createElement('span');
                    span.className = 'ch';
                    span.textContent = char;
                    span.style.display = 'inline-block';
                    titleEl.appendChild(span);
                    heroChars.push(span);
                }
            }
            window.SF3.heroChars = heroChars;
        }

        const tl = gsap.timeline();
        
        if (document.querySelector('.pre')) {
            tl.fromTo('.pre__logo', 
                { scale: 0.86, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }
            )
            .fromTo('.pre__kanji',
                { scale: 0.85, opacity: 0 },
                { scale: 1.04, opacity: 1, duration: 0.7, ease: 'power2.out' },
                "-=0.5"
            )
            .to('#preFill', {
                width: '100%',
                duration: 1.6,
                ease: 'power1.inOut',
                onUpdate: function() {
                    const progress = Math.round(this.progress() * 100);
                    const counter = document.querySelector('#preCount');
                    if (counter) counter.textContent = `ENTERING SHADOW REALM · ${progress}%`;
                }
            })
            .to('.pre', {
                backgroundColor: 'rgba(255,255,255,0.9)',
                duration: 0.06
            })
            .to('.pre', {
                backgroundColor: 'rgba(5,6,8,0)',
                duration: 0.35
            })
            .to('.pre', {
                yPercent: -100,
                duration: 0.7,
                ease: 'power3.inOut'
            })
            .set('.pre', { display: 'none' });
        }
        
        if (document.querySelectorAll('.hero [data-reveal]').length > 0) {
            tl.fromTo('.hero [data-reveal]',
                { yPercent: 60, opacity: 0 },
                { yPercent: 0, opacity: 1, stagger: 0.09, duration: 0.8, ease: 'power2.out' },
                "-=0.4"
            );
        }
        
        if (heroChars.length > 0) {
            tl.fromTo('.hero__title .ch',
                { yPercent: 110, opacity: 0, rotateX: -50 },
                { yPercent: 0, opacity: 1, rotateX: 0, stagger: 0.028, duration: 0.8, ease: 'back.out(1.7)' },
                "-=0.6"
            );
        }
    }

    return { init };
})();
