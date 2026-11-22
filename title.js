/*
  Merrillion title scene: a moonlit village with Santa's sleigh flying across the sky.
  One art style: soft flat shapes, cool moonlight from upper right, warm lamplight from windows.
  Parallax layers (far hills, village, foreground), depth snow with wind, curling chimney smoke.
  Title.start() / Title.stop() are called by game.js when the home screen shows or hides.
*/
(() => {
  "use strict";

  const TAU = Math.PI * 2;
  let canvas = null, ctx = null, raf = 0, W = 0, H = 0, dpr = 1, last = 0, t = 0, visible = true, small = false, io = null;
  let stars = [], snow = [], smoke = [], trail = [], houses = [];
  let layerFar = null, layerMid = null, layerNear = null, glowSprite = null, moonSprite = null, flakeSprite = null;
  const sleigh = { prevY: 0, tilt: 0 };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = (k) => k * k * (3 - 2 * k);                       // one smoothstep for all easing
  const lerp = (a, b, k) => a + (b - a) * k;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mk(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr));
    const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [c, g];
  }

  // Seamless-looping hill: integer frequencies over the layer width.
  const hill = (x, base, amp, k1, k2, p) => base - amp * (Math.sin(x / W * TAU * k1 + p) + 0.35 * Math.sin(x / W * TAU * k2 + p * 1.7));

  function tree(g, x, base, s, col, snowCol) {
    const h = 34 * s, w = 18 * s;
    g.fillStyle = "#2a1c18";
    g.fillRect(x - 1.5 * s, base - 4 * s, 3 * s, 5 * s);
    for (let i = 0; i < 3; i++) {
      const ty = base - 4 * s - i * h * 0.28, tw = w * (1 - i * 0.25);
      g.fillStyle = col;
      g.beginPath(); g.moveTo(x - tw / 2, ty); g.lineTo(x + tw / 2, ty); g.lineTo(x, ty - h * 0.42); g.fill();
      g.fillStyle = snowCol;                                      // moonlit snow on the right shoulder
      g.beginPath(); g.moveTo(x - tw * 0.05, ty - h * 0.38); g.lineTo(x + tw * 0.28, ty - h * 0.08); g.lineTo(x + tw * 0.1, ty - h * 0.02); g.lineTo(x - tw * 0.1, ty - h * 0.2); g.fill();
    }
  }

  function fillHill(g, base, amp, k1, k2, p, top, bottom) {
    const gr = g.createLinearGradient(0, base - amp * 1.4, 0, H);
    gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W + 4; x += 4) g.lineTo(x, hill(x, base, amp, k1, k2, p));
    g.lineTo(W, H); g.fill();
  }

  function moonPos() { return { x: W * 0.72, y: H * 0.3, r: Math.min(W, H) * 0.12 }; }

  function build() {
    small = W < 520;
    stars = Array.from({ length: Math.round(W / (small ? 7 : 4)) }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.6, r: rnd(0.4, 1.2), p: Math.random() * TAU, s: rnd(0.4, 1.4) }));
    // Snow with depth: far = small, slow, faint; near = large, fast, soft.
    snow = [];
    [[0.6, 1.0, 9, 0.42, 1], [1.0, 1.6, 16, 0.62, 2], [1.8, 2.8, 30, 0.8, 4]].forEach(([r0, r1, sp, a, blur], layer) => {
      const n = Math.round(W / (small ? [22, 30, 48][layer] : [12, 18, 30][layer]));
      for (let i = 0; i < n; i++) snow.push({ x: Math.random() * W, y: Math.random() * H, r: rnd(r0, r1), v: sp * rnd(0.8, 1.25), ph: Math.random() * TAU, layer, a, blur });
    });
    // Cached sprites so per-frame work is just drawImage.
    let g;
    [glowSprite, g] = mk(64, 64);
    let gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,196,110,0.55)"); gr.addColorStop(0.5, "rgba(255,170,80,0.16)"); gr.addColorStop(1, "rgba(255,170,80,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    [flakeSprite, g] = mk(16, 16);
    gr = g.createRadialGradient(8, 8, 0, 8, 8, 8);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,0.85)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 16, 16);
    const m = moonPos(), R = m.r * 4;
    [moonSprite, g] = mk(R * 2, R * 2);
    gr = g.createRadialGradient(R, R, m.r * 0.8, R, R, R);
    gr.addColorStop(0, "rgba(236,238,255,0.32)"); gr.addColorStop(0.35, "rgba(190,205,255,0.1)"); gr.addColorStop(1, "rgba(190,205,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, R * 2, R * 2);

    // Far hills: slow, cool, hazy blue.
    let l;
    [layerFar, l] = mk(W, H);
    fillHill(l, H * 0.66, H * 0.045, 1, 3, 0.4, "#46688f", "#2f4a70");
    const nf = Math.round(W / 26);
    for (let i = 0; i < nf; i++) { const x = (i + 0.3) * (W / nf); tree(l, x, hill(x, H * 0.66, H * 0.045, 1, 3, 0.4) + 3, 0.55, "#233e55", "#6f8fb3"); }
    // Mid layer: village hill (houses are drawn live for flicker and smoke).
    [layerMid, l] = mk(W, H);
    fillHill(l, H * 0.78, H * 0.03, 1, 2, 2.1, "#dfe9f6", "#a9bfd8");
    // Near layer: foreground snow bank and big trees.
    [layerNear, l] = mk(W, H);
    const nt = Math.round(W / 70);
    for (let i = 0; i < nt; i++) { const x = (i + 0.5) * (W / nt) + rnd(-10, 10); tree(l, x, hill(x, H * 0.97, H * 0.03, 2, 3, 4.2) + 4, rnd(0.95, 1.3), "#17382f", "#cfe0f2"); }
    fillHill(l, H * 0.97, H * 0.03, 2, 3, 4.2, "#ffffff", "#d3e0ee");

    houses = [];
    const n = Math.max(4, Math.round(W / 74));
    for (let i = 0; i < n; i++) {
      const w = rnd(26, 38), h = rnd(18, 24), x = (i + 0.5) * (W / n) + rnd(-8, 8);
      houses.push({ x, w, h, col: ["#5b2b2b", "#46385c", "#2a4a42", "#59432e"][i % 4], chim: rnd(0.2, 0.65), p1: Math.random() * TAU, p2: Math.random() * TAU, nextPuff: Math.random() * 2, lit: Math.random() < 0.85 });
    }
  }

  function resize() {
    const w = canvas.clientWidth || 360, h = canvas.clientHeight || 220;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w; H = h;
    smoke = []; trail = [];
    build();
  }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#070f22"); g.addColorStop(0.5, "#17305a"); g.addColorStop(1, "#3a5d89");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Aurora: two slow overlapping curtains, very faint.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    [[0.2, 0.012, 0.25, 0.07, 150], [0.28, 0.009, -0.18, 0.05, 175]].forEach(([y0, f, sp, a, hue], j) => {
      const gr = ctx.createLinearGradient(0, H * 0.05, 0, H * 0.5);
      gr.addColorStop(0, "hsla(" + hue + ",90%,60%,0)"); gr.addColorStop(0.5, "hsla(" + hue + ",90%,60%," + a + ")"); gr.addColorStop(1, "hsla(" + hue + ",90%,60%,0)");
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.moveTo(0, H * 0.5);
      for (let x = 0; x <= W; x += 10) ctx.lineTo(x, H * y0 + Math.sin(x * f + t * sp + j) * H * 0.05);
      for (let x = W; x >= 0; x -= 10) ctx.lineTo(x, H * (y0 + 0.2) + Math.sin(x * f * 0.8 + t * sp * 0.8 + j * 2) * H * 0.05);
      ctx.fill();
    });
    ctx.restore();
    ctx.fillStyle = "#fff";
    stars.forEach((s) => {
      ctx.globalAlpha = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
      ctx.fillRect(s.x, s.y, s.r * 1.6, s.r * 1.6);
    });
    ctx.globalAlpha = 1;
  }

  function drawMoon() {
    const m = moonPos(), R = m.r * 4, br = 1 + Math.sin(t * 0.5) * 0.03;   // soft breathing halo
    ctx.globalAlpha = 0.9 + Math.sin(t * 0.5) * 0.1;
    ctx.drawImage(moonSprite, m.x - R * br, m.y - R * br, R * 2 * br, R * 2 * br);
    ctx.globalAlpha = 1;
    const body = ctx.createRadialGradient(m.x - m.r * 0.3, m.y - m.r * 0.3, m.r * 0.1, m.x, m.y, m.r);
    body.addColorStop(0, "#fffbf0"); body.addColorStop(1, "#e9d8b4");
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(180,160,130,0.22)";
    [[-0.3, -0.1, 0.2], [0.28, 0.22, 0.13], [0.05, -0.38, 0.09]].forEach(([dx, dy, rr]) => { ctx.beginPath(); ctx.arc(m.x + dx * m.r, m.y + dy * m.r, rr * m.r, 0, TAU); ctx.fill(); });
  }

  // Scrolling, seamlessly wrapped cached layer.
  function drawLayer(c, speed) {
    const off = (t * speed) % W;
    ctx.drawImage(c, off, 0, W, H);
    ctx.drawImage(c, off - W, 0, W, H);
  }

  const wind = () => 6 + Math.sin(t * 0.23) * 5 + Math.sin(t * 0.61 + 1) * 2.5;     // gentle gusts, px/s

  function drawHouse(hs, ox, dt) {
    const base = H * 0.78, amp = H * 0.03;
    const px = hs.x + ox;
    if (px < -60 || px > W + 60) return;
    const gy = hill(hs.x, base, amp, 1, 2, 2.1) + 3;
    const x = px - hs.w / 2, top = gy - hs.h;
    ctx.fillStyle = "rgba(20,35,60,0.28)";                         // soft contact shadow on the snow
    ctx.beginPath(); ctx.ellipse(px - 3, gy + 1, hs.w * 0.62, 2.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = hs.col; ctx.fillRect(x, top, hs.w, hs.h);
    ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fillRect(x + hs.w * 0.7, top, hs.w * 0.3, hs.h);   // moonlit side
    const cx = x + hs.w * hs.chim;
    ctx.fillStyle = "#3a2a2a"; ctx.fillRect(cx, top - hs.h * 0.52, 5, hs.h * 0.4);
    ctx.fillStyle = "#2a1c22";
    ctx.beginPath(); ctx.moveTo(x - 4, top); ctx.lineTo(x + hs.w + 4, top); ctx.lineTo(x + hs.w / 2, top - hs.h * 0.55); ctx.fill();
    ctx.fillStyle = "#eef4fb";
    ctx.beginPath(); ctx.moveTo(x - 5, top + 1); ctx.lineTo(x + hs.w / 2, top - hs.h * 0.58); ctx.lineTo(x + hs.w + 5, top + 1); ctx.lineTo(x + hs.w + 1, top + 3.5); ctx.lineTo(x + hs.w / 2, top - hs.h * 0.44); ctx.lineTo(x - 1, top + 3.5); ctx.fill();
    ctx.fillRect(cx - 0.5, top - hs.h * 0.55, 6, 1.6);
    const wy = top + hs.h * 0.3, wh = hs.h * 0.32, ww = hs.w * 0.22;
    if (hs.lit) {
      // Candle-like flicker: smooth sum of incommensurate sines, no random popping.
      const f = 0.82 + 0.1 * Math.sin(t * 5.3 + hs.p1) + 0.06 * Math.sin(t * 9.1 + hs.p2) + 0.04 * Math.sin(t * 2.1);
      ctx.globalAlpha = f;
      ctx.drawImage(glowSprite, px - hs.w * 0.9, top + hs.h * 0.45 - hs.w * 0.9, hs.w * 1.8, hs.w * 1.8);
      ctx.fillStyle = "rgb(255," + Math.round(186 + f * 30) + "," + Math.round(92 + f * 30) + ")";
      ctx.fillRect(x + hs.w * 0.17, wy, ww, wh); ctx.fillRect(x + hs.w * 0.61, wy, ww, wh);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = "#26324f";
      ctx.fillRect(x + hs.w * 0.17, wy, ww, wh); ctx.fillRect(x + hs.w * 0.61, wy, ww, wh);
    }
    if (dt > 0) {
      hs.nextPuff -= dt;
      if (hs.nextPuff <= 0 && smoke.length < (small ? 18 : 40)) {
        hs.nextPuff = rnd(0.55, 0.9);
        smoke.push({ hs, lx: cx + 2.5 - px + hs.x - hs.x, y: top - hs.h * 0.52, age: 0, life: rnd(4.5, 6), r0: 2, seed: Math.random() * TAU, ox: cx + 2.5 - hs.x });
      }
    }
  }

  function drawSmoke(dt, ox) {
    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i];
      s.age += dt;
      if (s.age >= s.life) { smoke.splice(i, 1); continue; }
      const k = s.age / s.life;
      const y = s.y - s.age * (7 + 3 * k);
      // Puff drifts with the wind and curls on a widening sine, so it reads as a plume, not a line.
      let x = s.ox + s.hs.x + ox + s.age * wind() * 0.55 * (0.4 + k) + Math.sin(s.age * 1.6 + s.seed) * (1 + 7 * k);
      x = ((x % W) + W) % W;
      const a = Math.min(1, k / 0.12) * (1 - ease(k)) * 0.34;           // eased in and out
      const r = s.r0 + 8 * Math.sqrt(k);
      ctx.fillStyle = "rgba(196,208,228," + a.toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }

  // ---------- Sleigh: eased flight, momentum, gentle sway, sparkle trail ----------
  function drawSanta(dt) {
    const dur = 12, gap = 3.5, cyc = Math.floor(t / (dur + gap)), local = t - cyc * (dur + gap);
    if (local > dur) return;
    const s = Math.max(1.15, Math.min(2, W / 250));
    const k = local / dur;
    const kk = lerp(k, ease(k), 0.35);                                   // gentle ease in and out of speed
    const x = lerp(W + 130 * s, -150 * s, kk);
    const m = moonPos();
    const y = m.y + H * 0.1 - Math.sin(k * Math.PI) * H * 0.2 + Math.sin(k * TAU * 1.6 + cyc) * H * 0.012;   // climbs past the moon, settles
    const vy = dt > 0 ? (y - sleigh.prevY) / dt : 0;
    sleigh.prevY = y;
    const target = Math.max(-0.12, Math.min(0.12, vy / 380));            // pitch follows the climb, low-passed for inertia
    if (Math.abs(vy) < 2000) sleigh.tilt += (target - sleigh.tilt) * Math.min(1, dt * 3);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sleigh.tilt);
    if (window.SleighArt) window.SleighArt.draw(ctx, 0, 0, s, t);
    ctx.restore();
    if (dt > 0 && trail.length < (small ? 50 : 110)) {
      let n = (small ? 22 : 38) * dt + Math.random();
      while (n-- > 1) trail.push({ x: x + rnd(14, 22) * s, y: y + rnd(2, 7) * s, age: 0, life: rnd(0.9, 1.6), r: rnd(0.6, 1.7), vx: rnd(8, 22), vy: rnd(2, 14), tw: Math.random() * TAU });
    }
  }

  function drawTrail(dt) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      p.age += dt;
      if (p.age >= p.life) { trail.splice(i, 1); continue; }
      const k = p.age / p.life;
      p.x += p.vx * dt * (1 - k * 0.6); p.y += p.vy * dt * (1 - k * 0.4);
      ctx.globalAlpha = Math.max(0, (1 - ease(k)) * (0.6 + 0.4 * Math.sin(p.age * 14 + p.tw)) * 0.9);
      const r = p.r * (1 - k * 0.5) * 3.2;
      ctx.drawImage(flakeSprite, p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  function drawSnow(dt, layer) {
    const w = wind() * (0.5 + layer * 0.5);
    for (let i = 0; i < snow.length; i++) {
      const f = snow[i];
      if (f.layer !== layer) continue;
      f.y += f.v * dt;
      f.x += (w + Math.sin(t * 0.9 + f.ph) * 5 * (0.4 + layer * 0.3)) * dt;
      if (f.y > H + 6) { f.y = -6; f.x = Math.random() * W; }
      if (f.x > W + 6) f.x = -6; else if (f.x < -6) f.x = W + 6;
      const r = f.r * (f.blur > 2 ? 2.6 : 2);                          // near flakes are bigger, softer discs
      ctx.globalAlpha = f.a;
      ctx.drawImage(flakeSprite, f.x - r, f.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  function render(dt) {
    drawSky();
    drawMoon();
    drawSnow(dt, 0);
    drawTrail(dt);
    drawSanta(dt);
    drawLayer(layerFar, 2.5);
    drawLayer(layerMid, 5);
    const ox = (t * 5) % W;
    houses.forEach((hs) => { drawHouse(hs, ox, dt); drawHouse(hs, ox - W, 0); });
    drawSmoke(dt, ox);
    drawSnow(dt, 1);
    drawLayer(layerNear, 11);
    drawSnow(dt, 2);
    // Cool vignette seats everything in one light.
    const v = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.5, W / 2, H * 0.5, Math.max(W, H) * 0.8);
    v.addColorStop(0, "rgba(5,10,25,0)"); v.addColorStop(1, "rgba(5,10,25,0.28)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    render(dt);
    raf = visible ? requestAnimationFrame(frame) : 0;
  }

  function start() {
    canvas = document.getElementById("hero-scene");
    if (!canvas) return;
    stop();
    resize();
    last = performance.now();
    if (window.IntersectionObserver && !io) {
      io = new IntersectionObserver((es) => {
        visible = es[es.length - 1].isIntersecting;
        if (visible && !raf && canvas && !document.hidden && !reduced()) { last = performance.now(); raf = requestAnimationFrame(frame); }
      });
      io.observe(canvas);
    }
    if (reduced()) { t = 3.5; render(0); return; }
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  window.addEventListener("resize", () => { if (canvas && canvas.clientWidth) { resize(); if (!raf) render(0); } });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (canvas && !document.getElementById("menu").hidden) start();
  });
  window.Title = { start, stop };
})();
