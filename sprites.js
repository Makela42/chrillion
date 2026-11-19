/*
  Chrillion art: one hand-drawn pixel sprite set (the "knitted sweater" look).
  Every icon, tier mark, avatar and animation uses these, so the art style stays consistent.
*/
(() => {
  "use strict";

  const PAL = {
    R: "#c8323a", r: "#8e1f26", G: "#2f8a4e", g: "#1d5c33", Y: "#f2c14e", y: "#c08a22",
    W: "#f6ecd6", w: "#d8c9a8", B: "#8a5a36", b: "#5e3a20", K: "#2b1d18", P: "#f1c19c",
    O: "#d9823b", U: "#6fa8d6", u: "#3f6f9c", X: "#4a3b36", x: "#6d5d57",
  };

  const S = {
    star: [
      ".....YY.....", ".....YY.....", "....YYYY....", "YYYYYYYYYYYY", ".YYYYYYYYYY.", "..YYYYYYYY..",
      "...YYYYYY...", "...YYYYYY...", "..YYYyyYYY..", "..YYy..yYY..", ".YYy....yYY.", ".Yy......yY.",
    ],
    gift: [
      "...YY..YY...", "..Y..YY..Y..", "...YYYYYY...", "RRRRRYYRRRRR", "RRRRRYYRRRRR", "rrrrrYYrrrrr",
      ".RRRRYYRRRR.", ".RRRRYYRRRR.", ".YYYYYYYYYY.", ".RRRRYYRRRR.", ".RRRRYYRRRR.", ".rrrrYYrrrr.",
    ],
    tree: [
      ".....YY.....", ".....GG.....", "....GGGG....", "...GGRGGG...", "....GgGG....", "...GGGGYG...",
      "..GRGGgGGG..", "...GgGGGG...", "..GGGGYGgG..", ".GGYGgGGRGG.", "GGgGGGGGgGGG", ".....BB.....",
    ],
    snowman: [
      "...KKKKKK...", "...KKKKKK...", "..KKKKKKKK..", "...WWWWWW...", "...WKWWKW...", "...WWOOWW...",
      "...RRRRRR...", "..WWWKKWWW..", "..WWWWWWWW..", "..WWWKKWWW..", "..WWWWWWWW..", "...wwwwww...",
    ],
    sock: [
      "..WWWWWWW...", "..wwwwwww...", "..RRRRRRR...", "..RWRRRWR...", "..RRRRRRR...", "..RRRRRRR...",
      "..RRRRRRRR..", "..RRRRRRRRRR", "...RRRRRRRRR", "....WWWRRRRR", ".....WWWWWW.", "............",
    ],
    deer: [
      ".b.b....b.b.", ".bbb....bbb.", "..b.b..b.b..", "...bbBBbb...", "....BBBB....", "...BBBBBB...",
      "..wBKBBKBw..", "...BBBBBB...", "....BBBB....", "....BwwB....", "....BRRB....", ".....RR.....",
    ],
    x: [
      "............", ".RR......RR.", ".RrR....RrR.", "..RrR..RrR..", "...RrRRrR...", "....RrrR....",
      "....RrrR....", "...RrRRrR...", "..RrR..RrR..", ".RrR....RrR.", ".RR......RR.", "............",
    ],
    clock: [
      "...wwwwww...", "..wWWWWWWw..", ".wWWWKWWWWw.", "wWWWWKWWWWWw", "wWWWWKWWWWWw", "wWWWWKKKWWWw",
      "wWWWWWWWWWWw", "wWWWWWWWWWWw", ".wWWWWWWWWw.", "..wWWWWWWw..", "...wwwwww...", "....R..R....",
    ],
    flame: [
      ".....Y......", "....YY......", "....YYY.....", "...YYOY..Y..", "...YOOYYYY..", "..YOOOOYOY..",
      "..YOOROOOY..", ".YOORRROOY..", ".YORRRRROY..", ".YORRRRROY..", "..YORRROY...", "...YYYYY....",
    ],
    coal: [
      "............", "............", "....XXXX....", "..XXxXXXXX..", ".XXXXXXxXXX.", ".XxXXXXXXXX.",
      "XXXXXxXXXXXX", ".XXXXXXXXXx.", "..XXXXXXXX..", "....XXXX....", "............", "............",
    ],
    infinity: [
      "............", "............", "............", ".YYY....YYY.", "Y...Y..Y...Y", "Y....YY....Y",
      "Y....YY....Y", "Y...Y..Y...Y", ".YYY....YYY.", "............", "............", "............",
    ],
    calendar: [
      "..K......K..", ".RRRRRRRRRR.", ".RRRRRRRRRR.", ".WWWWWWWWWW.", ".WKWWKWWKWW.", ".WWWWWWWWWW.",
      ".WKWWKWWKWW.", ".WWWWWWWWWW.", ".WKWWKWWRWW.", ".WWWWWWWWWW.", ".wwwwwwwwww.", "............",
    ],
    chart: [
      "............", ".........GG.", ".........GG.", ".....YY..GG.", ".....YY..GG.", ".RR..YY..GG.",
      ".RR..YY..GG.", ".RR..YY..GG.", ".RR..YY..GG.", ".RR..YY..GG.", "KKKKKKKKKKKK", "............",
    ],
    question: [
      "...YYYYYY...", "..YY....YY..", "..YY....YY..", "........YY..", ".......YY...", "......YY....",
      ".....YY.....", ".....YY.....", "............", ".....YY.....", ".....YY.....", "............",
    ],
    play: [
      "............", "...W........", "...WW.......", "...WWW......", "...WWWW.....", "...WWWWW....",
      "...WWWWW....", "...WWWW.....", "...WWW......", "...WW.......", "...W........", "............",
    ],
    people: [
      "............", "...WW...ww..", "..WWWW.wwww.", "..WWWW.wwww.", "...WW...ww..", "............",
      ".WWWWWW.ww..", "WWWWWWWWwwww", "WWWWWWWWwwww", "WWWWWWWWwwww", "............", "............",
    ],
    bolt: [
      ".......YY...", "......YY....", ".....YY.....", "....YY......", "...YYYYYY...", "......YY....",
      ".....YY.....", "....YY......", "...YY.......", "..Y.........", "............", "............",
    ],
    santa: [
      "....RRRR....", "...RRRRRRW..", "..RRRRRRRRWW", ".WWWWWWWWW..", ".WWWWWWWWW..", "..PPPPPPPP..",
      "..PKPPPPKP..", "..PPPPPPPP..", ".WWPPRRPPWW.", ".WWWWWWWWWW.", "..WWWWWWWW..", "....WWWW....",
    ],
    elf: [
      "......GGY...", ".....GGG....", "....GGGG....", "...GGGGGG...", "..RRRRRRRR..", "..PPPPPPPP..",
      ".PPKPPPPKPP.", "..PPPPPPPP..", "..PPPRRPPP..", "...PPPPPP...", "....GGGG....", "...GGGGGG...",
    ],
    cookie: [
      "....OOOO....", "...OOOOOO...", "...OWOOWO...", "...OOOOOO...", "....OWWO....", ".OOOOOOOOOO.",
      "OOOOOWOOOOOO", "....OOOO....", "....OWOO....", "...OOOOOO...", "..OOO..OOO..", "..OO....OO..",
    ],
    penguin: [
      "....KKKK....", "...KKKKKK...", "...KWKKWK...", "...KKYYKK...", "..KKWWWWKK..", "..KWWWWWWK..",
      ".KKWWWWWWKK.", ".KKWWWWWWKK.", "..KWWWWWWK..", "..KWWWWWWK..", "...KWWWWK...", "...YY..YY...",
    ],
    heart: [
      "............", "..RR....RR..", ".RRRR..RRRR.", "RRWRRRRRRRRR", "RWRRRRRRRRRR", "RRRRRRRRRRRR",
      ".RRRRRRRRRR.", "..RRRRRRRR..", "...RRRRRR...", "....RRRR....", ".....RR.....", "............",
    ],
    sleigh: [
      "...............RRR....", "..............RRRRW...", "..............PPPP....", ".............RRRRRR...",
      "Y...........RRRRRRR...", "YY.RRRRRRRRRRRRRRRRRR.", ".Y.RYYYYYYYYYYYYYYYYR.", "..YYrrrrrrrrrrrrrrrr..",
      "....rrrrrrrrrrrrrrr...", ".....Y..........Y.....", "YYYYYYYYYYYYYYYYYYYY..",
    ],
    reindeer: [
      ".b..b...........", ".bbbb...........", "..bb............", ".BKB............", "RBBBB...........",
      "..BBBBBBBBBBB...", "...BBBBBBBBBBBB.", "...BBBBBBBBBBBBw", "...BB.BB...BB.B.", "...B...B...B...B",
      "..B...B...B...B.", "................",
    ],
  };

  const TIER_SPRITE = { miracle: "star", t75: "gift", t50: "tree", t25: "snowman", trap: "sock", t10: "deer", miss: "x", timeout: "clock" };
  const AVATARS = ["santa", "elf", "deer", "snowman", "tree", "cookie", "penguin", "star", "gift", "sock"];
  const GIFT_SWAPS = [{}, { R: "#2f8a4e", r: "#1d5c33" }, { R: "#3f7fc4", r: "#2b5f99", Y: "#f6ecd6" }, { R: "#f2c14e", r: "#c08a22", Y: "#c8323a" }];

  // Turn a sprite into merged horizontal runs: [{x, y, w, c}]
  const runCache = new Map();
  function runs(name, swap) {
    const ck = name + JSON.stringify(swap || {});
    if (runCache.has(ck)) return runCache.get(ck);
    const rows = S[name] || S.x;
    const out = [];
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        if (ch === ".") { x++; continue; }
        let w = 1;
        while (row[x + w] === ch) w++;
        out.push({ x, y, w, c: (swap && swap[ch]) || PAL[ch] || "#000" });
        x += w;
      }
    });
    const res = { w: rows[0].length, h: rows.length, runs: out };
    runCache.set(ck, res);
    return res;
  }

  function rects(name, ox, oy, cell, swap, flip) {
    const sp = runs(name, swap);
    return sp.runs.map((r) => {
      const x = flip ? sp.w - r.x - r.w : r.x;
      return `<rect x="${ox + x * cell}" y="${oy + r.y * cell}" width="${r.w * cell}" height="${cell}" fill="${r.c}"/>`;
    }).join("");
  }

  function svg(name, px, opts) {
    const o = opts || {};
    const sp = runs(name, o.swap);
    const h = px || 24;
    const w = (h * sp.w) / sp.h;
    return `<svg class="spr${o.cls ? " " + o.cls : ""}" width="${w}" height="${h}" viewBox="0 0 ${sp.w} ${sp.h}" shape-rendering="crispEdges" aria-hidden="true">${rects(name, 0, 0, 1, o.swap, o.flip)}</svg>`;
  }

  function hydrate(root) {
    (root || document).querySelectorAll("[data-sprite]").forEach((el) => {
      el.innerHTML = svg(el.dataset.sprite, Number(el.dataset.size) || 24);
    });
  }

  // ------------------------------------------------------------------
  // The knitted Fair Isle hero panel, drawn stitch by stitch on a canvas.
  // ------------------------------------------------------------------
  const COLS = 60;
  function band(tile, rowsCount, fg, bg) {
    const out = [];
    for (let y = 0; y < rowsCount; y++) {
      let row = "";
      for (let x = 0; x < COLS; x++) { const ch = tile[y][x % tile[y].length]; row += ch === "." ? bg : fg[ch] || ch; }
      out.push(row);
    }
    return out;
  }
  function solid(ch, n) { return Array.from({ length: n }, () => ch.repeat(COLS)); }

  function heroGrid() {
    const zig = ["W.....", ".W...W", "..W.W.", "...W.."];
    const zagUp = zig.slice().reverse();
    const trees = ["....G.....", "...GGG....", "..GGGGG...", "...GGG....", "..GGGGG...", ".GGGGGGG..", "....B....."];
    const flakes = [".W.W....", "..W.....", ".W.W...."];
    const grid = [];
    grid.push(...solid("r", 2));
    grid.push(...band(zig, 4, { W: "W" }, "r"));
    grid.push(...solid("r", 1));
    grid.push(...band(trees, 7, { G: "G", B: "B" }, "W"));
    grid.push(...solid("r", 1));
    // Two reindeer facing a star.
    const deer = S.reindeer, star = S.star;
    const motif = [];
    for (let y = 0; y < 14; y++) {
      const row = new Array(COLS).fill("r");
      const dy = y - 1;
      if (dy >= 0 && dy < deer.length) {
        for (let x = 0; x < 16; x++) {
          if (deer[dy][15 - x] !== ".") row[4 + x] = "W";       // left deer, facing right
          if (deer[dy][x] !== ".") row[44 + x] = "W";           // right deer, facing left
        }
      }
      if (dy >= 0 && dy < star.length) for (let x = 0; x < 12; x++) if (star[dy][x] !== ".") row[24 + x] = "Y";
      motif.push(row.join(""));
    }
    grid.push(...motif);
    grid.push(...band(flakes, 3, { W: "W" }, "r"));
    grid.push(...band(zagUp, 4, { W: "W" }, "r"));
    grid.push(...solid("r", 2));
    return grid;
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  }

  function drawKnit(canvas, grid) {
    const g = grid || heroGrid();
    const cols = g[0].length, rowsN = g.length;
    const wCss = canvas.clientWidth || 360;
    const s = wCss / cols;
    const rh = s * 0.82;
    const hCss = rh * rowsN;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(wCss * dpr);
    canvas.height = Math.round(hCss * dpr);
    canvas.style.height = hCss + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let y = 0; y < rowsN; y++) {
      for (let x = 0; x < cols; x++) {
        const col = PAL[g[y][x]] || PAL.r;
        const px = x * s, py = y * rh;
        ctx.fillStyle = shade(col, -55);
        ctx.fillRect(px, py, s + 0.5, rh + 0.5);
        // Each stitch is a little "V": two slanted loops.
        [[0.3, -0.38], [0.7, 0.38]].forEach(([cx, rot]) => {
          ctx.beginPath();
          ctx.ellipse(px + s * cx, py + rh * 0.52, s * 0.25, rh * 0.62, rot, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(px + s * cx - s * 0.05 * Math.sign(rot), py + rh * 0.38, s * 0.08, rh * 0.22, rot, 0, Math.PI * 2);
          ctx.fillStyle = shade(col, 28);
          ctx.fill();
        });
      }
    }
  }

  window.Sprites = { svg, rects, runs, hydrate, drawKnit, TIER_SPRITE, AVATARS, GIFT_SWAPS, PAL, has: (n) => !!S[n] };
})();
