/* Journey: festive milestone progress bar (0-700 pts). Needs sprites.js (optional fallback: none). */
(() => {
  "use strict";
  const MAX = 700;
  const MILESTONES = [
    { points: 50, name: "Candy Cane", label: "a Candy Cane", sprite: "candy" },
    { points: 150, name: "Gingerbread", label: "a Gingerbread", sprite: "cookie" },
    { points: 280, name: "Snowman", label: "a Snowman", sprite: "snowman" },
    { points: 420, name: "Reindeer", label: "a Reindeer", sprite: "deer" },
    { points: 560, name: "Santa", label: "Santa", sprite: "santa" },
  ];

  const CANDY = [
    "....RRWW....", "...RWRRWR...", "..RW....WR..", "..WR....RW..", "..RW........", "..WR........",
    "..RW........", "..WR........", "..RW........", "..WR........", "..RW........", "..WW........",
  ];
  function candySvg(px) {
    const P = (window.Sprites && window.Sprites.PAL) || { R: "#c8323a", W: "#f6ecd6" };
    let r = "";
    CANDY.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch !== ".") r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${P[ch]}"/>`;
    }));
    return `<svg class="spr" width="${px}" height="${px}" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
  }
  function sprite(name, px) {
    if (name === "candy") return candySvg(px);
    return window.Sprites ? window.Sprites.svg(name, px) : "";
  }

  const CSS = `
.journey{--j-size:26px;position:relative;width:100%;max-width:640px;margin:0 auto;padding:0 14px;box-sizing:border-box;height:64px;font-family:var(--font-body,system-ui,sans-serif);color:var(--ink,#2b1d18);user-select:none}
.journey .j-stage{position:absolute;left:14px;right:14px;top:0;height:34px}
.journey .j-ms{position:absolute;bottom:0;left:0;transform:translateX(-50%);width:var(--j-size);height:var(--j-size);display:flex;align-items:flex-end;justify-content:center;filter:grayscale(1) brightness(1.05);opacity:.38;transition:filter .4s,opacity .4s}
.journey .j-ms svg{width:100%;height:100%;display:block;image-rendering:pixelated}
.journey .j-ms.on{filter:drop-shadow(0 0 5px rgba(242,193,78,.95)) drop-shadow(0 0 10px rgba(242,193,78,.5));opacity:1}
.journey .j-ms.pop{animation:j-pop .7s cubic-bezier(.3,1.6,.5,1)}
.journey .j-tick{position:absolute;bottom:-3px;left:50%;width:2px;height:3px;margin-left:-1px;background:rgba(43,29,24,.35)}
.journey .j-track{position:absolute;left:14px;right:14px;top:37px;height:11px;border-radius:6px;background:rgba(43,29,24,.22);box-shadow:inset 0 2px 3px rgba(43,29,24,.35),0 1px 0 rgba(255,255,255,.35);overflow:hidden}
.journey .j-fill{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:6px;background:repeating-linear-gradient(-45deg,#c8323a 0 7px,#f6ecd6 7px 14px);background-size:19.8px 19.8px;animation:j-scroll 1.4s linear infinite;box-shadow:inset 0 -3px 3px rgba(0,0,0,.18),inset 0 2px 2px rgba(255,255,255,.4)}
.journey .j-fill::after{content:"";position:absolute;right:0;top:0;bottom:0;width:6px;background:linear-gradient(90deg,transparent,rgba(242,193,78,.85));border-radius:0 6px 6px 0}
.journey .j-row{position:absolute;left:14px;right:14px;top:50px;display:flex;justify-content:space-between;font-size:12px;line-height:14px;font-weight:700}
.journey .j-pts{font-variant-numeric:tabular-nums}
.journey .j-next{opacity:.75;font-weight:600}
.journey .j-sp{position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2px;background:var(--gold,#f2c14e);transform:rotate(45deg);pointer-events:none;animation:j-spark .75s ease-out forwards}
.journey .j-sp:nth-child(3n){background:#fff}.journey .j-sp:nth-child(3n+1){background:#c8323a}
@keyframes j-scroll{to{background-position:19.8px 0}}
@keyframes j-pop{0%{transform:translateX(-50%) scale(.5)}45%{transform:translateX(-50%) translateY(-9px) scale(1.3)}70%{transform:translateX(-50%) scale(.92)}100%{transform:translateX(-50%) scale(1)}}
@keyframes j-spark{0%{opacity:1;transform:translate(0,0) rotate(45deg) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(225deg) scale(.2)}}
@media (min-width:600px){.journey{--j-size:34px;height:72px}.journey .j-stage{height:42px}.journey .j-track{top:45px;height:12px}.journey .j-row{top:60px;font-size:13px}}
@media (prefers-reduced-motion:reduce){.journey .j-fill{animation:none}.journey .j-ms.pop{animation:none}.journey .j-sp{display:none}}
`;

  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const reachedAt = (p) => { let m = null; for (const x of MILESTONES) if (p >= x.points) m = x; return m; };

  let el = null, fillEl, ptsEl, nextEl, msEls = [], shown = 0, target = 0, raf = 0, lit = [];

  function injectCss() {
    if (document.getElementById("journey-css")) return;
    const s = document.createElement("style");
    s.id = "journey-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function burst(node) {
    if (reduced()) return;
    for (let i = 0; i < 10; i++) {
      const sp = document.createElement("i");
      sp.className = "j-sp";
      const a = (i / 10) * Math.PI * 2 + Math.random() * 0.5, d = 16 + Math.random() * 14;
      sp.style.setProperty("--dx", Math.cos(a) * d + "px");
      sp.style.setProperty("--dy", Math.sin(a) * d - 4 + "px");
      node.appendChild(sp);
      setTimeout(() => sp.remove(), 800);
    }
  }

  function render(v, announce) {
    const pct = Math.max(0, Math.min(1, v / MAX)) * 100;
    fillEl.style.width = pct + "%";
    ptsEl.textContent = Math.round(v) + " pts";
    el.setAttribute("aria-valuenow", String(Math.round(v)));
    MILESTONES.forEach((m, i) => {
      const on = v >= m.points;
      if (on && !lit[i]) {
        lit[i] = true;
        msEls[i].classList.add("on");
        if (announce) {
          msEls[i].classList.remove("pop"); void msEls[i].offsetWidth; msEls[i].classList.add("pop");
          burst(msEls[i]);
        }
      } else if (!on && lit[i]) {
        lit[i] = false;
        msEls[i].classList.remove("on", "pop");
      }
    });
    const nxt = MILESTONES.find((m) => v < m.points);
    nextEl.textContent = nxt ? Math.max(0, Math.ceil(nxt.points - v)) + " to " + nxt.label.replace(/^a /, "a ") : "Santa reached!";
  }

  function set(points, animate) {
    if (!el) return;
    target = Math.max(0, Math.min(MAX, Number(points) || 0));
    cancelAnimationFrame(raf);
    if (animate === false || reduced()) { shown = target; render(shown, animate !== false); return; }
    const from = shown, dist = target - from;
    if (!dist) return;
    const dur = Math.min(1400, 500 + Math.abs(dist) * 5), t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      shown = from + dist * ease(t);
      render(shown, true);
      if (t < 1) raf = requestAnimationFrame(step); else { shown = target; render(shown, true); }
    };
    raf = requestAnimationFrame(step);
  }

  function mount(container) {
    injectCss();
    if (el) el.remove();
    el = document.createElement("div");
    el.className = "journey";
    el.setAttribute("role", "progressbar");
    el.setAttribute("aria-label", "Journey progress");
    el.setAttribute("aria-valuemin", "0");
    el.setAttribute("aria-valuemax", String(MAX));
    const stage = document.createElement("div");
    stage.className = "j-stage";
    msEls = MILESTONES.map((m) => {
      const d = document.createElement("div");
      d.className = "j-ms";
      d.style.left = (m.points / MAX) * 100 + "%";
      d.title = m.name + " at " + m.points;
      d.innerHTML = sprite(m.sprite, 40) + '<span class="j-tick"></span>';
      stage.appendChild(d);
      return d;
    });
    el.appendChild(stage);
    const track = document.createElement("div");
    track.className = "j-track";
    fillEl = document.createElement("div");
    fillEl.className = "j-fill";
    track.appendChild(fillEl);
    el.appendChild(track);
    const row = document.createElement("div");
    row.className = "j-row";
    ptsEl = document.createElement("span"); ptsEl.className = "j-pts";
    nextEl = document.createElement("span"); nextEl.className = "j-next";
    row.append(ptsEl, nextEl);
    el.appendChild(row);
    (container || document.body).appendChild(el);
    shown = target = 0; lit = [];
    render(0, false);
    return el;
  }

  function reset() { cancelAnimationFrame(raf); shown = target = 0; if (el) render(0, false); }

  window.Journey = { MILESTONES, mount, set, reset, reached: reachedAt };
})();
