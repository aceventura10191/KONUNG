window.SF3 = window.SF3 || {};

window.SF3.sets = (function() {
    const factionColors = {
        legion: '#F59E0B',
        dynasty: '#10B981',
        heralds: '#06B6D4'
    };

    function createCard(set) {
        const card = document.createElement('div');
        card.className = `set-card set-card--${set.faction}`;
        card.setAttribute('data-faction', set.faction);
        card.setAttribute('data-set-id', set.id);
        
        card.innerHTML = `
            <div class="set-card__badge">${set.faction.toUpperCase()}</div>
            <div class="set-card__rarity">${set.rarity}</div>
            <h3>${set.name}</h3>
            <div class="set-card__weapon">${set.weapon_type}</div>
            <p class="set-card__bonus">${set.bonus_description}</p>
            <a href="#" class="set-card__link">View Details →</a>
        `;
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;
            
            card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(0)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
            card.style.transition = 'transform 0.5s ease';
            setTimeout(() => card.style.transition = '', 500);
        });
        
        card.addEventListener('click', (e) => {
            e.preventDefault();
            openDetail(set.id);
        });
        
        return card;
    }

    function init() {
        if (!window.SF3.setsData) {
            fetch('./data/sets.json')
                .then(res => res.json())
                .then(data => {
                    window.SF3.setsData = data;
                    renderSets();
                    setupFilters();
                    setupOverlay();
                })
                .catch(err => console.error("Error loading sets data", err));
        } else {
            renderSets();
            setupFilters();
            setupOverlay();
        }
    }

    function renderSets() {
        const grid = document.querySelector('.sets__grid');
        if (!grid || !window.SF3.setsData) return;
        
        grid.innerHTML = '';
        window.SF3.setsData.forEach(set => {
            grid.appendChild(createCard(set));
        });
        
        setupScrollReveal();
        updateCounts();
    }

    function setupFilters() {
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                const cards = document.querySelectorAll('.set-card');
                let visibleCount = 0;
                
                cards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-faction') === filter) {
                        card.style.display = '';
                        gsap.to(card, { opacity: 1, scale: 1, duration: 0.3 });
                        visibleCount++;
                    } else {
                        gsap.to(card, { opacity: 0, scale: 0.9, duration: 0.3, onComplete: () => {
                            card.style.display = 'none';
                        }});
                    }
                });
                
                const countEl = document.getElementById('setsCount');
                if (countEl) {
                    countEl.textContent = `Showing ${visibleCount} of ${cards.length} sets`;
                }
            });
        });
    }

    function updateCounts() {
        if (!window.SF3.setsData) return;
        const counts = { all: 0, legion: 0, dynasty: 0, heralds: 0 };
        window.SF3.setsData.forEach(set => {
            counts.all++;
            counts[set.faction]++;
        });
        
        const updateText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        
        updateText('countAll', counts.all);
        updateText('countLegion', counts.legion);
        updateText('countDynasty', counts.dynasty);
        updateText('countHeralds', counts.heralds);
        
        const countEl = document.getElementById('setsCount');
        if (countEl) countEl.textContent = `Showing ${counts.all} of ${counts.all} sets`;
    }

    function openDetail(id) {
        const set = window.SF3.setsData.find(s => s.id === id);
        if (!set) return;
        
        document.getElementById('detailFactionBar').style.backgroundColor = factionColors[set.faction];
        document.getElementById('detailName').textContent = set.name;
        
        const rarityEl = document.getElementById('detailRarity');
        rarityEl.textContent = set.rarity;
        rarityEl.style.color = set.rarity.toLowerCase() === 'legendary' ? '#F59E0B' : '#E8E2D6';
        
        const piecesHtml = Object.entries(set.pieces).map(([type, name]) => {
            let icon = '⚔️';
            if (type === 'helm') icon = '⛑️';
            if (type === 'armor') icon = '🛡️';
            if (type === 'ranged') icon = '🎯';
            return `<div class="piece"><span class="icon">${icon}</span> ${name}</div>`;
        }).join('');
        document.getElementById('detailPieces').innerHTML = piecesHtml;
        
        document.getElementById('detailBonusTitle').textContent = set.bonus_name || 'Set Bonus';
        document.getElementById('detailBonusDesc').textContent = set.bonus_description;
        
        let levelsHtml = '';
        if (set.levels) {
            levelsHtml = set.levels.map(l => `
                <div class="level-row">
                    <div class="level-badge">Lvl ${l.level}</div>
                    <div class="level-desc">${l.description}</div>
                </div>
            `).join('');
        }
        document.getElementById('detailLevels').innerHTML = levelsHtml;
        
        document.getElementById('strengthsList').innerHTML = (set.strengths || []).map(s => `<li>✓ ${s}</li>`).join('');
        document.getElementById('weaknessesList').innerHTML = (set.weaknesses || []).map(w => `<li>✗ ${w}</li>`).join('');
        
        gsap.set('#detailOverlay', { visibility: 'visible' });
        gsap.to('#detailBackdrop', { opacity: 1, duration: 0.3 });
        gsap.fromTo('#detailPanel', 
            { y: 100, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
        );
    }

    function closeDetail() {
        gsap.to('#detailPanel', { y: 50, opacity: 0, duration: 0.3, ease: 'power2.in' });
        gsap.to('#detailBackdrop', { opacity: 0, duration: 0.3, onComplete: () => {
            gsap.set('#detailOverlay', { visibility: 'hidden' });
        }});
    }

    function setupOverlay() {
        document.getElementById('detailClose')?.addEventListener('click', closeDetail);
        document.getElementById('detailBackdrop')?.addEventListener('click', closeDetail);
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDetail();
        });
    }

    function setupScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gsap.to(entry.target, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power2.out',
                        clearProps: 'transform' // allow tilt hover
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        document.querySelectorAll('.set-card').forEach(card => {
            gsap.set(card, { opacity: 0, y: 30 });
            observer.observe(card);
        });
    }

    return { init };
})();
