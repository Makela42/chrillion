/*
  Mogillion background: moody night-city / mirror-gym with a face-scan sweep.
  Creates <canvas id="bg-scene"> behind everything. API: BgScene.start(), .stop(), .setMood("menu"|"game"|"summary")
  Static layers are pre-rendered per resize; only scan, grid, bokeh, streaks, landmarks and grain are live.
*/
(() => {
  "use strict";
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const MOODS = { menu: { dim: 0, speed: 1, acc: 1, flash: 1 }, game: { dim: 0.38, speed: 0.45, acc: 0.7, flash: 0 }, summary: { dim: 0, speed: 1, acc: 1.55, flash: 1 } };
  let cur = { ...MOODS.menu }, from = { ...cur }, to = { ...cur }, mt = 1;

  let canvas = null, ctx = null, raf = 0, running = false, last = 0, T = 0, fr = 0;
  let W = 0, H = 0, dpr = 1, S = 1, hy = 0;
  let sky = null, floor = null, vign = null, grain = null, orbSpr = [], scanSpr = null, streakSpr = null;
  let layers = [], orbs = [], dots = [], streak = null, flash = { t: -1 }, grainOff = [0, 0];
  let nextStreak = 6, nextDots = 1.5, nextFlash = 22, scanY = 0;

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function build() {
    const cw = innerWidth, ch = innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    W = cw; H = ch; hy = H * 0.7;
    S = clamp(Math.min(W, H * 1.2) / 800, 0.55, 1.4);
    const N = clamp(W * H / 1e6, 0.3, 2);

    // ---- sky ----
    sky = mk(W * dpr, H * dpr);
    let g = sky.getContext("2d"); g.scale(dpr, dpr);
    let gr = g.createLinearGradient(0, 0, 0, hy);
    gr.addColorStop(0, "#07090d"); gr.addColorStop(0.55, "#0c1424"); gr.addColorStop(1, "#16304a");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    let hg = g.createRadialGradient(W * 0.5, hy, 0, W * 0.5, hy, W * 0.7);
    hg.addColorStop(0, "rgba(77,226,247,0.22)"); hg.addColorStop(0.5, "rgba(60,120,190,0.08)"); hg.addColorStop(1, "rgba(77,226,247,0)");
    g.fillStyle = hg; g.fillRect(0, 0, W, hy + 2);
    // faint violet haze, upper right
    let vg = g.createRadialGradient(W * 0.82, H * 0.18, 0, W * 0.82, H * 0.18, W * 0.5);
    vg.addColorStop(0, "rgba(130,90,220,0.13)"); vg.addColorStop(1, "rgba(130,90,220,0)");
    g.fillStyle = vg; g.fillRect(0, 0, W, H);

    // ---- floor (static part: base + vertical perspective lines) ----
    floor = mk(W * dpr, (H - hy + 2) * dpr);
    g = floor.getContext("2d"); g.scale(dpr, dpr);
    const fh = H - hy;
    let fg = g.createLinearGradient(0, 0, 0, fh);
    fg.addColorStop(0, "#102536"); fg.addColorStop(0.15, "#0a121c"); fg.addColorStop(1, "#06080b");
    g.fillStyle = fg; g.fillRect(0, 0, W, fh + 2);
    // mirror sheen reflected glow
    let rg = g.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, W * 0.55);
    rg.addColorStop(0, "rgba(77,226,247,0.2)"); rg.addColorStop(1, "rgba(77,226,247,0)");
    g.fillStyle = rg; g.fillRect(0, 0, W, fh);
    g.lineWidth = 1;
    const vc = Math.round(clamp(W / 70, 10, 26));
    for (let i = 0; i < 0; i++) {
      const bx = W * 0.5 + i * (W * 2.2 / (vc * 2));
      const lg = g.createLinearGradient(0, 0, 0, fh);
      lg.addColorStop(0, "rgba(77,226,247,0)"); lg.addColorStop(0.3, "rgba(77,226,247,0.16)"); lg.addColorStop(1, "rgba(160,225,255,0.22)");
      g.strokeStyle = lg; g.beginPath(); g.moveTo(W * 0.5, 0); g.lineTo(bx, fh); g.stroke();
    }

    // ---- vignette ----
    vign = mk(W * dpr, H * dpr);
    g = vign.getContext("2d"); g.scale(dpr, dpr);
    let vr = g.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.35, W / 2, H * 0.5, Math.hypot(W, H) * 0.6);
    vr.addColorStop(0, "rgba(0,0,0,0)"); vr.addColorStop(1, "rgba(0,0,0,0.6)");
    g.fillStyle = vr; g.fillRect(0, 0, W, H);

    // ---- grain tile ----
    grain = mk(128, 128);
    g = grain.getContext("2d");
    const id = g.createImageData(128, 128);
    for (let i = 0; i < id.data.length; i += 4) { const v = (Math.random() * 255) | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0);

    // ---- sprites ----
    const cols = [[77, 226, 247], [235, 245, 255], [150, 110, 235]];
    orbSpr = cols.map(c => {
      const r = 32, t = mk(r * 2, r * 2), tg = t.getContext("2d");
      const og = tg.createRadialGradient(r, r, 0, r, r, r);
      og.addColorStop(0, rgba(c, 0.55)); og.addColorStop(0.7, rgba(c, 0.38)); og.addColorStop(0.92, rgba(c, 0.6)); og.addColorStop(1, rgba(c, 0));
      tg.fillStyle = og; tg.fillRect(0, 0, r * 2, r * 2); return t;
    });
    // scan band: soft glow with bright core
    scanSpr = mk(4, 64); g = scanSpr.getContext("2d");
    const sg = g.createLinearGradient(0, 0, 0, 64);
    sg.addColorStop(0, "rgba(77,226,247,0)"); sg.addColorStop(0.46, "rgba(77,226,247,0.16)"); sg.addColorStop(0.5, "rgba(210,250,255,0.95)");
    sg.addColorStop(0.54, "rgba(77,226,247,0.16)"); sg.addColorStop(1, "rgba(77,226,247,0)");
    g.fillStyle = sg; g.fillRect(0, 0, 4, 64);
    // chrome streak: horizontal tapered
    streakSpr = mk(256, 8); g = streakSpr.getContext("2d");
    const kg = g.createLinearGradient(0, 0, 256, 0);
    kg.addColorStop(0, "rgba(220,240,255,0)"); kg.addColorStop(0.7, "rgba(220,240,255,0.5)"); kg.addColorStop(0.95, "rgba(255,255,255,0.95)"); kg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = kg; g.fillRect(0, 3, 256, 2);
    g.globalAlpha = 0.25; g.fillRect(0, 1, 256, 6);

    // ---- skyline layers (tiled, periodic) ----
    layers = [];
    const defs = [
      { h: 0.2, col: "#0d1a2b", edge: "rgba(77,226,247,0.12)", speed: 2, bw: [26, 60], win: 0.05, wc: "#8fe9f7" },
      { h: 0.14, col: "#0a121e", edge: "rgba(160,225,255,0.18)", speed: 5, bw: [34, 80], win: 0.09, wc: "#d6f6ff" },
      { h: 0.09, col: "#070b12", edge: "rgba(200,240,255,0.26)", speed: 9, bw: [44, 100], win: 0.12, wc: "#ffffff" }
    ];
    defs.forEach((d, li) => {
      const tile = mk(W * dpr, H * dpr), t = tile.getContext("2d"); t.scale(dpr, dpr);
      const win = [];
      let x = 0; const maxH = H * d.h;
      while (x < W) {
        const bw = Math.min(W - x, rnd(d.bw[0], d.bw[1]) * S * 0.9 + 6), bh = maxH * rnd(0.3, 1);
        t.fillStyle = d.col; t.fillRect(x, hy - bh, bw + 0.5, bh + 2);
        t.fillStyle = d.edge; t.fillRect(x, hy - bh, bw, 1);
        if (Math.random() < 0.25) { t.fillStyle = d.col; t.fillRect(x + bw * 0.4, hy - bh - 10 * S, 1.5, 10 * S); }
        const cx = Math.floor(bw / (7 * S)), cy = Math.floor(bh / (9 * S));
        for (let a = 0; a < cx; a++) for (let b = 1; b < cy; b++) if (Math.random() < d.win) {
          win.push({ x: x + 3 + a * 7 * S, y: hy - bh + b * 9 * S, w: 2.4 * S, h: 3.4 * S, p: rnd(0, TAU), s: rnd(0.2, 0.8), tw: Math.random() < 0.15 });
        }
        x += bw + rnd(0, 3);
      }
      // base haze fade to horizon
      const hz = t.createLinearGradient(0, hy - maxH, 0, hy);
      hz.addColorStop(0, "rgba(77,226,247,0)"); hz.addColorStop(1, `rgba(77,226,247,${0.07 - li * 0.015})`);
      t.globalCompositeOperation = "source-atop"; t.fillStyle = hz; t.fillRect(0, hy - maxH, W, maxH + 2);
      layers.push({ tile, x: rnd(0, W), speed: d.speed, win, wc: d.wc });
    });

    // ---- bokeh ----
    const n = Math.round(14 * N + 8);
    orbs = Array.from({ length: n }, () => ({ x: rnd(0, W), y: rnd(0, H * 0.95), r: rnd(10, 48) * S, k: Math.random() < 0.5 ? 0 : Math.random() < 0.6 ? 1 : 2, vx: rnd(-6, 6), vy: rnd(-5, -1), a: rnd(0.12, 0.38), p: rnd(0, TAU), s: rnd(0.2, 0.6) }));
    dots = []; streak = null;
  }

  // ---- face-scan landmarks: a mesh of dots + thin lines that fade in/out ----
  function spawnDots() {
    const r = Math.min(W, H) * rnd(0.12, 0.2), cx = rnd(W * 0.12, W * 0.88), cy = rnd(H * 0.12, H * 0.55);
    const n = (6 + Math.random() * 4) | 0, pts = [];
    for (let i = 0; i < n; i++) pts.push({ x: cx + rnd(-1, 1) * r * 0.8, y: cy + rnd(-1, 1) * r * 1.1 });
    pts.sort((a, b) => a.x - b.x);
    dots.push({ pts, t: 0, life: rnd(5, 8), tick: Math.random() < 0.6, r });
    if (dots.length > 3) dots.shift();
  }

  function drawDots(dt, sp, acc) {
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i]; d.t += dt * sp;
      const u = d.t / d.life; if (u >= 1) { dots.splice(i, 1); continue; }
      const a = Math.sin(u * Math.PI) ** 0.8 * 0.55 * acc;
      ctx.globalAlpha = a * 0.55; ctx.strokeStyle = "#8fefff"; ctx.lineWidth = 0.8;
      ctx.beginPath();
      const p = d.pts, shown = Math.min(p.length, Math.ceil(clamp(u * 4, 0, 1) * p.length));
      for (let k = 0; k < shown; k++) { if (k) ctx.lineTo(p[k].x, p[k].y); else ctx.moveTo(p[k].x, p[k].y); }
      if (shown > 3) { ctx.moveTo(p[0].x, p[0].y); ctx.lineTo(p[shown - 1].x, p[shown - 1].y); ctx.moveTo(p[1].x, p[1].y); ctx.lineTo(p[shown - 2].x, p[shown - 2].y); }
      ctx.stroke();
      ctx.globalAlpha = a; ctx.fillStyle = "#e8fbff";
      for (let k = 0; k < shown; k++) { ctx.fillRect(p[k].x - 1.5, p[k].y - 1.5, 3, 3); }
      if (d.tick) {
        // measurement line with end caps
        const q = p[0], w = p[shown - 1];
        const my = Math.max(q.y, w.y) + d.r * 0.35;
        ctx.globalAlpha = a * 0.7; ctx.strokeStyle = "#4de2f7"; ctx.beginPath();
        ctx.moveTo(q.x, my); ctx.lineTo(w.x, my); ctx.moveTo(q.x, my - 4); ctx.lineTo(q.x, my + 4); ctx.moveTo(w.x, my - 4); ctx.lineTo(w.x, my + 4); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function frame(dt) {
    const m = cur, sp = m.speed, acc = m.acc;
    T += dt * sp; fr++;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(sky, 0, 0, W, H);

    // bokeh (behind skyline for depth)
    ctx.globalCompositeOperation = "lighter";
    for (const o of orbs) {
      o.x += o.vx * dt * sp; o.y += o.vy * dt * sp;
      if (o.y < -o.r) { o.y = H + o.r; o.x = rnd(0, W); } if (o.x < -o.r) o.x = W + o.r; else if (o.x > W + o.r) o.x = -o.r;
      ctx.globalAlpha = o.a * (0.65 + 0.35 * Math.sin(T * o.s + o.p)) * (0.7 + 0.3 * acc);
      ctx.drawImage(orbSpr[o.k], o.x - o.r, o.y - o.r, o.r * 2, o.r * 2);
    }
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;

    // skyline layers + windows
    for (const L of layers) {
      L.x = (L.x + L.speed * dt * sp * S) % W;
      const ox = -L.x;
      ctx.drawImage(L.tile, ox, 0, W, H); ctx.drawImage(L.tile, ox + W, 0, W, H);
      ctx.fillStyle = L.wc;
      for (const w of L.win) {
        const f = w.tw ? 0.35 + 0.65 * Math.max(0, Math.sin(T * w.s * 3 + w.p)) : 0.55 + 0.25 * Math.sin(T * w.s + w.p);
        ctx.globalAlpha = f * 0.75 * (0.8 + 0.2 * acc);
        for (let k = 0; k < 2; k++) { const x = w.x + ox + k * W; if (x < -8 || x > W + 8) continue; ctx.fillRect(x, w.y, w.w, w.h); }
      }
    }
    ctx.globalAlpha = 1;

    // floor
    ctx.drawImage(floor, 0, hy, W, H - hy + 2);
    // moving horizontal grid lines (perspective)
    const fh = H - hy, nl = 0, ph = 0;
    ctx.strokeStyle = "#7fe9fa"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < nl; i++) {
      const z = (i + ph) / nl, y = hy + fh * z * z * z;
      ctx.globalAlpha = clamp(z * 1.6, 0, 1) * 0.2 * acc; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // horizon glow line
    ctx.globalCompositeOperation = "lighter";
    const hl = ctx.createLinearGradient(0, 0, W, 0);
    hl.addColorStop(0, "rgba(77,226,247,0)"); hl.addColorStop(0.5, `rgba(120,235,255,${0.5 * acc})`); hl.addColorStop(1, "rgba(77,226,247,0)");
    ctx.fillStyle = hl; ctx.fillRect(0, hy - 0.5, W, 1.2);

    // face-scan sweep: slow top->bottom, ping-pong with ease
    const cyc = 11 / 1, ph2 = (T % cyc) / cyc, tri = ph2 < 0.5 ? ph2 * 2 : 2 - ph2 * 2, e = tri * tri * (3 - 2 * tri);
    scanY = H * (0.06 + 0.88 * e);
    const bh = 70 * S + 20;
    ctx.globalAlpha = 0.2 * acc; ctx.drawImage(scanSpr, 0, scanY - bh / 2, W, bh);
    // faint trailing fill behind sweep
    ctx.globalAlpha = 0; ctx.fillStyle = "#4de2f7";
    ctx.fillRect(0, ph2 < 0.5 ? scanY - H * 0.12 : scanY, W, H * 0.12);
    ctx.globalAlpha = 1;

    // landmarks
    /* landmark mesh removed: cleaner scene */
    /* drawDots removed */

    // chrome streak
    if (!reduce) {
      nextStreak -= dt;
      if (!streak && nextStreak <= 0) { streak = { x: rnd(-0.1, 0.5) * W, y: rnd(H * 0.1, H * 0.6), t: 0, len: rnd(0.35, 0.6) * W, ang: rnd(-0.28, -0.1), dur: rnd(1.2, 1.8) }; nextStreak = rnd(9, 16); }
    }
    if (streak) {
      streak.t += dt; const u = streak.t / streak.dur;
      if (u >= 1) streak = null;
      else {
        const a = Math.sin(u * Math.PI), px = streak.x + u * W * 0.5;
        ctx.save(); ctx.translate(px, streak.y + u * 40); ctx.rotate(streak.ang);
        ctx.globalAlpha = a * 0.7 * acc; ctx.drawImage(streakSpr, 0, -4, streak.len, 8);
        // flare at head
        ctx.globalAlpha = a * 0.5 * acc; const fl = 14 * S; ctx.drawImage(orbSpr[1], streak.len - fl * 2, -fl * 2, fl * 4, fl * 4);
        ctx.restore();
      }
    }
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;

    // grain (random offset, cheap) + vignette
    ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = "overlay";
    if (fr % 3 === 0) grainOff = [(Math.random() * 128) | 0, (Math.random() * 128) | 0];
    ctx.fillStyle = ctx.createPattern(grain, "repeat");
    ctx.save(); ctx.translate(-grainOff[0], -grainOff[1]); ctx.fillRect(0, 0, W + 128, H + 128); ctx.restore();
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.drawImage(vign, 0, 0, W, H);

    // mood dim
    if (m.dim > 0.001) { ctx.fillStyle = `rgba(4,6,10,${m.dim})`; ctx.fillRect(0, 0, W, H); }

    // phonk flash: gentle, rare, single soft pulse
    if (!reduce) {
      nextFlash -= dt * (m.flash > 0.5 ? 1 : 0);
      if (flash.t < 0 && nextFlash <= 0) { flash.t = 0; nextFlash = rnd(22, 38); }
      if (flash.t >= 0) {
        flash.t += dt; const u = flash.t / 0.45;
        if (u >= 1) flash.t = -1;
        else { ctx.globalAlpha = 0.07 * Math.sin(u * Math.PI) ** 2; ctx.fillStyle = "#eaf8ff"; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      }
    }
  }

  // ---------- loop / API ----------
  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    if (mt < 1) {
      mt = Math.min(1, mt + dt / 0.8);
      const e = mt * mt * (3 - 2 * mt);
      for (const k in cur) cur[k] = from[k] + (to[k] - from[k]) * e;
    }
    frame(dt);
  }

  function ensure() {
    if (canvas) return;
    const st = document.createElement("style"); st.id = "bg-css";
    st.textContent = "#bg-scene{position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block;background:#08090b}";
    document.head.appendChild(st);
    canvas = document.createElement("canvas"); canvas.id = "bg-scene"; canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext("2d");
    let rt = 0, lw = innerWidth, lh = innerHeight;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (innerWidth === lw && Math.abs(innerHeight - lh) < 120 && innerWidth < 600) return; lw = innerWidth; lh = innerHeight; build(); if (reduce || !running) frame(0); }, 150);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf), raf = 0; }
      else if (running && !reduce) { last = performance.now(); raf = requestAnimationFrame(tick); }
    });
    build();
  }

  function start() {
    ensure();
    if (reduce) { T = 2.5; frame(0); return; }
    if (running) return;
    running = true; last = performance.now();
    if (!document.hidden) raf = requestAnimationFrame(tick);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function setMood(name) {
    const t = MOODS[name]; if (!t) return;
    from = { ...cur }; to = { ...t }; mt = 0;
    if (reduce || !running) { cur = { ...t }; mt = 1; if (canvas) frame(0); }
  }

  window.BgScene = { start, stop, setMood };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
