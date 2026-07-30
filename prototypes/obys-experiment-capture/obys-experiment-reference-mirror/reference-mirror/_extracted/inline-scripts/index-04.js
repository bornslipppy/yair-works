(function() {
  if (window.innerWidth <= 1199) return;

  const style = document.createElement('style');
  style.textContent = `
    #pride-wrap { position: fixed; inset: 0; z-index: -1; pointer-events: none; display: none; }
    #pride-wrap .pride-blur { position: absolute; inset: -10%; filter: blur(50px); }
    #pride-wrap canvas { display: block; width: 100%; height: 100%; }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.id = 'pride-wrap';
  const blurDiv = document.createElement('div');
  blurDiv.className = 'pride-blur';
  const canvas = document.createElement('canvas');
  blurDiv.appendChild(canvas);
  wrap.appendChild(blurDiv);
  document.body.insertBefore(wrap, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let animRunning = false;
  let t = 0;

  function resize() {
    canvas.width = blurDiv.offsetWidth;
    canvas.height = blurDiv.offsetHeight;
  }

  const blobs = [
    {nx:.42,ny:.2, sx:.2, sy:.18,spd:.9, ph:0.0, rx:.95,ry:.85,r:255,g:95, b:75, maxA:.88,minA:.1 },
    {nx:.7, ny:.15,sx:.18,sy:.2, spd:.7, ph:2.1, rx:.8, ry:.75,r:255,g:155,b:65, maxA:.8, minA:.05},
    {nx:.15,ny:.4, sx:.2, sy:.18,spd:.8, ph:1.1, rx:.75,ry:.7, r:90, g:200,b:150,maxA:.65,minA:.05},
    {nx:.05,ny:.6, sx:.15,sy:.22,spd:.65,ph:3.3, rx:.7, ry:.75,r:70, g:150,b:235,maxA:.6, minA:.08},
    {nx:.55,ny:.75,sx:.2, sy:.16,spd:.75,ph:4.2, rx:.85,ry:.75,r:155,g:105,b:225,maxA:.65,minA:.08},
    {nx:.85,ny:.55,sx:.16,sy:.2, spd:.68,ph:5.1, rx:.72,ry:.78,r:205,g:120,b:215,maxA:.55,minA:.05},
    {nx:.35,ny:.5, sx:.14,sy:.18,spd:.55,ph:0.8, rx:.65,ry:.7, r:250,g:185,b:90, maxA:.5, minA:.05},
  ];
  const whites = [
    {nx:.75,ny:.12,sx:.14,sy:.12,spd:.5,ph:0.5,r:.65},
    {nx:.25,ny:.7, sx:.18,sy:.14,spd:.4,ph:2.8,r:.55},
    {nx:.6, ny:.45,sx:.16,sy:.16,spd:.6,ph:1.6,r:.5},
  ];

  function drawFrame() {
    if (!animRunning) return;
    const W = canvas.width, H = canvas.height, S = Math.min(W, H);
    ctx.fillStyle = '#bdd0da';
    ctx.fillRect(0, 0, W, H);
    blobs.forEach(b => {
      const px = (b.nx + Math.sin(t*.0018*b.spd+b.ph)*b.sx)*W;
      const py = (b.ny + Math.cos(t*.0014*b.spd+b.ph*1.3)*b.sy)*H;
      const opA = (Math.sin(t*.0012*b.spd+b.ph*2)*.5+.5);
      const op = b.minA + (b.maxA-b.minA)*opA;
      const breath = 1 + Math.sin(t*.0009*b.spd+b.ph)*.12;
      const rx = b.rx*S*.8*breath, ry = b.ry*S*.72*breath;
      const rad = Math.max(rx, ry);
      const g = ctx.createRadialGradient(px,py,0,px,py,rad);
      g.addColorStop(0,  `rgba(${b.r},${b.g},${b.b},${op})`);
      g.addColorStop(.4, `rgba(${b.r},${b.g},${b.b},${op*.5})`);
      g.addColorStop(.8, `rgba(${b.r},${b.g},${b.b},${op*.1})`);
      g.addColorStop(1,  `rgba(${b.r},${b.g},${b.b},0)`);
      ctx.save();
      ctx.translate(px,py); ctx.scale(rx/rad, ry/rad); ctx.translate(-px,-py);
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      ctx.restore();
    });
    whites.forEach(w => {
      const px = (w.nx+Math.sin(t*.001*w.spd+w.ph)*w.sx)*W;
      const py = (w.ny+Math.cos(t*.0008*w.spd+w.ph*1.4)*w.sy)*H;
      const op = (Math.sin(t*.0008*w.spd+w.ph*3)*.5+.5)*.7;
      const g = ctx.createRadialGradient(px,py,0,px,py,w.r*S);
      g.addColorStop(0,   `rgba(255,252,248,${op})`);
      g.addColorStop(.5,  `rgba(240,248,255,${op*.4})`);
      g.addColorStop(1,   `rgba(189,208,218,0)`);
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    });
    t++;
    requestAnimationFrame(drawFrame);
  }

  function clearBg(val) {
    ['.page-wrapper', '.main-frame'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.style.backgroundColor = val;
    });
  }

  window.showPride = function() {
    wrap.style.display = 'block';
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';
    clearBg('transparent');
    if (window.ControlsAPI) {
      window.ControlsAPI.set('whitewash_mode', false);
      window.ControlsAPI.set('bw_mode', false);
    }
    if (!animRunning) { animRunning = true; resize(); drawFrame(); }
  };

  window.hidePride = function() {
    wrap.style.display = 'none';
    document.documentElement.style.backgroundColor = '';
    clearBg('');
    if (window.ControlsAPI) {
      window.ControlsAPI.set('whitewash_mode', true);
      window.ControlsAPI.set('bw_mode', true);
    }
    animRunning = false;
  };

  window.addEventListener('resize', () => { if (animRunning) resize(); });

  window.addEventListener('load', () => {
    const isPride = localStorage.getItem('obys-color-mode') === 'calm';
    if (!isPride) return;
    setTimeout(() => {
      if (window.ControlsAPI) {
        window.ControlsAPI.set('whitewash_mode', false);
        window.ControlsAPI.set('bw_mode', false);
      }
    }, 800);
  });
})();
