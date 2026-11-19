/*
  Chrillion reward animations.
  Fx.celebrate(tier): Santa's sleigh flies across the screen and drops presents.
  Presents stay where they land for the whole run, so better answers build a bigger pile.
  Fx.clear() removes everything (new run); Fx.fadeOut() fades the pile away (results screen).
*/
(() => {
  "use strict";

  // Items are [sprite name, gift colour variant].
  const PLAN = {
    t10:     { items: [["gift", 0]], count: 1 },
    t25:     { items: [["gift", 0], ["gift", 1]], count: 3 },
    t50:     { items: [["gift", 0], ["gift", 1], ["gift", 2]], count: 6 },
    t75:     { items: [["gift", 0], ["gift", 1], ["gift", 2], ["gift", 3]], count: 14, sparkle: true },
    miracle: { items: [["gift", 0], ["gift", 1], ["gift", 2], ["gift", 3], ["star", 0], ["tree", 0], ["cookie", 0], ["sock", 0]], count: 60, sparkle: true },
    trap:    { items: [["sock", 0]], count: 2 },
  };
  const G = 1500;                    // gravity, px/s²
  const PILE_MAX = 0.26;             // the pile never grows past this share of the screen height
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sfx = (name, arg) => { if (window.Sfx) window.Sfx.play(name, arg); };
  const art = (name, size, variant) => window.Sprites.svg(name, Math.round(size), { swap: variant ? window.Sprites.GIFT_SWAPS[variant] : null });

  let layer = null, raf = 0, entities = [], heights = null, colW = 40, lastLand = 0, pileW = 0;

  // Bigger on tablets and large phones, never tiny.
  function scale() { return Math.max(1.15, Math.min(1.8, Math.min(window.innerWidth, window.innerHeight * 0.7) / 360)); }

  function ensureLayer() {
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "fx";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
    }
    return layer;
  }

  function el(cls, html) {
    const e = document.createElement("div");
    e.className = "fx-item " + cls;
    e.innerHTML = html;
    layer.appendChild(e);
    return e;
  }
  const place = (e, x, y, r) => { e.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r || 0}deg)`; };

  function clear() {
    cancelAnimationFrame(raf);
    raf = 0;
    entities = [];
    heights = null;
    if (layer) { layer.innerHTML = ""; layer.classList.remove("fx-fade"); }
  }

  function fadeOut() {
    if (!layer || !layer.children.length) return;
    layer.classList.add("fx-fade");
    setTimeout(clear, 650);
  }

  function setupPile() {
    const W = window.innerWidth;
    if (heights && pileW === W) return;
    colW = 30 * scale();
    heights = new Array(Math.ceil(W / colW) + 1).fill(0);
    pileW = W;
  }

  function colOf(g) { return Math.max(0, Math.min(heights.length - 1, Math.floor((g.x + g.size / 2) / colW))); }
  function groundY(g, H) {
    const stack = Math.min(heights[colOf(g)] * g.size * 0.78, H * PILE_MAX - g.size);
    return H - g.size - Math.max(0, stack) - 4;
  }

  function spawnGift(x, y, vx, item, size) {
    const e = el("fx-gift", art(item[0], size, item[1]));
    const g = { kind: "gift", e, x, y, vx, vy: -60 - Math.random() * 80, r: Math.random() * 40 - 20, vr: (Math.random() - 0.5) * 360, size, landed: false };
    place(e, x, y, g.r);
    entities.push(g);
  }

  function spawnSparkle(x, y) {
    const e = el("fx-spark", art("star", 10 + Math.random() * 10));
    entities.push({ kind: "spark", e, x, y, life: 0, max: 0.7 + Math.random() * 0.4 });
    place(e, x, y);
  }

  function celebrate(tier) {
    const plan = PLAN[tier];
    if (reduce() || !window.Sprites || !plan) return;
    ensureLayer();
    setupPile();
    const W = window.innerWidth, H = window.innerHeight, S = scale();
    const size = 30 * S;
    const dur = tier === "miracle" ? 3000 : 2300;

    // The sleigh: reindeer lead, Santa rides behind, flying right to left.
    const deer = art("reindeer", 38 * S);
    const sleigh = el("fx-sleigh",
      `<span class="deer">${deer}</span><span class="deer">${deer}</span><span class="deer">${deer}</span>` +
      `<span class="rein"></span><span class="sled">${art("sleigh", 48 * S)}</span>`);
    const sw = 265 * S;
    const baseY = Math.max(64, H * 0.12);
    const startX = W + 30, endX = -sw - 40;
    const vxSleigh = (endX - startX) / (dur / 1000);
    const onFrom = Math.max(0, (startX - W + sw * 0.6) / (startX - endX));
    const onTo = Math.min(1, (startX + sw * 0.2) / (startX - endX));
    const drops = [];
    for (let i = 0; i < plan.count; i++) {
      const f = plan.count === 1 ? 0.5 : i / (plan.count - 1);
      drops.push(onFrom + (onTo - onFrom) * (0.08 + f * 0.84) + (Math.random() - 0.5) * 0.02);
    }
    drops.sort((a, b) => a - b);
    entities.push({ kind: "sleigh", e: sleigh, t0: performance.now(), dur, startX, endX, baseY, drops, di: 0, plan, size, vxSleigh, sw });
    place(sleigh, startX, baseY);
    sfx("sleigh", dur / 1000);
    if (!raf) loop();
  }

  function loop() {
    let last = performance.now();
    const step = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const W = window.innerWidth, H = window.innerHeight;
      let moving = 0;
      for (let i = entities.length - 1; i >= 0; i--) {
        const s = entities[i];
        if (s.kind === "sleigh") {
          moving++;
          const p = Math.min(1, (t - s.t0) / s.dur);
          const x = s.startX + (s.endX - s.startX) * p;
          const y = s.baseY + Math.sin(p * Math.PI * 3) * 12;
          place(s.e, x, y, Math.cos(p * Math.PI * 3) * 3);
          while (s.di < s.drops.length && p >= s.drops[s.di]) {
            const item = s.plan.items[Math.floor(Math.random() * s.plan.items.length)];
            spawnGift(x + s.sw * 0.82, y + s.size * 0.8, s.vxSleigh * 0.25 + (Math.random() - 0.5) * 120, item, s.size + (Math.random() - 0.5) * 6);
            s.di++;
          }
          if (s.plan.sparkle && Math.random() < 0.35) spawnSparkle(x + s.sw * 0.9 + Math.random() * 30, y + Math.random() * 40);
          if (p >= 1) { s.e.remove(); entities.splice(i, 1); }
        } else if (s.kind === "gift" && !s.landed) {
          moving++;
          s.vy += G * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.r += s.vr * dt;
          if (s.x < -10) { s.x = -10; s.vx = Math.abs(s.vx) * 0.4; }
          if (s.x > W - s.size + 10) { s.x = W - s.size + 10; s.vx = -Math.abs(s.vx) * 0.4; }
          const gy = groundY(s, H);
          if (s.y >= gy) {
            s.y = gy;
            s.landed = true;
            s.r = (Math.random() - 0.5) * 24;
            heights[colOf(s)]++;
            if (t - lastLand > 70) { sfx("land"); lastLand = t; }
            entities.splice(i, 1);           // landed presents stay on screen but stop animating
          }
          place(s.e, s.x, s.y, s.r);
        } else if (s.kind === "spark") {
          moving++;
          s.life += dt;
          s.y += 20 * dt;
          s.e.style.opacity = String(Math.max(0, 1 - s.life / s.max));
          place(s.e, s.x, s.y);
          if (s.life >= s.max) { s.e.remove(); entities.splice(i, 1); }
        }
      }
      raf = moving ? requestAnimationFrame(step) : 0;
    };
    raf = requestAnimationFrame(step);
  }

  window.Fx = { celebrate, clear, fadeOut };
})();
