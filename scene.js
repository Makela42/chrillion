/*
  Merrillion run strip: a photo-style night village (hero-merrillion.jpg) with a slow Ken Burns pan
  and a soft canvas snowfall. Falls back to a navy gradient if the image is missing.
  Scene.play(n) / Scene.stop() / Scene.react("miss"|"good") are called by game.js.
  Paused when hidden or offscreen; one still frame with reduced motion.
*/
(() => {
  "use strict";

  const IMG_SRC = "hero-merrillion.jpg";
  let canvas = null, ctx = null, raf = 0, W = 0, H = 0, dpr = 1, last = 0, t = 0, kind = 0;
  let visible = true, active = false, io = null, flakes = [], pulse = 0, pulseKind = "good";
  let img = null, imgOk = false;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function loadImg() {
    if (img) return;
    img = new Image();
    img.onload = () => { imgOk = true; if (active && !raf) render(0); };
    img.onerror = () => { imgOk = false; };
    img.src = IMG_SRC;
  }

  function makeFlake(anyY) {
    const z = Math.random();   // depth: far flakes are small, slow and faint
    return { x: rnd(0, W), y: anyY ? rnd(0, H) : rnd(-10, 0), r: 0.7 + z * 2.1, vy: 10 + z * 28, drift: rnd(4, 12), ph: rnd(0, 6.28), a: 0.35 + z * 0.5 };
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth || 320; H = canvas.clientHeight || 96;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(18, Math.min(60, Math.round(W / 7)));
    flakes = [];
    for (let i = 0; i < n; i++) flakes.push(makeFlake(true));
  }

  function drawBackdrop() {
    if (imgOk && img.naturalWidth) {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const base = Math.max(W / iw, H / ih);
      const zoom = 1.12 + 0.05 * Math.sin(t * 0.12);         // slow push in / out
      const s = base * zoom, dw = iw * s, dh = ih * s;
      const px = 0.5 + 0.5 * Math.sin(t * 0.09 + kind * 1.7);  // slow horizontal pan
      const py = 0.5 + 0.5 * Math.sin(t * 0.07 + 1);
      ctx.drawImage(img, -(dw - W) * px, -(dh - H) * (0.35 + 0.3 * py), dw, dh);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0b1a3f"); g.addColorStop(1, "#24508a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // gentle vignette so snow and text stay readable
    const v = ctx.createLinearGradient(0, 0, 0, H);
    v.addColorStop(0, "rgba(5,10,30,.18)"); v.addColorStop(1, "rgba(5,10,30,.32)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  function render(dt) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    drawBackdrop();
    const boost = 1 + Math.min(1, pulse) * 1.6;
    ctx.fillStyle = "#fff";
    for (const f of flakes) {
      f.y += f.vy * boost * dt;
      f.x += Math.sin(t * 0.9 + f.ph) * f.drift * dt;
      if (f.y > H + 6) Object.assign(f, makeFlake(false));
      if (f.x < -6) f.x = W + 6; else if (f.x > W + 6) f.x = -6;
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 1.6);
      g.addColorStop(0, `rgba(255,255,255,${f.a})`); g.addColorStop(0.55, `rgba(255,255,255,${f.a * 0.7})`); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 1.6, 0, Math.PI * 2); ctx.fill();
    }
    if (pulse > 0) {   // soft tint flash on an answer: gold for good, rose for a miss
      ctx.fillStyle = pulseKind === "miss" ? `rgba(200,50,58,${0.22 * pulse})` : `rgba(242,193,78,${0.2 * pulse})`;
      ctx.fillRect(0, 0, W, H);
      pulse = Math.max(0, pulse - dt * 1.6);
    }
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
    loadImg();
    kind = ((n % 2) + 2) % 2;
    active = true; t = rnd(0, 20); pulse = 0;
    resize();
    if (window.IntersectionObserver && !io) {
      io = new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) resume(); });
      io.observe(canvas);
    }
    if (reduced()) { render(0); return; }   // one calm still frame
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { active = false; cancelAnimationFrame(raf); raf = 0; }
  function react(what) {
    if (!active) return;
    pulseKind = what === "miss" ? "miss" : "good";
    pulse = 1;
  }

  window.addEventListener("resize", () => { if (active && canvas && canvas.clientWidth) { resize(); if (!raf) render(0); } });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) resume(); });
  window.Scene = { play, stop, react };
})();
