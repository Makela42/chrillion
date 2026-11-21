/*
  Mogillion immersive scene: a night-time fancam / red-carpet press wall drawn in one full-viewport canvas.
  Hooks (called by game.js): Scene.runStart(), prompt(i,total,text), answer({tier,display,input,pts,note}),
  miss(input), timeout(), runEnd(score,maxScore).
  Pixel art is built procedurally into a low-res canvas (nearest-neighbour upscaled), then lit with additive
  glow (beams, flashes, bloom) on the full-res canvas. All original characters.
*/
(() => {
  "use strict";

  const TIER = {
    miracle: { col: "#f5c542", label: "GIGACHAD" },
    t75: { col: "#ff4d8d", label: "CHAD" },
    t50: { col: "#4de2f7", label: "CHADLITE" },
    t25: { col: "#5ee6a8", label: "HIGH TIER NORMIE" },
    trap: { col: "#ff9a4d", label: "COPIUM" },
    t10: { col: "#8b9299", label: "GREY" },
    miss: { col: "#5a626b", label: "INVALID" },
    timeout: { col: "#5a626b", label: "NOTHING LANDED" },
  };

  const reduceMQ = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  const reduce = () => reduceMQ.matches;

  // ------------------------------------------------------------------ utils
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const approach = (v, t, r, dt) => v + (t - v) * (1 - Math.exp(-r * dt));
  const seeded = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
  function cvs(w, h) { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function hex(h) { h = h.replace("#", ""); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgba(h, a) { const c = hex(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
  function mix(h1, h2, t) { const a = hex(h1), b = hex(h2); return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; }

  // Snap every pixel to the nearest palette colour and hard-threshold alpha: this is what makes procedural shapes read as pixel art.
  function snap(c, pal) {
    const x = c.getContext("2d"), d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    const rgb = pal.map(hex);
    for (let i = 0; i < p.length; i += 4) {
      if (p[i + 3] < 110) { p[i + 3] = 0; continue; }
      p[i + 3] = 255;
      let best = 0, bd = 1e9;
      for (let j = 0; j < rgb.length; j++) {
        const dr = p[i] - rgb[j][0], dg = p[i + 1] - rgb[j][1], db = p[i + 2] - rgb[j][2];
        const dd = dr * dr + dg * dg + db * db;
        if (dd < bd) { bd = dd; best = j; }
      }
      p[i] = rgb[best][0]; p[i + 1] = rgb[best][1]; p[i + 2] = rgb[best][2];
    }
    x.putImageData(d, 0, 0);
    return c;
  }
  function hard(c) {
    const x = c.getContext("2d"), d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 3; i < p.length; i += 4) p[i] = p[i] > 110 ? 255 : 0;
    x.putImageData(d, 0, 0);
    return c;
  }
  const poly = (x, pts, col) => { x.fillStyle = col; x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); x.fill(); };
  const R = (x, a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  function line(x, x0, y0, x1, y1, w, col) {
    x.fillStyle = col;
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) x.fillRect(Math.round(lerp(x0, x1, i / n)), Math.round(lerp(y0, y1, i / n)), w, w);
  }
  // Edge pixels of a sprite on one side (dx,dy = where the missing neighbour is), tinted. thick 1 or 2.
  function edgeOf(src, dx, dy, col, thick) {
    const o = cvs(src.width, src.height), x = o.getContext("2d");
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = "destination-out";
    for (let i = 1; i <= (thick || 1); i++) x.drawImage(src, -dx * i, -dy * i);
    x.globalCompositeOperation = "source-in";
    x.fillStyle = col; x.fillRect(0, 0, o.width, o.height);
    return o;
  }
  const tintCache = new Map();
  let idc = 1;
  function tinted(src, col) {
    if (!src._id) src._id = idc++;
    const k = src._id + col;
    let o = tintCache.get(k);
    if (!o) {
      o = cvs(src.width, src.height);
      const x = o.getContext("2d");
      x.drawImage(src, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = col; x.fillRect(0, 0, o.width, o.height);
      tintCache.set(k, o);
    }
    return o;
  }

  // ------------------------------------------------------------------ characters
  const MODEL = {
    skin: "#c4916b", skinHi: "#dfae86", skinLo: "#946248", skinDk: "#6c4533", hair: "#17110f", hairHi: "#54433a",
    suit: "#1d2029", suitHi: "#3a4154", suitLo: "#0e1015", sleeve: "#1d2029", lapel: "#2b3040", lapel2: "#161921", shirt: "#08090c", gold: "#f0c75e",
    pants: "#15171e", pantsHi: "#2d323f", pantsLo: "#0b0c10", shoes: "#0a0a0d", shoeHi: "#6a7086", belt: "#0a0a0c", lip: "#85473f", eyeW: "#ece7e1", iris: "#140e0c", brow: "#15100e",
  };
  const RIVAL = {
    skin: "#ebbb98", skinHi: "#f8d8bd", skinLo: "#bd8462", skinDk: "#8f5d44", hair: "#e6c866", hairHi: "#fff2b4", brow: "#b79a45",
    suit: "#7c1b2e", suitHi: "#c23a52", suitLo: "#470d19", sleeve: "#e8dfcb", lapel: "#a02840", lapel2: "#5e1222", shirt: "#f4f1ea", gold: "#ffd95f",
    pants: "#2e3b52", pantsHi: "#4b5f80", pantsLo: "#1b2434", shoes: "#f0f0f0", shoeHi: "#ffffff", belt: "#1a1a1a", lip: "#b05a52", eyeW: "#ffffff", iris: "#2b2b3a",
  };
  const palOf = (P) => Object.values(P);

  function buildBody(P) {
    const c = cvs(48, 86), x = c.getContext("2d");
    poly(x, [[14, 58], [24, 58], [23, 82], [14, 82]], P.pants);
    poly(x, [[24, 58], [34, 58], [34, 82], [25, 82]], P.pants);
    R(x, 14, 60, 1, 22, P.pantsHi); R(x, 25, 60, 1, 22, P.pantsHi); R(x, 18, 62, 1, 20, P.pantsHi); R(x, 29, 62, 1, 20, P.pantsLo); R(x, 33, 60, 1, 22, P.pantsLo);
    poly(x, [[12, 82], [23, 82], [23, 85], [10, 85]], P.shoes);
    poly(x, [[25, 82], [35, 82], [38, 85], [25, 85]], P.shoes);
    R(x, 12, 83, 6, 1, P.shoeHi); R(x, 27, 83, 6, 1, P.shoeHi);
    poly(x, [[12, 35], [36, 35], [38, 43], [35, 61], [13, 61], [10, 43]], P.suit);
    poly(x, [[4, 40], [12, 35], [13, 44], [12, 58], [6, 58], [4, 46]], P.sleeve);
    poly(x, [[44, 40], [36, 35], [35, 44], [36, 58], [42, 58], [44, 46]], P.sleeve);
    R(x, 6, 58, 6, 5, P.skin); R(x, 36, 58, 6, 5, P.skin); R(x, 6, 62, 6, 1, P.skinLo); R(x, 36, 58, 2, 5, P.skinLo); R(x, 7, 59, 1, 3, P.skinHi);
    poly(x, [[20, 29], [28, 29], [29, 36], [19, 36]], P.skin);
    R(x, 20, 29, 8, 3, P.skinLo); R(x, 21, 32, 6, 1, P.skinLo); R(x, 26, 33, 3, 3, P.skinLo);
    poly(x, [[18, 35], [30, 35], [24, 50]], P.shirt);
    poly(x, [[15, 35], [19, 35], [25, 54], [21, 57], [14, 44]], P.lapel);
    poly(x, [[33, 35], [29, 35], [23, 54], [27, 57], [34, 44]], P.lapel2);
    [[20, 35], [21, 38], [22, 41], [23, 43], [24, 44], [25, 43], [26, 41], [27, 38], [28, 35]].forEach((p) => R(x, p[0], p[1], 1, 1, P.gold));
    R(x, 23, 45, 2, 3, P.gold);
    R(x, 5, 41, 1, 12, P.suitHi); R(x, 13, 36, 7, 1, P.suitHi); R(x, 6, 38, 5, 1, P.suitHi); R(x, 12, 45, 1, 12, P.suitHi);
    R(x, 42, 43, 2, 15, P.suitLo); R(x, 35, 46, 1, 13, P.suitLo); R(x, 33, 36, 3, 1, P.suitLo);
    R(x, 13, 59, 22, 2, P.belt); R(x, 22, 59, 4, 2, P.gold);
    R(x, 11, 44, 1, 1, P.suitHi);
    return snap(c, palOf(P));
  }

  // yaw -1/0/1; mood: cool | smug | shock | grin ; round: comically rounder jaw
  function buildHead(P, yaw, mood, round) {
    const c = cvs(32, 38), x = c.getContext("2d");
    const cx = 16 + yaw * 1.6;
    const face = cvs(32, 38), f = face.getContext("2d");
    const fp = round
      ? [[cx - 10, 11], [cx + 10, 11], [cx + 11, 20], [cx + 8, 28], [cx + 3, 33], [cx - 3, 33], [cx - 8, 28], [cx - 11, 20]]
      : [[cx - 9, 11], [cx + 9, 11], [cx + 10, 18], [cx + 9, 24], [cx + 5, 31], [cx - 5, 31], [cx - 9, 24], [cx - 10, 18]];
    poly(f, [[cx - 11, 16], [cx - 9, 15], [cx - 9, 21], [cx - 11, 20]], P.skin);
    poly(f, [[cx + 11, 16], [cx + 9, 15], [cx + 9, 21], [cx + 11, 20]], P.skinLo);
    poly(f, fp, P.skin);
    f.globalCompositeOperation = "source-atop";
    poly(f, [[cx + 3, 10], [cx + 13, 10], [cx + 13, 35], [cx + 4, 35], [cx + 6, 25], [cx + 4, 18]], P.skinLo);
    poly(f, [[cx - 10, 20], [cx - 5, 23], [cx - 3, 28], [cx - 10, 26]], P.skinLo);
    poly(f, [[cx + 10, 21], [cx + 6, 24], [cx + 3, 29], [cx + 10, 27]], P.skinDk);
    R(f, cx - 8, 16, 4, 2, P.skinHi); R(f, cx - 1, 13, 1, 6, P.skinHi); R(f, cx - 6, 11, 6, 2, P.skinHi); R(f, cx - 3, 30, 5, 1, P.skinHi);
    R(f, cx - 9, 19, 1, 4, P.skinHi);
    f.globalCompositeOperation = "source-over";
    // eyes + brows
    const eye = (ex, side) => {
      if (mood === "shock") {
        R(f, ex - 1, 16, 6, 5, P.eyeW); R(f, ex + 1, 17, 2, 3, P.iris); R(f, ex - 1, 14, 6, 1, P.brow);
      } else {
        R(f, ex, 17, 5, 1, P.eyeW); R(f, ex + 1 + (yaw > 0 ? 1 : 0), 17, 2, 2, P.iris); R(f, ex - 1, 16, 7, 1, P.skinDk);
        R(f, ex - 1, 14 + (side ? 1 : 0), 7, 1, P.brow); R(f, ex + (side ? -1 : 1), 15, 6, 1, P.brow);
      }
    };
    eye(Math.round(cx - 7), 0); eye(Math.round(cx + 3), 1);
    R(f, Math.round(cx + 1), 18, 1, 5, P.skinLo); R(f, Math.round(cx - 2), 23, 5, 1, P.skinDk); R(f, Math.round(cx - 2), 22, 1, 1, P.skinHi);
    if (mood === "shock") { R(f, Math.round(cx - 3), 27, 7, 4, "#2a0e10"); R(f, Math.round(cx - 2), 27, 5, 1, P.eyeW); }
    else if (mood === "grin") { R(f, Math.round(cx - 4), 26, 9, 3, P.eyeW); R(f, Math.round(cx - 4), 26, 9, 1, P.lip); R(f, Math.round(cx - 4), 29, 9, 1, P.lip); }
    else {
      R(f, Math.round(cx - 3), 27, 7, 1, P.lip); R(f, Math.round(cx - 2), 28, 5, 1, P.skinLo);
      if (mood === "smug") { R(f, Math.round(cx + 4), 26, 1, 1, P.lip); R(f, Math.round(cx + 5), 25, 1, 1, P.skinDk); }
    }
    x.drawImage(face, 0, 0);
    // hair
    const hp = [[cx - 11, 20], [cx - 12, 10], [cx - 8, 4], [cx - 3, 2], [cx + 5, 2], [cx + 10, 5], [cx + 12, 11], [cx + 11, 20], [cx + 9, 14], [cx + 4, 11], [cx - 2, 10], [cx - 7, 11], [cx - 9, 15]];
    poly(x, hp, P.hair);
    if (round) { // messy blonde spikes
      poly(x, [[cx - 8, 6], [cx - 11, 0], [cx - 4, 4]], P.hair); poly(x, [[cx - 2, 4], [cx, -1], [cx + 3, 4]], P.hair); poly(x, [[cx + 4, 5], [cx + 9, 0], [cx + 10, 7]], P.hair);
      R(x, cx - 6, 6, 3, 1, P.hairHi); R(x, cx - 1, 3, 2, 1, P.hairHi); R(x, cx + 6, 5, 3, 1, P.hairHi);
    } else { // swept-up quiff
      poly(x, [[cx - 8, 7], [cx - 4, 2], [cx + 3, 0], [cx + 10, 3], [cx + 10, 8]], P.hair);
      R(x, cx - 4, 2, 6, 1, P.hairHi); R(x, cx - 1, 4, 7, 1, P.hairHi); R(x, cx - 7, 6, 3, 1, P.hairHi); R(x, cx + 3, 7, 5, 1, P.hairHi); R(x, cx - 9, 9, 2, 1, P.hairHi);
    }
    return snap(c, palOf(P));
  }
  function buildShades() {
    const c = cvs(24, 8), x = c.getContext("2d");
    R(x, 0, 1, 24, 1, "#0b0b0e"); R(x, 1, 2, 10, 4, "#0b0b0e"); R(x, 13, 2, 10, 4, "#0b0b0e"); R(x, 11, 2, 2, 1, "#0b0b0e"); R(x, 2, 6, 8, 1, "#0b0b0e"); R(x, 14, 6, 8, 1, "#0b0b0e");
    R(x, 2, 2, 3, 1, "#9ad7ff"); R(x, 3, 3, 1, 1, "#9ad7ff"); R(x, 14, 2, 3, 1, "#9ad7ff"); R(x, 15, 3, 1, 1, "#9ad7ff"); R(x, 8, 4, 2, 1, "#2a2d3a"); R(x, 20, 4, 2, 1, "#2a2d3a");
    return snap(c, ["#0b0b0e", "#9ad7ff", "#2a2d3a"]);
  }

  // ------------------------------------------------------------------ scene state
  let root = null, cv = null, ctx = null, pc = null, pctx = null, bc = null, bctx = null, ft = null, ftx = null, rf = null, rfx = null;
  let vw = 0, vh = 0, dpr = 1, k = 4, W = 100, H = 200, ox = 0;
  let back = null, ropeC = null, crowdRows = [], dust = [], bokeh = [], sparks = [], flashes = [], flashQ = [], sched = [];
  let fig = null, rfig = null, shadesSpr = null, glowSpr = {};
  let plaque = null, slamEl = null, running = false, raf = 0, last = 0, T = 0, lastDraw = 0, inRun = false, ready = false;
  const cap = { sparks: 140, flashes: 40 };

  const S = {
    light: 1, lightT: 1, camLow: 0, camLowT: 0, rimCol: "#4de2f7", rimAmt: 0, rimAmtT: 0, flashLvl: 0,
    bw: 0, strobeUntil: 0, strobeCol: "#fff", zoom: 1, zoomT: 1, zfx: 0.5, zfy: 0.4, shakeAmp: 0, shakeT0: 0, shakeDur: 0, buzzUntil: 0,
    ts: 1, tsT: 1, bars: 0, barsT: 0, wash: null, washA: 0, washT: 0, sweepT0: -9, sweepCol: "#ff4d8d", beamCol: ["#9fdcff", "#fff1d6", "#ffc4a0"], beamColT: null,
    nodT0: -9, nodAmp: 1, yaw: 0, yawUntil: 0, mood: "cool", modelX: 0, modelXT: 0, tone: null, vig: null,
    rival: { vis: false, x: 0, y: 0, sc: 1, xT: 0, yT: 0, scT: 1, mood: "cool", shades: true, fall: null },
    take: "", idleFlash: 2,
  };

  // ------------------------------------------------------------------ build / resize
  function buildSprites() {
    const mb = buildBody(MODEL), rb = buildBody(RIVAL);
    fig = { body: mb, heads: {} };
    rfig = { body: rb, heads: {} };
    [-1, 0, 1].forEach((y) => ["cool", "smug", "shock"].forEach((m) => { fig.heads[y + m] = buildHead(MODEL, y, m, false); }));
    [-1, 0, 1].forEach((y) => ["cool", "shock", "grin"].forEach((m) => { rfig.heads[y + m] = buildHead(RIVAL, y, m, true); }));
    shadesSpr = buildShades();
    ft = cvs(60, 100); ftx = ft.getContext("2d");
    rf = cvs(60, 100); rfx = rf.getContext("2d");
  }

  const emblem = ["...#...", "..#.#..", ".#.#.#.", "#.###.#", ".#.#.#.", "..#.#..", "...#..."];

  function buildBack() {
    back = cvs(W, H);
    const x = back.getContext("2d");
    const fy0 = Math.round(H * 0.61);
    // wall
    for (let y = 0; y < fy0; y++) { x.fillStyle = mix("#06080e", "#171c30", Math.pow(y / fy0, 1.3)); x.fillRect(0, y, W, 1); }
    // abstract repeating logo pattern
    const col1 = "#222a47", col2 = "#2f3a62";
    for (let row = 0, y = 10; y < fy0 - 4; row++, y += 13) {
      for (let px = -8 + (row % 2) * 9; px < W; px += 18) {
        const a = (y / fy0) * 0.9 + 0.1;
        x.globalAlpha = 0.45 + a * 0.55;
        emblem.forEach((r, ry) => { for (let rx = 0; rx < 7; rx++) if (r[rx] === "#") R(x, px + rx, y + ry, 1, 1, rx + ry < 5 ? col2 : col1); });
      }
    }
    x.globalAlpha = 1;
    // panel seams
    for (let sx = 16; sx < W; sx += 56) { R(x, sx, 8, 1, fy0 - 8, "rgba(0,0,0,0.5)"); R(x, sx + 1, 8, 1, fy0 - 8, "rgba(80,100,170,0.12)"); }
    // truss
    R(x, 0, 0, W, 6, "#07080c"); R(x, 0, 6, W, 1, "#1c2133");
    for (let tx = 2; tx < W; tx += 6) R(x, tx, 2, 1, 1, "#2a3046");
    // baseboard
    R(x, 0, fy0 - 3, W, 3, "#0b0d14"); R(x, 0, fy0 - 1, W, 1, "#363d5a");
    // floor
    for (let y = fy0; y < H; y++) { x.fillStyle = mix("#0b0c13", "#030305", (y - fy0) / (H - fy0)); x.fillRect(0, y, W, 1); }
    x.globalAlpha = 0.5;
    const vpx = W / 2, vpy = fy0 - 60;
    for (let i = -6; i <= 14; i++) { const bx = (i / 8) * W; line(x, vpx + (bx - vpx) * 0.0, vpy, bx * 1.0, H, 1, "#11141f"); }
    for (let n = 1; n < 9; n++) { const y = Math.round(fy0 + Math.pow(n / 8, 1.8) * (H - fy0)); R(x, 0, y, W, 1, "#10131c"); }
    x.globalAlpha = 1;
    // red carpet (perspective trapezoid with weave + gold piping)
    for (let y = fy0; y < H; y++) {
      const p = (y - fy0) / (H - fy0), hw = lerp(W * 0.2, W * 0.72, Math.pow(p, 0.9));
      const x0 = Math.round(W / 2 - hw), x1 = Math.round(W / 2 + hw);
      x.fillStyle = mix("#3d0914", "#781528", Math.pow(p, 0.7)); x.fillRect(x0, y, x1 - x0, 1);
      for (let xx = x0; xx < x1; xx++) if (((xx + y * 2) & 3) === 0) R(x, xx, y, 1, 1, "rgba(0,0,0,0.22)"); else if (((xx + y) & 7) === 3) R(x, xx, y, 1, 1, "rgba(255,120,140,0.07)");
      R(x, x0, y, 1, 1, "#9b7a2a"); R(x, x1 - 1, y, 1, 1, "#9b7a2a");
    }
    // rope + stanchions
    ropeC = cvs(W, H);
    const r = ropeC.getContext("2d");
    const D = Math.min(60, W * 0.55), pb = Math.round(H * 0.808), pt = Math.round(H * 0.712);
    const xs = []; for (let n = -5; n <= 4; n++) xs.push(Math.round(W / 2 + (n + 0.5) * D));
    for (let i = 0; i < xs.length - 1; i++) {
      const a = xs[i], b = xs[i + 1];
      if (b < -4 || a > W + 4) continue;
      for (let xx = a; xx <= b; xx++) {
        const u = (xx - a) / (b - a), sag = 9 * (1 - Math.pow(2 * u - 1, 2)), yy = Math.round(pt + 3 + sag);
        R(r, xx, yy - 1, 1, 1, "#d23a55"); R(r, xx, yy, 1, 1, "#9a1830"); R(r, xx, yy + 1, 1, 1, "#9a1830"); R(r, xx, yy + 2, 1, 1, "#4a0a16");
      }
    }
    xs.forEach((px) => {
      if (px < -6 || px > W + 6) return;
      R(r, px - 5, pb, 11, 1, "#4a4f5e"); R(r, px - 4, pb - 1, 9, 1, "#8b91a3"); R(r, px - 3, pb - 2, 7, 1, "#c4c9d6");
      R(r, px - 1, pt + 3, 3, pb - pt - 4, "#7d8497"); R(r, px - 1, pt + 3, 1, pb - pt - 4, "#e6eaf4"); R(r, px + 1, pt + 3, 1, pb - pt - 4, "#444a5a");
      R(r, px - 2, pt - 2, 5, 5, "#caa13c"); R(r, px - 1, pt - 3, 3, 1, "#caa13c"); R(r, px - 2, pt - 2, 2, 2, "#ffe9a0"); R(r, px + 1, pt + 1, 2, 2, "#8a6a1e");
    });
    // contact reflection of posts is faked by gloss in the glow pass
  }

  function buildCrowd() {
    crowdRows = [];
    const rows = [
      { y: H * 0.835, r: 7.5, sp: 17, col: "#090a10", rim: "#2b3558", sway: 0.8, depth: 0.5, cam: 0.55, seed: 11 },
      { y: H * 0.965, r: 12.5, sp: 34, col: "#030305", rim: "#1c2340", sway: 1.4, depth: 1, cam: 0.5, seed: 29 },
    ];
    rows.forEach((row) => {
      const rnd = seeded(row.seed);
      const wid = W + 40, c = cvs(wid, H), x = c.getContext("2d");
      const people = [];
      let px = -14 + rnd() * row.sp * 0.5;
      while (px < wid + 6) {
        const r = row.r * (0.9 + rnd() * 0.25), hy = row.y + (rnd() - 0.5) * row.r * 0.6;
        const v = Math.floor(rnd() * 5);
        x.fillStyle = row.col;
        // shoulders + torso
        x.beginPath(); x.ellipse(px, hy + r * 1.95, r * 1.75, r * 1.2, 0, 0, Math.PI * 2); x.fill();
        x.fillRect(px - r * 1.7, hy + r * 1.9, r * 3.4, H);
        // neck + head
        x.fillRect(px - r * 0.35, hy + r * 0.5, r * 0.7, r * 1.2);
        x.beginPath(); x.ellipse(px, hy, r * 0.86, r, 0, 0, Math.PI * 2); x.fill();
        if (v === 1) { x.beginPath(); x.ellipse(px, hy - r * 0.35, r * 0.98, r * 0.78, 0, Math.PI, 0); x.fill(); x.fillRect(px - r * 1.2, hy - r * 0.25, r * 1.4, r * 0.32); } // cap
        if (v === 2) { x.beginPath(); x.ellipse(px, hy - r * 0.2, r * 1.0, r * 1.05, 0, Math.PI, 0); x.fill(); x.fillRect(px + r * 0.55, hy - r * 0.2, r * 0.5, r * 1.9); } // long hair
        if (v === 3) { x.beginPath(); x.arc(px, hy - r * 1.15, r * 0.4, 0, Math.PI * 2); x.fill(); } // bun
        people.push({ x: px, hy, r, side: rnd() < 0.5 ? -1 : 1, cam: rnd() < row.cam, dx: (rnd() - 0.5) * r * 1.2, ph: rnd() * 6.28, phone: rnd() < 0.6, fire: 0 });
        px += row.sp * (0.8 + rnd() * 0.4);
      }
      hard(c);
      const rim = edgeOf(c, 0, 1, row.rim, 1);
      const rimL = edgeOf(c, 1, 0, rgba(row.rim, 0.6), 1);
      crowdRows.push({ c, rim, rimL, row, people, tint: null });
    });
  }

  function buildAmbient() {
    const rnd = seeded(5);
    const n = W > 200 ? 70 : 42;
    dust = [];
    for (let i = 0; i < n; i++) dust.push({ x: rnd() * W, y: rnd() * H * 0.85, vx: (rnd() - 0.5) * 2.2, vy: -0.6 - rnd() * 2.2, r: 0.35 + rnd() * 0.65, ph: rnd() * 6.28, d: rnd() });
    bokeh = [];
    const cols = ["#ffd6a0", "#9fdcff", "#ff9cc4", "#fff1d6", "#b89cff"];
    for (let i = 0; i < (W > 200 ? 16 : 10); i++) bokeh.push({ x: rnd() * W, y: rnd() * H * 0.78, vx: (rnd() - 0.5) * 1.5, vy: (rnd() - 0.5) * 0.7, r: 3 + rnd() * 9, a: 0.04 + rnd() * 0.09, col: cols[Math.floor(rnd() * cols.length)], ph: rnd() * 6.28 });
  }

  function layout() {
    vw = Math.max(1, window.innerWidth); vh = Math.max(1, window.innerHeight);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    k = Math.max(2, Math.round(vh / 175));
    W = Math.ceil(vw / k) + 1; H = Math.ceil(vh / k);
    ox = (vw - W * k) / 2;
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    pc = cvs(W, H); pctx = pc.getContext("2d");
    bc = cvs(Math.ceil(W / 3), Math.ceil(H / 3)); bctx = bc.getContext("2d");
    buildBack(); buildCrowd(); buildAmbient();
    S.modelX = S.modelXT = W / 2;
    S.rival.xT = S.rival.x = W * 0.7;
    drawFrame(0, true);
  }

  // glow sprite (soft radial) cache
  function glow(col) {
    let g = glowSpr[col];
    if (!g) {
      g = cvs(64, 64);
      const x = g.getContext("2d"), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, rgba(col, 1)); gr.addColorStop(0.35, rgba(col, 0.4)); gr.addColorStop(1, rgba(col, 0));
      x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
      glowSpr[col] = g;
    }
    return g;
  }

  // ------------------------------------------------------------------ figure composition
  function composeFig(F, o) {
    // o: yaw, mood, nod, bob, rim L/R colors, amt, bright, shades(bool), shadesY
    ftx.clearRect(0, 0, 60, 100);
    ftx.drawImage(F.body, 6, 6 + o.bob);
    const head = F.heads[o.yaw + o.mood] || F.heads["0cool"];
    ftx.drawImage(head, 14, 7 + o.nod + o.bob);
    if (o.shades) ftx.drawImage(shadesSpr, 14 + 4 + o.yaw * 2, 7 + 16 + o.nod + o.bob);
    // top-down key light + flash brighten
    ftx.globalCompositeOperation = "source-atop";
    const g = ftx.createLinearGradient(0, 0, 0, 96);
    g.addColorStop(0, `rgba(255,255,255,${0.03 + o.bright * 0.2})`); g.addColorStop(0.5, `rgba(255,255,255,${o.bright * 0.08})`); g.addColorStop(1, "rgba(0,0,0,0.18)");
    ftx.fillStyle = g; ftx.fillRect(0, 0, 60, 100);
    if (o.tint) { ftx.fillStyle = o.tint; ftx.fillRect(0, 0, 60, 100); }
    ftx.globalCompositeOperation = "source-over";
    // rim lights (cool left, warm right), boosted by reaction colour
    const L = edgeOf(ft, 1, 0, o.rimL, 1), L2 = edgeOf(ft, 1, 0, o.rimL, 2), Rr = edgeOf(ft, -1, 0, o.rimR, 1), Rr2 = edgeOf(ft, -1, 0, o.rimR, 2);
    ftx.globalAlpha = 0.45 * o.amt; ftx.drawImage(L2, 0, 0); ftx.drawImage(Rr2, 0, 0);
    ftx.globalAlpha = Math.min(1, 0.8 * o.amt); ftx.drawImage(L, 0, 0); ftx.drawImage(Rr, 0, 0);
    ftx.globalAlpha = 1;
    return ft;
  }
  // draws figure with 1px outline + reflection. cx = foot centre x, fy = foot y, s scale
  function placeFig(F, o, cx, fy, s, alpha) {
    composeFig(F, o);
    const w = 60 * s, h = 100 * s;
    const dx = Math.round(cx - 30 * s), dy = Math.round(fy - 91 * s);
    // reflection
    rfx.clearRect(0, 0, 60, 100);
    rfx.save(); rfx.translate(0, 100); rfx.scale(1, -1); rfx.drawImage(ft, 0, 0); rfx.restore();
    rfx.globalCompositeOperation = "destination-in";
    const gr = rfx.createLinearGradient(0, 100 - 91 - 2 + 0, 0, 100);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0, "rgba(0,0,0,0.0)");
    rfx.fillStyle = "rgba(0,0,0,1)";
    rfx.globalCompositeOperation = "source-over";
    pctx.save(); pctx.globalAlpha = 0.26 * alpha;
    // flipped copy anchored at the feet line, faded by drawing in strips
    const strips = 14, sh = Math.round(46 * s);
    for (let i = 0; i < strips; i++) {
      const sy0 = Math.floor((i / strips) * 46), sy1 = Math.floor(((i + 1) / strips) * 46);
      pctx.globalAlpha = 0.3 * alpha * (1 - i / strips) * (1 - i / strips);
      // source rows in flipped canvas: feet line is at y=91 in ft -> in rf feet line at y=9
      pctx.drawImage(rf, 0, 9 + sy0, 60, Math.max(1, sy1 - sy0), dx, Math.round(fy + 1 + sy0 * s), w, Math.max(1, Math.round((sy1 - sy0) * s)));
    }
    pctx.restore();
    // contact shadow
    pctx.fillStyle = "rgba(0,0,0,0.55)"; pctx.fillRect(Math.round(cx - 15 * s), Math.round(fy - 1), Math.round(30 * s), 2);
    pctx.fillStyle = "rgba(0,0,0,0.35)"; pctx.fillRect(Math.round(cx - 19 * s), Math.round(fy + 1), Math.round(38 * s), 1);
    // outline then figure
    pctx.save(); pctx.globalAlpha = alpha;
    const ol = tinted(ft, "#05060a");
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach((d) => pctx.drawImage(ol, dx + d[0] * s, dy + d[1] * s, w, h));
    pctx.drawImage(ft, dx, dy, w, h);
    pctx.restore();
    return { dx, dy, w, h };
  }

  // ------------------------------------------------------------------ frame
  function pulseFlash(cam, big, col) {
    if (flashes.length >= cap.flashes) flashes.shift();
    flashes.push({ x: cam.x, y: cam.y, t0: T, dur: big ? 0.3 : 0.2, big, col: col || "#ffffff" });
    S.flashLvl = Math.min(1, S.flashLvl + (big ? 0.5 : 0.28));
    cam.fire = T;
  }
  function burst(n, spread, col, big) {
    for (let i = 0; i < n; i++) flashQ.push({ at: T + (i / Math.max(1, n)) * spread + Math.random() * 0.05, col, big: big && Math.random() < 0.35 });
  }
  function allCams() {
    const out = [];
    crowdRows.forEach((r) => r.people.forEach((p) => { if (p.cam && p._cx !== undefined) out.push(p.camPos); }));
    return out.filter(Boolean);
  }
  function spawnSparks(n, col, x, y, spread, up) {
    for (let i = 0; i < n && sparks.length < cap.sparks; i++) {
      const a = Math.random() * 6.28, sp = (0.3 + Math.random()) * spread;
      sparks.push({ x: x + (Math.random() - 0.5) * 60, y: y + (Math.random() - 0.5) * 50, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (up || 0), life: 0, max: 0.7 + Math.random() * 0.9, s: 1 + Math.random() * 2, col });
    }
  }

  function update(dt, dtReal) {
    // easing
    S.light = approach(S.light, S.lightT, 3, dtReal);
    S.camLow = approach(S.camLow, S.camLowT, 4, dtReal);
    S.rimAmt = approach(S.rimAmt, S.rimAmtT, 3.5, dtReal);
    S.zoom = approach(S.zoom, S.zoomT, S.zoomT > S.zoom ? 3.2 : 2.6, dtReal);
    S.bars = approach(S.bars, S.barsT, 7, dtReal);
    S.ts = approach(S.ts, S.tsT, 5, dtReal);
    S.flashLvl = Math.max(0, S.flashLvl - dtReal * 4.2);
    S.washA = approach(S.washA, S.washT, 5, dtReal);
    S.modelX = approach(S.modelX, S.modelXT, 5, dtReal);
    const rv = S.rival;
    rv.x = approach(rv.x, rv.xT, 5, dtReal); rv.y = approach(rv.y, rv.yT, 4.5, dtReal); rv.sc = approach(rv.sc, rv.scT, 6, dtReal);
    if (rv.fall) { rv.fall.vy += 120 * dtReal; rv.fall.y += rv.fall.vy * dtReal; rv.fall.x += rv.fall.vx * dtReal; rv.fall.r += rv.fall.vr * dtReal;
      const gy = H * 0.77; if (rv.fall.y > gy && rv.fall.vy > 0) { rv.fall.y = gy; rv.fall.vy *= -0.38; rv.fall.vx *= 0.6; rv.fall.vr *= 0.5; if (Math.abs(rv.fall.vy) < 8) rv.fall.vy = 0; } }
    // schedules
    for (let i = sched.length - 1; i >= 0; i--) if (T >= sched[i].at) { const f = sched[i].fn; sched.splice(i, 1); f(); }
    // ambient flashes
    if (inRun) { S.idleFlash -= dtReal; if (S.idleFlash <= 0) { S.idleFlash = 1.4 + Math.random() * 2.6; flashQ.push({ at: T, col: "#fff" }); } }
    else { S.idleFlash -= dtReal; if (S.idleFlash <= 0) { S.idleFlash = 2.5 + Math.random() * 3; flashQ.push({ at: T, col: "#fff" }); } }
    // queued flashes
    if (flashQ.length) {
      const cams = allCams();
      for (let i = flashQ.length - 1; i >= 0; i--) {
        if (T >= flashQ[i].at) {
          if (S.camLow < 0.6 || flashQ[i].force) { const cam = cams.length ? cams[Math.floor(Math.random() * cams.length)] : { x: W / 2, y: H * 0.8, fire: 0 }; pulseFlash(cam, flashQ[i].big, flashQ[i].col); }
          flashQ.splice(i, 1);
        }
      }
    }
    for (let i = flashes.length - 1; i >= 0; i--) if (T - flashes[i].t0 > flashes[i].dur) flashes.splice(i, 1);
    // particles
    dust.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.ph += dt; if (p.y < -2) { p.y = H * 0.85; p.x = Math.random() * W; } if (p.x < -2) p.x = W + 2; if (p.x > W + 2) p.x = -2; });
    bokeh.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; b.ph += dt * 0.6; if (b.x < -12) b.x = W + 12; if (b.x > W + 12) b.x = -12; if (b.y < 0 || b.y > H * 0.8) b.vy = -b.vy; });
    for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 14 * dt; if (p.life > p.max) sparks.splice(i, 1); }
  }

  function beamPass(c, mult) {
    const fy = H * 0.745, specs = [
      { sx: W * 0.16, tx: W * 0.5 - W * 0.2, bw: 0.17, col: S.beamCol[0], a: 0.24 },
      { sx: W * 0.5, tx: W * 0.5, bw: 0.2, col: S.beamCol[1], a: 0.13 },
      { sx: W * 0.84, tx: W * 0.5 + W * 0.2, bw: 0.17, col: S.beamCol[2], a: 0.22 },
    ];
    c.globalCompositeOperation = "lighter";
    specs.forEach((b, i) => {
      const sway = Math.sin(T * 0.5 + i * 2.1) * W * 0.02, tx = b.tx + sway;
      const bwid = Math.max(14, W * b.bw * (W > 200 ? 0.5 : 1));
      for (let pass = 0; pass < 2; pass++) {
        const wdt = bwid * (pass ? 0.45 : 1), a = b.a * (pass ? 1.2 : 0.8) * mult;
        const g = c.createLinearGradient(b.sx, 4, tx, fy);
        g.addColorStop(0, rgba(b.col, a * 1.4)); g.addColorStop(0.6, rgba(b.col, a * 0.45)); g.addColorStop(1, rgba(b.col, a * 0.22));
        c.fillStyle = g; c.beginPath(); c.moveTo(b.sx - 1.5, 4); c.lineTo(b.sx + 1.5, 4); c.lineTo(tx + wdt / 2, fy + 2); c.lineTo(tx - wdt / 2, fy + 2); c.closePath(); c.fill();
      }
      // fixture glow + floor pool
      c.drawImage(glow(b.col), b.sx - 7, -3, 14, 14);
      c.save(); c.translate(tx, fy + 3); c.scale(1, 0.28); c.globalAlpha = 0.55 * mult; c.drawImage(glow(b.col), -bwid * 0.8, -bwid * 0.8, bwid * 1.6, bwid * 1.6); c.restore();
    });
    // sweeping tier beam (deep cut / golden)
    const sp = (T - S.sweepT0) / 1.5;
    if (sp > 0 && sp < 1) {
      const sx0 = W * 0.5, tx = lerp(-W * 0.2, W * 1.2, sp), wd = W * 0.16, a = Math.sin(sp * Math.PI);
      const g = c.createLinearGradient(sx0, 0, tx, H * 0.7);
      g.addColorStop(0, rgba(S.sweepCol, 0.8 * a)); g.addColorStop(1, rgba(S.sweepCol, 0.15 * a));
      c.fillStyle = g; c.beginPath(); c.moveTo(sx0 - 3, 0); c.lineTo(sx0 + 3, 0); c.lineTo(tx + wd, H * 0.75); c.lineTo(tx - wd, H * 0.75); c.closePath(); c.fill();
      c.save(); c.translate(tx, H * 0.75); c.scale(1, 0.25); c.globalAlpha = 0.7 * a; c.drawImage(glow(S.sweepCol), -wd * 1.4, -wd * 1.4, wd * 2.8, wd * 2.8); c.restore();
    }
    c.globalCompositeOperation = "source-over";
  }

  function drawFrame(dtReal, still) {
    const dt = dtReal * S.ts;
    const t = T;
    pctx.imageSmoothingEnabled = false;
    pctx.clearRect(0, 0, W, H);
    pctx.drawImage(back, 0, 0);
    const cx = Math.round(S.modelX), feet = Math.round(H * 0.745);
    // rival (behind model slightly) then model
    const rv = S.rival;
    const bob = Math.round(Math.sin(t * 1.5) * 0.55), hb = Math.round(Math.sin(t * 1.5 - 0.7) * 0.6);
    const nodP = clamp((t - S.nodT0) / 0.55, 0, 1), nod = nodP < 1 ? Math.round(Math.sin(nodP * Math.PI) * 2.2 * S.nodAmp) : 0;
    const yaw = t < S.yawUntil ? S.yaw : 0;
    const rimAmt = 0.55 + S.rimAmt;
    const rc = S.rimCol, warm = "#ff9d6e";
    const bright = Math.min(0.55, S.flashLvl * 0.6) / (S.zoom > 1.5 ? 3 : 1);
    const lightLvl = S.light;
    const dim = lightLvl < 0.99;
    if (rv.vis) {
      const sh = rv.fall ? false : rv.shades;
      placeFig(rfig, { yaw: 0, mood: rv.mood, nod: 0, bob, bright, amt: 0.8 + S.rimAmt * 0.3, rimL: "#a8e8ff", rimR: "#ff9d6e", shades: sh, tint: null }, Math.round(rv.x), Math.round(feet + rv.y), rv.sc * 0.97, 1);
      if (rv.fall) { pctx.save(); pctx.translate(Math.round(rv.fall.x), Math.round(rv.fall.y)); pctx.rotate(rv.fall.r); pctx.drawImage(shadesSpr, -12, -4); pctx.restore(); }
    }
    placeFig(fig, { yaw, mood: S.mood, nod, bob, bright, amt: rimAmt, rimL: yaw === 0 && S.rimAmt < 0.1 ? "#a8e8ff" : rc, rimR: S.rimAmt > 0.1 ? rc : warm, shades: false, tint: null }, cx, feet, 1, 1);
    pctx.drawImage(ropeC, 0, 0);
    // crowd (two parallax rows), cameras drawn between
    crowdRows.forEach((r, ri) => {
      const sway = Math.round(Math.sin(t * 0.55 + ri * 1.7) * r.row.sway);
      pctx.drawImage(r.c, -20 + sway, 0);
      pctx.drawImage(r.rimL, -20 + sway, 0);
      pctx.drawImage(r.rim, -20 + sway, 0);
      r.people.forEach((p) => {
        const hx = p.x - 20 + sway, hy = p.hy + Math.round(Math.sin(t * 1.1 + p.ph) * 0.5);
        const raise = (1 - S.camLow) * (r.row.r * 1.9) + S.camLow * r.row.r * 0.25;
        const camX = Math.round(hx + p.dx * (1 - S.camLow * 0.4)), camY = Math.round(hy - r.row.r * 0.4 - raise + (p.cam ? 0 : 0));
        if (!p.cam) return;
        p.camPos = p.camPos || { x: 0, y: 0, fire: 0 };
        p.camPos.x = camX; p.camPos.y = camY; p._cx = 1;
        const col = r.row.col;
        const sx = Math.round(hx + p.side * r.row.r * 1.3), sy = Math.round(hy + r.row.r * 1.3);
        line(pctx, sx, sy, camX + (p.side > 0 ? 2 : -2), camY + 3, Math.max(2, Math.round(r.row.r / 5)), col);
        const cw = p.phone ? 4 : 7, ch = p.phone ? 6 : 5;
        const fired = T - p.camPos.fire < 0.16;
        pctx.fillStyle = col; pctx.fillRect(camX - Math.floor(cw / 2) - 1, camY - 1, cw + 2, ch + 2);
        pctx.fillStyle = p.phone ? (fired ? "#e8f6ff" : "#2e4a6e") : "#1a1d26"; pctx.fillRect(camX - Math.floor(cw / 2), camY, cw, ch);
        if (!p.phone) { pctx.fillStyle = fired ? "#ffffff" : "#3f4a63"; pctx.fillRect(camX - 1, camY + 1, 2, 2); pctx.fillStyle = "#c22"; pctx.fillRect(camX + 2, camY, 1, 1); }
        else { pctx.fillStyle = "rgba(160,210,255,0.5)"; pctx.fillRect(camX - 1, camY + 1, 2, 1); }
      });
    });
    // ---- blit pixel layer to the full-res canvas
    const kd = k * dpr, z = S.zoom;
    const vwA = W / z, vhA = H / z;
    const sx0 = clamp(S.zfx * W - vwA / 2, 0, W - vwA), sy0 = clamp(S.zfy * H - vhA / 2, 0, H - vhA);
    let shx = 0, shy = 0;
    if (!reduce()) {
      const sp = (t - S.shakeT0) / Math.max(0.01, S.shakeDur);
      if (sp >= 0 && sp < 1) { const a = S.shakeAmp * (1 - sp); shx = (Math.random() - 0.5) * 2 * a; shy = (Math.random() - 0.5) * 2 * a; }
      if (t < S.buzzUntil) shx += Math.sin(t * 190) * 0.5;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(kd * z, 0, 0, kd * z, ox * dpr - sx0 * kd * z + shx * kd, -sy0 * kd * z + shy * kd);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pc, 0, 0);
    // lighting darkness (timeout dims the room)
    if (dim) { ctx.fillStyle = `rgba(2,3,8,${(1 - lightLvl) * 0.78})`; ctx.fillRect(0, 0, W, H); }
    ctx.imageSmoothingEnabled = true;
    // bloom from the pixel layer
    if (bctx) {
      bctx.clearRect(0, 0, bc.width, bc.height);
      bctx.drawImage(pc, 0, 0, bc.width, bc.height);
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.28 * lightLvl / (z * z);
      ctx.drawImage(bc, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    beamPass(ctx, lightLvl * lightLvl / Math.pow(z, 1.6));
    ctx.globalCompositeOperation = "lighter";
    // halo behind model + gold/colour wash
    const halo = 0.1 + S.rimAmt * 0.16 + S.flashLvl * 0.1;
    ctx.globalAlpha = halo * lightLvl / z; ctx.drawImage(glow(S.rimAmt > 0.1 ? S.rimCol : "#9fb4ff"), S.modelX - 52, feet - 108, 104, 120); ctx.globalAlpha = 1;
    if (S.washA > 0.01 && S.wash) { ctx.globalAlpha = S.washA; ctx.fillStyle = rgba(S.wash, 0.5); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    // floor gloss streaks under beams
    ctx.globalAlpha = 0.1 * lightLvl;
    [0.3, 0.5, 0.7].forEach((fx, i) => { const g = ctx.createLinearGradient(0, H * 0.62, 0, H); g.addColorStop(0, rgba(S.beamCol[i], 0.7)); g.addColorStop(1, rgba(S.beamCol[i], 0)); ctx.fillStyle = g; ctx.fillRect(W * fx - 4 + Math.sin(t * 0.4 + i) * 3, H * 0.62, 8, H * 0.38); });
    ctx.globalAlpha = 1;
    // bokeh
    bokeh.forEach((b) => { ctx.globalAlpha = b.a * (0.7 + 0.3 * Math.sin(b.ph)) * lightLvl; ctx.drawImage(glow(b.col), b.x - b.r, b.y - b.r, b.r * 2, b.r * 2); });
    ctx.globalAlpha = 1;
    // dust motes, brighter where they cross the beams
    ctx.fillStyle = "#fff";
    dust.forEach((p) => {
      const inBeam = Math.max(0, 1 - Math.abs(p.x - W / 2) / (W * 0.22)) * (p.y < H * 0.78 ? 1 : 0.3);
      ctx.globalAlpha = (0.12 + 0.5 * inBeam * (0.6 + 0.4 * Math.sin(p.ph * 3))) * lightLvl;
      ctx.fillRect(p.x, p.y, p.r * 1.4, p.r * 1.4);
    });
    ctx.globalAlpha = 1;
    // sparkles
    sparks.forEach((p) => {
      const a = 1 - p.life / p.max, s = p.s * (0.6 + a);
      ctx.globalAlpha = a; ctx.fillStyle = p.col;
      ctx.fillRect(p.x - s / 2, p.y - 0.5, s, 1); ctx.fillRect(p.x - 0.5, p.y - s / 2, 1, s);
      if (s > 2.2) { ctx.globalAlpha = a * 0.35; ctx.drawImage(glow(p.col), p.x - s, p.y - s, s * 2, s * 2); }
    });
    ctx.globalAlpha = 1;
    // camera flashes
    flashes.forEach((f) => {
      const p = (T - f.t0) / f.dur, a = Math.pow(1 - p, 1.6), r = (f.big ? 38 : 24) * (0.6 + p * 0.5) / Math.sqrt(z);
      ctx.globalAlpha = a;
      ctx.drawImage(glow(f.col), f.x - r, f.y - r, r * 2, r * 2);
      ctx.fillStyle = "#fff"; ctx.fillRect(f.x - r * 0.9, f.y - 0.5, r * 1.8, 1); ctx.fillRect(f.x - 0.5, f.y - r * 0.9, 1, r * 1.8);
      ctx.globalAlpha = a * 0.5; ctx.fillRect(f.x - 1, f.y - 1, 3, 3);
      // light thrown onto the wall
      ctx.globalAlpha = a * 0.06; ctx.fillStyle = f.col; ctx.fillRect(0, 0, W, H * 0.62);
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    // ---- screen-space finishing
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const cw = cv.width, ch = cv.height;
    if (S.bw > 0.01) {
      ctx.globalCompositeOperation = "saturation"; ctx.fillStyle = "#808080"; ctx.globalAlpha = S.bw; ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    // vignette
    const vg = ctx.createRadialGradient(cw / 2, ch * 0.5, Math.min(cw, ch) * 0.25, cw / 2, ch * 0.5, Math.max(cw, ch) * 0.72);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, `rgba(${S.vig || "0,0,6"},0.72)`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch);
    // strobe
    if (!reduce() && t < S.strobeUntil) {
      const ph = Math.floor((S.strobeUntil - t) / 0.055) % 2;
      ctx.fillStyle = ph ? "#fff" : "#000"; ctx.globalAlpha = ph ? 0.75 : 0.55; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1;
    }
    // letterbox
    if (S.bars > 0.01) { const bh = ch * 0.1 * S.bars; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cw, bh); ctx.fillRect(0, ch - bh, cw, bh); }
    // viewfinder HUD
    if (inRun) {
      const m = 14 * dpr, l = 14 * dpr;
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 2 * dpr;
      const top = 62 * dpr, bot = ch - 14 * dpr;
      [[m, top, 1, 1], [cw - m, top, -1, 1], [m, bot, 1, -1], [cw - m, bot, -1, -1]].forEach((c) => { ctx.beginPath(); ctx.moveTo(c[0], c[1] + c[3] * l); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0] + c[2] * l, c[1]); ctx.stroke(); });
      if (!still && Math.floor(t * 1.2) % 2 === 0) { ctx.fillStyle = "#ff3b3b"; ctx.beginPath(); ctx.arc(m + 8 * dpr, top + 18 * dpr, 3.2 * dpr, 0, 6.3); ctx.fill(); }
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.font = `${11 * dpr}px Anton, Impact, sans-serif`; ctx.textBaseline = "middle";
      ctx.fillText("REC " + (S.take || ""), m + 16 * dpr, top + 18 * dpr);
    }
  }

  // ------------------------------------------------------------------ loop
  function frame(now) {
    raf = 0;
    if (!running) return;
    const dtReal = Math.min(0.05, (now - last) / 1000);
    // menu runs at ~30fps
    if (!inRun && now - lastDraw < 32) { raf = requestAnimationFrame(frame); return; }
    last = now; lastDraw = now;
    inRun = document.body.classList.contains("in-run");
    T += dtReal;
    update(dtReal * S.ts, dtReal);
    drawFrame(dtReal, false);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (reduce()) { render1(); return; }
    if (running || document.hidden) return;
    running = true; last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function render1() { if (!ready) return; inRun = document.body.classList.contains("in-run"); S.flashLvl = 0; drawFrame(0, true); }

  // ------------------------------------------------------------------ reactions
  const later = (ms, fn) => sched.push({ at: T + ms / 1000, fn });
  function resetRun() {
    sched.length = 0; flashQ.length = 0;
    S.lightT = 1; S.camLowT = 0; S.rimAmtT = 0; S.zoomT = 1; S.barsT = 0; S.tsT = 1; S.washT = 0; S.bw = 0; S.strobeUntil = 0;
    S.mood = "cool"; S.modelXT = W / 2; S.yawUntil = 0; S.beamCol = ["#9fdcff", "#fff1d6", "#ffc4a0"]; S.vig = null; S.sweepT0 = -9;
    const rv = S.rival; rv.xT = W * 0.7; rv.yT = 0; rv.scT = 1; rv.vis = false; rv.fall = null; rv.shades = true; rv.mood = "cool";
    clearPlaque();
  }
  function clearPlaque() { if (plaque) plaque.classList.remove("show"); if (slamEl) slamEl.classList.remove("go"); }
  function showPlaque(tier, text, note, pts) {
    if (!plaque) return;
    const T0 = TIER[tier] || TIER.miss;
    plaque.style.setProperty("--c", T0.col);
    plaque.dataset.tier = tier;
    plaque.querySelector(".sc-pl-tag").textContent = T0.label + (pts > 0 ? "  +" + pts : "");
    plaque.querySelector(".sc-pl-txt").textContent = text || "";
    const n = plaque.querySelector(".sc-pl-note"); n.textContent = note || ""; n.style.display = note ? "" : "none";
    plaque.classList.remove("show"); void plaque.offsetWidth; plaque.classList.add("show");
  }
  const nod = (a) => { S.nodT0 = T; S.nodAmp = a; };
  const turn = (dir, ms) => { S.yaw = dir; S.yawUntil = T + ms / 1000; };
  const shake = (amp, dur) => { S.shakeAmp = amp; S.shakeT0 = T; S.shakeDur = dur; };
  function rim(col, amt, ms) { S.rimCol = col; S.rimAmtT = amt; later(ms, () => { S.rimAmtT = 0; }); }
  function slowzoom(z, ts, ms, fx, fy) { S.zoomT = z; S.tsT = ts; S.zfx = fx == null ? 0.5 : fx; S.zfy = fy == null ? 0.4 : fy; later(ms, () => { S.zoomT = 1; S.tsT = 1; }); }

  function reactTier(tier) {
    const col = TIER[tier] ? TIER[tier].col : "#fff";
    S.lightT = 1; S.camLowT = 0; S.vig = null;
    if (tier === "t10") { burst(2, 0.25, "#fff"); nod(0.8); }
    else if (tier === "trap") { burst(2, 0.3, "#fff"); nod(0.6); rim(col, 0.45, 900); }
    else if (tier === "t25") { burst(5, 0.5, "#fff"); nod(1); turn(1, 700); rim(col, 0.35, 800); }
    else if (tier === "t50") {
      burst(11, 0.7, "#e6fbff", true); nod(1.2); turn(-1, 900); rim("#4de2f7", 1.2, 1700); slowzoom(1.22, 0.4, 1300, 0.5, 0.36);
      S.beamCol = ["#4de2f7", "#d8fbff", "#4de2f7"]; later(1700, () => { S.beamCol = ["#9fdcff", "#fff1d6", "#ffc4a0"]; });
      spawnSparks(14, "#9ff0ff", S.modelX, H * 0.5, 22, 6);
    } else if (tier === "t75") {
      burst(26, 1.1, "#ffd0e4", true); nod(1.6); turn(1, 900); rim("#ff4d8d", 1.5, 2000); shake(2.4, 0.55); slowzoom(1.14, 0.5, 1100, 0.5, 0.38);
      S.sweepT0 = T; S.sweepCol = "#ff4d8d"; S.wash = "#ff4d8d"; S.washT = 0.18; later(900, () => { S.washT = 0; });
      S.beamCol = ["#ff4d8d", "#ffd0e4", "#ff4d8d"]; later(2000, () => { S.beamCol = ["#9fdcff", "#fff1d6", "#ffc4a0"]; });
      spawnSparks(34, "#ff8fbd", S.modelX, H * 0.5, 34, 8);
    }
  }

  function goldenEdit() {
    const narrow = W < 130;
    const rv = S.rival;
    S.beamCol = ["#f5c542", "#fff0b8", "#f5c542"]; S.vig = "20,12,0";
    S.bw = 1; S.strobeUntil = T + 0.5; S.barsT = 1; shake(2.6, 0.5);
    burst(34, 1.0, "#fff3c0", true); rim("#f5c542", 1.8, 3600); nod(1.4);
    S.zoomT = 2.35; S.zfx = 0.5; S.zfy = 0.36; S.tsT = 0.3; S.sweepT0 = T; S.sweepCol = "#f5c542";
    S.wash = "#f5c542"; S.washT = 0.06;
    spawnSparks(16, "#ffe08a", S.modelX, H * 0.55, 40, 10);
    later(1100, () => {
      S.bw = 0; S.strobeUntil = T + 0.14; S.zoomT = narrow ? 1 : 1.4; S.zfx = 0.5; S.zfy = 0.5; S.tsT = 0.55; S.mood = "smug"; S.modelXT = W * (narrow ? 0.27 : 0.33);
      rv.vis = true; rv.x = W * 1.15; rv.xT = W * (narrow ? 0.76 : 0.69); rv.y = 0; rv.yT = 0; rv.sc = narrow ? 0.8 : 1; rv.scT = narrow ? 0.8 : 1; rv.shades = true; rv.mood = "cool"; rv.fall = null;
      burst(14, 0.6, "#fff3c0", true); turn(-1, 1200);
    });
    later(1750, () => {
      rv.fall = { x: rv.x + 1, y: H * 0.745 - 64 * rv.sc, vx: 14, vy: -40, r: 0.2, vr: 5 }; rv.mood = "shock"; rv.shades = false;
      shake(4.2, 0.55); S.strobeUntil = T + 0.1; burst(20, 0.5, "#fff", true);
      spawnSparks(40, "#f5c542", W / 2, H * 0.4, 50, 14);
      if (slamEl) { slamEl.classList.remove("go"); void slamEl.offsetWidth; slamEl.classList.add("go"); }
      S.washT = 0.1; later(500, () => { S.washT = 0.05; });
    });
    later(2700, () => { rv.scT = 0.42; rv.yT = 40; rv.xT = W * 0.86; S.tsT = 0.8; });
    later(3300, () => { S.modelXT = W / 2; S.zoomT = 1; S.barsT = 0; S.tsT = 1; S.washT = 0; S.beamCol = ["#9fdcff", "#fff1d6", "#ffc4a0"]; S.mood = "cool"; S.vig = null; });
    later(3900, () => { rv.vis = false; rv.fall = null; });
  }

  function reactMiss() {
    S.camLowT = 1; S.tsT = 0.7; S.buzzUntil = T + 0.35; S.lightT = 0.72; S.vig = "30,0,0"; S.mood = "cool";
    later(1700, () => { S.camLowT = 0; S.tsT = 1; S.lightT = 1; S.vig = null; });
  }

  // ------------------------------------------------------------------ public API
  const Scene = {
    runStart() {
      if (!ready) return;
      resetRun(); S.take = "1/7"; S.idleFlash = 0.4;
      burst(4, 0.6, "#fff"); nod(0.8);
      render1Soft();
    },
    prompt(index, total) {
      if (!ready) return;
      S.take = (index + 1) + "/" + total;
      // soft reset: everything eases back
      sched.length = 0; flashQ.length = 0;
      S.lightT = 1; S.camLowT = 0; S.rimAmtT = 0; S.zoomT = 1; S.barsT = 0; S.tsT = 1; S.washT = 0; S.bw = 0; S.strobeUntil = 0; S.mood = "cool";
      S.modelXT = W / 2; S.beamCol = ["#9fdcff", "#fff1d6", "#ffc4a0"]; S.vig = null;
      const rv = S.rival; rv.vis = false; rv.fall = null;
      clearPlaque();
      burst(2, 0.3, "#fff");
      render1Soft();
    },
    answer(o) {
      if (!ready) return;
      o = o || {};
      const tier = TIER[o.tier] ? o.tier : "t10";
      const text = "“" + String(o.display || o.input || "").toUpperCase() + "”";
      showPlaque(tier, text, o.note, o.pts || 0);
      if (reduce()) { S.rimCol = TIER[tier].col; S.rimAmtT = S.rimAmt = tier === "t10" ? 0 : 0.8; render1(); return; }
      if (tier === "miracle") goldenEdit(); else reactTier(tier);
    },
    miss(input) {
      if (!ready) return;
      showPlaque("miss", "“" + String(input || "").toUpperCase() + "”", "", 0);
      if (reduce()) { render1(); return; }
      reactMiss();
    },
    timeout() {
      if (!ready) return;
      showPlaque("timeout", "TIME’S UP", "", 0);
      if (reduce()) { S.light = S.lightT = 0.3; render1(); return; }
      S.lightT = 0.22; S.camLowT = 0.55; S.tsT = 0.6; S.vig = "0,0,10"; S.beamCol = ["#5a6a8a", "#8a8f9a", "#5a6a8a"];
    },
    runEnd() {
      if (!ready) return;
      sched.length = 0; clearPlaque();
      S.lightT = 1; S.camLowT = 0; S.zoomT = 1; S.barsT = 0; S.bw = 0; S.tsT = 1; S.vig = null; S.mood = "cool";
      S.rival.vis = false; S.modelXT = W / 2; S.beamCol = ["#9fdcff", "#fff1d6", "#ffc4a0"];
      render1Soft();
    },
  };
  function render1Soft() { if (reduce()) { S.light = S.lightT; S.rimAmt = S.rimAmtT; render1(); } }

  // ------------------------------------------------------------------ init
  function init() {
    root = document.createElement("div");
    root.id = "scene"; root.setAttribute("aria-hidden", "true");
    cv = document.createElement("canvas");
    root.appendChild(cv);
    plaque = document.createElement("div");
    plaque.className = "sc-plaque";
    plaque.innerHTML = '<div class="sc-pl-tag"></div><div class="sc-pl-txt"></div><div class="sc-pl-note"></div>';
    slamEl = document.createElement("div");
    slamEl.className = "sc-slam"; slamEl.textContent = "MOGGED";
    root.appendChild(plaque); root.appendChild(slamEl);
    document.body.insertBefore(root, document.body.firstChild);
    ctx = cv.getContext("2d", { alpha: false });
    buildSprites();
    layout();
    ready = true;
    drawFrame(0, true);
    let rt = 0;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); }, 120); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else start(); });
    if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", () => { if (reduce()) { stop(); render1(); } else start(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!running) render1(); });
    start();
  }
  Scene._step = (sec) => { stop(); inRun = true; for (let s = 0; s < sec; s += 1 / 30) { T += 1 / 30; update(S.ts / 30, 1 / 30); drawFrame(1 / 30, false); } };
  window.Scene = Scene;
  if (document.body) init(); else document.addEventListener("DOMContentLoaded", init);
})();
