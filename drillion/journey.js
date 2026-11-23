/* Journey: progress through the 7 prompts (0-700 pts) as a toothbrush moving along 7 teeth that get cleaned (sparkle). */
(() => {
  "use strict";
  const MAX = 700, N = 7, CELL = 40, VW = N * CELL, VH = 58;
  const INK = "#0f3a40", ENAMEL = "#fbfaf5", PLAQUE = "#dfe3a0", SLIME = "#7bbf4a", TEAL = "#16878f", BLUE = "#2b6fb0", GOLD = "#e0a92b";
  const MILESTONES = [
    { points: 50, name: "Hygiene Student", label: "Hygiene Student", sprite: "tooth" },
    { points: 150, name: "Dental Assistant", label: "Dental Assistant", sprite: "tooth" },
    { points: 280, name: "Dentist", label: "Dentist", sprite: "tooth" },
    { points: 420, name: "Specialist", label: "Specialist", sprite: "tooth" },
    { points: 560, name: "Chief of Dentistry", label: "Chief of Dentistry", sprite: "tooth" },
  ];

  const CSS = `
.journey{position:relative;width:100%;max-width:640px;margin:0 auto;padding:0 14px;box-sizing:border-box;font-family:var(--font-body,system-ui,sans-serif);user-select:none}
.journey .j-svg{display:block;width:100%;height:auto;overflow:visible}
.journey .j-spark{opacity:0;transform-box:fill-box;transform-origin:center}
.journey .j-t.on .j-spark{opacity:0}
.journey .j-t.pop .j-spark{animation:j-spark .9s ease-out}
.journey .j-t.pop .j-body{transform-box:fill-box;transform-origin:50% 100%;animation:j-bounce .6s cubic-bezier(.3,1.6,.5,1)}
.journey .j-row{display:flex;justify-content:space-between;margin-top:2px;font:600 12px/14px var(--font-mono,ui-monospace,monospace);letter-spacing:.02em}
.journey .j-pts{font-variant-numeric:tabular-nums}
.journey .j-next{opacity:.85}
@keyframes j-spark{0%{opacity:1;transform:scale(.2) rotate(0)}50%{opacity:1;transform:scale(1.3) rotate(45deg)}100%{opacity:0;transform:scale(.6) rotate(90deg)}}
@keyframes j-bounce{0%{transform:scale(.8)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
@media (min-width:600px){.journey .j-row{font-size:13px}}
@media (prefers-reduced-motion:reduce){.journey .j-t.pop .j-spark,.journey .j-t.pop .j-body{animation:none}}
`;

  const reduced = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const reachedAt = (p) => { let m = null; for (const x of MILESTONES) if (p >= x.points) m = x; return m; };

  let el = null, brushEl, ptsEl, nextEl, teeth = [], shown = 0, target = 0, raf = 0, lit = [];

  function injectCss() {
    if (document.getElementById("journey-css")) return;
    const s = document.createElement("style");
    s.id = "journey-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  const TOOTH = "M-12 36 V22 Q-12 14 -5 14 Q0 16 5 14 Q12 14 12 22 V36 Q12 40 8 40 H-8 Q-12 40 -12 36 Z";
  function toothSvg(i) {
    const cx = (i + 0.5) * CELL;
    return `<g class="j-t" data-i="${i}" transform="translate(${cx} 0)"><g class="j-body">` +
      `<path class="j-shape" d="${TOOTH}" fill="${PLAQUE}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` +
      `<g class="j-plaque" fill="${SLIME}" stroke="${INK}" stroke-width="1.2"><circle cx="-4" cy="26" r="3.6"/><circle cx="4.5" cy="31" r="2.8"/></g></g>` +
      `<path class="j-spark" d="M0 12 Q0 22 10 22 Q0 22 0 32 Q0 22 -10 22 Q0 22 0 12Z" fill="${GOLD}" stroke="${INK}" stroke-width="1" transform="translate(0 -4)"/></g>`;
  }

  function render(v, announce) {
    const frac = Math.max(0, Math.min(1, v / MAX));
    brushEl.setAttribute("transform", `translate(${(frac * VW).toFixed(1)} 0)`);
    ptsEl.textContent = Math.round(v) + " pts";
    el.setAttribute("aria-valuenow", String(Math.round(v)));
    teeth.forEach((t, i) => {
      const on = frac >= (i + 0.5) / N - 1e-9 && v > 0;
      if (on && !lit[i]) {
        lit[i] = true;
        t.el.classList.add("on");
        t.shape.setAttribute("fill", ENAMEL);
        t.plaque.setAttribute("display", "none");
        if (announce && !reduced()) { t.el.classList.remove("pop"); void t.el.getBoundingClientRect(); t.el.classList.add("pop"); }
      } else if (!on && lit[i]) {
        lit[i] = false;
        t.el.classList.remove("on", "pop");
        t.shape.setAttribute("fill", PLAQUE);
        t.plaque.removeAttribute("display");
      }
    });
    const nxt = MILESTONES.find((m) => v < m.points);
    nextEl.textContent = nxt ? Math.max(0, Math.ceil(nxt.points - v)) + " to " + nxt.label : MILESTONES[MILESTONES.length - 1].label + " reached!";
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
      if (t < 1) { brushEl.setAttribute("transform", brushEl.getAttribute("transform").replace(/ 0\)$/, ` ${(Math.sin(now / 35) * 1.6).toFixed(1)})`)); raf = requestAnimationFrame(step); }
      else { shown = target; render(shown, true); }
    };
    raf = requestAnimationFrame(step);
  }

  function mount(container) {
    injectCss();
    if (el) el.remove();
    el = document.createElement("div");
    el.className = "journey";
    el.setAttribute("role", "progressbar");
    el.setAttribute("aria-label", "Cleaning progress");
    el.setAttribute("aria-valuemin", "0");
    el.setAttribute("aria-valuemax", String(MAX));
    let svg = `<svg class="j-svg" viewBox="-22 0 ${VW + 54} ${VH}" aria-hidden="true">` +
      `<path d="M-2 52 H${VW + 2}" stroke="#e8818a" stroke-width="8" stroke-linecap="round"/><path d="M-2 56.5 H${VW + 2}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
    for (let i = 0; i < N; i++) svg += toothSvg(i);
    svg += `<g class="j-brush" transform="translate(0 0)">` +
      `<g transform="translate(0 4) rotate(-14)"><rect x="-4" y="-8" width="34" height="6" rx="3" fill="${BLUE}" stroke="${INK}" stroke-width="2"/>` +
      `<rect x="-20" y="-3" width="30" height="8" rx="3" fill="${TEAL}" stroke="${INK}" stroke-width="2"/>` +
      `<g fill="#fff" stroke="${INK}" stroke-width="1.2"><rect x="-17" y="5" width="3.4" height="7"/><rect x="-11" y="5" width="3.4" height="7"/><rect x="-5" y="5" width="3.4" height="7"/><rect x="1" y="5" width="3.4" height="7"/><rect x="7" y="5" width="3.4" height="7"/></g></g></g></svg>`;
    el.innerHTML = svg + `<div class="j-row"><span class="j-pts"></span><span class="j-next"></span></div>`;
    brushEl = el.querySelector(".j-brush");
    ptsEl = el.querySelector(".j-pts");
    nextEl = el.querySelector(".j-next");
    teeth = Array.from(el.querySelectorAll(".j-t")).map((g) => ({ el: g, shape: g.querySelector(".j-shape"), plaque: g.querySelector(".j-plaque") }));
    (container || document.body).appendChild(el);
    shown = target = 0; lit = [];
    render(0, false);
    return el;
  }

  function reset() { cancelAnimationFrame(raf); shown = target = 0; if (el) render(0, false); }

  window.Journey = { MILESTONES, mount, set, reset, reached: reachedAt };
})();
