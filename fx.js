/*
  Chrillion reward animation, drawn on one canvas for smooth motion.
  Fx.celebrate(tier): the full-colour sleigh flies over and drops shaded gift boxes; rarer answers drop more.
  Presents stay piled up for the whole run. Fx.clear() empties it; Fx.fadeOut() fades it (results screen).
*/
(() => {
  "use strict";
  // Gift colours per tier: [box, shade, ribbon]. Obvious red, Classic blue, Good Pick green, Rare Find gold, Regifted purple socks.
  const COLORS = {
    t10: ["#b08a5e", "#7a5c3c", "#fbf7ef"], t25: ["#3f7fc4", "#2b5f99", "#fbf7ef"], t50: ["#2f8a4e", "#1d5c33", "#f2c14e"],
    t75: ["#e2562b", "#a83a17", "#f2c14e"], trap: ["#c2399a", "#8a2370", "#fbf7ef"], miracle: ["#f2c14e", "#b8892a", "#d23b3b"],
  };
  const MIX = ["miracle", "t75", "t50", "t25"];
  const PLAN = { t10: { n: 1 }, t25: { n: 3 }, t50: { n: 6 }, t75: { n: 14, sparkle: true }, miracle: { n: 60, sparkle: true, mix: true }, trap: { n: 2, sock: true } };
  const G = 1500, PILE_MAX = 0.26;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sfx = (n, a) => { if (window.Sfx) window.Sfx.play(n, a); };
  const scale = () => Math.max(1.15, Math.min(1.8, Math.min(window.innerWidth, window.innerHeight * 0.7) / 360));

  let layer = null, cv = null, ctx = null, W = 0, H = 0, raf = 0, sleighs = [], falling = [], landed = [], sparks = [], heights = null, colW = 40, lastLand = 0, t = 0;

  function ensure() {
    if (layer) return;
    layer = document.createElement("div");
    layer.id = "fx";
    layer.setAttribute("aria-hidden", "true");
    cv = document.createElement("canvas");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    layer.appendChild(cv);
    document.body.appendChild(layer);
    resize();
    window.addEventListener("resize", () => { resize(); if (!raf) render(); });
  }
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function clear() {
    cancelAnimationFrame(raf); raf = 0;
    sleighs = []; falling = []; landed = []; sparks = []; heights = null;
    if (ctx) ctx.clearRect(0, 0, W, H);
    if (layer) layer.classList.remove("fx-fade");
  }
  function fadeOut() {
    if (!layer || !landed.length) return;
    layer.classList.add("fx-fade");
    setTimeout(clear, 650);
  }

  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function drawGift(g) {
    const s = g.size, c = COLORS[g.tier] || COLORS.t10;
    ctx.save();
    ctx.translate(g.x + s / 2, g.y + s / 2);
    ctx.rotate(g.r);
    if (g.landedAt) {                                   // squash-and-bounce on landing
      const k = Math.min(1, (t - g.landedAt) / 0.38);
      if (k < 1) ctx.scale(1 + 0.25 * Math.sin(k * Math.PI) * (1 - k), 1 - 0.25 * Math.sin(k * Math.PI) * (1 - k));
    }
    if (g.kind === "sock") {
      ctx.fillStyle = c[0];
      ctx.beginPath(); ctx.moveTo(-s * 0.25, -s * 0.5); ctx.lineTo(s * 0.15, -s * 0.5); ctx.lineTo(s * 0.15, s * 0.1);
      ctx.quadraticCurveTo(s * 0.5, s * 0.15, s * 0.45, s * 0.38); ctx.quadraticCurveTo(s * 0.1, s * 0.55, -s * 0.25, s * 0.25); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c[2]; ctx.fillRect(-s * 0.3, -s * 0.55, s * 0.5, s * 0.18);
    } else if (g.kind === "star") {
      ctx.fillStyle = "#f2c14e";
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? s * 0.22 : s * 0.5; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
      ctx.closePath(); ctx.fill();
    } else {
      const grad = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
      grad.addColorStop(0, c[0]); grad.addColorStop(1, c[1]);
      ctx.fillStyle = grad; rr(-s * 0.45, -s * 0.3, s * 0.9, s * 0.75, s * 0.06); ctx.fill();          // box
      ctx.fillStyle = c[0]; rr(-s * 0.5, -s * 0.42, s, s * 0.18, s * 0.05); ctx.fill();                  // lid
      ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(-s * 0.42, -s * 0.28, s * 0.84, s * 0.08);   // shine
      ctx.fillStyle = c[2]; ctx.fillRect(-s * 0.07, -s * 0.42, s * 0.14, s * 0.87);                       // ribbon
      ctx.fillRect(-s * 0.45, s * 0.02, s * 0.9, s * 0.12);
      ctx.beginPath(); ctx.ellipse(-s * 0.14, -s * 0.5, s * 0.15, s * 0.09, -0.5, 0, 6.283); ctx.ellipse(s * 0.14, -s * 0.5, s * 0.15, s * 0.09, 0.5, 0, 6.283); ctx.fill();   // bow
    }
    ctx.restore();
  }

  function celebrate(tier) {
    const plan = PLAN[tier];
    if (reduce() || !plan) return;
    ensure();
    if (!heights) { colW = 30 * scale(); heights = new Array(Math.ceil(W / colW) + 1).fill(0); }
    const S = scale(), dur = tier === "miracle" ? 3000 : 2400;
    const startX = W + 30 * S, endX = -40 * S;
    const drops = Array.from({ length: plan.n }, (_, i) => 0.12 + (plan.n === 1 ? 0.4 : (i / (plan.n - 1)) * 0.72)).sort((a, b) => a - b);
    sleighs.push({ t0: t, dur, startX, endX, baseY: Math.max(80, H * 0.14), drops, di: 0, plan, tier, S });
    sfx("sleigh", dur / 1000);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
  }

  function groundY(g) {
    const col = Math.max(0, Math.min(heights.length - 1, Math.floor((g.x + g.size / 2) / colW)));
    return { col, y: H - g.size - Math.min(heights[col] * g.size * 0.78, H * PILE_MAX - g.size) - 4 };
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    landed.forEach(drawGift);
    falling.forEach(drawGift);
    sleighs.forEach((sl) => window.SleighArt && window.SleighArt.draw(ctx, sl.x, sl.y, sl.S, t));
    sparks.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.a);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  let last = 0;
  function step(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    for (let i = sleighs.length - 1; i >= 0; i--) {
      const sl = sleighs[i], p = Math.min(1, (t - sl.t0) / sl.dur * 1000);
      sl.x = sl.startX + (sl.endX - sl.startX) * p;
      sl.y = sl.baseY + Math.sin(p * Math.PI * 3) * 10;
      while (sl.di < sl.drops.length && p >= sl.drops[sl.di]) {
        const tier = sl.plan.mix ? MIX[sl.di % 4] : sl.tier;
        const kind = sl.plan.sock ? "sock" : sl.plan.mix && sl.di % 7 === 6 ? "star" : "gift";
        falling.push({ x: sl.x + 8 * sl.S, y: sl.y, vx: -80 + Math.random() * 60, vy: -40 - Math.random() * 60, r: Math.random() - 0.5, vr: (Math.random() - 0.5) * 5, size: (28 + Math.random() * 8) * sl.S, tier, kind });
        sl.di++;
      }
      if (sl.plan.sparkle && Math.random() < 0.5) sparks.push({ x: sl.x + 18 * sl.S, y: sl.y + Math.random() * 10, r: 1 + Math.random() * 2, a: 1, c: sl.tier === "miracle" ? "#fff2b0" : "#f2c14e" });
      if (p >= 1) sleighs.splice(i, 1);
    }
    for (let i = falling.length - 1; i >= 0; i--) {
      const g = falling[i];
      g.vy += G * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.r += g.vr * dt;
      if (g.x < -8) { g.x = -8; g.vx = Math.abs(g.vx) * 0.4; }
      if (g.x > W - g.size + 8) { g.x = W - g.size + 8; g.vx = -Math.abs(g.vx) * 0.4; }
      const gr = groundY(g);
      if (g.y >= gr.y) {
        g.y = gr.y; g.r = (Math.random() - 0.5) * 0.4; g.landedAt = t;
        heights[gr.col]++;
        landed.push(g); falling.splice(i, 1);
        if (now - lastLand > 70) { sfx("land"); lastLand = now; }
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.a -= dt * 1.4; p.y += 18 * dt; if (p.a <= 0) sparks.splice(i, 1); }
    render();
    const bouncing = landed.some((g) => t - g.landedAt < 0.4);
    raf = sleighs.length || falling.length || sparks.length || bouncing ? requestAnimationFrame(step) : 0;
  }

  window.Fx = { celebrate, clear, fadeOut };
})();
