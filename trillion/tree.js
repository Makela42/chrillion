/*
  Trillion portfolio: one share certificate per finished daily run, rarity by score.
  window.AdventTree.render(el, [{day, kind}], {newDay, compact}) ; .kindFor(points)
  (The old "advent tree" API name is kept so game.js can stay generic.)
  Certificates are drawn as stacked SVG cards: Common, Blue Chip, Growth, Unicorn, Trillion.
*/
(() => {
  "use strict";

  const KINDS = ["common", "bluechip", "growth", "unicorn", "trillion"];
  const NAMES = { common: "Common", bluechip: "Blue Chip", growth: "Growth", unicorn: "Unicorn", trillion: "Trillion" };
  const COLORS = { common: "#7d858c", bluechip: "#2b4f9a", growth: "#14804f", unicorn: "#7b3fa0", trillion: "#c8921a" };
  const RARE_FROM = 3; // unicorn and up count as "rare"
  let uid = 0;

  function kindFor(points) {
    const p = Number(points) || 0;
    if (p >= 560) return "trillion";
    if (p >= 420) return "unicorn";
    if (p >= 280) return "growth";
    if (p >= 150) return "bluechip";
    return "common";
  }

  const pad = (n) => String(Math.max(0, n | 0)).padStart(6, "0");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const CSS = `
.tr-wrap{width:100%}
.tr-svg{display:block;width:100%;height:auto;overflow:visible}
.tr-cap{margin-top:6px;font:500 13px var(--font-mono,ui-monospace,monospace);letter-spacing:.02em;color:var(--muted,#5b6a60);text-align:center}
.tr-cap b{color:var(--ink,#1b2a24)}
.tr-legend{display:flex;flex-wrap:wrap;gap:4px 12px;justify-content:center;margin-top:8px;font:600 12px var(--font-body,sans-serif);color:var(--muted,#5b6a60)}
.tr-legend span{display:inline-flex;align-items:center;gap:5px}
.tr-legend i{width:10px;height:10px;border-radius:2px;display:inline-block}
.tr-cert{transition:transform .3s ease}
.tr-new{animation:tr-drop .8s cubic-bezier(.2,1.2,.4,1) both}
.tr-shine{animation:tr-shine 3.2s ease-in-out infinite}
@keyframes tr-drop{0%{transform:translateY(-70px) rotate(-6deg);opacity:0}60%{opacity:1}100%{transform:none;opacity:1}}
@keyframes tr-shine{0%,100%{opacity:.15}50%{opacity:.55}}
@media (prefers-reduced-motion:reduce){.tr-new,.tr-shine{animation:none}}
`;
  function injectCss() {
    if (document.getElementById("tree-css")) return;
    const s = document.createElement("style");
    s.id = "tree-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function defs(p) {
    let rose = "";
    for (let a = 0; a < 180; a += 12) rose += `<ellipse cx="0" cy="0" rx="13" ry="4.6" transform="rotate(${a})"/>`;
    return `<defs>
      <linearGradient id="${p}paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf3dc"/><stop offset="1" stop-color="#eadcb8"/></linearGradient>
      <linearGradient id="${p}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#e0b030"/><stop offset="1" stop-color="#b8841a"/></linearGradient>
      <g id="${p}rose" fill="none" stroke="currentColor" stroke-width=".55" stroke-opacity=".75">${rose}<circle r="3" stroke-width=".7"/></g>
      <filter id="${p}sh" x="-10%" y="-10%" width="125%" height="135%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0a2418" flood-opacity=".35"/></filter>
    </defs>`;
  }

  // One certificate, top-left at (x, y), width w (height = w * .62)
  function cert(p, o, x, y, w, isNew, idx) {
    const h = w * 0.62, c = COLORS[o.kind] || COLORS.common, k = w / 100;
    const gold = o.kind === "trillion";
    const edge = gold ? `url(#${p}gold)` : c;
    return `<g class="tr-cert${isNew ? " tr-new" : ""}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" filter="url(#${p}sh)">
      <rect width="${w}" height="${h.toFixed(1)}" rx="${(2 * k).toFixed(1)}" fill="url(#${p}paper)"/>
      <rect x="${2.4 * k}" y="${2.4 * k}" width="${w - 4.8 * k}" height="${(h - 4.8 * k).toFixed(1)}" fill="none" stroke="${edge}" stroke-width="${(1.5 * k).toFixed(2)}"/>
      <rect x="${4.6 * k}" y="${4.6 * k}" width="${w - 9.2 * k}" height="${(h - 9.2 * k).toFixed(1)}" fill="none" stroke="${c}" stroke-width="${(0.5 * k).toFixed(2)}" stroke-opacity=".8"/>
      <g color="${c}" transform="translate(${(w * 0.2).toFixed(1)} ${(h * 0.5).toFixed(1)}) scale(${(k * 0.92).toFixed(2)})"><use href="#${p}rose"/></g>
      <text x="${(w * 0.62).toFixed(1)}" y="${(h * 0.34).toFixed(1)}" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-weight="800" font-size="${(7.4 * k).toFixed(1)}" fill="#1b2a24">TRILLION</text>
      <text x="${(w * 0.62).toFixed(1)}" y="${(h * 0.5).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="${(4.2 * k).toFixed(1)}" fill="#5b6a60">No. ${pad(o.day)}</text>
      <rect x="${(w * 0.4).toFixed(1)}" y="${(h * 0.6).toFixed(1)}" width="${(w * 0.44).toFixed(1)}" height="${(h * 0.17).toFixed(1)}" rx="${k}" fill="${edge}"/>
      <text x="${(w * 0.62).toFixed(1)}" y="${(h * 0.725).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Sans, system-ui, sans-serif" font-weight="700" font-size="${(3.9 * k).toFixed(1)}" fill="${gold ? "#4a3410" : "#fff"}">${esc((NAMES[o.kind] || "Common").toUpperCase())}</text>
      ${gold ? `<rect class="tr-shine" x="${2.4 * k}" y="${2.4 * k}" width="${w - 4.8 * k}" height="${(h - 4.8 * k).toFixed(1)}" fill="url(#${p}gold)" opacity=".2"/>` : ""}
    </g>`;
  }

  function render(el, list, opts) {
    opts = opts || {};
    injectCss();
    list = Array.isArray(list) ? list : [];
    const p = "tr" + ++uid + "_";
    const max = opts.compact ? 5 : 8;
    const shown = list.slice(-max);
    const n = shown.length;
    const compact = !!opts.compact;
    const VW = compact ? 200 : 280, VH = compact ? 128 : 178;
    const cw = compact ? 128 : 178, ch = cw * 0.62;
    let body = "";
    if (!n) {
      body = cert(p, { kind: "common", day: 0 }, (VW - cw) / 2, (VH - ch) / 2, cw, false).replace("No. 000000", "No. ------");
    } else {
      const dx = n > 1 ? (VW - cw - 4) / (n - 1) : 0, dy = n > 1 ? (VH - ch - 6) / (n - 1) : 0;
      shown.forEach((o, i) => {
        const isNew = opts.newDay && o.day === opts.newDay;
        body += cert(p, o, n > 1 ? 2 + i * dx : (VW - cw) / 2, n > 1 ? 2 + (n - 1 - i) * dy : (VH - ch) / 2, cw, isNew, i);
      });
    }
    const count = list.length;
    const rare = list.filter((o) => KINDS.indexOf(o.kind) >= RARE_FROM).length;
    const cap = count === 0
      ? "Finish a run to issue your first certificate"
      : `<b>${count}</b> certificate${count === 1 ? "" : "s"}${rare ? ` · <b>${rare}</b> rare` : ""}`;
    const tally = {};
    list.forEach((o) => { tally[o.kind] = (tally[o.kind] || 0) + 1; });
    const legend = KINDS.filter((k) => tally[k]).map((k) => `<span><i style="background:${COLORS[k]}"></i>${NAMES[k]} ${tally[k]}</span>`).join("");
    el.innerHTML = `<div class="tr-wrap${compact ? " tr-compact" : ""}"><svg class="tr-svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Portfolio of ${count} share certificates">${defs(p)}${body}</svg><div class="tr-cap">${cap}</div>` +
      (legend && !compact ? `<div class="tr-legend">${legend}</div>` : "") + `</div>`;
  }

  window.AdventTree = { render, kindFor, KINDS, NAMES };
})();
