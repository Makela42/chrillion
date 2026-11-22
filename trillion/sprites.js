/*
  Trillion art registry: tier mapping, avatars and the hydrate helper.
  The illustrated icons themselves live in icons.js, which fills in svg() / inner() / has().
*/
(() => {
  "use strict";
  const TIER_SPRITE = { miracle: "coin", t75: "bull", t50: "chart", t25: "bar", trap: "bag", t10: "penny", miss: "x", timeout: "bell" };
  const AVATARS = ["broker", "bull", "bear", "coin", "bar", "bag", "chart", "briefcase", "tophat", "rocket"];
  const PAL = { ink: "#1b2a24", paper: "#f4ead0", green: "#14704a", gold: "#d4a017", red: "#a3262e" };

  const Spr = {
    TIER_SPRITE, AVATARS, PAL,
    svg: () => "",
    inner: () => "",
    has: () => false,
    hydrate(root) {
      (root || document).querySelectorAll("[data-sprite]").forEach((el) => {
        el.innerHTML = Spr.svg(el.dataset.sprite, Number(el.dataset.size) || 24);
      });
    },
  };
  window.Sprites = Spr;
})();
