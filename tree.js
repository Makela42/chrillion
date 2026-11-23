/*
  Merrillion advent tree: one ornament per finished daily run, rarity by milestone.
  window.AdventTree.render(el, [{day, kind}], {newDay, compact}) ; .kindFor(points)
  Smooth illustrated SVG tree (layered fir tiers, fairy lights, glossy ornaments).
*/
(() => {
  "use strict";

  const KINDS = ["plain", "candy", "ginger", "snow", "deer", "santa"];
  const NAMES = { plain: "Red Bauble", candy: "Teardrop", ginger: "Bell", snow: "Glass Icicle", deer: "Finial", santa: "Gold Star" };
  const RARE_FROM = 3; // snow and up count as "rare"

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
  const f1 = (n) => +n.toFixed(1);
  const TIERS = [
    { ax: 20, by: 54, hw: 21 },
    { ax: 36, by: 80, hw: 31 },
    { ax: 54, by: 106, hw: 41 },
    { ax: 72, by: 132, hw: 51 },
    { ax: 90, by: 157, hw: 61 },
  ];
  const envHw = (y) => Math.max((y - 16) * 0.4, 3);

  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  // jagged, drooping tier outline + helper data
  function buildTier(t, seed) {
    const r = rng(seed);
    const n = Math.max(4, Math.round(t.hw / 6.5));
    const tips = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      tips.push({ x: CX + t.hw * (1 - 2 * f) + (i === 0 ? 1.5 : i === n ? -1.5 : (r() - 0.5) * 3), y: t.by + 2 + r() * 3.5 - (i === 0 || i === n ? 1 : 0) });
    }
    let d = `M${CX},${t.ax}`;
    const m = 6;
    for (let s = 1; s <= m; s++) {
      const f = s / m, y = t.ax + (t.by - t.ax) * f;
      d += ` L${f1(CX + t.hw * f + (s % 2 ? 1.6 : -0.4) + (r() - 0.5))},${f1(y)}`;
    }
    d += ` L${f1(tips[0].x)},${f1(tips[0].y)}`;
    for (let i = 1; i <= n; i++) {
      const a = tips[i - 1], b = tips[i];
      d += ` Q${f1((a.x + b.x) / 2 + (r() - 0.5) * 2)},${f1(t.by - 4.5 - r() * 1.5)} ${f1(b.x)},${f1(b.y)}`;
    }
    for (let s = m - 1; s >= 1; s--) {
      const f = s / m, y = t.ax + (t.by - t.ax) * f;
      d += ` L${f1(CX - t.hw * f - (s % 2 ? 1.6 : -0.4) + (r() - 0.5))},${f1(y)}`;
    }
    return { d: d + " Z", tips, r };
  }

  const TIER_DATA = TIERS.map((t, i) => buildTier(t, 7 + i * 31));

  function tierDetail(t, td, i, pf) {
    const r = rng(100 + i * 17);
    let o = "";
    // branch ribs fanning to the tips
    td.tips.forEach((tp, k) => {
      const sx = CX + (tp.x - CX) * 0.18, sy = t.ax + (t.by - t.ax) * 0.38;
      const left = tp.x < CX;
      o += `<path d="M${f1(sx)},${f1(sy)} Q${f1((sx + tp.x) / 2)},${f1(t.by - 8)} ${f1(tp.x)},${f1(tp.y - 1)}" stroke="${k % 2 ? "#0a2c18" : (left ? "#4fa468" : "#164d2b")}" stroke-opacity="${left && k % 2 === 0 ? 0.35 : 0.3}" stroke-width=".8" fill="none"/>`;
    });
    // needles
    const cnt = Math.round(t.hw * 1.7);
    for (let k = 0; k < cnt; k++) {
      const y = t.ax + 4 + r() * (t.by - t.ax);
      const w = ((y - t.ax) / (t.by - t.ax)) * t.hw;
      const x = CX + (r() * 2 - 1) * w;
      const side = x < CX ? -1 : 1;
      const dx = side * (1.3 + r() * 1.2), dy = 1.2 + r() * 1.6;
      const light = x < CX ? r() < 0.6 : r() < 0.25;
      o += `<path d="M${f1(x)},${f1(y)} l${f1(dx)},${f1(dy)}" stroke="${light ? "#6cc287" : "#0a2c18"}" stroke-opacity="${light ? 0.38 : 0.34}" stroke-width=".6" stroke-linecap="round"/>`;
    }
    // snow on branch tips
    td.tips.forEach((tp, k) => {
      if (k % 2 === 0 || r() < 0.35) {
        o += `<ellipse cx="${f1(tp.x)}" cy="${f1(tp.y - 1.4)}" rx="${f1(1.6 + r() * 1.3)}" ry="${f1(0.8 + r() * 0.4)}" fill="#fbfeff" fill-opacity=".92"/>`;
      }
    });
    // snow dusting along upper edge
    for (let k = 0; k < 4; k++) {
      const f = 0.3 + r() * 0.6, y = t.ax + (t.by - t.ax) * f, w = t.hw * f;
      const sd = r() < 0.5 ? -1 : 1;
      o += `<ellipse cx="${f1(CX + sd * (w - 2 - r() * 2))}" cy="${f1(y + 1)}" rx="${f1(1.4 + r())}" ry=".7" fill="#fff" fill-opacity=".75"/>`;
    }
    return o;
  }

  // ornament slots on the branches
  const ROWS = [1, 2, 2, 3, 4, 4, 5, 5, 6, 6];
  const SLOTS = [];
  (() => {
    const r = rng(5);
    ROWS.forEach((c, i) => {
      const y0 = 45 + i * 11.4;
      const w = Math.max(envHw(y0) - 9, 4);
      for (let k = 0; k < c; k++) {
        const base = c === 1 ? 0 : -w + (2 * w * k) / (c - 1);
        const x = CX + base + (c > 1 ? (r() - 0.5) * 3 : 0);
        const y = y0 + (k % 2 ? 2.5 : -1.5) + (r() - 0.5) * 2 + Math.abs(base) * 0.06;
        SLOTS.push({ x: f1(x), y: f1(y) });
      }
    });
  })();
  const N = SLOTS.length;
  const ORDER = [];
  for (let i = 0; i < N; i++) ORDER.push((i * 15 + 3) % N);

  // garland path (alternating swags) + light positions
  const LIGHT_COLORS = ["#ffd37a", "#ff9a6b", "#fff1c2", "#ffc24d"];
  const GARLAND = (() => {
    const ys = [40, 68, 96, 124, 151];
    let d = "", lights = [], n = 0;
    for (let k = 0; k < ys.length - 1; k++) {
      const dir = k % 2 === 0 ? -1 : 1;
      const a = { x: CX + dir * envHw(ys[k]) * 0.8, y: ys[k] };
      const b = { x: CX - dir * envHw(ys[k + 1]) * 0.8, y: ys[k + 1] };
      const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 13 };
      d += (k === 0 ? `M${f1(a.x)},${f1(a.y)}` : "") + ` Q${f1(c.x)},${f1(c.y)} ${f1(b.x)},${f1(b.y)}`;
      for (let j = 1; j <= 7; j++) {
        const t = j / 8, u = 1 - t;
        lights.push({ x: f1(u * u * a.x + 2 * u * t * c.x + t * t * b.x), y: f1(u * u * a.y + 2 * u * t * c.y + t * t * b.y), c: LIGHT_COLORS[n % 4], dl: ((n * 0.37) % 2.4).toFixed(2) });
        n++;
      }
    }
    return { d, lights };
  })();

  const CSS = `
.tr-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}
.tr-svg{width:min(100%,300px);height:auto;display:block;overflow:visible}
.tr-wrap.tr-compact .tr-svg{width:min(100%,170px)}
.tr-l{animation:tr-twinkle 2.4s ease-in-out infinite;opacity:.6}
@keyframes tr-twinkle{0%,100%{opacity:.35}50%{opacity:1}}
.tr-star-on{animation:tr-glow 2.6s ease-in-out infinite}
@keyframes tr-glow{0%,100%{filter:drop-shadow(0 0 2px #f2c14e)}50%{filter:drop-shadow(0 0 5px #ffe08a)}}
.tr-santa{animation:tr-shimmer 1.8s ease-in-out infinite}
@keyframes tr-shimmer{0%,100%{filter:drop-shadow(0 0 1px #ffd45c) brightness(1)}50%{filter:drop-shadow(0 0 3.5px #fff0a8) brightness(1.18)}}
.tr-pop{transform-box:fill-box;transform-origin:center;animation:tr-pop .9s cubic-bezier(.3,1.6,.5,1) both}
@keyframes tr-pop{0%{transform:translateY(-26px) scale(0);opacity:0}45%{opacity:1}65%{transform:translateY(0) scale(1.7)}82%{transform:translateY(-3px) scale(.9)}100%{transform:none}}
.tr-spark{transform-box:fill-box;transform-origin:center;animation:tr-spark .9s .35s ease-out both}
@keyframes tr-spark{0%{opacity:0;transform:translate(0,0) scale(.3)}25%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1)}}
.tr-cap{font-family:var(--font-display,"Jersey 15",Impact,sans-serif);font-size:22px;line-height:1;color:var(--ink,#2b1d18);letter-spacing:.02em;text-align:center}
.tr-cap b{color:var(--red,#c8323a);font-weight:normal}
.tr-compact .tr-cap{font-size:18px}
.tr-legend{display:flex;flex-wrap:wrap;gap:4px 10px;justify-content:center;font-family:var(--font-body,system-ui,sans-serif);font-size:12px;color:var(--muted,#6e5a4c)}
.tr-legend span{display:inline-flex;align-items:center;gap:4px}
.tr-legend svg{width:14px;height:14px;flex:none;overflow:visible}
@media (prefers-reduced-motion:reduce){.tr-l,.tr-star-on,.tr-santa,.tr-pop,.tr-spark{animation:none!important}.tr-l{opacity:.85}.tr-spark{display:none}}
`;

  function injectCss() {
    if (document.getElementById("tree-css")) return;
    const s = document.createElement("style");
    s.id = "tree-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function starPath(cx, cy, R, r) {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r : R;
      d += (i ? "L" : "M") + f1(cx + Math.cos(a) * rad) + "," + f1(cy + Math.sin(a) * rad);
    }
    return d + "Z";
  }

  const hi = (x, y) =>
    `<ellipse cx="${x}" cy="${y}" rx="1.7" ry=".95" transform="rotate(-38 ${x} ${y})" fill="#fff" fill-opacity=".85"/><circle cx="${x + 0.6}" cy="${y + 0.4}" r=".45" fill="#fff"/>`;
  const capThread = (p) =>
    `<path d="M0,-6.2 C-1.6,-9.4 1.6,-9.4 0,-6.2" fill="none" stroke="#c9a03a" stroke-width=".55"/>` +
    `<rect x="-1.7" y="-7" width="3.4" height="2.2" rx=".6" fill="url(#${p}cap)" stroke="#9a6f17" stroke-width=".25"/>`;

  // ornament art centred on (0,0), ball radius ~5.5
  // rendered 3D ornament art (orn/*.png): [blender ortho scale, vertical shift], 4.8 svg units per blender unit
  const IMG = { plain: [3.9, 0.45], candy: [4.7, 0.1], ginger: [4.0, 0.2], snow: [4.9, -0.15], deer: [4.9, -0.3], santa: [3.9, 0.15] };
  function art(kind, p) {
    const m = IMG[kind];
    if (m) {
      const w = m[0] * 4.8, k = 4.8;
      const im = `<image href="orn/orn-${kind}.png" x="${f1(-w / 2)}" y="${f1(-m[1] * k - w / 2)}" width="${f1(w)}" height="${f1(w)}"/>`;
      return kind === "santa" ? `<circle r="10" fill="url(#${p}glow)"/><g class="tr-santa">${im}</g>` : im;
    }
    return artVec(kind, p);
  }
  function artVec(kind, p) {
    switch (kind) {
      case "candy":
        return `<path d="M3,6 L3,-2.6 A3.3 3.3 0 0 0 -3.6,-2.6" fill="none" stroke="#7a1219" stroke-width="3.5" stroke-linecap="round"/>` +
          `<path d="M3,6 L3,-2.6 A3.3 3.3 0 0 0 -3.6,-2.6" fill="none" stroke="#fffaf0" stroke-width="2.6" stroke-linecap="round"/>` +
          `<path d="M3,6 L3,-2.6 A3.3 3.3 0 0 0 -3.6,-2.6" fill="none" stroke="#d8323a" stroke-width="2.6" stroke-dasharray="1.15 1.45" stroke-dashoffset=".4"/>` +
          `<path d="M1.9,5 L1.9,-2.4" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".55" stroke-linecap="round"/>` +
          `<path d="M-1.5,-6.4 l-.3,-.2 M-1.2,-6.3 l.2,-.5" stroke="#2f8a4e" stroke-width="0"/>`;
      case "ginger": {
        const body = (w, c, extra) =>
          `<g fill="${c}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">` +
          `<path d="M-4.6,-.2 L0,-1.4 L4.6,-.2" fill="none"/><path d="M-1.5,3 L-2.8,6 M1.5,3 L2.8,6" fill="none"/>` +
          `<ellipse cx="0" cy="1" rx="2.5" ry="3.1" stroke-width="${extra}"/><circle cx="0" cy="-3.9" r="2.5" stroke-width="${extra}"/></g>`;
        return body(2.9, "#fffaf0", 1) +
          body(2, `url(#${p}gin)`, 0.1) +
          `<path d="M-4.6,-.2 L-3.4,-.5 M4.6,-.2 L3.4,-.5 M-2.8,6 L-2.2,5 M2.8,6 L2.2,5" stroke="#fffaf0" stroke-width=".7" stroke-linecap="round"/>` +
          `<circle cx="-.9" cy="-4.3" r=".42" fill="#3a2418"/><circle cx=".9" cy="-4.3" r=".42" fill="#3a2418"/>` +
          `<path d="M-.9,-3.2 Q0,-2.5 .9,-3.2" fill="none" stroke="#fffaf0" stroke-width=".4" stroke-linecap="round"/>` +
          `<circle cx="0" cy="-.2" r=".55" fill="#d8323a"/><circle cx="0" cy="1.5" r=".55" fill="#2f8a4e"/>`;
      }
      case "snow":
        return capThread(p) +
          `<circle r="5.5" fill="url(#${p}ice)" stroke="#a9cbe6" stroke-width=".4"/>` +
          `<g stroke="#4f86b8" stroke-width=".65" stroke-linecap="round" fill="none"><path d="M0,-3.6 V3.6 M-3.1,-1.8 L3.1,1.8 M-3.1,1.8 L3.1,-1.8"/>` +
          `<path d="M-.9,-3 L0,-2.2 L.9,-3 M-.9,3 L0,2.2 L.9,3" stroke-width=".45"/></g>` + hi(-2.2, -2.9);
      case "deer":
        return capThread(p) +
          `<circle r="5.5" fill="url(#${p}gold)" stroke="#a8741a" stroke-width=".4"/>` +
          `<g fill="#4a2b17"><path d="M-1.9,-.6 Q0,-1.3 1.9,-.6 L1,3.4 Q0,4.2 -1,3.4 Z"/>` +
          `<path d="M-1.4,-.6 L-3.3,-3.3 M-2.5,-2 L-4,-2.2 M-2.6,-2.1 L-2.5,-3.6 M1.4,-.6 L3.3,-3.3 M2.5,-2 L4,-2.2 M2.6,-2.1 L2.5,-3.6" fill="none" stroke="#4a2b17" stroke-width=".55" stroke-linecap="round"/></g>` +
          `<circle cx="0" cy="3.3" r=".75" fill="#e0353d"/>` + hi(-2.3, -3.2);
      case "santa":
        return `<circle r="10" fill="url(#${p}glow)"/>` +
          `<g class="tr-santa"><path d="${starPath(0, 0.4, 8, 3.7)}" fill="url(#${p}gold)" stroke="#b07a18" stroke-width=".5" stroke-linejoin="round"/>` +
          `<path d="${starPath(0, 0.4, 4.6, 2.1)}" fill="#fff3b0" fill-opacity=".55"/>` +
          `<circle cx="-1.6" cy="-1.5" r=".7" fill="#fff"/></g>`;
      default:
        return capThread(p) +
          `<circle r="5.5" fill="url(#${p}red)" stroke="#7a1219" stroke-width=".35"/>` +
          `<path d="M-4.7,1.4 Q0,5.4 4.7,1.4" fill="none" stroke="#f2c14e" stroke-opacity=".7" stroke-width=".5"/>` + hi(-2.1, -2.2);
    }
  }

  let uid = 0;
  function defs(p) {
    const rad = (id, stops, cx, cy, r) =>
      `<radialGradient id="${p}${id}" cx="${cx || 0.35}" cy="${cy || 0.3}" r="${r || 0.75}">${stops.map((s, i) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ""}/>`).join("")}</radialGradient>`;
    let o = "<defs>";
    o += rad("red", [[0, "#ffa3a0"], [0.3, "#e0434a"], [1, "#7a1219"]]);
    o += rad("gold", [[0, "#fff6bd"], [0.4, "#f4c54f"], [1, "#a8701a"]]);
    o += rad("ice", [[0, "#ffffff"], [0.5, "#e6f2fb"], [1, "#9cc3e3"]]);
    o += rad("glow", [[0, "#ffe9a0", 0.85], [0.5, "#ffd45c", 0.3], [1, "#ffd45c", 0]], 0.5, 0.5, 0.5);
    o += rad("halo", [[0, "#fff3c9", 0.9], [1, "#ffc24d", 0]], 0.5, 0.5, 0.5);
    o += `<linearGradient id="${p}cap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#b07a18"/></linearGradient>`;
    o += `<linearGradient id="${p}gin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d79a58"/><stop offset="1" stop-color="#9a5f2c"/></linearGradient>`;
    o += `<linearGradient id="${p}tr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f8a4e"/><stop offset=".45" stop-color="#1c6a3a"/><stop offset="1" stop-color="#0f3d24"/></linearGradient>`;
    o += `<linearGradient id="${p}sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2c18" stop-opacity="0"/><stop offset=".6" stop-color="#0a2c18" stop-opacity=".12"/><stop offset="1" stop-color="#06190d" stop-opacity=".55"/></linearGradient>`;
    o += `<linearGradient id="${p}wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a6a40"/><stop offset=".5" stop-color="#6e4526"/><stop offset="1" stop-color="#3f2713"/></linearGradient>`;
    o += `<linearGradient id="${p}vel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2565b"/><stop offset=".35" stop-color="#b8222b"/><stop offset="1" stop-color="#6b0f17"/></linearGradient>`;
    o += `<linearGradient id="${p}rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset=".5" stop-color="#e0aa38"/><stop offset="1" stop-color="#9a6a14"/></linearGradient>`;
    o += `<radialGradient id="${p}sg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".95"/><stop offset=".45" stop-color="#ffd45c" stop-opacity=".35"/><stop offset="1" stop-color="#ffd45c" stop-opacity="0"/></radialGradient>`;
    o += `<linearGradient id="${p}sf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#ffd24a"/><stop offset="1" stop-color="#c88a1a"/></linearGradient>`;
    TIERS.forEach((t, i) => { o += `<clipPath id="${p}c${i}"><path d="${TIER_DATA[i].d}"/></clipPath>`; });
    return o + "</defs>";
  }

  const place = (kind, x, y, cls, p) =>
    `<g transform="translate(${x} ${y}) scale(1.2)"><g class="${cls || ""}">${art(kind, p)}</g></g>`;

  function sparkBurst(x, y) {
    let o = "";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, d = 13;
      o += `<circle class="tr-spark" style="--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px" cx="${x}" cy="${y}" r="${i % 2 ? 0.7 : 1}" fill="${i % 2 ? "#fff3c9" : "#ffd45c"}"/>`;
    }
    return o;
  }

  function render(el, ornaments, opts) {
    if (!el) return;
    opts = opts || {};
    injectCss();
    const p = "t" + ++uid + "-";
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
      const cls = isNew ? "tr-pop" : "";
      filled += `<g><title>Day ${o.day}: ${NAMES[kind]}</title>${place(kind, s.x, s.y, cls, p)}</g>`;
      if (isNew) burst += sparkBurst(s.x, s.y);
    });
    SLOTS.forEach((s, i) => {
      if (!used.has(i)) slotsSvg += `<circle cx="${s.x}" cy="${s.y}" r=".9" fill="#f6ecd6" fill-opacity=".16"/>`;
    });

    // tiers: bottom first so upper ones overlap
    let tiers = "";
    for (let i = TIERS.length - 1; i >= 0; i--) {
      const t = TIERS[i], td = TIER_DATA[i];
      tiers += `<path d="${td.d}" fill="url(#${p}tr)"/>` +
        `<g clip-path="url(#${p}c${i})">${tierDetail(t, td, i, p)}<rect x="${CX - t.hw - 4}" y="${t.ax}" width="${t.hw * 2 + 8}" height="${t.by - t.ax + 8}" fill="url(#${p}sh)"/></g>` +
        `<path d="${td.d}" fill="none" stroke="#06190d" stroke-opacity=".35" stroke-width=".6" stroke-linejoin="round"/>`;
    }

    let lights = `<path d="${GARLAND.d}" fill="none" stroke="#e0b44a" stroke-opacity=".75" stroke-width=".7" stroke-linecap="round"/>`;
    GARLAND.lights.forEach((l) => {
      lights += `<g class="tr-l" style="animation-delay:${l.dl}s"><circle cx="${l.x}" cy="${l.y}" r="3.2" fill="url(#${p}halo)"/><circle cx="${l.x}" cy="${l.y}" r="1.15" fill="${l.c}"/><circle cx="${l.x - 0.3}" cy="${l.y - 0.3}" r=".4" fill="#fff"/></g>`;
    });

    const sc = 12;
    const star = `<g class="${starOn ? "tr-star-on" : ""}">` +
      (starOn ? `<circle cx="${CX}" cy="14" r="17" fill="url(#${p}sg)"/>` : "") +
      `<path d="${starPath(CX, 14.5, sc, 5.2)}" fill="${starOn ? `url(#${p}sf)` : "#7d8a6c"}" stroke="${starOn ? "#b07a18" : "#4f5a45"}" stroke-width=".7" stroke-linejoin="round"/>` +
      `<path d="${starPath(CX, 14.5, 6.6, 2.9)}" fill="${starOn ? "#fff8d0" : "#9aa68a"}" fill-opacity=".55"/></g>`;

    const trunk = `<rect x="${CX - 5}" y="148" width="10" height="18" fill="url(#${p}wood)"/>` +
      `<path d="M${CX - 2},149 V165 M${CX + 1.5},150 V164" stroke="#2b1708" stroke-opacity=".4" stroke-width=".5"/>`;

    const pot = `<path d="M${CX - 19},163 H${CX + 19} L${CX + 16},181 Q${CX},185 ${CX - 16},181 Z" fill="url(#${p}vel)"/>` +
      `<path d="M${CX - 12},164 Q${CX - 13},174 ${CX - 11},182 M${CX - 3},164 Q${CX - 3.5},175 ${CX - 3},184 M${CX + 7},164 Q${CX + 8},175 ${CX + 7},183" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>` +
      `<path d="M${CX - 17.4},173 Q${CX},177 ${CX + 17.4},173 L${CX + 16.7},177 Q${CX},181 ${CX - 16.7},177 Z" fill="url(#${p}rim)"/>` +
      `<rect x="${CX - 21}" y="159.5" width="42" height="6" rx="3" fill="url(#${p}rim)" stroke="#8a5d10" stroke-width=".4"/>` +
      `<rect x="${CX - 18}" y="160.3" width="20" height="1.2" rx=".6" fill="#fff" fill-opacity=".45"/>`;

    const svg = `<svg class="tr-svg" viewBox="0 0 160 190" role="img" aria-label="Advent tree with ${count} ornaments">` + defs(p) +
      `<ellipse cx="${CX}" cy="185" rx="42" ry="4" fill="#2b1d18" fill-opacity=".2"/>` +
      trunk + tiers + lights + slotsSvg + filled + burst + star + pot + `</svg>`;

    const rare = list.filter((o) => KINDS.indexOf(o.kind) >= RARE_FROM).length;
    const cap = count === 0
      ? "Finish a run to earn your first ornament"
      : `<b>${count}</b> ornament${count === 1 ? "" : "s"}${rare ? ` · <b>${rare}</b> rare` : ""}`;

    const tally = {};
    list.forEach((o) => { tally[o.kind] = (tally[o.kind] || 0) + 1; });
    const legend = KINDS.filter((k) => tally[k]).map((k) =>
      `<span><svg width="14" height="14" viewBox="-8.5 -9.5 17 17">${art(k, p).replace(/class="tr-santa"/g, "")}</svg>${NAMES[k]} ${tally[k]}</span>`).join("");

    el.innerHTML = `<div class="tr-wrap${opts.compact ? " tr-compact" : ""}">${svg}<div class="tr-cap">${cap}</div>` +
      (legend && !opts.compact ? `<div class="tr-legend">${legend}</div>` : "") + `</div>`;
  }

  window.AdventTree = { render, kindFor };
})();
