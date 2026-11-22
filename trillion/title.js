/*
  Trillion title scene: a candlestick chart that draws itself, then keeps ticking, with a ticker board on top.
  Smooth canvas drawing at full frame rate. Title.start() / Title.stop() are called by game.js when the home screen shows or hides.
*/
(() => {
  "use strict";
  const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  const UP = "#7fc8a0", DOWN = "#c9776a", GOLD = "#f6d578";
  const rnd = (a, b) => a + Math.random() * (b - a);
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  let canvas = null, ctx = null, raf = 0, W = 0, H = 0, last = 0, T = 0, running = false;
  let candles = [], shown = 0, acc = 0, price = 100, dxc = 13, tickX = 0;
  const TICKERS = [["TRIL", 1204.5], ["BULL", 88.2], ["INDEX", 5120.4], ["GOLD", 2310.1], ["BAGHLD", 4.7], ["ALPHA", 312.9], ["PENNY", 0.42], ["BEAR", 17.3]];
  const tick = TICKERS.map(([s, p]) => ({ s, p, c: rnd(-3, 4) }));

  function newCandle(o) {
    const c = o + rnd(-4.2, 4.2) + (100 - o) * 0.012 + 0.25;
    return { o, c, h: Math.max(o, c) + rnd(0.6, 3), l: Math.min(o, c) - rnd(0.6, 3) };
  }
  function build() {
    const n = Math.ceil(W / dxc) + 3;
    candles = []; price = 100;
    for (let i = 0; i < n; i++) { const k = newCandle(price); candles.push(k); price = k.c; }
    shown = reduce ? n : 0; acc = 0;
  }

  function resize() {
    const cssW = canvas.clientWidth || 360, cssH = canvas.clientHeight || 220;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = cssW; H = cssH;
    dxc = W < 340 ? 11 : 13;
    build();
  }

  function draw(dt) {
    // panel
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0c3a2c"); g.addColorStop(1, "#06231a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(246,213,120,.08)"; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x + 0.5, 22); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
    for (let y = 22; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }

    // progress / scroll
    if (shown < candles.length) { acc += dt; while (acc > 0.07 && shown < candles.length) { acc -= 0.07; shown++; } }
    else { acc += dt; while (acc > 0.5) { acc -= 0.5; candles.shift(); const k = newCandle(price); candles.push(k); price = k.c; } }
    const scrolling = shown >= candles.length;
    const off = scrolling ? (acc / 0.5) * dxc : 0;

    const vis = candles.slice(0, shown);
    let lo = Infinity, hi = -Infinity;
    vis.forEach((k) => { lo = Math.min(lo, k.l); hi = Math.max(hi, k.h); });
    if (!isFinite(lo)) { lo = 90; hi = 110; }
    const padT = 56, padB = 14, Y = (v) => padT + (1 - (v - lo) / (hi - lo || 1)) * (H - padT - padB);

    // candles
    vis.forEach((k, i) => {
      const x = i * dxc - off + dxc / 2 + 4, up = k.c >= k.o, col = up ? UP : DOWN;
      const grow = i === shown - 1 && !scrolling ? Math.min(1, acc / 0.07) : 1;
      const cl = k.o + (k.c - k.o) * grow;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(x, Y(k.h)); ctx.lineTo(x, Y(k.l)); ctx.stroke();
      const y1 = Y(Math.max(k.o, cl)), y2 = Y(Math.min(k.o, cl));
      ctx.fillRect(x - dxc * 0.3, y1, dxc * 0.6, Math.max(2, y2 - y1));
    });
    // moving average line
    ctx.beginPath();
    vis.forEach((k, i) => {
      let s = 0, c = 0; for (let j = Math.max(0, i - 7); j <= i; j++) { s += (vis[j].o + vis[j].c) / 2; c++; }
      const x = i * dxc - off + dxc / 2 + 4, y = Y(s / c);
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    });
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.globalAlpha = 0.9; ctx.stroke(); ctx.globalAlpha = 1;
    // last-price tag
    if (vis.length) {
      const lk = vis[vis.length - 1], y = Y(lk.c);
      ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(246,213,120,.55)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); ctx.setLineDash([]);
      const label = (1000 + lk.c * 2.4).toFixed(1);
      ctx.fillStyle = lk.c >= lk.o ? UP : DOWN;
      const tw = 52; ctx.fillRect(W - tw - 4, y - 8, tw, 16);
      ctx.fillStyle = "#06231a"; ctx.font = `600 10px ${MONO}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, W - tw / 2 - 4, y + 0.5);
    }

    // ticker board
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(0, 0, W, 24);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 24); ctx.clip();
    ctx.font = `600 11px ${MONO}`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    const itemW = 108, total = tick.length * itemW;
    tickX = (tickX - dt * 26) % total;
    for (let rep = 0; rep < 2 + Math.ceil(W / total); rep++) {
      tick.forEach((t, i) => {
        const x = tickX + rep * total + i * itemW;
        if (x > W || x < -itemW) return;
        ctx.fillStyle = "#f4ead0"; ctx.fillText(t.s, x + 6, 12.5);
        ctx.fillStyle = t.c >= 0 ? UP : DOWN; ctx.fillText(`${t.c >= 0 ? "▲" : "▼"}${Math.abs(t.c).toFixed(1)}%`, x + 6 + ctx.measureText(t.s).width + 6, 12.5);
      });
    }
    ctx.restore();
    // title ghost
    ctx.font = `800 13px ${MONO}`; ctx.fillStyle = "rgba(246,213,120,.85)"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText("$TRIL · DAILY", 10, 32);
    const lastC = vis.length ? 100 + ((vis[vis.length - 1].c - vis[0].o) / vis[0].o) * 100 : 100;
    ctx.font = `600 11px ${MONO}`; ctx.fillStyle = lastC >= 100 ? UP : DOWN;
    ctx.fillText(`${lastC >= 100 ? "▲" : "▼"} ${Math.abs(lastC - 100).toFixed(1)}%`, 10, 47 - 2);
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; T += dt;
    if (!tick._t || T - tick._t > 1.4) { tick._t = T; const t = tick[Math.floor(Math.random() * tick.length)]; t.c = Math.max(-9, Math.min(9, t.c + rnd(-1.6, 1.8))); }
    draw(dt);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    const c = document.getElementById("hero-scene");
    if (!c) return;
    if (c !== canvas) canvas = c;
    cancelAnimationFrame(raf);
    resize();
    running = true; last = performance.now();
    if (reduce) { draw(0.1); return; }
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  window.Title = { start, stop };
})();
