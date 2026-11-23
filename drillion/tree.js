/*
  Drillion "Your Dental Chart": an odontogram of 32 adult teeth. Each finished daily run fills the next tooth
  with a restoration chosen by score (out of 700).
  window.AdventTree.render(el, [{day, kind}], {newDay, compact}) ; .kindFor(points)
  (The old "advent tree" API name is kept so game.js can stay generic.)
  Kinds: amalgam (<250), composite (250-399), porcelain (400-499), gold (500-599), diamond (600+).
*/
(() => {
  "use strict";

  const KINDS = ["amalgam", "composite", "porcelain", "gold", "diamond"];
  const NAMES = { amalgam: "Amalgam", composite: "Composite", porcelain: "Porcelain", gold: "Gold crown", diamond: "Diamond" };
  const COLORS = { amalgam: "#9aa6ad", composite: "#efe6c4", porcelain: "#cdbbe8", gold: "#e0a92b", diamond: "#8fd8ef" };
  const LEGACY = { common: "amalgam", bluechip: "composite", growth: "porcelain", unicorn: "gold", trillion: "diamond" };
  const RARE_FROM = 3; // gold crown and diamond count as "rare"
  const INK = "#0f3a40", GUM = "#e8818a", ENAMEL = "#fbfaf5";

  // fill order 11-18, 21-28, 31-38, 41-48
  const ORDER = [];
  [1, 2, 3, 4].forEach((q) => { for (let n = 1; n <= 8; n++) ORDER.push(q * 10 + n); });
  const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  function kindFor(points) {
    const p = Number(points) || 0;
    if (p >= 600) return "diamond";
    if (p >= 500) return "gold";
    if (p >= 400) return "porcelain";
    if (p >= 250) return "composite";
    return "amalgam";
  }
  const norm = (k) => (KINDS.indexOf(k) >= 0 ? k : LEGACY[k] || "amalgam");

  const CSS = `
.tr-wrap{width:100%}
.tr-svg{display:block;width:100%;height:auto;overflow:visible}
.tr-cap{margin-top:6px;font:500 13px var(--font-mono,ui-monospace,monospace);letter-spacing:.02em;color:var(--muted,#4d6b6e);text-align:center}
.tr-cap b{color:var(--ink,#0f3a40)}
.tr-legend{display:flex;flex-wrap:wrap;gap:4px 12px;justify-content:center;margin-top:8px;font:600 12px var(--font-body,sans-serif);color:var(--muted,#4d6b6e)}
.tr-legend span{display:inline-flex;align-items:center;gap:5px}
.tr-legend i{width:10px;height:10px;border-radius:50%;display:inline-block;border:2px solid #0f3a40;box-sizing:content-box}
.tr-new{transform-box:fill-box;transform-origin:center;animation:tr-pop .8s cubic-bezier(.2,1.4,.4,1) both}
.tr-spark{transform-box:fill-box;transform-origin:center;animation:tr-twinkle 1.6s ease-in-out infinite}
.tr-spark.b{animation-delay:.5s}
@keyframes tr-pop{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.25);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes tr-twinkle{0%,100%{transform:scale(.2) rotate(0);opacity:0}50%{transform:scale(1) rotate(45deg);opacity:1}}
@media (prefers-reduced-motion:reduce){.tr-new,.tr-spark{animation:none}.tr-spark{opacity:1;transform:none}}
`;
  function injectCss() {
    if (document.getElementById("tree-css")) return;
    const s = document.createElement("style");
    s.id = "tree-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // geometry
  const CX = 170, RX = 118, RY = 70, UCY = 90, LCY = 126;
  const ptype = (fdi) => { const n = fdi % 10; return n <= 2 ? 0 : n === 3 ? 1 : n <= 5 ? 2 : 3; };
  const TW = [11, 12, 14, 18], TH = [17, 19, 16, 15];
  const f1 = (n) => n.toFixed(1);

  function crown(w, h) {
    const hw = w / 2, r = Math.min(hw, h * 0.45);
    return `M${f1(-hw)} -3 H${f1(hw)} V${f1(h - r)} Q${f1(hw)} ${h} ${f1(hw - r)} ${h} H${f1(-hw + r)} Q${f1(-hw)} ${h} ${f1(-hw)} ${f1(h - r)} Z`;
  }

  function restoration(kind, w, h) {
    const cy = h * 0.5;
    switch (kind) {
      case "amalgam": return `<rect x="${f1(-w * 0.3)}" y="${f1(cy - 3)}" width="${f1(w * 0.6)}" height="6" rx="2.5" fill="#9aa6ad" stroke="${INK}" stroke-width="1.4"/><path d="M${f1(-w * 0.15)} ${f1(cy - 1)}h${f1(w * 0.2)}" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>`;
      case "composite": return `<rect x="${f1(-w * 0.3)}" y="${f1(cy - 3.5)}" width="${f1(w * 0.6)}" height="7" rx="3" fill="#efe6c4" stroke="${INK}" stroke-width="1.2" stroke-dasharray="2 1.6"/>`;
      case "porcelain": return `<path d="M${f1(-w / 2)} -3 H${f1(w / 2)} V${f1(h - 5)} Q${f1(w / 2)} ${h} ${f1(w / 2 - 5)} ${h} H${f1(-w / 2 + 5)} Q${f1(-w / 2)} ${h} ${f1(-w / 2)} ${f1(h - 5)}Z" fill="#e4d8f4" stroke="none"/><path d="M${f1(-w * 0.28)} 3 Q${f1(-w * 0.28)} ${f1(h * 0.4)} ${f1(-w * 0.1)} ${f1(h * 0.55)}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
      case "gold": return `<path d="${crown(w, h)}" fill="#e0a92b"/><path d="M${f1(-w * 0.25)} 2 V${f1(h * 0.6)}" stroke="#f6dc8a" stroke-width="2.2" stroke-linecap="round"/>`;
      default: return `<path d="M0 ${f1(cy - 5)} L${f1(w * 0.28)} ${f1(cy - 1)} L0 ${f1(cy + 5)} L${f1(-w * 0.28)} ${f1(cy - 1)}Z" fill="#bfeaf8" stroke="#2b6fb0" stroke-width="1.3" stroke-linejoin="round"/><path d="M${f1(-w * 0.28)} ${f1(cy - 1)}H${f1(w * 0.28)}" stroke="#2b6fb0" stroke-width="1"/>`;
    }
  }

  function arcPoint(cy, i, upper) {
    const th = (i + 0.5) / 16 * Math.PI;                 // 0..PI across the arch
    const a = upper ? Math.PI + th : Math.PI - th;       // upper: left->right over the top; lower: left->right underneath
    const x = CX + RX * Math.cos(a), y = cy + RY * Math.sin(a);
    const nx = Math.cos(a) / RX, ny = Math.sin(a) / RY, l = Math.hypot(nx, ny);
    const ux = nx / l, uy = ny / l;
    return { x, y, ux, uy, rot: Math.atan2(ux, -uy) * 180 / Math.PI };
  }

  function archPath(cy, upper) {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const th = i / 24 * Math.PI, a = upper ? Math.PI + th : Math.PI - th;
      pts.push(f1(CX + (RX + 2) * Math.cos(a)) + " " + f1(cy + (RY + 2) * Math.sin(a)));
    }
    return "M" + pts.join(" L");
  }

  function toothSvg(fdi, p, filled, labels, isNew) {
    const t = ptype(fdi), w = TW[t], h = TH[t];
    const kind = filled && filled.kind;
    let g = `<g transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.rot)})"><g${isNew ? ' class="tr-new"' : ""}>`;
    g += `<path d="${crown(w, h)}" fill="${ENAMEL}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
    if (kind) g += restoration(kind, w, h);
    if (kind === "gold") g += `<path d="${crown(w, h)}" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
    g += `</g></g>`;
    if (labels) {
      const lx = p.x - p.ux * (h + 8), ly = p.y - p.uy * (h + 8);
      g += `<text x="${f1(lx)}" y="${f1(ly + 2.2)}" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="6.5" font-weight="600" fill="#4d6b6e">${fdi}</text>`;
    }
    if (isNew) {
      const sx = p.x - p.ux * h * 0.5, sy = p.y - p.uy * h * 0.5;
      g += `<g fill="#e0a92b" stroke="${INK}" stroke-width=".8"><path class="tr-spark" d="M${f1(sx - 8)} ${f1(sy - 10)} l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6z"/><path class="tr-spark b" d="M${f1(sx + 9)} ${f1(sy + 7)} l1.2 2.6 2.6 1.2 -2.6 1.2 -1.2 2.6 -1.2 -2.6 -2.6 -1.2 2.6 -1.2z"/></g>`;
    }
    return g;
  }

  function render(el, list, opts) {
    opts = opts || {};
    injectCss();
    list = Array.isArray(list) ? list : [];
    const compact = !!opts.compact;
    const shown = list.slice(-32);
    const fill = {};
    shown.forEach((o, i) => { fill[ORDER[i]] = { kind: norm(o.kind), day: o.day }; });
    const labels = !compact;
    let body = `<path d="${archPath(UCY, true)}" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/><path d="${archPath(UCY, true)}" fill="none" stroke="${GUM}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${archPath(LCY, false)}" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/><path d="${archPath(LCY, false)}" fill="none" stroke="${GUM}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`;
    UPPER.forEach((fdi, i) => { const f = fill[fdi]; body += toothSvg(fdi, arcPoint(UCY, i, true), f, labels, !!(f && opts.newDay && f.day === opts.newDay)); });
    LOWER.forEach((fdi, i) => { const f = fill[fdi]; body += toothSvg(fdi, arcPoint(LCY, i, false), f, labels, !!(f && opts.newDay && f.day === opts.newDay)); });

    const count = list.length;
    const rare = shown.filter((o) => KINDS.indexOf(norm(o.kind)) >= RARE_FROM).length;
    const cap = count === 0
      ? "Finish a run to fill your first tooth"
      : `<b>${Math.min(count, 32)}</b> of 32 teeth restored${rare ? ` · <b>${rare}</b> rare` : ""}`;
    const tally = {};
    shown.forEach((o) => { const k = norm(o.kind); tally[k] = (tally[k] || 0) + 1; });
    const legend = KINDS.filter((k) => tally[k]).map((k) => `<span><i style="background:${COLORS[k]}"></i>${NAMES[k]} ${tally[k]}</span>`).join("");
    el.innerHTML = `<div class="tr-wrap${compact ? " tr-compact" : ""}"><svg class="tr-svg" viewBox="0 0 340 216" role="img" aria-label="Dental chart: ${Math.min(count, 32)} of 32 teeth restored">${body}</svg><div class="tr-cap">${cap}</div>` +
      (legend && !compact ? `<div class="tr-legend">${legend}</div>` : "") + `</div>`;
  }

  window.AdventTree = { render, kindFor, KINDS, NAMES };
})();
