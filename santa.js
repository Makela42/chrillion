/* Merrillion hero: Santa's sleigh flies across the night sky and drops presents.
   Self-contained: needs <canvas id="hero-santa"> inside "#menu .hero" plus santa-sheet.webp and gift-1..3.png. */
(function () {
  'use strict';
  var hero = document.querySelector('#menu .hero');
  var cv = document.getElementById('hero-santa');
  if (!hero || !cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');

  // The canvas sits above the hero background and below the text.
  var st = document.createElement('style');
  st.textContent = '#hero-santa{position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;pointer-events:none;display:block}' +
    '#menu .hero .hero-text{z-index:2}';
  document.head.appendChild(st);

  // ---- sprite sheet: 16 frames, 640x260 each, laid out horizontally
  var FRAMES = 16, FW = 640, FH = 260, FPS = 14;
  var sheet = new Image(), sheetOk = false;
  sheet.onload = function () { sheetOk = true; draw(); };
  sheet.src = 'santa-sheet.webp';
  var gifts = [1, 2, 3].map(function (n) { var i = new Image(); i.src = 'gift-' + n + '.png'; return i; });

  // ---- soft sparkle sprite (pre-rendered once)
  var spark = document.createElement('canvas'); spark.width = spark.height = 32;
  (function () {
    var g = spark.getContext('2d'), r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,236,170,0.8)');
    r.addColorStop(1, 'rgba(255,214,120,0)');
    g.fillStyle = r; g.fillRect(0, 0, 32, 32);
  })();

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1;
  var CROSS = 9;                      // seconds to cross
  var state = 'fly';                  // fly | wait
  var u = 0.3, wait = 0, flyT = 0;    // start already in view so the card is never empty
  var animT = 0;                      // sprite clock, independent of path
  var parts = [], drops = [], dropped = [false, false, false], sparkAcc = 0;
  var DROP_AT = [0.36, 0.52, 0.68];
  var visible = true, tabVisible = !document.hidden, raf = 0, last = 0;

  function size() {
    var r = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(r.width), h = Math.round(r.height);
    if (!w || !h) { W = H = 0; return; }
    if (w !== W || h !== H || cv.width !== Math.round(w * dpr)) {
      W = w; H = h;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    }
  }
  function sprW() { return Math.max(150, Math.min(W * 0.44, 180)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smooth(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }

  // Path in card pixels for progress p (0..1) + elapsed seconds. Returns center x/y and tilt.
  function pathAt(p, t) {
    var sw = sprW(), x0 = W + sw * 0.48, x1 = -sw * 0.48;
    function pos(q, tt) {
      var e = 0.4 * ease(q) + 0.6 * q;
      var x = x0 + (x1 - x0) * e;
      var base = sw * 0.21 + 12;
      var y = base - Math.sin(Math.PI * q) * 8 + Math.sin(tt * 2.1) * 4.5;
      return { x: x, y: y };
    }
    var a = pos(p, t), b = pos(Math.min(1, p + 0.004), t);
    var slope = (b.x - a.x) ? (b.y - a.y) / (b.x - a.x) : 0;     // dy/dx, nose-up when positive here
    return { x: a.x, y: a.y, rot: Math.atan(slope) * 0.8 + Math.sin(t * 2.1 + 0.6) * 0.012 };
  }

  function spawnDrop(pt, sw) {
    var k = drops.length % 3;
    var s = Math.max(30, Math.min(42, sw * 0.1));
    var c = Math.cos(pt.rot), sn = Math.sin(pt.rot);
    var lx = sw * 0.36, ly = sw * 0.06;           // under the sack, relative to sprite center
    drops.push({
      img: gifts[k], x: pt.x + lx * c - ly * sn, y: pt.y + lx * sn + ly * c,
      vx: 36 + Math.random() * 14, vy: -20, rot: (Math.random() - 0.5) * 0.6,
      vr: (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.8), s: s, age: 0
    });
  }

  function step(dt) {
    animT += dt;
    if (state === 'fly') {
      flyT += dt; u += dt / CROSS;
      for (var i = 0; i < 3; i++) if (!dropped[i] && u >= DROP_AT[i]) { dropped[i] = true; spawnDrop(pathAt(u, animT), sprW()); }
      var pt = pathAt(Math.min(u, 1), animT);
      sparkAcc += dt * 46;
      while (sparkAcc >= 1) {
        sparkAcc -= 1;
        var sw = sprW(), c = Math.cos(pt.rot), sn = Math.sin(pt.rot);
        var lx = sw * (0.44 + Math.random() * 0.03), ly = (Math.random() - 0.35) * sw * 0.16;
        parts.push({
          x: pt.x + lx * c - ly * sn, y: pt.y + lx * sn + ly * c,
          vx: 14 + Math.random() * 22, vy: (Math.random() - 0.2) * 14,
          life: 0, max: 0.9 + Math.random() * 0.8, r: 2.5 + Math.random() * 4.5
        });
      }
      if (u >= 1) { state = 'wait'; wait = 4 + Math.random() * 2; }
    } else {
      wait -= dt;
      if (wait <= 0) { state = 'fly'; u = 0; flyT = 0; dropped = [false, false, false]; }
    }
    for (var j = parts.length - 1; j >= 0; j--) {
      var p = parts[j]; p.life += dt;
      if (p.life >= p.max) { parts.splice(j, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 8 * dt;
    }
    for (var k = drops.length - 1; k >= 0; k--) {
      var d = drops[k]; d.age += dt;
      d.vy += 560 * dt; d.vx *= (1 - 0.35 * dt);
      d.x += d.vx * dt; d.y += d.vy * dt; d.rot += d.vr * dt;
      if (d.y > H * 0.9 || d.age > 4) drops.splice(k, 1);
    }
  }

  function draw() {
    size();
    if (!W) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var sw = sprW(), sh = sw * FH / FW;
    var pt, frame;
    if (reduce) { pt = { x: W * 0.56, y: sh * 0.5 + 12, rot: 0 }; frame = 2; }
    else { pt = pathAt(Math.max(0, Math.min(1, u)), animT); frame = Math.floor(animT * FPS) % FRAMES; }

    // sparkle trail (additive)
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], a = 1 - p.life / p.max, r = p.r * (0.6 + 0.6 * a);
      ctx.globalAlpha = a * a * 0.85;
      ctx.drawImage(spark, p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

    // sleigh
    if (sheetOk && (reduce || state === 'fly')) {
      ctx.save();
      ctx.translate(pt.x, pt.y); ctx.rotate(pt.rot);
      ctx.drawImage(sheet, frame * FW, 0, FW, FH, -sw / 2, -sh / 2, sw, sh);
      ctx.restore();
    }

    // gifts
    for (var k = 0; k < drops.length; k++) {
      var d = drops[k];
      var fade = 1 - smooth(H * 0.5, H * 0.86, d.y);
      if (fade <= 0.01 || !d.img.complete) continue;
      var pop = Math.min(1, d.age / 0.18);
      ctx.save(); ctx.globalAlpha = fade;
      ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.scale(pop, pop);
      ctx.drawImage(d.img, -d.s / 2, -d.s / 2, d.s, d.s);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    raf = 0;
    if (!visible || !tabVisible) return;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    step(dt); draw();
    raf = requestAnimationFrame(loop);
  }
  function kick() {
    if (reduce) { draw(); return; }
    if (visible && tabVisible && !raf) { last = 0; raf = requestAnimationFrame(loop); }
  }

  document.addEventListener('visibilitychange', function () { tabVisible = !document.hidden; if (tabVisible) kick(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) kick(); }, { threshold: 0.01 }).observe(hero);
  }
  if ('ResizeObserver' in window) new ResizeObserver(function () { draw(); kick(); }).observe(hero);
  else window.addEventListener('resize', function () { draw(); kick(); });

  draw();      // synchronous first frame so a load-time screenshot shows the sleigh
  kick();
})();
