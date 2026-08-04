window.SF3 = window.SF3 || {};

window.SF3.particles = (function() {
    let heroCanvas, heroCtx, heroParticles = [];
    let factionCanvas, factionCtx, factionParticles = [], bolts = [];
    let currentFactionColor = '245,158,11'; // default legion
    let isRunning = true;
    let heroReq, factionReq;

    function resizeCanvas(canvas) {
        if (!canvas) return;
        const parent = canvas.parentElement;
        const rect = parent.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
    }

    function createMote(w, h, color) {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.5 + Math.random() * 1.5,
            vy: -0.2 - Math.random() * 0.8,
            vx: -0.2 + Math.random() * 0.4,
            alpha: 0.08 + Math.random() * 0.22,
            phase: Math.random() * Math.PI * 2,
            baseColor: color
        };
    }

    function initHero() {
        heroCanvas = document.getElementById('heroParticles');
        if (!heroCanvas) return;
        heroCtx = heroCanvas.getContext('2d');
        
        const init = () => {
            resizeCanvas(heroCanvas);
            heroParticles = [];
            const w = heroCanvas.width / Math.min(window.devicePixelRatio || 1, 2);
            const h = heroCanvas.height / Math.min(window.devicePixelRatio || 1, 2);
            const count = Math.floor(w > 768 ? 50 : 30);
            for (let i = 0; i < count; i++) {
                const color = Math.random() > 0.5 ? '139,92,246' : '167,139,250';
                heroParticles.push(createMote(w, h, color));
            }
        };
        
        window.addEventListener('resize', init);
        init();
        heroTick();
    }

    function heroTick() {
        if (!isRunning || !heroCanvas) return;
        
        const w = heroCanvas.width / Math.min(window.devicePixelRatio || 1, 2);
        const h = heroCanvas.height / Math.min(window.devicePixelRatio || 1, 2);
        
        heroCtx.clearRect(0, 0, w, h);
        heroCtx.globalCompositeOperation = 'lighter';
        
        heroParticles.forEach(p => {
            p.y += p.vy;
            p.x += p.vx;
            p.phase += 0.05;
            
            if (p.y < -10) {
                p.y = h + 10;
                p.x = Math.random() * w;
            }
            
            const twinkle = p.alpha + Math.sin(p.phase) * 0.05;
            
            heroCtx.beginPath();
            heroCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            heroCtx.fillStyle = `rgba(${p.baseColor}, ${Math.max(0, twinkle)})`;
            heroCtx.fill();
        });
        
        heroReq = requestAnimationFrame(heroTick);
    }

    function initFaction() {
        factionCanvas = document.getElementById('morphFx');
        if (!factionCanvas) return;
        factionCtx = factionCanvas.getContext('2d');
        
        const init = () => {
            resizeCanvas(factionCanvas);
            factionParticles = [];
            const w = factionCanvas.width / Math.min(window.devicePixelRatio || 1, 2);
            const h = factionCanvas.height / Math.min(window.devicePixelRatio || 1, 2);
            const count = Math.floor(w > 768 ? 40 : 25);
            for (let i = 0; i < count; i++) {
                factionParticles.push(createMote(w, h, currentFactionColor));
            }
        };
        
        window.addEventListener('resize', init);
        init();
        factionTick();
    }

    function buildBolt(x1, y1, x2, y2, displacement, detail) {
        if (displacement < detail) {
            return [{x: x1, y: y1}, {x: x2, y: y2}];
        }
        
        const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
        const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement;
        
        const left = buildBolt(x1, y1, midX, midY, displacement / 2, detail);
        const right = buildBolt(midX, midY, x2, y2, displacement / 2, detail);
        
        return left.slice(0, -1).concat(right);
    }

    function spawnBolt(x, isBig, colorName) {
        if (!factionCanvas) return;
        
        const w = factionCanvas.width / Math.min(window.devicePixelRatio || 1, 2);
        const h = factionCanvas.height / Math.min(window.devicePixelRatio || 1, 2);
        
        const startX = x || Math.random() * w;
        const startY = 0;
        const endX = startX + (Math.random() - 0.5) * w * 0.5;
        const endY = h;
        
        const color = colorName || currentFactionColor;
        const segments = buildBolt(startX, startY, endX, endY, isBig ? 150 : 80, 10);
        
        const branches = [];
        const numBranches = isBig ? 3 : 1;
        for (let i = 0; i < numBranches; i++) {
            const idx = Math.floor(Math.random() * (segments.length - 2)) + 1;
            const origin = segments[idx];
            const bEndX = origin.x + (Math.random() - 0.5) * 100;
            const bEndY = origin.y + Math.random() * 100;
            branches.push(buildBolt(origin.x, origin.y, bEndX, bEndY, 40, 5));
        }
        
        bolts.push({
            segs: segments,
            branches: branches,
            life: 1,
            color: color
        });
    }

    function drawBoltPath(ctx, path) {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
    }

    function factionTick() {
        if (!isRunning || !factionCanvas) return;
        
        const w = factionCanvas.width / Math.min(window.devicePixelRatio || 1, 2);
        const h = factionCanvas.height / Math.min(window.devicePixelRatio || 1, 2);
        
        factionCtx.clearRect(0, 0, w, h);
        factionCtx.globalCompositeOperation = 'lighter';
        
        factionParticles.forEach(p => {
            p.y += p.vy;
            p.x += p.vx;
            p.phase += 0.05;
            p.baseColor = currentFactionColor; // update color dynamically
            
            if (p.y < -10) {
                p.y = h + 10;
                p.x = Math.random() * w;
            }
            
            const twinkle = p.alpha + Math.sin(p.phase) * 0.05;
            
            factionCtx.beginPath();
            factionCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            factionCtx.fillStyle = `rgba(${p.baseColor}, ${Math.max(0, twinkle)})`;
            factionCtx.fill();
        });
        
        for (let i = bolts.length - 1; i >= 0; i--) {
            const b = bolts[i];
            
            factionCtx.lineCap = 'round';
            factionCtx.lineJoin = 'round';
            
            // Outer glow
            factionCtx.lineWidth = 10;
            factionCtx.strokeStyle = `rgba(${b.color}, ${b.life * 0.3})`;
            drawBoltPath(factionCtx, b.segs);
            b.branches.forEach(branch => drawBoltPath(factionCtx, branch));
            
            // Inner core
            factionCtx.lineWidth = 2;
            factionCtx.strokeStyle = `rgba(255, 255, 255, ${b.life})`;
            drawBoltPath(factionCtx, b.segs);
            b.branches.forEach(branch => drawBoltPath(factionCtx, branch));
            
            b.life -= 0.085;
            if (b.life <= 0) bolts.splice(i, 1);
        }
        
        factionReq = requestAnimationFrame(factionTick);
    }

    return {
        initHero,
        initFaction,
        spawnBolt,
        setFactionColor: (c) => currentFactionColor = c,
        stop: () => {
            isRunning = false;
            cancelAnimationFrame(heroReq);
            cancelAnimationFrame(factionReq);
        }
    };
})();
