/*
  Merrillion illustrated icons: smooth gradient SVGs that upgrade sprites.js.
  Loads after sprites.js; mutates window.Sprites (svg + hydrate). Unknown names fall back to pixel art.
*/
(() => {
  "use strict";
  const Spr = window.Sprites;
  if (!Spr) return;
  const origSvg = Spr.svg;
  let counter = 0;

  const OL = "#4a2a1c"; // warm dark outline
  const lg = (id, a, b, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const rg = (id, a, b, cx = 0.4, cy = 0.35, r = 0.75) =>
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
  const sw = (w = 2) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const hl = (d, o = 0.55) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${o}" stroke-width="2.4" stroke-linecap="round"/>`;

  const WRAPS = [
    ["#e8545a", "#b0252e"], ["#3fae6a", "#1f7340"], ["#5a9be0", "#2b64ab"], ["#f7d062", "#d39a23"], ["#a768c2", "#6e3a88"],
  ];

  function starPath(cx, cy, R, r) {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r : R;
      d += (i ? "L" : "M") + (cx + rad * Math.cos(a)).toFixed(2) + " " + (cy + rad * Math.sin(a)).toFixed(2);
    }
    return d + "Z";
  }

  const I = {
    star: (u) => `<defs>${rg(u("g"), "#fff6b8", "rgba(255,220,90,0)", 0.5, 0.5, 0.5)}${lg(u("s"), "#fff08a", "#f2a81d")}</defs>
      <circle cx="32" cy="34" r="30" fill="url(#${u("g")})"/>
      <path d="${starPath(32, 34, 26, 11.5)}" fill="url(#${u("s")})" ${sw(2.4)} stroke="#b5760f"/>
      <path d="${starPath(32, 34, 17, 7)}" fill="#fff8c4" fill-opacity=".35"/>
      ${hl("M25 24 L30 13", 0.8)}`,

    gift: (u, o) => {
      let i = 0;
      const s = o.swap;
      if (typeof o.swapIndex === "number") i = o.swapIndex;
      else if (s) { const k = Spr.GIFT_SWAPS ? Spr.GIFT_SWAPS.indexOf(s) : -1; if (k >= 0) i = k; else { const m = { "#2f8a4e": 1, "#3f7fc4": 2, "#f2c14e": 3, "#8a4fa0": 4 }[s.R]; i = m || 0; } }
      const [a, b] = WRAPS[((i % 5) + 5) % 5];
      const rib = i === 3 ? ["#e8545a", "#b0252e"] : ["#fff3b0", "#f0b93a"];
      return `<defs>${lg(u("b"), a, b, 0, 0, 1, 1)}${lg(u("r"), rib[0], rib[1])}</defs>
      <rect x="11" y="28" width="42" height="27" rx="3" fill="url(#${u("b")})" ${sw()}/>
      <rect x="27" y="28" width="10" height="27" fill="url(#${u("r")})" stroke="${OL}" stroke-width="1.4"/>
      <rect x="8" y="21" width="48" height="11" rx="3" fill="url(#${u("b")})" ${sw()}/>
      <rect x="27" y="21" width="10" height="11" fill="url(#${u("r")})" stroke="${OL}" stroke-width="1.4"/>
      <path d="M32 21 C22 20 17 9 24 8 C30 7 32 15 32 21Z M32 21 C42 20 47 9 40 8 C34 7 32 15 32 21Z" fill="url(#${u("r")})" ${sw(2)}/>
      <ellipse cx="32" cy="21" rx="4.5" ry="3.8" fill="url(#${u("r")})" ${sw(2)}/>
      ${hl("M14 34 L14 50", 0.4)}${hl("M12 24 L20 24", 0.5)}`;
    },

    tree: (u) => `<defs>${lg(u("a"), "#52b86b", "#1f7a43")}${lg(u("t"), "#9a6a3e", "#6b4425", 0, 0, 1, 0)}${lg(u("s"), "#fff08a", "#f2a81d")}</defs>
      <rect x="27" y="52" width="10" height="9" rx="1.5" fill="url(#${u("t")})" ${sw(1.8)}/>
      <path d="M32 18 L50 38 H14Z" fill="url(#${u("a")})" ${sw(2)}/>
      <path d="M32 6 L46 24 H18Z" fill="url(#${u("a")})" ${sw(2)} transform="translate(0 4)"/>
      <path d="M32 30 L55 55 H9Z" fill="url(#${u("a")})" ${sw(2)} transform="translate(0 -1)"/>
      <path d="M32 6 L45 22 H19Z" fill="url(#${u("a")})" ${sw(2)} transform="translate(0 4)"/>
      ${hl("M22 49 L31 38", 0.3)}${hl("M25 29 L31 21", 0.3)}
      <circle cx="24" cy="48" r="3.2" fill="#e8545a" ${sw(1.4)}/><circle cx="40" cy="45" r="3.2" fill="#5a9be0" ${sw(1.4)}/>
      <circle cx="32" cy="38" r="3" fill="#f7d062" ${sw(1.4)}/><circle cx="36" cy="26" r="2.6" fill="#e8545a" ${sw(1.4)}/>
      <circle cx="27" cy="27" r="2.4" fill="#f7d062" ${sw(1.4)}/>
      <path d="${starPath(32, 8, 7, 3)}" fill="url(#${u("s")})" ${sw(1.6)} stroke="#b5760f"/>`,

    snowman: (u) => `<defs>${rg(u("w"), "#ffffff", "#c9d8ea", 0.35, 0.3, 0.8)}${lg(u("h"), "#4a4a58", "#1f1f28")}</defs>
      <circle cx="32" cy="46" r="15" fill="url(#${u("w")})" ${sw(2)}/>
      <circle cx="32" cy="27" r="11.5" fill="url(#${u("w")})" ${sw(2)}/>
      <path d="M21 36 Q32 42 43 36 L44 41 Q32 47 20 41Z" fill="#e8545a" ${sw(1.8)}/>
      <path d="M38 40 L41 52 L36 51Z" fill="#c9343c" ${sw(1.6)}/>
      <rect x="19" y="18" width="26" height="4" rx="2" fill="url(#${u("h")})" ${sw(1.8)}/>
      <rect x="23" y="5" width="18" height="15" rx="2" fill="url(#${u("h")})" ${sw(1.8)}/>
      <rect x="23" y="14" width="18" height="3.5" fill="#e8545a"/>
      <circle cx="28" cy="27" r="1.7" fill="#222"/><circle cx="36" cy="27" r="1.7" fill="#222"/>
      <path d="M32 29.5 L42 32 L32 33.5Z" fill="#f08a2a" ${sw(1.2)}/>
      <circle cx="32" cy="51" r="1.8" fill="#222"/><circle cx="32" cy="57" r="1.8" fill="#222"/>
      ${hl("M22 44 Q22 52 26 56", 0.7)}`,

    sock: (u) => `<defs>${lg(u("r"), "#ea5a5f", "#b3262f", 0, 0, 1, 1)}${lg(u("c"), "#ffffff", "#dfe6ee")}</defs>
      <path d="M20 14 H42 V36 Q42 39 45 40.5 L54 45 Q60 48.5 57 55 Q53 61 46 58.5 L26 52 Q19 49.5 20 42Z" fill="url(#${u("r")})" ${sw(2.2)}/>
      <path d="M45 40.5 L54 45 Q60 48.5 57 55 Q55 58 52 59 Q57 52 52 47Z" fill="#fff" fill-opacity=".9"/>
      <path d="M20 42 Q19 49.5 26 52 L32 54 Q24 50 26 43Z" fill="#fff" fill-opacity=".9"/>
      <rect x="17" y="6" width="28" height="11" rx="5" fill="url(#${u("c")})" ${sw(2.2)}/>
      ${hl("M24 22 L24 36", 0.45)}
      <path d="M22 11 H40" stroke="#c7d0dc" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1 4"/>`,

    deer: (u) => `<defs>${rg(u("f"), "#c98d56", "#8b5a30", 0.4, 0.3, 0.85)}${rg(u("n"), "#ff7f7f", "#d12a2a")}</defs>
      <path d="M22 22 C16 14 12 10 10 4 M16 14 C11 15 8 13 6 10 M17 17 C13 21 9 21 7 19" fill="none" stroke="#6b4a2a" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M42 22 C48 14 52 10 54 4 M48 14 C53 15 56 13 58 10 M47 17 C51 21 55 21 57 19" fill="none" stroke="#6b4a2a" stroke-width="3.2" stroke-linecap="round"/>
      <ellipse cx="15" cy="30" rx="7" ry="4" transform="rotate(-25 15 30)" fill="url(#${u("f")})" ${sw(1.8)}/>
      <ellipse cx="49" cy="30" rx="7" ry="4" transform="rotate(25 49 30)" fill="url(#${u("f")})" ${sw(1.8)}/>
      <path d="M32 54 C22 54 17 46 17 36 C17 27 23 22 32 22 C41 22 47 27 47 36 C47 46 42 54 32 54Z" fill="url(#${u("f")})" ${sw(2.2)}/>
      <ellipse cx="32" cy="46" rx="9" ry="6.5" fill="#f1d4a8" fill-opacity=".85"/>
      <circle cx="26" cy="35" r="2.6" fill="#2b1d18"/><circle cx="38" cy="35" r="2.6" fill="#2b1d18"/>
      <circle cx="26.8" cy="34.2" r=".9" fill="#fff"/><circle cx="38.8" cy="34.2" r=".9" fill="#fff"/>
      <circle cx="32" cy="45" r="5" fill="url(#${u("n")})" ${sw(1.6)} stroke="#8e1f26"/>
      <circle cx="30.3" cy="43.3" r="1.4" fill="#fff" fill-opacity=".8"/>`,

    bolt: (u) => `<defs>${lg(u("r"), "#ffe27a", "#e8a21a", 0, 0, 1, 1)}</defs>
      <path d="M36 6 L14 36 H29 L25 58 L50 26 H34 Z" fill="url(#${u("r")})" ${sw(2.4)} stroke="#8a5a0a" stroke-linejoin="round"/>`,
    coal: (u) => `<defs>${lg(u("r"), "#5a5f68", "#1f2227", 0, 0, 1, 1)}</defs>
      <path d="M12 38 L20 16 L38 10 L54 24 L50 46 L30 56 Z" fill="url(#${u("r")})" ${sw(2.4)} stroke="#0e0f12" stroke-linejoin="round"/>
      <path d="M22 20 L36 15" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`,
    x: (u) => `<defs>${lg(u("r"), "#ff7a74", "#c42a34", 0, 0, 1, 1)}</defs>
      <path d="M14 14 L50 50 M50 14 L14 50" stroke="#7d1620" stroke-width="13" stroke-linecap="round"/>
      <path d="M14 14 L50 50 M50 14 L14 50" stroke="url(#${u("r")})" stroke-width="9.5" stroke-linecap="round"/>
      ${hl("M13 12 L22 21", 0.6)}${hl("M51 12 L45 18", 0.5)}`,

    clock: (u) => `<defs>${lg(u("r"), "#ff7a74", "#b3262f", 0, 0, 1, 1)}${rg(u("f"), "#ffffff", "#f1e6cf", 0.4, 0.35, 0.8)}</defs>
      <path d="M14 20 Q10 10 20 8 Q26 8 28 14Z M50 20 Q54 10 44 8 Q38 8 36 14Z" fill="#f2c14e" ${sw(1.8)}/>
      <path d="M18 54 L13 61 M46 54 L51 61" stroke="${OL}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="32" cy="35" r="23" fill="url(#${u("r")})" ${sw(2.2)}/>
      <circle cx="32" cy="35" r="17.5" fill="url(#${u("f")})" ${sw(1.6)}/>
      <path d="M32 20 V22.5 M32 47.5 V50 M17 35 H19.5 M44.5 35 H47" stroke="#6b5a4a" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M32 35 V25 M32 35 L40 39" stroke="#2b1d18" stroke-width="2.8" stroke-linecap="round"/>
      <circle cx="32" cy="35" r="2.2" fill="#c42a34"/>
      ${hl("M17 28 Q19 20 26 16", 0.7)}`,

    santa: (u) => `<defs>${lg(u("h"), "#ea5a5f", "#a82029", 0, 0, 1, 1)}${rg(u("w"), "#ffffff", "#d9e1ec", 0.4, 0.3, 0.9)}${rg(u("s"), "#ffd9b8", "#e9a77c", 0.4, 0.3, 0.8)}</defs>
      <path d="M32 54 C16 56 10 44 14 34 L50 34 C54 44 48 56 32 54Z" fill="url(#${u("w")})" ${sw(2)}/>
      <ellipse cx="32" cy="34" rx="15" ry="13" fill="url(#${u("s")})" ${sw(2)}/>
      <path d="M17 36 C18 50 26 56 32 56 C38 56 46 50 47 36 C44 42 38 44 32 44 C26 44 20 42 17 36Z" fill="url(#${u("w")})" ${sw(2)}/>
      <path d="M13 28 C12 12 22 8 34 8 C44 8 52 16 56 26 C58 30 55 34 51 33 L48 28 C40 22 24 22 17 28Z" fill="url(#${u("h")})" ${sw(2)}/>
      <rect x="12" y="25" width="40" height="9" rx="4.5" fill="url(#${u("w")})" ${sw(2)}/>
      <circle cx="55" cy="30" r="5.5" fill="url(#${u("w")})" ${sw(2)}/>
      <circle cx="26" cy="37" r="2" fill="#2b1d18"/><circle cx="38" cy="37" r="2" fill="#2b1d18"/>
      <circle cx="32" cy="41" r="3.6" fill="#e98b86" ${sw(1.4)}/>
      <path d="M22 45 Q32 40 42 45 Q32 51 22 45Z" fill="url(#${u("w")})" ${sw(1.6)}/>
      ${hl("M20 14 Q24 11 30 11", 0.5)}`,

    elf: (u) => `<defs>${lg(u("h"), "#4cc070", "#1f7a43", 0, 0, 1, 1)}${rg(u("s"), "#ffe0c4", "#eeb088", 0.4, 0.3, 0.8)}</defs>
      <path d="M13 38 L5 31 L16 32Z M51 38 L59 31 L48 32Z" fill="#f2c4a0" ${sw(1.8)}/>
      <path d="M32 58 C20 58 15 50 15 40 C15 30 22 25 32 25 C42 25 49 30 49 40 C49 50 44 58 32 58Z" fill="url(#${u("s")})" ${sw(2)}/>
      <path d="M12 32 C14 20 22 14 30 4 C34 14 38 8 56 12 C50 14 48 22 52 32 C42 26 22 26 12 32Z" fill="url(#${u("h")})" ${sw(2)}/>
      <path d="M12 32 C22 26 42 26 52 32 L51 37 C42 32 22 32 13 37Z" fill="#e8545a" ${sw(1.8)}/>
      <circle cx="57" cy="12" r="3.6" fill="#f7d062" ${sw(1.6)}/>
      <circle cx="25.5" cy="43" r="2.1" fill="#2b1d18"/><circle cx="38.5" cy="43" r="2.1" fill="#2b1d18"/>
      <circle cx="22" cy="48" r="3" fill="#ff8f8f" fill-opacity=".45"/><circle cx="42" cy="48" r="3" fill="#ff8f8f" fill-opacity=".45"/>
      <path d="M27 50 Q32 55 37 50" fill="none" stroke="#a82029" stroke-width="2" stroke-linecap="round"/>
      ${hl("M20 22 L26 15", 0.4)}`,

    cookie: (u) => `<defs>${lg(u("c"), "#d9955a", "#a8602c", 0, 0, 1, 1)}</defs>
      <path d="M32 6 C40 6 44 11 43 17 C42 21 40 23 40 24 C45 22 51 22 56 24 C60 26 59 33 54 34 L44 35 C44 40 47 48 51 55 C52 59 47 61 44 58 L32 46 L20 58 C17 61 12 59 13 55 C17 48 20 40 20 35 L10 34 C5 33 4 26 8 24 C13 22 19 22 24 24 C24 23 22 21 21 17 C20 11 24 6 32 6Z" fill="url(#${u("c")})" ${sw(2.2)} stroke="#6b3a1c"/>
      <path d="M12 28 Q8 26 10 29 M52 28 Q56 26 54 29 M17 55 L22 48 M47 55 L42 48" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="28" cy="15" r="1.8" fill="#2b1d18"/><circle cx="36" cy="15" r="1.8" fill="#2b1d18"/>
      <path d="M28 20 Q32 23 36 20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="30" r="2.6" fill="#e8545a" ${sw(1)}/><circle cx="32" cy="39" r="2.6" fill="#3fae6a" ${sw(1)}/>
      ${hl("M27 9 Q30 7 34 8", 0.5)}`,

    penguin: (u) => `<defs>${lg(u("b"), "#46506a", "#1c2233", 0, 0, 1, 1)}${rg(u("w"), "#ffffff", "#dde6f0", 0.4, 0.3, 0.8)}${lg(u("o"), "#ffb347", "#e8801f")}</defs>
      <ellipse cx="22" cy="59" rx="8" ry="3.4" fill="url(#${u("o")})" ${sw(1.6)}/><ellipse cx="42" cy="59" rx="8" ry="3.4" fill="url(#${u("o")})" ${sw(1.6)}/>
      <path d="M12 40 C6 42 5 50 9 54 C13 52 14 46 15 42Z M52 40 C58 42 59 50 55 54 C51 52 50 46 49 42Z" fill="url(#${u("b")})" ${sw(1.8)}/>
      <path d="M32 5 C44 5 50 16 50 32 C50 48 44 58 32 58 C20 58 14 48 14 32 C14 16 20 5 32 5Z" fill="url(#${u("b")})" ${sw(2.2)}/>
      <path d="M32 24 C42 22 45 34 44 44 C43 53 38 56 32 56 C26 56 21 53 20 44 C19 34 22 22 32 24Z" fill="url(#${u("w")})"/>
      <circle cx="26" cy="19" r="4.2" fill="#fff"/><circle cx="38" cy="19" r="4.2" fill="#fff"/>
      <circle cx="26.8" cy="19.5" r="2.1" fill="#111"/><circle cx="37.2" cy="19.5" r="2.1" fill="#111"/>
      <path d="M27 25 Q32 22 37 25 Q32 33 27 25Z" fill="url(#${u("o")})" ${sw(1.6)}/>
      ${hl("M19 14 Q21 9 26 8", 0.35)}`,

    flame: (u) => `<defs>${lg(u("o"), "#ffd84a", "#e8381f", 0, 0, 0, 1).replace('y1="0" x2="0" y2="1"', 'y1="0" x2="0" y2="1"')}${lg(u("i"), "#fff7b0", "#ffb52a")}</defs>
      <path d="M33 3 C34 14 46 20 48 35 C50 48 42 60 31 60 C19 60 13 50 15 40 C16 33 20 30 22 25 C23 30 26 32 28 31 C27 22 29 12 33 3Z" fill="url(#${u("o")})" ${sw(2.2)} stroke="#9c2b12"/>
      <path d="M32 29 C34 37 40 40 40 48 C40 55 36 58 31 58 C26 58 23 54 24 48 C25 42 30 38 32 29Z" fill="url(#${u("i")})"/>
      <path d="M31 46 C33 50 36 51 36 54 C36 57 34 58 31 58 C28 58 27 55 28 52 C29 50 30 48 31 46Z" fill="#fffbe0" fill-opacity=".85"/>`,

    heart: (u) => `<defs>${lg(u("r"), "#ff7683", "#c4222f", 0, 0, 1, 1)}</defs>
      <path d="M32 57 C14 44 6 34 6 23 C6 14 13 8 21 8 C26 8 30 11 32 15 C34 11 38 8 43 8 C51 8 58 14 58 23 C58 34 50 44 32 57Z" fill="url(#${u("r")})" ${sw(2.4)} stroke="#7d1620"/>
      <path d="M14 21 C14 16 18 13 22 14" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3.4" stroke-linecap="round"/>`,
  };

  Spr.svg = function (name, px, opts) {
    const f = I[name];
    if (!f) return "";
    const o = opts || {};
    const id = ++counter;
    const u = (k) => `ic${id}${k}`;
    const s = px || 24;
    const body = f(u, o);
    const flip = o.flip ? ' style="transform:scaleX(-1)"' : "";
    return `<svg class="spr${o.cls ? " " + o.cls : ""}" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"${flip}>${body}</svg>`;
  };

  // UI icons (tiles, pills, buttons) are Lucide line icons (ISC licence, lucide-static 0.469.0).
  // They inherit colour via currentColor. Tier/game art still goes through Spr.svg above.
  const LUCIDE = {
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    question: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    infinity: '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  };

  Spr.hydrate = function (root) {
    (root || document).querySelectorAll("[data-sprite]").forEach((el) => {
      const n = el.dataset.sprite, px = Number(el.dataset.size) || 24;
      el.innerHTML = LUCIDE[n]
        ? `<svg class="spr lucide" width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LUCIDE[n]}</svg>`
        : Spr.svg(n, px);
    });
  };

  Spr.illustrated = (n) => !!I[n];
  Spr.has = (n) => !!I[n];
})();
