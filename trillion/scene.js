/*
  Trillion live scenes: a little market monitor that plays while you answer.
  Scene.play(n) starts scene n (ticking line chart, order book, candlesticks, volume + moving average);
  Scene.stop() pauses it.
*/
(() => {
  "use strict";
  const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  const UP = "#3fcf8e", DOWN = "#ee6a73", GOLD = "#f6d578", DIM = "rgba(244,234,208,.5)";
  const rnd = (a, b) => a + Math.random() * (b - a);

  let canvas = null, ctx = null, raf = 0, W = 0, H = 0, kind = 0, last = 0, T = 0, S = null;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const cssW = canvas.clientWidth || 360, cssH = canvas.clientHeight || 96;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = cssW; H = cssH;
  }

  const BGI = new Image(); BGI.src = "trillion-strip.jpg";
  function paintBg() {
    if (!BGI.complete || !BGI.naturalWidth) return false;
    const k = Math.max(W / BGI.naturalWidth, H / BGI.naturalHeight), w = BGI.naturalWidth * k, h = BGI.naturalHeight * k;
    ctx.drawImage(BGI, (W - w) / 2, (H - h) / 2, w, h);
    ctx.fillStyle = "rgba(6,35,27,.64)"; ctx.fillRect(0, 0, W, H);
    return true;
  }

  function panel() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0b2f24"); g.addColorStop(1, "#06241b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    paintBg();
    ctx.strokeStyle = "rgba(246,213,120,.07)"; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
  }
  function header(sym, price, chg) {
    ctx.font = `600 11px ${MONO}`; ctx.textBaseline = "top"; ctx.textAlign = "left";
    ctx.fillStyle = GOLD; ctx.fillText(sym, 10, 7);
    ctx.fillStyle = chg >= 0 ? UP : DOWN; ctx.textAlign = "right";
    ctx.fillText(`${price.toFixed(2)}  ${chg >= 0 ? "▲" : "▼"} ${Math.abs(chg).toFixed(2)}%`, W - 10, 7);
  }

  // ---- scene 0: ticking line chart ----
  function initLine() {
    const n = Math.ceil(W / 6) + 2, pts = []; let y = 0.5;
    for (let i = 0; i < n; i++) { y = Math.max(0.12, Math.min(0.88, y + rnd(-0.07, 0.075))); pts.push(y); }
    S = { pts, acc: 0, y, price: 1204.5, open: 1204.5 };
  }
  function drawLine(dt) {
    S.acc += dt;
    while (S.acc > 0.16) {
      S.acc -= 0.16; S.pts.shift();
      S.y = Math.max(0.12, Math.min(0.88, S.y + rnd(-0.09, 0.085) - (S.y - 0.5) * 0.04)); S.pts.push(S.y);
      S.price *= 1 + (0.5 - S.y) * 0.002 + rnd(-0.0015, 0.0015);
    }
    const top = 26, bot = H - 8, X = (i) => (i / (S.pts.length - 1)) * W - (S.acc / 0.16) * 6, Y = (v) => top + v * (bot - top);
    const up = S.pts[S.pts.length - 1] <= S.pts[0];
    const col = up ? UP : DOWN;
    ctx.beginPath(); S.pts.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
    ctx.lineTo(X(S.pts.length - 1), H); ctx.lineTo(X(0), H); ctx.closePath();
    const fg = ctx.createLinearGradient(0, top, 0, H); fg.addColorStop(0, up ? "rgba(63,207,142,.28)" : "rgba(238,106,115,.28)"); fg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fg; ctx.fill();
    const ex = X(S.pts.length - 1), ey = Y(S.pts[S.pts.length - 1]), pulse = 3 + Math.sin(T * 6) * 1.2;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ex - 2, ey, pulse, 0, 6.283); ctx.fill();
    header("$TRIL", S.price, ((S.price - S.open) / S.open) * 100);
  }

  // ---- scene 1: order book flicker ----
  function initBook() { S = { rows: Array.from({ length: 5 }, () => ({ b: rnd(0.2, 1), a: rnd(0.2, 1), bt: rnd(0.3, 1), at: rnd(0.3, 1) })), acc: 0, mid: 1204.5 }; }
  function drawBook(dt) {
    S.acc += dt;
    S.rows.forEach((r) => { r.b += (r.bt - r.b) * Math.min(1, dt * 6); r.a += (r.at - r.a) * Math.min(1, dt * 6); });
    if (S.acc > 0.22) { S.acc = 0; const r = S.rows[Math.floor(Math.random() * 5)]; if (Math.random() < 0.5) r.bt = rnd(0.1, 1); else r.at = rnd(0.1, 1); S.mid += rnd(-0.4, 0.4); }
    const rowH = (H - 30) / 5, half = W / 2 - 14;
    ctx.font = `500 10px ${MONO}`; ctx.textBaseline = "middle";
    S.rows.forEach((r, i) => {
      const y = 24 + i * rowH + rowH / 2, h = rowH * 0.62;
      ctx.fillStyle = "rgba(63,207,142,.75)"; const bw = half * r.b; ctx.fillRect(W / 2 - 6 - bw, y - h / 2, bw, h);
      ctx.fillStyle = "rgba(238,106,115,.75)"; const aw = half * r.a; ctx.fillRect(W / 2 + 6, y - h / 2, aw, h);
      ctx.fillStyle = "#e9f7ee"; ctx.textAlign = "left"; ctx.fillText((r.b * 900 | 0) + "", 12, y);
      ctx.textAlign = "right"; ctx.fillText((r.a * 900 | 0) + "", W - 12, y);
    });
    ctx.fillStyle = DIM; ctx.font = `600 10px ${MONO}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(`BID  ·  ${S.mid.toFixed(2)}  ·  ASK`, W / 2, 7);
  }

  // ---- scene 2: scrolling candlesticks ----
  function initCandles() {
    const n = Math.ceil(W / 12) + 2, c = []; let p = 0.5;
    for (let i = 0; i < n; i++) { const o = p; p = Math.max(0.15, Math.min(0.85, p + rnd(-0.14, 0.15))); c.push({ o, c: p, h: Math.max(o, p) + rnd(0.02, 0.09), l: Math.min(o, p) - rnd(0.02, 0.09) }); }
    S = { c, acc: 0, p };
  }
  function drawCandles(dt) {
    S.acc += dt;
    while (S.acc > 0.7) { S.acc -= 0.7; S.c.shift(); const o = S.p; S.p = Math.max(0.15, Math.min(0.85, S.p + rnd(-0.16, 0.17) - (S.p - 0.5) * 0.1)); S.c.push({ o, c: S.p, h: Math.max(o, S.p) + rnd(0.02, 0.09), l: Math.min(o, S.p) - rnd(0.02, 0.09) }); }
    const top = 24, bot = H - 6, Y = (v) => top + (1 - v) * (bot - top), off = (S.acc / 0.7) * 12;
    S.c.forEach((k, i) => {
      const x = i * 12 - off + 6, up = k.c >= k.o, col = up ? UP : DOWN;
      const live = i === S.c.length - 1, e = live ? Math.min(1, S.acc / 0.7) : 1;
      const cl = k.o + (k.c - k.o) * e;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(x, Y(k.h)); ctx.lineTo(x, Y(k.l)); ctx.stroke();
      const y1 = Y(Math.max(k.o, cl)), y2 = Y(Math.min(k.o, cl));
      ctx.fillRect(x - 3.5, y1, 7, Math.max(2, y2 - y1));
    });
    header("INDEX", 1204.5 + (S.p - 0.5) * 120, (S.p - 0.5) * 12);
  }

  // ---- scene 3: volume bars + moving average ----
  function initVol() { const n = Math.ceil(W / 10) + 2; S = { v: Array.from({ length: n }, () => rnd(0.15, 0.9)), acc: 0, ma: [] }; }
  function drawVol(dt) {
    S.acc += dt;
    while (S.acc > 0.2) { S.acc -= 0.2; S.v.shift(); S.v.push(rnd(0.1, 1)); }
    const bot = H - 6, top = 28, off = (S.acc / 0.2) * 10;
    S.v.forEach((v, i) => { const h = v * (bot - top - 14); ctx.fillStyle = v > 0.55 ? "rgba(63,207,142,.55)" : "rgba(246,213,120,.4)"; ctx.fillRect(i * 10 - off, bot - h, 7, h); });
    ctx.beginPath();
    S.v.forEach((v, i) => { let s = 0, c = 0; for (let j = Math.max(0, i - 6); j <= i; j++) { s += S.v[j]; c++; } const y = bot - (s / c) * (bot - top - 14) - 12 + Math.sin(i * 0.3 + T) * 2; if (i) ctx.lineTo(i * 10 - off + 3, y); else ctx.moveTo(i * 10 - off + 3, y); });
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
    ctx.font = `600 11px ${MONO}`; ctx.textBaseline = "top"; ctx.textAlign = "left"; ctx.fillStyle = GOLD; ctx.fillText("VOLUME · MA(7)", 10, 7);
  }

  const SCENES = [[initLine, drawLine], [initBook, drawBook], [initCandles, drawCandles], [initVol, drawVol]];

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
    if (reduce) { panel(); SCENES[kind][1](0.3); return; }
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  window.addEventListener("resize", () => { if (raf && canvas) { resize(); SCENES[kind][0](); } });
  window.Scene = { play, stop };
})();
