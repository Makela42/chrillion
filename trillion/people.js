/* Trillion cast: original vector business people, engraved-certificate palette. People.svg(kind) -> inline SVG string. People.mount() fills [data-person]. */
(() => {
  "use strict";
  const INK = "#0b2e22", PAPER = "#f6ecd6", GOLD = "#f2c14e", RED = "#a3262e";
  // kind: skin, hair color, hair style, suit, tie/accent, extras
  const CAST = {
    ceo:     { skin: "#e8b48c", hair: "#2a2320", style: "short",  suit: "#16385c", acc: RED,       x: "tie",   pin: true },
    boss:    { skin: "#8d5a3b", hair: "#15110f", style: "bun",    suit: "#7a1f2b", acc: GOLD,      x: "pearls" },
    trader:  { skin: "#c68a5e", hair: "#3a2a1c", style: "short",  suit: "#2f4f3f", acc: "#3fcf8e", x: "headset" },
    analyst: { skin: "#f0c8a4", hair: "#7a4a26", style: "long",   suit: "#3b3f4a", acc: GOLD,      x: "glasses" },
    banker:  { skin: "#5e3a26", hair: "#0d0b0a", style: "bald",   suit: "#1d1d22", acc: GOLD,      x: "bow" },
    founder: { skin: "#e0a67c", hair: "#c9c2b6", style: "curly",  suit: "#5a3d6e", acc: PAPER,     x: "scarf" },
  };
  function hair(p, back) {
    const h = p.hair;
    if (p.style === "short") return back ? "" : `<path d="M30 34c0-12 8-18 20-18s20 6 20 18c-4-7-10-9-20-9s-16 2-20 9z" fill="${h}"/>`;
    if (p.style === "bun") return back ? `<circle cx="50" cy="12" r="8" fill="${h}"/>` : `<path d="M30 38c-1-14 7-21 20-21s21 7 20 21c-3-8-9-11-20-11s-17 3-20 11z" fill="${h}"/>`;
    if (p.style === "long") return back ? `<path d="M28 36c0-14 9-22 22-22s22 8 22 22v28H28z" fill="${h}"/>` : `<path d="M30 38c0-12 8-19 20-19s20 7 20 19c-6-4-12-9-20-9s-14 5-20 9z" fill="${h}"/>`;
    if (p.style === "curly") return back ? `<circle cx="34" cy="28" r="9" fill="${h}"/><circle cx="66" cy="28" r="9" fill="${h}"/><circle cx="50" cy="18" r="12" fill="${h}"/>` : `<circle cx="38" cy="24" r="7" fill="${h}"/><circle cx="50" cy="20" r="8" fill="${h}"/><circle cx="62" cy="24" r="7" fill="${h}"/>`;
    return "";
  }
  function build(kind) {
    const p = CAST[kind] || CAST.ceo;
    let ex = "";
    if (p.x === "tie") ex = `<path d="M46 62h8l3 6-7 22-7-22z" fill="${p.acc}" stroke="${INK}" stroke-width="1.5"/>`;
    if (p.x === "pearls") ex = [0, 1, 2, 3, 4].map((i) => `<circle cx="${38 + i * 6}" cy="${64 + Math.abs(2 - i) * -1.6 + 3}" r="2" fill="${PAPER}" stroke="${INK}" stroke-width=".8"/>`).join("");
    if (p.x === "bow") ex = `<path d="M50 64l-9-5v10zM50 64l9-5v10z" fill="${p.acc}" stroke="${INK}" stroke-width="1.5"/><circle cx="50" cy="64" r="2.4" fill="${INK}"/>`;
    if (p.x === "scarf") ex = `<path d="M36 60q14 10 28 0l2 8q-16 10-32 0z" fill="${p.acc}" stroke="${INK}" stroke-width="1.5"/>`;
    if (p.x === "glasses") ex = `<g fill="none" stroke="${INK}" stroke-width="1.6"><circle cx="43" cy="42" r="5"/><circle cx="57" cy="42" r="5"/><path d="M48 42h4"/></g>`;
    if (p.x === "headset") ex = `<path d="M31 42c-2-18 8-24 19-24s21 6 19 24" fill="none" stroke="${INK}" stroke-width="2.4"/><rect x="27" y="39" width="6" height="10" rx="3" fill="${INK}"/><path d="M30 49q2 9 14 10" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="45" cy="59" r="2.2" fill="${p.acc}"/>`;
    const pin = p.pin ? `<path d="M64 74l3 3-3 3-3-3z" fill="${GOLD}" stroke="${INK}" stroke-width="1"/>` : "";
    return `<svg class="person person-${kind}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">` +
      `<g stroke="${INK}" stroke-width="2" stroke-linejoin="round">${hair(p, true)}` +
      `<path d="M8 100c0-18 12-28 28-31l14 12 14-12c16 3 28 13 28 31z" fill="${p.suit}"/>` +
      `<path d="M36 69l14 12 14-12-4-8H40z" fill="${PAPER}"/>` +
      `<path d="M36 69l-6 14 10 17M64 69l6 14-10 17" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>` +
      `<rect x="44" y="52" width="12" height="12" rx="4" fill="${p.skin}"/>` +
      `<ellipse cx="50" cy="40" rx="17" ry="20" fill="${p.skin}"/>${hair(p, false)}</g>` +
      `<g fill="${INK}"><circle cx="43.5" cy="42" r="1.7"/><circle cx="56.5" cy="42" r="1.7"/></g>` +
      `<path d="M44 51q6 5 12 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>` +
      `${ex}${pin}</svg>`;
  }
  const cache = {};
  const svg = (k) => cache[k] || (cache[k] = build(k));
  function mount(root) {
    (root || document).querySelectorAll("[data-person]").forEach((el) => {
      if (el.dataset.done) return; el.dataset.done = "1";
      el.innerHTML = svg(el.dataset.person);
    });
  }
  window.People = { svg, mount, kinds: Object.keys(CAST) };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => mount()); else mount();
})();
