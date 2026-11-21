/*
  Chrillion live scenes: a little pixel-art window that plays while you answer.
  Scene.play(n) starts scene n (snowball fight, Santa on the rooftops, sledding); Scene.stop() pauses it.
*/
(() => {
  "use strict";

  const PAL = {
    R: "#c8323a", r: "#8e1f26", G: "#2f8a4e", g: "#1d5c33", Y: "#f2c14e", W: "#f6ecd6", w: "#d8c9a8",
    B: "#8a5a36", b: "#5e3a20", K: "#2b1d18", P: "#f1c19c", U: "#3f7fc4", u: "#2b5f99", O: "#d9823b", V: "#8a4fa0",
  };

  // Kids: H = hat colour, C = coat colour (swapped per kid).
  const KID_IDLE = [
    "...W...", "..HHH..", ".HHHHH.", "..PPP..", "..PKP..", ".CCCCC.", "C.CCC.C", "P.CCC.P", "..K.K..", "..K.K..",
  ];
  const KID_THROW = [
    "...W...", "..HHH..", ".HHHHH.", "..PPP.P", "..PKP.C", ".CCCCCC", "C.CCC..", "P.CCC..", "..K.K..", "..K.K..",
  ];
  const KID_SLED = [
    "...W...", "..HHH..", ".HHHHH.", "..PPP..", ".CCCCC.", "PCCCCCP", "YYYYYYYY", ".B....B.",
  ];
  const SANTA_A = [
    "..RRRR...", ".RRRRRRW.", "..WWWW...", "..PPPK...", ".WWWWWW..", "..WWWW...", "bRRRRRR..", "bRRYYRR..", "bRRRRRR..", "..K..K...", ".KK..KK..",
  ];
  const SANTA_B = [
    "..RRRR...", ".RRRRRRW.", "..WWWW...", "..PPPK...", ".WWWWWW..", "..WWWW...", "bRRRRRR..", "bRRYYRR..", "bRRRRRR..", "...KK....", "..KKKK...",
  ];
  const GIFT = ["RYR", "YYY", "RYR"];
  const SNOWMAN = ["..KKK..", "..KKK..", ".KKKKK.", "..WWW..", ".WKWKW.", ".WWOWW.", "..RRR..", ".WWWWW.", "WWWKWWW", "WWWWWWW", ".WWWWW."];
  const TREE = ["...G...", "..GGG..", ".GGGGG.", "..GGG..", ".GGGGG.", "GGGGGGG", "...B..."];

  let canvas = null, ctx = null, raf = 0, kind = 0, t0 = 0, last = 0, W = 0, H = 0, flakes = [], parts = [];
  const K = 3;                                   // screen pixels per art pixel
  const q = (v) => Math.round(v * K) / K;        // snap to real screen pixels, so movement glides instead of jumping 3px at a time

  function drawGrid(rows, x, y, map, flip) {
    const w = rows[0].length;
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === ".") continue;
        const col = (map && map[ch]) || PAL[ch];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(q(x + (flip ? w - 1 - i : i)), q(y + j), 1, 1);
      }
    });
  }

  function resize() {
    const cssW = canvas.clientWidth || 360, cssH = canvas.clientHeight || 96;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = q(cssW * dpr);
    canvas.height = q(cssH * dpr);
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr * K, 0, 0, dpr * K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    W = cssW / K;
    H = cssH / K;
    flakes = Array.from({ length: q(W / 4) }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 4 + Math.random() * 6 }));
  }

  function sky(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#14253f");
    g.addColorStop(1, "#2b3f63");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff3d6";
    ctx.fillRect(q(W - 18), 4, 5, 5);
    ctx.fillRect(q(W - 19), 5, 7, 3);
    ctx.fillStyle = "rgba(255,255,255,.7)";
    for (let i = 0; i < 14; i++) {
      if ((i * 7 + Math.floor(t * 2)) % 9 === 0) continue;      // gentle twinkle
      ctx.fillRect((i * 37) % Math.floor(W), (i * 13) % Math.floor(H * 0.45), 1, 1);
    }
  }

  function snowfall(dt) {
    ctx.fillStyle = "rgba(246,236,214,.85)";
    flakes.forEach((f) => {
      f.y += f.v * dt;
      f.x += Math.sin(f.y / 6) * 0.08;
      if (f.y > H) { f.y = -1; f.x = Math.random() * W; }
      ctx.fillRect(q(f.x), q(f.y), 1, 1);
    });
  }

  function particles(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      p.vy += 60 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx.fillStyle = p.c;
      ctx.fillRect(q(p.x), q(p.y), 1, 1);
    }
  }
  function burst(x, y, c, n) {
    for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - 0.5) * 40, vy: -Math.random() * 30, life: 0.45 + Math.random() * 0.3, c });
  }

  function ground(y) {
    ctx.fillStyle = "#f6ecd6";
    ctx.fillRect(0, y, W, H - y);
    ctx.fillStyle = "#d8e3ea";
    for (let x = 0; x < W; x += 6) ctx.fillRect(x, y, 3, 1);
  }

  // ---------- scene 1: snowball fight ----------
  const kidA = { H: "#c8323a", C: "#2f8a4e" }, kidB = { H: "#3f7fc4", C: "#c8323a" };
  let sbState = { cycle: -1 };
  function snowballFight(t) {
    const gy = H - 7;
    ground(gy);
    const lx = 10, rx = W - 17;
    const period = 2.6, cyc = Math.floor(t / period), p = (t % period) / period;
    const leftThrows = cyc % 2 === 0;
    const hit = cyc % 3 === 1;
    if (cyc !== sbState.cycle) { sbState = { cycle: cyc, splat: false }; }
    // Ball flight
    const fly = Math.max(0, Math.min(1, (p - 0.18) / 0.5));
    const fromX = leftThrows ? lx + 7 : rx - 1, toX = leftThrows ? rx + 3 : lx + 3;
    const bx = fromX + (toX - fromX) * fly;
    const by = gy - 9 - Math.sin(fly * Math.PI) * 14 + (hit ? 0 : fly * 4);
    const duckL = !leftThrows && !hit && p > 0.45 && p < 0.75;
    const duckR = leftThrows && !hit && p > 0.45 && p < 0.75;
    const bob = (n) => q(Math.sin(t * 6 + n) * 0.6);
    drawGrid(leftThrows && p > 0.08 && p < 0.25 ? KID_THROW : KID_IDLE, lx, gy - 10 + bob(0) + (duckL ? 3 : 0), kidA);
    drawGrid(!leftThrows && p > 0.08 && p < 0.25 ? KID_THROW : KID_IDLE, rx, gy - 10 + bob(2) + (duckR ? 3 : 0), kidB, true);
    // Snow forts
    ctx.fillStyle = "#f6ecd6";
    [[lx + 4, 11], [rx - 6, 11]].forEach(([fx, fw]) => { ctx.fillRect(fx, gy - 5, fw, 5); ctx.fillRect(fx + 1, gy - 6, fw - 2, 1); });
    ctx.fillStyle = "#c9d6de";
    [[lx + 4, 11], [rx - 6, 11]].forEach(([fx, fw]) => ctx.fillRect(fx, gy - 1, fw, 1));
    if (fly > 0 && fly < 1) { ctx.fillStyle = "#ffffff"; ctx.fillRect(q(bx), q(by), 2, 2); }
    if (fly >= 1 && !sbState.splat) {
      sbState.splat = true;
      burst(toX + 1, hit ? gy - 9 : gy - 6, "#ffffff", 9);
      if (hit && window.Sfx) { /* stays quiet: the game's own sounds own the audio */ }
    }
  }

  // ---------- scene 2: Santa on the rooftops ----------
  let roof = null;
  function initRoof() {
    roof = { scroll: 0, pause: 0, houses: [], next: 0, dropAt: -1 };
    let x = 0;
    for (let i = 0; i < 12; i++) {
      const w = 26 + ((i * 7) % 9), h = 13 + ((i * 5) % 8);
      roof.houses.push({ x, w, h, wall: ["#7b3a2b", "#5e4a7a", "#2f6b56", "#8a5a36"][i % 4], chim: 6 + ((i * 3) % Math.max(1, w - 14)), done: false });
      x += w + 4;
    }
    roof.len = x;
  }
  function santaRooftops(t, dt) {
    if (!roof) initRoof();
    const gy = H - 3;
    ground(gy);
    const santaX = q(W * 0.3);
    if (roof.pause > 0) roof.pause -= dt; else roof.scroll += 14 * dt;
    let santaY = gy - 30;
    roof.houses.forEach((hs) => {
      let x = hs.x - (roof.scroll % roof.len);
      if (x < -hs.w - 4) x += roof.len;
      const top = gy - hs.h;
      ctx.fillStyle = hs.wall;
      ctx.fillRect(q(x), top, hs.w, hs.h);
      ctx.fillStyle = "#f6ecd6";
      ctx.fillRect(q(x) - 1, top - 2, hs.w + 2, 2);
      ctx.fillStyle = "#ffcf6b";
      ctx.fillRect(q(x) + 4, top + 4, 4, 3);
      ctx.fillRect(q(x) + hs.w - 9, top + 4, 4, 3);
      const cx = q(x) + hs.chim;
      ctx.fillStyle = "#8e1f26";
      ctx.fillRect(cx, top - 7, 5, 5);
      ctx.fillStyle = "#f6ecd6";
      ctx.fillRect(cx - 1, top - 8, 7, 1);
      if (santaX >= x && santaX < x + hs.w) santaY = top - 13;
      // Deliver a present when Santa reaches a chimney.
      if (Math.abs(cx + 2 - (santaX + 4)) < 1 && roof.pause <= 0 && roof.dropAt !== hs.x) {
        roof.pause = 1.1;
        roof.dropAt = hs.x;
        roof.gift = { t: 0, x0: santaX + 6, y0: santaY + 6, x1: cx + 1, y1: top - 8 };
      }
    });
    const walk = roof.pause > 0 ? 0 : Math.floor(t * 6) % 2;
    drawGrid(walk ? SANTA_B : SANTA_A, santaX, santaY + (walk ? -1 : 0));
    if (roof.gift) {
      const g = roof.gift;
      g.t += dt * 1.8;
      const k = Math.min(1, g.t);
      drawGrid(GIFT, g.x0 + (g.x1 - g.x0) * k, g.y0 + (g.y1 - g.y0) * k - Math.sin(k * Math.PI) * 9);
      if (g.t >= 1) { burst(g.x1 + 1, g.y1 - 1, "#d8c9a8", 7); burst(g.x1 + 1, g.y1, "#f2c14e", 4); roof.gift = null; }
    }
  }

  // ---------- scene 3: sledding hill ----------
  function sledding(t) {
    const gy = H - 5;
    // Hill from top right down to bottom left.
    ctx.fillStyle = "#f6ecd6";
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(W * 0.15, gy);
    ctx.lineTo(W, gy - 22);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    drawGrid(TREE, W - 14, gy - 29);
    drawGrid(TREE, W * 0.62, gy - 21);
    drawGrid(SNOWMAN, 6, gy - 11);
    const period = 3.2, p = (t % period) / period;
    const ease = p * p;                                   // speeds up as it goes downhill
    const x = W - 14 - ease * (W * 0.82);
    const slope = 22 / (W * 0.85);
    const y = gy - 22 + (W - 14 - x) * slope - 7;
    drawGrid(KID_SLED, x, Math.min(gy - 7, y), kidB, true);
    if (Math.random() < 0.6) parts.push({ x: x + 8, y: Math.min(gy - 1, y + 7), vx: 10 + Math.random() * 20, vy: -10 - Math.random() * 15, life: 0.35, c: "#ffffff" });
  }

  const SCENES = [snowballFight, santaRooftops, sledding];

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000;
    sky(t);
    SCENES[kind](t, dt);
    particles(dt);
    snowfall(dt);
    raf = requestAnimationFrame(frame);
  }

  function play(n) {
    canvas = document.getElementById("scene");
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stop();
    kind = ((n % SCENES.length) + SCENES.length) % SCENES.length;
    resize();
    parts = [];
    sbState = { cycle: -1 };
    roof = null;
    t0 = last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() { cancelAnimationFrame(raf); raf = 0; }

  window.addEventListener("resize", () => { if (raf && canvas) resize(); });
  window.Scene = { play, stop };
})();
