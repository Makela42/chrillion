/*
  Mogillion art: one hand-drawn pixel sprite set (chrome, graphite and ice-cyan with gold for the top tier).
  Every icon, tier mark, avatar and animation uses these, so the art style stays consistent.
  Old Christmas sprite keys (gift, tree, santa...) still exist as themed aliases so nothing referencing them breaks.
*/
(() => {
  "use strict";

  const PAL = {
    K: "#0b0c0f", X: "#23262c", x: "#3a3f48",                   // black, graphite, lighter graphite
    S: "#d3dae2", s: "#8c97a4", W: "#ffffff", w: "#b9c2cc",     // chrome, dark chrome, white, soft white
    C: "#4de2f7", c: "#1796b0",                                  // ice cyan, deep cyan
    Y: "#f5c542", y: "#b8861a", O: "#ee8a2e",                    // gold, dark gold, orange
    R: "#ff4d5e", r: "#a62836",                                  // hot red (misses only), dark red
    P: "#e8b793", p: "#b4805f", Q: "#f6d5bb",                    // skin, shade, highlight
    G: "#38d39a", g: "#1c8a63", U: "#4a8fe8", u: "#2d5fa6",      // mint, dark mint, blue
    B: "#8a6a4a", b: "#5a4430",                                  // brown (kept for old keys)
  };

  const S = {
    // ---- tier icons ----
    crown: [
      "............", "............", "Y....YY....Y", "YY...YY...YY", "YYY.YYYY.YYY", "YWYYYYYYYYYY",
      "YYYCYYYYCYYY", "YYYYYYYYYYYY", "yyyyyyyyyyyy", "............", "............", "............",
    ],
    diamond: [
      "............", "..CCCCCCCC..", ".CWWCCCCCCc.", "CCWCCCCCCCcc", "WWWWWWWWWWWW", ".CCCCCCCCcc.",
      "..CCCCCCcc..", "...CCCCcc...", "....CCcc....", ".....Cc.....", "............", "............",
    ],
    sparkle: [
      ".....CC.....", ".....WW.....", ".....WW.....", "....CWWC....", "..CCWWWWCC..", "CWWWWWWWWWWC",
      "CWWWWWWWWWWC", "..CCWWWWCC..", "....CWWC....", ".....WW.....", ".....WW.....", ".....CC.....",
    ],
    arm: [
      "........PPP.", ".......PPPPP", ".......PPPPP", ".......pPPPp", "......PPPPp.", ".....PPPPp..",
      "..PPQPPPPp..", ".PPQQPPPPPp.", "PPPPPPPPPpp.", "PPPPPPppp...", ".pppppp.....", "............",
    ],
    cap: [
      "............", "....RR......", "....RRRR....", "..RRRRRRRR..", ".RRRRRRRRRR.", ".RRRRWWRRRR.",
      ".RRRRRRRRRR.", ".rrrrrrrrrrr", "......SSSSSS", "......ssssss", "............", "............",
    ],
    moai: [
      "...SSSSSS...", "..SSSSSSSS..", "..SKKSSKKS..", "..SSSSSSSS..", "..SSSSsSSS..", "..SSSSsSSS..",
      "..SSSSsSSS..", "..SSKKKKSS..", "..SSSSSSSS..", "..sSSSSSSs..", "..ssssssss..", "..XXXXXXXX..",
    ],
    x: [
      "............", ".RR......RR.", ".RrR....RrR.", "..RrR..RrR..", "...RrRRrR...", "....RrrR....",
      "....RrrR....", "...RrRRrR...", "..RrR..RrR..", ".RrR....RrR.", ".RR......RR.", "............",
    ],
    clock: [
      "...ssssss...", "..sWWWWWWs..", ".sWWWKWWWWs.", "sWWWWKWWWWWs", "sWWWWKWWWWWs", "sWWWWKKKWWWs",
      "sWWWWWWWWWWs", "sWWWWWWWWWWs", ".sWWWWWWWWs.", "..sWWWWWWs..", "...ssssss...", "....R..R....",
    ],

    // ---- menu / ui icons ----
    flame: [
      ".....Y......", "....YY......", "....YYY.....", "...YYOY..Y..", "...YOOYYYY..", "..YOOOOYOY..",
      "..YOOROOOY..", ".YOORRROOY..", ".YORRRRROY..", ".YORRRRROY..", "..YORRROY...", "...YYYYY....",
    ],
    infinity: [
      "............", "............", "............", ".CCC....CCC.", "C...C..C...C", "C....CC....C",
      "C....CC....C", "C...C..C...C", ".CCC....CCC.", "............", "............", "............",
    ],
    calendar: [
      "..K......K..", ".CCCCCCCCCC.", ".CCCCCCCCCC.", ".SSSSSSSSSS.", ".SKSSKSSKSS.", ".SSSSSSSSSS.",
      ".SKSSKSSKSS.", ".SSSSSSSSSS.", ".SKSSKSSCSS.", ".SSSSSSSSSS.", ".ssssssssss.", "............",
    ],
    chart: [
      "............", ".........CC.", ".........CC.", ".....SS..CC.", ".....SS..CC.", ".ss..SS..CC.",
      ".ss..SS..CC.", ".ss..SS..CC.", ".ss..SS..CC.", ".ss..SS..CC.", "WWWWWWWWWWWW", "............",
    ],
    question: [
      "...CCCCCC...", "..CC....CC..", "..CC....CC..", "........CC..", ".......CC...", "......CC....",
      ".....CC.....", ".....CC.....", "............", ".....CC.....", ".....CC.....", "............",
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
    star: [
      ".....YY.....", ".....YY.....", "....YYYY....", "YYYYYYYYYYYY", ".YYYYYYYYYY.", "..YYYYYYYY..",
      "...YYYYYY...", "...YYYYYY...", "..YYYyyYYY..", "..YYy..yYY..", ".YYy....yYY.", ".Yy......yY.",
    ],
    heart: [
      "............", "..RR....RR..", ".RRRR..RRRR.", "RRWRRRRRRRRR", "RWRRRRRRRRRR", "RRRRRRRRRRRR",
      ".RRRRRRRRRR.", "..RRRRRRRR..", "...RRRRRR...", "....RRRR....", ".....RR.....", "............",
    ],
    // Mog Pass: a black card with gold edge and a cyan chip
    pass: [
      "............", "............", "YYYYYYYYYYYY", "YKKKKKKKKKKY", "YKCCCKKKKKKY", "YKCCCKKKKKKY",
      "YKKKKKKKKKKY", "YKWWWWKKKKKY", "YKKKKKKKKKKY", "YYYYYYYYYYYY", "............", "............",
    ],
    // ring-light mirror
    mirror: [
      "...CCCCCC...", ".CCWWWWWWCC.", ".CWSSSSSSWC.", "CWSSWSSSSSWC", "CWSWSSSSSSWC", "CWSSSSSSSSWC",
      "CWSSSSSSSSWC", ".CWSSSSSSWC.", ".CCWWWWWWCC.", "...CCCCCC...", ".....ss.....", "...ssssss...",
    ],
    coin: [
      "....YYYY....", "...YYYYYY...", "..YYyyyyYY..", ".YYyYYYYyYY.", ".YYyYyyYyYY.", ".YYyYYYYyYY.",
      ".YYyYyyYyYY.", ".YYyYYYYyYY.", "..YYyyyyYY..", "...YYYYYY...", "....yyyy....", "............",
    ],
    shard: [
      ".....CC.....", "....CWWC....", "....CWCc....", "...CWCCc....", "...CWCCCc...", "..CWCCCCc...",
      "..CWCCCCCc..", ".CWCCCCCCc..", ".CCCCCCCCcc.", "..ccCCCCcc..", "....cccc....", "............",
    ],
    coal: [
      "............", "............", "....XXXX....", "..XXxXXXXX..", ".XXXXXCXXXX.", ".XxXXXCXXXX.",
      "XXXXXXCcXXXX", ".XXXXXXcXXx.", "..XXXXXXXX..", "....XXXX....", "............", "............",
    ],

    // ---- avatars ----
    chad: [
      "...KKKKKK...", "..KKKKKKKK..", "..KPPPPPPK..", "..PPPPPPPP..", ".KWKKKKWKKK.", "..PPPPPPPP..",
      "..PPPppPPP..", "..PPPPPPPP..", "..PPPKKPPP..", "..pPPPPPPp..", "...pPPPPp...", "....pppp....",
    ],
    hoodie: [
      "...XXXXXX...", "..XXXXXXXX..", ".XXXPPPPXXX.", ".XXPPPPPPXX.", ".XXPCPPCPXX.", ".XXPPPPPPXX.",
      ".XXPPKKPPXX.", ".XXXPPPPXXX.", "XXXXXXXXXXXX", "XXXxXXXXxXXX", "XXXXXXXXXXXX", "XXXXXXXXXXXX",
    ],
    glasses: [
      "...KKKKKK...", "..KKKKKKKK..", "..KPPPPPPK..", "..PPPPPPPP..", ".SSSSPPSSSS.", ".SWWSPPSWWS.",
      ".SSSSPPSSSS.", "..PPPPPPPP..", "..PPPKKPPP..", "..PPPPPPPP..", "...pPPPPp...", "....pppp....",
    ],
    beanie: [
      "....CCCC....", "...CCCCCC...", "..CCcCCcCC..", ".CCCCCCCCCC.", ".cccccccccc.", "..PPPPPPPP..",
      "..PKPPPPKP..", "..PPPPPPPP..", "..PPPppPPP..", "..PPKKKKPP..", "...PPPPPP...", "....pppp....",
    ],
  };

  // Old keys stay valid as themed aliases.
  Object.assign(S, {
    gift: S.pass, tree: S.mirror, snowman: S.glasses, sock: S.cap, deer: S.moai, santa: S.chad,
    elf: S.hoodie, penguin: S.beanie, cookie: S.coin, reindeer: S.moai, sleigh: S.shard,
  });

  const TIER_SPRITE = { miracle: "crown", t75: "diamond", t50: "sparkle", t25: "arm", trap: "cap", t10: "moai", miss: "x", timeout: "clock" };
  const AVATARS = ["chad", "hoodie", "glasses", "beanie", "moai", "crown", "diamond", "sparkle", "arm", "cap"];
  // Colour variants for falling aura shards: default cyan, chrome, gold, white.
  const GIFT_SWAPS = [
    {},
    { C: "#d3dae2", c: "#8c97a4" },
    { C: "#f5c542", c: "#b8861a" },
    { C: "#ffffff", c: "#b9c2cc" },
  ];

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


  // ------------------------------------------------------------------
  // Vector art: one set of 24x24 icons. 2px outline, graphite fill, cyan / chrome / gold edge.
  // The pixel sprites above stay only as a fallback for canvas callers (runs).
  // ------------------------------------------------------------------
  const BASE = "#10131a";
  const C = PAL.C, CD = PAL.c, SV = PAL.S, SD = PAL.s, W = PAL.W, Y = PAL.Y, O = PAL.O, R = PAL.R;
  const P = (d, stroke, fill, extra) => `<path d="${d}" fill="${fill || BASE}" stroke="${stroke}"${extra ? " " + extra : ""}/>`;
  const L = (d, stroke, w) => `<path d="${d}" fill="none" stroke="${stroke}"${w ? ` stroke-width="${w}"` : ""}/>`;
  const D = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="none"/>`;

  // Shared face outline for the avatars.
  const FACE = "M6 10 C6 5 8.5 3 12 3 C15.5 3 18 5 18 10 V13 L14.5 20.5 H9.5 L6 13 Z";

  const V = {
    // ---- tiers ----
    crown: P("M3 18 L2.5 7 L8 11.5 L12 4 L16 11.5 L21.5 7 L21 18 Z", Y) + L("M4 21.5 H20", Y) +
      `<path d="M12 11 L13.6 13.6 L12 16.2 L10.4 13.6 Z" fill="${C}" stroke="none"/>`,
    diamond: P("M6.5 3.5 H17.5 L22 9.5 L12 21 L2 9.5 Z", C) + L("M2 9.5 H22 M9 3.5 L7.5 9.5 L12 21 L16.5 9.5 L15 3.5", C, 1.5) +
      L("M6 6.5 H8", W, 1.5),
    sparkle: P("M11 3 L13.2 9.8 L20 12 L13.2 14.2 L11 21 L8.8 14.2 L2 12 L8.8 9.8 Z", C) + D(11, 12, 1.6, W) +
      L("M19 2 V8 M16 5 H22", W, 1.5),
    arm: P("M3 21 V15 C3 12 5.5 10.5 8 11 C9.5 11.3 10.5 12.2 11.5 12.2 L12 7 C12 4.5 13 3 15.5 3 C18 3 19 4.5 19 7 V14 C19 18 17 21 13 21 Z", SV) +
      L("M12 7.2 H19", SV, 1.5) + L("M6 15.5 C6.4 14 7.6 13.6 9 14", C, 1.5),
    cap: P("M3.5 17 C3.5 9.5 8 5.5 12.5 5.5 C17 5.5 19.5 9.5 19.5 17 Z", SV) + P("M15 17.5 C16 13.8 20 13.4 23.5 16 V17.5 Z", SV) +
      L("M12.5 5.5 C10.5 9 10.5 13 11.5 17", SD, 1.5) + D(12.5, 4.4, 1.6, C),
    moai: P("M7 3 H17 L18 12 L16 14.2 L17 21 H7 L8 14.2 L6 12 Z", SV) + L("M7.6 8 H16.4", SV, 2.6) +
      L("M12 9 V14", SD, 1.5) + L("M10 17.5 H14", SD, 1.5),
    x: L("M5.5 5.5 L18.5 18.5 M18.5 5.5 L5.5 18.5", R, 2.5) + L("M2 7 V2 H7 M17 2 H22 V7 M22 17 V22 H17 M7 22 H2 V17", R, 2),
    clock: P("M12 3 A9 9 0 1 1 11.99 3 Z", SV) + L("M12 7 V12 L15.5 14", SV) + L("M12 12 L16.5 7.5", R, 1.5) +
      L("M12 3.6 V5 M20.4 12 H19 M12 20.4 V19 M3.6 12 H5", SD, 1.5),

    // ---- menu / ui ----
    play: L("M3 8 V3 H8 M16 3 H21 V8 M21 16 V21 H16 M8 21 H3 V16", C) +
      P("M8.6 9.5 C8.6 7.5 10 6.5 12 6.5 C14 6.5 15.4 7.5 15.4 9.5 V12.5 C15.4 15 14 17.5 12 17.5 C10 17.5 8.6 15 8.6 12.5 Z", SV, "none", `stroke-width="1.5"`) +
      L("M5 12 H19", C) + D(10.3, 10.4, 1, C) + D(13.7, 10.4, 1, C),
    people: P("M2 21 C2 16 5 14 8 14 C11 14 13 16 13 21 Z", SV) + P("M8 12 A3.4 3.4 0 1 1 8 5.2 A3.4 3.4 0 0 1 8 12 Z", SV) +
      P("M11.5 21 C11.5 17 14 14.5 17 14.5 C20 14.5 22 17 22 21 Z", C) + P("M17 12.5 A3 3 0 1 1 17 6.5 A3 3 0 0 1 17 12.5 Z", C),
    infinity: L("M12 12 C9.5 6.5 3 6.5 3 12 C3 17.5 9.5 17.5 12 12 C14.5 6.5 21 6.5 21 12 C21 17.5 14.5 17.5 12 12 Z", C),
    calendar: P("M3 5.5 H21 V21 H3 Z", SV) + L("M3 10 H21", SV) + L("M8 3 V7.5 M16 3 V7.5", C) +
      `<rect x="14" y="13" width="3.5" height="3.5" fill="${C}" stroke="none"/>` + L("M6.5 14.8 H9 M10.5 14.8 H11.5 M6.5 18.2 H9", SD, 1.5),
    chart: L("M3 21 H21", SV) + P("M5 20 V13 H8.5 V20", C) + P("M10.3 20 V8.5 H13.7 V20", C) + P("M15.5 20 V4 H19 V20", C),
    question: P("M12 3 A9 9 0 1 1 11.99 3 Z", C) + L("M9.3 9.6 C9.3 7.8 10.6 7 12 7 C13.6 7 14.7 8 14.7 9.4 C14.7 11.4 12 11.6 12 13.8", W, 2) + D(12, 16.8, 1.3, W),
    flame: P("M12 2.5 C13 6.5 18 8 18 14 A6 6 0 0 1 6 14 C6 11 8 10.2 8.5 8 C10.2 9 11 7 12 2.5 Z", Y) +
      `<path d="M12 12.2 C13 14 15 14.5 15 17 A3 3 0 0 1 9 17 C9 14.8 11 14.2 12 12.2 Z" fill="${O}" stroke="none"/>`,
    bolt: P("M13.5 2 L4 14 H11 L9.5 22 L20 9.5 H13 Z", Y),
    star: P("M12 2.5 L14.9 9 L22 9.6 L16.6 14.3 L18.2 21.2 L12 17.5 L5.8 21.2 L7.4 14.3 L2 9.6 L9.1 9 Z", Y),
    heart: P("M12 21 L3.5 12.5 C1 9.5 2.5 4.5 7 4.5 C9.5 4.5 11 6 12 7.5 C13 6 14.5 4.5 17 4.5 C21.5 4.5 23 9.5 20.5 12.5 Z", R, R) +
      L("M6 8.5 C6 7.4 6.8 6.8 7.9 6.8", W, 1.5),
    pass: P("M2.5 5 H21.5 V19 H2.5 Z", Y) + P("M5.5 9 H10.5 V13 H5.5 Z", C, "none", `stroke-width="1.5"`) +
      L("M5.5 16 H12", Y, 1.5) + L("M15.5 9 H19 M15.5 12 H19", SV, 1.5),
    mirror: P("M12 2.5 C16.5 2.5 19 6 19 10.2 C19 14.4 16.5 17.5 12 17.5 C7.5 17.5 5 14.4 5 10.2 C5 6 7.5 2.5 12 2.5 Z", SV) +
      L("M12 17.5 V21.5", SV, 2.5) + L("M8.5 7.5 L10.5 5.8 M8.3 10.5 L8.6 9.3", C, 1.5) + L("M10 14 C11 15 13 15 14 14", C, 1.5),
    coin: P("M12 3 A9 9 0 1 1 11.99 3 Z", Y) + P("M12 7 A5 5 0 1 1 11.99 7 Z", Y, "none", `stroke-width="1.5"`) + L("M9.8 14.6 V9.6 L12 12 L14.2 9.6 V14.6", Y, 1.5),
    shard: P("M12 2 L18 8.5 L15.2 22 H8.8 L6 8.5 Z", C) + L("M6 8.5 H18 M12 8.5 V22 M12 2 V8.5", C, 1.5),
    coal: P("M4 14 L7 7 L13 3.5 L19 8 L20 15 L15 20 L8 19 Z", SD) + L("M7 7 L11 11 L13 3.5 M11 11 L8 19 M11 11 L20 15", SD, 1.5) + D(15, 8.4, 1, C),

    // ---- avatars ----
    chad: P(FACE, SV) + `<path d="M6 10 C6 5.5 8.5 3 12 3 C15.5 3 18 5.5 18 10 C16 8 14 7 12 7 C10 7 8 8 6 10 Z" fill="${SV}" stroke="none"/>` +
      L("M8.5 11.2 L11 11.6 M15.5 11.2 L13 11.6", C) + L("M12 12.5 V15", SD, 1.5) + L("M10.5 17.5 H13.5", SD, 1.5),
    hoodie: P("M3 21.5 V13 C3 6.5 7 3 12 3 C17 3 21 6.5 21 13 V21.5", SV) +
      P("M8 12 C8 9 9.5 7.5 12 7.5 C14.5 7.5 16 9 16 12 C16 15 14 17 12 17 C10 17 8 15 8 12 Z", C, "#1d222b", `stroke-width="1.5"`) +
      D(10.3, 11.5, 1.1, C) + D(13.7, 11.5, 1.1, C) + L("M10 18.5 V21.5 M14 18.5 V21.5", SD, 1.5),
    glasses: P(FACE, SV) + P("M5 9.5 H19 V13 H13.6 L12.8 11.8 H11.2 L10.4 13 H5 Z", C, CD) + L("M7 10.8 H9 M15 10.8 H17", W, 1.5) +
      L("M10.5 17.5 H13.5", SD, 1.5),
    beanie: P("M5.5 11 C5.5 5 8 2.8 12 2.8 C16 2.8 18.5 5 18.5 11 Z", C, CD) + P("M5 9 H19 V12 H5 Z", C, C) + D(12, 2.3, 1.6, W) +
      L("M7 12 V14 L9.7 20.5 H14.3 L17 14 V12", SV) + L("M9 15 H11 M13 15 H15", C, 1.5) + L("M10.5 18 H13.5", SD, 1.5),
  };
  Object.assign(V, {
    gift: V.pass, tree: V.mirror, snowman: V.glasses, sock: V.cap, deer: V.moai, santa: V.chad,
    elf: V.hoodie, penguin: V.beanie, cookie: V.coin, reindeer: V.moai, sleigh: V.shard,
  });

  function vinner(name, swap) {
    let m = V[name];
    if (!m) return null;
    if (swap) for (const k in swap) if (PAL[k] && swap[k] !== PAL[k]) m = m.split(PAL[k]).join(swap[k]);
    return `<g fill="none" stroke-width="2" stroke-linejoin="miter" stroke-linecap="square">${m}</g>`;
  }

  // For callers that build their own SVG (chart, share card): a vector group sized like the old 12-cell pixel sprite.
  function rects(name, ox, oy, cell, swap, flip) {
    const v = vinner(name, swap);
    if (!v) return "";
    const s = cell / 2;
    return `<g transform="translate(${ox + (flip ? 24 * s : 0)} ${oy}) scale(${flip ? -s : s} ${s})">${v}</g>`;
  }

  function svg(name, px, opts) {
    const o = opts || {};
    const v = vinner(name, o.swap) || vinner("x");
    const h = px || 24;
    return `<svg class="spr${o.cls ? " " + o.cls : ""}" width="${h}" height="${h}" viewBox="0 0 24 24" aria-hidden="true">${o.flip ? `<g transform="translate(24 0) scale(-1 1)">${v}</g>` : v}</svg>`;
  }

  function hydrate(root) {
    (root || document).querySelectorAll("[data-sprite]").forEach((el) => {
      el.innerHTML = svg(el.dataset.sprite, Number(el.dataset.size) || 24);
    });
  }

  // ------------------------------------------------------------------
  // The hero: a phonk-edit side profile, backlit, with a face-scan overlay (landmarks, gonial angle,
  // canthal tilt, viewfinder brackets, scan beam). Lives in the old #hero-knit slot, so game.js keeps calling drawKnit.
  // ------------------------------------------------------------------
  // Profile facing right. Gonion G=(292,245), menton M=(372,298): the jaw reads 124 degrees against a vertical ramus.
  const HEAD_D =
    "M186 340 L200 250 C200 232 188 222 178 200 C160 165 160 110 192 72 C215 44 262 26 312 34 C350 40 372 70 378 100 " +
    "L386 124 Q389 133 377 143 L417 201 Q416 211 396 213 L394 221 Q402 227 399 233 L391 236 Q399 241 394 248 " +
    "Q384 252 386 260 Q396 272 392 282 Q388 295 372 298 L292 245 L298 340 Z";

  const DOTS = [[386, 124], [377, 143], [417, 201], [396, 213], [399, 232], [394, 248], [392, 276], [372, 298], [292, 245], [284, 180], [332, 143], [368, 146]];

  function heroSVG() {
    const dots = DOTS.map((p, i) =>
      `<g class="hs-dot" style="--d:${(i * 0.23).toFixed(2)}s"><circle class="hs-ring" cx="${p[0]}" cy="${p[1]}" r="7" fill="none" stroke="${C}" stroke-width="1"/><circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="${C}"/></g>`).join("");
    const tick = [];
    for (let y = 40; y <= 290; y += 10) tick.push(`M586 ${y} h${y % 50 === 0 ? 10 : 5}`);
    return `<svg class="hero-svg" viewBox="0 0 600 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Side profile with a face scan reading a 124 degree gonial angle and a plus 5 degree canthal tilt">
<defs>
<radialGradient id="hs-glow" cx="300" cy="150" r="270" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".22" stop-color="#9bf0ff" stop-opacity=".6"/><stop offset=".55" stop-color="${CD}" stop-opacity=".24"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<linearGradient id="hs-skin" x1="170" y1="0" x2="420" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#05070a"/><stop offset=".7" stop-color="#0c1015"/><stop offset="1" stop-color="#1b222b"/></linearGradient>
<linearGradient id="hs-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0"/><stop offset="1" stop-color="${C}" stop-opacity=".38"/></linearGradient>
<radialGradient id="hs-vig" cx="300" cy="160" r="360" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
<pattern id="hs-lines" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.2" fill="#000" opacity=".28"/></pattern>
<filter id="hs-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="hs-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.25"/></filter>
<clipPath id="hs-clip"><path d="${HEAD_D}"/></clipPath>
</defs>
<rect width="600" height="320" fill="#050709"/>
<rect width="600" height="320" fill="url(#hs-glow)"/>
<circle cx="292" cy="160" r="148" fill="none" stroke="${C}" stroke-width="16" opacity=".5" filter="url(#hs-blur)"/>
<circle cx="292" cy="160" r="148" fill="none" stroke="#f2feff" stroke-width="4"/>
<path d="${HEAD_D}" fill="none" stroke="#bff6ff" stroke-width="10" opacity=".55" filter="url(#hs-blur)"/>
<path d="${HEAD_D}" fill="url(#hs-skin)"/>
<g clip-path="url(#hs-clip)" fill="none" stroke-linecap="round">
<path d="M262 162 C249 162 246 184 256 198 C263 207 273 200 273 188" stroke="#27303a" stroke-width="2.5"/>
<path d="M240 222 C252 256 262 292 268 340" stroke="#161c23" stroke-width="3"/>
<path d="M334 130 Q356 121 384 127" stroke="#3b4550" stroke-width="3.5"/>
<path d="M334 143 Q350 135 368 146 Q350 151 334 143 Z" stroke="#d5dde5" stroke-width="1.4" fill="#05070a"/>
<path d="M404 208 Q398 206 396 211" stroke="#2c353f" stroke-width="2"/>
<path d="M391 236 L374 238" stroke="#2c353f" stroke-width="2"/>
</g>
<path d="${HEAD_D}" fill="none" stroke="#eafcff" stroke-width="2.2" stroke-linejoin="round" opacity=".92"/>
<rect width="600" height="320" fill="url(#hs-lines)"/>
<rect width="600" height="320" fill="url(#hs-vig)"/>
<rect width="600" height="320" filter="url(#hs-grain)" opacity=".16" style="mix-blend-mode:overlay"/>
<g class="hs-ov" fill="none" stroke="${C}" stroke-linecap="round" stroke-linejoin="round">
<path d="M386 70 V300" stroke-width="1" stroke-dasharray="3 5" opacity=".45"/>
<path d="M318 143 H388" stroke="#fff" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>
<path d="M322 143.6 L378 146.4" stroke-width="1.6"/>
<path d="M292 245 L284 180" stroke-width="1.6"/>
<path d="M292 245 L372 298" stroke-width="1.8"/>
<path d="M285.4 207.3 A38 38 0 0 1 321.9 265.6" stroke-width="2" stroke="#fff"/>
<path d="M24 252 L286 246" stroke-width="1" opacity=".75"/>
<path d="M376 146 L412 134 H578" stroke-width="1" opacity=".85"/>
<path d="M417 201 L392 276" stroke-width="1" stroke-dasharray="3 4" opacity=".6"/>
${dots}
</g>
<g font-family="Anton, Impact, sans-serif" fill="${C}">
<text x="24" y="242" font-size="31" letter-spacing="1.5">GONIAL <tspan fill="#fff">124°</tspan></text>
<text x="576" y="127" text-anchor="end" font-size="17" font-family="'Atkinson Hyperlegible', sans-serif" font-weight="700" letter-spacing="2">CANTHAL TILT</text>
<text x="576" y="174" text-anchor="end" font-size="42" fill="#fff">+5°</text>
</g>
<g font-family="'Atkinson Hyperlegible', sans-serif" font-weight="700" fill="${C}" letter-spacing="3">
<text x="36" y="58" font-size="18">SCANNING<tspan class="hs-d1">.</tspan><tspan class="hs-d2">.</tspan><tspan class="hs-d3">.</tspan></text>
<text x="36" y="80" font-size="13" fill="#8c97a4" letter-spacing="2">SYMMETRY 96.4  ·  FWHR 1.98</text>
<text x="36" y="298" font-size="13" fill="#8c97a4" letter-spacing="2">HUNTER EYES  YES</text>
</g>
<path d="${tick.join(" ")}" stroke="${C}" stroke-width="1" opacity=".5" fill="none"/>
<rect class="hs-beam" x="0" y="-70" width="600" height="70" fill="url(#hs-beam)"/>
<rect class="hs-beam hs-beam-line" x="0" y="-2" width="600" height="2" fill="#e9fbff"/>
<path d="M16 50 V16 H50 M550 16 H584 V50 M584 270 V304 H550 M50 304 H16 V270" fill="none" stroke="${C}" stroke-width="3"/>
</svg>`;
  }

  // Swap the old canvas for a div holding the SVG (same id + class). Safe to call any number of times.
  function drawHero(el) {
    el = el || document.getElementById("hero-knit");
    if (!el) return;
    if (el.tagName === "CANVAS") {
      const d = document.createElement("div");
      d.id = el.id;
      d.className = el.className;
      d.setAttribute("aria-hidden", "true");
      el.replaceWith(d);
      el = d;
    }
    if (!el.firstChild) el.innerHTML = heroSVG();
  }
  if (typeof document !== "undefined") drawHero();

  window.Sprites = { svg, rects, runs, hydrate, drawKnit: drawHero, drawHero, heroSVG, TIER_SPRITE, AVATARS, GIFT_SWAPS, PAL, has: (n) => !!S[n] || !!V[n] };
})();
