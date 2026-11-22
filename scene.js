/*
  Merrillion run strip: the same moonlit world as the title scene, in a slim window above the prompt.
  Even prompts: Santa hops roof to roof delivering presents. Odd prompts: the sleigh crosses as the timer runs down.
  Parallax hills + village, depth snow with wind, chimney smoke, flickering windows, glowing moon.
  Scene.play(n) / Scene.stop() / Scene.react("miss"|"good") are called by game.js. Paused when hidden or offscreen.
*/
(() => {
  "use strict";

  const TAU = Math.PI * 2;
  let canvas = null, ctx = null, raf = 0, W = 0, H = 0, dpr = 1, last = 0, t = 0, kind = 0, visible = true, small = false, io = null, startedAt = 0, active = false;
  let stars = [], snow = [], smoke = [], sparks = [], hcache = new Map();
  let layerFar = null, layerMid = null, layerNear = null, glowSprite = null, moonSprite = null, flakeSprite = null, vignette = null;
  let cam = 0, camSmooth = 0, santa = null, gift = null, stumble = 0, cheer = 0, tilt = 0, prevSleighY = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = (k) => k * k * (3 - 2 * k);
  const lerp = (a, b, k) => a + (b - a) * k;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seed = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const secs = () => (window.CONFIG && CONFIG.secondsPerPrompt) || 25;

  function mk(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr));
    const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [c, g];
  }
  const hill = (x, base, amp, k1, k2, p) => base - amp * (Math.sin(x / W * TAU * k1 + p) + 0.35 * Math.sin(x / W * TAU * k2 + p * 1.7));
  const gy = () => H * 0.86;

  function tree(g, x, base, s, col, snowCol) {
    const h = 34 * s, w = 18 * s;
    g.fillStyle = "#2a1c18"; g.fillRect(x - 1.5 * s, base - 4 * s, 3 * s, 5 * s);
    for (let i = 0; i < 3; i++) {
      const ty = base - 4 * s - i * h * 0.28, tw = w * (1 - i * 0.25);
      g.fillStyle = col;
      g.beginPath(); g.moveTo(x - tw / 2, ty); g.lineTo(x + tw / 2, ty); g.lineTo(x, ty - h * 0.42); g.fill();
      g.fillStyle = snowCol;
      g.beginPath(); g.moveTo(x - tw * 0.05, ty - h * 0.38); g.lineTo(x + tw * 0.28, ty - h * 0.08); g.lineTo(x + tw * 0.1, ty - h * 0.02); g.lineTo(x - tw * 0.1, ty - h * 0.2); g.fill();
    }
  }
  function fillHill(g, base, amp, k1, k2, p, top, bottom) {
    const gr = g.createLinearGradient(0, base - amp * 1.4, 0, H);
    gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W + 4; x += 4) g.lineTo(x, hill(x, base, amp, k1, k2, p));
    g.lineTo(W, H); g.fill();
  }

  function build() {
    small = W < 520;
    stars = Array.from({ length: Math.round(W / (small ? 14 : 9)) }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.5, r: rnd(0.4, 1), p: Math.random() * TAU, s: rnd(0.4, 1.4) }));
    snow = [];
    [[0.5, 0.9, 9, 0.4, 1], [0.9, 1.4, 16, 0.6, 2], [1.4, 2.1, 30, 0.75, 4]].forEach(([r0, r1, sp, a, blur], layer) => {
      const n = Math.round(W / (small ? [34, 48, 80][layer] : [20, 30, 50][layer]));
      for (let i = 0; i < n; i++) snow.push({ x: Math.random() * W, y: Math.random() * H, r: rnd(r0, r1), v: sp * rnd(0.8, 1.25), ph: Math.random() * TAU, layer, a, blur });
    });
    let g, gr;
    [glowSprite, g] = mk(64, 64);
    gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,196,110,0.55)"); gr.addColorStop(0.5, "rgba(255,170,80,0.16)"); gr.addColorStop(1, "rgba(255,170,80,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    [flakeSprite, g] = mk(16, 16);
    gr = g.createRadialGradient(8, 8, 0, 8, 8, 8);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,0.85)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 16, 16);
    const R = H * 0.55;
    [moonSprite, g] = mk(R * 2, R * 2);
    gr = g.createRadialGradient(R, R, H * 0.1, R, R, R);
    gr.addColorStop(0, "rgba(236,238,255,0.34)"); gr.addColorStop(0.4, "rgba(190,205,255,0.1)"); gr.addColorStop(1, "rgba(190,205,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, R * 2, R * 2);

    let l;
    [layerFar, l] = mk(W, H);
    fillHill(l, H * 0.6, H * 0.06, 1, 3, 0.4, "#46688f", "#2f4a70");
    for (let i = 0, nf = Math.round(W / 30); i < nf; i++) { const x = (i + 0.3) * (W / nf); tree(l, x, hill(x, H * 0.6, H * 0.06, 1, 3, 0.4) + 3, 0.42, "#233e55", "#6f8fb3"); }
    // Mid layer: dim distant village with tiny warm windows, drawn once.
    [layerMid, l] = mk(W, H);
    fillHill(l, H * 0.76, H * 0.025, 1, 2, 2.1, "#b9cde4", "#8ea8c6");
    const nm = Math.round(W / 46);
    for (let i = 0; i < nm; i++) {
      const x = (i + 0.5) * (W / nm) + rnd(-6, 6), w = rnd(14, 20), h = rnd(9, 13), by = hill(x, H * 0.76, H * 0.025, 1, 2, 2.1) + 2;
      l.fillStyle = "#3b4a6b"; l.fillRect(x - w / 2, by - h, w, h);
      l.fillStyle = "#2a3556"; l.beginPath(); l.moveTo(x - w / 2 - 2, by - h); l.lineTo(x + w / 2 + 2, by - h); l.lineTo(x, by - h - 6); l.fill();
      l.fillStyle = "#e9f1fa"; l.beginPath(); l.moveTo(x - w / 2 - 2, by - h); l.lineTo(x, by - h - 6.5); l.lineTo(x + w / 2 + 2, by - h); l.lineTo(x, by - h - 4.5); l.fill();
      if (Math.random() < 0.7) { l.fillStyle = "rgba(255,200,110,0.85)"; l.fillRect(x - 3, by - h * 0.7, 2.2, 2.6); l.fillRect(x + 1.5, by - h * 0.7, 2.2, 2.6); }
    }
    // Near layer: foreground snow bank with a few big trees.
    [layerNear, l] = mk(W, H);
    const nt = Math.max(2, Math.round(W / 130));
    for (let i = 0; i < nt; i++) { const x = (i + 0.5) * (W / nt) + rnd(-12, 12); tree(l, x, hill(x, H * 1.0, H * 0.035, 2, 3, 4.2) + 4, rnd(0.6, 0.8), "#17382f", "#cfe0f2"); }
    fillHill(l, H * 1.0, H * 0.035, 2, 3, 4.2, "#ffffff", "#d3e0ee");

    vignette = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.6, W / 2, H * 0.5, Math.max(W, H) * 0.65);
    vignette.addColorStop(0, "rgba(5,10,25,0)"); vignette.addColorStop(1, "rgba(5,10,25,0.3)");
  }

  function resize() {
    const w = canvas.clientWidth || 360, h = canvas.clientHeight || 96;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w; H = h;
    smoke = []; sparks = []; hcache = new Map();
    build();
  }

  // ---------- houses (deterministic in world space, so nothing pops as the camera moves) ----------
  const SP = 64;
  function house(i) {
    let h = hcache.get(i);
    if (!h) {
      const w = 30 + seed(i + 1) * 9, bh = 15 + seed(i + 2) * 6;
      h = { i, x: i * SP + seed(i + 3) * 10, w, bh, rise: 9 + seed(i + 4) * 3, col: ["#5b2b2b", "#46385c", "#2a4a42", "#59432e"][Math.abs(i) % 4],
        chim: 0.64 + seed(i + 5) * 0.1, p1: seed(i + 6) * TAU, p2: seed(i + 7) * TAU, lit: seed(i + 8) < 0.88, flash: 0, nextPuff: seed(i + 9) };
      hcache.set(i, h);
    }
    return h;
  }
  const roofY = (h, wx) => {                       // y of the roof surface at world x
    const top = gy() - h.bh, k = Math.abs(wx - h.x) / (h.w / 2 + 4);
    return top - h.rise * Math.max(0, 1 - k);
  };
  const chimX = (h) => h.x - h.w / 2 + h.w * h.chim + 2.5;
  const chimTop = (h) => gy() - h.bh - h.rise * 0.9 - 2;
  const wind = () => 6 + Math.sin(t * 0.23) * 5 + Math.sin(t * 0.61 + 1) * 2.5;

  function drawHouse(h) {
    const sx = h.x - cam, x = sx - h.w / 2, g0 = gy(), top = g0 - h.bh;
    if (sx < -60 || sx > W + 60) return;
    ctx.fillStyle = "rgba(20,35,60,0.3)";
    ctx.beginPath(); ctx.ellipse(sx - 3, g0 + 1, h.w * 0.62, 2.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = h.col; ctx.fillRect(x, top, h.w, h.bh);
    ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fillRect(x + h.w * 0.7, top, h.w * 0.3, h.bh);
    const cx = x + h.w * h.chim;
    ctx.fillStyle = "#3a2a2a"; ctx.fillRect(cx, top - h.rise * 0.9, 5, h.rise * 0.9 + 2);
    ctx.fillStyle = "#2a1c22";
    ctx.beginPath(); ctx.moveTo(x - 4, top); ctx.lineTo(x + h.w + 4, top); ctx.lineTo(sx, top - h.rise); ctx.fill();
    ctx.fillStyle = "#eef4fb";
    ctx.beginPath(); ctx.moveTo(x - 5, top + 1); ctx.lineTo(sx, top - h.rise - 1.5); ctx.lineTo(x + h.w + 5, top + 1); ctx.lineTo(x + h.w + 1, top + 3); ctx.lineTo(sx, top - h.rise + 1.2); ctx.lineTo(x - 1, top + 3); ctx.fill();
    ctx.fillRect(cx - 0.5, top - h.rise * 0.9 - 1.5, 6, 1.6);
    const wy = top + h.bh * 0.3, wh = h.bh * 0.34, ww = h.w * 0.2;
    if (h.lit) {
      const f = Math.min(1.25, 0.82 + 0.1 * Math.sin(t * 5.3 + h.p1) + 0.06 * Math.sin(t * 9.1 + h.p2) + 0.04 * Math.sin(t * 2.1) + h.flash * 0.4), fc = Math.min(1, f);
      ctx.globalAlpha = fc;
      ctx.drawImage(glowSprite, sx - h.w * 0.8, top + h.bh * 0.5 - h.w * 0.8, h.w * 1.6, h.w * 1.6);
      ctx.fillStyle = "rgb(255," + Math.round(186 + fc * 30) + "," + Math.round(92 + fc * 30) + ")";
      ctx.fillRect(x + h.w * 0.17, wy, ww, wh); ctx.fillRect(x + h.w * 0.63, wy, ww, wh);
      ctx.globalAlpha = 1;
    } else { ctx.fillStyle = "#26324f"; ctx.fillRect(x + h.w * 0.17, wy, ww, wh); ctx.fillRect(x + h.w * 0.63, wy, ww, wh); }
  }

  function emitSmoke(h, dt, burst) {
    h.nextPuff -= dt;
    if ((h.nextPuff <= 0 || burst) && smoke.length < (small ? 14 : 30)) {
      h.nextPuff = rnd(0.6, 1);
      smoke.push({ wx: chimX(h), y: chimTop(h), age: 0, life: rnd(3.2, 4.4), r0: 1.6, seed: Math.random() * TAU, big: burst ? 1.4 : 1 });
    }
  }
  function drawSmoke(dt) {
    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i];
      s.age += dt;
      if (s.age >= s.life) { smoke.splice(i, 1); continue; }
      const k = s.age / s.life;
      const y = s.y - s.age * (6 + 3 * k);
      const x = s.wx - cam + s.age * wind() * 0.5 * (0.4 + k) + Math.sin(s.age * 1.6 + s.seed) * (0.8 + 5 * k);
      ctx.fillStyle = "rgba(196,208,228," + (Math.min(1, k / 0.12) * (1 - ease(k)) * 0.34 * s.big).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(x, y, (s.r0 + 6 * Math.sqrt(k)) * s.big, 0, TAU); ctx.fill();
    }
  }

  // ---------- Santa on foot: crouch, leap, land, deliver ----------
  function initSanta() {
    const h0 = house(0), x0 = h0.x - h0.w / 2 + h0.w * h0.chim - 7;
    santa = { i: 0, ph: "rest", pt: 0, rest: 0.5, x: x0, y: roofY(h0, x0), x0: 0, y0: 0, x1: 0, y1: 0, dur: 0.6, sx: 1, sy: 1, dropped: true };
    camSmooth = santa.x - W * 0.34;
  }
  const urgent = () => (performance.now() - startedAt) / 1000 > secs() - 6;
  function stepSanta(dt) {
    const s = santa;
    s.pt += dt;
    if (s.ph === "rest") {
      s.sx = lerp(s.sx, 1, Math.min(1, dt * 10)); s.sy = lerp(s.sy, 1, Math.min(1, dt * 10));
      if (!s.dropped && s.pt > 0.12) {
        s.dropped = true;
        const h = house(s.i);
        gift = { t: 0, x0: s.x - cam - 7, y0: s.y - 12, wx1: chimX(h), y1: chimTop(h) - 1, h };
      }
      if (s.pt > s.rest && stumble <= 0) { s.ph = "crouch"; s.pt = 0; }
    } else if (s.ph === "crouch") {
      const k = Math.min(1, s.pt / 0.2); s.sx = 1 + 0.1 * k; s.sy = 1 - 0.16 * k;
      if (s.pt >= 0.2) {
        const n = house(s.i + 1), nx = n.x - n.w / 2 + n.w * n.chim - 7;
        s.x0 = s.x; s.y0 = s.y; s.x1 = nx; s.y1 = roofY(n, nx); s.ph = "fly"; s.pt = 0; s.dur = urgent() ? 0.5 : 0.66;
      }
    } else if (s.ph === "fly") {
      const k = Math.min(1, s.pt / s.dur), e = lerp(k, ease(k), 0.5);
      s.x = lerp(s.x0, s.x1, e);
      s.y = lerp(s.y0, s.y1, e) - Math.sin(k * Math.PI) * 24;
      s.sx = 1 - 0.08 * Math.sin(k * Math.PI); s.sy = 1 + 0.12 * Math.sin(k * Math.PI);
      if (k >= 1) {
        s.ph = "rest"; s.pt = 0; s.i++; s.x = s.x1; s.y = s.y1; s.sx = 1.14; s.sy = 0.82; s.dropped = false; s.rest = urgent() ? 0.4 : 1.05;
        for (let i = 0; i < (small ? 4 : 7); i++) sparks.push({ x: s.x - cam + rnd(-4, 4), y: s.y, vx: rnd(-18, 18), vy: rnd(-22, -6), age: 0, life: rnd(0.4, 0.8), r: rnd(0.8, 1.6), snow: 1 });
      }
    }
    return s;
  }

  function drawSantaFig(x, y, sx, sy, rot, pose) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy);
    const sw = pose.fly ? Math.sin(t * 9) : 0, lag = pose.lag;     // sack and pompom lag behind motion for weight
    ctx.fillStyle = "#1d1512";
    ctx.fillRect(-3.5, -3.5, 2.8, 3.5 - sw * 1.2); ctx.fillRect(0.8, -3.5, 2.8, 3.5 + sw * 1.2);
    ctx.fillStyle = "#9a6a3e"; ctx.beginPath(); ctx.ellipse(-7.5 - lag * 2, -10 + lag, 4.6, 5.2, 0.3 + lag * 0.2, 0, TAU); ctx.fill();
    ctx.fillStyle = "#2f8a4e"; ctx.fillRect(-10.6 - lag * 2, -16 + lag, 3, 3); ctx.fillStyle = "#f2c14e"; ctx.fillRect(-9.4 - lag * 2, -16 + lag, 0.7, 3);
    const gr = ctx.createLinearGradient(0, -16, 0, -3); gr.addColorStop(0, "#d23b3b"); gr.addColorStop(1, "#931f24");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, -8.6, 5.4, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "#1d1512"; ctx.fillRect(-5, -7.4, 10, 1.4); ctx.fillStyle = "#f2c14e"; ctx.fillRect(-0.9, -7.6, 2, 1.8);
    ctx.fillStyle = "#fbf7ef"; ctx.fillRect(-5.2, -3.6, 10.4, 1.3);
    ctx.fillStyle = "#931f24"; ctx.beginPath(); ctx.ellipse(3.5, -9.2 + sw, 1.5, 3, 0.4 + pose.wave, 0, TAU); ctx.fill();
    ctx.fillStyle = "#fbf7ef"; ctx.beginPath(); ctx.arc(4.4, -6.6 + sw + (pose.wave ? -3 : 0), 1.2, 0, TAU); ctx.fill();
    ctx.fillStyle = "#f1c19c"; ctx.beginPath(); ctx.arc(1.5, -16.2, 2.9, 0, TAU); ctx.fill();
    ctx.fillStyle = "#fbf7ef"; ctx.beginPath(); ctx.ellipse(1.2, -13.8, 3.4, 2.6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "#1d1512"; ctx.fillRect(2.6, -17, 0.9, 0.9);
    ctx.fillStyle = "#d23b3b"; ctx.beginPath(); ctx.moveTo(-1.8, -18); ctx.lineTo(5, -18); ctx.lineTo(-2.5 - lag * 3, -24.5 + lag); ctx.fill();
    ctx.fillStyle = "#fbf7ef"; ctx.fillRect(-2, -19, 7.4, 1.6);
    ctx.beginPath(); ctx.arc(-2.6 - lag * 3, -24.5 + lag, 1.5, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawGift(dt) {
    if (!gift) return;
    gift.t += dt * 1.6;
    const k = Math.min(1, gift.t), e = ease(k);
    const x = lerp(gift.x0, gift.wx1 - cam, e), y = lerp(gift.y0, gift.y1, e) - Math.sin(k * Math.PI) * 10, sc = 1 - 0.55 * k;
    ctx.save(); ctx.translate(x, y); ctx.rotate(k * 3.2); ctx.scale(sc, sc);
    ctx.fillStyle = "#d23b3b"; ctx.fillRect(-2.5, -2.5, 5, 5); ctx.fillStyle = "#f2c14e"; ctx.fillRect(-0.5, -2.5, 1, 5); ctx.fillRect(-2.5, -0.5, 5, 1);
    ctx.restore();
    if (k >= 1) {
      gift.h.flash = 1; emitSmoke(gift.h, 0, true);
      for (let i = 0; i < (small ? 5 : 9); i++) sparks.push({ x: gift.wx1 - cam, y: gift.y1, vx: rnd(-22, 22), vy: rnd(-34, -10), age: 0, life: rnd(0.5, 0.9), r: rnd(0.8, 1.6), gold: 1 });
      gift = null;
    }
  }
  function drawSparks(dt) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.age += dt;
      if (p.age >= p.life) { sparks.splice(i, 1); continue; }
      const k = p.age / p.life;
      p.vy += (p.gold && kind === 1 ? 0 : 40) * dt; p.x += p.vx * dt * (1 - k * 0.5); p.y += p.vy * dt;
      ctx.globalAlpha = Math.max(0, (1 - ease(k)) * (p.snow ? 0.7 : 0.95));
      const r = p.r * (1 - k * 0.4) * 3;
      ctx.drawImage(flakeSprite, p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  function drawSantaHop(dt) {
    if (!santa) initSanta();
    const s = stepSanta(dt);
    if (stumble > 0) stumble = Math.max(0, stumble - dt);
    if (cheer > 0) cheer = Math.max(0, cheer - dt);
    // Camera eases toward Santa, keeping him left of centre so the next roof is in view.
    const want = (s.ph === "fly" ? lerp(s.x0, s.x1, ease(Math.min(1, s.pt / s.dur))) : s.x) - W * 0.34;
    camSmooth += (want - camSmooth) * Math.min(1, dt * 2.4);
    cam = camSmooth;
    const ks = stumble > 0 ? stumble / 0.7 : 0;
    const rot = ks ? Math.sin((1 - ks) * 10) * 0.45 * ks : (s.ph === "fly" ? -0.08 + 0.16 * Math.min(1, s.pt / s.dur) : 0);
    const bob = cheer > 0 ? -Math.abs(Math.sin(cheer * 12)) * 5 : 0;
    const lag = Math.max(-1, Math.min(1, (s.ph === "fly" ? -Math.sin(Math.min(1, s.pt / s.dur) * Math.PI) : 0) + (s.ph === "rest" ? Math.sin(t * 3) * 0.15 : 0)));
    return { x: s.x - cam, y: s.y + bob, sx: s.sx, sy: s.sy, rot, pose: { fly: s.ph === "fly", lag, wave: cheer > 0 ? -1.2 : 0 } };
  }

  // ---------- Sleigh crossing: progress follows the timer ----------
  function drawSleighCross(dt, p) {
    const s = Math.max(0.5, Math.min(0.72, H / 150)), teamW = 112 * s;
    const k = ease(Math.min(1, p) * 0.9 + 0.05);
    const x = lerp(teamW * 0.92, W - 26 * s, k);
    const y = H * 0.36 + Math.sin(t * 1.3) * 3 + Math.sin(t * 0.55) * 4 - (stumble > 0 ? Math.sin(stumble * 14) * 4 * (stumble / 0.7) : 0) - (cheer > 0 ? Math.sin((1 - cheer / 0.8) * Math.PI) * 8 : 0);
    if (stumble > 0) stumble = Math.max(0, stumble - dt);
    if (cheer > 0) cheer = Math.max(0, cheer - dt);
    const vy = dt > 0 ? (y - prevSleighY) / dt : 0; prevSleighY = y;
    if (Math.abs(vy) < 800) tilt += (Math.max(-0.1, Math.min(0.1, vy / 200)) - tilt) * Math.min(1, dt * 3);
    if (dt > 0 && sparks.length < (small ? 36 : 80)) {
      let n = (small ? 16 : 28) * dt + Math.random();
      while (n-- > 1) sparks.push({ x: x + rnd(14, 20) * s, y: y + rnd(0, 6) * s, vx: rnd(-12, -4), vy: rnd(-3, 8), age: 0, life: rnd(0.8, 1.4), r: rnd(0.6, 1.4), gold: 1 });
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    if (window.SleighArt) window.SleighArt.draw(ctx, 0, 0, s, t);
    ctx.restore();
  }

  function drawSnow(dt, layer) {
    const w = wind() * (0.5 + layer * 0.5);
    for (let i = 0; i < snow.length; i++) {
      const f = snow[i];
      if (f.layer !== layer) continue;
      f.y += f.v * dt;
      f.x += (w + Math.sin(t * 0.9 + f.ph) * 4 * (0.4 + layer * 0.3)) * dt;
      if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
      if (f.x > W + 4) f.x = -4; else if (f.x < -4) f.x = W + 4;
      const r = f.r * (f.blur > 2 ? 2.6 : 2);
      ctx.globalAlpha = f.a;
      ctx.drawImage(flakeSprite, f.x - r, f.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#070f22"); g.addColorStop(0.55, "#17305a"); g.addColorStop(1, "#3a5d89");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    stars.forEach((s) => { ctx.globalAlpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.s + s.p)); ctx.fillRect(s.x, s.y, s.r * 1.6, s.r * 1.6); });
    ctx.globalAlpha = 1;
    const mx = W - Math.max(34, W * 0.12), my = H * 0.28, mr = H * 0.13, R = H * 0.55, br = 1 + Math.sin(t * 0.5) * 0.03;
    ctx.globalAlpha = 0.9 + Math.sin(t * 0.5) * 0.1;
    ctx.drawImage(moonSprite, mx - R * br, my - R * br, R * 2 * br, R * 2 * br);
    ctx.globalAlpha = 1;
    const body = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr);
    body.addColorStop(0, "#fffbf0"); body.addColorStop(1, "#e9d8b4");
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(180,160,130,0.22)";
    [[-0.3, -0.1, 0.2], [0.28, 0.22, 0.13]].forEach(([dx, dy, rr]) => { ctx.beginPath(); ctx.arc(mx + dx * mr, my + dy * mr, rr * mr, 0, TAU); ctx.fill(); });
  }
  function drawLayer(c, camx, f) {
    const off = -((camx * f) % W);
    ctx.drawImage(c, off, 0, W, H);
    ctx.drawImage(c, off + W, 0, W, H);
  }

  function render(dt) {
    const p = Math.max(0, Math.min(1, (performance.now() - startedAt) / (secs() * 1000)));
    drawSky();
    drawSnow(dt, 0);
    let fig = null;
    if (kind === 0) fig = drawSantaHop(dt); else cam += dt * 20;
    drawLayer(layerFar, cam, 0.12);
    drawLayer(layerMid, cam, 0.35);
    const i0 = Math.floor((cam - 50) / SP) - 1, i1 = Math.ceil((cam + W + 50) / SP) + 1;
    for (let i = i0; i <= i1; i++) {
      const h = house(i);
      if (h.flash > 0) h.flash = Math.max(0, h.flash - dt * 0.9);
      drawHouse(h);
      if (dt > 0) emitSmoke(h, dt, false);
    }
    drawSmoke(dt);
    if (fig) { drawSantaFig(fig.x, fig.y, fig.sx, fig.sy, fig.rot, fig.pose); drawGift(dt); }
    else drawSleighCross(dt, p);
    drawSparks(dt);
    drawSnow(dt, 1);
    drawLayer(layerNear, cam, 1.25);
    drawSnow(dt, 2);
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;
    render(dt);
    raf = active && visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  }

  function resume() {
    if (active && canvas && !raf && visible && !document.hidden && !reduced()) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function play(n) {
    canvas = document.getElementById("scene");
    if (!canvas) return;
    stop();
    kind = ((n % 2) + 2) % 2;
    active = true; t = 0; cam = 0; santa = null; gift = null; stumble = 0; cheer = 0; tilt = 0; startedAt = performance.now();
    resize();
    if (window.IntersectionObserver && !io) {
      io = new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) resume(); });
      io.observe(canvas);
    }
    if (reduced()) { t = 1.5; render(0); return; }   // one calm still frame
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { active = false; cancelAnimationFrame(raf); raf = 0; }
  function react(what) {
    if (!active) return;
    if (what === "miss") {
      stumble = 0.7;
      const sx = kind === 0 && santa ? santa.x - cam : W * 0.5, sy = kind === 0 && santa ? santa.y : H * 0.4;
      for (let i = 0; i < (small ? 4 : 8); i++) sparks.push({ x: sx, y: sy, vx: rnd(-25, 25), vy: rnd(-25, -5), age: 0, life: 0.6, r: 1.2, snow: 1 });
    } else cheer = 0.8;
  }

  window.addEventListener("resize", () => { if (active && canvas && canvas.clientWidth) { const k = kind; resize(); if (k === 0) santa = null; if (!raf) render(0); } });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) resume(); });
  window.Scene = { play, stop, react };
})();
