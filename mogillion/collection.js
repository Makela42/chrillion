/*
  Mogillion Aura Cards binder: one trading card per finished daily run, rarity by points.
  window.Collection.render(el, [{day, kind}], {compact, newDay}) ; .kindFor(points) ; .title
*/
(() => {
  "use strict";

  const KINDS = ["npc", "fresh", "glow", "arc", "main", "mog"];
  const RARITY = { npc: "Common", fresh: "Uncommon", glow: "Rare", arc: "Epic", main: "Legendary", mog: "Mythic" };
  const NAMES = { npc: "NPC", fresh: "Fresh Cut", glow: "Glow Up", arc: "Gym Arc", main: "Main Character", mog: "Mog Mode" };
  const LEG_FROM = 4;
  const MAX_SHOWN = 30;

  function kindFor(points) {
    const p = Number(points) || 0;
    if (p >= 560) return "mog";
    if (p >= 420) return "main";
    if (p >= 280) return "arc";
    if (p >= 150) return "glow";
    if (p >= 50) return "fresh";
    return "npc";
  }

  // icon art in a 24x24 box; P- is the gradient prefix
  const ART = {
    npc: `<circle cx="12" cy="8.5" r="4.6" fill="url(#P-gr)" stroke="#5a626b" stroke-width=".6"/><path d="M3.5 22.5c.6-5.6 4-8 8.5-8s7.9 2.4 8.5 8Z" fill="url(#P-gr)" stroke="#5a626b" stroke-width=".6"/><path d="M9.8 8.4h.1M14.1 8.4h.1" stroke="#3a4048" stroke-width="1.2" stroke-linecap="round"/><path d="M10.4 11h3.2" stroke="#3a4048" stroke-width=".7" stroke-linecap="round"/>`,
    fresh: `<rect x="6.5" y="8" width="11" height="14.5" rx="3.2" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".6"/><rect x="5.5" y="2.5" width="13" height="5.5" rx="1" fill="#2a3037" stroke="#aab4be" stroke-width=".5"/><path d="M7.5 3v4M10 3v4M12.5 3v4M15 3v4M17 3v4" stroke="#aab4be" stroke-width=".7"/><rect x="10.3" y="11" width="3.4" height="5.5" rx="1.7" fill="#4de2f7"/><path d="M8.3 9.5v11" stroke="#fff" stroke-opacity=".7" stroke-width="1" stroke-linecap="round"/>`,
    glow: `<rect x="9" y="1.5" width="6" height="5.5" rx="2.4" fill="#2a3037" stroke="#aab4be" stroke-width=".5"/><rect x="8" y="7" width="8" height="2.6" rx=".8" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".4"/><rect x="5.5" y="9.5" width="13" height="13" rx="3.4" fill="#bff4fb" fill-opacity=".35" stroke="url(#P-ch)" stroke-width="1"/><path d="M6.6 15.5h10.8v4.3a2.4 2.4 0 0 1-2.4 2.4H9a2.4 2.4 0 0 1-2.4-2.4Z" fill="url(#P-cy)"/><path d="M8 11.5v5" stroke="#fff" stroke-opacity=".8" stroke-width="1.1" stroke-linecap="round"/>`,
    arc: `<rect x="6" y="11" width="12" height="2.2" fill="url(#P-ch)"/><rect x="2" y="7.5" width="3" height="9.2" rx="1" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".4"/><rect x="4.8" y="5" width="3.2" height="14.2" rx="1.2" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".4"/><rect x="16" y="5" width="3.2" height="14.2" rx="1.2" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".4"/><rect x="19" y="7.5" width="3" height="9.2" rx="1" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".4"/>`,
    main: `<path d="M12 .8 21 23H3Z" fill="url(#P-sp)"/><path d="M12 8.2l1.9 4 4.3.5-3.2 3 .9 4.3-3.9-2.2-3.9 2.2.9-4.3-3.2-3 4.3-.5Z" fill="url(#P-go)" stroke="#b8861a" stroke-width=".5" stroke-linejoin="round"/>`,
    mog: `<path d="M2.5 18.5 1.8 7l6 5L12 3.5 16.2 12l6-5-.7 11.5Z" fill="url(#P-go)" stroke="#b8861a" stroke-width=".6" stroke-linejoin="round"/><rect x="2.5" y="18.5" width="19" height="3.4" rx="1.2" fill="url(#P-go)" stroke="#b8861a" stroke-width=".6"/><circle cx="12" cy="15" r="1.5" fill="#4de2f7" stroke="#0b7288" stroke-width=".4"/><circle cx="6.8" cy="16" r="1" fill="#ff4d8d"/><circle cx="17.2" cy="16" r="1" fill="#ff4d8d"/><path d="M5 19.4h14" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>`,
  };

  // frame colours [light, mid, dark], plate tint, text colour
  const FRAME = {
    npc: ["#c3cad2", "#8b9299", "#4b525a", "#1d2127", "#aab2ba"],
    fresh: ["#ffffff", "#c9d2da", "#6a7480", "#1b2026", "#e8eef3"],
    glow: ["#b8f6ff", "#4de2f7", "#0b7288", "#0d2a33", "#bff4fb"],
    arc: ["#e0d0ff", "#8b5cf6", "#4a2c9a", "#1d1536", "#d9c9ff"],
    main: ["#fff3b0", "#f5c542", "#a87a14", "#2a210c", "#ffe58a"],
    mog: ["#ff9ad5", "#4de2f7", "#f5c542", "#15171d", "#ffffff"],
  };

  const CSS = `
.ac-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;font-family:var(--font-body,system-ui,sans-serif)}
.ac-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:10px 8px;width:100%;justify-items:center;perspective:700px}
.ac-card{position:relative;display:block;width:72px;height:99px;border-radius:7px;overflow:hidden;flex:none;box-shadow:0 3px 8px rgba(0,0,0,.55);transform:rotate(var(--r,0deg));backface-visibility:hidden}
.ac-card svg{display:block;width:100%;height:100%}
.ac-card .ac-day{font-family:var(--font-display,Anton,Impact,sans-serif);font-size:9px;letter-spacing:.04em}
.ac-card .ac-rar{font-family:var(--font-display,Anton,Impact,sans-serif);font-size:6.6px;letter-spacing:.14em;text-transform:uppercase}
.ac-card.k-glow{box-shadow:0 3px 8px rgba(0,0,0,.55),0 0 8px rgba(77,226,247,.45)}
.ac-card.k-arc{box-shadow:0 3px 8px rgba(0,0,0,.55),0 0 10px rgba(139,92,246,.55)}
.ac-card.k-main{box-shadow:0 3px 8px rgba(0,0,0,.55),0 0 12px rgba(245,197,66,.6)}
.ac-card.k-mog{box-shadow:0 3px 8px rgba(0,0,0,.55),0 0 14px rgba(77,226,247,.55),0 0 18px rgba(255,90,200,.35)}
.ac-card.k-fresh::before,.ac-card.k-glow::before,.ac-card.k-arc::before,.ac-card.k-main::before{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.28) 50%,transparent 60%);background-size:260% 100%;background-position:130% 0;animation:ac-glint 5s ease-in-out infinite}
.ac-card.k-main::before{animation-duration:3.6s}
.ac-card.k-mog::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;mix-blend-mode:color-dodge;opacity:.55;background:linear-gradient(115deg,#ff5ac8,#ffd24a,#5effa8,#4de2f7,#8b5cf6,#ff5ac8,#ffd24a);background-size:300% 300%;animation:ac-foil 4s linear infinite}
.ac-card.ac-new{animation:ac-flip 1.1s cubic-bezier(.2,.8,.3,1) both}
.ac-card.ac-new::before{content:"";position:absolute;inset:0;z-index:3;pointer-events:none;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.9) 50%,transparent 65%);transform:translateX(-120%);animation:ac-sweep .8s .75s ease-out forwards}
.ac-cap{font-family:var(--font-display,Anton,Impact,sans-serif);font-size:18px;letter-spacing:.04em;color:var(--page-ink,#f4f7fa);text-align:center;line-height:1.1}
.ac-cap b{color:var(--cyan,#4de2f7);font-weight:normal}
.ac-cap em{color:var(--gold,#f5c542);font-style:normal}
.ac-empty{font-family:var(--font-display,Anton,Impact,sans-serif);font-size:16px;letter-spacing:.04em;color:var(--page-muted,#98a3b0);text-align:center;padding:18px 10px;border:1px dashed rgba(255,255,255,.22);border-radius:8px;width:100%;box-sizing:border-box}
.ac-legend{display:flex;flex-wrap:wrap;gap:4px 10px;justify-content:center;font-size:12px;color:var(--page-muted,#98a3b0)}
.ac-legend span{display:inline-flex;align-items:center;gap:4px}
.ac-legend i{width:9px;height:9px;border-radius:2px;display:inline-block;flex:none}
.ac-compact{flex-direction:row;justify-content:center;gap:14px;height:110px}
.ac-compact .ac-fan{position:relative;height:100px;flex:none;perspective:700px}
.ac-compact .ac-card{position:absolute;top:6px;width:64px;height:88px;transform-origin:50% 100%}
.ac-compact .ac-cap{font-size:16px;text-align:left}
.ac-compact .ac-cap small{display:block;font-family:var(--font-body,system-ui,sans-serif);font-size:11px;letter-spacing:0;color:var(--page-muted,#98a3b0)}
@keyframes ac-glint{0%,55%{background-position:130% 0}100%{background-position:-60% 0}}
@keyframes ac-foil{0%{background-position:0 0}100%{background-position:300% 300%}}
@keyframes ac-flip{0%{transform:rotate(var(--r,0deg)) rotateY(180deg) scale(.8);opacity:0}30%{opacity:1}100%{transform:rotate(var(--r,0deg)) rotateY(0) scale(1)}}
@keyframes ac-sweep{to{transform:translateX(120%)}}
@media (prefers-reduced-motion:reduce){.ac-card,.ac-card::before,.ac-card::after{animation:none!important}.ac-card.ac-new::before{display:none}}
`;

  function injectCss() {
    if (document.getElementById("collection-css")) return;
    const s = document.createElement("style");
    s.id = "collection-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  let uid = 0;
  function defs(p) {
    const lin = (id, stops, x2, y2) => `<linearGradient id="${p}${id}" x1="0" y1="0" x2="${x2 == null ? 1 : x2}" y2="${y2 == null ? 1 : y2}">${stops.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ""}/>`).join("")}</linearGradient>`;
    let o = `<defs>`;
    o += lin("ch", [[0, "#fff"], [0.35, "#aab4be"], [0.6, "#5d6772"], [1, "#d4dce3"]]);
    o += lin("go", [[0, "#fff3b0"], [0.5, "#f5c542"], [1, "#b8861a"]]);
    o += lin("cy", [[0, "#9af0ff"], [1, "#1ea7c4"]], 0, 1);
    o += lin("gr", [[0, "#b9c0c7"], [1, "#6b737b"]]);
    o += lin("sp", [[0, "#cfefff", 0.9], [1, "#4de2f7", 0.05]], 0, 1);
    KINDS.forEach((k) => {
      const f = FRAME[k];
      o += k === "mog"
        ? lin("f" + k, [[0, "#ff9ad5"], [0.25, "#ffe27a"], [0.5, "#7dffc0"], [0.75, "#4de2f7"], [1, "#b48cff"]])
        : lin("f" + k, [[0, f[0]], [0.5, f[1]], [1, f[2]]]);
      o += `<radialGradient id="${p}p${k}" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="${k === "npc" ? "#2c3239" : f[1]}" stop-opacity="${k === "npc" ? 1 : 0.38}"/><stop offset="1" stop-color="${f[3]}"/></radialGradient>`;
    });
    return o + `</defs>`;
  }

  function cardSvg(o, p, w, h) {
    const kind = KINDS.includes(o.kind) ? o.kind : "npc";
    const f = FRAME[kind];
    const art = ART[kind].replace(/P-/g, p);
    const rays = kind === "main" || kind === "mog"
      ? `<g opacity=".35" stroke="${f[0]}" stroke-width=".7">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI; return `<path d="M${(32 - Math.cos(a) * 28).toFixed(1)},${(40 - Math.sin(a) * 28).toFixed(1)} L${(32 + Math.cos(a) * 28).toFixed(1)},${(40 + Math.sin(a) * 28).toFixed(1)}"/>`; }).join("")}</g>`
      : "";
    const stars = kind === "mog" || kind === "arc"
      ? `<path d="M10 28l1 2.4 2.4 1-2.4 1L10 35l-1-2.6-2.4-1 2.4-1ZM52 50l.8 1.8 1.8.8-1.8.8L52 55l-.8-1.6-1.8-.8 1.8-.8Z" fill="#fff" fill-opacity=".8"/>`
      : "";
    return `<svg width="${w}" height="${h}" viewBox="0 0 64 88" role="img" aria-label="Aura card #${o.day}, ${RARITY[kind]} ${NAMES[kind]}">` +
      `<rect width="64" height="88" rx="6" fill="url(#${p}f${kind})"/>` +
      `<rect x="2.6" y="2.6" width="58.8" height="82.8" rx="4.2" fill="${f[3]}"/>` +
      `<rect x="4.5" y="14" width="55" height="56" rx="3" fill="url(#${p}p${kind})" stroke="${f[1]}" stroke-opacity=".6" stroke-width=".6"/>` +
      rays + stars +
      `<g transform="translate(15 23) scale(1.46)">${art}</g>` +
      `<text class="ac-day" x="6" y="11" fill="${f[4]}">#${o.day}</text>` +
      `<circle cx="55" cy="8.5" r="2.4" fill="url(#${p}f${kind})"/>` +
      `<text class="ac-rar" x="32" y="80" text-anchor="middle" fill="${f[4]}">${RARITY[kind]}</text>` +
      `<path d="M5 15.5h54" stroke="#fff" stroke-opacity=".12" stroke-width=".6"/>` +
      `</svg>`;
  }

  function cardEl(o, p, w, h, isNew, extra) {
    const kind = KINDS.includes(o.kind) ? o.kind : "npc";
    return `<span class="ac-card k-${kind}${isNew ? " ac-new" : ""}" style="${extra || ""}" title="Day ${o.day}: ${NAMES[kind]} (${RARITY[kind]})">${cardSvg(o, p, w, h)}</span>`;
  }

  function render(el, items, opts) {
    if (!el) return;
    opts = opts || {};
    injectCss();
    const p = "ac" + ++uid + "-";
    const all = (items || []).slice().sort((a, b) => a.day - b.day);
    const count = all.length;
    const leg = all.filter((o) => KINDS.indexOf(o.kind) >= LEG_FROM).length;
    const hidden = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${defs(p)}</svg>`;

    if (opts.compact) {
      const last = all.slice(-4);
      const rots = [[-10], [-3.5, 3.5], [-7, 0, 7], [-10, -3.5, 3.5, 10]][Math.max(0, last.length - 1)] || [0];
      const step = 30, fanW = last.length ? 64 + (last.length - 1) * step + 12 : 0;
      const cards = last.map((o, i) => cardEl(o, p, 64, 88, opts.newDay != null && o.day === opts.newDay,
        `left:${6 + i * step}px;z-index:${i + 1};--r:${rots[i]}deg`)).join("");
      const cap = count === 0
        ? "Your first card drops after today's Mog Check"
        : `<b>${count}</b> card${count === 1 ? "" : "s"}${leg ? `<small>${leg} legendary+</small>` : ""}`;
      el.innerHTML = `<div class="ac-wrap ac-compact">${hidden}` +
        (count ? `<div class="ac-fan" style="width:${fanW}px">${cards}</div>` : "") +
        `<div class="ac-cap">${cap}</div></div>`;
      return;
    }

    const shown = all.slice().reverse().slice(0, MAX_SHOWN);
    const grid = shown.map((o) => cardEl(o, p, 72, 99, opts.newDay != null && o.day === opts.newDay, "")).join("");
    const cap = count === 0
      ? ""
      : `<b>${count}</b> card${count === 1 ? "" : "s"} · <em>${leg}</em> legendary+`;
    const legend = KINDS.map((k) => `<span><i style="background:linear-gradient(135deg,${FRAME[k][0]},${FRAME[k][1]},${FRAME[k][2]})"></i>${RARITY[k]}</span>`).join("");
    el.innerHTML = `<div class="ac-wrap">${hidden}` +
      (count ? `<div class="ac-grid">${grid}</div><div class="ac-cap">${cap}</div>` : `<div class="ac-empty">Your first card drops after today's Mog Check</div>`) +
      `<div class="ac-legend">${legend}</div></div>`;
  }

  window.Collection = { title: "Aura Cards", render, kindFor };
})();
