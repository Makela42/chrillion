/*
  Merrillion background: a cozy animated Christmas night.
  Creates <canvas id="bg-scene"> behind everything. API: BgScene.start(), .stop(), .setMood("menu"|"game"|"summary")
  Static layers are pre-rendered once per resize; only stars, aurora, lights, smoke, snow and sleigh are live.
*/
(() => {
  "use strict";
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const MOODS = { menu: { dim: 0, speed: 1, snow: 1, warm: 0 }, game: { dim: 0.35, speed: 0.4, snow: 0.7, warm: 0 }, summary: { dim: 0.05, speed: 1, snow: 1.7, warm: 1 } };
  let cur = { ...MOODS.menu }, from = { ...cur }, to = { ...cur }, mt = 1;

  let canvas = null, ctx = null, raf = 0, running = false, last = 0, T = 0;
  let W = 0, H = 0, dpr = 1, S = 1;
  let sky = null, moonSpr = null, flakeSpr = [], auroraSpr = null;
  let layers = [], stars = [], snow = [], lights = [], windows = [], chimneys = [], smoke = [];
  let moon = { x: 0, y: 0, r: 0 };
  let shoot = null, nextShoot = 5, sleighT = -1, nextSleigh = 8;

  // ---------- hill shape: periodic in tile width so it wraps seamlessly ----------
  function hillFn(seed, amp, base) {
    const h = [];
    for (let k = 1; k <= 4; k++) h.push({ k: k + (seed % 2), p: rnd(0, TAU), a: amp / (k * 0.9) });
    return x => { let y = base; for (const o of h) y += Math.sin(x / W * TAU * o.k + o.p) * o.a; return y; };
  }

  function tree(g, x, y, h, col, snowCol) {
    const w = h * 0.42;
    g.fillStyle = col;
    g.beginPath();
    const tiers = 4;
    g.moveTo(x, y - h);
    for (let i = 1; i <= tiers; i++) {
      const ty = y - h + (h * i) / tiers, tw = (w * i) / tiers;
      g.lineTo(x + tw * 0.5, ty - h * 0.02); g.lineTo(x + tw * 0.28, ty - h * 0.02);
    }
    g.lineTo(x + w * 0.08, y); g.lineTo(x - w * 0.08, y);
    for (let i = tiers; i >= 1; i--) {
      const ty = y - h + (h * i) / tiers, tw = (w * i) / tiers;
      g.lineTo(x - tw * 0.28, ty - h * 0.02); g.lineTo(x - tw * 0.5, ty - h * 0.02);
    }
    g.closePath(); g.fill();
    // snow caps
    g.fillStyle = snowCol;
    for (let i = 1; i <= tiers; i++) {
      const ty = y - h + (h * i) / tiers, tw = (w * i) / tiers;
      g.beginPath(); g.moveTo(x - tw * 0.5, ty - h * 0.02); g.quadraticCurveTo(x, ty - h * 0.2, x + tw * 0.5, ty - h * 0.02);
      g.quadraticCurveTo(x, ty - h * 0.1, x - tw * 0.5, ty - h * 0.02); g.fill();
    }
  }

  function cabin(g, x, y, w, h) {
    g.fillStyle = "#2a1a22"; g.fillRect(x, y - h, w, h);
    g.fillStyle = "#e9eefc"; // snowy roof
    g.beginPath(); g.moveTo(x - w * 0.12, y - h + 1); g.lineTo(x + w / 2, y - h - w * 0.38); g.lineTo(x + w * 1.12, y - h + 1); g.closePath(); g.fill();
    g.fillStyle = "#4a2d34";
    g.beginPath(); g.moveTo(x - w * 0.04, y - h + 3); g.lineTo(x + w / 2, y - h - w * 0.3); g.lineTo(x + w * 1.04, y - h + 3); g.closePath(); g.fill();
    // chimney
    const cx = x + w * 0.72;
    g.fillStyle = "#3b2530"; g.fillRect(cx, y - h - w * 0.42, w * 0.14, w * 0.3);
    g.fillStyle = "#e9eefc"; g.fillRect(cx - 1, y - h - w * 0.45, w * 0.14 + 2, 2);
    return { chim: [cx + w * 0.07, y - h - w * 0.45] };
  }

  // ---------- build everything for the current viewport ----------
  function build() {
    const cw = innerWidth, ch = innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.max(320, Math.round(cw)); H = Math.max(320, Math.round(ch));
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    W = cw; H = ch;
    S = clamp(Math.min(W, H * 1.2) / 800, 0.55, 1.4);
    const area = W * H, N = clamp(area / 1e6, 0.25, 2);

    // sky
    sky = mk(W * dpr, H * dpr);
    let g = sky.getContext("2d"); g.scale(dpr, dpr);
    let gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#070d24"); gr.addColorStop(0.45, "#1a1442"); gr.addColorStop(0.75, "#4a2158"); gr.addColorStop(1, "#c25a5a");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    let hg = g.createRadialGradient(W * 0.35, H * 0.88, 0, W * 0.35, H * 0.88, W * 0.8);
    hg.addColorStop(0, "rgba(255,170,90,0.45)"); hg.addColorStop(1, "rgba(255,170,90,0)");
    g.fillStyle = hg; g.fillRect(0, 0, W, H);

    // moon
    moon = { x: W * (W < 600 ? 0.72 : 0.78), y: H * 0.2, r: clamp(Math.min(W, H) * 0.06, 20, 52) };
    const ms = moon.r * 5; moonSpr = mk(ms * dpr, ms * dpr); g = moonSpr.getContext("2d"); g.scale(dpr, dpr);
    const c = ms / 2;
    let mg = g.createRadialGradient(c, c, moon.r * 0.8, c, c, c);
    mg.addColorStop(0, "rgba(255,244,210,0.45)"); mg.addColorStop(0.3, "rgba(200,210,255,0.14)"); mg.addColorStop(1, "rgba(200,210,255,0)");
    g.fillStyle = mg; g.fillRect(0, 0, ms, ms);
    let bg = g.createRadialGradient(c - moon.r * 0.3, c - moon.r * 0.3, 0, c, c, moon.r);
    bg.addColorStop(0, "#fffbe8"); bg.addColorStop(1, "#f1e3b5");
    g.fillStyle = bg; g.beginPath(); g.arc(c, c, moon.r, 0, TAU); g.fill();
    g.fillStyle = "rgba(190,170,130,0.35)";
    [[-0.3, -0.2, 0.18], [0.25, 0.15, 0.22], [-0.1, 0.4, 0.12], [0.35, -0.35, 0.1]].forEach(([a, b, r]) => { g.beginPath(); g.arc(c + a * moon.r, c + b * moon.r, r * moon.r, 0, TAU); g.fill(); });

    // aurora vertical gradient sprite (bright at base, fading up)
    auroraSpr = mk(1, 128); g = auroraSpr.getContext("2d");
    const ag = g.createLinearGradient(0, 0, 0, 128);
    ag.addColorStop(0, "rgba(255,255,255,0)"); ag.addColorStop(0.7, "rgba(255,255,255,0.55)"); ag.addColorStop(0.92, "rgba(255,255,255,1)"); ag.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = ag; g.fillRect(0, 0, 1, 128);
    auroraSpr.tints = [[60, 255, 170], [40, 220, 220], [255, 110, 190]].map(([r, gg, b]) => {
      const t = mk(1, 128), tg = t.getContext("2d"); tg.drawImage(auroraSpr, 0, 0);
      tg.globalCompositeOperation = "source-in"; tg.fillStyle = `rgb(${r},${gg},${b})`; tg.fillRect(0, 0, 1, 128); return t;
    });

    // snowflake sprites (soft)
    flakeSpr = [0, 1, 2].map(i => {
      const r = [2, 4, 8][i] * 2, t = mk(r * 2 * dpr, r * 2 * dpr), tg = t.getContext("2d"); tg.scale(dpr, dpr);
      const fg = tg.createRadialGradient(r, r, 0, r, r, r);
      const core = [0.9, 0.6, 0.35][i];
      fg.addColorStop(0, "rgba(255,255,255,1)"); fg.addColorStop(core, "rgba(255,255,255," + [0.9, 0.55, 0.25][i] + ")"); fg.addColorStop(1, "rgba(255,255,255,0)");
      tg.fillStyle = fg; tg.fillRect(0, 0, r * 2, r * 2); t.r = r; return t;
    });

    // stars
    stars = Array.from({ length: Math.round(90 * N + 30) }, () => ({ x: rnd(0, W), y: rnd(0, H * 0.55) ** 1 * 1, r: rnd(0.5, 1.5), p: rnd(0, TAU), s: rnd(0.6, 2.2), c: Math.random() < 0.2 ? "#ffd9a8" : "#e6ecff" }));

    // hill layers
    layers = []; lights = []; windows = []; chimneys = []; smoke = [];
    const defs = [
      { base: 0.70, amp: 0.035, col: ["#2b2a5e", "#1c1a45"], tree: "#232a55", tH: 34, td: 52, speed: 2.5, rim: "rgba(180,190,255,0.35)", lit: false },
      { base: 0.79, amp: 0.04, col: ["#1d2a4f", "#14173a"], tree: "#14283f", tH: 50, td: 46, speed: 5, rim: "rgba(210,225,255,0.5)", lit: true, village: true },
      { base: 0.90, amp: 0.045, col: ["#10223a", "#0a1226"], tree: "#0a2a2a", tH: 84, td: 70, speed: 9, rim: "rgba(235,242,255,0.75)", lit: true }
    ];
    defs.forEach((d, li) => {
      const tile = mk(W * dpr, H * dpr); const t = tile.getContext("2d"); t.scale(dpr, dpr);
      const fn = hillFn(li + 1, H * d.amp, H * d.base);
      const hg2 = t.createLinearGradient(0, H * (d.base - 0.06), 0, H);
      hg2.addColorStop(0, d.col[0]); hg2.addColorStop(1, d.col[1]);
      t.fillStyle = hg2; t.beginPath(); t.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) t.lineTo(x, fn(x));
      t.lineTo(W, H); t.closePath(); t.fill();
      // snowy rim
      t.strokeStyle = d.rim; t.lineWidth = 2 * (0.6 + li * 0.4); t.beginPath();
      for (let x = 0; x <= W; x += 4) { const y = fn(x); x ? t.lineTo(x, y) : t.moveTo(x, y); }
      t.stroke();
      const tl = []; const win = []; const ch = [];
      // village on layer 1
      if (d.village) {
        const n = Math.max(3, Math.round(W / 260));
        for (let i = 0; i < n; i++) {
          const cwid = rnd(26, 38) * S, chh = rnd(18, 26) * S, cx = (i + rnd(0.2, 0.8)) * (W / n);
          const cy = fn(cx + cwid / 2) + 4;
          const r = cabin(t, cx, cy, cwid, chh);
          ch.push(r.chim);
          win.push({ x: cx + cwid * 0.2, y: cy - chh * 0.7, w: cwid * 0.24, h: chh * 0.42, p: rnd(0, TAU), s: rnd(1.5, 3.5) });
          win.push({ x: cx + cwid * 0.56, y: cy - chh * 0.7, w: cwid * 0.24, h: chh * 0.42, p: rnd(0, TAU), s: rnd(1.5, 3.5) });
          // a couple of trees beside
          tree(t, cx - rnd(10, 20) * S, fn(cx) + 3, rnd(20, 30) * S, d.tree, "rgba(235,242,255,0.9)");
        }
      }
      const dist = d.td * S;
      for (let x = rnd(0, dist); x < W; x += rnd(0.6, 1.5) * dist) {
        const h = d.tH * S * rnd(0.6, 1.25);
        tree(t, x, fn(x) + 4 * S, h, d.tree, "rgba(235,242,255," + (0.55 + li * 0.2) + ")");
        if (d.lit && Math.random() < (li === 2 ? 0.6 : 0.45)) {
          const cols = ["#ff4a4a", "#ffd45a", "#5ad7ff", "#7dff8a", "#ff8ad8"];
          for (let k = 0; k < 6; k++) {
            const f = (k + 1) / 7, yy = fn(x) + 4 * S - h + h * (0.25 + f * 0.65), half = h * 0.2 * (0.3 + f * 0.9);
            tl.push({ x: x + (k % 2 ? 1 : -1) * half * rnd(0.3, 0.95), y: yy, c: cols[(Math.random() * cols.length) | 0], p: rnd(0, TAU), s: rnd(1.2, 3.2), r: (li === 2 ? 2.2 : 1.5) * S });
          }
        }
      }
      layers.push({ tile, x: rnd(0, W), speed: d.speed, tl, win, ch, li });
    });
    layers.forEach(L => { if (L.ch.length) chimneys = L.ch.map(p => ({ p, L })); });
    smoke = [];

    // snow
    const count = Math.round(130 * N * (W < 600 ? 1.3 : 1) + 40);
    snow = Array.from({ length: Math.round(count * 1.8) }, (_, i) => makeFlake(i, true));
    snow.cap = count;
  }

  function makeFlake(i, init) {
    const z = Math.random(); // 0 far .. 1 near
    return { x: rnd(0, W), y: init ? rnd(0, H) : -20, z, v: (14 + z * z * 70) * rnd(0.8, 1.2), ph: rnd(0, TAU), sw: rnd(0.4, 1.2), idx: i };
  }

  // ---------- drawing ----------
  function drawAurora(a) {
    ctx.globalCompositeOperation = "lighter";
    const step = Math.max(3, Math.round(W / 320));
    for (let r = 0; r < 3; r++) {
      const spr = auroraSpr.tints[r], baseY = H * (0.22 + r * 0.05), alpha = (r === 2 ? 0.18 : 0.3) * a;
      for (let x = -step; x < W + step; x += step) {
        const u = x / W;
        const w1 = Math.sin(u * 5 + T * 0.18 * (r + 1) + r * 2) , w2 = Math.sin(u * 11 - T * 0.25 + r), w3 = Math.sin(u * 2.3 + T * 0.07 + r * 4);
        const y = baseY + w1 * H * 0.05 + w3 * H * 0.04;
        const hgt = H * (0.2 + 0.07 * w2 + 0.06 * w3) * (r === 2 ? 0.7 : 1);
        const env = 0.55 + 0.45 * Math.sin(u * 3.1 + T * 0.12 + r * 1.7);
        ctx.globalAlpha = clamp(alpha * env * (0.7 + 0.3 * w2), 0, 1);
        ctx.drawImage(spr, x, y - hgt, step + 1, hgt);
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  }

  function drawSleigh(x, y, s, f) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = "#0b0716"; ctx.strokeStyle = "#0b0716"; ctx.lineWidth = 0.8;
    // sleigh
    ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(8, -2); ctx.lineTo(7, 4); ctx.quadraticCurveTo(0, 6, -9, 4); ctx.quadraticCurveTo(-10, 0, -6, -2); ctx.fill();
    ctx.beginPath(); ctx.arc(-1, -4, 2.6, 0, TAU); ctx.fill();   // santa
    ctx.beginPath(); ctx.arc(-1, -7, 1.4, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, 6.5); ctx.quadraticCurveTo(0, 8, 9, 5.5); ctx.stroke();
    // reindeer, 3 pairs
    for (let i = 0; i < 3; i++) {
      const rx = 14 + i * 12, bob = Math.sin(f * 7 + i) * 0.9;
      ctx.beginPath(); ctx.moveTo(rx - 14 + 14, -1); ctx.lineTo(rx, -1 + bob * 0.3); ctx.lineWidth = 0.4; ctx.stroke(); ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(rx + 3, bob, 3.2, 1.7, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(rx + 6.4, bob - 1.6, 1.1, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(rx + 6.8, bob - 2.4); ctx.lineTo(rx + 7.6, bob - 4.4); ctx.moveTo(rx + 7.2, bob - 3.4); ctx.lineTo(rx + 5.8, bob - 4.2); ctx.lineWidth = 0.5; ctx.stroke(); ctx.lineWidth = 0.8;
      const lg = Math.sin(f * 7 + i * 1.3) * 1.5;
      ctx.beginPath(); ctx.moveTo(rx + 1, bob + 1); ctx.lineTo(rx - 1 + lg, bob + 4); ctx.moveTo(rx + 5, bob + 1); ctx.lineTo(rx + 7 - lg, bob + 3.6); ctx.lineWidth = 0.6; ctx.stroke(); ctx.lineWidth = 0.8;
    }
    ctx.fillStyle = "#ff5a4a"; ctx.beginPath(); ctx.arc(14 + 24 + 8.2, -1.6, 0.8, 0, TAU); ctx.fill(); // rudolph nose
    ctx.restore();
  }

  function frame(dt) {
    const m = cur, sp = m.speed;
    T += dt * sp;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(sky, 0, 0, W, H);

    // stars
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(T * s.s + s.p);
      ctx.globalAlpha = tw * 0.9; ctx.fillStyle = s.c;
      ctx.fillRect(s.x - s.r / 2, s.y - s.r / 2, s.r, s.r);
    }
    ctx.globalAlpha = 1;
    // moon (gentle pulse)
    ctx.globalAlpha = 0.95 + 0.05 * Math.sin(T * 0.5);
    const ms = moon.r * 5; ctx.drawImage(moonSpr, moon.x - ms / 2, moon.y - ms / 2, ms, ms);
    ctx.globalAlpha = 1;
    drawAurora(1);

    // shooting star
    if (!reduce) {
      nextShoot -= dt;
      if (!shoot && nextShoot <= 0) { shoot = { x: rnd(W * 0.1, W * 0.7), y: rnd(0, H * 0.25), t: 0, vx: rnd(380, 520) * (W < 600 ? 0.7 : 1), vy: rnd(120, 200) }; nextShoot = rnd(9, 18); }
      if (shoot) {
        shoot.t += dt; shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
        const a = Math.sin(clamp(shoot.t / 1.1, 0, 1) * Math.PI);
        const gr = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 0.2, shoot.y - shoot.vy * 0.2);
        gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(shoot.x - shoot.vx * 0.2, shoot.y - shoot.vy * 0.2); ctx.stroke();
        if (shoot.t > 1.1) shoot = null;
      }
      // sleigh
      nextSleigh -= dt;
      if (sleighT < 0 && nextSleigh <= 0) { sleighT = 0; nextSleigh = 25; }
    }
    if (sleighT >= 0) {
      sleighT += dt * (0.6 + 0.4 * sp);
      const u = sleighT / 16;
      if (u > 1) sleighT = -1;
      else {
        const x = -90 + (W + 180) * u, y = moon.y + moon.r * 0.15 + Math.sin(u * TAU * 1.5) * 4 - (u - 0.5) * H * 0.04;
        drawSleigh(x, y, clamp(S * 1.1, 0.7, 1.4), sleighT);
      }
    }

    // hills
    for (let i = 0; i < layers.length; i++) {
      const L = layers[i];
      L.x = (L.x + L.speed * dt * sp * S) % W;
      const ox = -L.x;
      ctx.drawImage(L.tile, ox, 0, W, H); ctx.drawImage(L.tile, ox + W, 0, W, H);
      // lights
      if (L.tl.length) for (const l of L.tl) {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(T * l.s + l.p));
        for (let k = 0; k < 2; k++) {
          const x = l.x + ox + k * W; if (x < -6 || x > W + 6) continue;
          ctx.globalAlpha = tw * 0.35; ctx.fillStyle = l.c; ctx.beginPath(); ctx.arc(x, l.y, l.r * 2.6, 0, TAU); ctx.fill();
          ctx.globalAlpha = tw; ctx.beginPath(); ctx.arc(x, l.y, l.r * 0.8, 0, TAU); ctx.fill();
        }
      }
      if (L.win.length) for (const w of L.win) {
        const f = 0.8 + 0.2 * Math.sin(T * w.s + w.p) + 0.05 * Math.sin(T * 13 + w.p * 3);
        for (let k = 0; k < 2; k++) {
          const x = w.x + ox + k * W; if (x < -20 || x > W + 20) continue;
          ctx.globalAlpha = 0.25 * f; ctx.fillStyle = "#ff9b3a"; ctx.fillRect(x - 2, w.y - 2, w.w + 4, w.h + 4);
          ctx.globalAlpha = f; ctx.fillStyle = "#ffd070"; ctx.fillRect(x, w.y, w.w, w.h);
        }
      }
      ctx.globalAlpha = 1;
      if (L.ch.length) {
        // smoke emitters
        if (!reduce && smoke.length < 40 * (W / 1000 + 0.5) && Math.random() < dt * sp * 2.2 * L.ch.length) {
          const c = L.ch[(Math.random() * L.ch.length) | 0]; smoke.push({ x: c[0] + L.x * 0 - L.x, y: c[1], t: 0, life: rnd(4, 6.5), r: rnd(2.5, 4) * S, k: Math.random() < 0.5 ? 0 : 1, L });
        }
        for (let j = smoke.length - 1; j >= 0; j--) {
          const s = smoke[j]; s.t += dt * sp; const u = s.t / s.life;
          if (u >= 1) { smoke.splice(j, 1); continue; }
          const x = s.x + L.x * 0 + (L.x - L.x) + 0, wob = Math.sin(s.t * 1.3 + j) * 3 + u * 22 * S;
          for (let k = 0; k < 2; k++) {
            const px = s.x + (k ? W : 0) + wob - (L.x - L.x) ; const sx = px + (-0) + (0);
            const dx = sx + (L.x) - L.x;
            void dx;
          }
          const sx = s.x + wob + (-0) , sy = s.y - u * 70 * S;
          // smoke is anchored to the world: shift with layer scroll
          const wx = ((sx + 0) % W + W) % W;
          for (let k = -1; k <= 1; k++) {
            const px = wx + k * W - ((L.x - (s.L0 === undefined ? (s.L0 = L.x) : s.L0)));
            const pxx = px; void pxx;
          }
          const scroll = L.x - (s.L0 === undefined ? (s.L0 = L.x) : s.L0);
          const drawX = ((s.x0 === undefined ? (s.x0 = s.x + L.x) : s.x0) - L.x + wob) ;
          const xx = ((drawX % W) + W) % W;
          void scroll;
          ctx.globalAlpha = (1 - u) * (u < 0.1 ? u * 10 : 1) * 0.35; ctx.fillStyle = "#cfd6ee";
          ctx.beginPath(); ctx.arc(xx, sy, s.r * (1 + u * 2.5), 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    // mood dim + warm tint (before snow so flakes stay crisp)
    if (m.dim > 0.001) { ctx.fillStyle = `rgba(4,6,20,${m.dim})`; ctx.fillRect(0, 0, W, H); }
    if (m.warm > 0.001) { ctx.globalAlpha = m.warm * 0.12; ctx.fillStyle = "#ff9a4a"; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }

    // snow
    const n = Math.min(snow.length, Math.round(snow.cap * m.snow));
    const wind = Math.sin(T * 0.25) * 18 + 10;
    for (let i = 0; i < n; i++) {
      const f = snow[i];
      f.y += f.v * dt * sp * S; f.x += (wind * (0.3 + f.z) + Math.sin(T * f.sw + f.ph) * 14 * (0.4 + f.z)) * dt * sp;
      if (f.y > H + 12) { f.y = -12; f.x = rnd(0, W); }
      if (f.x > W + 12) f.x = -12; else if (f.x < -12) f.x = W + 12;
      const spr = flakeSpr[f.z < 0.55 ? 0 : f.z < 0.88 ? 1 : 2], sz = spr.r * 2 * (0.7 + f.z * 0.3) * S;
      ctx.globalAlpha = 0.45 + f.z * 0.5;
      ctx.drawImage(spr, f.x - sz / 2, f.y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- loop / API ----------
  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    if (mt < 1) {
      mt = Math.min(1, mt + dt / 0.8);
      const e = mt * mt * (3 - 2 * mt);
      for (const k in cur) cur[k] = from[k] + (to[k] - from[k]) * e;
    }
    frame(dt);
  }

  function ensure() {
    if (canvas) return;
    const st = document.createElement("style"); st.id = "bg-css";
    st.textContent = "#bg-scene{position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block}";
    document.head.appendChild(st);
    canvas = document.createElement("canvas"); canvas.id = "bg-scene"; canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext("2d");
    let rt = 0, lw = innerWidth, lh = innerHeight;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (innerWidth === lw && Math.abs(innerHeight - lh) < 120 && innerWidth < 600) return; lw = innerWidth; lh = innerHeight; build(); if (reduce || !running) frame(0); }, 150);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf), raf = 0; }
      else if (running && !reduce) { last = performance.now(); raf = requestAnimationFrame(tick); }
    });
    build();
  }

  function start() {
    ensure();
    if (reduce) { T = 3; frame(0); return; }
    if (running) return;
    running = true; last = performance.now();
    if (!document.hidden) raf = requestAnimationFrame(tick);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function setMood(name) {
    const t = MOODS[name]; if (!t) return;
    from = { ...cur }; to = { ...t }; mt = 0;
    if (reduce || !running) { cur = { ...t }; mt = 1; if (canvas) frame(0); }
  }

  window.BgScene = { start, stop, setMood };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
