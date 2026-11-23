/*
  Drillion art registry: tier mapping, avatars and the hydrate helper.
  The illustrated icons themselves live in icons.js, which fills in svg() / inner() / has().
*/
(() => {
  "use strict";
  const TIER_SPRITE = { miracle: "miracle", t75: "prof", t50: "mirror", t25: "brush", trap: "cracked", t10: "floss", miss: "x", timeout: "clock" };
  const AVATARS = ["broker", "tooth", "chair", "brush", "mirror", "floss", "seal", "prof", "miracle", "crown"];
  const PAL = { ink: "#0f3a40", paper: "#fbfaf5", green: "#2f9d83", gold: "#e0a92b", red: "#ef5a4c" };

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
