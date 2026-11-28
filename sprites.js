/* Icon registry shim. The old pixel-art sprites were removed; icons.js supplies the illustrated and Lucide icons. */
(() => {
  "use strict";
  window.Sprites = {
    svg: () => "",
    hydrate: () => {},
    drawKnit: () => {},
    has: () => false,
    AVATARS: ["santa", "elf", "deer", "snowman", "tree", "cookie", "penguin", "star", "gift", "sock"],
    TIER_SPRITE: {},
    GIFT_SWAPS: null,
  };
})();
