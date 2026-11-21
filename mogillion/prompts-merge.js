// Loaded AFTER every prompts-NN.js file. Merges duplicate prompts written by different batches into one
// bigger prompt (the "keeper"), then removes the donors. If an answer appears in both, the keeper's tier wins.
(function () {
  const P = window.MOGILLION_PROMPTS || [];
  const MERGE = {
    "s3-hairstyle":      ["s1-hairstyle", "s2-hairstyle"],
    "s3-skin-brand":     ["s2-skinbrand", "s4-skin-brand"],
    "s5-athlete":        ["s6-athlete"],
    "s2-exercise":       ["s6-gym-exercise"],
    "s9-slang":          ["s1-genz", "s2-slang", "s10-slang"],
    "s9-phonk":          ["s10-gym-songs"],
    "s10-creators":      ["s9-creator", "s3-beauty-creator", "s4-barber-creator", "s5-creator", "s8-creator", "s7-fragrance-creator"],
    "s2-fashionbrand":   ["s10-brands"],
    "s2-accessory":      ["s8-accessory"],
    "s1-aesthetic":      ["s8-aesthetic", "s8-tiktok-aesthetic"],
    "s3-hair-product":   ["s4-hair-product"],
    "s3-makeup-product": ["s2-makeup"],
    "s2-skincare":       ["s3-skin-product"],
    "s1-habit":          ["s2-glowup"],
    "s10-viral-trend":   ["s9-meme"],
    "s1-rated":          ["s2-facerate"],
    "s7-fragrance-house": ["s2-fragrance"],
    "s7-luxury-brand":   ["s8-designer-brand"],
    "s7-sneaker":        ["s8-sneaker"],
    "s7-viral-product":  ["s3-tiktok-skincare"],
  };
  const TIERS = ["t75", "t50", "t25", "t10"];
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, "");
  const byId = new Map(P.map((p) => [p.id, p]));
  const drop = new Set();

  // Re-tier overlays (retier-*.js): { id, t10: [...], t25: [...], t50: [...] } moves the named answers (any alias)
  // into that tier. They are applied before merging.
  for (const r of window.MOGILLION_RETIER || []) {
    const p = byId.get(r.id);
    if (!p) continue;
    for (const target of ["t10", "t25", "t50"]) {
      const want = new Set((r[target] || []).map(norm));
      if (!want.size) continue;
      for (const t of TIERS) {
        if (t === target || !p[t]) continue;
        p[t] = p[t].filter((e) => {
          if (!String(e).split("|").some((a) => want.has(norm(a)))) return true;
          (p[target] = p[target] || []).push(e);
          return false;
        });
      }
    }
  }

  for (const [keepId, donorIds] of Object.entries(MERGE)) {
    const keep = byId.get(keepId);
    if (!keep) continue;
    const seen = new Set();
    const mark = (entry) => entry && String(entry).split("|").forEach((a) => seen.add(norm(a)));
    mark(keep.miracle); mark(keep.trap);
    TIERS.forEach((t) => (keep[t] = keep[t] || []).forEach(mark));
    keep.notes = keep.notes || {};
    for (const id of donorIds) {
      const d = byId.get(id);
      if (!d) continue;
      drop.add(id);
      // The donor's golden answer and deep cuts become Rare in the keeper, so Deep Cut stays a short list.
      const extra = [["t50", d.miracle]];
      TIERS.forEach((t) => (d[t] || []).forEach((e) => extra.push([t === "t75" ? "t50" : t, e])));
      for (const [t, e] of extra) {
        if (!e) continue;
        const aliases = String(e).split("|");
        if (aliases.some((a) => seen.has(norm(a)))) continue;
        keep[t].push(e);
        aliases.forEach((a) => seen.add(norm(a)));
        const display = aliases[0].trim();
        if (d.notes && d.notes[display] && !keep.notes[display]) keep.notes[display] = d.notes[display];
      }
      if (d.broad) keep.broad = true;
    }
  }
  window.MOGILLION_PROMPTS = P.filter((p) => !drop.has(p.id));
})();
