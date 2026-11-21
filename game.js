(() => {
  "use strict";

  // =====================================================================
  // CONFIG: change these freely
  // =====================================================================
  const CONFIG = {
    name: "Merrillion",
    promptsPerDive: 7,
    secondsPerPrompt: 25,
    epoch: "2026-11-21",      // the day the site opened = Daily Sleigh Run #1 (YYYY-MM-DD)
    price: "$3.99",           // display only; the real price is set in Stripe
    apiBase: "",              // where the /api functions live ("" = same site)
    paymentLink: "https://buy.stripe.com/fZufZj3HxePUbGL3r5g7e00",   // your Stripe Payment Link (opened by Unlock)
    minPlayersForCurve: 5,    // players needed before the "better than X%" curve appears
  };

  // Fixed point tiers. Every answer in the prompt files belongs to exactly one.
  const TIERS = {
    miracle: { pts: 100, label: "One in a Merrillion", emoji: "⭐", desc: "The one handpicked best answer" },
    t75:     { pts: 75,  label: "Rare Find",         emoji: "🎁", desc: "Real deep cut" },
    t50:     { pts: 50,  label: "Good Pick",         emoji: "🎄", desc: "Solid, not everyone gets it" },
    t25:     { pts: 25,  label: "Classic",           emoji: "⛄", desc: "Well known" },
    trap:    { pts: 15,  label: "Regifted",          emoji: "🧦", desc: "The 'clever' answer everyone tries" },
    t10:     { pts: 10,  label: "Obvious",           emoji: "🦌", desc: "The first thing anyone says" },
    miss:    { pts: 0,   label: "Invalid",           emoji: "❌", desc: "Not a valid answer" },
    timeout: { pts: 0,   label: "Nothing Landed",    emoji: "⏰", desc: "Time ran out before a valid answer" },
  };
  const TIER_ORDER = ["t75", "t50", "t25", "t10"];
  const TIER_COLORS = { miracle: "#f2c14e", t75: "#e2562b", t50: "#23924a", t25: "#2f74c0", trap: "#c2399a", t10: "#b08a5e", miss: "#8e1f26", timeout: "#ffffff" };

  const PROMPTS = window.CHRILLION_PROMPTS || [];
  const MAX_SCORE = CONFIG.promptsPerDive * TIERS.miracle.pts;

  // Tidy the answer lists once on load: if the same answer was listed in two tiers,
  // keep it only in the more common one (so "Santa Claus" is Obvious, never a Rare Find).
  // The handpicked One in a Merrillion and the Regifted trap always keep their spot.
  function tidyPrompts() {
    PROMPTS.forEach((p) => {
      const claimed = new Set();
      const keep = (entry) => {
        if (!entry) return null;
        const aliases = entry.split("|").map((a) => a.trim()).filter((a) => a && !claimed.has(key(a)));
        aliases.forEach((a) => claimed.add(key(a)));
        return aliases.length ? aliases.join("|") : null;
      };
      p.miracle = keep(p.miracle) || p.miracle;
      if (p.trap) p.trap = keep(p.trap);
      ["t10", "t25", "t50", "t75"].forEach((t) => { p[t] = (p[t] || []).map(keep).filter(Boolean); });
    });
  }
  const Sfx = window.Sfx || { play() {}, duck() {}, isSfx: () => false, isMusic: () => false, setSfx() {}, setMusic() {} };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const Spr = window.Sprites;
  // On screen, tiers use the pixel sprite set; emoji are only used in the shareable text.
  function tierSprite(tier, size) { return Spr ? Spr.svg(Spr.TIER_SPRITE[tier] || "x", size) : esc(TIERS[tier].emoji); }

  // =====================================================================
  // Storage (per-browser conveniences; every access is guarded)
  // =====================================================================
  const store = {
    get(k, d) {
      try { const v = localStorage.getItem("chrillion:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) { try { localStorage.setItem("chrillion:" + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };

  function playerId() {
    let id = store.get("pid", null);
    if (!id) {
      id = Array.from({ length: 16 }, () => "abcdefghijkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 32)]).join("");
      store.set("pid", id);
    }
    return id;
  }

  // =====================================================================
  // Answer matching
  // =====================================================================
  function norm(s) {
    return String(s).toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/&/g, " and ")
      .replace(/['’`]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")   // keep letters from any alphabet (Cyrillic, Greek, etc.)
      .trim()
      .replace(/^(the|a|an) /, "")
      .replace(/^(st|saint) /, "saint ")
      .replace(/ (st|saint) /g, " saint ");
  }
  function key(s) {
    const n = norm(s);
    return n.length > 3 && n.endsWith("s") && !n.endsWith("ss") ? n.slice(0, -1) : n;
  }
  function lev(a, b) {
    const n = b.length;
    let prev = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }

  const indexCache = new Map();
  function answerIndex(p) {
    if (indexCache.has(p.id)) return indexCache.get(p.id);
    const list = [];
    const add = (entry, tier) => {
      if (!entry) return;
      const aliases = entry.split("|").map((x) => x.trim()).filter(Boolean);
      aliases.forEach((a) => list.push({ key: key(a), display: aliases[0], tier }));
    };
    add(p.miracle, "miracle");
    add(p.trap, "trap");
    TIER_ORDER.forEach((t) => (p[t] || []).forEach((e) => add(e, t)));
    indexCache.set(p.id, list);
    return list;
  }

  function judge(p, raw) {
    const n = norm(raw || "");
    if (!n) return { tier: "miss", display: null };
    // Word-game prompts can ignore the given word, e.g. "gift card" counts as "card".
    const cands = [n];
    if (p.strip) {
      const w = norm(p.strip);
      const s = n.replace(new RegExp(`^${w}s? `), "").replace(new RegExp(` ${w}s?$`), "").trim();
      if (s && s !== n) cands.push(s);
    }
    const list = answerIndex(p);
    for (const c of cands) {
      const ck = key(c);
      const exact = list.find((x) => x.key === ck);
      if (exact) return { tier: exact.tier, display: exact.display };
    }
    // Small typo tolerance: 1 edit for 5+ letters, 2 edits for 9+ letters.
    const k = key(cands[cands.length - 1]);
    let best = null, bestD = Infinity;
    for (const x of list) {
      const L = Math.min(x.key.length, k.length);
      const allow = L >= 9 ? 2 : L >= 5 ? 1 : 0;
      if (!allow || Math.abs(x.key.length - k.length) > allow) continue;
      const d = lev(x.key, k);
      if (d <= allow && d < bestD) { best = x; bestD = d; }
    }
    // A close-but-not-exact match is returned as "fuzzy" so the game can ask "Did you mean…?"
    return best ? { tier: best.tier, display: best.display, fuzzy: true } : { tier: "miss", display: null };
  }

  // =====================================================================
  // Dates & prompt selection
  // =====================================================================
  function todayParts() { const d = new Date(); return [d.getFullYear(), d.getMonth(), d.getDate()]; }
  function epochUTC() { const [y, m, d] = CONFIG.epoch.split("-").map(Number); return Date.UTC(y, m - 1, d); }
  function dayNumber() {
    const [y, m, d] = todayParts();
    return Math.round((Date.UTC(y, m, d) - epochUTC()) / 864e5) + 1;   // 0 or below = before launch
  }
  function dayLabel(day) { return day >= 1 ? `#${day}` : "Preview"; }
  function dayDate(day) {
    return new Date(epochUTC() + (day - 1) * 864e5).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffledIdx(n, rand) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }

  // Each run is mostly general Christmas prompts (5 of 7) plus 2 from the rest of the pool
  // (niche Christmas trivia, word games and everyday categories).
  const CORE_PER_RUN = 7;
  const CORE_IDS = new Set([
    "reindeer", "xmas-movie", "xmas-song", "tree-decor", "xmas-food", "stocking", "twelve-days", "cookie", "xmas-plant",
    "famous-elf", "tv-special", "xmas-drink", "gingerbread", "xmas-book", "leave-out", "snowman", "xmas-candy", "xmas-spices",
    "card-images", "cracker-contents", "toy-crazes", "bad-gifts", "under-the-tree", "wrapping-supplies", "north-pole-things",
    "things-you-light", "winter-clothing", "winter-weather", "winter-sports", "santa-outfit", "famous-snowmen", "xmas-colors",
    "gen-xmas-day", "world-desserts", "family-games",
  ]);
  const isCore = (p) => !!p.core || CORE_IDS.has(p.id);
  let pools = null;
  function getPools() {
    // Runs stay general: Christmas "core" prompts plus everyday ones (animals, foods...). Niche trivia is left out.
    if (!pools) pools = { core: PROMPTS.filter(isCore), other: PROMPTS.filter((p) => !isCore(p) && p.broad) };
    return pools;
  }

  // Walk through seeded shuffles of a pool so nothing repeats until the whole pool has been used.
  const cycleCache = new Map();
  function pickCycle(pool, start, count, seed, seen, out) {
    const N = pool.length;
    let pos = start, added = 0, guard = 0;
    while (N && added < count && guard < N * 3) {
      const cycle = Math.floor(pos / N), ck = seed + ":" + cycle;
      if (!cycleCache.has(ck)) cycleCache.set(ck, shuffledIdx(N, mulberry32(seed + cycle * 7919)));
      const p = pool[cycleCache.get(ck)[((pos % N) + N) % N]];
      if (!seen.has(p.id)) { seen.add(p.id); out.push(p); added++; }
      pos++; guard++;
    }
  }

  function dailyPrompts(day) {
    const { core, other } = getPools();
    const nCore = Math.min(CORE_PER_RUN, core.length), nOther = CONFIG.promptsPerDive - nCore;
    const out = [], seen = new Set();
    pickCycle(core, (day - 1) * nCore, nCore, 0xc4115, seen, out);
    pickCycle(other, (day - 1) * nOther, nOther, 0x5eed1, seen, out);
    return shuffledIdx(out.length, mulberry32(0xabc + day * 31)).map((i) => out[i]);   // mix the order
  }

  let recentUnlimited = [];
  function randomPrompts() {
    const { core, other } = getPools();
    const pick = (pool, n) => {
      const order = shuffledIdx(pool.length, Math.random).map((i) => pool[i]);
      return order.filter((p) => !recentUnlimited.includes(p.id)).concat(order.filter((p) => recentUnlimited.includes(p.id))).slice(0, n);
    };
    const nCore = Math.min(CORE_PER_RUN, core.length);
    const picked = pick(core, nCore).concat(pick(other, CONFIG.promptsPerDive - nCore));
    const mixed = shuffledIdx(picked.length, Math.random).map((i) => picked[i]);
    recentUnlimited = mixed.map((p) => p.id);
    return mixed;
  }

  // =====================================================================
  // Unlock / payments
  // =====================================================================
  const ONLINE = /^https?:$/.test(location.protocol);
  const LOCAL = !ONLINE || ["localhost", "127.0.0.1"].includes(location.hostname);

  function getToken() { return store.get("unlockToken", null); }
  function isUnlocked() { const t = getToken(); return !!t && (t !== "dev" || LOCAL); }

  async function api(path, opts) {
    const r = await fetch(CONFIG.apiBase + path, opts);
    let j = {};
    try { j = await r.json(); } catch (e) { /* not JSON */ }
    if (!r.ok) { const err = new Error(j.error || `HTTP ${r.status}`); err.status = r.status; throw err; }
    return j;
  }
  function cleanUrl() { try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ } }

  function unlockedNow(msg) {
    track("unlock");
    Sfx.play("unlock");
    toast(msg);
    renderMenu();
  }

  async function handleCheckoutReturn() {
    const sid = new URLSearchParams(location.search).get("session_id");
    if (!sid) return;
    cleanUrl();
    try {
      const { token } = await api("/api/unlock?session_id=" + encodeURIComponent(sid));
      store.set("unlockToken", token);
      unlockedNow("🎁 You're a supporter. Thank you!");
    } catch (e) {
      toast("Couldn't confirm the payment yet. Try “Restore purchase”.");
    }
  }

  async function reverifyToken() {
    const t = getToken();
    if (!t || t === "dev" || !ONLINE) return;
    try {
      const r = await api("/api/unlock?token=" + encodeURIComponent(t));
      if (r.valid === false) { store.set("unlockToken", null); renderMenu(); }
    } catch (e) { /* network/API missing: keep the unlock */ }
  }

  async function buy() {
    if (CONFIG.paymentLink) { location.href = CONFIG.paymentLink; return; }   // Stripe Payment Link; it should redirect back with ?session_id={CHECKOUT_SESSION_ID}
    const btn = $("#btn-buy");
    btn.disabled = true;
    btn.textContent = "Opening checkout…";
    try {
      const { url } = await api("/api/checkout", { method: "POST" });
      location.href = url;
    } catch (e) {
     window.open("https://buy.stripe.com/test_8x28wPcDFeDk5Zs40A5ZC00", "_blank", "noopener,noreferrer");
      btn.disabled = false;
      btn.textContent = `Unlock for ${CONFIG.price}`;
    }
  }

  async function restore(e) {
    e.preventDefault();
    const email = $("#restore-email").value.trim();
    if (!email) return;
    const btn = $("#btn-restore");
    btn.disabled = true;
    try {
      const { token } = await api("/api/restore", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      store.set("unlockToken", token);
      $("#dlg-paywall").close();
      unlockedNow("Purchase restored 🎁");
    } catch (err) {
      toast(err.status === 404 ? "No purchase found for that email." : "Couldn't restore right now.");
    } finally {
      btn.disabled = false;
    }
  }

  // =====================================================================
  // Player comparison ("better than X% of today's players") via Supabase
  // =====================================================================
  function cloud() {
    const c = window.CHRILLION_ONLINE || {};
    return c.supabaseUrl && c.supabaseAnonKey ? { url: c.supabaseUrl.replace(/\/+$/, ""), key: c.supabaseAnonKey } : null;
  }

  async function submitScore(day, score) {
    const c = cloud();
    if (!c || day < 1 || store.get("submitted:" + day, false)) return;
    try {
      const r = await fetch(`${c.url}/rest/v1/daily_scores`, {
        method: "POST",
        headers: { apikey: c.key, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ day, score, player: playerId() }),
      });
      if (r.ok || r.status === 409) store.set("submitted:" + day, true);
    } catch (e) { /* offline: try again next time results are shown */ }
  }

  async function fetchHistogram(day) {
    const c = cloud();
    const r = await fetch(`${c.url}/rest/v1/rpc/daily_histogram`, {
      method: "POST",
      headers: { apikey: c.key, "Content-Type": "application/json" },
      body: JSON.stringify({ p_day: day }),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return (await r.json()).map((row) => ({ bucket: Number(row.bucket), n: Number(row.n) }));
  }

  // =====================================================================
  // Screens & home
  // =====================================================================
  let state = null;   // { mode: daily|archive|unlimited, day, prompts, i, results, timer, deadline, answered }

  function total(results) { return results.reduce((s, r) => s + r.pts, 0); }
  function grid(results) { return results.map((r) => TIERS[r.tier].emoji).join(""); }

  function showScreen(id) {
    $$(".screen").forEach((s) => { s.hidden = s.id !== id; });
    $("#appbar").hidden = id === "game";
    window.scrollTo(0, 0);
    if (id === "menu") { renderMenu(); drawHero(); }
    if (window.Fx && id !== "game" && id !== "summary") window.Fx.clear();
    if (window.Scene && id !== "game") window.Scene.stop();
    if (window.Title && id !== "menu") window.Title.stop();
    if (window.BgScene) window.BgScene.setMood(id === "game" ? "game" : id === "summary" ? "summary" : "menu");
    if (id !== "online" && window.MerrillionOnlineUI && window.MerrillionOnlineUI.isOpen()) window.MerrillionOnlineUI.leave();
  }

  function xmasText() {
    const [y, m, d] = todayParts();
    const now = Date.UTC(y, m, d);
    let target = Date.UTC(y, 11, 25);
    if (now > target) target = Date.UTC(y + 1, 11, 25);
    const n = Math.round((target - now) / 864e5);
    if (n === 0) return "Merry Christmas!";
    if (n === 1) return "Christmas is tomorrow!";
    return `${n} sleeps until Christmas`;
  }

  function loadStats() {
    return Object.assign(
      { played: 0, totalPts: 0, best: 0, streak: 0, maxStreak: 0, lastDay: 0, miracles: 0, unlimitedPlayed: 0, unlimitedBest: 0 },
      store.get("stats", {})
    );
  }
  function currentStreak() { const s = loadStats(); return s.lastDay >= dayNumber() - 1 ? s.streak : 0; }

  function rating(score) {
    const pct = score / MAX_SCORE;
    if (pct >= 0.7) return "Christmas Legend";
    if (pct >= 0.5) return "Head Elf";
    if (pct >= 0.3) return "Jolly Good";
    if (pct >= 0.15) return "Cookie Thief";
    return "Naughty List";
  }

  function renderMenu() {
    const day = dayNumber();
    const saved = store.get("daily:" + day, null);
    const played = saved && saved.done;
    const unlocked = isUnlocked();
    const streak = currentStreak();
    const pastDays = Math.max(0, day - 1);

    $("#hero-eyebrow").textContent = day >= 1 ? `Sleigh Run #${day} · Streak ${streak}` : "Preview sleigh run";
    $("#hero-sub").textContent = played
      ? `You scored ${total(saved.results)} of ${MAX_SCORE}: ${rating(total(saved.results))}.`
      : "7 Christmas prompts · 25 seconds each";
    $("#daily-sub").textContent = played ? "Done ✓ · see your results" : streak > 0 ? `Keep your ${streak}-day streak alive!` : "Same 7 for everyone";
    renderTree($("#home-tree"), true);
    const badge = $("#streak-badge");
    badge.hidden = streak < 1;
    badge.innerHTML = (Spr ? Spr.svg("flame", 14) : "") + `<span>${streak}</span>`;

    $("#unl-sub").textContent = unlocked ? "Play as many as you like" : freeRunLeft() ? "1 free run on us" : "Supporters only";
    $("#arch-sub").textContent = pastDays ? `${pastDays} past run${pastDays === 1 ? "" : "s"}` : "Opens tomorrow";
    const s = loadStats();
    $("#stats-sub").textContent = s.played ? `Best ${s.best} · streak ${streak}` : "Streaks & records";
    $("#xmas-count").textContent = xmasText();

    const acct = window.Account && window.Account.user();
    $("#btn-account").lastChild.textContent = acct ? " Signed in · streak saved" : " Sign in to save your streak";
    $("#sl-acct").textContent = acct ? "Signed in" : "Save your streak";
    const top = $("#btn-unlock-top");
    top.hidden = unlocked;
    renderSheet();
  }

  // ---------- menu sheet ----------
  function renderSheet() {
    const unlocked = isUnlocked();
    const day = dayNumber();
    const card = $("#sheet-supporter");
    card.classList.toggle("is-supporter", unlocked);
    $("#sup-title").textContent = unlocked ? "You're a supporter 🎁" : "Become a supporter";
    $("#sup-sub").textContent = unlocked
      ? "Unlimited Runs and the full archive are unlocked. Thank you!"
      : `Every past run + endless fresh runs · ${CONFIG.price} once`;
    $("#sl-daily").textContent = day >= 1 ? `No. ${day}` : "Preview";
    $("#sl-unl").textContent = unlocked ? "Unlocked ∞" : freeRunLeft() ? "1 free run" : "Supporters";
    $("#sl-archive").textContent = day > 1 ? `${day - 1} past run${day - 1 === 1 ? "" : "s"}` : "Every past run";
    $("#tg-sfx").setAttribute("aria-pressed", String(Sfx.isSfx()));
    $("#tg-music").setAttribute("aria-pressed", String(Sfx.isMusic()));
    $("#btn-sfx").setAttribute("aria-pressed", String(Sfx.isSfx()));
    $("#btn-music").setAttribute("aria-pressed", String(Sfx.isMusic()));
    $("#sheet-foot").textContent = `Made for the holidays · ${xmasText()}`;
  }
  function openSheet() { renderSheet(); $("#sheet").hidden = false; document.body.classList.add("sheet-open"); Sfx.play("open"); $("#btn-sheet-close").focus(); }
  function closeSheet() { if ($("#sheet").hidden) return; $("#sheet").hidden = true; document.body.classList.remove("sheet-open"); Sfx.play("close"); }

  function toggleSfx() { Sfx.setSfx(!Sfx.isSfx()); renderSheet(); if (Sfx.isSfx()) Sfx.play("click"); }
  function toggleMusic() { Sfx.setMusic(!Sfx.isMusic()); renderSheet(); }

  function go(where) {
    closeSheet();
    ({
      daily: startDaily,
      online: openOnline,
      unlimited: startUnlimited,
      archive: openArchive,
      stats: openStats,
      how: openHow,
      faq: openFaq,
      feedback: () => openFeedback(),
      account: openAccount,
      more: openMoreGames,
      privacy: openPrivacy,
    }[where] || (() => {}))();
  }

  function openOnline() {
    if (window.MerrillionOnlineUI) { showScreen("online"); window.MerrillionOnlineUI.open(); }
    else toast("Online play is loading… try again in a moment.");
  }

  // =====================================================================
  // Runs
  // =====================================================================
  function storeKey() { return (state.mode === "archive" ? "archive:" : "daily:") + state.day; }

  function saveProgress(extra) {
    store.set(storeKey(), Object.assign({
      results: state.results, started: state.i + 1, done: false, ids: state.prompts.map((p) => p.id),
    }, extra));
  }

  // Use the prompts this player actually started with, so a site update mid-day can't swap them.
  function promptsFromIds(ids) {
    if (!Array.isArray(ids)) return null;
    const list = ids.map((id) => PROMPTS.find((p) => p.id === id));
    return list.every(Boolean) ? list : null;
  }

  function startStored(mode, day) {
    state = { mode, day, prompts: null, i: 0, results: [] };
    const saved = store.get(storeKey(), null);
    state.prompts = (saved && promptsFromIds(saved.ids)) || dailyPrompts(day);
    if (saved) {
      state.results = saved.results || [];
      if (saved.done) { showSummary(); return; }
      // Reloading or leaving mid-prompt counts that prompt as out of time.
      if ((saved.started || 0) > state.results.length && state.results.length < state.prompts.length) {
        const p = state.prompts[state.results.length];
        state.results.push({ id: p.id, input: "", tier: "timeout", matched: null, pts: 0 });
      }
      state.i = state.results.length;
    }
    if (state.i >= state.prompts.length) { completeDive(); return; }
    if (window.Fx) window.Fx.clear();
    showScreen("game");
    startPrompt();
  }

  function startDaily() { track("run_start", { mode: "daily" }); startStored("daily", dayNumber()); }

  function startArchive(day) {
    if (!isUnlocked()) { openPaywall(); return; }
    const daily = store.get("daily:" + day, null);
    if (daily && daily.done) {   // already played that day live: just show it
      state = { mode: "daily", day, prompts: promptsFromIds(daily.ids) || dailyPrompts(day), i: 0, results: daily.results };
      showSummary();
      return;
    }
    startStored("archive", day);
  }

  function freeRunLeft() { return !isUnlocked() && !store.get("freeUnl", false); }
  function startUnlimited() {
    if (!isUnlocked()) {
      if (!freeRunLeft()) { openPaywall(); return; }
      store.set("freeUnl", true);
      toast("Your free Unlimited Run, on the house 🎁");
    }
    track("run_start", { mode: "unlimited" });
    state = { mode: "unlimited", prompts: randomPrompts(), i: 0, results: [] };
    if (window.Fx) window.Fx.clear();
    showScreen("game");
    startPrompt();
  }

  // ---------- prompt loop ----------
  function renderDots() {
    const ol = $("#dots");
    ol.innerHTML = "";
    state.prompts.forEach((_, idx) => {
      const li = document.createElement("li");
      const r = state.results[idx];
      if (r) li.innerHTML = tierSprite(r.tier, 16);
      if (idx === state.i && !state.answered) li.classList.add("current");
      ol.appendChild(li);
    });
    $("#score").textContent = total(state.results);
  }

  function startPrompt() {
    const p = state.prompts[state.i];
    state.answered = false;
    state.lastSec = null;
    $("#prompt-num").textContent = `Prompt ${state.i + 1} of ${state.prompts.length}`;
    // Words drop in one by one.
    $("#prompt-text").innerHTML = p.text.split(" ").map((w, i) => `<span class="pw" style="--i:${i}">${esc(w)}</span>`).join(" ");
    const card = $(".prompt-card");
    card.classList.remove("card-in"); void card.offsetWidth; card.classList.add("card-in");
    $("#feedback").hidden = true;
    $("#answer-form").classList.remove("shake");   // only shake on an invalid answer
    $("#answer-form").hidden = false;
    say(pickLine(SAY.start));
    if (window.Journey) window.Journey.set(total(state.results), false);
    $("#answer-msg").textContent = "";
    state.pending = null;
    const input = $("#answer");
    input.value = "";
    input.disabled = false;
    input.focus();
    renderDots();
    $("#game").classList.remove("revealing");   // presents from earlier answers stay piled up
    if (window.Scene) window.Scene.play(state.i);   // a little festive scene plays while you think
    Sfx.play("start");
    Sfx.duck(true);

    if (state.mode !== "unlimited") saveProgress();

    state.deadline = performance.now() + CONFIG.secondsPerPrompt * 1000;
    clearInterval(state.timer);
    tick();
    state.timer = setInterval(tick, 100);
  }

  function tick() {
    const totalMs = CONFIG.secondsPerPrompt * 1000;
    const left = Math.max(0, state.deadline - performance.now());
    const sec = Math.ceil(left / 1000);
    $("#timer-fill").style.transform = `scaleX(${left / totalMs})`;
    $("#timer-sec").textContent = sec;
    $(".timer").classList.toggle("urgent", left <= 5000);
    if (sec !== state.lastSec) {
      if (sec <= 5 && sec >= 1 && state.lastSec !== null) Sfx.play("tick", sec);
      if (sec === 15) say(pickLine(SAY.mid));
      if (sec === 6) say(pickLine(SAY.late));
      state.lastSec = sec;
    }
    if (left <= 0) finishPrompt(null, true);
  }

  // Answers that aren't on the list don't count: shake the bar and let the player try again.
  function rejectAnswer(text, message) {
    $("#answer-msg").textContent = message || `“${text.trim()}” isn't on the list. Try again!`;
    const f = $("#answer-form");
    f.classList.remove("shake");
    void f.offsetWidth;            // restart the animation
    f.classList.add("shake");
    setTimeout(() => f.classList.remove("shake"), 420);
    say(pickLine(SAY.nope));
    Sfx.play("nope");
    $("#answer").select();
  }

  // Close spelling: ask before counting it.
  function suggestAnswer(text, r) {
    state.pending = { text, r };
    const msg = $("#answer-msg");
    msg.innerHTML = `Did you mean <b>${esc(r.display)}</b>? <button type="button" class="dym-btn" id="dym-yes">Yes</button> <button type="button" class="dym-btn dym-no" id="dym-no">No</button>`;
    Sfx.play("open");
    $("#dym-yes").addEventListener("click", () => {
      const pend = state.pending;
      state.pending = null;
      if (!pend || state.answered) return;
      Sfx.play("submit");
      finishPrompt(pend.text, false, pend.r);
    });
    $("#dym-no").addEventListener("click", () => {
      state.pending = null;
      rejectAnswer(text, "Okay! That one isn't on the list. Try another.");
    });
  }

  function finishPrompt(raw, timedOut, judged) {
    if (!state || state.answered) return;
    state.answered = true;
    clearInterval(state.timer);
    const typed = $("#answer").value.trim();
    $("#answer").disabled = true;
    Sfx.duck(false);

    const p = state.prompts[state.i];
    const r = timedOut ? { tier: "timeout", display: null } : (judged || judge(p, raw));
    const res = { id: p.id, input: timedOut ? typed : (raw || "").trim(), tier: r.tier, matched: r.display, pts: TIERS[r.tier].pts };
    state.results.push(res);
    if (state.mode !== "unlimited") saveProgress();
    Sfx.play(r.tier);
    $("#game").classList.add("revealing");      // hide the prompt so the sleigh has the sky to itself
    if (window.Scene) window.Scene.stop();
    if (window.Fx) window.Fx.celebrate(r.tier);
    renderDots();
    if (window.Journey) window.Journey.set(total(state.results));
    renderFeedback(p, res);
  }

  // ---------- advent tree + "what's next" (the reason to come back tomorrow) ----------
  function renderTree(el, compact, newDay) {
    const orn = store.get("ornaments", []);
    if (compact) {
      $("#tree-card").hidden = !window.AdventTree || !orn.length;
      $("#tree-cap").textContent = `Your advent tree · ${orn.length} ornament${orn.length === 1 ? "" : "s"} · ${xmasText()}`;
    }
    if (window.AdventTree && el && (orn.length || !compact)) window.AdventTree.render(el, orn, { compact, newDay });
  }
  function renderNext() {
    const daily = state.mode === "daily";
    const streak = currentStreak();
    $("#next-card").hidden = !window.AdventTree && !daily;
    renderTree($("#next-tree"), false, state.fresh ? state.newOrn : null);
    $("#next-streak").textContent = streak ? `🔥 ${streak}-day streak` : "";
    $("#next-msg").textContent = daily
      ? (state.newOrn ? "New ornament hung! Come back tomorrow for another one" : "Come back tomorrow for a new ornament") + (streak ? ` and make your streak ${streak + 1}.` : ".")
      : "Daily Sleigh Runs hang ornaments on your tree. Don't miss tomorrow's!";
    state.newOrn = null;
    const b = $("#btn-next-unl");
    const free = freeRunLeft();
    b.hidden = !(isUnlocked() || free);
    b.textContent = free ? "Play your FREE Unlimited run 🎁" : "Play another run";
  }

  // Jingle chats while you think.
  const SAY = {
    start: ["Think rare. The obvious stuff barely scores!", "Ooh, I know this one… do you?", "Skip the first thing in your head!", "Deep cuts fill the sleigh!", "Dig into that Christmas brain!", "Rare answers = more presents!"],
    mid: ["Tick tock, the reindeer are waiting!", "Still thinking? Go weird!", "Halfway there!", "Santa's checking his watch…"],
    late: ["Quick! The sleigh's leaving!", "Any answer beats no answer!", "Hurry, hurry, hurry!"],
    nope: ["Not on Santa's list! Try again.", "Hmm, nope. Another one!", "Close… but not quite!"],
  };
  const pickLine = (a) => a[Math.floor(Math.random() * a.length)];
  function say(text) {
    const b = $("#say-text");
    if (!b) return;
    b.textContent = text;
    const w = b.parentElement;
    w.classList.remove("say-pop"); void w.offsetWidth; w.classList.add("say-pop");
  }

  // Jingle the elf reacts to every answer.
  const REACTIONS = {
    miracle: ["NO WAY. A One in a Merrillion!", "Elf-credible! Nobody gets that one.", "Rare drop! Santa's taking notes.", "Absolute cinema.", "You actually ate that."],
    t75: ["Big brain pick!", "Ooh, deep cut. Respect.", "That's actually so good.", "Locked in!", "W answer."],
    t50: ["Nice, not everyone gets that!", "Solid pick.", "Clutch!", "Chat, we're so back.", "Chilly pick, I like it."],
    t25: ["Classic. Can't go wrong.", "Respect the classics.", "A crowd favourite!", "Safe and sound."],
    trap: ["Everyone said that one.", "Too clever… everyone tried it.", "Bruh. Regifted.", "Oof, the trap got you!"],
    t10: ["Mid… but it counts!", "Too basic! Go deeper next time.", "Everyone's first answer.", "Valid. Very, very basic."],
    timeout: ["The sleigh left without you!", "Frozen solid?", "Oof. Time's up!", "Not even close… to answering!"],
    miss: ["Hmm, that's not on the list."],
  };
  function react(tier) {
    const lines = REACTIONS[tier] || REACTIONS.miss;
    const bubble = $("#fb-bubble"), elf = $("#fb-elf");
    elf.innerHTML = Spr ? Spr.svg("elf", 44) : "";
    bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
    const box = bubble.parentElement;
    box.classList.remove("talk");
    void box.offsetWidth;
    box.classList.add("talk");
  }

  function renderFeedback(p, res) {
    const t = TIERS[res.tier];
    const fb = $("#feedback");
    $("#answer-form").hidden = true;
    fb.hidden = false;
    fb.dataset.tier = res.tier;
    $("#fb-emoji").innerHTML = tierSprite(res.tier, 56);
    react(res.tier);
    $("#fb-label").textContent = t.label;
    $("#fb-points").textContent = `+${t.pts}`;

    let said;
    if (res.tier === "timeout") said = res.input ? `“${res.input}”` : "No answer this time.";
    else if (res.tier === "miss") said = `“${res.input}” isn't a valid answer.`;
    else if (key(res.input) === key(res.matched)) said = `You said “${res.matched}”.`;
    else said = `You said “${res.input}”, which counts as ${res.matched}.`;
    $("#fb-said").textContent = said;

    let blurb = "";
    if (res.tier === "miracle") blurb = p.miracleNote || "You found the handpicked best answer!";
    else if (res.tier === "trap") blurb = p.trapNote || "Too clever. Everybody tries that one.";
    else if (res.tier === "timeout") blurb = "Never made it down the chimney.";
    $("#fb-blurb").textContent = blurb;

    // The other answers stay secret until the end of the run.
    $("#fb-best").innerHTML = `<p class="fb-later">Every answer for this prompt is revealed at the end of the run.</p>`;

    const last = state.i >= state.prompts.length - 1;
    $("#btn-next").textContent = last ? "See results" : "Next →";
    $("#btn-next").focus();
  }

  function nextPrompt() {
    state.i++;
    if (state.i < state.prompts.length) startPrompt();
    else completeDive();
  }

  // ---------- completion ----------
  function completeDive() {
    clearInterval(state.timer);
    Sfx.duck(false);
    const score = total(state.results);
    const miracles = state.results.filter((r) => r.tier === "miracle").length;
    if (state.mode === "daily") {
      const already = store.get("daily:" + state.day, {});
      if (!already.done) {
        saveProgress({ started: state.prompts.length, done: true });
        const s = loadStats();
        s.played++;
        s.totalPts += score;
        s.best = Math.max(s.best, score);
        s.streak = s.lastDay === state.day - 1 ? s.streak + 1 : 1;
        s.maxStreak = Math.max(s.maxStreak, s.streak);
        s.lastDay = state.day;
        s.miracles += miracles;
        store.set("stats", s);
        const orn = store.get("ornaments", []);
        if (!orn.some((o) => o.day === state.day)) { orn.push({ day: state.day, kind: window.AdventTree ? window.AdventTree.kindFor(score) : "plain" }); store.set("ornaments", orn); state.newOrn = state.day; }
      }
    } else if (state.mode === "archive") {
      saveProgress({ started: state.prompts.length, done: true });
    } else {
      const s = loadStats();
      s.unlimitedPlayed++;
      s.unlimitedBest = Math.max(s.unlimitedBest, score);
      s.miracles += miracles;
      store.set("stats", s);
    }
    state.fresh = true;   // play the count-up + fanfare
    showSummary();
    if (window.Account) window.Account.push();
  }

  // ---------- results ----------
  function modeLabel() {
    if (state.mode === "daily") return state.day >= 1 ? `Sleigh Run #${state.day} complete` : "Preview sleigh run complete";
    if (state.mode === "archive") return `Archive · Run #${state.day}`;
    return "Unlimited sleigh run";
  }

  function showSummary() {
    const score = total(state.results);
    $("#sum-mode").textContent = modeLabel();
    $("#sum-max").textContent = `/ ${MAX_SCORE}`;
    $("#sum-rating").textContent = rating(score);
    $("#sum-miles").textContent = `${(score * 10).toLocaleString()} sleigh miles`;
    $("#recap-score").textContent = `${score} pts`;
    $("#dist-score").textContent = `You: ${score} pts`;
    const ms = window.Journey && window.Journey.reached(score);
    $("#sum-journey").textContent = ms ? `You reached the ${ms.name}!` : "Score 50 to reach the Candy Cane!";
    track("run_complete", { mode: state.mode, score });
    renderNext();
    $("#sum-grid").innerHTML = state.results.map((r) => tierSprite(r.tier, 30)).join("");
    $("#btn-again").hidden = state.mode !== "unlimited";
    $("#upsell").hidden = isUnlocked();
    $("#st-streak").textContent = currentStreak();
    $("#st-mir").textContent = state.results.filter((r) => r.tier === "miracle").length;
    $("#st-top-k").textContent = state.mode === "unlimited" ? "Best" : "Today";
    $("#st-top").textContent = state.mode === "unlimited" ? loadStats().unlimitedBest : "—";
    $("#st-rank").textContent = state.mode === "unlimited" ? "unlimited score" : "";

    // Each prompt opens to show every accepted answer, grouped and colour-coded by tier.
    const ol = $("#breakdown");
    ol.innerHTML = state.results.map((r, idx) => {
      const p = state.prompts[idx];
      if (!p) return "";
      const yourKey = r.matched ? key(r.matched) : null;
      const groups = ["miracle", "t75", "t50", "t25", "trap", "t10"].map((t) => {
        const entries = t === "miracle" || t === "trap" ? (p[t] ? [p[t]] : []) : (p[t] || []);
        if (!entries.length) return "";
        const chips = entries.map((e) => {
          const name = e.split("|")[0];
          const you = yourKey && key(name) === yourKey;
          return `<span class="ans-chip${you ? " is-you" : ""}">${esc(name)}${you ? " <i>YOU</i>" : ""}</span>`;
        }).join("");
        return `<div class="ans-group" data-tier="${t}">
          <div class="ans-head">${tierSprite(t, 16)}<b>${esc(TIERS[t].label)}</b><span>${TIERS[t].pts} pts · ${entries.length}</span></div>
          <div class="ans-chips">${chips}</div></div>`;
      }).join("");
      const yours = r.tier === "timeout" ? (r.input ? `“${esc(r.input)}” · nothing landed` : "Nothing landed") : esc(r.matched || r.input || "—");
      return `<li data-tier="${esc(r.tier)}"><details class="bd">
        <summary><span class="bd-emoji">${tierSprite(r.tier, 24)}</span>
          <span class="bd-mid"><span class="bd-prompt">${esc(p.text)}</span><span class="bd-answer">${yours}</span></span>
          <span class="bd-pts">${r.pts}</span><span class="bd-caret" aria-hidden="true">▾</span></summary>
        <div class="ans-groups">${groups}</div>
      </details></li>`;
    }).join("");

    showScreen("summary");
    renderRecap(state.results);
    renderComparison(score);

    const fresh = state.fresh;
    state.fresh = false;
    countUp(score, fresh);
  }

  function countUp(score, animate) {
    const el = $("#sum-score");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animate && window.Fx) window.Fx.fadeOut();
    if (!animate || reduce || score === 0) {
      el.textContent = score;
      if (animate) Sfx.play("fanfare", score / MAX_SCORE);
      return;
    }
    const dur = 1100 + Math.min(score, 500);
    const t0 = performance.now();
    let lastTick = 0, done = false;
    // Safety net: if animation frames are paused (background tab), still show the final score.
    setTimeout(() => { if (!done) { done = true; el.textContent = score; } }, dur + 400);
    const step = (t) => {
      if (done) return;
      const p = Math.min(1, (t - t0) / dur);
      if (p >= 1) done = true;
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(score * eased);
      if (t - lastTick > 55 && p < 1) { Sfx.play("count", eased); lastTick = t; }
      if (p < 1) requestAnimationFrame(step);
      else Sfx.play("fanfare", score / MAX_SCORE);
    };
    requestAnimationFrame(step);
  }

  // Per-prompt column chart ("Gift log").
  function renderRecap(results) {
    const W = 340, H = 170, top = 18, base = 128, gap = 10;
    const n = Math.max(results.length, 1);
    const colW = (W - gap * (n + 1)) / n;
    let s = `<line x1="0" y1="${base}" x2="${W}" y2="${base}" stroke="#2b1d18" stroke-width="2"/>`;
    [25, 50, 75, 100].forEach((v) => {
      const y = base - (v / 100) * (base - top);
      s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="rgba(43,29,24,.14)" stroke-dasharray="4 4"/>`;
    });
    results.forEach((r, i) => {
      const x = gap + i * (colW + gap);
      const h = Math.max(3, (r.pts / 100) * (base - top));
      const y = base - h;
      s += `<rect x="${x}" y="${y}" width="${colW}" height="${h}" fill="${TIER_COLORS[r.tier]}" stroke="#2b1d18" stroke-width="2"/>`;
      s += `<text class="chart-val" x="${x + colW / 2}" y="${y - 5}" text-anchor="middle">${r.pts}</text>`;
      if (Spr) s += Spr.rects(Spr.TIER_SPRITE[r.tier] || "x", x + colW / 2 - 8, base + 6, 16 / 12);
      s += `<text class="chart-axis" x="${x + colW / 2}" y="${base + 36}" text-anchor="middle">${i + 1}</text>`;
    });
    $("#recap-chart").innerHTML = s;
  }

  // Until real player data exists, an estimated bell curve of typical scores (labelled as an estimate).
  function simulatedHist() {
    const out = [];
    for (let b = 0; b < 28; b++) { const c = b * 25 + 12.5; out.push({ bucket: b, n: Math.round(1000 * Math.exp(-((c - 230) ** 2) / (2 * 95 * 95))) }); }
    return out;
  }
  function percentile(hist, score) {
    const totalN = hist.reduce((a, h) => a + h.n, 0) || 1;
    const b = Math.min(Math.floor(score / 25), 27);
    const below = hist.reduce((a, h) => a + (h.bucket < b ? h.n : h.bucket === b ? h.n / 2 : 0), 0);
    return Math.round((below / totalN) * 100);
  }

  // The score "slope": how everyone scored, with you marked on the curve.
  function drawDistribution(score, hist) {
    const svg = $("#dist-chart");
    const W = 340, H = 172, padL = 14, padR = 14, top = 30, base = 128;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const h = hist && hist.length ? hist : simulatedHist();
    const x = (v) => padL + (v / MAX_SCORE) * (W - padL - padR);
    const pts = [];
    let maxD = 0;
    for (let v = 0; v <= MAX_SCORE; v += 5) {
      let d = 0;
      h.forEach(({ bucket, n }) => { const c = bucket * 25 + 12.5; d += n * Math.exp(-((v - c) ** 2) / (2 * 40 * 40)); });
      pts.push([v, d]);
      maxD = Math.max(maxD, d);
    }
    const y = (d) => base - (d / (maxD || 1)) * (base - top);
    const line = pts.map(([v, d], i) => `${i ? "L" : "M"}${x(v).toFixed(1)},${y(d).toFixed(1)}`).join(" ");
    let s = `<defs><pattern id="distFill" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#2f7a46" fill-opacity=".2"/><rect width="3" height="3" fill="#2f7a46" fill-opacity=".3"/></pattern></defs>`;
    s += `<path d="${line} L${x(MAX_SCORE)},${base} L${x(0)},${base} Z" fill="url(#distFill)"/>`;
    s += `<path d="${line}" fill="none" stroke="#1d5230" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<line x1="${padL}" y1="${base}" x2="${W - padR}" y2="${base}" stroke="#2b1d18" stroke-width="2"/>`;
    for (let v = 0; v <= MAX_SCORE; v += 100) {
      s += `<line x1="${x(v)}" y1="${base}" x2="${x(v)}" y2="${base + 5}" stroke="#2b1d18" stroke-width="2"/>`;
      s += `<text class="chart-axis" x="${x(v)}" y="${base + 19}" text-anchor="middle">${v}</text>`;
    }
    // Height of the curve at any score (smooth, for Santa's sled ride).
    const yAt = (v) => {
      const f = Math.max(0, Math.min(pts.length - 1, v / 5)), i0 = Math.floor(f), i1 = Math.min(pts.length - 1, i0 + 1), k = f - i0;
      return y(pts[i0][1] * (1 - k) + pts[i1][1] * k);
    };
    const sx = x(Math.min(score, MAX_SCORE)), sy = yAt(score);
    s += `<line id="dist-drop" x1="${sx}" y1="${sy}" x2="${sx}" y2="${base}" stroke="#c8323a" stroke-width="2" stroke-dasharray="4 3" opacity="0"/>`;
    // A little pixel Santa sleds along the curve to your score.
    s += `<g id="dist-santa">${Spr ? Spr.rects("santa", -12, -22, 2) : `<rect x="-6" y="-6" width="12" height="12" fill="#c8323a"/>`}</g>`;
    s += `<text id="dist-you" class="chart-you" x="${Math.min(W - 24, Math.max(24, sx))}" y="${Math.max(16, sy - 28)}" text-anchor="middle" fill="#c8323a" opacity="0">YOU</text>`;
    svg.innerHTML = s;
    const paths = svg.querySelectorAll("path");
    const area = paths[0], curve = paths[1];
    const santa = $("#dist-santa"), drop = $("#dist-drop"), you = $("#dist-you");
    const place = (v) => santa.setAttribute("transform", `translate(${x(v).toFixed(1)},${yAt(v).toFixed(1)})`);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(drawDistribution.raf);
      curve.style.transition = "none";
      area.style.transition = "none";
      curve.style.strokeDashoffset = "0";
      area.style.opacity = "1";
      place(score);
      drop.setAttribute("opacity", "1");
      you.setAttribute("opacity", "1");
      you.classList.add("pop");
    };
    cancelAnimationFrame(drawDistribution.raf);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
    // Draw the curve in, fade the fill, then Santa rides from 0 to your score.
    const len = curve.getTotalLength ? curve.getTotalLength() : 900;
    curve.style.strokeDasharray = len;
    curve.style.strokeDashoffset = len;
    area.style.opacity = "0";
    curve.getBoundingClientRect();
    curve.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)";
    area.style.transition = "opacity 0.9s ease 0.3s";
    curve.style.strokeDashoffset = "0";
    area.style.opacity = "1";
    place(0);
    const t0 = performance.now(), delay = 450, dur = 1600;
    const step = () => {
      if (done) return;
      const p = Math.max(0, Math.min(1, (performance.now() - t0 - delay) / dur));
      place(score * (1 - Math.pow(1 - p, 3)));
      if (p < 1) drawDistribution.raf = requestAnimationFrame(step);
      else finish();
    };
    drawDistribution.raf = requestAnimationFrame(step);
    setTimeout(finish, delay + dur + 600);   // safety net: Santa always ends up on your score
  }

  function ordinal(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n.toLocaleString() + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function setDistText(text, note) {
    $("#dist-text").textContent = text;
    $("#dist-note").textContent = note || "";
  }

  async function renderComparison(score) {
    const card = $("#dist-card");
    card.hidden = state.mode === "unlimited";
    if (card.hidden) return;
    // Start with the estimated curve; swap in real player data when it's available.
    drawDistribution(score, null);
    const est = `Better than ~${percentile(simulatedHist(), score)}% of players`;
    const day = state.day;
    if (day < 1) { setDistText(est, "Estimated curve. Live player comparison starts with Sleigh Run #1."); $("#st-rank").textContent = "soon"; return; }
    if (!cloud()) { setDistText(est, "Estimated curve. Live player comparison turns on once the site is online."); $("#st-rank").textContent = "once online"; return; }
    setDistText(est, "Estimated curve · loading today's players…");
    try {
      if (state.mode === "daily") await submitScore(day, score);
      const hist = await fetchHistogram(day);
      if (state.day !== day) return;
      const totalN = hist.reduce((a, b) => a + b.n, 0);
      if (totalN < CONFIG.minPlayersForCurve) {
        setDistText(est, `Estimated curve. You're one of the first ${Math.max(totalN, 1)} players${state.mode === "daily" ? " today" : ""}, so check back later!`);
        return;
      }
      drawDistribution(score, hist);
      const b = Math.min(Math.floor(score / 25), 27);
      const pct = percentile(hist, score);
      setDistText(`Better than ${pct}% of ${state.mode === "daily" ? "today's" : "that day's"} players`, `${totalN.toLocaleString()} players so far`);
      // Rank estimate from the score buckets, Daily Holes style ("Top 29% · ≈62nd of 219").
      const above = hist.reduce((a, h) => a + (h.bucket > b ? h.n : h.bucket === b ? h.n / 2 : 0), 0);
      const rank = Math.min(totalN, Math.round(above) + 1);
      $("#st-top").textContent = `Top ${Math.max(1, Math.ceil((rank / totalN) * 100))}%`;
      $("#st-rank").textContent = `≈${ordinal(rank)} of ${totalN.toLocaleString()}`;
    } catch (e) {
      setDistText(est, "Estimated curve. Couldn't load other players' scores right now.");
    }
  }

  // ---------- share ----------
  const shareUrl = () => (ONLINE ? location.origin + location.pathname : "");
  function shareTitle() {
    return state.mode === "daily" ? `${CONFIG.name} ${dayLabel(state.day)}`
      : state.mode === "archive" ? `${CONFIG.name} #${state.day} (archive)` : `${CONFIG.name} Unlimited`;
  }
  function shareText(withUrl = true) {
    const url = withUrl && ONLINE ? "\n" + shareUrl() : "";
    const score = total(state.results);
    return `${shareTitle()} 🎄 ${score}/${MAX_SCORE} · ${(score * 10).toLocaleString()} sleigh miles\n${grid(state.results)}\nCan you beat me?${url}`;
  }

  async function copyText(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg); }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast(msg); } catch (err) { toast("Couldn't copy, sorry"); }
      ta.remove();
    }
  }

  const E = encodeURIComponent;
  const PLATFORMS = [
    { id: "whatsapp", label: "WhatsApp", color: "#1f9e55", make: (t) => `https://wa.me/?text=${E(t)}` },
    { id: "x", label: "X", color: "#1b1b1b", make: (t) => `https://twitter.com/intent/tweet?text=${E(t)}` },
    { id: "facebook", label: "Facebook", color: "#1d66d8", needsUrl: true, make: (t, u) => `https://www.facebook.com/sharer/sharer.php?u=${E(u)}&quote=${E(t)}` },
    { id: "messages", label: "Messages", color: "#2e9e4a", make: (t) => `sms:?&body=${E(t)}`, direct: true },
    { id: "reddit", label: "Reddit", color: "#e2470f", make: (t, u) => (u ? `https://www.reddit.com/submit?url=${E(u)}&title=${E(shareTitle() + " · " + total(state.results) + "/" + MAX_SCORE)}` : `https://www.reddit.com/submit?selftext=true&title=${E(shareTitle())}&text=${E(t)}`) },
    { id: "telegram", label: "Telegram", color: "#1c8cc7", make: (t, u) => `https://t.me/share/url?url=${E(u || " ")}&text=${E(shareText(false))}` },
    { id: "threads", label: "Threads", color: "#2b1d18", make: (t) => `https://www.threads.net/intent/post?text=${E(t)}` },
    { id: "bluesky", label: "Bluesky", color: "#1270d8", make: (t) => `https://bsky.app/intent/compose?text=${E(t)}` },
    { id: "discord", label: "Discord", color: "#4f5bd5", copy: "Copied! Paste it in Discord." },
    { id: "email", label: "Email", color: "#6e5a4c", make: (t) => `mailto:?subject=${E("My " + shareTitle() + " score")}&body=${E(t)}`, direct: true },
  ];

  function shareTo(id) {
    const p = PLATFORMS.find((x) => x.id === id);
    if (!p) return;
    Sfx.play("share");
    const text = shareText();
    if (p.copy) { copyText(text, p.copy); return; }
    if (p.needsUrl && !ONLINE) { copyText(text, `${p.label} sharing works once the site is online. Text copied instead!`); return; }
    const url = p.make(text, shareUrl());
    if (p.direct) location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
  }

  function drawSprite(ctx, name, x, y, cell) {
    if (!Spr) return;
    Spr.runs(name).runs.forEach((r) => { ctx.fillStyle = r.c; ctx.fillRect(x + r.x * cell, y + r.y * cell, r.w * cell + 0.5, cell + 0.5); });
  }

  // A knitted result card (1080×1350) for stories and posts.
  async function drawShareCard() {
    const c = $("#share-card"), W = 1080, H = 1350, ctx = c.getContext("2d");
    try { await Promise.all([document.fonts.load('120px "Jersey 15"'), document.fonts.load('700 40px "Atkinson Hyperlegible"')]); } catch (e) { /* fall back to system fonts */ }
    const score = total(state.results);
    ctx.fillStyle = "#5e1219";
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 20) for (let x = 0; x < W; x += 24) {
      [[0.3, -0.38], [0.7, 0.38]].forEach(([cx, rot]) => {
        ctx.beginPath(); ctx.ellipse(x + 24 * cx, y + 10, 5.8, 12, rot, 0, Math.PI * 2); ctx.fillStyle = "#781b25"; ctx.fill();
      });
    }
    // Snowdrifts along the top and bottom edges.
    ctx.fillStyle = "#f6ecd6";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0);
    for (let x = W, k = 0; x >= -60; x -= 60, k++) ctx.quadraticCurveTo(x - 30, 70 + (k % 3) * 14, x - 60, 48);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, H);
    for (let x = W, k = 0; x >= -70; x -= 70, k++) ctx.quadraticCurveTo(x - 35, H - 78 - (k % 3) * 16, x - 70, H - 46);
    ctx.closePath(); ctx.fill();
    ctx.textAlign = "center";
    ctx.font = '150px "Jersey 15", Impact, sans-serif';
    ctx.fillStyle = "#8e1f26"; ctx.fillText(CONFIG.name, W / 2 + 7, 247);
    ctx.fillStyle = "#f6ecd6"; ctx.fillText(CONFIG.name, W / 2, 240);
    ctx.font = '60px "Jersey 15", Impact, sans-serif';
    ctx.fillStyle = "#f2c14e";
    const sub = state.mode === "unlimited" ? "UNLIMITED SLEIGH RUN" : state.day >= 1 ? `SLEIGH RUN #${state.day} · ${dayDate(state.day).toUpperCase()}` : "PREVIEW SLEIGH RUN";
    ctx.fillText(sub, W / 2, 322);
    // Cream knitted patch.
    const px = 90, py = 380, pw = 900, ph = 760;
    ctx.fillStyle = "rgba(30,6,9,.45)";
    ctx.fillRect(px, py + 12, pw, ph);
    ctx.fillStyle = "#f4e8d0";
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 26); ctx.fill(); } else ctx.fillRect(px, py, pw, ph);
    ctx.setLineDash([22, 14]); ctx.strokeStyle = "rgba(43,29,24,.35)"; ctx.lineWidth = 5;
    ctx.strokeRect(px + 20, py + 20, pw - 40, ph - 40);
    ctx.setLineDash([]);
    ctx.fillStyle = "#2b1d18";
    ctx.font = '330px "Jersey 15", Impact, sans-serif';
    ctx.fillText(String(score), W / 2, py + 330);
    ctx.font = '72px "Jersey 15", Impact, sans-serif';
    ctx.fillStyle = "#6e5a4c";
    ctx.fillText(`/ ${MAX_SCORE} · ${(score * 10).toLocaleString()} SLEIGH MILES`, W / 2, py + 420);
    ctx.fillStyle = "#c8323a";
    ctx.font = '84px "Jersey 15", Impact, sans-serif';
    ctx.fillText(rating(score).toUpperCase(), W / 2, py + 520);
    const n = state.results.length, cell = 8, size = 12 * cell, gap = 22;
    const startX = (W - (n * size + (n - 1) * gap)) / 2;
    state.results.forEach((r, i) => drawSprite(ctx, (Spr && Spr.TIER_SPRITE[r.tier]) || "x", startX + i * (size + gap), py + 580, cell));
    ctx.fillStyle = "#f6ecd6";
    ctx.font = '64px "Jersey 15", Impact, sans-serif';
    ctx.fillText("CAN YOU BEAT IT?", W / 2, H - 140);
    ctx.fillStyle = "#f2c14e";
    ctx.font = '46px "Jersey 15", Impact, sans-serif';
    ctx.fillText(ONLINE ? location.host.toUpperCase() : "MERRILLION", W / 2, H - 92);
  }

  async function openShare() {
    Sfx.play("open");
    $("#dlg-share").showModal();
    await drawShareCard();
  }

  async function nativeShare() {
    const text = shareText();
    const blob = await new Promise((r) => $("#share-card").toBlob(r, "image/png"));
    const file = blob ? new File([blob], "merrillion-run.png", { type: "image/png" }) : null;
    try {
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
      if (navigator.share) { await navigator.share({ title: shareTitle(), text, url: shareUrl() || undefined }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    copyText(text, "Copied! Paste it anywhere.");
  }

  function saveImage() {
    const a = document.createElement("a");
    a.download = "merrillion-run.png";
    a.href = $("#share-card").toDataURL("image/png");
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast("Image saved. Post it to your story!");
  }

  // =====================================================================
  // Archive
  // =====================================================================
  function openArchive() {
    const today = dayNumber();
    const unlocked = isUnlocked();
    const list = $("#archive-list");
    list.innerHTML = "";
    if (today <= 1) {
      $("#archive-note").textContent = "Every past Daily Sleigh Run lands here, starting tomorrow.";
    } else {
      $("#archive-note").textContent = unlocked
        ? "Play any past Daily Sleigh Run. Archive scores don't affect your streak."
        : "The archive is for supporters. Tap any run to unlock.";
      for (let d = today - 1; d >= 1; d--) {
        const daily = store.get("daily:" + d, null);
        const arch = store.get("archive:" + d, null);
        const done = (daily && daily.done && daily) || (arch && arch.done && arch);
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.innerHTML = `<span><b>Run #${d}</b><small>${esc(dayDate(d))}</small></span>` +
          `<span class="arch-score">${done ? `${total(done.results)} pts` : unlocked ? "Play" : "Locked"}</span>`;
        b.addEventListener("click", () => startArchive(d));
        li.appendChild(b);
        list.appendChild(li);
      }
    }
    showScreen("archive");
  }

  // =====================================================================
  // Dialogs
  // =====================================================================
  function openHow() {
    const ul = $("#tier-list");
    ul.innerHTML = "";
    ["miracle", "t75", "t50", "t25", "trap", "t10", "timeout"].forEach((k) => {
      const t = TIERS[k];
      const li = document.createElement("li");
      li.style.setProperty("--tc", TIER_COLORS[k]);
      li.dataset.tier = k;
      li.innerHTML = `<span>${tierSprite(k, 22)}</span><span>${esc(t.label)}<span class="desc">${esc(t.desc)}</span></span><b>${t.pts}</b>`;
      ul.appendChild(li);
    });
    $("#dlg-how").showModal();
  }

  const CONTACT = "merrilion.help@gmail.com";
  function track(event, params) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event }, params)); } catch (e) { /* ignore */ } }
  function openAccount() { if (window.Account) window.Account.open(); else toast("Accounts are loading… try again in a moment."); }
  function openMoreGames() {
    openInfo("More games", `<div class="more-games"><div class="mg-card"><b>Coming soon</b><p>More daily rare-answer games are being wrapped up in Santa's workshop. 🎁</p></div><p class="muted">Got an idea for one? <a href="mailto:${CONTACT}">${CONTACT}</a></p></div>`);
  }
  function openPrivacy() {
    openInfo("Privacy", `<p>Merrillion keeps your stats and streak in your browser. If you sign in, we store your email and stats in your account so they sync between devices.</p><p>We use Google Analytics (via Google Tag Manager) to count visits and see which features people use. Payments are handled by Stripe; we never see your card.</p><p>Feedback you send is stored so we can read it. We don't sell your data.</p><p>Questions or delete requests: <a href="mailto:${CONTACT}">${CONTACT}</a></p>`);
  }

  function openInfo(title, html) {
    $("#info-title").textContent = title;
    $("#info-body").innerHTML = html;
    $("#dlg-info").showModal();
  }

  // ---------- feedback (stored in Supabase's "feedback" table) ----------
  function openFeedback(prefill) {
    const f = $("#feedback-form");
    f.reset();
    if (prefill) $("#fb-message").value = prefill;
    $("#fb-send").disabled = false;
    $("#dlg-feedback").showModal();
    setTimeout(() => $(prefill ? "#fb-message" : "#fb-email").focus(), 30);
  }

  async function sendFeedback(e) {
    e.preventDefault();
    const message = $("#fb-message").value.trim();
    const email = $("#fb-email").value.trim();
    if (message.length < 3) { toast("Please write a little more."); return; }
    const c = cloud();
    if (!c) { toast("Feedback sending works once the site is online."); return; }
    const btn = $("#fb-send");
    btn.disabled = true;
    const context = state && state.prompts ? `${state.mode} ${state.day || ""} · ${state.prompts.map((p) => p.id).join(",")}` : "menu";
    try {
      const r = await fetch(`${c.url}/rest/v1/feedback`, {
        method: "POST",
        headers: { apikey: c.key, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ message: message.slice(0, 2000), email: email ? email.slice(0, 200) : null, context: context.slice(0, 500) }),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      $("#dlg-feedback").close();
      Sfx.play("share");
      toast("Thanks! Your feedback was sent.");
    } catch (err) {
      btn.disabled = false;
      toast("Couldn't send right now. Please try again.");
    }
  }

  // FAQ as an accordion: tap a question to open it.
  const FAQ = [
    ["What is Merrillion?", "A Christmas word game. Every day there's a Daily Sleigh Run of 7 Christmas prompts, like “Name one of Santa's reindeer”. You get 25 seconds per prompt, and the rarer your answer, the more it's worth."],
    ["Who is the game for?", "Anyone who loves Christmas, trivia or a bit of friendly competition. The prompts are made so most people can answer something, and the deep cuts reward people who really know their stuff."],
    ["How many prompts are in a Daily Sleigh Run?", "Seven, with 25 seconds each. A perfect run (a One in a Merrillion on every prompt) scores 700."],
    ["How does rare-answer scoring work?", "Every answer has a fixed value set in advance by how familiar it is: Obvious 10, Classic 25, Good Pick 50, Rare Find 75, and one handpicked One in a Merrillion worth 100. The “clever” answer everyone tries is Regifted, worth 15. Your score never depends on what other players typed."],
    ["Can I try again after a wrong answer?", "Yes. If your answer isn't on the list, the answer bar shakes and you can keep trying until the timer runs out. Once a valid answer lands, it's locked in."],
    ["Do spelling mistakes count?", "Small ones are fine. Capitals, accents and “the” are ignored, and if you're one or two letters off we'll ask “Did you mean…?” so you can confirm."],
    ["How are the answer lists made?", "Each list is pulled together from reference sources (encyclopedias, wikis, film, music and food databases) with some AI help, then cleaned up and checked. Different spellings of the same answer are merged."],
    ["Why is the One in a Merrillion sometimes less rare than a Rare Find?", "It isn't chosen on rarity alone. It's the answer that's most satisfying to land, usually with a fun story behind it, and one that at least a few players actually get."],
    ["Why wasn't my answer accepted?", "It's probably missing from the list, sorry! The lists get updated between runs, so it may count in future."],
    ["When does the Daily Sleigh Run reset?", "At midnight in your time zone. Everyone gets the same 7 prompts that day."],
    ["What happens if I close the game mid-run?", "Your progress is saved. When you come back you'll pick up where you left off, but the prompt you were on when you left counts as out of time."],
    ["Does my progress sync between devices?", "Yes, if you sign in (Menu → My account) we save your streak and stats to your account. Without an account they live in this browser. If you're a supporter, use “Restore purchase” with your checkout email to unlock on a new device."],
    ["Can I play with friends?", "Yes! Play Online → Create a private room and send the code, or try Practice with bots. Everyone sits in a circle and takes turns in Pass the Parcel."],
    ["Is Merrillion free to play?", `The Daily Sleigh Run and online play are free, no account needed. Everyone gets one free Unlimited Run. Supporters (${CONFIG.price}, one time) get Unlimited Runs and the full archive.`],
  ];
  function openFaq() {
    openInfo("FAQ", `<div class="faq">${FAQ.map(([q, a]) => `<details><summary><span>${esc(q)}</span><i aria-hidden="true"></i></summary><p>${esc(a)}</p></details>`).join("")}</div>`);
  }

  function openStats() {
    const s = loadStats();
    const items = [
      [s.played, "Dailies played"],
      [s.played ? Math.round(s.totalPts / s.played) : 0, "Average"],
      [s.best, "Best daily"],
      [currentStreak(), "Current streak"],
      [s.maxStreak, "Best streak"],
      [s.miracles, "Miracles"],
    ];
    if (isUnlocked()) items.push([s.unlimitedPlayed, "Unlimited played"], [s.unlimitedBest, "Best unlimited"]);
    $("#stat-grid").innerHTML = items.map(([v, l]) => `<div class="stat"><b>${v}</b><span>${esc(l)}</span></div>`).join("");
    $("#dlg-stats").showModal();
  }

  function openPaywall() {
    $("#pay-price").textContent = `${CONFIG.price} · one time`;
    const btn = $("#btn-buy");
    btn.disabled = !ONLINE;
    btn.textContent = ONLINE ? `Unlock for ${CONFIG.price}` : "Checkout works once the site is online";
    $("#dlg-paywall").showModal();
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
  }

  // ---------- clocks ----------
  function updateClocks() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const s = Math.max(0, Math.floor((midnight - now) / 1000));
    const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
    const txt = `Next Daily Sleigh Run in ${hh}h ${String(mm).padStart(2, "0")}m ${String(ss).padStart(2, "0")}s`;
    $$("[data-countdown]").forEach((el) => { el.textContent = txt; });
    if (!$("#menu").hidden && s === 0) renderMenu();
  }

  // ---------- snow ----------
  function startSnow() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = $("#snow"), ctx = c.getContext("2d");
    let w = 0, h = 0, flakes = [];
    const make = (anyY) => ({ x: Math.random() * w, y: anyY ? Math.random() * h : -10, r: 0.8 + Math.random() * 2.2, vy: 0.3 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2 });
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(110, Math.round((w * h) / 14000));
      while (flakes.length < target) flakes.push(make(true));
      flakes.length = target;
    }
    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(246,236,214,0.7)";
      for (const f of flakes) {
        f.y += f.vy;
        f.x += Math.sin(t / 1500 + f.phase) * 0.3;
        if (f.y > h + 10) Object.assign(f, make(false));
        const sz = f.r > 2 ? 4 : f.r > 1.4 ? 3 : 2;       // square "stitch" flakes to match the pixel art
        ctx.fillRect(Math.round(f.x), Math.round(f.y), sz, sz);
      }
      requestAnimationFrame(frame);
    }
    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(frame);
  }

  // =====================================================================
  // Wire up
  // =====================================================================
  function drawHero() {
    if (window.Title) { window.Title.start(); return; }   // the animated moonlit title scene
    const c = $("#hero-knit");
    if (c && Spr && c.clientWidth) Spr.drawKnit(c);
  }

  function init() {
    tidyPrompts();
    $$("[data-name]").forEach((el) => { el.textContent = CONFIG.name; });
    if (Spr) Spr.hydrate();
    drawHero();
    let heroTimer;
    window.addEventListener("resize", () => { clearTimeout(heroTimer); heroTimer = setTimeout(drawHero, 150); });

    // Dev helpers (local only): ?unlock=dev unlocks supporter features, ?reset replays today's run.
    const params = new URLSearchParams(location.search);
    if (LOCAL && params.get("unlock") === "dev") {
      store.set("unlockToken", "dev");
      setTimeout(() => toast("Supporter features unlocked (dev mode)"), 300);
      cleanUrl();
    }
    // Owner unlock (live site): open the site once with ?owner=YOUR_CODE (the OWNER_CODE set in Vercel).
    // The server checks the code and hands back a signed unlock, so the code never appears in this file.
    const ownerCode = params.get("owner");
    if (ownerCode) {
      cleanUrl();
      if (LOCAL) { store.set("unlockToken", "dev"); setTimeout(() => toast("Owner unlock active on this computer"), 300); }
      else {
        api("/api/unlock?owner=" + encodeURIComponent(ownerCode))
          .then(({ token }) => { store.set("unlockToken", token); unlockedNow("Owner unlock active. Unlimited runs are yours!"); })
          .catch(() => toast("That owner code didn't work."));
      }
    }
    if (LOCAL && params.has("reset")) {
      const d = dayNumber();
      try { localStorage.removeItem("chrillion:daily:" + d); localStorage.removeItem("chrillion:submitted:" + d); } catch (e) { /* ignore */ }
      setTimeout(() => toast("Today's run has been reset"), 300);
      cleanUrl();
    }

    // Soft click on every button (specific actions add their own sounds on top).
    document.addEventListener("click", (e) => { if (e.target.closest("button")) Sfx.play("click"); });

    $("#btn-home").addEventListener("click", () => { closeSheet(); showScreen("menu"); });
    $("#btn-menu").addEventListener("click", openSheet);
    $("#btn-sheet-close").addEventListener("click", closeSheet);
    $("#sheet").addEventListener("click", (e) => { if (e.target.id === "sheet") closeSheet(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });
    $$(".sheet-list [data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
    $("#sheet-supporter").addEventListener("click", () => { if (!isUnlocked()) { closeSheet(); openPaywall(); } });
    $("#btn-unlock-top").addEventListener("click", openPaywall);
    $("#btn-sfx").addEventListener("click", toggleSfx);
    $("#btn-music").addEventListener("click", toggleMusic);
    $("#tg-sfx").addEventListener("click", toggleSfx);
    $("#tg-music").addEventListener("click", toggleMusic);

    $("#btn-daily").addEventListener("click", startDaily);
    $("#btn-online").addEventListener("click", openOnline);
    $("#btn-unlimited").addEventListener("click", startUnlimited);
    $("#btn-account").addEventListener("click", openAccount);
    $$(".site-foot [data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
    $("#btn-archive").addEventListener("click", openArchive);
    $("#btn-how").addEventListener("click", openHow);
    $("#btn-stats").addEventListener("click", openStats);
    $("#btn-menu-home").addEventListener("click", () => showScreen("menu"));
    $$("[data-home]").forEach((b) => b.addEventListener("click", () => showScreen("menu")));
    $("#btn-again").addEventListener("click", startUnlimited);
    $("#btn-next-unl").addEventListener("click", startUnlimited);
    $("#btn-next-online").addEventListener("click", openOnline);
    $("#tree-card").addEventListener("click", () => toast("Finish each Daily Sleigh Run to hang a new ornament. Better runs earn rarer ones!"));
    $("#upsell").addEventListener("click", openPaywall);
    $("#btn-share").addEventListener("click", openShare);
    $("#feedback-form").addEventListener("submit", sendFeedback);
    $("#btn-missing").addEventListener("click", () => openFeedback("Missing answer: (prompt) → (your answer)\n"));
    $("#sh-native").addEventListener("click", nativeShare);
    $("#sh-image").addEventListener("click", saveImage);
    $("#sh-copy").addEventListener("click", () => copyText(shareText(), "Copied! Paste it anywhere."));
    $("#share-grid").innerHTML = PLATFORMS.map((p) => `<button class="share-btn" data-p="${p.id}" style="--pc:${p.color}"><i></i>${esc(p.label)}</button>`).join("");
    $("#share-grid").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (b) shareTo(b.dataset.p); });
    $("#btn-next").addEventListener("click", nextPrompt);
    $("#btn-buy").addEventListener("click", buy);
    $("#restore-form").addEventListener("submit", restore);

    let lastKey = 0;
    $("#answer").addEventListener("keydown", (e) => {
      if (e.key.length === 1 && performance.now() - lastKey > 35) { Sfx.play("key"); lastKey = performance.now(); }
    });
    $("#answer-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = $("#answer").value;
      if (!v.trim() || !state || state.answered) return;
      const r = judge(state.prompts[state.i], v);
      if (r.tier === "miss") { rejectAnswer(v); return; }
      if (r.fuzzy) { suggestAnswer(v, r); return; }
      Sfx.play("submit");
      finishPrompt(v, false, r);
    });
    $("#answer").addEventListener("input", () => {
      if (state && state.pending) { state.pending = null; $("#answer-msg").textContent = ""; }
    });

    $("#btn-quit").addEventListener("click", () => {
      if (state && !state.answered && state.mode !== "unlimited") {
        if (!confirm("Leave this run? The current prompt will count as out of time.")) return;
      }
      if (state) clearInterval(state.timer);
      Sfx.duck(false);
      showScreen("menu");
    });

    renderMenu();
    updateClocks();
    setInterval(updateClocks, 1000);
    handleCheckoutReturn();
    reverifyToken();
    if (window.Journey) window.Journey.mount($("#journey"));
    if (window.Account) window.Account.init({ getStats: loadStats, setStats: (s) => { store.set("stats", s); renderMenu(); }, onChange: () => renderMenu() });

    if (!store.get("seenHow", false)) { store.set("seenHow", true); openHow(); }

    // Shared with online-ui.js, and a hook for automated tests.
    window.Merrillion = { judge, key, TIERS, PROMPTS, store, toast, showScreen, esc, CONFIG, tierSprite };
    window.CHRILLION_DEBUG = { judge, key, dailyPrompts, dayNumber, PROMPTS, drawDistribution, renderRecap };
  }

  init();
})();
