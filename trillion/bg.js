/*
  Trillion background: a deep green "terminal" with a faint engraved grid and a few slow price lines
  drifting across. Creates <canvas id="bg-scene"> behind everything.
  API: BgScene.start(), .stop(), .setMood("menu"|"game"|"summary")
*/
(() => {
  "use strict";
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOODS = { menu: { dim: 0, speed: 1, warm: 0 }, game: { dim: 0.28, speed: 0.45, warm: 0 }, summary: { dim: 0, speed: 1.1, warm: 1 } };
  let kick = 0, kickDir = 0, flash = 0;
  let cur = { ...MOODS.menu }, from = { ...cur }, to = { ...cur }, mt = 1;

  let canvas = null, ctx = null, raf = 0, running = false, last = 0;
  let W = 0, H = 0, dpr = 1, base = null, lines = [];
  const rnd = (a, b) => a + Math.random() * (b - a);

  // A price line: a random walk sampled every DX pixels that scrolls left and grows on the right.
  const DX = 14;
  function makeLine(i, n) {
    const baseY = H * (0.2 + (0.62 * (i + 0.5)) / n);
    const amp = rnd(10, 22), pts = [];
    let y = baseY + rnd(-20, 20), drift = 0;
    const count = Math.ceil(W / DX) + 4;
    for (let k = 0; k < count; k++) { drift = drift * 0.9 + rnd(-1, 1) * amp * 0.28; y += drift; y += (baseY - y) * 0.03; pts.push(y); }
    return { baseY, amp, pts, y, drift, off: 0, speed: rnd(5, 11), alpha: rnd(0.07, 0.13), color: i % 2 ? [63, 207, 142] : [246, 213, 120], w: rnd(1.1, 1.8) };
  }

  function paintBase() {
    const c = document.createElement("canvas");
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0d3a2c"); bg.addColorStop(0.55, "#0a2d22"); bg.addColorStop(1, "#06211a");
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(W * 0.5, H * 0.18, 10, W * 0.5, H * 0.18, Math.max(W, H) * 0.7);
    glow.addColorStop(0, "rgba(70,170,120,.20)"); glow.addColorStop(1, "rgba(70,170,120,0)");
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
    // engraved grid
    g.strokeStyle = "rgba(246,213,120,.045)"; g.lineWidth = 1;
    for (let x = 0; x < W; x += 56) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
    for (let y = 0; y < H; y += 56) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,.025)";
    for (let x = 28; x < W; x += 56) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
    // vignette
    const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.8);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.45)");
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    base = c;
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintBase();
    lines = Array.from({ length: 4 }, (_, i) => makeLine(i, 4));
    if (reduce || !running) frame(0);
  }

  function frame(dt) {
    if (!ctx || !base) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sp = cur.speed * (1 + Math.abs(kick) * 2.2);
    kick += (0 - kick) * Math.min(1, dt * 1.8); flash = Math.max(0, flash - dt * 1.4);
    const shiftY = -kick * 26;
    for (const L of lines) {
      L.off += L.speed * sp * dt;
      while (L.off >= DX) {
        L.off -= DX; L.pts.shift();
        L.drift = L.drift * 0.9 + rnd(-1, 1) * L.amp * 0.28;
        L.y += L.drift; L.y += (L.baseY - L.y) * 0.03;
        L.pts.push(L.y);
      }
      const [r, g, b] = L.color;
      const a = L.alpha * (1 + cur.warm * 0.4);
      ctx.save(); ctx.translate(0, shiftY * (0.6 + L.w * 0.4));
      ctx.beginPath();
      L.pts.forEach((y, i) => { const x = i * DX - L.off; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      ctx.strokeStyle = `rgba(${r},${g},${b},${a})`; ctx.lineWidth = L.w; ctx.lineJoin = "round"; ctx.stroke();
      // faint area under the line
      ctx.lineTo(L.pts.length * DX - L.off, H); ctx.lineTo(-L.off, H); ctx.closePath();
      const fg = ctx.createLinearGradient(0, L.baseY - 40, 0, H);
      fg.addColorStop(0, `rgba(${r},${g},${b},${a * 0.22})`); fg.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = fg; ctx.fill(); ctx.restore();
    }
    if (flash > 0.01) { const c = kickDir > 0 ? "63,207,142" : "238,106,115"; const gg = ctx.createLinearGradient(0, kickDir > 0 ? H : 0, 0, kickDir > 0 ? H * 0.3 : H * 0.7); gg.addColorStop(0, `rgba(${c},${flash * 0.16})`); gg.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H); }
    if (cur.dim > 0.005) { ctx.fillStyle = `rgba(2,14,10,${cur.dim})`; ctx.fillRect(0, 0, W, H); }
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (mt < 1) {
      mt = Math.min(1, mt + dt / 0.8);
      const e = 1 - Math.pow(1 - mt, 3);
      for (const k in cur) cur[k] = from[k] + (to[k] - from[k]) * e;
    }
    frame(dt);
    raf = requestAnimationFrame(loop);
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
    if (reduce || running) return;
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
