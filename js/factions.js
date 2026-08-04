window.SF3 = window.SF3 || {};

window.SF3.factions = (function() {
    
    function crackClip(progress, seed) {
        const points = 22;
        let poly = [];
        poly.push(`0% 0%`);
        
        let crackX = 100 - (progress * 100);
        
        for(let i = 0; i <= points; i++) {
            let y = (i / points) * 100;
            let jitter = Math.sin(seed + i * 1.5) * 15 * progress;
            let x = crackX + jitter;
            x = Math.max(0, Math.min(100, x));
            poly.push(`${x}% ${y}%`);
        }
        
        poly.push(`0% 100%`);
        return `polygon(${poly.join(', ')})`;
    }

    function init() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        
        const morphSection = document.getElementById('morph');
        if (!morphSection) return;

        const imgLegion = document.getElementById('imgLegion');
        const imgDynasty = document.getElementById('imgDynasty');
        // imgHeralds is background essentially
        
        const stateText = document.getElementById('morphState');
        const caps = [
            document.getElementById('cap0'),
            document.getElementById('cap1'),
            document.getElementById('cap2')
        ];

        let lastPhase = -1;

        ScrollTrigger.create({
            trigger: '#morph',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            onUpdate: (self) => {
                const p = self.progress;
                let phase = 0;
                let color = '245,158,11';
                
                if (p < 0.33) { phase = 0; color = '245,158,11'; } // Legion
                else if (p < 0.66) { phase = 1; color = '16,185,129'; } // Dynasty
                else { phase = 2; color = '6,182,212'; } // Heralds
                
                if (phase !== lastPhase) {
                    if (stateText) {
                        stateText.textContent = phase === 0 ? 'LEGION' : phase === 1 ? 'DYNASTY' : 'HERALDS';
                        stateText.style.color = `rgb(${color})`;
                        
                        // Flash
                        const flash = document.createElement('div');
                        flash.style.position = 'absolute';
                        flash.style.inset = '0';
                        flash.style.backgroundColor = `rgba(${color}, 0.5)`;
                        flash.style.zIndex = '10';
                        flash.style.pointerEvents = 'none';
                        morphSection.appendChild(flash);
                        gsap.to(flash, {opacity: 0, duration: 0.5, onComplete: () => flash.remove()});
                    }
                    
                    caps.forEach((cap, i) => {
                        if (cap) {
                            if (i === phase) cap.classList.add('on');
                            else cap.classList.remove('on');
                        }
                    });
                    
                    if (window.SF3.particles) window.SF3.particles.setFactionColor(color);
                    lastPhase = phase;
                }
                
                // T1: Legion -> Dynasty (0.25 - 0.40)
                if (p > 0.25 && p < 0.40) {
                    let localP = (p - 0.25) / 0.15;
                    if (imgLegion) imgLegion.style.clipPath = crackClip(localP, p * 10);
                    if (Math.random() < 0.2 && window.SF3.particles) window.SF3.particles.spawnBolt(null, true, '245,158,11');
                } else if (p <= 0.25 && imgLegion) {
                    imgLegion.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
                } else if (p >= 0.40 && imgLegion) {
                    imgLegion.style.clipPath = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)';
                }
                
                // T2: Dynasty -> Heralds (0.58 - 0.73)
                if (p > 0.58 && p < 0.73) {
                    let localP = (p - 0.58) / 0.15;
                    if (imgDynasty) imgDynasty.style.clipPath = crackClip(localP, p * 20);
                    if (Math.random() < 0.2 && window.SF3.particles) window.SF3.particles.spawnBolt(null, true, '16,185,129');
                } else if (p <= 0.58 && imgDynasty) {
                    imgDynasty.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
                } else if (p >= 0.73 && imgDynasty) {
                    imgDynasty.style.clipPath = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)';
                }
            }
        });

        // Dividers
        const dividers = document.querySelectorAll('.divider');
        dividers.forEach(div => {
            ScrollTrigger.create({
                trigger: div,
                start: 'top 85%',
                onEnter: () => div.classList.add('on')
            });
        });
    }

    return { init };
})();
