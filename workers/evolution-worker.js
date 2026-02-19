// Evolution Web Worker - Runs evolution in background thread
self.importScripts('../js/utils/geometry.js','../js/utils/color-utils.js','../js/utils/image-utils.js');

let config = null;
let polygons = [];
let bestPolys = [];
let bestError = Infinity;
let generation = 0;
let running = false;

self.onmessage = function(e) {
    const { type, data } = e.data;
    switch(type) {
        case 'init': init(data); break;
        case 'start': start(); break;
        case 'stop': running = false; break;
        case 'step': step(); break;
    }
};

function init(data) {
    config = data.config;
    polygons = data.polygons || generateRandom(config.polygonCount || 50);
    bestPolys = clone(polygons);
    bestError = evaluate(polygons);
    generation = data.generation || 0;
    postMessage({ type: 'initialized', generation, fitness: getFitness() });
}

function start() {
    running = true;
    evolveLoop();
}

function evolveLoop() {
    if (!running) return;
    for (let i = 0; i < (config.speed || 10); i++) {
        mutateOne();
    }
    postMessage({ type: 'update', generation, fitness: getFitness(), polygons: bestPolys });
    setTimeout(evolveLoop, 0);
}

function step() {
    mutateOne();
    postMessage({ type: 'step', generation, fitness: getFitness(), polygons: bestPolys });
}

function mutateOne() {
    const idx = Math.floor(Math.random() * polygons.length);
    const candidate = clone(polygons);
    candidate[idx] = mutate(polygons[idx]);
    const error = evaluate(candidate);
    if (error < bestError) {
        polygons = candidate;
        bestPolys = clone(candidate);
        bestError = error;
    }
    generation++;
}

function mutate(polygon) {
    const type = Math.random();
    const p = { ...polygon, pts: polygon.pts.map(pt => [pt[0], pt[1]]) };
    const W = config.width || 200, H = config.height || 200;
    if (type < 0.35) {
        const dx = (Math.random() - 0.5) * W * 0.2, dy = (Math.random() - 0.5) * H * 0.2;
        p.pts = p.pts.map(([x, y]) => [Math.max(0, Math.min(W, x + dx)), Math.max(0, Math.min(H, y + dy))]);
    } else if (type < 0.6) {
        const s = 0.5 + Math.random() * 1.5, cx = (p.pts[0][0]+p.pts[1][0]+p.pts[2][0])/3, cy = (p.pts[0][1]+p.pts[1][1]+p.pts[2][1])/3;
        p.pts = p.pts.map(([x, y]) => [cx+(x-cx)*s, cy+(y-cy)*s]);
    } else if (type < 0.8) {
        const c = ['r', 'g', 'b'][Math.floor(Math.random() * 3)];
        p[c] = Math.max(0, Math.min(255, p[c] + (Math.random() - 0.5) * 80));
    } else {
        p.a = Math.max(20, Math.min(220, p.a + (Math.random() - 0.5) * 60));
    }
    return p;
}

function evaluate(polys) {
    if (!config.targetData) return Infinity;
    // Simplified worker evaluation (OffscreenCanvas if available)
    if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(config.width, config.height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, config.width, config.height);
        for (const p of polys) {
            ctx.beginPath(); ctx.moveTo(p.pts[0][0], p.pts[0][1]);
            for (let i = 1; i < p.pts.length; i++) ctx.lineTo(p.pts[i][0], p.pts[i][1]);
            ctx.closePath(); ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a/255})`; ctx.fill();
        }
        const id = ctx.getImageData(0, 0, config.width, config.height);
        const d = id.data, t = config.targetData;
        let err = 0;
        for (let i = 0; i < d.length; i += 8) { const dr=d[i]-t[i],dg=d[i+1]-t[i+1],db=d[i+2]-t[i+2]; err+=dr*dr+dg*dg+db*db; }
        return err * 8;
    }
    return bestError; // Fallback
}

function getFitness() { return 100 * (1 - bestError / (255*255*3*config.width*config.height)); }
function generateRandom(count) { const p = []; for (let i = 0; i < count; i++) { const cx=Math.random()*200,cy=Math.random()*200,sz=5+Math.random()*20,pts=[]; for(let j=0;j<3;j++){const a=(j/3)*Math.PI*2,r=sz*(0.5+Math.random());pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);} p.push({pts,r:Math.floor(Math.random()*255),g:Math.floor(Math.random()*255),b:Math.floor(Math.random()*255),a:Math.floor(40+Math.random()*100)});} return p; }
function clone(polys) { return polys.map(p => ({...p, pts: p.pts.map(pt => [pt[0], pt[1]])})); }
