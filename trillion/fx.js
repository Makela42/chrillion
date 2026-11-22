/*
  Trillion reward animation, drawn on one canvas for smooth motion.
  Fx.celebrate(tier): coins, gold bars and banknotes rain down; rarer answers rain more (and richer).
  The haul stays piled up for the whole run. Fx.clear() empties it; Fx.fadeOut() fades it (results screen).
*/
(() => {
  "use strict";
  // What falls per tier: n items, mix of kinds. Kinds: penny, coin, bar, note, bag.
  const PLAN = {
    t10: { n: 2, kinds: ["penny"] },
    t25: { n: 4, kinds: ["coin"] },
    t50: { n: 9, kinds: ["coin", "coin", "note"] },
    t75: { n: 18, kinds: ["coin", "note", "coin", "bar"], sparkle: true },
    miracle: { n: 64, kinds: ["coin", "note", "bar", "coin", "bar"], sparkle: true, big: true },
    trap: { n: 3, kinds: ["bag"] },
  };
  const G = 1700, PILE_MAX = 0.24;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sfx = (n, a) => { if (window.Sfx) window.Sfx.play(n, a); };
  const scale = () => Math.max(1.1, Math.min(1.7, Math.min(window.innerWidth, window.innerHeight * 0.7) / 380));

  let layer = null, cv = null, ctx = null, W = 0, H = 0, raf = 0, queue = [], falling = [], landed = [], sparks = [], heights = null, colW = 40, lastLand = 0, t = 0, last = 0;

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
    queue = []; falling = []; landed = []; sparks = []; heights = null;
    if (ctx) ctx.clearRect(0, 0, W, H);
    if (layer) layer.classList.remove("fx-fade");
  }
  function fadeOut() {
    if (!layer || !landed.length) return;
    layer.classList.add("fx-fade");
    setTimeout(clear, 650);
  }

  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function drawItem(g) {
    const s = g.size;
    ctx.save();
    ctx.translate(g.x + s / 2, g.y + s / 2);
    ctx.rotate(g.r);
    if (g.landedAt) {                                   // squash-and-bounce on landing
      const k = Math.min(1, (t - g.landedAt) / 0.34);
      if (k < 1) ctx.scale(1 + 0.2 * Math.sin(k * Math.PI) * (1 - k), 1 - 0.2 * Math.sin(k * Math.PI) * (1 - k));
    }
    if (g.kind === "coin" || g.kind === "penny") {
      // A coin that tumbles: the face squashes as it spins in the air.
      const flip = g.landedAt ? 1 : Math.max(0.18, Math.abs(Math.cos(g.spin)));
      const gold = g.kind === "coin";
      const r = s * (gold ? 0.42 : 0.32);
      ctx.scale(flip, 1);
      const grad = ctx.createLinearGradient(-r, -r, r, r);
      if (gold) { grad.addColorStop(0, "#fff0a0"); grad.addColorStop(0.5, "#e0b030"); grad.addColorStop(1, "#b8841a"); }
      else { grad.addColorStop(0, "#f0b784"); grad.addColorStop(1, "#a8603a"); }
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill();
      ctx.lineWidth = Math.max(1.2, s * 0.05); ctx.strokeStyle = gold ? "#8a6410" : "#6b3a1c"; ctx.stroke();
      ctx.lineWidth = Math.max(1, s * 0.03); ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, 6.283); ctx.stroke();
      if (flip > 0.6) {
        ctx.fillStyle = gold ? "#8a6410" : "#6b3a1c";
        ctx.font = `800 ${Math.round(r * 1.1)}px "Playfair Display", Georgia, serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(gold ? "$" : "¢", 0, r * 0.06);
      }
    } else if (g.kind === "bar") {
      const w = s * 0.95, h = s * 0.5;
      const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
      grad.addColorStop(0, "#ffe58f"); grad.addColorStop(1, "#c8921a");
      ctx.fillStyle = "#fff3b8";
      ctx.beginPath(); ctx.moveTo(-w * 0.36, -h * 0.5); ctx.lineTo(w * 0.36, -h * 0.5); ctx.lineTo(w * 0.46, -h * 0.12); ctx.lineTo(-w * 0.46, -h * 0.12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.moveTo(-w * 0.46, -h * 0.12); ctx.lineTo(w * 0.46, -h * 0.12); ctx.lineTo(w * 0.5, h * 0.5); ctx.lineTo(-w * 0.5, h * 0.5); ctx.closePath(); ctx.fill();
      ctx.lineWidth = Math.max(1.2, s * 0.045); ctx.strokeStyle = "#8a6410"; ctx.lineJoin = "round"; ctx.stroke();
      ctx.fillStyle = "rgba(138,100,16,.55)"; ctx.fillRect(-w * 0.26, h * 0.06, w * 0.52, h * 0.07); ctx.fillRect(-w * 0.2, h * 0.24, w * 0.4, h * 0.07);
    } else if (g.kind === "note") {
      const w = s * 1.1, h = s * 0.55;
      const sway = g.landedAt ? 1 : 0.6 + 0.4 * Math.abs(Math.cos(g.spin * 0.7));
      ctx.scale(1, sway);
      ctx.fillStyle = "#2a9d62"; rr(-w / 2, -h / 2, w, h, s * 0.05); ctx.fill();
      ctx.fillStyle = "#3dbb7e"; rr(-w / 2 + s * 0.06, -h / 2 + s * 0.06, w - s * 0.12, h - s * 0.12, s * 0.03); ctx.fill();
      ctx.lineWidth = Math.max(1, s * 0.035); ctx.strokeStyle = "#0f5a3d"; rr(-w / 2, -h / 2, w, h, s * 0.05); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, h * 0.28, 0, 6.283); ctx.fillStyle = "#e9f7ee"; ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#0f5a3d"; ctx.font = `800 ${Math.round(h * 0.4)}px "Playfair Display", Georgia, serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("$", 0, h * 0.02);
    } else {    // bag: a lumpy money bag (the Bag Holder trap)
      ctx.fillStyle = "#c9a96a";
      ctx.beginPath(); ctx.moveTo(0, -s * 0.2);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.05, -s * 0.5, s * 0.5, 0, s * 0.5);
      ctx.bezierCurveTo(s * 0.5, s * 0.5, s * 0.5, -s * 0.05, 0, -s * 0.2); ctx.fill();
      ctx.lineWidth = Math.max(1.2, s * 0.045); ctx.strokeStyle = "#6e5428"; ctx.stroke();
      ctx.fillStyle = "#c9a96a"; ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.46); ctx.lineTo(s * 0.2, -s * 0.46); ctx.lineTo(s * 0.08, -s * 0.2); ctx.lineTo(-s * 0.08, -s * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#7b3fa0"; ctx.lineWidth = s * 0.06; ctx.beginPath(); ctx.moveTo(-s * 0.1, -s * 0.22); ctx.lineTo(s * 0.1, -s * 0.22); ctx.stroke();
      ctx.fillStyle = "#4a3410"; ctx.font = `800 ${Math.round(s * 0.4)}px "Playfair Display", Georgia, serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("$", 0, s * 0.2);
    }
    ctx.restore();
  }

  function celebrate(tier) {
    const plan = PLAN[tier];
    if (reduce() || !plan) return;
    ensure();
    if (!heights) { colW = 30 * scale(); heights = new Array(Math.ceil(W / colW) + 1).fill(0); }
    const S = scale(), spread = tier === "miracle" ? 2.4 : 1.5;
    for (let i = 0; i < plan.n; i++) {
      const kind = plan.kinds[i % plan.kinds.length];
      queue.push({
        at: t + (i / plan.n) * spread + Math.random() * 0.12,
        x: Math.random() * (W - 40 * S), y: -40 * S,
        vx: (Math.random() - 0.5) * 70, vy: 60 + Math.random() * 180,
        r: (Math.random() - 0.5) * 1.2, vr: (Math.random() - 0.5) * 6, spin: Math.random() * 6, vs: 6 + Math.random() * 8,
        size: (kind === "bar" ? 36 : kind === "penny" ? 30 : kind === "note" ? 32 : 30) * S * (0.9 + Math.random() * 0.25), kind, tier,
      });
    }
    sfx("rain", spread + 0.5);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
  }

  function groundY(g) {
    const col = Math.max(0, Math.min(heights.length - 1, Math.floor((g.x + g.size / 2) / colW)));
    return { col, y: H - g.size * 0.75 - Math.min(heights[col] * g.size * 0.42, H * PILE_MAX - g.size) - 4 };
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    landed.forEach(drawItem);
    falling.forEach(drawItem);
    sparks.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.a);
      ctx.fillStyle = p.c;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.beginPath(); ctx.moveTo(0, -p.r * 2); ctx.lineTo(p.r * 0.6, 0); ctx.lineTo(0, p.r * 2); ctx.lineTo(-p.r * 0.6, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  function step(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    for (let i = queue.length - 1; i >= 0; i--) {
      if (queue[i].at <= t) { falling.push(queue[i]); queue.splice(i, 1); }
    }
    for (let i = falling.length - 1; i >= 0; i--) {
      const g = falling[i];
      g.vy += G * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.r += g.vr * dt; g.spin += g.vs * dt;
      if (g.tier === "miracle" || g.tier === "t75") {
        if (Math.random() < 0.35) sparks.push({ x: g.x + g.size / 2, y: g.y + g.size / 2, r: 1 + Math.random() * 2.4, a: 1, rot: Math.random() * 3, c: g.tier === "miracle" ? "#fff2b0" : "#f6d578" });
      }
      if (g.x < -8) { g.x = -8; g.vx = Math.abs(g.vx) * 0.4; }
      if (g.x > W - g.size + 8) { g.x = W - g.size + 8; g.vx = -Math.abs(g.vx) * 0.4; }
      const gr = groundY(g);
      if (g.y >= gr.y) {
        g.y = gr.y; g.r = (Math.random() - 0.5) * 0.5; g.landedAt = t;
        heights[gr.col]++;
        landed.push(g); falling.splice(i, 1);
        if (now - lastLand > 60) { sfx("land"); lastLand = now; }
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.a -= dt * 2; p.y += 14 * dt; p.rot += dt * 3; if (p.a <= 0) sparks.splice(i, 1); }
    render();
    const bouncing = landed.some((g) => t - g.landedAt < 0.36);
    raf = queue.length || falling.length || sparks.length || bouncing ? requestAnimationFrame(step) : 0;
  }

  window.Fx = { celebrate, clear, fadeOut };
})();
