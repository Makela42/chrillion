/*
  Mogillion reward animations: a "phonk edit" celebration that scales with rarity.
  Fx.celebrate(tier): scales with rarity. Black-and-white cut, hard flash, shake, a scan-line sweep,
  a slammed caption (MOGGED / CHAD PICK / GLOW UP) and a burst of chrome/cyan aura shards. Shards stay where they land for the whole run,
  so better answers build a bigger pile.
  Fx.clear() removes everything (new run); Fx.fadeOut() fades the pile away (results screen).
*/
(() => {
  "use strict";

  // Items are [sprite name, colour variant]. flash: peak opacity; shake: px.
  const PLAN = {
    t10:     { items: [["shard", 1]], count: 1 },
    t25:     { items: [["shard", 0], ["shard", 1]], count: 2 },
    t50:     { items: [["shard", 0], ["shard", 1], ["sparkle", 0]], count: 3 },
    t75:     { items: [["shard", 0], ["shard", 1], ["diamond", 0], ["sparkle", 0]], count: 6, sparkle: true },
    miracle: { items: [["shard", 0], ["shard", 1], ["shard", 2], ["diamond", 0], ["diamond", 2], ["sparkle", 0], ["star", 0], ["crown", 0]], count: 16, sparkle: true },
    trap:    { items: [["cap", 0]], count: 2 },
  };
  const G = 1500;                    // gravity, px/s²
  const PILE_MAX = 0.26;             // the pile never grows past this share of the screen height
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sfx = (name, arg) => { if (window.Sfx) window.Sfx.play(name, arg); };
  const art = (name, size, variant) => window.Sprites.svg(name, Math.round(size), { swap: variant ? window.Sprites.GIFT_SWAPS[variant] : null });

  let layer = null, raf = 0, entities = [], heights = null, colW = 40, lastLand = 0, pileW = 0, capTimer = 0;

  // Bigger on tablets and large phones, never tiny.
  function scale() { return Math.max(1.0, Math.min(1.7, Math.min(window.innerWidth, window.innerHeight * 0.7) / 360)); }

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
  const place = (e, x, y, r, s) => { e.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r || 0}deg)${s ? ` scale(${s})` : ""}`; };

  function clear() {
    cancelAnimationFrame(raf);
    raf = 0;
    entities = [];
    heights = null;
    clearTimeout(capTimer);
    document.querySelectorAll("#fx-flash, #fx-caption, #fx-bw, #fx-scan").forEach((n) => n.remove());
    document.querySelector(".wrap") && document.querySelector(".wrap").classList.remove("fx-shake");
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
    const stack = Math.min(heights[colOf(g)] * g.size * 0.7, H * PILE_MAX - g.size);
    return H - g.size - Math.max(0, stack) - 4;
  }

  function spawnShard(x, y, vx, item, size) {
    const e = el("fx-shard", art(item[0], size, item[1]));
    const g = { kind: "shard", e, x, y, vx, vy: 120 + Math.random() * 260, r: Math.random() * 40 - 20, vr: (Math.random() - 0.5) * 420, size, landed: false };
    place(e, x, y, g.r);
    entities.push(g);
  }

  function spawnSparkle(x, y) {
    const e = el("fx-spark", art("sparkle", 10 + Math.random() * 14, Math.random() < 0.3 ? 2 : 0));
    entities.push({ kind: "spark", e, x, y, life: 0, max: 0.45 + Math.random() * 0.4 });
    place(e, x, y);
  }

  // Quick full-screen flash, drawn above the cards but too brief to hide anything.
  function flash(tint, peak) {
    const f = document.createElement("div");
    f.id = "fx-flash";
    f.style.setProperty("--tint", tint);
    f.style.setProperty("--peak", String(peak));
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 420);
  }

  function shake(px) {
    const w = document.querySelector(".wrap");
    if (!w) return;
    w.style.setProperty("--shake", px + "px");
    w.classList.remove("fx-shake");
    void w.offsetWidth;
    w.classList.add("fx-shake");
    setTimeout(() => w.classList.remove("fx-shake"), 360);
  }

  // Harsh black-and-white cut and a scan line sweeping down the screen.
  function bw() {
    const b = document.createElement("div");
    b.id = "fx-bw";
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 520);
  }
  function scan() {
    document.querySelectorAll("#fx-scan").forEach((n) => n.remove());
    const b = document.createElement("div");
    b.id = "fx-scan";
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 600);
  }

  function caption(text, tier, sub) {
    document.querySelectorAll("#fx-caption").forEach((n) => n.remove());
    const c = document.createElement("div");
    c.id = "fx-caption";
    c.dataset.tier = tier || "";
    c.innerHTML = `<span>${text}</span>${sub ? `<small>${sub}</small>` : ""}`;
    document.body.appendChild(c);
    clearTimeout(capTimer);
    capTimer = setTimeout(() => c.remove(), 1500);
  }

  function celebrate(tier) {
    const plan = PLAN[tier];
    if (reduce() || !window.Sprites || !plan) return;
    ensureLayer();
    setupPile();
    const S = scale();
    const size = 28 * S;
    if (plan.bw) bw();
    if (plan.flash) flash(plan.tint, plan.flash);
    if (plan.shake) shake(plan.shake);
    if (plan.scan) scan();
    if (plan.caption) caption(plan.caption, tier, plan.sub);
    if (tier === "miracle" || tier === "t75") sfx("whoosh");

    // The burst: shards rain in over a fraction of a second, so the pile builds like a quick-cut edit.
    const dur = tier === "miracle" ? 900 : 600;
    const drops = [];
    for (let i = 0; i < plan.count; i++) drops.push((plan.count === 1 ? 0.1 : i / plan.count) * 0.9 + Math.random() * 0.05);
    drops.sort((a, b) => a - b);
    entities.push({ kind: "burst", t0: performance.now(), dur, drops, di: 0, plan, size });
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
        if (s.kind === "burst") {
          moving++;
          const p = Math.min(1, (t - s.t0) / s.dur);
          while (s.di < s.drops.length && p >= s.drops[s.di]) {
            const item = s.plan.items[Math.floor(Math.random() * s.plan.items.length)];
            const sz = s.size + (Math.random() - 0.5) * 8;
            spawnShard(Math.random() * (W - sz), -sz - Math.random() * 40, (Math.random() - 0.5) * 160, item, sz);
            s.di++;
          }
          if (s.plan.sparkle && Math.random() < 0.6) spawnSparkle(Math.random() * W, Math.random() * H * 0.6);
          if (p >= 1 && s.di >= s.drops.length) entities.splice(i, 1);
        } else if (s.kind === "shard" && !s.landed) {
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
            entities.splice(i, 1);           // landed shards stay on screen but stop animating
          }
          place(s.e, s.x, s.y, s.r);
        } else if (s.kind === "spark") {
          moving++;
          s.life += dt;
          const k = s.life / s.max;
          s.e.style.opacity = String(Math.max(0, 1 - k));
          place(s.e, s.x, s.y, 0, 0.4 + Math.sin(Math.min(1, k) * Math.PI) * 0.9);
          if (s.life >= s.max) { s.e.remove(); entities.splice(i, 1); }
        }
      }
      raf = moving ? requestAnimationFrame(step) : 0;
    };
    raf = requestAnimationFrame(step);
  }

  window.Fx = { celebrate, clear, fadeOut };
})();
