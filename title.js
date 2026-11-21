/*
  Chrillion title scene: a moonlit village with Santa's sleigh flying across the sky.
  Drawn with smooth canvas shapes (not pixels) so it moves fluidly at full frame rate.
  Title.start() / Title.stop() are called by game.js when the home screen shows or hides.
*/
(() => {
  "use strict";

  let canvas = null, ctx = null, raf = 0, W = 0, H = 0, dpr = 1, last = 0, t = 0;
  let stars = [], snow = [], smoke = [], trail = [], houses = [], trees = [];
  const rnd = (a, b) => a + Math.random() * (b - a);

  function build() {
    stars = Array.from({ length: Math.round(W / 4) }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.6, r: rnd(0.4, 1.4), p: Math.random() * 6.28, s: rnd(0.6, 2) }));
    snow = [];
    [[0.5, 0.9, 10], [0.9, 1.5, 18], [1.4, 2.1, 30]].forEach(([r0, r1, sp], layer) => {
      for (let i = 0; i < Math.round(W / (10 + layer * 5)); i++) snow.push({ x: Math.random() * W, y: Math.random() * H, r: rnd(r0, r1), v: sp * rnd(0.8, 1.3), ph: Math.random() * 6.28, layer });
    });
    // A little village along the middle hill.
    houses = [];
    const n = Math.max(4, Math.round(W / 70));
    for (let i = 0; i < n; i++) {
      const w = rnd(26, 40), h = rnd(18, 26);
      houses.push({ x: (i + 0.5) * (W / n) + rnd(-10, 10), w, h, col: ["#5b2b2b", "#4a3a5e", "#2d4f45", "#5a4430"][i % 4], chim: rnd(0.2, 0.7), flick: Math.random() * 6.28 });
    }
    trees = Array.from({ length: Math.round(W / 34) }, (_, i) => ({ x: (i / (W / 34)) * W + rnd(-8, 8), s: rnd(0.7, 1.25), layer: i % 3 === 0 ? 0 : 1 }));
  }

  function resize() {
    const w = canvas.clientWidth || 360, h = canvas.clientHeight || 220;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w; H = h;
    build();
  }

  const hill = (x, base, amp, freq, phase) => base - Math.sin(x * freq + phase) * amp - Math.sin(x * freq * 2.3 + phase * 1.7) * amp * 0.35;

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#081428");
    g.addColorStop(0.55, "#1b3560");
    g.addColorStop(1, "#3b5d86");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // A soft aurora ribbon.
    ctx.save();
    ctx.globalAlpha = 0.16;
    const a = ctx.createLinearGradient(0, H * 0.1, 0, H * 0.45);
    a.addColorStop(0, "rgba(80,255,180,0)");
    a.addColorStop(0.5, "rgba(80,255,180,1)");
    a.addColorStop(1, "rgba(80,255,180,0)");
    ctx.fillStyle = a;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.25);
    for (let x = 0; x <= W; x += 12) ctx.lineTo(x, H * 0.22 + Math.sin(x * 0.012 + t * 0.25) * H * 0.06);
    for (let x = W; x >= 0; x -= 12) ctx.lineTo(x, H * 0.36 + Math.sin(x * 0.01 + t * 0.2 + 1) * H * 0.05);
    ctx.fill();
    ctx.restore();
    stars.forEach((s) => {
      ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(t * s.s + s.p));
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function moonPos() { return { x: W * 0.7, y: H * 0.3, r: Math.min(W, H) * 0.13 }; }
  function drawMoon() {
    const m = moonPos();
    const glow = ctx.createRadialGradient(m.x, m.y, m.r * 0.6, m.x, m.y, m.r * 3.2);
    glow.addColorStop(0, "rgba(255,240,205,0.45)");
    glow.addColorStop(1, "rgba(255,240,205,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(m.x - m.r * 3.2, m.y - m.r * 3.2, m.r * 6.4, m.r * 6.4);
    const body = ctx.createRadialGradient(m.x - m.r * 0.3, m.y - m.r * 0.3, m.r * 0.2, m.x, m.y, m.r);
    body.addColorStop(0, "#fffaf0");
    body.addColorStop(1, "#f0dcb4");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = "rgba(200,175,140,0.35)";
    [[-0.3, -0.1, 0.18], [0.25, 0.2, 0.12], [0.05, -0.35, 0.09]].forEach(([dx, dy, rr]) => { ctx.beginPath(); ctx.arc(m.x + dx * m.r, m.y + dy * m.r, rr * m.r, 0, 6.283); ctx.fill(); });
  }

  function fillHill(base, amp, freq, phase, top, bottom) {
    const g = ctx.createLinearGradient(0, base - amp, 0, H);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) ctx.lineTo(x, hill(x, base, amp, freq, phase));
    ctx.lineTo(W, H);
    ctx.fill();
  }

  function drawTree(x, base, s, col, snowCol) {
    const h = 34 * s, w = 18 * s;
    ctx.fillStyle = "#3a2618";
    ctx.fillRect(x - 1.5 * s, base - 4 * s, 3 * s, 5 * s);
    for (let i = 0; i < 3; i++) {
      const ty = base - 4 * s - i * h * 0.28, tw = w * (1 - i * 0.25);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x - tw / 2, ty);
      ctx.lineTo(x + tw / 2, ty);
      ctx.lineTo(x, ty - h * 0.42);
      ctx.fill();
      ctx.fillStyle = snowCol;
      ctx.beginPath();
      ctx.moveTo(x - tw * 0.22, ty - h * 0.26);
      ctx.lineTo(x + tw * 0.22, ty - h * 0.26);
      ctx.lineTo(x, ty - h * 0.42);
      ctx.fill();
    }
  }

  function drawVillage(dt) {
    const base = H * 0.78;
    houses.forEach((hs) => {
      const gy = hill(hs.x, base, H * 0.03, 0.009, 2.1) + 3;
      const x = hs.x - hs.w / 2, top = gy - hs.h;
      ctx.fillStyle = hs.col;
      ctx.fillRect(x, top, hs.w, hs.h);
      // Roof with snow.
      ctx.fillStyle = "#2a1c22";
      ctx.beginPath();
      ctx.moveTo(x - 4, top);
      ctx.lineTo(x + hs.w + 4, top);
      ctx.lineTo(x + hs.w / 2, top - hs.h * 0.55);
      ctx.fill();
      ctx.fillStyle = "#f4f7fb";
      ctx.beginPath();
      ctx.moveTo(x - 5, top + 1);
      ctx.lineTo(x + hs.w / 2, top - hs.h * 0.58);
      ctx.lineTo(x + hs.w + 5, top + 1);
      ctx.lineTo(x + hs.w + 1, top + 3);
      ctx.lineTo(x + hs.w / 2, top - hs.h * 0.45);
      ctx.lineTo(x - 1, top + 3);
      ctx.fill();
      // Chimney and smoke.
      const cx = x + hs.w * hs.chim;
      ctx.fillStyle = "#3b2a2a";
      ctx.fillRect(cx, top - hs.h * 0.5, 5, hs.h * 0.4);
      if (Math.random() < dt * 1.6) smoke.push({ x: cx + 2.5, y: top - hs.h * 0.5, r: 2.5, a: 0.35, vx: rnd(2, 6) });
      // Warm, flickering windows.
      const glow = 0.75 + 0.25 * Math.sin(t * 3 + hs.flick) * Math.sin(t * 1.3 + hs.flick);
      ctx.fillStyle = `rgba(255,${190 + glow * 30},${90 + glow * 40},${glow})`;
      ctx.fillRect(x + hs.w * 0.18, top + hs.h * 0.3, hs.w * 0.22, hs.h * 0.3);
      ctx.fillRect(x + hs.w * 0.6, top + hs.h * 0.3, hs.w * 0.22, hs.h * 0.3);
      ctx.fillStyle = "rgba(255,210,120,0.12)";
      ctx.beginPath();
      ctx.arc(x + hs.w / 2, top + hs.h * 0.5, hs.w * 0.9, 0, 6.283);
      ctx.fill();
    });
    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i];
      s.y -= 9 * dt; s.x += s.vx * dt; s.r += 3 * dt; s.a -= 0.09 * dt;
      if (s.a <= 0) { smoke.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(210,220,235,${s.a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fill();
    }
  }

  // ---------- Santa's sleigh (silhouette with rim light, galloping reindeer) ----------
  function drawReindeer(x, y, s, phase, lead) {
    const leg = Math.sin(phase) * 0.6;
    ctx.strokeStyle = "#0e1628";
    ctx.lineWidth = 1.6 * s;
    ctx.lineCap = "round";
    // Legs (front pair and back pair swing opposite ways for a gallop).
    [[-6, leg], [-3, -leg * 0.8], [6, -leg], [9, leg * 0.8]].forEach(([lx, a]) => {
      ctx.beginPath();
      ctx.moveTo(x + lx * s, y + 2 * s);
      ctx.lineTo(x + lx * s + Math.sin(a) * 6 * s, y + 2 * s + Math.cos(a) * 7 * s);
      ctx.stroke();
    });
    ctx.fillStyle = "#0e1628";
    ctx.beginPath();
    ctx.ellipse(x + 1.5 * s, y, 8.5 * s, 3.6 * s, -0.08, 0, 6.283);
    ctx.fill();
    // Neck and head.
    ctx.beginPath();
    ctx.moveTo(x - 6 * s, y - 1 * s);
    ctx.lineTo(x - 10 * s, y - 7 * s);
    ctx.lineTo(x - 8 * s, y - 8 * s);
    ctx.lineTo(x - 3 * s, y - 2 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - 12 * s, y - 8.2 * s, 3.4 * s, 2 * s, -0.2, 0, 6.283);
    ctx.fill();
    // Antlers.
    ctx.lineWidth = 1.1 * s;
    ctx.beginPath();
    ctx.moveTo(x - 10.5 * s, y - 10 * s); ctx.lineTo(x - 9 * s, y - 15 * s); ctx.lineTo(x - 6.5 * s, y - 16 * s);
    ctx.moveTo(x - 9.6 * s, y - 13 * s); ctx.lineTo(x - 12 * s, y - 15 * s);
    ctx.stroke();
    if (lead) {   // Rudolph's glowing nose
      const nx = x - 15.2 * s, ny = y - 8.4 * s;
      const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 9 * s);
      g.addColorStop(0, "rgba(255,60,60,0.9)");
      g.addColorStop(1, "rgba(255,60,60,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(nx, ny, 9 * s, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#ff4a4a";
      ctx.beginPath(); ctx.arc(nx, ny, 1.6 * s, 0, 6.283); ctx.fill();
    }
  }

  function drawSleigh(x, y, s) {
    ctx.fillStyle = "#0e1628";
    // Sleigh body.
    ctx.beginPath();
    ctx.moveTo(x - 10 * s, y - 2 * s);
    ctx.quadraticCurveTo(x - 12 * s, y - 10 * s, x - 6 * s, y - 9 * s);
    ctx.lineTo(x + 14 * s, y - 9 * s);
    ctx.quadraticCurveTo(x + 18 * s, y - 9 * s, x + 17 * s, y + 2 * s);
    ctx.lineTo(x - 8 * s, y + 2 * s);
    ctx.fill();
    // Santa and his sack.
    ctx.beginPath(); ctx.arc(x + 9 * s, y - 13 * s, 5 * s, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 4 * s, y - 16 * s, 3 * s, 0, 6.283); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 2 * s, y - 18 * s); ctx.lineTo(x + 7 * s, y - 24 * s); ctx.lineTo(x + 7 * s, y - 18 * s);
    ctx.fill();
    // Golden runner with a moonlit rim.
    ctx.strokeStyle = "#e9b949";
    ctx.lineWidth = 1.4 * s;
    ctx.beginPath();
    ctx.moveTo(x - 13 * s, y + 1 * s);
    ctx.quadraticCurveTo(x - 16 * s, y + 6 * s, x - 9 * s, y + 6 * s);
    ctx.lineTo(x + 18 * s, y + 6 * s);
    ctx.stroke();
    // Reins.
    ctx.strokeStyle = "rgba(233,185,73,0.7)";
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.moveTo(x + 5 * s, y - 12 * s);
    ctx.quadraticCurveTo(x - 30 * s, y - 2 * s, x - 62 * s, y - 4 * s);
    ctx.stroke();
  }

  function drawSanta(dt) {
    const period = 11;
    const p = (t % period) / period;
    if (p > 0.82) return;                          // a pause between fly-bys
    const k = p / 0.82;
    const s = Math.max(1.15, Math.min(2, W / 250));
    const x = W + 120 * s - k * (W + 280 * s);
    const m = moonPos();
    const y = m.y + Math.sin(k * Math.PI) * -H * 0.12 + H * 0.06 + Math.sin(t * 3) * 2;
    const tilt = Math.cos(k * Math.PI) * 0.08;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    if (window.SleighArt) window.SleighArt.draw(ctx, 0, 0, s, t);   // full-colour Santa, sleigh and reindeer
    ctx.restore();
    // Sparkle trail.
    if (Math.random() < dt * 40) trail.push({ x: x + 16 * s, y: y + 4 * s, a: 1, r: rnd(0.8, 2), vx: rnd(10, 30), vy: rnd(-4, 8) });
  }

  function drawTrail(dt) {
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      p.a -= dt * 0.9; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.a <= 0) { trail.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(255,224,140,${p.a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
    }
  }

  function drawSnow(dt, layer) {
    snow.forEach((f) => {
      if (f.layer !== layer) return;
      f.y += f.v * dt;
      f.x += Math.sin(t * 0.8 + f.ph) * 6 * dt;
      if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
      ctx.globalAlpha = 0.5 + layer * 0.22;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, 6.283);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    drawSky();
    drawMoon();
    drawSnow(dt, 0);
    drawTrail(dt);
    drawSanta(dt);
    fillHill(H * 0.74, H * 0.05, 0.007, 0.4, "#335274", "#22395a");
    trees.filter((tr) => tr.layer === 0).forEach((tr) => drawTree(tr.x, hill(tr.x, H * 0.74, H * 0.05, 0.007, 0.4) + 4, tr.s * 0.75, "#1a3a33", "#dce8f2"));
    fillHill(H * 0.8, H * 0.03, 0.009, 2.1, "#e9f1f8", "#b9cde0");
    drawVillage(dt);
    drawSnow(dt, 1);
    fillHill(H * 0.95, H * 0.035, 0.013, 4.2, "#ffffff", "#d7e4ef");
    trees.filter((tr) => tr.layer === 1).forEach((tr, i) => { if (i % 2 === 0) drawTree(tr.x, hill(tr.x, H * 0.95, H * 0.035, 0.013, 4.2) + 4, tr.s, "#1f4a3c", "#ffffff"); });
    drawSnow(dt, 2);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    canvas = document.getElementById("hero-scene");
    if (!canvas) return;
    stop();
    resize();
    last = performance.now();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { t = 3.5; frame(last); cancelAnimationFrame(raf); raf = 0; return; }
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  window.addEventListener("resize", () => { if (raf && canvas) resize(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (canvas && !document.getElementById("menu").hidden) start();
  });
  window.Title = { start, stop };
})();
