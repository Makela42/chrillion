/*
  Drillion live scenes: a little flat-clinical animation that loops while you answer.
  Scene.play(n) starts scene n (toothbrush vs plaque, swinging floss, drill chasing a cavity bug, mouthwash wave);
  Scene.stop() pauses it. The speech bubble (#scene-say) is handled by game.js.
*/
(() => {
  "use strict";
  const INK = "#0f3a40", ENAMEL = "#fbfaf5", MINT = "#bfe8d9", DEEP = "#2f9d83", GUM = "#e8818a", CORAL = "#ef5a4c",
    GOLD = "#e0a92b", SILVER = "#9aa6ad", TEAL = "#16878f", BLUE = "#2b6fb0", SLIME = "#7bbf4a", PANEL = "#dff3ea";
  const rnd = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;

  let canvas = null, ctx = null, raf = 0, W = 0, H = 0, kind = 0, last = 0, T = 0, S = null;
  const reduce = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  function resize() {
    const cssW = canvas.clientWidth || 360, cssH = canvas.clientHeight || 96;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = cssW; H = cssH;
  }

  function panel() {
    ctx.fillStyle = PANEL; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(47,157,131,.16)";
    for (let x = 12; x < W; x += 24) for (let y = 10; y < H; y += 24) { ctx.beginPath(); ctx.arc(x + ((y / 24) & 1) * 12, y, 1.6, 0, TAU); ctx.fill(); }
  }

  function star(x, y, r, col) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
  }

  // a tooth standing on the gum: flat bottom at y+h, rounded top
  function tooth(x, y, w, h) {
    const r = Math.min(w * 0.42, h * 0.5);
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h); ctx.closePath();
    ctx.fillStyle = ENAMEL; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.lineJoin = "round"; ctx.stroke();
  }
  const GUMH = 16, TH = 40;
  function teethRow(n) {
    const sp = W / n, tw = Math.min(46, sp - 6);
    for (let i = 0; i < n; i++) tooth(i * sp + (sp - tw) / 2, H - GUMH - TH, tw, TH + 2);
    ctx.fillStyle = GUM; ctx.fillRect(0, H - GUMH, W, GUMH);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, H - GUMH); ctx.lineTo(W, H - GUMH); ctx.stroke();
    return sp;
  }
  const nTeeth = () => Math.max(4, Math.round(W / 60));

  // ---- scene 0: toothbrush scrubs grumpy plaque ----
  function initBrush() {
    const n = nTeeth(), sp = W / n;
    S = { n, sp, blobs: Array.from({ length: n }, (_, i) => ({ x: i * sp + sp / 2, s: Math.random() < 0.3 ? 0.5 : 1, w: 0, sp: 0 })) };
  }
  function drawBrush(dt) {
    const sp = teethRow(S.n), topY = H - GUMH - TH;
    const bx = W / 2 + Math.sin(T * 1.5) * (W / 2 - 46), by = topY - 6 + Math.sin(T * 16) * 2.2;
    S.blobs.forEach((b) => {
      const near = Math.abs(bx - b.x) < sp * 0.5;
      if (b.sp > 0) b.sp -= dt;
      if (b.s > 0) {
        if (near) { b.s -= dt * 1.2; if (b.s <= 0) { b.s = 0; b.w = 0; b.sp = 0.7; } }
        else if (b.s < 1) b.s = Math.min(1, b.s + dt * 0.3);
      } else { b.w += dt; if (b.w > 1.6) b.s = 0.05; }
      if (b.s > 0) {
        const r = 13 * b.s, y = topY + 14;
        ctx.fillStyle = SLIME; ctx.strokeStyle = INK; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(b.x, y, r * 1.15, r * 0.9, 0, 0, TAU); ctx.fill(); ctx.stroke();
        if (b.s > 0.35) {
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.arc(b.x - r * 0.4, y - r * 0.15, r * 0.26, 0, TAU); ctx.arc(b.x + r * 0.4, y - r * 0.15, r * 0.26, 0, TAU); ctx.fill();
          ctx.fillStyle = INK;
          ctx.beginPath(); ctx.arc(b.x - r * 0.4, y - r * 0.1, r * 0.1, 0, TAU); ctx.arc(b.x + r * 0.4, y - r * 0.1, r * 0.1, 0, TAU); ctx.fill();
          ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(b.x - r * 0.7, y - r * 0.6); ctx.lineTo(b.x - r * 0.15, y - r * 0.4);
          ctx.moveTo(b.x + r * 0.7, y - r * 0.6); ctx.lineTo(b.x + r * 0.15, y - r * 0.4); ctx.stroke();
        }
      }
      if (b.sp > 0) star(b.x, topY + 12 - (0.7 - b.sp) * 10, 4 + b.sp * 9, GOLD);
    });
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.38);
    ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
    for (let i = -17; i <= 17; i += 6) { ctx.beginPath(); ctx.rect(i - 1.6, 1, 3.2, 8); ctx.fill(); ctx.stroke(); }
    ctx.lineWidth = 2; ctx.fillStyle = TEAL;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-22, -7, 44, 9, 4) : ctx.rect(-22, -7, 44, 9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = BLUE;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(20, -5, 54, 7, 3.5) : ctx.rect(20, -5, 54, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ---- scene 1: floss swinging between teeth ----
  function initFloss() { S = { n: nTeeth() }; }
  function drawFloss() {
    const sp = teethRow(S.n), swing = 0.5 + 0.5 * Math.sin(T * 2.4);
    const base = H - GUMH - TH - 14;
    const yAt = (x) => {
      const gap = Math.pow(0.5 + 0.5 * Math.cos((x / sp) * TAU), 3);
      return base + 9 * Math.sin(x * 0.045 + T * 3.2) + gap * (10 + 24 * swing);
    };
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      for (let x = 14; x <= W - 14; x += 6) (x === 14 ? ctx.moveTo(x, yAt(x)) : ctx.lineTo(x, yAt(x)));
      ctx.strokeStyle = pass ? "#fff" : INK; ctx.lineWidth = pass ? 3 : 6; ctx.stroke();
    }
    ctx.fillStyle = MINT; ctx.strokeStyle = INK; ctx.lineWidth = 2;
    [14, W - 14].forEach((x) => { ctx.beginPath(); ctx.arc(x, yAt(x), 7, 0, TAU); ctx.fill(); ctx.stroke(); });
    if (swing > 0.7) for (let k = 1; k < S.n; k++) star(k * sp, H - GUMH - TH + 16 + Math.sin(T * 9 + k) * 2, 3 + (swing - 0.7) * 22, GOLD);
  }

  // ---- scene 2: drill chases a cavity bug ----
  function initDrill() { S = { n: nTeeth(), dx: W * 0.2 }; }
  function drawDrill(dt) {
    teethRow(S.n);
    const topY = H - GUMH - TH, ph = T * 0.8, bx = W / 2 + Math.sin(ph) * (W * 0.38), dir = Math.cos(ph) >= 0 ? 1 : -1;
    const hop = Math.abs(Math.sin(T * 6)) * 12, by = topY - 8 - hop;
    S.dx += ((bx - dir * 70) - S.dx) * Math.min(1, dt * 3);
    // bug
    ctx.save(); ctx.translate(bx, by);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineCap = "round";
    for (let i = -1; i <= 1; i++) for (const sd of [-1, 1]) {
      const sw = Math.sin(T * 14 + i * 2) * 2;
      ctx.beginPath(); ctx.moveTo(i * 5, 3); ctx.lineTo(i * 6 + sd * 8 + sw, 9 + hop * 0.2); ctx.stroke();
    }
    ctx.fillStyle = "#7a4d8c"; ctx.beginPath(); ctx.ellipse(0, 0, 13, 10, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-4 + dir * 2, -2, 3.2, 0, TAU); ctx.arc(4 + dir * 2, -2, 3.2, 0, TAU); ctx.fill();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-4 + dir * 3.4, -2, 1.4, 0, TAU); ctx.arc(4 + dir * 3.4, -2, 1.4, 0, TAU); ctx.fill();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(dir * 2, 3, 3.5, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.restore();
    // drill handpiece, tip toward the bug
    ctx.save(); ctx.translate(S.dx, by - 2 + Math.sin(T * 40) * 0.9); ctx.scale(dir, 1);
    ctx.lineJoin = "round"; ctx.lineWidth = 2; ctx.strokeStyle = INK;
    ctx.fillStyle = BLUE; ctx.beginPath(); ctx.rect(-54, -5, 30, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = SILVER; ctx.beginPath(); ctx.moveTo(-24, -7); ctx.lineTo(8, -4); ctx.lineTo(8, 4); ctx.lineTo(-24, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, 0); for (let i = 0; i < 5; i++) ctx.lineTo(12 + i * 3, i & 1 ? 2.5 : -2.5 + ((T * 30) % 2)); ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();
    if (Math.sin(T * 30) > 0) star(S.dx + dir * 30, by - 8, 4, GOLD);
  }

  // ---- scene 3: mouthwash wave ----
  function initWash() {
    S = { n: nTeeth(), bub: Array.from({ length: 14 }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(2, 5), v: rnd(14, 34) })) };
  }
  function drawWash(dt) {
    const sp = teethRow(S.n), lvl = 0.5 + 0.5 * Math.sin(T * 0.9);
    const base = H - GUMH - 4 - lvl * (TH + 8);
    const wave = (off, amp) => { ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W + 6; x += 6) ctx.lineTo(x, base + off + Math.sin(x * 0.03 + T * 2.2 + off) * amp); ctx.lineTo(W, H); ctx.closePath(); };
    wave(7, 4); ctx.fillStyle = "rgba(22,135,143,.55)"; ctx.fill();
    wave(0, 5); ctx.fillStyle = "rgba(47,157,131,.5)"; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = GUM; ctx.fillRect(0, H - GUMH + 4, W, GUMH - 4);
    S.bub.forEach((b) => {
      b.y -= b.v * dt; b.x += Math.sin(T * 3 + b.r) * 0.3;
      if (b.y < base - 10) { b.y = H - 6; b.x = rnd(0, W); }
      ctx.fillStyle = "rgba(255,255,255,.65)"; ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); ctx.stroke();
    });
    if (lvl > 0.6) for (let k = 0; k < S.n; k++) star(k * sp + sp / 2 + 8, H - GUMH - TH + 10, (lvl - 0.6) * 18, "#fff");
  }

  const SCENES = [[initBrush, drawBrush], [initFloss, drawFloss], [initDrill, drawDrill], [initWash, drawWash]];

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; T += dt;
    panel();
    SCENES[kind][1](dt);
    raf = requestAnimationFrame(frame);
  }

  function play(n) {
    canvas = document.getElementById("scene");
    if (!canvas) return;
    cancelAnimationFrame(raf);
    resize();
    kind = ((n || 0) % SCENES.length + SCENES.length) % SCENES.length;
    SCENES[kind][0]();
    last = performance.now();
    if (reduce()) { T = 1.2; panel(); SCENES[kind][1](0.3); raf = 0; return; }
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  window.addEventListener("resize", () => { if (raf && canvas) { resize(); SCENES[kind][0](); } });
  window.Scene = { play, stop };
})();
