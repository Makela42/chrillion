/*
  Merrillion background: a quiet, painted Christmas night (same world as the title card and run strip).
  Creates <canvas id="bg-scene"> behind everything. API: BgScene.start(), .stop(), .setMood("menu"|"game"|"summary")
  Static art (sky, moon, hills, pines, cabins) is rendered once per resize into offscreen canvases.
  Only aurora, twinkle, window flicker, smoke, snow and the rare sleigh move. Parallax is desktop-only.
*/
(() => {
  "use strict";
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia && matchMedia("(pointer: coarse)").matches;

  const MOODS = { menu: { dim: 0, speed: 1, snow: 1, warm: 0 }, game: { dim: 0.3, speed: 0.5, snow: 0.7, warm: 0 }, summary: { dim: 0.04, speed: 1, snow: 1.5, warm: 1 } };
  let cur = { ...MOODS.menu }, from = { ...cur }, to = { ...cur }, mt = 1;

  let canvas = null, ctx = null, raf = 0, running = false, last = 0, T = 0;
  let W = 0, H = 0, dpr = 1, ld = 1, S = 1, M = 0, MV = 0, phone = false;
  let sky = null, auroraC = null, auroraG = null, auroraSpr = [], starSpr = null, flakeSpr = [], bokeh = {}, puffSpr = null, glowSpr = null;
  let layers = [], stars = [], snow = [[], [], []], smoke = [];
  let moon = { x: 0, y: 0, r: 0 };
  let sleighT = -1, nextSleigh = 14;
  let px = 0, py = 0, tpx = 0, tpy = 0, sy = 0, tsy = 0;

  // ---------- noise ----------
  const hash = (i, s) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
  const sm = k => k * k * (3 - 2 * k);
  const vn = (x, s) => { const i = Math.floor(x), f = x - i; return lerp(hash(i, s), hash(i + 1, s), sm(f)); };
  // non-repeating natural ridge, roughly -1..1
  const fbm = (x, s) => { let a = 1, f = 1, v = 0, n = 0; for (let o = 0; o < 5; o++) { v += (vn(x * f, s + o * 17) - 0.5) * a; n += a; a *= 0.5; f *= 2.05; } return (v / n) * 2; };

  // ---------- trees ----------
  function pine(g, x, y, h, col, lit, o) {
    const n = clamp(Math.round(4 + h / 18), 4, 11), hw = h * rnd(0.2, 0.28), top = y - h, lean = rnd(-0.03, 0.03) * h;
    const L = [], R = [], tiers = [];
    for (let i = 0; i < n; i++) {
      const k = (i + 1) / n, yt = top + h * 0.9 * (i / n) + h * 0.02, yb = top + h * 0.9 * k + h * 0.05;
      const w = hw * (0.22 + 0.78 * k) * rnd(0.82, 1.12), dr = h * 0.035 * rnd(0.6, 1.4);
      const cx = x + lean * (1 - k);
      tiers.push({ cx, yt, yb, w, dr });
      L.push([cx - w * 0.38, yt + (yb - yt) * 0.35], [cx - w, yb + dr]);
      R.unshift([cx + w, yb + dr * rnd(0.6, 1.3)], [cx + w * 0.38, yt + (yb - yt) * 0.35]);
      if (i < n - 1) { L.push([cx - w * 0.45, yb - dr * 0.4]); R.unshift([cx + w * 0.45, yb - dr * 0.4]); }
    }
    g.fillStyle = col; g.beginPath(); g.moveTo(x + lean, top);
    for (const p of L) g.lineTo(p[0], p[1]);
    g.lineTo(x - hw * 0.07, y); g.lineTo(x + hw * 0.07, y);
    for (const p of R) g.lineTo(p[0], p[1]);
    g.closePath(); g.fill();
    if (o.rim > 0) { // moonlit side: lighter wedge on the side facing the moon
      const d = o.dir;
      g.fillStyle = `rgba(${o.rc},${o.rim})`;
      for (const t of tiers) {
        g.beginPath(); g.moveTo(t.cx + d * t.w * 0.02, t.yt); g.lineTo(t.cx + d * t.w, t.yb + t.dr); g.lineTo(t.cx + d * t.w * 0.45, t.yb - t.dr * 0.4); g.closePath(); g.fill();
      }
    }
    if (o.snow > 0) { // snow clumps on the branch tips
      g.fillStyle = `rgba(200,216,248,${o.snow * 0.55})`;
      for (const t of tiers) for (const s of [-1, 1]) {
        if (Math.random() < 0.45) continue;
        const bx = t.cx + s * t.w * rnd(0.5, 0.95), by = t.yb + t.dr * 0.2;
        for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(bx + rnd(-1, 1) * t.w * 0.12, by + rnd(-1, 0.4) * h * 0.012, rnd(0.5, 1) * h * 0.016 + 0.4, 0, TAU); g.fill(); }
      }
    }
    return tiers;
  }

  function cabin(g, x, y, w, h, o) {
    g.fillStyle = o.wall; g.fillRect(x, y - h, w, h + 2);
    g.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 1; i < 4; i++) g.fillRect(x, y - h + (h * i) / 4, w, 0.6);
    const pk = w * 0.36;
    g.fillStyle = o.roof; g.beginPath(); g.moveTo(x - w * 0.12, y - h + 1); g.lineTo(x + w / 2, y - h - pk); g.lineTo(x + w * 1.12, y - h + 1); g.closePath(); g.fill();
    const sg = g.createLinearGradient(x, 0, x + w, 0); sg.addColorStop(0, "#9fb0d6"); sg.addColorStop(1, "#eef3ff");
    g.fillStyle = sg; g.beginPath(); g.moveTo(x - w * 0.14, y - h + 1.5); g.lineTo(x + w / 2, y - h - pk - 1.5); g.lineTo(x + w * 1.14, y - h + 1.5);
    g.lineTo(x + w * 1.0, y - h + 3.5); g.quadraticCurveTo(x + w * 0.5, y - h - pk + 3, x + w * 0.0, y - h + 3.5); g.closePath(); g.fill();
    const cx = x + w * 0.74;
    g.fillStyle = "#3a2a33"; g.fillRect(cx, y - h - pk * 1.05, w * 0.13, pk * 0.8);
    g.fillStyle = "#dfe8ff"; g.fillRect(cx - 0.8, y - h - pk * 1.1, w * 0.13 + 1.6, 1.8);
    // door + windows (warm light), glow bouncing on the snow below
    const wins = [[0.14, 0.34, 0.26, 0.32], [0.6, 0.34, 0.26, 0.32]];
    g.fillStyle = "#1a1016"; g.fillRect(x + w * 0.42, y - h * 0.5, w * 0.15, h * 0.5);
    const out = [];
    for (const [a, b, c, d] of wins) {
      const wx = x + w * a, wy = y - h + h * b, ww = w * c, wh = h * d;
      const wg = g.createLinearGradient(0, wy, 0, wy + wh); wg.addColorStop(0, "#ffe49a"); wg.addColorStop(1, "#ffa84a");
      g.fillStyle = wg; g.fillRect(wx, wy, ww, wh);
      g.fillStyle = "rgba(40,20,10,0.55)"; g.fillRect(wx + ww / 2 - 0.4, wy, 0.8, wh);
      out.push({ x: wx + ww / 2, y: wy + wh / 2, w: ww, h: wh });
    }
    g.save(); g.globalCompositeOperation = "lighter";
    const gx = x + w / 2, gy = y + 1, rx = w * 1.5, gg = g.createRadialGradient(gx, gy, 0, gx, gy, rx);
    gg.addColorStop(0, "rgba(255,170,70,0.30)"); gg.addColorStop(0.5, "rgba(255,140,50,0.10)"); gg.addColorStop(1, "rgba(255,140,50,0)");
    g.translate(0, gy); g.scale(1, 0.32); g.translate(0, -gy); g.fillStyle = gg; g.fillRect(gx - rx, gy - rx, rx * 2, rx * 2);
    g.restore();
    return { chim: [cx + w * 0.065, y - h - pk * 1.1], wins: out };
  }

  // ---------- sprites ----------
  function makeSprites() {
    const sp = (r, stops) => { const c = mk(r * 2, r * 2), g = c.getContext("2d"), gr = g.createRadialGradient(r, r, 0, r, r, r); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); c.r = r; return c; };
    starSpr = sp(16, [[0, "rgba(255,255,255,1)"], [0.12, "rgba(255,255,255,0.9)"], [0.35, "rgba(200,215,255,0.22)"], [1, "rgba(200,215,255,0)"]]);
    flakeSpr = [
      sp(4, [[0, "rgba(255,255,255,0.95)"], [0.5, "rgba(235,242,255,0.6)"], [1, "rgba(235,242,255,0)"]]),
      sp(8, [[0, "rgba(255,255,255,0.9)"], [0.45, "rgba(235,242,255,0.5)"], [1, "rgba(235,242,255,0)"]]),
      sp(14, [[0, "rgba(255,255,255,0.5)"], [0.5, "rgba(235,242,255,0.22)"], [1, "rgba(235,242,255,0)"]])
    ];
    puffSpr = sp(24, [[0, "rgba(205,214,238,0.5)"], [0.5, "rgba(190,200,230,0.2)"], [1, "rgba(190,200,230,0)"]]);
    glowSpr = sp(24, [[0, "rgba(255,190,110,0.85)"], [0.4, "rgba(255,150,60,0.28)"], [1, "rgba(255,140,50,0)"]]);
    bokeh = {};
    for (const [k, c] of [["r", "255,80,70"], ["y", "255,214,110"], ["b", "110,200,255"], ["g", "130,255,160"], ["p", "255,140,220"]])
      bokeh[k] = sp(16, [[0, `rgba(${c},0.95)`], [0.18, `rgba(${c},0.7)`], [0.5, `rgba(${c},0.18)`], [1, `rgba(${c},0)`]]);
  }

  // ---------- build everything for the current viewport ----------
  function build() {
    const cw = innerWidth, ch = innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    ld = Math.min(dpr, 1.5);
    W = cw; H = ch; phone = W < 600;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    S = clamp(Math.min(W, H * 1.3) / 800, 0.6, 1.4);
    M = (coarse || reduce) ? 0 : Math.round(W * 0.035); MV = (coarse || reduce) ? 0 : Math.round(H * 0.05);
    makeSprites();
    { const r = phone ? 15 : clamp(Math.min(W, H) * 0.055, 20, 54); const x = phone ? W - r - 12 : Math.min(W - r - 14, Math.max(W * 0.76, W / 2 + 450 + r + 16)); moon = { x, y: phone ? r + 8 : H * 0.17, r }; }
    const wide = W >= 1000, colL = W / 2 - 450, colR = W / 2 + 450, inCol = x => wide && x > colL - 30 && x < colR + 30;

    // sky: deep night gradient + dither noise (no banding) + moon
    sky = mk(W * dpr, H * dpr);
    let g = sky.getContext("2d"); g.scale(dpr, dpr);
    let gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, "#04071a"); gr.addColorStop(0.3, "#0a1234"); gr.addColorStop(0.58, "#16204e"); gr.addColorStop(0.8, "#26346a"); gr.addColorStop(1, "#3a4478");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    let hg = g.createRadialGradient(W * 0.3, H * 0.95, 0, W * 0.3, H * 0.95, W * 0.7); // faint warm village glow near the horizon
    hg.addColorStop(0, "rgba(255,150,90,0.16)"); hg.addColorStop(1, "rgba(255,150,90,0)"); g.fillStyle = hg; g.fillRect(0, 0, W, H);
    // moon halo layers
    for (const [rr, a] of [[10, 0.05], [5.5, 0.08], [3, 0.12]]) {
      const R = moon.r * rr, mg = g.createRadialGradient(moon.x, moon.y, moon.r * 0.9, moon.x, moon.y, R);
      mg.addColorStop(0, `rgba(190,208,255,${a * 1.6})`); mg.addColorStop(0.35, `rgba(150,175,240,${a * 0.5})`); mg.addColorStop(1, "rgba(120,150,230,0)");
      g.fillStyle = mg; g.fillRect(moon.x - R, moon.y - R, R * 2, R * 2);
    }
    // disc
    g.save(); g.beginPath(); g.arc(moon.x, moon.y, moon.r, 0, TAU); g.clip();
    const dg = g.createRadialGradient(moon.x - moon.r * 0.3, moon.y - moon.r * 0.3, 0, moon.x, moon.y, moon.r);
    dg.addColorStop(0, "#fbf8ee"); dg.addColorStop(0.7, "#e9e6dc"); dg.addColorStop(1, "#c9cdd8");
    g.fillStyle = dg; g.fillRect(moon.x - moon.r, moon.y - moon.r, moon.r * 2, moon.r * 2);
    for (const [a, b, r, al] of [[-0.3, -0.25, 0.34, 0.2], [0.22, -0.05, 0.28, 0.17], [-0.05, 0.38, 0.3, 0.15], [0.38, 0.32, 0.17, 0.14], [-0.45, 0.2, 0.15, 0.12], [0.1, -0.5, 0.14, 0.1]]) {
      const bx = moon.x + a * moon.r, by = moon.y + b * moon.r, br = r * moon.r, bg = g.createRadialGradient(bx, by, 0, bx, by, br);
      bg.addColorStop(0, `rgba(120,125,145,${al})`); bg.addColorStop(1, "rgba(120,125,145,0)"); g.fillStyle = bg; g.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    const lg = g.createRadialGradient(moon.x, moon.y, moon.r * 0.6, moon.x, moon.y, moon.r);
    lg.addColorStop(0, "rgba(90,100,140,0)"); lg.addColorStop(1, "rgba(90,100,140,0.28)"); g.fillStyle = lg; g.fillRect(moon.x - moon.r, moon.y - moon.r, moon.r * 2, moon.r * 2);
    g.restore();
    // dither: tiled noise
    const nz = mk(128, 128), ng = nz.getContext("2d"), id = ng.createImageData(128, 128);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 11; }
    ng.putImageData(id, 0, 0); g.fillStyle = g.createPattern(nz, "repeat"); g.fillRect(0, 0, W, H);

    // aurora: drawn small (soft by upscaling), vertical strand sprites tinted per colour
    const AW = Math.ceil(W / (phone ? 4 : 5)), AH = Math.ceil(H * 0.62 / 5);
    auroraC = mk(AW, AH); auroraG = auroraC.getContext("2d"); auroraC.k = 5;
    auroraSpr = [[70, 255, 170], [60, 210, 230], [170, 120, 255], [255, 120, 190]].map(([r, gg, b]) => {
      const t = mk(1, 64), tg = t.getContext("2d"), vg = tg.createLinearGradient(0, 0, 0, 64);
      vg.addColorStop(0, `rgba(${r},${gg},${b},0)`); vg.addColorStop(0.55, `rgba(${r},${gg},${b},0.35)`); vg.addColorStop(0.88, `rgba(${r},${gg},${b},1)`); vg.addColorStop(1, `rgba(${r},${gg},${b},0.15)`);
      tg.fillStyle = vg; tg.fillRect(0, 0, 1, 64); return t;
    });

    // stars (varied size; keep clear of the moon)
    const ns = Math.round(clamp(W * H / 9000, 50, 170) * (phone ? 0.7 : 1));
    stars = [];
    while (stars.length < ns) {
      const x = rnd(0, W), y = Math.pow(Math.random(), 1.4) * H * 0.62;
      if (Math.hypot(x - moon.x, y - moon.y) < moon.r * 2.4) continue;
      const big = Math.random() < 0.06, r = big ? rnd(2.4, 3.4) : Math.random() < 0.3 ? rnd(1.2, 1.8) : rnd(0.6, 1.1);
      stars.push({ x, y, r, p: rnd(0, TAU), s: rnd(0.25, 1.1), a: rnd(0.45, 1), warm: Math.random() < 0.18 });
    }

    // hill layers: far to near, atmospheric perspective (farther = bluer, lighter, softer)
    layers = []; smoke = [];
    const dirOf = x => (moon.x - x >= 0 ? 1 : -1);
    const defs = [
      { base: 0.62, amp: 0.10, top: "#3a4c86", bot: "#2a386e", tree: "#34457d", th: 16, td: 14, depth: 0.12, blur: 1.6, rim: 0.32, seed: 3, snow: 0, rimT: 0 },
      { base: 0.71, amp: 0.07, top: "#2c3a72", bot: "#1b2652", tree: "#222f60", th: 34, td: 30, depth: 0.3, blur: 0.9, rim: 0.42, seed: 11, cabins: 2, snow: 0.0, rimT: 0.08 },
      { base: 0.81, amp: 0.055, top: "#1f2a58", bot: "#121a3c", tree: "#141d42", th: 62, td: 56, depth: 0.6, blur: 0.4, rim: 0.5, seed: 23, cabins: 1, lit: 3, snow: 0.35, rimT: 0.14 },
      { base: 0.93, amp: 0.035, top: "#111832", bot: "#080c1c", tree: "#070b1a", th: 128, td: 150, depth: 1, blur: 0, rim: 0.28, seed: 41, lit: 2, snow: 0.5, rimT: 0.2, fg: true }
    ];
    defs.forEach((d, li) => {
      const lw = W + 2 * M, lh = H + MV, cv = mk(lw * ld, lh * ld), t = cv.getContext("2d");
      t.scale(ld, ld); t.translate(M, MV / 2);
      const off = d.seed * 100 + (li % 2 ? 37 : 0);
      const fn = x => H * d.base - fbm(x / (W * 0.22) + off, d.seed) * H * d.amp - (d.fg ? 0 : fbm(x / (W * 0.06) + off, d.seed + 5) * H * d.amp * 0.18);
      t.save(); if (d.blur) t.filter = `blur(${d.blur * ld}px)`;
      const fg = t.createLinearGradient(0, H * (d.base - d.amp * 1.2), 0, H + MV / 2); fg.addColorStop(0, d.top); fg.addColorStop(0.5, d.bot); fg.addColorStop(1, d.bot);
      t.fillStyle = fg; t.beginPath(); t.moveTo(-M, H + MV);
      for (let x = -M; x <= W + M + 3; x += 3) t.lineTo(x, fn(x));
      t.lineTo(W + M, H + MV); t.closePath(); t.fill();
      // moonlight on the snow: soft bloom near the moon, rim along the ridge
      t.globalCompositeOperation = "source-atop";
      const mgl = t.createRadialGradient(moon.x, fn(moon.x), 0, moon.x, fn(moon.x), W * 0.55);
      mgl.addColorStop(0, `rgba(190,210,255,${0.16 * (0.4 + d.depth * 0.6)})`); mgl.addColorStop(1, "rgba(190,210,255,0)");
      t.save(); t.translate(0, fn(moon.x)); t.scale(1, 0.35); t.translate(0, -fn(moon.x)); t.fillStyle = mgl; t.fillRect(-M, -H, W + 2 * M, H * 3); t.restore();
      const rg = t.createLinearGradient(-M, 0, W + M, 0);
      const ma = x => clamp(0.35 + 0.65 * Math.exp(-Math.pow((x - moon.x) / (W * 0.45), 2)), 0, 1);
      for (let i = 0; i <= 10; i++) { const x = -M + ((W + 2 * M) * i) / 10; rg.addColorStop(i / 10, `rgba(205,222,255,${d.rim * ma(x)})`); }
      t.strokeStyle = rg; t.lineWidth = 1 + li * 0.5; t.beginPath();
      for (let x = -M; x <= W + M + 3; x += 3) x === -M ? t.moveTo(x, fn(x) + 0.5) : t.lineTo(x, fn(x) + 0.5);
      t.stroke();
      t.globalCompositeOperation = "source-over"; t.restore();

      const L = { cv, depth: d.depth, tl: [], win: [], ch: [], fn };
      // trees
      const cabX = [];
      if (d.cabins) for (let i = 0; i < d.cabins; i++) { if (wide) { const e = colL - 60, left = (i + li) % 2 === 0; cabX.push(left ? rnd(30, Math.max(40, e - 50)) : rnd(colR + 60, W - 80)); } else cabX.push(W * (phone ? 0.12 + 0.45 * i + rnd(0, 0.15) : (0.1 + (0.8 / d.cabins) * i + rnd(0, 0.5 / d.cabins)))); }
      const lit = []; let x = -M + rnd(0, d.td * S);
      t.save(); if (d.blur) t.filter = `blur(${d.blur * 0.7 * ld}px)`;
      while (x < W + M) {
        const dens = 0.35 + 0.65 * vn(x / (W * 0.12), d.seed + 9);
        if (Math.random() < dens || d.fg && Math.random() < 0.25) {
          const sc = d.fg ? rnd(0.5, 1.3) : rnd(0.65, 1.25), h = d.th * S * sc * (d.fg ? (0.55 + 0.9 * Math.abs(x / W - 0.5) * 1.6) : 1);
          const near = cabX.some(c => Math.abs(c - x) < 34 * S);
          if (!near) {
            const col = d.tree, y = fn(x) + 3 * S;
            const tiers = pine(t, x, y, h, col, null, { dir: dirOf(x), rim: d.rimT, rc: "150,175,235,", snow: d.snow });
            if (d.lit && !inCol(x) && h > 40 * S && lit.length < d.lit && Math.random() < 0.5) lit.push({ x, y, h, tiers });
          }
        }
        x += (d.td * S) * rnd(0.35, 1.3);
      }
      t.restore();
      // cabins
      cabX.forEach(cx => {
        const cwid = rnd(30, 40) * S * (li === 1 ? 0.75 : 1), chh = cwid * 0.55, cy = fn(cx + cwid / 2) + 2;
        const c = cabin(t, cx, cy, cwid, chh, { wall: li === 1 ? "#241c2e" : "#1c1424", roof: li === 1 ? "#33283e" : "#2a1f33" });
        L.ch.push({ x: c.chim[0], y: c.chim[1], s: cwid / 34 });
        c.wins.forEach(w => L.win.push({ ...w, p: rnd(0, TAU), s: rnd(0.5, 1.2) }));
        pine(t, cx - rnd(12, 22) * S, fn(cx) + 3 * S, rnd(26, 40) * S, d.tree, null, { dir: dirOf(cx), rim: d.rimT, rc: "150,175,235,", snow: d.snow });
      });
      // Christmas-light trees: bokeh bulbs along zigzag garlands
      const cols = ["r", "y", "b", "g", "p"];
      lit.forEach(tr => {
        const n = Math.round(10 + tr.h / 9);
        for (let k = 0; k < n; k++) {
          const f = (k + 0.5) / n, yy = tr.y - tr.h * 0.9 + tr.h * (0.12 + f * 0.78), half = tr.h * 0.26 * (0.15 + f * 0.8) * 0.85;
          const side = Math.sin(f * 19) ;
          L.tl.push({ x: tr.x + side * half, y: yy, c: bokeh[cols[(Math.random() * 5) | 0]], p: rnd(0, TAU), s: rnd(0.35, 1.5), r: (d.fg ? 7 : 4.5) * S * rnd(0.8, 1.2) });
        }
      });
      layers.push(L);
    });

    // snow in three depth layers: far tiny, mid, near large + soft
    const edgeX = () => { if (W < 1000) return rnd(0, W); const e = (W - 900) / 2; return Math.random() < 0.5 ? rnd(0, e) : rnd(W - e, W); };
    const ar = clamp(W * H / 1e6, 0.3, 2.2), pf = phone ? 0.5 : 1;
    const cnt = [Math.round(80 * ar * pf), Math.round(45 * ar * pf), Math.round(5 * ar * pf) + 2];
    snow = cnt.map((c, z) => Array.from({ length: c }, () => ({ x: z === 2 ? edgeX() : rnd(0, W), y: rnd(0, H), v: [9, 18, 34][z] * rnd(0.8, 1.25), sz: [1.3, 2, 0.5][z] * rnd(0.75, 1.3), a: [0.5, 0.7, 0.32][z] * rnd(0.7, 1), ph: rnd(0, TAU), sw: rnd(0.3, 0.9) })));
  }

  // ---------- drawing ----------
  function drawAurora() {
    const g = auroraG, AW = auroraC.width, AH = auroraC.height;
    g.clearRect(0, 0, AW, AH); g.globalCompositeOperation = "lighter";
    for (let c = 0; c < 3; c++) {
      const baseY = AH * (0.5 + c * 0.1);
      for (let i = 0; i < AW; i++) {
        const u = i / AW;
        const y = baseY + Math.sin(u * 3.2 + T * 0.07 + c * 2.1) * AH * 0.1 + Math.sin(u * 7.4 - T * 0.11 + c) * AH * 0.04;
        const hgt = AH * (0.42 + 0.14 * Math.sin(u * 4.6 + T * 0.09 + c * 1.3) + 0.08 * Math.sin(u * 11 - T * 0.15 + c)) * (c === 2 ? 0.75 : 1);
        const env = Math.pow(clamp(0.5 + 0.5 * Math.sin(u * 2.4 + T * 0.05 + c * 2.7), 0, 1), 1.3);
        const ray = 0.78 + 0.22 * Math.sin(u * 42 + c * 3 + T * 0.3) * Math.sin(u * 17 - T * 0.2);
        const a = env * ray * (c === 2 ? 0.28 : 0.4);
        const sh = 0.5 + 0.5 * Math.sin(u * 2.2 + T * 0.04 + c * 1.9);
        g.globalAlpha = a * (1 - sh); g.drawImage(auroraSpr[c === 1 ? 1 : 0], i, y - hgt, 1, hgt);
        g.globalAlpha = a * sh; g.drawImage(auroraSpr[c === 2 ? 3 : 2], i, y - hgt, 1, hgt);
      }
    }
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.5; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(auroraC, 0, 0, W, AH * auroraC.k); ctx.restore();
  }

  function drawSnow(z, dt, sp, wind) {
    const arr = snow[z], n = Math.min(arr.length, Math.round(arr.length * cur.snow)), spr = flakeSpr[z];
    for (let i = 0; i < n; i++) {
      const f = arr[i];
      f.y += f.v * dt * sp * S; f.x += (wind * (0.4 + z * 0.35) + Math.sin(T * f.sw + f.ph) * (6 + z * 6)) * dt * sp;
      if (f.y > H + 20) { f.y = -20; f.x = z === 2 && W >= 1000 ? (Math.random() < 0.5 ? rnd(0, (W - 900) / 2) : rnd(W - (W - 900) / 2, W)) : rnd(0, W); }
      if (f.x > W + 20) f.x = -20; else if (f.x < -20) f.x = W + 20;
      const s = spr.r * 2 * f.sz * (z === 2 ? S : 1) * (z === 0 ? 1 : 1);
      ctx.globalAlpha = f.a; ctx.drawImage(spr, f.x - s / 2, f.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  function frame(dt) {
    const m = cur, sp = m.speed;
    T += dt * sp;
    // eased parallax
    if (M) { const k = 1 - Math.exp(-dt * 3); px = lerp(px, tpx, k); py = lerp(py, tpy, k); sy = lerp(sy, tsy, k); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(sky, 0, 0, W, H);

    // twinkling stars
    for (const s of stars) {
      const tw = 0.55 + 0.3 * Math.sin(T * s.s + s.p) + 0.15 * Math.sin(T * s.s * 2.7 + s.p * 2);
      const z = s.r * (s.r > 2 ? 4 : 3.2) * (0.85 + 0.15 * tw);
      ctx.globalAlpha = clamp(tw * s.a, 0, 1);
      ctx.drawImage(starSpr, s.x - z / 2, s.y - z / 2, z, z);
    }
    ctx.globalAlpha = 1;
    if (!reduce || T === 3) drawAurora();

    // very faint distant sleigh
    if (!reduce) { nextSleigh -= dt; if (sleighT < 0 && nextSleigh <= 0) { sleighT = 0; nextSleigh = rnd(40, 70); } }
    if (sleighT >= 0) {
      sleighT += dt * (0.6 + 0.4 * sp);
      const u = sleighT / 30;
      if (u > 1) sleighT = -1;
      else if (window.SleighArt) {
        const sc = clamp(S * 0.55, 0.4, 0.8), sw = window.SleighArt.width * sc, e = sm(u), p = 0.3 * u + 0.7 * e;
        const x = W + sw * 0.2 - (W + sw * 1.4) * p, y = moon.y + moon.r * 0.9 + Math.sin(u * TAU) * 5 - (u - 0.5) * H * 0.05, fade = Math.min(1, u / 0.15, (1 - u) / 0.15);
        ctx.save(); ctx.globalAlpha = 0.4 * fade * fade; window.SleighArt.draw(ctx, x, y, sc, sleighT * 2); ctx.restore();
      }
    }

    const wind = Math.sin(T * 0.21) * 8 + Math.sin(T * 0.53 + 1) * 5 + Math.pow(Math.max(0, Math.sin(T * 0.11 + 2)), 3) * 26 + 6;
    // hills (far to near), each followed by its own live bits; snow depth groups interleave
    for (let i = 0; i < layers.length; i++) {
      const L = layers[i];
      const ox = M ? -px * M * L.depth : 0, oy = M ? -(sy - 0.5) * MV * L.depth - py * MV * 0.3 * L.depth : 0;
      ctx.setTransform(dpr, 0, 0, dpr, dpr * ox, dpr * oy);
      ctx.drawImage(L.cv, -M, -MV / 2, W + 2 * M, H + MV);
      ctx.globalCompositeOperation = "lighter";
      for (const w of L.win) { // window glow: slow, uneven flicker
        const f = 0.7 + 0.18 * Math.sin(T * w.s + w.p) + 0.12 * Math.sin(T * w.s * 2.9 + w.p * 2);
        const s = w.w * 5; ctx.globalAlpha = 0.32 * f; ctx.drawImage(glowSpr, w.x - s / 2, w.y - s / 2, s, s);
      }
      for (const l of L.tl) { // bokeh bulbs, each on its own slow phase
        const tw = clamp(0.5 + 0.3 * Math.sin(T * l.s + l.p) + 0.2 * Math.sin(T * l.s * 0.37 + l.p * 3), 0, 1);
        const s = l.r * 2 * (0.9 + 0.2 * tw); ctx.globalAlpha = 0.25 + 0.75 * tw * tw; ctx.drawImage(l.c, l.x - s / 2, l.y - s / 2, s, s);
      }
      ctx.globalCompositeOperation = "source-over";
      // chimney smoke
      if (L.ch.length) {
        if (!reduce && smoke.length < 26) for (const c of L.ch) if (Math.random() < dt * sp * 0.9) smoke.push({ L, x: c.x, y: c.y, t: 0, life: rnd(6, 9), r: rnd(3, 4.5) * c.s * S, ph: rnd(0, TAU) });
        for (let j = smoke.length - 1; j >= 0; j--) {
          const s = smoke[j]; if (s.L !== L) continue;
          s.t += dt * sp; const u = s.t / s.life;
          if (u >= 1) { smoke.splice(j, 1); continue; }
          s.y -= (12 + 6 * (1 - u)) * dt * sp * S; s.x += (wind * 0.35 * u + Math.sin(s.t * 0.9 + s.ph) * 4 * u) * dt * sp * S;
          const r = s.r * (1 + u * 4.5), a = Math.sin(Math.min(1, u * 6) * Math.PI / 2) * (1 - u) * (1 - u) * 0.55;
          ctx.globalAlpha = a; ctx.drawImage(puffSpr, s.x - r, s.y - r, r * 2, r * 2);
        }
        ctx.globalAlpha = 1;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (i === 1) drawSnow(0, dt, sp, wind);
      if (i === 2) drawSnow(1, dt, sp, wind);
    }

    if (m.dim > 0.001) { ctx.fillStyle = `rgba(4,6,20,${m.dim})`; ctx.fillRect(0, 0, W, H); }
    if (m.warm > 0.001) { ctx.globalAlpha = m.warm * 0.08; ctx.fillStyle = "#ff9a4a"; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    drawSnow(2, dt, sp, wind);
  }

  // ---------- loop / API ----------
  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    if (mt < 1) {
      mt = Math.min(1, mt + dt / 1.2);
      const e = sm(mt);
      for (const k in cur) cur[k] = from[k] + (to[k] - from[k]) * e;
    }
    frame(dt);
  }

  function ensure() {
    if (canvas) return;
    const st = document.createElement("style"); st.id = "bg-css";
    st.textContent = "#bg-scene{position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block}";
    document.head.appendChild(st);
    canvas = document.createElement("canvas"); canvas.id = "bg-scene"; canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext("2d");
    let rt = 0, lw = innerWidth, lh = innerHeight;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (innerWidth === lw && Math.abs(innerHeight - lh) < 120 && innerWidth < 600) return; lw = innerWidth; lh = innerHeight; build(); if (reduce || !running) frame(0); }, 150);
    });
    if (!coarse && !reduce) {
      addEventListener("pointermove", e => { if (e.pointerType === "touch") return; tpx = e.clientX / innerWidth - 0.5; tpy = e.clientY / innerHeight - 0.5; }, { passive: true });
      const sc = () => { const d = document.documentElement, mx = d.scrollHeight - innerHeight; tsy = mx > 4 ? clamp(window.scrollY / mx, 0, 1) : 0.5; };
      addEventListener("scroll", sc, { passive: true }); sc(); sy = tsy;
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf), raf = 0; }
      else if (running && !reduce) { last = performance.now(); raf = requestAnimationFrame(tick); }
    });
    build();
  }

  function start() {
    ensure();
    if (reduce) { T = 3; frame(0); return; }
    if (running) return;
    running = true; last = performance.now();
    if (!document.hidden) raf = requestAnimationFrame(tick);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf), raf = 0; }
  function setMood(name) {
    const t = MOODS[name]; if (!t) return;
    from = { ...cur }; to = { ...t }; mt = 0;
    if (reduce || !running) { cur = { ...t }; mt = 1; if (canvas) frame(0); }
  }

  window.BgScene = { start, stop, setMood };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
