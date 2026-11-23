/*
  Drillion title scene: a cosy dental surgery. Molly the Molar bounces on a mint dental chair under a glowing lamp,
  toothpaste bubbles float up, a toothbrush sweeps past and a little drill buzzes now and then.
  Title.start() / Title.stop() are called by game.js when the home screen shows or hides.
*/
(() => {
  "use strict";
  const INK = "#0f3a40", ENAMEL = "#fbfaf5", MINT = "#bfe8d9", DMINT = "#2f9d83", PINK = "#e8818a", CORAL = "#ef5a4c",
    GOLD = "#e0a92b", SILVER = "#9aa6ad", BLUE = "#2b6fb0";
  const rnd = (a, b) => a + Math.random() * (b - a);
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOOTH = "M20 9C26 7 29 11 32 11C35 11 38 7 44 9C52 12 52 22 49 30C47 37 47 46 44 53C42 58 38 57 37 51C36 46 34 42 32 42C30 42 28 46 27 51C26 57 22 58 20 53C17 46 17 37 15 30C12 22 12 12 20 9Z";
  let toothPath = null;

  let canvas = null, ctx = null, raf = 0, W = 0, H = 0, last = 0, T = 0, running = false;
  let bubbles = [], sparks = [], drillAt = 3, drillT = -1;

  function mkBubble(initial) {
    return { x: rnd(0.06, 0.94) * W, y: initial ? rnd(0, H) : H + 10, r: rnd(3, 8), sp: rnd(14, 30), ph: rnd(0, 6.28), a: rnd(0.45, 0.8) };
  }
  function resize() {
    const cssW = canvas.clientWidth || 360, cssH = canvas.clientHeight || 220;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = cssW; H = cssH;
    bubbles = Array.from({ length: Math.round(W / 40) }, () => mkBubble(true));
    sparks = [];
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }
  function ink(fill, lw = 2) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke(); }
  function line(pts, lw = 2, col = INK) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); }
  function circ(x, y, r, fill, lw = 2) { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); if (lw) ink(fill, lw); else { ctx.fillStyle = fill; ctx.fill(); } }

  function molly(cx, base, s, t, buzz) {
    const bounce = Math.abs(Math.sin(t * 3.2));
    const y = base - bounce * 16 * s, sq = 1 - 0.06 * (1 - bounce), st = 1 + 0.05 * (1 - bounce);
    // shadow
    ctx.fillStyle = "rgba(15,58,64,.18)"; ctx.beginPath(); ctx.ellipse(cx, base + 2, 22 * s * (1 - bounce * 0.25), 4 * s, 0, 0, 6.2832); ctx.fill();
    ctx.save();
    ctx.translate(cx + (buzz ? Math.sin(t * 90) * 0.8 : 0), y);
    ctx.scale(s * st, s * sq);
    ctx.translate(-32, -58);
    ctx.lineWidth = 2 / s;
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.fillStyle = ENAMEL; ctx.strokeStyle = INK;
    ctx.fill(toothPath); ctx.stroke(toothPath);
    // arms
    const wave = Math.sin(t * 6) * 3;
    line([[15, 33], [8, 36 + wave * 0.3], [6, 30 + wave]], 2.4 / s);
    line([[49, 34], [56, 31], [57, 24 - wave]], 2.4 / s);
    // toothbrush in right hand
    ctx.save(); ctx.translate(57, 24 - wave); ctx.rotate(-0.2);
    rr(-2.2, -26, 4.4, 28, 2); ink(MINT, 1.6 / s);
    rr(-4.6, -31, 9.2, 8, 2); ink(BLUE, 1.6 / s);
    ctx.restore();
    // shine + face
    line([[19, 15], [17, 21], [18, 26]], 2.2 / s, "#fff");
    const blink = (t % 3.4) > 3.28;
    ctx.fillStyle = INK;
    if (blink) { line([[24, 26], [28, 26]], 1.8 / s); line([[36, 26], [40, 26]], 1.8 / s); }
    else { ctx.beginPath(); ctx.arc(26, 26, 1.9, 0, 6.2832); ctx.arc(38, 26, 1.9, 0, 6.2832); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(26.6, 25.3, 0.6, 0, 6.2832); ctx.arc(38.6, 25.3, 0.6, 0, 6.2832); ctx.fill(); }
    ctx.fillStyle = PINK; ctx.beginPath(); ctx.ellipse(22, 30.5, 3, 2, 0, 0, 6.2832); ctx.ellipse(42, 30.5, 3, 2, 0, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.moveTo(28.4, 29.5); ctx.quadraticCurveTo(32, 34 + bounce * 2, 35.6, 29.5); ctx.strokeStyle = INK; ctx.lineWidth = 1.8 / s; ctx.stroke();
    ctx.restore();
  }

  function chair(cx, base, s) {
    ctx.save(); ctx.translate(cx, base); ctx.scale(s, s);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    // base + stem
    rr(-26, -4, 52, 8, 3); ink(SILVER, 2 / s);
    rr(-5, -26, 10, 24, 2); ink(SILVER, 2 / s);
    // seat
    rr(-40, -40, 80, 16, 8); ink(DMINT, 2 / s);
    rr(-40, -44, 80, 8, 4); ink("#6fcfb3", 2 / s);
    // back rest
    ctx.beginPath(); ctx.moveTo(-40, -42); ctx.lineTo(-48, -86); ctx.quadraticCurveTo(-46, -96, -36, -94); ctx.lineTo(-30, -92); ctx.lineTo(-26, -44); ctx.closePath(); ink(MINT, 2 / s);
    ctx.restore();
  }

  function lamp(cx, t) {
    const sw = Math.sin(t * 0.7) * 2.5;
    // glow cone
    const g = ctx.createRadialGradient(cx + sw, H * 0.5, 4, cx + sw, H * 0.5, H * 0.75);
    g.addColorStop(0, "rgba(255,244,190,.55)"); g.addColorStop(1, "rgba(255,244,190,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(cx - 16 + sw, 36); ctx.lineTo(cx + 16 + sw, 36); ctx.lineTo(cx + 70 + sw, H); ctx.lineTo(cx - 70 + sw, H); ctx.closePath(); ctx.fill();
    // arm
    line([[cx - 40, 0], [cx - 40, 10], [cx + sw * 0.5, 18]], 3);
    line([[cx + sw * 0.5, 18], [cx + sw, 28]], 3);
    ctx.beginPath(); ctx.moveTo(cx - 22 + sw, 38); ctx.quadraticCurveTo(cx + sw, 20, cx + 22 + sw, 38); ctx.closePath(); ink(SILVER, 2);
    ctx.beginPath(); ctx.ellipse(cx + sw, 39, 18, 4.5, 0, 0, 6.2832); ink("#fff3b0", 2);
  }

  function drill(x, y, t, buzz) {
    ctx.save(); ctx.translate(x + (buzz ? Math.sin(t * 120) * 0.9 : 0), y);
    line([[10, 40], [10, -4]], 2.5, INK);
    ctx.save(); ctx.rotate(-0.25);
    rr(-5, -26, 13, 28, 4); ink(ENAMEL, 2);
    rr(-5, -4, 13, 4, 1); ink(DMINT, 1.6);
    line([[-1, -26], [-1, -36]], 2.6);
    ctx.restore();
    ctx.restore();
    if (buzz) { ctx.strokeStyle = "rgba(15,58,64,.35)"; ctx.lineWidth = 1.4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x - 6, y - 36, 5 + i * 4, 3.4, 5); ctx.stroke(); } }
  }

  function draw(dt) {
    // wall + tiles
    ctx.fillStyle = "#e3f6ee"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(47,157,131,.18)"; ctx.lineWidth = 1;
    const wallB = H * 0.74;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, wallB); ctx.stroke(); }
    for (let y = 0; y < wallB; y += 30) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
    // floor
    ctx.fillStyle = MINT; ctx.fillRect(0, wallB, W, H - wallB);
    line([[0, wallB], [W, wallB]], 2);

    const s = Math.min(1, W / 360) * Math.min(1.15, H / 220);
    const cx = W * 0.46, base = H * 0.9;

    // wall poster (tooth) and shelf
    ctx.save(); rr(W * 0.06, H * 0.2, 44, 54, 6); ink(ENAMEL, 2); ctx.restore();
    ctx.save(); ctx.translate(W * 0.06 + 22 - 14, H * 0.2 + 8); ctx.scale(0.44, 0.44); ctx.lineWidth = 3; ctx.fillStyle = MINT; ctx.strokeStyle = INK; ctx.fill(toothPath); ctx.stroke(toothPath); ctx.restore();

    lamp(cx, T);

    // drill state machine
    let buzz = false;
    if (!reduce) {
      drillAt -= dt;
      if (drillAt <= 0 && drillT < 0) { drillT = 0; }
      if (drillT >= 0) {
        drillT += dt; buzz = true;
        if (Math.random() < dt * 40) sparks.push({ x: W * 0.84 - 6, y: base - 50 * s, vx: rnd(-50, 10), vy: rnd(-70, -10), life: 0.5 });
        if (drillT > 1.1) { drillT = -1; drillAt = rnd(4, 7); }
      }
    }
    chair(cx, base, s);
    molly(cx - 2 * s, base - 46 * s, 1.0 * s * 1.0, T, buzz);
    drill(W * 0.84, base - 6 * s, T, buzz);

    // sweeping toothbrush
    const ph = (T / 6) % 1, bx = -60 + ph * (W + 120), by = H * 0.3 + Math.sin(ph * 6.2832 * 2) * 8;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.sin(ph * 6.2832 * 2) * 0.12 + 0.1);
    rr(-24, -3.5, 40, 7, 3.5); ink(MINT, 2); rr(14, -9, 14, 16, 3); ink(ENAMEL, 2);
    line([[17, -9], [17, -14], [22, -9], [22, -15], [27, -9], [27, -14]], 2.4, BLUE);
    ctx.restore();

    // bubbles
    for (const b of bubbles) {
      b.y -= b.sp * dt; b.ph += dt * 1.6;
      if (b.y < -12) Object.assign(b, mkBubble(false));
      const x = b.x + Math.sin(b.ph) * 6;
      ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, 6.2832);
      ctx.fillStyle = `rgba(255,255,255,${b.a * 0.55})`; ctx.fill();
      ctx.strokeStyle = `rgba(47,157,131,${b.a})`; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.beginPath(); ctx.arc(x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.22, 0, 6.2832); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill();
    }
    // sparks
    sparks = sparks.filter((p) => (p.life -= dt) > 0);
    for (const p of sparks) {
      p.vy += 160 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.fillStyle = p.life > 0.25 ? GOLD : CORAL; ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.6, 2.6);
    }
    // soft frame vignette
    const v = ctx.createLinearGradient(0, 0, 0, H);
    v.addColorStop(0, "rgba(15,58,64,.10)"); v.addColorStop(0.2, "rgba(15,58,64,0)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; T += dt;
    draw(dt);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    const c = document.getElementById("hero-scene");
    if (!c) return;
    if (c !== canvas) canvas = c;
    if (!toothPath) toothPath = new Path2D(TOOTH);
    cancelAnimationFrame(raf);
    resize();
    running = true; last = performance.now();
    if (reduce) { T = 0.55; draw(0.016); return; }
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else if (running && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } });
  window.Title = { start, stop };
})();
