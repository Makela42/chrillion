/*
  Drillion icons: flat clinical vector illustrations with 2px ink outlines (Molly the Molar, teeth, chair, crown, mirror...).
  Loads after sprites.js and fills in Sprites.svg / inner / has.
*/
(() => {
  "use strict";
  const Spr = window.Sprites;
  if (!Spr) return;
  let counter = 0;

  const INK = "#0f3a40", ENAMEL = "#fbfaf5", MINT = "#bfe8d9", DMINT = "#2f9d83", PINK = "#e8818a", CORAL = "#ef5a4c",
    GOLD = "#e0a92b", SILVER = "#9aa6ad", PURPLE = "#6b3fa0", BLUE = "#2b6fb0";
  const st = (w = 2) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const P = (d, fill, w = 2) => `<path d="${d}" fill="${fill}" ${st(w)}/>`;
  const L = (d, w = 2, c = INK) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const C = (x, y, r, fill, w = 2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${w ? st(w) : ""}/>`;
  const R = (x, y, w, h, rx, fill, sw = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${st(sw)}/>`;
  const shine = (d) => L(d, 2.4, "#fff");

  function spark(cx, cy, r, fill = "#fff6c2") {
    const k = r * 0.28;
    return `<path d="M${cx} ${cy - r}Q${cx + k} ${cy - k} ${cx + r} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + r}Q${cx - k} ${cy + k} ${cx - r} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - r}Z" fill="${fill}" ${st(1.6)}/>`;
  }
  function starPath(cx, cy, Ro, ri) {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? ri : Ro;
      d += (i ? "L" : "M") + (cx + rad * Math.cos(a)).toFixed(2) + " " + (cy + rad * Math.sin(a)).toFixed(2);
    }
    return d + "Z";
  }

  // Molar silhouette (crown with two roots) in a 64 box.
  const TOOTH = "M20 9C26 7 29 11 32 11C35 11 38 7 44 9C52 12 52 22 49 30C47 37 47 46 44 53C42 58 38 57 37 51C36 46 34 42 32 42C30 42 28 46 27 51C26 57 22 58 20 53C17 46 17 37 15 30C12 22 12 12 20 9Z";
  const tooth = (fill = ENAMEL, extra = "") => P(TOOTH, fill) + shine("M19 15Q17 21 18 26") + extra;

  const face = (cx, cy, s = 1) =>
    C(cx - 6 * s, cy, 1.9 * s, INK, 0) + C(cx + 6 * s, cy, 1.9 * s, INK, 0) +
    C(cx - 5.4 * s, cy - 0.7 * s, 0.6 * s, "#fff", 0) + C(cx + 6.6 * s, cy - 0.7 * s, 0.6 * s, "#fff", 0) +
    `<ellipse cx="${cx - 10 * s}" cy="${cy + 4.5 * s}" rx="${3 * s}" ry="${2 * s}" fill="${PINK}"/><ellipse cx="${cx + 10 * s}" cy="${cy + 4.5 * s}" rx="${3 * s}" ry="${2 * s}" fill="${PINK}"/>` +
    L(`M${cx - 3.6 * s} ${cy + 3.5 * s}Q${cx} ${cy + 8 * s} ${cx + 3.6 * s} ${cy + 3.5 * s}`, 1.8);

  const brushShape = (rot = "") => `<g ${rot}>
      ${R(8, 28, 40, 8, 4, MINT)}${R(44, 22, 12, 20, 3, ENAMEL)}
      ${L("M47 22V16M51 22V14M55 22V16M47 42V48M51 42V50M55 42V48", 3, BLUE)}
      ${L("M14 32H36", 1.6, DMINT)}</g>`;

  const I = {
    tooth: () => tooth(ENAMEL, face(32, 25)),

    // Molly the Molar: mascot holding a toothbrush
    broker: () => `
      ${P("M23 46C20 53 21 58 25 58C28 58 29 54 30 49Z", ENAMEL)}${P("M41 46C44 53 43 58 39 58C36 58 35 54 34 49Z", ENAMEL)}
      ${P("M18 8C24 5 28 9 32 9C36 9 40 5 46 8C55 12 55 25 51 34C49 41 48 47 43 49C38 50 35 47 32 47C29 47 26 50 21 49C16 47 15 41 13 34C9 25 9 12 18 8Z", ENAMEL)}
      ${shine("M17 14Q14 20 15 26")}
      ${L("M14 36Q8 34 8 29", 2.4)}
      ${L("M50 37Q55 33 53 26", 2.4)}
      <g transform="rotate(-24 53 24)">${R(51, 8, 4.4, 30, 2, MINT)}${R(48.6, 4, 9.2, 8, 2, BLUE, 1.6)}</g>
      ${face(32, 27)}`,

    miracle: () => `${tooth(GOLD, "")}
      ${P(TOOTH, "none", 2)}${L("M25 15L32 22L39 15M32 22V38", 1.5, "#8a6410")}
      ${shine("M19 15Q17 21 18 26")}${spark(50, 10, 8)}${spark(11, 40, 5)}${spark(54, 38, 4)}`,

    prof: () => `${tooth(ENAMEL, face(32, 32, 0.9))}
      ${P("M32 3L56 12L32 21L8 12Z", INK)}${P("M20 16V23C26 27 38 27 44 23V16L32 21Z", "#264f55", 1.6)}
      ${L("M52 13V24", 2, GOLD)}${C(52, 26, 2.6, GOLD, 1.4)}`,

    mirror: () => `
      <g transform="rotate(35 32 32)">
      ${R(29, 28, 6, 30, 3, SILVER)}${L("M32 33V54", 1.6, "#fff")}
      ${C(32, 17, 13, MINT)}${C(32, 17, 9, "#e9f8f2", 1.4)}${shine("M25 14Q26 10 30 9")}</g>
      ${spark(52, 12, 7)}`,

    brush: () => `<g transform="rotate(-35 32 32)">
      ${R(4, 28, 40, 9, 4.5, MINT)}${R(40, 21, 17, 22, 3, ENAMEL)}
      ${L("M44 21V13M50 21V11M56 21V13M44 43V51M50 43V53M56 43V51", 3, BLUE)}
      ${L("M10 32.5H32", 1.6, DMINT)}</g>${spark(13, 14, 6)}`,

    cracked: () => `${tooth("#f2ecd6", face(32, 25))}
      ${L("M34 9L29 19L36 25L30 34L35 42", 2.6, INK)}
      ${L("M34 9L29 19L36 25L30 34L35 42", 1, CORAL)}
      ${L("M44 30L49 27M45 36L51 38", 2)}`,

    floss: () => `
      ${R(12, 22, 34, 32, 7, ENAMEL)}${R(17, 17, 24, 10, 3, MINT)}
      ${L("M17 36H41M17 41H41M17 46H41", 1.8, DMINT)}
      ${L("M46 28C54 28 56 18 50 12C46 8 40 12 44 16", 2.4, "#6fcfb3")}${L("M46 28C54 28 56 18 50 12", 1, ENAMEL)}`,

    chair: () => `
      ${P("M14 6C10 6 8 10 8 14V34H18V14C18 9 17 6 14 6Z", MINT)}
      ${P("M8 34H46C52 34 56 38 56 42V44H8Z", DMINT)}
      ${R(8, 44, 48, 5, 2, ENAMEL)}${L("M26 49V56M18 56H34", 3)}
      ${R(40, 12, 16, 7, 3.5, SILVER)}${L("M48 19V30", 2.4)}${C(48, 31, 2.4, CORAL, 1.6)}`,

    chart: () => `
      ${R(8, 8, 48, 48, 6, ENAMEL)}
      ${P("M14 20C14 15 19 14 22 16C25 14 30 15 30 20C30 24 28 28 27 32C26 35 24 33 22 30C20 33 18 35 17 32C16 28 14 24 14 20Z", ENAMEL, 1.6)}
      ${C(21, 20, 1.6, CORAL, 0)}${C(40, 20, 4, MINT, 1.6)}${C(50, 20, 4, CORAL, 1.6)}
      ${C(40, 31, 4, GOLD, 1.6)}${C(50, 31, 4, MINT, 1.6)}
      ${L("M14 44H50M14 50H38", 2, DMINT)}`,

    bar: () => I.brush(),
    bag: () => I.cracked(),
    penny: () => I.floss(),
    coin: () => I.miracle(),
    bull: () => I.chair(),

    x: () => `${C(32, 32, 26, CORAL)}${L("M22 22L42 42M42 22L22 42", 6, "#fff")}${L("M22 22L42 42M42 22L22 42", 2.2)}`,

    clock: () => `${C(32, 33, 24, ENAMEL)}${C(32, 33, 18, MINT, 1.4)}
      ${L("M32 21V33L40 38", 3.2)}${R(27, 4, 10, 6, 2, SILVER)}${L("M50 13L55 8", 3)}`,

    bell: () => `${P("M32 8C21 8 17 17 17 28C17 37 13 41 11 45H53C51 41 47 37 47 28C47 17 43 8 32 8Z", GOLD)}
      ${C(32, 53, 5, CORAL)}${C(32, 7, 3, GOLD, 1.8)}${shine("M22 18Q20 24 21 30")}`,

    briefcase: () => `${R(8, 20, 48, 34, 6, BLUE)}${L("M24 20V14C24 11 26 10 29 10H35C38 10 40 11 40 14V20", 2.4)}
      ${L("M8 34H56", 2)}${R(28, 31, 8, 7, 2, GOLD, 1.6)}`,

    tophat: () => I.prof(),

    rocket: () => `${P("M32 5C42 12 44 28 40 44H24C20 28 22 12 32 5Z", ENAMEL)}${C(32, 24, 5, MINT)}
      ${P("M24 36L14 46L24 44Z", CORAL)}${P("M40 36L50 46L40 44Z", CORAL)}${P("M28 44H36L32 58Z", GOLD, 1.8)}`,

    star: () => `${P(starPath(32, 33, 27, 12), GOLD)}${shine("M22 22L28 17")}`,

    // gold crown badge
    seal: () => `${P("M10 44L8 18L22 30L32 12L42 30L56 18L54 44Z", GOLD)}
      ${R(10, 44, 44, 9, 3, "#f6c94e")}${C(8, 17, 3, ENAMEL, 1.6)}${C(32, 11, 3, ENAMEL, 1.6)}${C(56, 17, 3, ENAMEL, 1.6)}
      ${C(32, 48.5, 2.2, CORAL, 1.2)}${C(21, 48.5, 2, MINT, 1.2)}${C(43, 48.5, 2, MINT, 1.2)}${shine("M16 28L17 38")}`,
    crown: () => I.seal(),

    infinity: () => `${L("M32 32C26 22 12 22 12 32C12 42 26 42 32 32C38 22 52 22 52 32C52 42 38 42 32 32Z", 11, INK)}${L("M32 32C26 22 12 22 12 32C12 42 26 42 32 32C38 22 52 22 52 32C52 42 38 42 32 32Z", 6.5, MINT)}`,

    calendar: () => `${R(8, 12, 48, 44, 6, ENAMEL)}${P("M8 18C8 14 10 12 14 12H50C54 12 56 14 56 18V26H8Z", DMINT)}
      ${L("M20 6V16M44 6V16", 3.4)}${C(20, 38, 3, MINT, 1.4)}${C(32, 38, 3, MINT, 1.4)}${C(44, 38, 3, CORAL, 1.4)}${C(20, 48, 3, MINT, 1.4)}${C(32, 48, 3, MINT, 1.4)}`,

    question: () => `${C(32, 32, 26, PURPLE)}${L("M23 26C23 15 41 15 41 26C41 33 32 33 32 41", 5.2, "#fff")}${L("M23 26C23 15 41 15 41 26C41 33 32 33 32 41", 1.4, INK)}${C(32, 49, 3.4, "#fff", 1.4)}`,

    play: () => `${C(32, 32, 27, DMINT)}${P("M26 19L46 32L26 45Z", ENAMEL)}`,

    people: () => `${C(22, 22, 8, MINT)}${P("M7 52C7 40 13 35 22 35C31 35 37 40 37 52Z", BLUE)}
      ${C(43, 24, 7, ENAMEL)}${P("M32 52C32 41 37 37 43 37C51 37 57 41 57 52Z", DMINT)}`,

    flame: () => `${P("M32 4C34 16 50 22 50 40C50 52 42 58 32 58C22 58 14 52 14 40C14 31 20 28 22 20C27 24 28 30 29 32C33 24 30 14 32 4Z", CORAL)}
      ${P("M32 32C35 38 41 40 40 47C39 53 35 55 32 55C28 55 24 52 24 47C24 41 30 39 32 32Z", "#ffd36a", 1.8)}`,

    heart: () => `${P("M32 56C12 42 6 32 6 22C6 14 12 8 19 8C25 8 29 11 32 16C35 11 39 8 45 8C52 8 58 14 58 22C58 32 52 42 32 56Z", CORAL)}${shine("M14 19Q15 14 20 13")}`,

    bolt: () => `${P("M36 4L12 36H28L24 60L52 24H35Z", GOLD)}`,
  };

  function build(name, o) {
    const f = I[name];
    if (!f) return null;
    const id = ++counter;
    return f((k) => `ic${id}${k}`, o || {});
  }

  Spr.svg = function (name, px, opts) {
    const o = opts || {};
    const body = build(name in I ? name : "x", o);
    const s = px || 24;
    const cls = "spr" + (o.cls ? " " + o.cls : "") + (o.dim ? " spr-dim" : "");
    const style = (o.flip ? "transform:scaleX(-1);" : "") + (o.dim ? "opacity:.28;filter:grayscale(1);" : "");
    return `<svg class="${cls}" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"${style ? ` style="${style}"` : ""}>${body}</svg>`;
  };
  // A nested <svg> for use inside another SVG (e.g. the result charts).
  Spr.inner = function (name, x, y, size) {
    return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 64 64">${build(name in I ? name : "x")}</svg>`;
  };
  Spr.has = (n) => !!I[n];
  Spr.illustrated = Spr.has;
  Spr.hydrate = function (root) {
    (root || document).querySelectorAll("[data-sprite]").forEach((el) => {
      el.innerHTML = Spr.svg(el.dataset.sprite, Number(el.dataset.size) || 24);
    });
  };
})();
