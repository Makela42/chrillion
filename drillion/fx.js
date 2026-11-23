/*
  Drillion reward animation, one canvas. Fx.celebrate(tier): sparkles, little flying teeth and toothpaste swirls
  in the tier colour; rarer answers get more, and the miracle tier showers gold crowns.
  Fx.clear() empties everything; Fx.fadeOut() fades it (results screen).
*/
(() => {
  "use strict";
  const INK = "#0f3a40", ENAMEL = "#fbfaf5";
  const COL = { miracle: "#e0a92b", t75: "#6b3fa0", t50: "#16878f", t25: "#2b6fb0", trap: "#d0507a", t10: "#8a9399", miss: "#c0392b", timeout: "#ffffff" };
  // counts per tier
  const PLAN = {
    t10: { sparkle: 6 },
    t25: { sparkle: 10, swirl: 2 },
    t50: { sparkle: 16, swirl: 4, tooth: 3 },
    t75: { sparkle: 28, swirl: 6, tooth: 8 },
    miracle: { sparkle: 54, swirl: 8, tooth: 14, crown: 30 },
    trap: { swirl: 4 },
  };
  const G = 1500, TAU = Math.PI * 2;
  const reduce = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const sfx = (n, a) => { if (window.Sfx) window.Sfx.play(n, a); };
  const scale = () => Math.max(1.1, Math.min(1.6, Math.min(window.innerWidth, window.innerHeight * 0.7) / 380));
  const rnd = (a, b) => a + Math.random() * (b - a);

  let layer = null, cv = null, ctx = null, W = 0, H = 0, raf = 0, queue = [], items = [], t = 0, last = 0, lastLand = 0;

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
    queue = []; items = [];
    if (ctx) ctx.clearRect(0, 0, W, H);
    if (layer) layer.classList.remove("fx-fade");
  }
  function fadeOut() {
    if (!layer || !(items.length || queue.length)) return;
    layer.classList.add("fx-fade");
    setTimeout(clear, 650);
  }

  function star(r) {
    ctx.beginPath(); ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.fill();
  }

  function drawItem(g) {
    const s = g.size, lw = Math.max(1.5, s * 0.07);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, g.alpha));
    ctx.translate(g.x, g.y);
    ctx.rotate(g.r);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    if (g.kind === "sparkle") {
      ctx.fillStyle = g.col; star(s * g.k);
      ctx.fillStyle = "#fff"; star(s * g.k * 0.45);
    } else if (g.kind === "tooth") {
      ctx.beginPath();
      ctx.moveTo(-s * 0.45, -s * 0.3); ctx.quadraticCurveTo(-s * 0.45, -s * 0.55, -s * 0.15, -s * 0.5);
      ctx.quadraticCurveTo(0, -s * 0.42, s * 0.15, -s * 0.5); ctx.quadraticCurveTo(s * 0.45, -s * 0.55, s * 0.45, -s * 0.3);
      ctx.quadraticCurveTo(s * 0.4, s * 0.1, s * 0.25, s * 0.55); ctx.quadraticCurveTo(s * 0.12, s * 0.6, s * 0.05, s * 0.1);
      ctx.quadraticCurveTo(0, -s * 0.05, -s * 0.05, s * 0.1); ctx.quadraticCurveTo(-s * 0.12, s * 0.6, -s * 0.25, s * 0.55);
      ctx.quadraticCurveTo(-s * 0.4, s * 0.1, -s * 0.45, -s * 0.3); ctx.closePath();
      ctx.fillStyle = ENAMEL; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = g.col; ctx.fillRect(-s * 0.28, -s * 0.34, s * 0.14, s * 0.1);
    } else if (g.kind === "swirl") {
      ctx.beginPath();
      for (let a = 0; a <= 9; a += 0.4) { const rr = s * 0.07 * a, px = Math.cos(a) * rr, py = Math.sin(a) * rr * 0.8; a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.strokeStyle = INK; ctx.lineWidth = lw * 3.2; ctx.stroke();
      ctx.strokeStyle = g.col; ctx.lineWidth = lw * 1.7; ctx.stroke();
    } else if (g.kind === "crown") {
      ctx.beginPath();
      ctx.moveTo(-s * 0.45, s * 0.35); ctx.lineTo(-s * 0.5, -s * 0.3); ctx.lineTo(-s * 0.22, -s * 0.05); ctx.lineTo(0, -s * 0.45);
      ctx.lineTo(s * 0.22, -s * 0.05); ctx.lineTo(s * 0.5, -s * 0.3); ctx.lineTo(s * 0.45, s * 0.35); ctx.closePath();
      ctx.fillStyle = "#e0a92b"; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = "#f6dc8a"; ctx.fillRect(-s * 0.3, s * 0.08, s * 0.6, s * 0.1);
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, -s * 0.28, s * 0.05, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function celebrate(tier) {
    const plan = PLAN[tier];
    if (reduce() || !plan) return;
    ensure();
    const S = scale(), col = COL[tier] || "#fff", big = tier === "miracle", spread = big ? 2.2 : 1.1;
    const add = (kind, n, mk) => {
      for (let i = 0; i < n; i++) queue.push(Object.assign({ at: t + (i / n) * spread + Math.random() * 0.1, kind, col, alpha: 1, r: rnd(-0.6, 0.6), vr: rnd(-4, 4), grav: false }, mk(i)));
    };
    add("sparkle", plan.sparkle || 0, () => {
      const a = rnd(0, TAU), v = rnd(30, 160);
      return { x: W / 2 + rnd(-W * 0.3, W * 0.3), y: H * rnd(0.2, 0.6), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, size: rnd(7, 16) * S, k: 1, life: rnd(0.6, 1.1), age: 0, vr: rnd(-2, 2) };
    });
    add("swirl", plan.swirl || 0, () => ({ x: rnd(0.08, 0.92) * W, y: -30 * S, vx: rnd(-40, 40), vy: rnd(60, 160), size: rnd(26, 36) * S, grav: true, ground: true }));
    add("tooth", plan.tooth || 0, () => ({ x: rnd(0.05, 0.95) * W, y: -30 * S, vx: rnd(-60, 60), vy: rnd(40, 200), size: rnd(24, 34) * S, grav: true, ground: true }));
    add("crown", plan.crown || 0, () => ({ x: rnd(0.04, 0.96) * W, y: -40 * S, vx: rnd(-50, 50), vy: rnd(60, 220), size: rnd(28, 40) * S, grav: true, ground: true }));
    if (plan.crown || plan.tooth) sfx("rain", spread + 0.5);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    items.forEach(drawItem);
  }

  function step(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    for (let i = queue.length - 1; i >= 0; i--) {
      if (queue[i].at <= t) { items.push(queue[i]); queue.splice(i, 1); }
    }
    for (let i = items.length - 1; i >= 0; i--) {
      const g = items[i];
      if (g.kind === "sparkle") {
        g.age += dt; g.x += g.vx * dt; g.y += g.vy * dt; g.vx *= 0.96; g.vy *= 0.96; g.r += g.vr * dt;
        const p = g.age / g.life; g.k = p < 0.25 ? p / 0.25 : 1 - (p - 0.25) / 0.75; g.alpha = 1;
        if (p >= 1) items.splice(i, 1);
        continue;
      }
      if (g.landedAt) {
        g.alpha = 1 - (t - g.landedAt) / 1.1;
        if (g.alpha <= 0) items.splice(i, 1);
        continue;
      }
      g.vy += G * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.r += g.vr * dt;
      if (g.y >= H - g.size * 0.5) {
        g.y = H - g.size * 0.5; g.landedAt = t; g.vr = 0;
        if (g.kind === "crown" && performance.now() - lastLand > 90) { sfx("land"); lastLand = performance.now(); }
      }
    }
    render();
    raf = queue.length || items.length ? requestAnimationFrame(step) : 0;
  }

  window.Fx = { celebrate, clear, fadeOut };
})();
