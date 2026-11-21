/*
  Merrillion advent tree: one ornament per finished daily run, rarity by milestone.
  window.AdventTree.render(el, [{day, kind}], {newDay, compact}) ; .kindFor(points)
*/
(() => {
  "use strict";

  const PAL = (window.Sprites && window.Sprites.PAL) || {
    R: "#c8323a", r: "#8e1f26", G: "#2f8a4e", g: "#1d5c33", Y: "#f2c14e", y: "#c08a22",
    W: "#f6ecd6", w: "#d8c9a8", B: "#8a5a36", b: "#5e3a20", K: "#2b1d18", U: "#6fa8d6", u: "#3f6f9c",
  };

  const KINDS = ["plain", "candy", "ginger", "snow", "deer", "santa"];
  const NAMES = { plain: "Bauble", candy: "Candy Cane", ginger: "Gingerbread", snow: "Snowman", deer: "Reindeer", santa: "Santa" };
  const RARE_FROM = 3; // snow and up count as "rare"

  // 7x6 pixel grids
  const GRID = {
    plain: ["...y...", "..RRR..", ".RWRRR.", ".RWRRR.", ".RRRRr.", "..rrr.."],
    candy: ["...y...", "..RWR..", ".RWRWR.", ".WRWRW.", ".RWRWR.", "..WRW.."],
    ginger: ["...y...", "..BBB..", ".BKBKB.", ".BBBBB.", ".BWWWB.", "..BBB.."],
    snow: ["...y...", "..WWU..", ".WWWUU.", ".WWUUU.", ".UUUuu.", "..uuu.."],
    deer: ["...K...", "..YYY..", ".YWYYY.", ".YWYYy.", ".YYYyy.", "..yyy.."],
    santa: ["..YYY..", ".YWYYY.", "YYYWYYY", ".YYYYY.", ".YY.YY.", "..Y.Y.."],
  };
  const GRID_SANTA_BALL = ["...y...", "..YYY..", ".YWYYY.", ".YYWYY.", ".YYYYy.", "..yyy.."];

  function pixels(kind) {
    const g = kind === "santa" ? GRID.santa : GRID[kind] || GRID.plain;
    let out = "";
    g.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const c = row[x];
        if (c !== ".") out += `<rect x="${x}" y="${y}" width="1.04" height="1.04" fill="${PAL[c]}"/>`;
      }
    });
    return out;
  }
  const PIX = {};
  KINDS.forEach((k) => (PIX[k] = pixels(k)));
  // santa: ball with a star above it for a "star-bauble" look
  PIX.santa = GRID_SANTA_BALL.map((row, y) => {
    let o = "";
    for (let x = 0; x < row.length; x++) if (row[x] !== ".") o += `<rect x="${x}" y="${y}" width="1.04" height="1.04" fill="${PAL[row[x]]}"/>`;
    return o;
  }).join("") + `<rect x="3" y="2.6" width="1" height="1" fill="#fffbe0"/>`;

  function kindFor(points) {
    const p = Number(points) || 0;
    if (p >= 560) return "santa";
    if (p >= 420) return "deer";
    if (p >= 280) return "snow";
    if (p >= 150) return "ginger";
    if (p >= 50) return "candy";
    return "plain";
  }

  // ---- geometry (viewBox 0 0 160 190, centre x = 80) ----
  const CX = 80;
  const TIERS = [
    { ax: 22, by: 68, hw: 30 },
    { ax: 44, by: 108, hw: 44 },
    { ax: 70, by: 148, hw: 60 },
  ];
  const ROWS = [1, 2, 2, 3, 4, 4, 5, 5, 6, 6];
  const hwAt = (y) => {
    let m = 0;
    TIERS.forEach((t) => { if (y >= t.ax && y <= t.by) m = Math.max(m, ((y - t.ax) / (t.by - t.ax)) * t.hw); });
    return m;
  };
  const SLOTS = [];
  ROWS.forEach((c, i) => {
    const y = 48 + i * 10.5;
    const w = Math.max(hwAt(y) - 9, 4);
    for (let k = 0; k < c; k++) {
      const x = c === 1 ? CX : CX - w + (2 * w * k) / (c - 1);
      SLOTS.push({ x: +x.toFixed(1), y: +y.toFixed(1) });
    }
  });
  const N = SLOTS.length;
  const ORDER = []; // scattered fill order so an early tree already looks balanced
  for (let i = 0; i < N; i++) ORDER.push((i * 15 + 3) % N);

  const LIGHT_COLORS = ["#ff6b5a", "#ffd86b", "#7fd0ff", "#fff3c9"];
  function lights() {
    let out = "", n = 0;
    TIERS.forEach((t) => {
      const yb = t.by - 7, hw = t.hw * 0.78;
      for (let k = 0; k < 7; k++) {
        const f = k / 6;
        const x = CX - hw + 2 * hw * f;
        const y = yb - 5 * Math.sin(Math.PI * f) + (1 - Math.abs(f - 0.5) * 2) * 0;
        out += `<circle class="tr-l" style="animation-delay:${(n * 0.37) % 2.4}s" cx="${x.toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="1.15" fill="${LIGHT_COLORS[n % 4]}"/>`;
        n++;
      }
    });
    return out;
  }

  const CSS = `
.tr-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}
.tr-svg{width:min(100%,300px);height:auto;display:block;overflow:visible;shape-rendering:crispEdges}
.tr-wrap.tr-compact .tr-svg{width:min(100%,170px)}
.tr-l{animation:tr-twinkle 2.4s ease-in-out infinite;opacity:.55}
@keyframes tr-twinkle{0%,100%{opacity:.25}50%{opacity:1}}
.tr-star-on{animation:tr-glow 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes tr-glow{0%,100%{filter:drop-shadow(0 0 2px #f2c14e)}50%{filter:drop-shadow(0 0 6px #ffe08a)}}
.tr-santa{animation:tr-shimmer 1.8s ease-in-out infinite}
@keyframes tr-shimmer{0%,100%{filter:drop-shadow(0 0 1px #ffd45c) brightness(1)}50%{filter:drop-shadow(0 0 3.5px #fff0a8) brightness(1.2)}}
.tr-pop{transform-box:fill-box;transform-origin:center;animation:tr-pop .9s cubic-bezier(.3,1.6,.5,1) both}
@keyframes tr-pop{0%{transform:translateY(-26px) scale(0);opacity:0}45%{opacity:1}65%{transform:translateY(0) scale(1.7)}82%{transform:translateY(-3px) scale(.9)}100%{transform:none}}
.tr-spark{transform-box:fill-box;transform-origin:center;animation:tr-spark .9s .35s ease-out both}
@keyframes tr-spark{0%{opacity:0;transform:translate(0,0) scale(.3)}25%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1)}}
.tr-cap{font-family:var(--font-display,"Jersey 15",Impact,sans-serif);font-size:22px;line-height:1;color:var(--ink,#2b1d18);letter-spacing:.02em;text-align:center}
.tr-cap b{color:var(--red,#c8323a);font-weight:normal}
.tr-compact .tr-cap{font-size:18px}
.tr-legend{display:flex;flex-wrap:wrap;gap:4px 10px;justify-content:center;font-family:var(--font-body,system-ui,sans-serif);font-size:12px;color:var(--muted,#6e5a4c)}
.tr-legend span{display:inline-flex;align-items:center;gap:4px}
.tr-legend svg{width:14px;height:13px;shape-rendering:crispEdges}
@media (prefers-reduced-motion:reduce){.tr-l,.tr-star-on,.tr-santa,.tr-pop,.tr-spark{animation:none!important}.tr-l{opacity:.8}.tr-spark{display:none}}
`;

  function injectCss() {
    if (document.getElementById("tree-css")) return;
    const s = document.createElement("style");
    s.id = "tree-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  const ornament = (kind, x, y, cls, extra) =>
    `<g transform="translate(${(x - 6.3).toFixed(1)} ${(y - 5.4).toFixed(1)}) scale(1.8)"><g class="${cls || ""}">${PIX[kind] || PIX.plain}</g></g>${extra || ""}`;

  function sparkBurst(x, y) {
    let o = "";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, d = 13;
      o += `<rect class="tr-spark" style="--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px" x="${x - 0.8}" y="${y - 0.8}" width="1.6" height="1.6" fill="${i % 2 ? "#fff3c9" : "#ffd45c"}"/>`;
    }
    return o;
  }

  function render(el, ornaments, opts) {
    if (!el) return;
    opts = opts || {};
    injectCss();
    const list = (ornaments || []).slice().sort((a, b) => a.day - b.day).slice(0, N);
    const count = list.length;
    const starOn = count >= 7;

    let slotsSvg = "", filled = "", burst = "";
    const used = new Set();
    list.forEach((o, i) => {
      const s = SLOTS[ORDER[i]];
      used.add(ORDER[i]);
      const kind = KINDS.includes(o.kind) ? o.kind : "plain";
      const isNew = opts.newDay != null && o.day === opts.newDay;
      const cls = (isNew ? "tr-pop " : "") + (kind === "santa" ? "tr-santa" : "");
      filled += `<g><title>Day ${o.day}: ${NAMES[kind]}</title>${ornament(kind, s.x, s.y, cls)}</g>`;
      if (isNew) burst += sparkBurst(s.x, s.y);
    });
    SLOTS.forEach((s, i) => {
      if (!used.has(i)) slotsSvg += `<circle cx="${s.x}" cy="${s.y}" r="1.25" fill="#f6ecd6" fill-opacity=".22"/>`;
    });

    const tiers = TIERS.map((t, i) =>
      `<polygon points="${CX},${t.ax} ${CX - t.hw},${t.by} ${CX + t.hw},${t.by}" fill="${PAL.G}" stroke="${PAL.g}" stroke-width="1.6" stroke-linejoin="miter"/>` +
      `<polygon points="${CX},${t.ax + 6} ${CX - t.hw + 6},${t.by - 1} ${CX - 6},${t.by - 1}" fill="#3a9a5a" fill-opacity=".55"/>` +
      `<rect x="${CX - t.hw}" y="${t.by - 3}" width="${t.hw * 2}" height="3" fill="${PAL.g}"/>`
    ).join("");

    const star = `<g class="${starOn ? "tr-star-on" : ""}" transform="translate(${CX - 9} 6) scale(1.5)">` +
      `<polygon points="6,0 7.6,4.2 12,4.4 8.6,7.2 9.8,11.6 6,9.2 2.2,11.6 3.4,7.2 0,4.4 4.4,4.2" fill="${starOn ? "#ffd45c" : "#7d8a6c"}" stroke="${starOn ? "#c08a22" : "#4f5a45"}" stroke-width=".8"/></g>`;

    const svg = `<svg class="tr-svg" viewBox="0 0 160 190" role="img" aria-label="Advent tree with ${count} ornaments">` +
      `<ellipse cx="${CX}" cy="178" rx="46" ry="5" fill="#2b1d18" fill-opacity=".18"/>` +
      `<rect x="${CX - 8}" y="146" width="16" height="16" fill="${PAL.B}"/><rect x="${CX - 8}" y="146" width="4" height="16" fill="${PAL.b}" fill-opacity=".6"/>` +
      tiers + lights() + slotsSvg + filled + burst + star +
      `<rect x="${CX - 19}" y="160" width="38" height="17" fill="${PAL.R}"/><rect x="${CX - 21}" y="158" width="42" height="5" fill="${PAL.Y}"/>` +
      `<rect x="${CX - 19}" y="172" width="38" height="5" fill="${PAL.r}"/><rect x="${CX - 14}" y="166" width="3" height="3" fill="${PAL.Y}"/><rect x="${CX + 2}" y="166" width="3" height="3" fill="${PAL.Y}"/>` +
      `</svg>`;

    const rare = list.filter((o) => KINDS.indexOf(o.kind) >= RARE_FROM).length;
    const cap = count === 0
      ? "Finish a run to earn your first ornament"
      : `<b>${count}</b> ornament${count === 1 ? "" : "s"}${rare ? ` · <b>${rare}</b> rare` : ""}`;

    const tally = {};
    list.forEach((o) => { tally[o.kind] = (tally[o.kind] || 0) + 1; });
    const legend = KINDS.filter((k) => tally[k]).map((k) =>
      `<span><svg viewBox="0 0 7 6">${PIX[k]}</svg>${compactName(k, opts)} ${tally[k]}</span>`).join("");

    el.innerHTML = `<div class="tr-wrap${opts.compact ? " tr-compact" : ""}">${svg}<div class="tr-cap">${cap}</div>` +
      (legend && !opts.compact ? `<div class="tr-legend">${legend}</div>` : "") + `</div>`;
  }

  function compactName(k) { return NAMES[k]; }

  window.AdventTree = { render, kindFor };
})();
