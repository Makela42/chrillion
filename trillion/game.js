(() => {
  "use strict";

  // =====================================================================
  // CONFIG: change these freely
  // =====================================================================
  const CONFIG = {
    name: "Trillion",
    promptsPerDive: 7,
    secondsPerPrompt: 25,
    epoch: "2026-11-21",      // the day the site opened = Daily Market Open No. 1 (YYYY-MM-DD)
    price: "$3.99",           // display only; the real price is set in Stripe
    apiBase: "",              // where the /api functions live ("" = same site)
    paymentLink: "https://buy.stripe.com/bJe28t5PF6jodOTaTxg7e02",        // Stripe Payment Link for the Trillion Pass (empty = "opens soon")
    minPlayersForCurve: 5,    // players needed before the "better than X%" curve appears
  };
  const DAY_OFFSET = 200000;  // Trillion's days live at day + 200000 in the shared daily_scores table

  // Fixed point tiers. Every answer in the prompt files belongs to exactly one.
  const TIERS = {
    miracle: { pts: 100, label: "One in a Trillion", emoji: "💎", desc: "The one handpicked best answer" },
    t75:     { pts: 85,  label: "Alpha",             emoji: "🐂", desc: "A real deep cut" },
    t50:     { pts: 60,  label: "Bull Run",          emoji: "📈", desc: "Solid, not everyone gets it" },
    t25:     { pts: 30,  label: "Index Fund",        emoji: "📊", desc: "Well known, safe and steady" },
    trap:    { pts: 15,  label: "Bag Holder",        emoji: "💼", desc: "The 'clever' answer everyone tries" },
    t10:     { pts: 10,  label: "Penny Stock",       emoji: "🪙", desc: "The first thing anyone says" },
    miss:    { pts: 0,   label: "Delisted",          emoji: "❌", desc: "Not a valid answer" },
    timeout: { pts: 0,   label: "Market Closed",     emoji: "🔔", desc: "Time ran out before a valid answer" },
  };
  const TIER_ORDER = ["t75", "t50", "t25", "t10"];
  const TIER_COLORS = { miracle: "#d4a017", t75: "#1f9d63", t50: "#16878f", t25: "#2b4f9a", trap: "#7b3fa0", t10: "#7d858c", miss: "#a3262e", timeout: "#ffffff" };

  const PROMPTS = [].concat(window.CHRILLION_PROMPTS || [], window.TRILLION_PROMPTS || []);
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
      try { const v = localStorage.getItem("trillion:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) { try { localStorage.setItem("trillion:" + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
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
  const CORE_IDS = new Set([]);
  const FEATURED = {};
  const RESET = {};
  const isCore = (p) => !!p.core || CORE_IDS.has(p.id);
  let pools = null;
  function getPools() {
    // Prompts flagged "core" lead each run; with no flags (or too few) every prompt is in one big pool.
    if (!pools) {
      const core = PROMPTS.filter(isCore);
      pools = core.length >= CORE_PER_RUN ? { core, other: PROMPTS.filter((p) => !isCore(p) && p.broad) } : { core: PROMPTS.slice(), other: [] };
    }
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
    if (FEATURED[day]) { const f = FEATURED[day].map((id) => PROMPTS.find((p) => p.id === id)).filter(Boolean); if (f.length === CONFIG.promptsPerDive) return f; }
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
      const { token } = await api("/api/unlock?game=trillion&session_id=" + encodeURIComponent(sid));
      store.set("unlockToken", token);
      unlockedNow("Trillion Pass active. Thank you!");
    } catch (e) {
      toast("Couldn't confirm the payment yet. Try “Restore purchase”.");
    }
  }

  async function reverifyToken() {
    const t = getToken();
    if (!t || t === "dev" || !ONLINE) return;
    try {
      const r = await api("/api/unlock?game=trillion&token=" + encodeURIComponent(t));
      if (r.valid === false) { store.set("unlockToken", null); renderMenu(); }
    } catch (e) { /* network/API missing: keep the unlock */ }
  }

  async function buy() {
    if (CONFIG.paymentLink) { location.href = CONFIG.paymentLink; return; }   // Stripe Payment Link; it should redirect back with ?session_id={CHECKOUT_SESSION_ID}
    toast("The Trillion Pass opens soon");
  }

  async function restore(e) {
    e.preventDefault();
    const email = $("#restore-email").value.trim();
    if (!email) return;
    const btn = $("#btn-restore");
    btn.disabled = true;
    try {
      const { token } = await api("/api/restore?game=trillion", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      store.set("unlockToken", token);
      $("#dlg-paywall").close();
      unlockedNow("Pass restored");
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
        body: JSON.stringify({ day: day + DAY_OFFSET, score, player: playerId() }),
      });
      if (r.ok || r.status === 409) store.set("submitted:" + day, true);
    } catch (e) { /* offline: try again next time results are shown */ }
  }

  async function fetchHistogram(day) {
    const c = cloud();
    const r = await fetch(`${c.url}/rest/v1/rpc/daily_histogram`, {
      method: "POST",
      headers: { apikey: c.key, "Content-Type": "application/json" },
      body: JSON.stringify({ p_day: day + DAY_OFFSET }),
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
    if (id !== "online" && window.TrillionOnlineUI && window.TrillionOnlineUI.isOpen()) window.TrillionOnlineUI.leave();
  }

  const certNo = (n) => "No. " + String(Math.max(0, n)).padStart(6, "0");
  function marketText() {
    const day = dayNumber();
    return day >= 1 ? `${certNo(day)} · Market open` : "Pre-market · opens soon";
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
    if (pct >= 0.7) return "Trillionaire";
    if (pct >= 0.5) return "Hedge Fund Manager";
    if (pct >= 0.3) return "Portfolio Pro";
    if (pct >= 0.15) return "Day Trader";
    return "Paper Hands";
  }

  // ---------- career ladder (lifetime, by Daily Market Opens finished) + streak seals ----------
  const CAREER = [[0, "Mailroom Intern"], [1, "Intern"], [3, "Analyst"], [7, "Associate"], [14, "Vice President"], [30, "Partner"], [60, "Managing Director"], [100, "CEO"]];
  const SEALS = [[3, "Bronze Seal"], [7, "Silver Seal"], [14, "Gold Seal"], [30, "Platinum Seal"], [60, "Diamond Seal"], [100, "Trillion Seal"]];
  function careerInfo() {
    const n = loadStats().played;
    let i = 0;
    CAREER.forEach((c, k) => { if (n >= c[0]) i = k; });
    const next = CAREER[i + 1];
    return { title: CAREER[i][1], next: next ? { title: next[1], left: next[0] - n } : null, seals: store.get("seals", []) };
  }
  // A different flavour every weekday. Pure copy: scoring never changes.
  const TWISTS = [
    ["Sunday Dividend", "Slow Sunday. Dig deeper than the first thing in your head."],
    ["Merger Monday", "Two ideas collide. Answer with the one nobody else would merge."],
    ["Contrarian Tuesday", "Do the opposite of the crowd today."],
    ["Wild-Card Wednesday", "Midweek volatility. Weird answers welcome."],
    ["Throwback Thursday", "Old money, old ideas. Go vintage."],
    ["Fire-Sale Friday", "Everything must go. Spend your best answers early."],
    ["Short-Squeeze Saturday", "Weekend whales are out. Think rarer than rare."],
  ];
  const twist = () => TWISTS[new Date().getDay()];
  // Memorable run titles: the first one that fits replaces the plain rating.
  function runTitle(results, score) {
    const c = (t) => results.filter((r) => r.tier === t).length;
    if (c("miracle") >= 3) return "Market Whisperer";
    if (c("miracle") >= 2) return "Unicorn Hunter";
    if (c("trap") >= 3) return "Chief Bag Officer";
    if (results.length && results.every((r) => r.tier === "t10" || r.tier === "timeout" || r.tier === "miss")) return "Index Fund Intern";
    if (c("timeout") >= 3) return "Asleep at the Bell";
    if (c("miracle") === 1 && score < 300) return "One Lucky Trade";
    return rating(score);
  }

  function renderMenu() {
    const day = dayNumber();
    const saved = store.get(dayKey(day), null);
    const played = saved && saved.done;
    const unlocked = isUnlocked();
    const streak = currentStreak();
    const pastDays = Math.max(0, day - 1);

    $("#hero-eyebrow").textContent = day >= 1 ? `Daily Market Open ${certNo(day)}` : "Pre-market preview";
    $("#hero-sub").textContent = played
      ? `You scored ${total(saved.results)} of ${MAX_SCORE}: ${rating(total(saved.results))}.`
      : `${twist()[0]}: ${twist()[1]}`;
    const ci = careerInfo();
    $("#career").innerHTML = `<b>${esc(ci.title)}</b>` + (ci.next ? ` · ${ci.next.left} more Market Open${ci.next.left === 1 ? "" : "s"} to ${esc(ci.next.title)}` : " · top of the ladder") +
      (ci.seals.length ? `<span class="seals">${ci.seals.map((n) => `<i title="${esc(n)}">${Spr ? Spr.svg("seal", 18) : ""}</i>`).join("")}</span>` : "");
    $("#daily-sub").textContent = played ? "Stamped paid · see your results" : streak > 0 ? `Keep your ${streak}-day streak alive!` : "Same 7 for everyone";
    renderTree($("#home-tree"), true);
    const badge = $("#streak-badge");
    badge.hidden = streak < 1;
    badge.innerHTML = (Spr ? Spr.svg("flame", 14) : "") + `<span>${streak}</span>`;

    $("#unl-sub").textContent = unlocked ? "Play as many as you like" : freeRunLeft() ? "1 free run on us" : "Pass holders only";
    $("#arch-sub").textContent = pastDays ? `${pastDays} past session${pastDays === 1 ? "" : "s"}` : "Opens tomorrow";
    const s = loadStats();
    $("#stats-sub").textContent = s.played ? `Best ${s.best} · streak ${streak}` : "Streaks & records";
    $("#mkt-status").textContent = marketText();
    $("#cert-no").textContent = day >= 1 ? "Share Certificate " + certNo(day) : "Share Certificate · Specimen";

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
    $("#sup-title").textContent = unlocked ? "Trillion Pass · active" : "Get the Trillion Pass";
    $("#sup-sub").textContent = unlocked
      ? "Unlimited runs and the full archive are unlocked. Thank you!"
      : `Every past session + endless fresh runs · ${CONFIG.price} once`;
    $("#sl-daily").textContent = day >= 1 ? certNo(day) : "Preview";
    $("#sl-unl").textContent = unlocked ? "Unlocked ∞" : freeRunLeft() ? "1 free run" : "Pass holders";
    $("#sl-archive").textContent = day > 1 ? `${day - 1} past session${day - 1 === 1 ? "" : "s"}` : "Every past session";
    $("#tg-sfx").setAttribute("aria-pressed", String(Sfx.isSfx()));
    $("#tg-music").setAttribute("aria-pressed", String(Sfx.isMusic()));
    $("#btn-sfx").setAttribute("aria-pressed", String(Sfx.isSfx()));
    $("#btn-music").setAttribute("aria-pressed", String(Sfx.isMusic()));
    $("#sheet-foot").textContent = `Trillion · ${marketText()}`;
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
    if (window.TrillionOnlineUI) { showScreen("online"); window.TrillionOnlineUI.open(); }
    else toast("Online play is loading… try again in a moment.");
  }

  // =====================================================================
  // Runs
  // =====================================================================
  function storeKey() { return state.mode === "archive" ? "archive:" + state.day : dayKey(state.day); }
  // A day listed in RESET gets a fresh save slot, so everyone replays it (used when a day's prompts are swapped).
  function dayKey(day) { return "daily:" + day + (RESET[day] ? ":" + RESET[day] : ""); }

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
      toast("Your free Unlimited Run, on the house");
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
    { const sc = $("#score"), v = total(state.results); if (sc.textContent !== String(v) && v > 0) { sc.parentNode.classList.remove("bump"); void sc.parentNode.offsetWidth; sc.parentNode.classList.add("bump"); } sc.textContent = v; }
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
    if (window.Scene) window.Scene.play(state.i);   // a live market scene plays while you think
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
    $("#game").classList.add("revealing");      // hide the prompt so the coins have the screen to themselves
    if (window.Scene) window.Scene.stop();
    if (window.Fx) window.Fx.celebrate(r.tier);
    renderDots();
    if (window.Journey) window.Journey.set(total(state.results));
    renderFeedback(p, res);
  }

  // ---------- portfolio of share certificates + "what's next" (the reason to come back tomorrow) ----------
  function renderTree(el, compact, newDay) {
    const orn = store.get("certs", []);
    if (compact) {
      $("#tree-card").hidden = !window.AdventTree || !orn.length;
      $("#tree-cap").textContent = `Your portfolio · ${orn.length} certificate${orn.length === 1 ? "" : "s"}`;
    }
    if (window.AdventTree && el && (orn.length || !compact)) window.AdventTree.render(el, orn, { compact, newDay });
  }
  function renderNext() {
    const daily = state.mode === "daily";
    const streak = currentStreak();
    $("#next-card").hidden = !window.AdventTree && !daily;
    renderTree($("#next-tree"), false, state.fresh ? state.newOrn : null);
    $("#next-streak").textContent = streak ? `${streak}-day streak` : "";
    $("#next-msg").textContent = daily
      ? (state.newOrn ? "New certificate issued! Come back tomorrow for another one" : "Come back tomorrow for a new certificate") + (streak ? ` and make your streak ${streak + 1}.` : ".")
      : "Every Daily Market Open issues a share certificate. Don't miss tomorrow's!";
    state.newOrn = null;
    const b = $("#btn-next-unl");
    const free = freeRunLeft();
    b.hidden = !(isUnlocked() || free);
    b.textContent = free ? "Play your FREE Unlimited run" : "Play another run";
  }

  // The Broker chats while you think.
  const SAY = {
    start: ["Buy low, answer rare.", "Think rare. The obvious stuff barely pays!", "Skip the first thing in your head!", "Deep cuts yield the best returns.", "Diversify your answers!", "Rare answers = bigger returns!"],
    mid: ["Tick tock, the market's moving!", "Still thinking? Go contrarian!", "Halfway to the bell!", "Volume's drying up…"],
    late: ["Market's closing!", "Any answer beats no answer!", "Hurry, hurry, hurry!"],
    nope: ["That ticker doesn't exist. Nice try.", "Bold. Also not a real answer.", "Not on the exchange! Try again.", "Hmm, that's not listed. Another!", "Close… but not quite!"],
  };
  const pickLine = (a) => a[Math.floor(Math.random() * a.length)];
  function say(text) {
    const b = $("#say-text");
    if (!b) return;
    b.textContent = text;
    const w = b.parentElement;
    w.classList.remove("say-pop"); void w.offsetWidth; w.classList.add("say-pop");
  }

  // The Broker reacts to every answer.
  const REACTIONS = {
    miracle: ["ONE IN A TRILLION! Ring the bell!", "Unicorn pick. Nobody gets that one.", "Moon mission confirmed.", "Absolute alpha.", "You just beat the entire market."],
    t75: ["Big brain pick!", "Ooh, a deep cut. Respect.", "That's pure alpha.", "Locked in!", "Smart money right there."],
    t50: ["Nice, the bulls are running!", "Solid pick.", "Clutch trade!", "Green candles all day.", "Good call."],
    t25: ["Index fund energy. Safe and steady.", "Respect the classics.", "A crowd favourite!", "Steady returns."],
    trap: ["Don't be a bag holder!", "Too clever… everyone bought that one.", "Bag holder alert!", "Oof, the trap got you!"],
    t10: ["Penny stock… but it counts!", "Too basic! Go deeper next time.", "Everyone's first answer.", "Valid. Very, very cheap."],
    timeout: ["The bell rang without you!", "Market closed!", "Oof. Time's up!", "Not even a bid…"],
    miss: ["Hmm, that's not listed."],
  };
  function react(tier, res) {
    let lines = REACTIONS[tier] || REACTIONS.miss;
    const a = res && res.matched;
    if (tier === "trap" && a) lines = lines.concat([`"${a}"? Half the market bought that one.`, `You bought "${a}" at the top. Classic.`, `"${a}" looked smart. It was bait.`]);
    if (tier === "t10" && a) lines = lines.concat([`"${a}". Bold. Brave. Extremely common.`, `Somebody in your class said "${a}" too.`]);
    if (tier === "miracle" && a) lines = [`"${a}"?! Ring the bell. Nobody else found it.`, `"${a}" is the one. You just read the whole market.`, "ONE IN A TRILLION! Tell your friends. Slowly."];
    const bubble = $("#fb-bubble"), elf = $("#fb-elf");
    elf.innerHTML = Spr ? Spr.svg("broker", 48) : "";
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
    react(res.tier, res);
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
    else if (res.tier === "timeout") blurb = "The bell rang without you.";
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
      const already = store.get(dayKey(state.day), {});
      if (!already.done) {
        saveProgress({ started: state.prompts.length, done: true });
        const s = loadStats();
        state.prevBest = s.best; state.prevTitle = careerInfo().title;
        s.played++;
        s.totalPts += score;
        s.best = Math.max(s.best, score);
        s.streak = s.lastDay === state.day - 1 ? s.streak + 1 : 1;
        s.maxStreak = Math.max(s.maxStreak, s.streak);
        { const seals = store.get("seals", []); const m = SEALS.find((x) => x[0] === s.streak); if (m && !seals.includes(m[1])) { seals.push(m[1]); store.set("seals", seals); state.seal = m[1]; } }
        s.lastDay = state.day;
        s.miracles += miracles;
        store.set("stats", s);
        const orn = store.get("certs", []);
        if (!orn.some((o) => o.day === state.day)) { orn.push({ day: state.day, kind: window.AdventTree ? window.AdventTree.kindFor(score) : "common" }); store.set("certs", orn); state.newOrn = state.day; }
      }
    } else if (state.mode === "archive") {
      saveProgress({ started: state.prompts.length, done: true });
    } else {
      const s = loadStats();
      state.prevBest = s.unlimitedBest;
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
    if (state.mode === "daily") return state.day >= 1 ? `Market Open ${certNo(state.day)} closed` : "Preview session closed";
    if (state.mode === "archive") return `Archive · ${certNo(state.day)}`;
    return "Unlimited trading run";
  }

  function showSummary() {
    const score = total(state.results);
    $("#sum-mode").textContent = modeLabel();
    $("#sum-max").textContent = `/ ${MAX_SCORE}`;
    $("#sum-rating").textContent = runTitle(state.results, score);
    {
      const bits = [], pb = state.prevBest, ci = careerInfo();
      if (state.prevTitle && state.prevTitle !== ci.title) bits.push("Promoted to " + ci.title + "!");
      if (state.seal) bits.push(state.seal + " earned for your " + currentStreak() + "-day streak.");
      if (pb !== undefined && state.mode !== "archive") {
        if (!pb) bits.push("First run on the books. Welcome to the floor.");
        else if (score > pb) bits.push("New personal best! +" + (score - pb) + " over your old " + pb + ".");
        else if (score === pb) bits.push("You tied your personal best of " + pb + ".");
        else if (pb - score <= 40) bits.push("Just " + (pb - score) + " short of your best (" + pb + ").");
      }
      const co = $("#sum-callout");
      co.hidden = !bits.length; co.textContent = bits.join(" ");
    }
    $("#sum-miles").textContent = "$" + (score * 1250).toLocaleString() + " net worth";
    $("#recap-score").textContent = `${score} pts`;
    $("#dist-score").textContent = `You: ${score} pts`;
    const ms = window.Journey && window.Journey.reached(score);
    $("#sum-journey").textContent = ms ? `Career level: ${ms.name}` : "Score 50 to make Intern!";
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
          <span class="bd-pts">${r.pts}</span><span class="bd-caret" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></summary>
        <div class="ans-groups">${groups}</div>
      </details></li>`;
    }).join("");

    showScreen("summary");
    renderRecap(state.results);
    renderComparison(score);
    if (window.Vote) {
      try {
        window.Vote.mount(document.getElementById("vote-card"), {
          game: "trillion", pollId: "next-feature-1", question: "What should we build next?",
          options: [
            { id: "leaderboard", label: "Friends leaderboard", desc: "Add friends and compare your scores." },
            { id: "hardmode", label: "Hard mode", desc: "15-second timer and no typo help." },
            { id: "pvp", label: "Head-to-head mode", desc: "1v1 live duels against other players." },
          ],
          closes: "2026-12-05",
        });
      } catch (e) { /* the vote card is optional */ }
    }

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
    const W = 340, H = 170, top = 30, base = 128, gap = 10;
    const n = Math.max(results.length, 1);
    const colW = (W - gap * (n + 1)) / n;
    let s = `<line x1="0" y1="${base}" x2="${W}" y2="${base}" stroke="#1b2a24" stroke-width="1.5"/>`;
    [25, 50, 75, 100].forEach((v) => {
      const y = base - (v / 100) * (base - top);
      s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="rgba(27,42,36,.16)" stroke-dasharray="2 4"/>`;
    });
    results.forEach((r, i) => {
      const x = gap + i * (colW + gap);
      const h = Math.max(3, (r.pts / 100) * (base - top));
      const y = base - h;
      const wick = Math.min(10, 3 + h * 0.15);
      s += `<line x1="${x + colW / 2}" y1="${y - wick}" x2="${x + colW / 2}" y2="${base}" stroke="${TIER_COLORS[r.tier] === "#ffffff" ? "#1b2a24" : TIER_COLORS[r.tier]}" stroke-width="1.5"/>`;
      s += `<rect x="${x}" y="${y}" width="${colW}" height="${h}" fill="${TIER_COLORS[r.tier]}" stroke="#1b2a24" stroke-width="1.5"/>`;
      s += `<text class="chart-val" x="${x + colW / 2}" y="${y - wick - 3}" text-anchor="middle">${r.pts}</text>`;
      if (Spr) s += Spr.inner(Spr.TIER_SPRITE[r.tier] || "x", x + colW / 2 - 9, base + 6, 18);
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
    let s = `<defs><linearGradient id="distFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f9d63" stop-opacity=".42"/><stop offset="1" stop-color="#1f9d63" stop-opacity=".03"/></linearGradient></defs>`;
    for (let g = 1; g <= 3; g++) s += `<line x1="${padL}" y1="${base - g * (base - top) / 3}" x2="${W - padR}" y2="${base - g * (base - top) / 3}" stroke="rgba(27,42,36,.12)" stroke-dasharray="2 4"/>`;
    s += `<path d="${line} L${x(MAX_SCORE)},${base} L${x(0)},${base} Z" fill="url(#distFill)"/>`;
    s += `<path d="${line}" fill="none" stroke="#14704a" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += `<line x1="${padL}" y1="${base}" x2="${W - padR}" y2="${base}" stroke="#1b2a24" stroke-width="1.5"/>`;
    for (let v = 0; v <= MAX_SCORE; v += 100) {
      s += `<line x1="${x(v)}" y1="${base}" x2="${x(v)}" y2="${base + 5}" stroke="#1b2a24" stroke-width="1.5"/>`;
      s += `<text class="chart-axis" x="${x(v)}" y="${base + 19}" text-anchor="middle">${v}</text>`;
    }
    // Height of the curve at any score (smooth, for the marker's ride).
    const yAt = (v) => {
      const f = Math.max(0, Math.min(pts.length - 1, v / 5)), i0 = Math.floor(f), i1 = Math.min(pts.length - 1, i0 + 1), k = f - i0;
      return y(pts[i0][1] * (1 - k) + pts[i1][1] * k);
    };
    const sx = x(Math.min(score, MAX_SCORE)), sy = yAt(score);
    s += `<line id="dist-drop" x1="${sx}" y1="${sy}" x2="${sx}" y2="${base}" stroke="#a3262e" stroke-width="1.6" stroke-dasharray="3 3" opacity="0"/>`;
    // A gold coin rides along the curve to your score.
    s += `<g id="dist-santa"><circle r="7.5" fill="#d4a017" stroke="#1b2a24" stroke-width="1.6"/><circle r="4" fill="none" stroke="#8a6410" stroke-width="1"/></g>`;
    s += `<text id="dist-you" class="chart-you" x="${Math.min(W - 52, Math.max(52, sx))}" y="${Math.max(14, sy - 16)}" text-anchor="middle" fill="#a3262e" opacity="0">You · ${score} pts</text>`;
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
    setTimeout(finish, delay + dur + 600);   // safety net: the marker always ends up on your score
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
    if (day < 1) { setDistText(est, "Estimated curve. Live player comparison starts with the first Market Open."); $("#st-rank").textContent = "soon"; return; }
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
    return state.mode === "daily" ? `${CONFIG.name} ${state.day >= 1 ? certNo(state.day) : "Preview"}`
      : state.mode === "archive" ? `${CONFIG.name} ${certNo(state.day)} (archive)` : `${CONFIG.name} Unlimited`;
  }
  function shareText(withUrl = true) {
    const url = withUrl && ONLINE ? "\n" + shareUrl() : "";
    const score = total(state.results);
    const n = (t) => state.results.filter((r) => r.tier === t).length;
    const brag = [n("miracle") ? "💎 x" + n("miracle") + " One in a Trillion" : "", n("trap") ? "💼 x" + n("trap") + " bags held" : "", n("timeout") ? "🔔 x" + n("timeout") + " missed the bell" : ""].filter(Boolean).join(" · ");
    return `${shareTitle()} 📈 ${score}/${MAX_SCORE} · "${runTitle(state.results, score)}"\n${grid(state.results)}${brag ? "\n" + brag : ""}\nThink you can beat ${score}? Same 7 prompts for everyone.${url}`;
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

  // Tier icons for the share card: render the SVG into an <img> and draw that on the canvas.
  const iconImgs = new Map();
  function loadIcon(name, px) {
    const k = name + px;
    if (iconImgs.has(k)) return iconImgs.get(k);
    const p = new Promise((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => res(null);
      const svg = Spr.svg(name, px).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
    iconImgs.set(k, p);
    return p;
  }

  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // A result card (1080x1350) drawn as a vintage share certificate, for stories and posts.
  async function drawShareCard() {
    const c = $("#share-card"), W = 1080, H = 1350, ctx = c.getContext("2d");
    try { await Promise.all([document.fonts.load('900 120px "Playfair Display"'), document.fonts.load('600 40px "IBM Plex Sans"'), document.fonts.load('500 30px "IBM Plex Mono"')]); } catch (e) { /* fall back to system fonts */ }
    const icons = Spr ? await Promise.all(state.results.map((r) => loadIcon(Spr.TIER_SPRITE[r.tier] || "x", 96))) : [];
    const score = total(state.results);
    const serif = '"Playfair Display", Georgia, serif', sans = '"IBM Plex Sans", system-ui, sans-serif', mono = '"IBM Plex Mono", ui-monospace, monospace';
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0e3a2d"); g.addColorStop(1, "#08241c");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,.05)"; ctx.lineWidth = 2;
    for (let i = -H; i < W; i += 36) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); }
    // faint rising chart behind the certificate
    ctx.strokeStyle = "rgba(246,213,120,.16)"; ctx.lineWidth = 5; ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const x = i * (W / 24), y = H - 120 - i * 18 - Math.sin(i * 1.7) * 40; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    // the certificate
    const px = 70, py = 90, pw = 940, ph = 1060;
    ctx.fillStyle = "rgba(0,0,0,.4)"; roundRect(ctx, px + 8, py + 14, pw, ph, 10); ctx.fill();
    const paper = ctx.createLinearGradient(0, py, 0, py + ph);
    paper.addColorStop(0, "#f6edd3"); paper.addColorStop(1, "#ecdfbd");
    ctx.fillStyle = paper; roundRect(ctx, px, py, pw, ph, 10); ctx.fill();
    ctx.strokeStyle = "#14704a"; ctx.lineWidth = 8; ctx.strokeRect(px + 22, py + 22, pw - 44, ph - 44);
    ctx.lineWidth = 2; ctx.strokeRect(px + 38, py + 38, pw - 76, ph - 76);
    ctx.strokeStyle = "rgba(20,112,74,.55)"; ctx.lineWidth = 1.5; ctx.strokeRect(px + 46, py + 46, pw - 92, ph - 92);
    // guilloche rosettes in the corners
    [[px + 90, py + 90], [px + pw - 90, py + 90], [px + 90, py + ph - 90], [px + pw - 90, py + ph - 90]].forEach(([cx, cy]) => {
      ctx.strokeStyle = "rgba(20,112,74,.45)"; ctx.lineWidth = 1.3;
      for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.ellipse(cx, cy, 44, 16, (k * Math.PI) / 14, 0, Math.PI * 2); ctx.stroke(); }
    });
    ctx.textAlign = "center";
    ctx.fillStyle = "#1b2a24"; ctx.font = `900 150px ${serif}`; ctx.fillText("TRILLION", W / 2, py + 220);
    ctx.fillStyle = "#14704a"; ctx.font = `600 30px ${sans}`;
    const sub = state.mode === "unlimited" ? "UNLIMITED TRADING RUN" : state.day >= 1 ? `DAILY MARKET OPEN · ${dayDate(state.day).toUpperCase()}` : "PREVIEW SESSION";
    ctx.fillText(sub, W / 2, py + 275);
    ctx.fillStyle = "#6b6a55"; ctx.font = `500 28px ${mono}`;
    ctx.fillText(state.mode === "unlimited" ? "No. UNLIMITED" : certNo(state.day), W / 2, py + 322);
    ctx.fillStyle = "#1b2a24"; ctx.font = `900 300px ${serif}`; ctx.fillText(String(score), W / 2, py + 620);
    ctx.fillStyle = "#6b6a55"; ctx.font = `600 40px ${sans}`;
    ctx.fillText(`/ ${MAX_SCORE} PTS · $${(score * 1250).toLocaleString()} NET WORTH`, W / 2, py + 685);
    ctx.fillStyle = "#a3262e"; ctx.font = `italic 700 66px ${serif}`; ctx.fillText(runTitle(state.results, score), W / 2, py + 775);
    const n = state.results.length, size = 96, gap = 18;
    const startX = (W - (n * size + (n - 1) * gap)) / 2;
    icons.forEach((img, i) => { if (img) ctx.drawImage(img, startX + i * (size + gap), py + 820, size, size); });
    ctx.fillStyle = "#1b2a24"; ctx.font = `700 40px ${sans}`; ctx.fillText("CAN YOU BEAT THE MARKET?", W / 2, py + 975);
    // rubber stamp
    ctx.save(); ctx.translate(px + pw - 190, py + 330); ctx.rotate(-0.2); ctx.globalAlpha = 0.8;
    ctx.strokeStyle = "#a3262e"; ctx.lineWidth = 6; roundRect(ctx, -120, -38, 240, 76, 8); ctx.stroke();
    ctx.fillStyle = "#a3262e"; ctx.font = `700 38px ${sans}`; ctx.fillText("UNREDEEMED", 0, 13); ctx.restore();
    ctx.fillStyle = "#f6d578"; ctx.font = `600 40px ${sans}`;
    ctx.fillText(ONLINE ? (location.host + location.pathname).replace(/\/$/, "").toUpperCase() : "TRILLION", W / 2, H - 64);
  }


  async function openShare() {
    Sfx.play("open");
    $("#dlg-share").showModal();
    await drawShareCard();
  }

  async function nativeShare() {
    const text = shareText();
    const blob = await new Promise((r) => $("#share-card").toBlob(r, "image/png"));
    const file = blob ? new File([blob], "trillion-run.png", { type: "image/png" }) : null;
    try {
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
      if (navigator.share) { await navigator.share({ title: shareTitle(), text, url: shareUrl() || undefined }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    copyText(text, "Copied! Paste it anywhere.");
  }

  function saveImage() {
    const a = document.createElement("a");
    a.download = "trillion-run.png";
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
      $("#archive-note").textContent = "Every past Market Open is filed here, starting tomorrow.";
    } else {
      $("#archive-note").textContent = unlocked
        ? "Play any past Market Open. Archive scores don't affect your streak."
        : "The archive comes with the Trillion Pass. Tap any session to unlock.";
      for (let d = today - 1; d >= 1; d--) {
        const daily = store.get(dayKey(d), null);
        const arch = store.get("archive:" + d, null);
        const done = (daily && daily.done && daily) || (arch && arch.done && arch);
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.innerHTML = `<span><b>${certNo(d)}</b><small>${esc(dayDate(d))}</small></span>` +
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

  const CONTACT = "merrillion.help@gmail.com";
  function track(event, params) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event }, params)); } catch (e) { /* ignore */ } }
  function openAccount() { if (window.Account) window.Account.open(); else toast("Accounts are loading… try again in a moment."); }
  function openMoreGames() {
    openInfo("More games", `<div class="more-games"><a class="mg-card mg-mer" href="https://www.merrillion.site"><span class="mg-art" aria-hidden="true">🎄</span><b>Merrillion</b><p>The Christmas daily word game. Seven festive prompts, rare answers and a new advent ornament every day.</p><span class="mg-play"><span>Play →</span></span></a><p class="muted">Got an idea for one? <a href="mailto:${CONTACT}">${CONTACT}</a></p></div>`);
  }
  function openPrivacy() {
    openInfo("Privacy", `<p>Trillion keeps your stats and streak in your browser. If you sign in, we store your email and stats in your account so they sync between devices.</p><p>We use Google Analytics (via Google Tag Manager) to count visits and see which features people use. Payments are handled by Stripe; we never see your card.</p><p>Feedback you send is stored so we can read it. We don't sell your data.</p><p>Questions or delete requests: <a href="mailto:${CONTACT}">${CONTACT}</a></p>`);
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
    const context = "Trillion · " + (state && state.prompts ? `${state.mode} ${state.day || ""} · ${state.prompts.map((p) => p.id).join(",")}` : "menu");
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
    ["What is Trillion?", "A finance-themed daily word game. Every day there's a Daily Market Open of 7 prompts, like “Name a famous stock exchange”. You get 25 seconds per prompt, and the rarer your answer, the bigger the return."],
    ["Who is the game for?", "Anyone who loves trivia, markets, money or a bit of friendly competition. You don't need to be a trader: the prompts are made so most people can answer something, and the deep cuts reward people who really know their stuff."],
    ["How many prompts are in a Daily Market Open?", "Seven, with 25 seconds each. A perfect run (a One in a Trillion on every prompt) scores 700."],
    ["How does rare-answer scoring work?", "Every answer has a fixed value set in advance by how familiar it is: Penny Stock 10, Index Fund 30, Bull Run 60, Alpha 85, and one handpicked One in a Trillion worth 100. The “clever” answer everyone tries is the Bag Holder, worth 15. Your score never depends on what other players typed."],
    ["Can I try again after a wrong answer?", "Yes. If your answer isn't listed, the answer bar shakes and you can keep trying until the timer runs out. Once a valid answer lands, it's locked in."],
    ["Do spelling mistakes count?", "Small ones are fine. Capitals, accents and “the” are ignored, and if you're one or two letters off we'll ask “Did you mean…?” so you can confirm."],
    ["How are the answer lists made?", "Each list is pulled together from reference sources with some AI help, then cleaned up and checked. Different spellings of the same answer are merged."],
    ["Why is the One in a Trillion sometimes less rare than an Alpha?", "It isn't chosen on rarity alone. It's the answer that's most satisfying to land, usually with a fun story behind it, and one that at least a few players actually get."],
    ["Why wasn't my answer accepted?", "It's probably missing from the list, sorry! The lists get updated between runs, so it may count in future."],
    ["When does the Daily Market Open reset?", "At midnight in your time zone. Everyone gets the same 7 prompts that day."],
    ["What happens if I close the game mid-run?", "Your progress is saved. When you come back you'll pick up where you left off, but the prompt you were on when you left counts as out of time."],
    ["Does my progress sync between devices?", "Yes, if you sign in (Menu → My account) we save your streak and stats to your account. Without an account they live in this browser. If you have the Trillion Pass, use “Restore purchase” with your checkout email to unlock on a new device."],
    ["Can I play with friends?", "Yes! Open the Trading Floor → Create a private room and send the code, or try Quick Play and Practice with bots. Everyone sits around the floor and takes turns passing the order."],
    ["Is Trillion free to play?", `The Daily Market Open and the Trading Floor are free, no account needed. Everyone gets one free Unlimited Run. The Trillion Pass (${CONFIG.price}, one time) gives you Unlimited Runs and the full archive.`],
  ];
  function openFaq() {
    openInfo("FAQ", `<div class="faq">${FAQ.map(([q, a]) => `<details><summary><span>${esc(q)}</span><i aria-hidden="true"></i></summary><p>${esc(a)}</p></details>`).join("")}</div>`);
  }

  function openStats() {
    const s = loadStats();
    const items = [
      [s.played, "Sessions played"],
      [s.played ? Math.round(s.totalPts / s.played) : 0, "Average"],
      [s.best, "Best session"],
      [currentStreak(), "Current streak"],
      [s.maxStreak, "Best streak"],
      [s.miracles, "One in a Trillion"],
    ];
    if (isUnlocked()) items.push([s.unlimitedPlayed, "Unlimited played"], [s.unlimitedBest, "Best unlimited"]);
    $("#stat-grid").innerHTML = items.map(([v, l]) => `<div class="stat"><b>${v}</b><span>${esc(l)}</span></div>`).join("");
    $("#dlg-stats").showModal();
  }

  function openPaywall() {
    $("#pay-price").textContent = `${CONFIG.price} · one time`;
    const btn = $("#btn-buy");
    btn.disabled = !ONLINE;
    btn.textContent = ONLINE ? `Get the Pass · ${CONFIG.price}` : "Checkout works once the site is online";
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
    const txt = `Next Daily Market Open in ${hh}h ${String(mm).padStart(2, "0")}m ${String(ss).padStart(2, "0")}s`;
    $$("[data-countdown]").forEach((el) => { el.textContent = txt; });
    if (!$("#menu").hidden && s === 0) renderMenu();
  }

  // =====================================================================
  // Wire up
  // =====================================================================
  function drawHero() {
    if (window.Title) window.Title.start();   // the animated candlestick hero
  }

  // ---------- ticker tape (tier stats + fun fake tickers) ----------
  function buildTicker() {
    const items = [
      ["$BULL", "▲4.2%"], ["ALPHA 85", "▲"], ["INDEX", "▲0.8%"], ["BULL RUN 60", "▲"], ["$GOLD", "▲1.2%"], ["BAGHOLD", "▼3.1%"],
      ["INDEX FUND 30", "▲"], ["$BEAR", "▼2.4%"], ["PENNY 10", "▼"], ["$TRIL", "▲7.7%"], ["ONE IN A TRILLION 100", "▲"], ["DELISTED", "▼100%"],
    ];
    const html = items.map(([s, c]) => `<span class="tk"><b>${esc(s)}</b> <i class="${c.indexOf("▲") === 0 ? "up" : "down"}">${esc(c)}</i></span>`).join("");
    const track = $("#ticker-track");
    if (track) track.innerHTML = html + html + html + html;
  }

  function init() {
    tidyPrompts();
    buildTicker();
    $$("[data-name]").forEach((el) => { el.textContent = CONFIG.name; });
    if (Spr) Spr.hydrate();
    drawHero();
    let heroTimer;
    window.addEventListener("resize", () => { clearTimeout(heroTimer); heroTimer = setTimeout(drawHero, 150); });

    // Dev helpers (local only): ?unlock=dev unlocks supporter features, ?reset replays today's run.
    const params = new URLSearchParams(location.search);
    if (LOCAL && params.get("unlock") === "dev") {
      store.set("unlockToken", "dev");
      setTimeout(() => toast("Trillion Pass unlocked (dev mode)"), 300);
      cleanUrl();
    }
    // Owner unlock (live site): open the site once with ?owner=YOUR_CODE (the OWNER_CODE set in Vercel).
    // The server checks the code and hands back a signed unlock, so the code never appears in this file.
    const ownerCode = params.get("owner");
    if (ownerCode) {
      cleanUrl();
      if (LOCAL) { store.set("unlockToken", "dev"); setTimeout(() => toast("Owner unlock active on this computer"), 300); }
      else {
        api("/api/unlock?game=trillion&owner=" + encodeURIComponent(ownerCode))
          .then(({ token }) => { store.set("unlockToken", token); unlockedNow("Owner unlock active."); })
          .catch(() => toast("That owner code didn't work."));
      }
    }
    if (LOCAL && params.has("reset")) {
      const d = dayNumber();
      try { localStorage.removeItem("trillion:daily:" + d); localStorage.removeItem("trillion:submitted:" + d); } catch (e) { /* ignore */ }
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
    $("#tree-card").addEventListener("click", () => toast("Finish each Daily Market Open to issue a new certificate. Better runs earn rarer ones!"));
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
    window.Trillion = { isCore, judge, key, TIERS, PROMPTS, store, toast, showScreen, esc, CONFIG, tierSprite };
    window.TRILLION_DEBUG = { judge, key, dailyPrompts, dayNumber, PROMPTS, drawDistribution, renderRecap };
  }

  init();
})();
