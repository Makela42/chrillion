(() => {
  "use strict";

  // =====================================================================
  // CONFIG: change these freely
  // =====================================================================
  const CONFIG = {
    name: "Mogillion",
    promptsPerDive: 7,
    secondsPerPrompt: 25,
    epoch: "2026-11-21",      // the day the site opened = Daily Mog Check #1 (YYYY-MM-DD)
    price: "$3.99",           // display only; the real price is set in Stripe
    apiBase: "",              // where the /api functions live ("" = same site; paths below are absolute "/api/...")
    paymentLink: "https://buy.stripe.com/eVqdRb4LB37caCH8Lpg7e01",   // the Mog Pass Stripe Payment Link (its own link, separate from Merrillion's)
    siteUrl: "https://www.merrillion.site/mogillion/",   // used in share / challenge links
    scoreDayOffset: 100000,   // Mogillion scores share the daily_scores table with Merrillion, offset so curves never mix
    minPlayersForCurve: 5,    // players needed before the "better than X%" curve appears
  };

  // Fixed point tiers. Every answer in the prompt files belongs to exactly one.
  const TIERS = {
    miracle: { pts: 100, label: "Gigachad",         emoji: "👑", color: "#f5c542", desc: "The one handpicked best answer. Total mog." },
    t75:     { pts: 85,  label: "Chad",             emoji: "💎", color: "#ff4d8d", desc: "Only a few people know it" },
    t50:     { pts: 60,  label: "Chadlite",         emoji: "✨", color: "#4de2f7", desc: "Solid, not everyone gets it" },
    t25:     { pts: 30,  label: "High Tier Normie", emoji: "💪", color: "#5ee6a8", desc: "Well known to fans" },
    trap:    { pts: 15,  label: "Copium",           emoji: "🧢", color: "#ff9a4d", desc: "The 'clever' answer everyone tries" },
    t10:     { pts: 10,  label: "Grey",              emoji: "🗿", color: "#8b9299", desc: "What most people would say" },
    miss:    { pts: 0,   label: "Invalid",          emoji: "❌", color: "#5a626b", desc: "Not a valid answer" },
    timeout: { pts: 0,   label: "Nothing Landed", emoji: "⏰", color: "#5a626b", desc: "Time ran out before a valid answer" },
  };
  const TIER_ORDER = ["t75", "t50", "t25", "t10"];
  const tc = (t) => (TIERS[t] || TIERS.miss).color;

  const PROMPTS = window.MOGILLION_PROMPTS || [];
  const MAX_SCORE = CONFIG.promptsPerDive * TIERS.miracle.pts;
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
      try { const v = localStorage.getItem("mogillion:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) { try { localStorage.setItem("mogillion:" + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
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
    // Word-game prompts can ignore the given word, e.g. "mewing tip" counts as "tip".
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
    // Typo tolerance: 1 edit at 5+ letters, 2 at 9+.
    const k = key(cands[cands.length - 1]);
    let best = null, bestD = Infinity;
    for (const x of list) {
      const L = Math.min(x.key.length, k.length);
      const allow = L >= 9 ? 2 : L >= 5 ? 1 : 0;
      if (!allow || Math.abs(x.key.length - k.length) > allow) continue;
      const d = lev(x.key, k);
      if (d <= allow && d < bestD) { best = x; bestD = d; }
    }
    if (best) return { tier: best.tier, display: best.display, fuzzy: true };
    // Whole-word "contains": "i think mewing" -> Mewing. Prefer the highest tier, then the longest answer.
    const rank = { miracle: 7, t75: 6, t50: 5, t25: 4, trap: 3, t10: 2 };
    let hit = null;
    for (const c of cands) {
      const padded = " " + c + " ";
      for (const x of list) {
        if (x.key.length < 4 || !padded.includes(" " + x.key + " ")) continue;
        if (c.split(" ").length - x.key.split(" ").length > 2) continue;   // at most 2 extra words
        if (!hit || rank[x.tier] > rank[hit.tier] || (rank[x.tier] === rank[hit.tier] && x.key.length > hit.key.length)) hit = x;
      }
    }
    return hit ? { tier: hit.tier, display: hit.display, fuzzy: true } : { tier: "miss", display: null };
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

  // Daily: walk through seeded shuffles of the whole pool so no prompt
  // repeats until every prompt has been used once.
  const cycleCache = new Map();
  // Hand-picked days (empty for now). Falls back to the normal shuffle if an id is missing.
  const FEATURED = {
    1: ["s1-maxxing", "s11-barber-ask", "s7-mens-cologne", "s9-phonk", "s9-jawline", "s11-gigachad-person", "s1-slang"],
  };
  // A day listed in RESET gets a fresh save slot, so everyone replays it (used when a day's prompts are swapped).
  const RESET = {};
  function dayKey(day) { return "daily:" + day + (RESET[day] ? ":" + RESET[day] : ""); }
  // Looksmax-core categories: the broad, well-known ones. Online play prefers these.
  const CORE_IDS = new Set([
    "s1-slang", "s1-maxxing", "s1-compliment", "s1-genz", "s1-rated", "s1-habit", "s1-hairstyle", "s1-aesthetic", "s1-newslang", "s1-viraltrend", "s1-fit",
    "s4-skin-brand", "s4-shampoo", "s4-hair-product", "s4-face-mask", "s4-sunscreen", "s4-barbershop", "s4-haircut-tiktok",
    "s6-gym-exercise", "s6-ab-exercise", "s6-arm-exercise", "s6-bodyweight", "s6-athlete", "s6-healthy-meal", "s6-fitness-trend",
    "s7-mens-cologne", "s7-womens-perfume", "s7-streetwear-brand", "s7-sneaker", "s7-watch-brand", "s7-luxury-brand",
    "s9-heartthrob", "s9-jawline", "s9-iconic-hair", "s9-slang", "s9-phonk", "s9-creator", "s10-creators", "s10-slang", "s10-glowup-trends", "s10-looks-creators",
    "s3-hairstyle", "s3-skin-brand", "s2-skincare", "s2-exercise", "s2-fashionbrand", "s10-viral-trend", "s7-fragrance-house",
  ]);
  const isCore = (p) => !!p.core || CORE_IDS.has(p.id);
  function dailyPrompts(day) {
    if (FEATURED[day]) { const f = FEATURED[day].map((id) => PROMPTS.find((p) => p.id === id)).filter(Boolean); if (f.length === CONFIG.promptsPerDive) return f; }
    const N = PROMPTS.length, k = Math.min(CONFIG.promptsPerDive, N);
    const out = [], seen = new Set();
    let pos = (day - 1) * CONFIG.promptsPerDive;
    while (out.length < k) {
      const cycle = Math.floor(pos / N);
      if (!cycleCache.has(cycle)) cycleCache.set(cycle, shuffledIdx(N, mulberry32(0xc4115 + cycle * 7919)));
      const p = PROMPTS[cycleCache.get(cycle)[((pos % N) + N) % N]];
      if (!seen.has(p.id)) { seen.add(p.id); out.push(p); }
      pos++;
    }
    return out;
  }

  let recentUnlimited = [];
  function randomPrompts() {
    const k = Math.min(CONFIG.promptsPerDive, PROMPTS.length);
    const order = shuffledIdx(PROMPTS.length, Math.random).map((i) => PROMPTS[i]);
    const fresh = order.filter((p) => !recentUnlimited.includes(p.id));
    const stale = order.filter((p) => recentUnlimited.includes(p.id));
    const picked = fresh.concat(stale).slice(0, k);
    recentUnlimited = picked.map((p) => p.id);
    return picked;
  }

  // =====================================================================
  // Unlock / payments
  // =====================================================================
  const ONLINE = /^https?:$/.test(location.protocol);
  const LOCAL = !ONLINE || ["localhost", "127.0.0.1"].includes(location.hostname);

  function getToken() { return store.get("unlockToken", null); }
  // The Mog Pass only unlocks Mogillion (Merrillion has its own pass).
  function isUnlocked() { const t = getToken(); return !!t && (t !== "dev" || LOCAL); }
  function track(event, params) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event }, params)); } catch (e) { /* ignore */ } }

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
      const { token } = await api("/api/unlock?game=mogillion&session_id=" + encodeURIComponent(sid));
      store.set("unlockToken", token);
      unlockedNow("👑 Mog Pass unlocked. Thank you!");
    } catch (e) {
      toast("Couldn't confirm the payment yet. Try “Restore purchase”.");
    }
  }

  async function reverifyToken() {
    const t = getToken();
    if (!t || t === "dev" || !ONLINE) return;
    try {
      const r = await api("/api/unlock?game=mogillion&token=" + encodeURIComponent(t));
      if (r.valid === false) { store.set("unlockToken", null); renderMenu(); }
    } catch (e) { /* network/API missing: keep the unlock */ }
  }

  async function buy() {
    if (CONFIG.paymentLink) { location.href = CONFIG.paymentLink; return; }   // Stripe Payment Link
    toast("The Mog Pass checkout opens very soon. Your free run is still waiting!"); return;
    const btn = $("#btn-buy");
    btn.disabled = true;
    btn.textContent = "Opening checkout…";
    try {
      const { url } = await api("/api/checkout", { method: "POST" });
      location.href = url;
    } catch (e) {
      toast("Checkout is unavailable right now. Try again soon.");
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
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, game: "mogillion" }),
      });
      store.set("unlockToken", token);
      $("#dlg-paywall").close();
      unlockedNow("Purchase restored 👑");
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
    const c = window.MOGILLION_ONLINE || {};
    return c.supabaseUrl && c.supabaseAnonKey ? { url: c.supabaseUrl.replace(/\/+$/, ""), key: c.supabaseAnonKey } : null;
  }

  async function submitScore(day, score) {
    const c = cloud();
    if (!c || day < 1 || store.get("submitted:" + day, false)) return;
    try {
      const r = await fetch(`${c.url}/rest/v1/daily_scores`, {
        method: "POST",
        headers: { apikey: c.key, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ day: day + CONFIG.scoreDayOffset, score, player: playerId() }),
      });
      if (r.ok || r.status === 409) store.set("submitted:" + day, true);
    } catch (e) { /* offline: try again next time results are shown */ }
  }

  async function fetchHistogram(day) {
    const c = cloud();
    const r = await fetch(`${c.url}/rest/v1/rpc/daily_histogram`, {
      method: "POST",
      headers: { apikey: c.key, "Content-Type": "application/json" },
      body: JSON.stringify({ p_day: day + CONFIG.scoreDayOffset }),
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

  // Screen transition + staggered entrance of the children (opacity/transform only).
  function enterScreen(id) {
    const sc = document.getElementById(id);
    if (!sc || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sc.classList.remove("screen-in"); void sc.offsetWidth; sc.classList.add("screen-in");
    const kids = [...sc.children].flatMap((c) => (c.classList.contains("tiles-main") || c.classList.contains("tiles-grid")) ? [...c.children] : [c]).filter((c) => !c.hidden);
    kids.forEach((c, i) => { c.style.setProperty("--i", Math.min(i, 9)); c.classList.remove("stg"); void c.offsetWidth; c.classList.add("stg"); });
    setTimeout(() => kids.forEach((c) => c.classList.remove("stg")), 1400);
  }

  function showScreen(id) {
    $$(".screen").forEach((s) => { s.hidden = s.id !== id; });
    $("#appbar").hidden = id === "game";
    document.body.classList.toggle("in-run", id === "game");
    window.scrollTo(0, 0);
    enterScreen(id);
    if (id === "menu") { renderMenu(); drawHero(); }
    if (window.Fx && id !== "game" && id !== "summary") window.Fx.clear();
    if (window.BgScene) window.BgScene.setMood(id === "game" ? "game" : id === "summary" ? "summary" : "menu");
    if (id !== "online" && window.MogillionOnlineUI && window.MogillionOnlineUI.isOpen()) window.MogillionOnlineUI.leave();
  }

  function mogText() {
    const day = dayNumber();
    return day >= 1 ? `Mog Check #${day} is live. Aura check incoming.` : "Daily Mog Check starts soon";
  }

  function loadStats() {
    return Object.assign(
      { played: 0, totalPts: 0, best: 0, streak: 0, maxStreak: 0, lastDay: 0, miracles: 0, unlimitedPlayed: 0, unlimitedBest: 0 },
      store.get("stats", {})
    );
  }
  function currentStreak() { const s = loadStats(); return s.lastDay >= dayNumber() - 1 ? s.streak : 0; }

  function rating(score) {
    // Bands out of 700: 450+, 351–449, 251–350, 151–250, 0–150 (scaled if the max ever differs).
    const s = score * (700 / MAX_SCORE);
    if (s >= 450) return "Gigamogger";
    if (s >= 351) return "Mogger";
    if (s >= 251) return "Ascending";
    if (s >= 151) return "Mid";
    return "Needs Sleepmaxxing";
  }
  const RATING_COLORS = { Gigamogger: "#f5c542", Mogger: "#ff4d8d", Ascending: "#4de2f7", Mid: "#c9d1d9", "Needs Sleepmaxxing": "#8a929b" };
  function noteFor(p, display) { return p && p.notes && display && p.notes[display] ? String(p.notes[display]) : ""; }
  function hook(name, ...args) { try { if (window.Scene && typeof window.Scene[name] === "function") window.Scene[name](...args); } catch (e) { /* scene is optional */ } }

  // "MOG ON →" slam between prompts. Click or any key skips it.
  function slam(text, arrow, done) {
    const el = $("#slam");
    if (!el) { done(); return; }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("#slam-text").textContent = text;
    el.classList.toggle("no-arrow", !arrow);
    el.classList.toggle("long", text.length > 10);
    el.hidden = false;
    el.classList.remove("go");
    void el.offsetWidth;
    el.classList.add("go");
    const t0 = performance.now();
    let finished = false, tm = 0;
    const end = () => {
      if (finished) return;
      finished = true;
      clearTimeout(tm);
      el.removeEventListener("click", skip);
      document.removeEventListener("keydown", skip, true);
      el.hidden = true;
      el.classList.remove("go");
      done();
    };
    function skip(e) { if (performance.now() - t0 < 220) return; if (e && e.type === "keydown") e.preventDefault(); end(); }
    el.addEventListener("click", skip);
    document.addEventListener("keydown", skip, true);
    tm = setTimeout(end, reduce ? 400 : 900);
  }

  function renderMenu() {
    const day = dayNumber();
    const saved = store.get(dayKey(day), null);
    const played = saved && saved.done;
    const unlocked = isUnlocked();
    const streak = currentStreak();
    const pastDays = Math.max(0, day - 1);

    $("#hero-eyebrow").textContent = day >= 1 ? `Mog Check #${day} · Streak ${streak}` : "Preview Mog Check";
    $("#hero-sub").textContent = played
      ? `You scored ${total(saved.results)} of ${MAX_SCORE}: ${rating(total(saved.results))}.`
      : "7 looksmaxxing prompts · 25 seconds each";
    $("#daily-sub").textContent = played ? "Done ✓ · see your results" : streak > 0 ? `Keep your ${streak}-day streak alive!` : "Same 7 for everyone";
    renderCollection($("#home-cards"), true);
    renderChallengeBanner();
    const badge = $("#streak-badge");
    badge.hidden = streak < 1;
    badge.innerHTML = (Spr ? Spr.svg("flame", 14) : "") + `<span>${streak}</span>`;

    $("#unl-sub").textContent = unlocked ? "Play as many as you like" : freeRunLeft() ? "1 free run on us" : "Mog Pass only";
    $("#arch-sub").textContent = pastDays ? `${pastDays} past run${pastDays === 1 ? "" : "s"}` : "Opens tomorrow";
    const s = loadStats();
    $("#stats-sub").textContent = s.played ? `Best ${s.best} · streak ${streak}` : "Streaks & records";
    $("#xmas-count").textContent = mogText();

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
    $("#sup-title").textContent = unlocked ? "You're a Mog Pass holder 👑" : "Get the Mog Pass";
    $("#sup-sub").textContent = unlocked
      ? "Unlimited Runs and the full archive are unlocked. Thank you!"
      : `Unlimited runs + every past Mog Check · ${CONFIG.price} once`;
    $("#sl-daily").textContent = day >= 1 ? `No. ${day}` : "Preview";
    $("#sl-unl").textContent = unlocked ? "Unlocked ∞" : freeRunLeft() ? "1 free run" : "Mog Pass";
    $("#sl-archive").textContent = day > 1 ? `${day - 1} past run${day - 1 === 1 ? "" : "s"}` : "Every past run";
    $("#tg-sfx").setAttribute("aria-pressed", String(Sfx.isSfx()));
    $("#tg-music").setAttribute("aria-pressed", String(Sfx.isMusic()));
    $("#btn-sfx").setAttribute("aria-pressed", String(Sfx.isSfx()));
    $("#btn-music").setAttribute("aria-pressed", String(Sfx.isMusic()));
    $("#sheet-foot").textContent = `Made for the mewing community · ${mogText()}`;
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
    if (window.MogillionOnlineUI) { showScreen("online"); window.MogillionOnlineUI.open(); }
    else toast("Online play is loading… try again in a moment.");
  }

  // =====================================================================
  // Runs
  // =====================================================================
  function storeKey() { return state.mode === "archive" ? "archive:" + state.day : dayKey(state.day); }

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
    beginRun();
  }

  // Show the run screen, slam "MOG CHECK" on a fresh run, then start the current prompt.
  function beginRun() {
    if (window.Fx) window.Fx.clear();
    showScreen("game");
    $("#game").classList.add("revealing");
    hook("runStart");
    const s = state;
    $("#feedback").hidden = true;
    $("#answer-form").hidden = true;
    if (s.i === 0) slam(`MOG CHECK · ${s.prompts.length} PROMPTS`, false, () => { if (state === s) startPrompt(); });
    else startPrompt();
  }

  function startDaily() { track("run_start", { mode: "daily" }); startStored("daily", dayNumber()); }

  function startArchive(day) {
    if (!isUnlocked()) { openPaywall(); return; }
    const daily = store.get(dayKey(day), null);
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
    beginRun();
  }

  // ---------- prompt loop ----------
  function renderDots() {
    const ol = $("#dots");
    ol.innerHTML = "";
    state.prompts.forEach((_, idx) => {
      const li = document.createElement("li");
      const r = state.results[idx];
      if (r) { li.innerHTML = tierSprite(r.tier, 16); li.dataset.tier = r.tier; li.style.setProperty("--tc", tc(r.tier)); }
      if (idx === state.i && !state.answered) li.classList.add("current");
      ol.appendChild(li);
    });
    tween($("#score"), total(state.results), "");
  }

  // Number count-up (rAF, eased); jumps straight to the end with reduced motion.
  function tween(el, to, prefix) {
    if (!el) return;
    const from = el.id === "fb-points" ? 0 : Number(el.dataset.v || 0);
    el.dataset.v = to;
    if (from === to || matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = prefix + to; return; }
    const t0 = performance.now(), dur = 700;
    const host = el.closest(".score-pill") || el;
    host.classList.remove("bump"); void host.offsetWidth; host.classList.add("bump");
    el.textContent = prefix + from;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = prefix + Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setTimeout(() => { if (el.dataset.v == to) el.textContent = prefix + to; }, dur + 250);
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
    say(pickLine(SAY.start), "smirk");
    if (window.Journey) window.Journey.set(total(state.results), false);
    $("#answer-msg").textContent = "";
    state.pending = null;
    const input = $("#answer");
    input.value = "";
    input.disabled = false;
    input.focus();
    renderDots();
    hook("prompt", state.i, state.prompts.length, p.text);
    $("#game").classList.remove("revealing");   // presents from earlier answers stay piled up
    Sfx.play("start");
    Sfx.duck(true);

    if (state.mode !== "unlimited") saveProgress();

    state.deadline = performance.now() + CONFIG.secondsPerPrompt * 1000;
    clearInterval(state.timer);
    tick();
    state.timer = setInterval(tick, 100);
  }

  const RING_C = 2 * Math.PI * 24;   // circumference of the timer ring (r = 24)
  function tick() {
    const totalMs = CONFIG.secondsPerPrompt * 1000;
    const left = Math.max(0, state.deadline - performance.now());
    const sec = Math.ceil(left / 1000);
    const ring = $("#ring");
    $("#ring-fg").style.strokeDashoffset = String(RING_C * (1 - left / totalMs));
    $("#timer-sec").textContent = sec;
    ring.classList.toggle("warn", left <= 8000 && left > 4000);
    ring.classList.toggle("danger", left <= 4000);
    ring.classList.toggle("pulse", left <= 5000);
    if (sec !== state.lastSec) {
      if (sec <= 5 && sec >= 1 && state.lastSec !== null) Sfx.play("tick", sec);
      if (sec === 15) say(pickLine(SAY.mid), "neutral");
      if (sec === 6) say(pickLine(SAY.late), "shocked");
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
    say(pickLine(SAY.nope), "disappointed");
    Sfx.play("nope");
    hook("miss", text);
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
    $("#game").classList.add("revealing");      // hide the prompt so the reward has the screen to itself
    if (window.Fx) window.Fx.celebrate(r.tier);
    renderDots();
    if (window.Journey) window.Journey.set(total(state.results));
    renderFeedback(p, res);
    if (timedOut) hook("timeout");
    else hook("answer", { tier: res.tier, display: res.matched, input: res.input, pts: res.pts, note: noteFor(p, res.matched) });
  }

  function renderFeedback(p, res) {
    const t = TIERS[res.tier];
    const fb = $("#feedback");
    $("#answer-form").hidden = true;
    fb.hidden = false;
    fb.dataset.tier = res.tier;
    if (window.ModelGuy) {
      const ex = { miracle: "shocked", t75: "impressed", t50: "smirk", t25: "neutral", trap: "disappointed", t10: "disappointed", miss: "disappointed", timeout: "shocked" }[res.tier] || "neutral";
      $("#fb-emoji").innerHTML = `<div class="fb-guy">${window.ModelGuy.svg(150, "neutral", { idle: false })}</div>`;
      const g = $("#fb-emoji .mg");
      requestAnimationFrame(() => requestAnimationFrame(() => window.ModelGuy.set(g, ex)));
      if (res.tier === "miracle" || res.tier === "t75") window.ModelGuy.flash(fb, res.tier === "miracle" ? 6 : 3);
    } else $("#fb-emoji").innerHTML = tierSprite(res.tier, 56);
    $("#fb-label").textContent = t.label;
    tween($("#fb-points"), t.pts, "+");

    let said;
    if (res.tier === "timeout") said = res.input ? `“${res.input}”` : "No answer this time.";
    else if (res.tier === "miss") said = `“${res.input}” isn't a valid answer.`;
    else if (key(res.input) === key(res.matched)) said = `You said “${res.matched}”.`;
    else said = `You said “${res.input}”, which counts as ${res.matched}.`;
    $("#fb-said").textContent = said;
    $("#fb-note").textContent = noteFor(p, res.matched);
    fb.style.setProperty("--tc", t.color);

    let blurb = "";
    if (res.tier === "miracle") blurb = p.miracleNote || "You found the handpicked best answer!";
    else if (res.tier === "trap") blurb = p.trapNote || "Too clever. Everybody tries that one.";
    else if (res.tier === "timeout") blurb = "The clock mogged you. Speed is aura too.";
    $("#fb-blurb").textContent = blurb;

    // The other answers stay secret until the end of the run.
    $("#fb-best").innerHTML = `<p class="fb-later">Every answer for this prompt is revealed at the end of the run.</p>`;

    const last = state.i >= state.prompts.length - 1;
    $("#btn-next").textContent = last ? "See results" : "Next →";
    $("#btn-next").focus();
  }

  // Coach Chad chats while you think.
  const SAY = {
    start: ["Lock in.", "Skip the NPC answer!", "Aura check…", "Think rare. Common answers are mid.", "Don't pick the first thing you think of!", "Deep cuts mog.", "Main character answers only."],
    mid: ["Tick tock, no cap.", "Still cooking? Go deeper!", "Halfway there, stay locked in.", "The clock is not your friend."],
    late: ["Lock in, lock in!", "Any answer beats no answer!", "Type it, type it, TYPE IT!"],
    nope: ["Not on the list, bro. Again!", "Nope. Try another one.", "Close, but not quite. Run it back!"],
  };
  const pickLine = (a) => a[Math.floor(Math.random() * a.length)];
  function say(text, expr) {
    const b = $("#say-text");
    if (!b) return;
    const elf = $("#say-elf");
    if (elf && window.ModelGuy) { if (!elf.firstChild) elf.innerHTML = window.ModelGuy.svg(62, expr || "neutral"); else window.ModelGuy.set(elf, expr || "neutral"); }
    b.textContent = text;
    const w = b.parentElement;
    w.classList.remove("say-pop"); void w.offsetWidth; w.classList.add("say-pop");
  }

  function nextPrompt() {
    state.i++;
    if (state.i < state.prompts.length) {
      const s = state;
      $("#feedback").hidden = true;
      slam("MOG ON", true, () => { if (state === s) startPrompt(); });
    } else completeDive();
  }

  // ---------- completion ----------
  function completeDive() {
    clearInterval(state.timer);
    Sfx.duck(false);
    const score = total(state.results);
    const miracles = state.results.filter((r) => r.tier === "miracle").length;
    if (state.mode === "daily") {
      const already = store.get(dayKey(state.day), {});
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
        const cards = store.get("cards", []);
        if (!cards.some((o) => o.day === state.day)) {
          cards.push({ day: state.day, kind: window.Collection ? window.Collection.kindFor(score) : "plain" });
          store.set("cards", cards);
          state.newCard = state.day;
        }
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

  // ---------- Aura Cards + "what's next" (the reason to come back tomorrow) ----------
  function renderCollection(el, compact, newDay) {
    const cards = store.get("cards", []);
    if (compact) {
      const sec = $("#cards-strip");
      if (sec) sec.hidden = !window.Collection || !cards.length;
      const cap = $("#cards-cap");
      if (cap) cap.textContent = `${(window.Collection && window.Collection.title) || "Your Aura Cards"} · ${cards.length} card${cards.length === 1 ? "" : "s"}`;
    }
    if (window.Collection && el && (cards.length || !compact)) window.Collection.render(el, cards, { compact, newDay });
  }
  function renderNext() {
    const daily = state.mode === "daily";
    const streak = currentStreak();
    $("#next-card").hidden = !window.Collection && !daily;
    $("#next-title").textContent = (window.Collection && window.Collection.title) || "Your Aura Cards";
    renderCollection($("#next-cards"), false, state.fresh ? state.newCard : null);
    $("#next-streak").textContent = streak ? `🔥 ${streak}-day streak` : "";
    $("#next-msg").textContent = daily
      ? (state.newCard ? "New card dropped! Come back tomorrow for another" : "Come back tomorrow for a new card") + (streak ? ` and make your streak ${streak + 1}.` : ".")
      : "Daily Mog Checks drop an Aura Card. Don't miss tomorrow's!";
    state.newCard = null;
    const b = $("#btn-next-unl");
    const free = freeRunLeft();
    b.hidden = !(isUnlocked() || free);
    b.textContent = free ? "Play your FREE Unlimited run 🎁" : "Play another run";
  }

  // ---------- challenge a friend (?mog=SCORE) ----------
  function loadChallenge() { const c = store.get("challenge", null); return c && typeof c.score === "number" ? c : null; }
  function renderChallengeBanner() {
    const el = $("#challenge-banner");
    if (!el) return;
    const c = loadChallenge();
    el.hidden = !c || !!c.seen;
    if (c) el.textContent = `Your friend scored ${c.score}. Can you mog them?`;
  }
  function challengeLine(score) {
    const c = loadChallenge();
    if (!c || state.mode === "archive") return "";
    const d = score - c.score;
    if (d > 0) return `You mogged them (+${d})`;
    if (d < 0) return `You got mogged by ${-d} point${d === -1 ? "" : "s"}`;
    return "Dead tie. Run it back!";
  }
  function challengeUrl() { return `${CONFIG.siteUrl}?mog=${total(state.results)}`; }
  async function challengeFriend() {
    const score = total(state.results);
    const text = `I scored ${score}/${MAX_SCORE} on ${CONFIG.name}. Can you mog me?\n${challengeUrl()}`;
    track("challenge_share", { score });
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) { await navigator.share({ title: CONFIG.name, text: `I scored ${score}/${MAX_SCORE}. Can you mog me?`, url: challengeUrl() }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    copyText(text, "Challenge link copied! Send it to a friend.");
  }

  // ---------- results ----------
  function modeLabel() {
    if (state.mode === "daily") return state.day >= 1 ? `Mog Check #${state.day} complete` : "Preview Mog Check complete";
    if (state.mode === "archive") return `Archive · Run #${state.day}`;
    return "Unlimited Run";
  }

  function ansChip(name, you, note) {
    const chip = `<span class="ans-chip${you ? " is-you" : ""}">${esc(name)}${you ? " <i>YOU</i>" : ""}</span>`;
    return note ? `<div class="ans-noted">${chip}<small>${esc(note)}</small></div>` : chip;
  }

  function showSummary() {
    const score = total(state.results);
    const ds = document.getElementById("dist-score"); if (ds) ds.textContent = `You: ${score} pts`;
    const rate = rating(score);
    const fresh = state.fresh;
    state.fresh = false;
    hook("runEnd", score, MAX_SCORE);
    $("#sum-mode").textContent = modeLabel();
    $("#sum-max").textContent = `/ ${MAX_SCORE}`;
    const rEl = $("#sum-rating");
    rEl.textContent = rate;
    $("#summary").style.setProperty("--rc", RATING_COLORS[rate]);
    $("#summary").classList.toggle("scan-fresh", !!fresh);
    $("#btn-again").hidden = state.mode !== "unlimited";
    $("#upsell").hidden = isUnlocked();
    const ms = window.Journey && window.Journey.reached(score);
    $("#sum-journey").textContent = ms ? `You hit ${ms.name}!` : "Keep grinding to hit your first milestone!";
    const cl = challengeLine(score);
    $("#sum-challenge").textContent = cl;
    $("#sum-challenge").hidden = !cl;
    const ch = loadChallenge();
    if (ch && fresh && state.mode === "daily" && !ch.seen) { ch.seen = true; store.set("challenge", ch); }
    track("run_complete", { mode: state.mode, score });
    renderNext();
    $("#st-streak").textContent = currentStreak();
    $("#st-mir").textContent = state.results.filter((r) => r.tier === "miracle").length;
    $("#st-top-k").textContent = state.mode === "unlimited" ? "Best" : "Today";
    $("#st-top").textContent = state.mode === "unlimited" ? loadStats().unlimitedBest : "—";
    $("#st-rank").textContent = state.mode === "unlimited" ? "unlimited score" : "";

    // Per-prompt scan list.
    $("#scan-list").innerHTML = state.results.map((r, idx) => {
      const p = state.prompts[idx];
      if (!p) return "";
      const ans = r.tier === "timeout" ? (r.input ? `“${r.input}”` : "No answer") : (r.matched || r.input || "-");
      const note = noteFor(p, r.matched);
      return `<li class="scan-row" data-tier="${esc(r.tier)}" style="--tc:${tc(r.tier)}">
        <span class="sr-n">${idx + 1}</span>
        <span class="sr-mid"><span class="sr-prompt">${esc(p.text)}</span>
          <span class="sr-line"><b class="sr-ans">${esc(ans)}</b><span class="sr-tier">${esc(TIERS[r.tier].label)}</span></span>
          ${note ? `<small class="sr-note">${esc(note)}</small>` : ""}</span>
        <span class="sr-pts">${r.pts}</span></li>`;
    }).join("");

    // Tier legend.
    $("#legend").innerHTML = ["miracle", "t75", "t50", "t25", "trap", "t10", "miss"].map((k) =>
      `<li data-tier="${k}" style="--tc:${tc(k)}"><i></i><span>${esc(TIERS[k].label)}</span><b>${TIERS[k].pts}</b></li>`).join("");

    // Each prompt opens to show every accepted answer, grouped and colour-coded by tier.
    const ol = $("#breakdown");
    ol.innerHTML = state.results.map((r, idx) => {
      const p = state.prompts[idx];
      if (!p) return "";
      const yourKey = r.matched ? key(r.matched) : null;
      const groups = ["miracle", "t75", "t50", "t25", "trap", "t10"].map((t) => {
        const entries = t === "miracle" || t === "trap" ? (p[t] ? [p[t]] : []) : (p[t] || []);
        if (!entries.length) return "";
        const named = entries.map((e) => e.split("|")[0]);
        const youIn = (n) => yourKey && key(n) === yourKey;
        const withNote = named.filter((n) => noteFor(p, n)).map((n) => ansChip(n, youIn(n), noteFor(p, n))).join("");
        const plain = named.filter((n) => !noteFor(p, n)).map((n) => ansChip(n, youIn(n), "")).join("");
        return `<div class="ans-group" data-tier="${t}" style="--tc:${tc(t)}">
          <div class="ans-head">${tierSprite(t, 16)}<b>${esc(TIERS[t].label)}</b><span>${TIERS[t].pts} pts · ${entries.length}</span></div>
          ${withNote ? `<div class="ans-noted-list">${withNote}</div>` : ""}<div class="ans-chips">${plain}</div></div>`;
      }).join("");
      const yours = r.tier === "timeout" ? (r.input ? `“${esc(r.input)}” · nothing landed` : "Nothing landed") : esc(r.matched || r.input || "—");
      return `<li data-tier="${esc(r.tier)}" style="--tc:${tc(r.tier)}"><details class="bd">
        <summary><span class="bd-emoji">${tierSprite(r.tier, 24)}</span>
          <span class="bd-mid"><span class="bd-prompt">${esc(p.text)}</span><span class="bd-answer">${yours}</span></span>
          <span class="bd-pts">${r.pts}</span><span class="bd-caret" aria-hidden="true">▾</span></summary>
        <div class="ans-groups">${groups}</div>
      </details></li>`;
    }).join("");

    showScreen("summary");
    renderRadar(state.results, !!fresh);
    renderComparison(score);
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

  // 7-axis radar (one axis per prompt): value = points / 100, tier-coloured vertex dots, drawn in on reveal.
  function renderRadar(results, animate) {
    const W = 340, H = 300, cx = 170, cy = 152, R = 100;
    const n = Math.max(state.prompts.length, results.length, 3);
    const at = (i, r) => { const a = (Math.PI * 2 * i) / n; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
    const poly = (r) => Array.from({ length: n }, (_, i) => at(i, r).map((v) => v.toFixed(1)).join(",")).join(" ");
    let s = `<defs><radialGradient id="radarGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#4de2f7" stop-opacity=".18"/><stop offset="1" stop-color="#4de2f7" stop-opacity="0"/></radialGradient></defs>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R + 14}" fill="url(#radarGlow)"/>`;
    [0.25, 0.5, 0.75, 1].forEach((f) => { s += `<polygon class="radar-ring${f === 1 ? " outer" : ""}" points="${poly(R * f)}"/>`; });
    for (let i = 0; i < n; i++) { const [x, y] = at(i, R); s += `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }
    const vals = Array.from({ length: n }, (_, i) => Math.max(0.03, ((results[i] ? results[i].pts : 0) / 100)));
    const pts = vals.map((v, i) => at(i, R * v));
    s += `<polygon class="radar-poly${animate ? " draw" : ""}" points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}"/>`;
    pts.forEach(([x, y], i) => {
      const r = results[i];
      s += `<circle class="radar-dot${animate ? " draw" : ""}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${r ? tc(r.tier) : "#5a626b"}" style="animation-delay:${(0.55 + i * 0.09).toFixed(2)}s"/>`;
    });
    for (let i = 0; i < n; i++) {
      const [x, y] = at(i, R + 22);
      s += `<text class="radar-lbl" x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle">${i + 1}</text>`;
    }
    $("#radar").innerHTML = s;
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
    let s = `<defs><pattern id="distFill" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#4de2f7" fill-opacity=".2"/><rect width="3" height="3" fill="#4de2f7" fill-opacity=".3"/></pattern></defs>`;
    s += `<path d="${line} L${x(MAX_SCORE)},${base} L${x(0)},${base} Z" fill="url(#distFill)"/>`;
    s += `<path d="${line}" fill="none" stroke="#4de2f7" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<line x1="${padL}" y1="${base}" x2="${W - padR}" y2="${base}" stroke="rgba(255,255,255,.4)" stroke-width="2"/>`;
    for (let v = 0; v <= MAX_SCORE; v += 100) {
      s += `<line x1="${x(v)}" y1="${base}" x2="${x(v)}" y2="${base + 5}" stroke="rgba(255,255,255,.4)" stroke-width="2"/>`;
      s += `<text class="chart-axis" x="${x(v)}" y="${base + 19}" text-anchor="middle">${v}</text>`;
    }
    const sx = x(Math.min(score, MAX_SCORE));
    const near = pts.reduce((a, b) => (Math.abs(b[0] - score) < Math.abs(a[0] - score) ? b : a));
    const sy = y(near[1]);
    s += `<line x1="${sx}" y1="${sy}" x2="${sx}" y2="${base}" stroke="#ff4d5e" stroke-width="2" stroke-dasharray="4 3"/>`;
    // A little pixel mascot marks your spot on the curve.
    if (Spr) s += Spr.rects("star", sx - 12, sy - 22, 2);
    else s += `<rect x="${sx - 6}" y="${sy - 6}" width="12" height="12" fill="#ff4d5e" stroke="rgba(255,255,255,.4)" stroke-width="2"/>`;
    s += `<text class="chart-you" x="${Math.min(W - 24, Math.max(24, sx))}" y="${Math.max(16, sy - 28)}" text-anchor="middle" fill="#ff4d5e">YOU</text>`;
    svg.innerHTML = s;
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
    if (day < 1) { setDistText(est, "Estimated curve. Live player comparison starts with Mog Check #1."); $("#st-rank").textContent = "soon"; return; }
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
  // Share links always point at the live site and carry your score, so a friend opening it gets the challenge banner.
  const shareUrl = () => (state && state.results ? challengeUrl() : CONFIG.siteUrl);
  function shareTitle() {
    return state.mode === "daily" ? `${CONFIG.name} ${dayLabel(state.day)}`
      : state.mode === "archive" ? `${CONFIG.name} #${state.day} (archive)` : `${CONFIG.name} Unlimited`;
  }
  function shareText(withUrl = true) {
    const url = withUrl ? "\n" + shareUrl() : "";
    return `${shareTitle()} ${total(state.results)}/${MAX_SCORE}\n${grid(state.results)}${url}`;
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
    { id: "threads", label: "Threads", color: "#1b1b1b", make: (t) => `https://www.threads.net/intent/post?text=${E(t)}` },
    { id: "bluesky", label: "Bluesky", color: "#1270d8", make: (t) => `https://bsky.app/intent/compose?text=${E(t)}` },
    { id: "discord", label: "Discord", color: "#4f5bd5", copy: "Copied! Paste it in Discord." },
    { id: "email", label: "Email", color: "#47515c", make: (t) => `mailto:?subject=${E("My " + shareTitle() + " score")}&body=${E(t)}`, direct: true },
  ];

  function shareTo(id) {
    const p = PLATFORMS.find((x) => x.id === id);
    if (!p) return;
    Sfx.play("share");
    const text = shareText();
    if (p.copy) { copyText(text, p.copy); return; }
    const url = p.make(text, shareUrl());
    if (p.direct) location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
  }

  function drawSprite(ctx, name, x, y, cell) {
    if (!Spr) return;
    Spr.runs(name).runs.forEach((r) => { ctx.fillStyle = r.c; ctx.fillRect(x + r.x * cell, y + r.y * cell, r.w * cell + 0.5, cell + 0.5); });
  }

  // A result card (1080×1350) for stories and posts.
  async function drawShareCard() {
    const c = $("#share-card"), W = 1080, H = 1350, ctx = c.getContext("2d");
    try { await Promise.all([document.fonts.load('120px "Anton"'), document.fonts.load('700 40px "Atkinson Hyperlegible"')]); } catch (e) { /* fall back to system fonts */ }
    const score = total(state.results);
    ctx.fillStyle = "#0b0c0f";
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 20) for (let x = 0; x < W; x += 24) {
      [[0.3, -0.38], [0.7, 0.38]].forEach(([cx, rot]) => {
        if (cx < 0.5) { ctx.fillStyle = "#13161b"; ctx.fillRect(x, y, 24, 3); }
      });
    }
    // Cyan bars along the top and bottom edges.
    ctx.fillStyle = "#4de2f7";
    ctx.fillRect(0, 0, W, 26); ctx.fillRect(0, H - 26, W, 26);
    ctx.textAlign = "center";
    ctx.font = '150px "Anton", Impact, sans-serif';
    ctx.fillStyle = "#0b7288"; ctx.fillText(CONFIG.name, W / 2 + 7, 247);
    ctx.fillStyle = "#f4f7fa"; ctx.fillText(CONFIG.name, W / 2, 240);
    ctx.font = '60px "Anton", Impact, sans-serif';
    ctx.fillStyle = "#f2c14e";
    const sub = state.mode === "unlimited" ? "UNLIMITED RUN" : state.day >= 1 ? `MOG CHECK #${state.day} · ${dayDate(state.day).toUpperCase()}` : "PREVIEW MOG CHECK";
    ctx.fillText(sub, W / 2, 322);
    // Light patch.
    const px = 90, py = 380, pw = 900, ph = 760;
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.fillRect(px, py + 12, pw, ph);
    const chrome = ctx.createLinearGradient(px, py, px + pw, py + ph); chrome.addColorStop(0, "#eef2f5"); chrome.addColorStop(0.5, "#c3cad2"); chrome.addColorStop(1, "#e3e8ec"); ctx.fillStyle = chrome;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 26); ctx.fill(); } else ctx.fillRect(px, py, pw, ph);
    ctx.setLineDash([22, 14]); ctx.strokeStyle = "rgba(13,15,18,.3)"; ctx.lineWidth = 5;
    ctx.strokeRect(px + 20, py + 20, pw - 40, ph - 40);
    ctx.setLineDash([]);
    ctx.fillStyle = "#0d0f12";
    ctx.font = '330px "Anton", Impact, sans-serif';
    ctx.fillText(String(score), W / 2, py + 330);
    ctx.font = '72px "Anton", Impact, sans-serif';
    ctx.fillStyle = "#47515c";
    ctx.fillText(`/ ${MAX_SCORE}`, W / 2, py + 420);
    ctx.font = '84px "Anton", Impact, sans-serif';
    ctx.lineJoin = "round"; ctx.lineWidth = 12; ctx.strokeStyle = "#0d0f12";
    ctx.strokeText(rating(score).toUpperCase(), W / 2, py + 520);
    ctx.fillStyle = RATING_COLORS[rating(score)];
    ctx.fillText(rating(score).toUpperCase(), W / 2, py + 520);
    const n = state.results.length, cell = 7, size = 12 * cell, gap = 14, pad = 12;
    const startX = (W - (n * (size + pad * 2) + (n - 1) * gap)) / 2;
    state.results.forEach((r, i) => {
      const bx = startX + i * (size + pad * 2 + gap), by = py + 565;
      ctx.fillStyle = "#0d0f12"; ctx.fillRect(bx - 4, by - 4, size + pad * 2 + 8, size + pad * 2 + 8);
      ctx.fillStyle = tc(r.tier); ctx.fillRect(bx, by, size + pad * 2, size + pad * 2);
      ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(bx + 3, by + 3, size + pad * 2 - 6, size + pad * 2 - 6);
      drawSprite(ctx, (Spr && Spr.TIER_SPRITE[r.tier]) || "x", bx + pad, by + pad, cell);
    });
    ctx.fillStyle = "#f4f7fa";
    ctx.font = '64px "Anton", Impact, sans-serif';
    ctx.fillText("CAN YOU BEAT IT?", W / 2, H - 140);
    ctx.fillStyle = "#f2c14e";
    ctx.font = '46px "Anton", Impact, sans-serif';
    ctx.fillText("MERRILLION.SITE/MOGILLION", W / 2, H - 92);
  }

  async function openShare() {
    Sfx.play("open");
    $("#dlg-share").showModal();
    await drawShareCard();
  }

  async function nativeShare() {
    const text = shareText();
    const blob = await new Promise((r) => $("#share-card").toBlob(r, "image/png"));
    const file = blob ? new File([blob], "mogillion-run.png", { type: "image/png" }) : null;
    try {
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
      if (navigator.share) { await navigator.share({ title: shareTitle(), text, url: shareUrl() || undefined }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    copyText(text, "Copied! Paste it anywhere.");
  }

  function saveImage() {
    const a = document.createElement("a");
    a.download = "mogillion-run.png";
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
      $("#archive-note").textContent = "Every past Daily Mog Check lands here, starting tomorrow.";
    } else {
      $("#archive-note").textContent = unlocked
        ? "Play any past Daily Mog Check. Archive scores don't affect your streak."
        : "The archive is for supporters. Tap any run to unlock.";
      for (let d = today - 1; d >= 1; d--) {
        const daily = store.get(dayKey(d), null);
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
      li.dataset.tier = k;
      li.style.setProperty("--tc", t.color);
      li.innerHTML = `<span>${tierSprite(k, 22)}</span><span>${esc(t.label)}<span class="desc">${esc(t.desc)}</span></span><b>${t.pts}</b>`;
      ul.appendChild(li);
    });
    $("#dlg-how").showModal();
  }

  const CONTACT = "merrillion.help@gmail.com";
  function openAccount() { if (window.Account) window.Account.open(); else toast("Accounts are loading… try again in a moment."); }
  function openMoreGames() {
    openInfo("More games", `<div class="more-games"><a class="mg-card" href="https://www.merrillion.site" target="_blank" rel="noopener"><b>Merrillion</b><p>The Christmas daily word game. Same rare-answer scoring, 7 festive prompts a day. One Supporter Pass unlocks both games.</p></a><div class="mg-card mg-soon"><b>More coming soon</b><p>More daily rare-answer games are in the works.</p></div><p class="muted">Got an idea for one? <a href="mailto:${CONTACT}">${CONTACT}</a></p></div>`);
  }
  function openPrivacy() {
    openInfo("Privacy", `<p>Mogillion keeps your stats and streak in your browser. If you sign in, we store your email and stats in your account so they sync between devices.</p><p>We use Google Analytics (via Google Tag Manager) to count visits and see which features people use. Payments are handled by Stripe; we never see your card.</p><p>Feedback you send is stored so we can read it. We don't sell your data.</p><p>Questions or delete requests: <a href="mailto:${CONTACT}">${CONTACT}</a></p>`);
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
    const context = "Mogillion · " + (state && state.prompts ? `${state.mode} ${state.day || ""} · ${state.prompts.map((p) => p.id).join(",")}` : "menu");
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
    ["What is Mogillion?", "A looksmaxxing word game. Every day there's a Daily Mog Check of 7 prompts, like “Name a mewing tip”. You get 25 seconds per prompt, and the rarer your answer, the more it's worth."],
    ["Who is the game for?", "Anyone into looksmaxxing, glow-ups, skincare, style or friendly competition. Most people can answer something, and the deep cuts reward the ones who really know their stuff."],
    ["How many prompts are in a Daily Mog Check?", "Seven, with 25 seconds each. A perfect run (the Gigachad answer on every prompt) scores 700."],
    ["How does rare-answer scoring work?", "Every answer has a fixed value set in advance by how familiar it is: Grey 10, High Tier Normie 30, Chadlite 60, Chad 85, and one handpicked Gigachad answer worth 100. The “clever” answer everyone tries is Copium, worth 15. Your score never depends on what other players typed."],
    ["What do the ratings mean?", "They're based on your score out of 700: 450+ Gigamogger, 351–449 Mogger, 251–350 Ascending, 151–250 Mid, and 0–150 Needs Sleepmaxxing. Beat your own best and your aura goes up."],
    ["Can I try again after a wrong answer?", "Yes. If your answer isn't on the list, the answer bar shakes and you can keep trying until the timer runs out. Once a valid answer lands, it's locked in."],
    ["Do spelling mistakes count?", "Mostly. Capitals, accents and “the” are ignored, small typos are forgiven, and if your sentence contains a listed answer as a whole word (like “i think mewing”) it counts. When we're guessing, we'll ask “Did you mean…?” so you can confirm."],
    ["How are the answer lists made?", "Each list is pulled together from community knowledge and reference sources with some AI help, then cleaned up and checked. Different spellings and slang for the same answer are merged."],
    ["Why is the Gigachad answer sometimes less rare than a Chad answer?", "It isn't chosen on rarity alone. It's the answer that's most satisfying to land, usually with a fun fact behind it, and one that at least a few players actually get."],
    ["Why wasn't my answer accepted?", "It's probably missing from the list, sorry! The lists get updated between runs, so it may count in future."],
    ["When does the Daily Mog Check reset?", "At midnight in your time zone. Everyone gets the same 7 prompts that day."],
    ["What happens if I close the game mid-run?", "Your progress is saved. When you come back you'll pick up where you left off, but the prompt you were on when you left counts as out of time."],
    ["Does my progress sync between devices?", "Yes, if you sign in (Menu → My account) we save your streak and stats to your account. Without an account they live in this browser. If you have the Supporter Pass, use “Restore purchase” with your checkout email to unlock on a new device."],
    ["Can I challenge a friend?", "Yes! On the results screen tap “Challenge a friend”. They get a link with your score, and when they finish their own Daily Mog Check you both see who mogged who."],
    ["What is Pass the Mirror?", "The online mode. Play Online, create a private room and send the code, or try Practice with bots. Everyone sits in a circle and the mirror goes round: on your turn, give any valid answer nobody has used yet, or lose a heart when time runs out."],
    ["What is the Mog Pass?", `A one-time ${CONFIG.price} unlock for Unlimited Runs and the full archive of past Daily Mog Checks. It only unlocks Mogillion. No subscription.`],
    ["Is Mogillion free to play?", "The Daily Mog Check and online play are free, no account needed. Everyone gets one free Unlimited Run. The Supporter Pass is optional."],
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
    $("#pay-price").textContent = `Mog Pass · ${CONFIG.price} once · Unlimited + every past Mog Check`;
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
    const txt = `Next Daily Mog Check in ${hh}h ${String(mm).padStart(2, "0")}m ${String(ss).padStart(2, "0")}s`;
    $$("[data-countdown]").forEach((el) => { el.textContent = txt; });
    if (!$("#menu").hidden && s === 0) renderMenu();
  }

  // ---------- sparkles ----------
  function startSparkles() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = $("#snow"), ctx = c.getContext("2d");
    let w = 0, h = 0, flakes = [];
    const make = (anyY) => ({ x: Math.random() * w, y: anyY ? Math.random() * h : h + 10, r: 0.8 + Math.random() * 2.2, vy: -(0.15 + Math.random() * 0.4), phase: Math.random() * Math.PI * 2 });
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(110, Math.round((w * h) / 26000));
      while (flakes.length < target) flakes.push(make(true));
      flakes.length = target;
    }
    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(77,226,247,0.35)";
      for (const f of flakes) {
        f.y += f.vy;
        f.x += Math.sin(t / 1500 + f.phase) * 0.3;
        if (f.y < -10) Object.assign(f, make(false));
        const sz = f.r > 2 ? 3 : 2;       // square pixel dust to match the sprites
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
    const c = $("#hero-knit");
    if (c && window.ModelGuy) { window.ModelGuy.hero(c); return; }
    if (c && Spr && c.clientWidth) Spr.drawKnit(c);
  }

  function init() {
    $$("[data-name]").forEach((el) => { el.textContent = CONFIG.name; });
    if (Spr) Spr.hydrate();
    drawHero();
    let heroTimer;
    window.addEventListener("resize", () => { clearTimeout(heroTimer); heroTimer = setTimeout(drawHero, 150); });

    const params = new URLSearchParams(location.search);
    // Challenge link: ?mog=SCORE means a friend scored that and dared you to beat it.
    const mogParam = params.get("mog");
    if (mogParam !== null && /^\d{1,4}$/.test(mogParam) && Number(mogParam) <= MAX_SCORE) {
      store.set("challenge", { score: Number(mogParam), seen: false });
      cleanUrl();
    }
    // Dev helpers (local only): ?unlock=dev unlocks supporter features, ?reset replays today's run.
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
        api("/api/unlock?game=mogillion&owner=" + encodeURIComponent(ownerCode))
          .then(({ token }) => { store.set("unlockToken", token); unlockedNow("Owner unlock active. Unlimited runs are yours!"); })
          .catch(() => toast("That owner code didn't work."));
      }
    }
    if (LOCAL && params.has("reset")) {
      const d = dayNumber();
      try { localStorage.removeItem("mogillion:" + dayKey(d)); localStorage.removeItem("mogillion:submitted:" + d); } catch (e) { /* ignore */ }
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
    $("#btn-archive").addEventListener("click", openArchive);
    $("#btn-how").addEventListener("click", openHow);
    $("#btn-stats").addEventListener("click", openStats);
    $("#btn-menu-home").addEventListener("click", () => showScreen("menu"));
    $$("[data-home]").forEach((b) => b.addEventListener("click", () => showScreen("menu")));
    $("#btn-again").addEventListener("click", startUnlimited);
    $("#btn-next-unl").addEventListener("click", startUnlimited);
    $("#btn-next-online").addEventListener("click", openOnline);
    $("#btn-challenge").addEventListener("click", challengeFriend);
    $("#btn-account").addEventListener("click", openAccount);
    $$(".site-foot [data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
    $("#cards-strip").addEventListener("click", () => toast("Finish each Daily Mog Check to earn a new Aura Card. Better runs drop rarer ones!"));
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
    if (window.BgScene) window.BgScene.setMood("menu");

    if (!store.get("seenHow", false)) { store.set("seenHow", true); openHow(); }

    // Shared with online-ui.js, and a hook for automated tests.
    window.Mogillion = { isCore, judge, key, TIERS, PROMPTS, store, toast, showScreen, esc, CONFIG, tierSprite };
    window.MOGILLION_DEBUG = { judge, key, dailyPrompts, dayNumber, PROMPTS, drawDistribution, renderRadar };
  }

  init();
})();
