/*
  Trillion illustrated icons: engraved-style gradient SVGs (coin, bull, chart, gold bar, bag, penny, x, bell...).
  Loads after sprites.js and fills in Sprites.svg / inner / has.
*/
(() => {
  "use strict";
  const Spr = window.Sprites;
  if (!Spr) return;
  let counter = 0;

  const OL = "#1b2a24";
  const lg = (id, a, b, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const rg = (id, a, b, cx = 0.4, cy = 0.35, r = 0.75) =>
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
  const sw = (w = 2) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const hl = (d, o = 0.55) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${o}" stroke-width="2.4" stroke-linecap="round"/>`;
  const GOLD = ["#fbe28a", "#c8921a"];
  const dollar = (c = "#8a6410", w = 3.4) =>
    `<path d="M38.5 24.5 C38.5 19 25.5 19 25.5 25.5 C25.5 31.5 38.5 31.5 38.5 38.5 C38.5 45.5 25.5 45.5 25.5 39.5 M32 15.5 V48.5" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

  function starPath(cx, cy, R, r) {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r : R;
      d += (i ? "L" : "M") + (cx + rad * Math.cos(a)).toFixed(2) + " " + (cy + rad * Math.sin(a)).toFixed(2);
    }
    return d + "Z";
  }
  function scallop(cx, cy, r0, amp, n) {
    let d = "";
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2, rad = r0 + amp * Math.cos(a * n);
      d += (i ? "L" : "M") + (cx + rad * Math.cos(a)).toFixed(2) + " " + (cy + rad * Math.sin(a)).toFixed(2);
    }
    return d + "Z";
  }

  const I = {
    coin: (u) => `<defs>${rg(u("g"), "#fff2a8", "rgba(255,220,90,0)", 0.5, 0.5, 0.5)}${lg(u("c"), GOLD[0], GOLD[1], 0, 0, 1, 1)}</defs>
      <circle cx="32" cy="32" r="31" fill="url(#${u("g")})"/>
      <circle cx="32" cy="32" r="25" fill="url(#${u("c")})" ${sw(2.4)} stroke="#8a6410"/>
      <circle cx="32" cy="32" r="19.5" fill="none" stroke="#8a6410" stroke-width="1.4" stroke-dasharray="2 2.4"/>
      ${dollar()}${hl("M16 24 Q18 16 25 12", 0.8)}`,

    penny: (u) => `<defs>${lg(u("c"), "#f0b784", "#a8603a", 0, 0, 1, 1)}</defs>
      <ellipse cx="33" cy="52" rx="15" ry="3" fill="#1b2a24" fill-opacity=".2"/>
      <circle cx="32" cy="34" r="19" fill="url(#${u("c")})" ${sw(2.2)} stroke="#6b3a1c"/>
      <circle cx="32" cy="34" r="14.5" fill="none" stroke="#6b3a1c" stroke-opacity=".6" stroke-width="1.2"/>
      <path d="M29 28 L33 25.5 V43 M28 43 H38" fill="none" stroke="#6b3a1c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      ${hl("M19 28 Q21 21 27 18", 0.6)}`,

    bull: (u) => `<defs>${rg(u("f"), "#b57a4a", "#6e4426", 0.4, 0.3, 0.9)}${lg(u("h"), "#fffbe8", "#d9ccaa", 0, 0, 1, 1)}</defs>
      <path d="M17 27 C6 27 3 16 8 8 C10 16 16 19 22 20Z" fill="url(#${u("h")})" ${sw(2)}/>
      <path d="M47 27 C58 27 61 16 56 8 C54 16 48 19 42 20Z" fill="url(#${u("h")})" ${sw(2)}/>
      <ellipse cx="13" cy="31" rx="6.5" ry="3.4" transform="rotate(20 13 31)" fill="url(#${u("f")})" ${sw(1.8)}/>
      <ellipse cx="51" cy="31" rx="6.5" ry="3.4" transform="rotate(-20 51 31)" fill="url(#${u("f")})" ${sw(1.8)}/>
      <path d="M20 19 C27 16 37 16 44 19 C50 27 48 40 43 48 C39 54 25 54 21 48 C16 40 14 27 20 19Z" fill="url(#${u("f")})" ${sw(2.2)}/>
      <path d="M26 17 Q32 22 38 17" fill="none" stroke="#3a2210" stroke-opacity=".5" stroke-width="2"/>
      <ellipse cx="32" cy="45" rx="11" ry="7.5" fill="#f2bfa6" ${sw(1.8)}/>
      <ellipse cx="28" cy="45" rx="2" ry="2.8" fill="#6e3a2a"/><ellipse cx="36" cy="45" rx="2" ry="2.8" fill="#6e3a2a"/>
      <path d="M26 52 C26 59 38 59 38 52" fill="none" stroke="#d4a017" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="25" cy="33" r="2.6" fill="#1b2a24"/><circle cx="39" cy="33" r="2.6" fill="#1b2a24"/>
      <circle cx="25.8" cy="32.2" r=".9" fill="#fff"/><circle cx="39.8" cy="32.2" r=".9" fill="#fff"/>
      <path d="M21 28 L28 30 M43 28 L36 30" stroke="#3a2210" stroke-width="2" stroke-linecap="round"/>`,

    bear: (u) => `<defs>${rg(u("f"), "#8a8f96", "#4c5259", 0.4, 0.3, 0.9)}</defs>
      <circle cx="17" cy="17" r="8" fill="url(#${u("f")})" ${sw(2)}/><circle cx="47" cy="17" r="8" fill="url(#${u("f")})" ${sw(2)}/>
      <circle cx="17" cy="17" r="3.6" fill="#c98f8f"/><circle cx="47" cy="17" r="3.6" fill="#c98f8f"/>
      <circle cx="32" cy="34" r="21" fill="url(#${u("f")})" ${sw(2.2)}/>
      <ellipse cx="32" cy="42" rx="10.5" ry="8" fill="#e3d6c0" ${sw(1.8)}/>
      <ellipse cx="32" cy="38.5" rx="4.2" ry="3" fill="#1b2a24"/>
      <path d="M32 41.5 V45 M27 46 Q32 49.5 37 46" fill="none" stroke="#1b2a24" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="24" cy="30" r="2.4" fill="#1b2a24"/><circle cx="40" cy="30" r="2.4" fill="#1b2a24"/>
      <circle cx="24.8" cy="29.2" r=".8" fill="#fff"/><circle cx="40.8" cy="29.2" r=".8" fill="#fff"/>
      <path d="M19 24 L28 27 M45 24 L36 27" stroke="#1b2a24" stroke-width="2" stroke-linecap="round"/>`,

    chart: (u) => `<defs>${lg(u("g"), "#3fcf8e", "#14804f")}${lg(u("r"), "#e8636b", "#a3262e")}</defs>
      <path d="M8 52 H58" stroke="${OL}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M17 24 V50 M32 16 V44 M47 8 V38" stroke="${OL}" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="12" y="32" width="10" height="13" rx="1.2" fill="url(#${u("r")})" ${sw(2)}/>
      <rect x="27" y="22" width="10" height="17" rx="1.2" fill="url(#${u("g")})" ${sw(2)}/>
      <rect x="42" y="12" width="10" height="20" rx="1.2" fill="url(#${u("g")})" ${sw(2)}/>
      ${hl("M30 25 V35", 0.5)}${hl("M45 15 V28", 0.5)}`,

    bar: (u) => `<defs>${lg(u("f"), "#ffe58f", "#c8921a")}${lg(u("t"), "#fff6c4", "#f1c94c")}</defs>
      <ellipse cx="32" cy="53" rx="25" ry="3.2" fill="#1b2a24" fill-opacity=".2"/>
      <path d="M13 31 L19 20 H45 L51 31Z" fill="url(#${u("t")})" ${sw(2.2)} stroke="#8a6410"/>
      <path d="M7 49 L13 31 H51 L57 49Z" fill="url(#${u("f")})" ${sw(2.2)} stroke="#8a6410"/>
      <path d="M23 36 H41 M21 42 H43" stroke="#8a6410" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/>
      ${hl("M16 29 L20 22", 0.8)}${hl("M12 46 L15 36", 0.5)}`,

    bag: (u) => `<defs>${lg(u("b"), "#d8bb84", "#9a7b46", 0, 0, 1, 1)}</defs>
      <path d="M32 21 C16 27 8 41 13 51 C18 60 46 60 51 51 C56 41 48 27 32 21Z" fill="url(#${u("b")})" ${sw(2.2)}/>
      <path d="M23 8 C27 12 37 12 41 8 L38 21 H26Z" fill="url(#${u("b")})" ${sw(2.2)}/>
      <path d="M25 18 Q32 23 39 18" fill="none" stroke="#7b2f86" stroke-width="3.6" stroke-linecap="round"/>
      <g transform="translate(0 6) scale(1 .92)">${dollar("#4a3410", 3.2)}</g>
      ${hl("M16 44 Q15 37 20 32", 0.5)}`,

    x: (u) => `<defs>${lg(u("r"), "#ec6a70", "#a3262e", 0, 0, 1, 1)}</defs>
      <path d="M15 15 L49 49 M49 15 L15 49" stroke="#5e1218" stroke-width="13" stroke-linecap="round"/>
      <path d="M15 15 L49 49 M49 15 L15 49" stroke="url(#${u("r")})" stroke-width="9.4" stroke-linecap="round"/>
      ${hl("M14 13 L22 21", 0.6)}`,

    bell: (u) => `<defs>${lg(u("g"), "#ffe9a0", "#c8921a", 0, 0, 1, 0)}</defs>
      <circle cx="32" cy="8" r="3.6" fill="none" ${sw(2.2)}/>
      <path d="M32 11 C22 11 18 21 18 31 C18 41 12 44 10 50 H54 C52 44 46 41 46 31 C46 21 42 11 32 11Z" fill="url(#${u("g")})" ${sw(2.2)} stroke="#8a6410"/>
      <path d="M12 50 H52 L53 53.5 H11Z" fill="#c8921a" ${sw(1.8)} stroke="#8a6410"/>
      <circle cx="32" cy="57" r="4.6" fill="#8a6410" ${sw(1.6)}/>
      ${hl("M24 18 Q21 26 22 36", 0.8)}`,

    briefcase: (u) => `<defs>${lg(u("b"), "#4b6cae", "#1e3566")}</defs>
      <path d="M24 18 V13 Q24 9 28 9 H36 Q40 9 40 13 V18" fill="none" ${sw(2.6)}/>
      <rect x="7" y="17" width="50" height="35" rx="5" fill="url(#${u("b")})" ${sw(2.2)}/>
      <path d="M7 32 H57" stroke="${OL}" stroke-width="2"/>
      <rect x="27" y="28" width="10" height="10" rx="2" fill="#f1c94c" ${sw(1.8)} stroke="#8a6410"/>
      ${hl("M12 22 H30", 0.4)}`,

    tophat: (u) => `<defs>${lg(u("h"), "#4a5560", "#161d22", 0, 0, 1, 0)}</defs>
      <ellipse cx="32" cy="47" rx="26" ry="8" fill="url(#${u("h")})" ${sw(2.2)}/>
      <path d="M17 47 L19 12 Q32 7 45 12 L47 47 Q32 53 17 47Z" fill="url(#${u("h")})" ${sw(2.2)}/>
      <path d="M18 38 Q32 44 46 38 L46.4 45 Q32 51 17.6 45Z" fill="#c8921a" ${sw(1.8)} stroke="#8a6410"/>
      <ellipse cx="32" cy="12" rx="13" ry="3.6" fill="#2d3740" ${sw(1.8)}/>
      ${hl("M22 18 L22 34", 0.35)}`,

    rocket: (u) => `<defs>${lg(u("b"), "#ffffff", "#c9d3dd", 0, 0, 1, 0)}${lg(u("f"), "#ffd84a", "#e8381f")}</defs>
      <path d="M32 58 C27 54 26 50 28 47 H36 C38 50 37 54 32 58Z" fill="url(#${u("f")})" ${sw(1.6)} stroke="#9c2b12"/>
      <path d="M22 40 L11 51 L13 33 L22 28Z M42 40 L53 51 L51 33 L42 28Z" fill="#a3262e" ${sw(2)}/>
      <path d="M32 5 C41 12 44 26 42 44 H22 C20 26 23 12 32 5Z" fill="url(#${u("b")})" ${sw(2.2)}/>
      <circle cx="32" cy="26" r="6" fill="#4b8fd6" ${sw(2)}/><circle cx="30" cy="24" r="1.8" fill="#fff" fill-opacity=".8"/>
      <path d="M24 44 H40" stroke="#a3262e" stroke-width="3"/>`,

    star: (u) => `<defs>${rg(u("g"), "#fff6b8", "rgba(255,220,90,0)", 0.5, 0.5, 0.5)}${lg(u("s"), "#fff08a", "#e0a01d")}</defs>
      <circle cx="32" cy="34" r="30" fill="url(#${u("g")})"/>
      <path d="${starPath(32, 34, 26, 11.5)}" fill="url(#${u("s")})" ${sw(2.4)} stroke="#8a6410"/>
      ${hl("M25 24 L30 13", 0.8)}`,

    seal: (u) => `<defs>${rg(u("w"), "#d64a58", "#7a1626", 0.4, 0.3, 0.85)}</defs>
      <path d="M22 44 L16 60 L25 55 L30 62 L34 47Z M42 44 L48 60 L39 55 L34 62 L30 47Z" fill="#a3262e" ${sw(1.8)}/>
      <path d="${scallop(32, 28, 22, 2.4, 14)}" fill="url(#${u("w")})" ${sw(2.2)} stroke="#4a0c16"/>
      <circle cx="32" cy="28" r="15" fill="none" stroke="#f3a3ab" stroke-opacity=".6" stroke-width="1.5"/>
      <path d="${starPath(32, 28, 10, 4.4)}" fill="#f6d578" stroke="#8a6410" stroke-width="1.2" stroke-linejoin="round"/>
      ${hl("M17 20 Q20 12 28 9", 0.5)}`,

    infinity: (u) => `<defs>${lg(u("g"), "#1f9d63", "#0d5a3b", 0, 0, 1, 0)}</defs>
      <path d="M32 32 C26 22 12 22 12 32 C12 42 26 42 32 32 C38 22 52 22 52 32 C52 42 38 42 32 32Z" fill="none" stroke="#06382a" stroke-width="10" stroke-linejoin="round"/>
      <path d="M32 32 C26 22 12 22 12 32 C12 42 26 42 32 32 C38 22 52 22 52 32 C52 42 38 42 32 32Z" fill="none" stroke="url(#${u("g")})" stroke-width="6.4" stroke-linejoin="round"/>`,

    calendar: (u) => `<defs>${lg(u("r"), "#2a8f66", "#0f5a3d")}</defs>
      <rect x="8" y="12" width="48" height="44" rx="5" fill="#fbf4de" ${sw(2.2)}/>
      <path d="M8 17 Q8 12 13 12 H51 Q56 12 56 17 V25 H8Z" fill="url(#${u("r")})" ${sw(2.2)}/>
      <path d="M20 6 V16 M44 6 V16" stroke="${OL}" stroke-width="3.4" stroke-linecap="round"/>
      <g fill="#1b2a24"><rect x="15" y="31" width="6" height="5" rx="1"/><rect x="29" y="31" width="6" height="5" rx="1"/><rect x="43" y="31" width="6" height="5" rx="1"/><rect x="15" y="42" width="6" height="5" rx="1"/><rect x="29" y="42" width="6" height="5" rx="1"/></g>
      <rect x="43" y="42" width="6" height="5" rx="1" fill="#d4a017"/>`,

    question: (u) => `<defs>${rg(u("c"), "#4b6cae", "#1e3566", 0.4, 0.3, 0.9)}</defs>
      <circle cx="32" cy="32" r="26" fill="url(#${u("c")})" ${sw(2.2)}/>
      <path d="M23 25 C23 15 41 15 41 25 C41 32 32 32 32 39" fill="none" stroke="#f6edd3" stroke-width="5.4" stroke-linecap="round"/>
      <circle cx="32" cy="47" r="3.4" fill="#f6edd3"/>${hl("M14 24 Q17 14 26 10", 0.4)}`,

    play: (u) => `<defs>${rg(u("c"), "#3fcf8e", "#0f6b46", 0.4, 0.3, 0.9)}</defs>
      <circle cx="32" cy="32" r="26" fill="url(#${u("c")})" ${sw(2.2)}/>
      <path d="M26 20 L46 32 L26 44Z" fill="#fbf4de" ${sw(2)}/>${hl("M14 24 Q17 14 26 10", 0.4)}`,

    people: (u) => `<defs>${lg(u("a"), "#4b6cae", "#1e3566")}${lg(u("b"), "#2a8f66", "#0f5a3d")}</defs>
      <circle cx="22" cy="22" r="9" fill="#f2c4a0" ${sw(2)}/>
      <path d="M5 54 C5 40 12 35 22 35 C32 35 39 40 39 54Z" fill="url(#${u("a")})" ${sw(2.2)}/>
      <circle cx="44" cy="25" r="7.5" fill="#e8b48e" ${sw(2)}/>
      <path d="M33 54 C33 43 38 38 44 38 C52 38 58 43 58 54Z" fill="url(#${u("b")})" ${sw(2.2)}/>`,

    flame: (u) => `<defs>${lg(u("o"), "#ffd84a", "#e8381f")}${lg(u("i"), "#fff7b0", "#ffb52a")}</defs>
      <path d="M33 3 C34 14 46 20 48 35 C50 48 42 60 31 60 C19 60 13 50 15 40 C16 33 20 30 22 25 C23 30 26 32 28 31 C27 22 29 12 33 3Z" fill="url(#${u("o")})" ${sw(2.2)} stroke="#9c2b12"/>
      <path d="M32 29 C34 37 40 40 40 48 C40 55 36 58 31 58 C26 58 23 54 24 48 C25 42 30 38 32 29Z" fill="url(#${u("i")})"/>`,

    heart: (u) => `<defs>${lg(u("r"), "#ff7683", "#c4222f", 0, 0, 1, 1)}</defs>
      <path d="M32 57 C14 44 6 34 6 23 C6 14 13 8 21 8 C26 8 30 11 32 15 C34 11 38 8 43 8 C51 8 58 14 58 23 C58 34 50 44 32 57Z" fill="url(#${u("r")})" ${sw(2.4)} stroke="#7d1620"/>
      <path d="M14 21 C14 16 18 13 22 14" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3.4" stroke-linecap="round"/>`,

    bolt: (u) => `<defs>${lg(u("g"), "#fff08a", "#e0a01d", 0, 0, 1, 1)}</defs>
      <path d="M37 4 L14 36 H29 L25 60 L50 26 H34Z" fill="url(#${u("g")})" ${sw(2.4)} stroke="#8a6410"/>${hl("M33 9 L20 30", 0.7)}`,

    broker: (u) => `<defs>${lg(u("j"), "#3b4f7d", "#16233f")}${rg(u("s"), "#ffe0c4", "#e9aa80", 0.4, 0.3, 0.9)}</defs>
      <path d="M4 62 C4 48 14 43 32 43 C50 43 60 48 60 62Z" fill="url(#${u("j")})" ${sw(2.2)}/>
      <path d="M24 43 L32 55 L40 43 L36 40 H28Z" fill="#fbf4de" ${sw(1.8)}/>
      <path d="M30 47 H34 L35.5 60 L32 63 L28.5 60Z" fill="#a3262e" ${sw(1.6)}/>
      <path d="M24 43 L19 62 M40 43 L45 62" stroke="${OL}" stroke-width="1.6" fill="none"/>
      <rect x="28" y="36" width="8" height="8" fill="#f0bd98"/>
      <ellipse cx="32" cy="24" rx="13" ry="15.5" fill="url(#${u("s")})" ${sw(2.2)}/>
      <path d="M18.5 22 C17 8 28 4 34 5 C45 5 48 14 45.5 22 C43 15 38 12 31 12 C24 12 20 16 18.5 22Z" fill="#2a2420" ${sw(2)}/>
      <circle cx="26.5" cy="25" r="2" fill="#1b2a24"/><circle cx="37.5" cy="25" r="2" fill="#1b2a24"/>
      <path d="M23 20.5 L29.5 21.8 M41 20.5 L34.5 21.8" stroke="#2a2420" stroke-width="2" stroke-linecap="round"/>
      <path d="M26.5 33 Q32 37.5 38 32" fill="none" stroke="#7b2f2f" stroke-width="2" stroke-linecap="round"/>
      <rect x="39" y="49" width="7" height="4" rx="1" fill="#f6edd3" ${sw(1.2)}/>`,
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
