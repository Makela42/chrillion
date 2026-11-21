/* Mogillion Journey: aura meter (0-700) with 5 milestone icons. window.Journey = {MILESTONES, mount, set, reset, reached} */
(() => {
  "use strict";
  const MAX = 700;
  const MILESTONES = [
    { pts: 50, points: 50, name: "Fresh Cut", icon: "clip" },
    { pts: 150, points: 150, name: "Skincare Era", icon: "serum" },
    { pts: 280, points: 280, name: "Gym Arc", icon: "bell" },
    { pts: 420, points: 420, name: "Main Character", icon: "star" },
    { pts: 560, points: 560, name: "Mog Mode", icon: "crown" },
  ];

  const ART = {
    clip: `<rect x="6.5" y="8" width="11" height="14.5" rx="3.2" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".6"/><rect x="5.5" y="2.5" width="13" height="5.5" rx="1" fill="#2a3037" stroke="#aab4be" stroke-width=".5"/><path d="M7.5 3v4M10 3v4M12.5 3v4M15 3v4M17 3v4" stroke="#aab4be" stroke-width=".7"/><rect x="10.3" y="11" width="3.4" height="5.5" rx="1.7" fill="#4de2f7"/><path d="M8.3 9.5v11" stroke="#fff" stroke-opacity=".7" stroke-width="1" stroke-linecap="round"/>`,
    serum: `<rect x="9" y="1.5" width="6" height="5.5" rx="2.4" fill="#2a3037" stroke="#aab4be" stroke-width=".5"/><rect x="8" y="7" width="8" height="2.6" rx=".8" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".4"/><rect x="5.5" y="9.5" width="13" height="13" rx="3.4" fill="#bff4fb" fill-opacity=".35" stroke="url(#P-ch)" stroke-width="1"/><path d="M6.6 15.5h10.8v4.3a2.4 2.4 0 0 1-2.4 2.4H9a2.4 2.4 0 0 1-2.4-2.4Z" fill="url(#P-cy)"/><path d="M8 11.5v5" stroke="#fff" stroke-opacity=".8" stroke-width="1.1" stroke-linecap="round"/>`,
    bell: `<rect x="6" y="11" width="12" height="2.2" fill="url(#P-ch)"/><rect x="2" y="7.5" width="3" height="9.2" rx="1" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".4"/><rect x="4.8" y="5" width="3.2" height="14.2" rx="1.2" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".4"/><rect x="16" y="5" width="3.2" height="14.2" rx="1.2" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".4"/><rect x="19" y="7.5" width="3" height="9.2" rx="1" fill="url(#P-ch)" stroke="#3a434c" stroke-width=".4"/>`,
    star: `<path d="M12 .8 21 23H3Z" fill="url(#P-sp)"/><path d="M12 8.2l1.9 4 4.3.5-3.2 3 .9 4.3-3.9-2.2-3.9 2.2.9-4.3-3.2-3 4.3-.5Z" fill="url(#P-go)" stroke="#b8861a" stroke-width=".5" stroke-linejoin="round"/>`,
    crown: `<path d="M2.5 18.5 1.8 7l6 5L12 3.5 16.2 12l6-5-.7 11.5Z" fill="url(#P-go)" stroke="#b8861a" stroke-width=".6" stroke-linejoin="round"/><rect x="2.5" y="18.5" width="19" height="3.4" rx="1.2" fill="url(#P-go)" stroke="#b8861a" stroke-width=".6"/><circle cx="12" cy="15" r="1.5" fill="#4de2f7" stroke="#0b7288" stroke-width=".4"/><circle cx="6.8" cy="16" r="1" fill="#ff4d8d"/><circle cx="17.2" cy="16" r="1" fill="#ff4d8d"/><path d="M5 19.4h14" stroke="#fff" stroke-opacity=".6" stroke-width=".6"/>`,
  };
  const defs = (p) => `<defs><linearGradient id="${p}-ch" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#aab4be"/><stop offset=".6" stop-color="#5d6772"/><stop offset="1" stop-color="#d4dce3"/></linearGradient><linearGradient id="${p}-go" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#f5c542"/><stop offset="1" stop-color="#b8861a"/></linearGradient><linearGradient id="${p}-cy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9af0ff"/><stop offset="1" stop-color="#1ea7c4"/></linearGradient><linearGradient id="${p}-sp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfefff" stop-opacity=".9"/><stop offset="1" stop-color="#4de2f7" stop-opacity=".05"/></linearGradient></defs>`;
  function iconSvg(m, i, px) {
    const p = "jm" + i;
    return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" aria-hidden="true">${defs(p)}${ART[m.icon].replace(/P-/g, p + "-")}</svg>`;
  }

  const CSS = `
.journey{--j-size:26px;position:relative;width:100%;max-width:640px;margin:0 auto;padding:0 14px;box-sizing:border-box;height:64px;font-family:var(--font-body,system-ui,sans-serif);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.7);user-select:none}
.journey .j-stage{position:absolute;left:14px;right:14px;top:0;height:34px}
.journey .j-ms{position:absolute;bottom:0;left:0;transform:translateX(-50%);width:var(--j-size);height:var(--j-size);display:flex;align-items:flex-end;justify-content:center;filter:grayscale(1) brightness(.8);opacity:.4;transition:filter .4s,opacity .4s}
.journey .j-ms svg{width:100%;height:100%;display:block;overflow:visible}
.journey .j-ms.on{filter:drop-shadow(0 0 4px rgba(77,226,247,.95)) drop-shadow(0 0 9px rgba(139,92,246,.6));opacity:1}
.journey .j-ms.pop{animation:j-pop .75s cubic-bezier(.3,1.6,.5,1),j-flash .9s ease-out}
.journey .j-tick{position:absolute;bottom:-3px;left:50%;width:2px;height:3px;margin-left:-1px;background:rgba(255,255,255,.35)}
.journey .j-track{position:absolute;left:14px;right:14px;top:37px;height:11px;border-radius:6px;background:rgba(255,255,255,.1);box-shadow:inset 0 2px 3px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.12);overflow:hidden}
.journey .j-fill{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:6px;background:linear-gradient(90deg,#4de2f7,#8b5cf6,#f5c542,#4de2f7,#8b5cf6);background-size:200% 100%;animation:j-flow 4s linear infinite;box-shadow:inset 0 2px 2px rgba(255,255,255,.4),inset 0 -2px 3px rgba(0,0,0,.25),0 0 8px rgba(77,226,247,.45);overflow:hidden}
.journey .j-fill::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px)}
.journey .j-fill::after{content:"";position:absolute;top:0;bottom:0;width:30%;left:-30%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);animation:j-scan 2.2s ease-in-out infinite}
.journey .j-row{position:absolute;left:14px;right:14px;top:50px;display:flex;justify-content:space-between;font-size:12px;line-height:14px;font-weight:700}
.journey .j-pts{font-variant-numeric:tabular-nums}
.journey .j-next{opacity:.8;font-weight:600}
.journey .j-sp{position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2px;background:#4de2f7;transform:rotate(45deg);pointer-events:none;animation:j-spark .75s ease-out forwards}
.journey .j-sp:nth-child(3n){background:#fff}.journey .j-sp:nth-child(3n+1){background:#a78bfa}
@keyframes j-flow{to{background-position:-200% 0}}
@keyframes j-scan{0%{left:-30%}70%,100%{left:110%}}
@keyframes j-flash{0%{filter:brightness(3) saturate(0) drop-shadow(0 0 10px #fff)}}
@keyframes j-pop{0%{transform:translateX(-50%) scale(.5)}45%{transform:translateX(-50%) translateY(-9px) scale(1.3)}70%{transform:translateX(-50%) scale(.92)}100%{transform:translateX(-50%) scale(1)}}
@keyframes j-spark{0%{opacity:1;transform:translate(0,0) rotate(45deg) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(225deg) scale(.2)}}
@media (min-width:600px){.journey{--j-size:34px;height:72px}.journey .j-stage{height:42px}.journey .j-track{top:45px;height:12px}.journey .j-row{top:60px;font-size:13px}}
@media (prefers-reduced-motion:reduce){.journey .j-fill,.journey .j-fill::after{animation:none}.journey .j-ms.pop{animation:none}.journey .j-sp{display:none}}
`;

  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const reachedAt = (p) => { let m = null; for (const x of MILESTONES) if (p >= x.pts) m = x; return m; };

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
    ptsEl.textContent = Math.round(v) + " aura";
    el.setAttribute("aria-valuenow", String(Math.round(v)));
    MILESTONES.forEach((m, i) => {
      const on = v >= m.pts;
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
    const nxt = MILESTONES.find((m) => v < m.pts);
    nextEl.textContent = nxt ? Math.max(0, Math.ceil(nxt.pts - v)) + " to " + nxt.name : "Mog Mode reached!";
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
    el.setAttribute("aria-label", "Aura meter");
    el.setAttribute("aria-valuemin", "0");
    el.setAttribute("aria-valuemax", String(MAX));
    const stage = document.createElement("div");
    stage.className = "j-stage";
    msEls = MILESTONES.map((m, i) => {
      const d = document.createElement("div");
      d.className = "j-ms";
      d.style.left = (m.pts / MAX) * 100 + "%";
      d.title = m.name + " at " + m.pts;
      d.innerHTML = iconSvg(m, i, 34) + '<span class="j-tick"></span>';
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
