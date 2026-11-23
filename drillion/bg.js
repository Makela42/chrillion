/*
  Drillion background: pale mint clinic tiles with a few slowly drifting soap / toothpaste bubbles.
  Creates <canvas id="bg-scene"> behind everything. Capped at ~30fps, paused when the tab is hidden.
  API: BgScene.start(), .stop(), .setMood("menu"|"game"|"summary"), .react(good)
*/
(() => {
  "use strict";
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOODS = { menu: { dim: 0, speed: 1, warm: 0 }, game: { dim: 0.1, speed: 0.5, warm: 0 }, summary: { dim: 0, speed: 1.2, warm: 1 } };
  let kick = 0, kickDir = 0, flash = 0;
  let cur = { ...MOODS.menu }, from = { ...cur }, to = { ...cur }, mt = 1;

  let canvas = null, ctx = null, raf = 0, running = false, last = 0;
  let W = 0, H = 0, dpr = 1, base = null, bubbles = [];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const TILE = 64, FRAME = 1000 / 30;

  function mkBubble(initial) {
    return { x: rnd(0, W), y: initial ? rnd(0, H) : H + 40, r: rnd(8, 30), sp: rnd(5, 14), ph: rnd(0, 6.28), a: rnd(0.35, 0.7) };
  }

  function paintBase() {
    const c = document.createElement("canvas");
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#e6f7f0"); bg.addColorStop(1, "#d3efe4");
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(47,157,131,.14)"; g.lineWidth = 1.5;
    for (let x = 0; x <= W; x += TILE) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
    for (let y = 0; y <= H; y += TILE) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
    // a faint glossy highlight in each tile corner
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 2;
    for (let x = 0; x < W; x += TILE) for (let y = 0; y < H; y += TILE) { g.beginPath(); g.moveTo(x + 8, y + 18); g.lineTo(x + 8, y + 8); g.lineTo(x + 18, y + 8); g.stroke(); }
    base = c;
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintBase();
    bubbles = Array.from({ length: Math.max(5, Math.min(12, Math.round(W / 130))) }, () => mkBubble(true));
    frame(0);
  }

  function frame(dt) {
    if (!ctx || !base) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    kick += (0 - kick) * Math.min(1, dt * 2); flash = Math.max(0, flash - dt * 1.4);
    const sp = cur.speed * (1 + Math.abs(kick) * 2);
    for (const b of bubbles) {
      b.y -= b.sp * sp * dt; b.ph += dt * 0.5;
      if (b.y < -b.r - 10) Object.assign(b, mkBubble(false));
      const x = b.x + Math.sin(b.ph) * 14;
      ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, 6.2832);
      ctx.fillStyle = `rgba(255,255,255,${b.a * 0.35})`; ctx.fill();
      ctx.strokeStyle = `rgba(47,157,131,${b.a * 0.45})`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(x - b.r * 0.4, b.y - b.r * 0.4, b.r * 0.2, 0, 6.2832); ctx.fillStyle = `rgba(255,255,255,${b.a})`; ctx.fill();
    }
    if (flash > 0.01) { ctx.fillStyle = kickDir > 0 ? `rgba(47,157,131,${flash * 0.12})` : `rgba(239,90,76,${flash * 0.1})`; ctx.fillRect(0, 0, W, H); }
    if (cur.warm > 0.01) { ctx.fillStyle = `rgba(224,169,43,${cur.warm * 0.06})`; ctx.fillRect(0, 0, W, H); }
    if (cur.dim > 0.005) { ctx.fillStyle = `rgba(15,58,64,${cur.dim * 0.35})`; ctx.fillRect(0, 0, W, H); }
  }

  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (mt < 1) {
      mt = Math.min(1, mt + dt / 0.8);
      const e = 1 - Math.pow(1 - mt, 3);
      for (const k in cur) cur[k] = from[k] + (to[k] - from[k]) * e;
    }
    frame(dt);
  }

  function ensure() {
    if (canvas) return;
    const st = document.createElement("style");
    st.textContent = "#bg-scene{position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block}";
    document.head.appendChild(st);
    canvas = document.createElement("canvas"); canvas.id = "bg-scene"; canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext("2d");
    resize();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else start(); });
  }

  function start() {
    ensure();
    if (reduce || running || document.hidden) return;
    running = true; last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function react(good) {
    if (reduce) return;
    kickDir = good ? 1 : -1; kick = kickDir; flash = 1;
  }

  function setMood(name) {
    const t = MOODS[name] || MOODS.menu;
    ensure();
    from = { ...cur }; to = { ...t }; mt = 0;
    if (reduce || !running) { cur = { ...t }; mt = 1; frame(0); }
  }

  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  window.BgScene = { start, stop, setMood, react };
})();
