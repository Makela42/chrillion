/*
  Mogillion progression layer: rank titles, streak charms + Ice Shield, Aura Card sets, daily twist,
  personal-best callouts, holo drops, run titles, Copium reactions and head-to-head codes.
  Never touches tier points or scoring. Data lives in localStorage "mogillion:perks" (same prefix as game.js).
  Progress.complete(info) -> { callouts, holo }   (called once, when a daily run finishes)
*/
(() => {
  "use strict";

  const KEY = "mogillion:perks";
  const RANKS = [
    [0, "NPC"], [300, "Fresh Cut"], [900, "Glow Up"], [1800, "Gym Arc"], [3000, "Locked In"],
    [4800, "Main Character"], [7000, "Aura Farmer"], [10000, "Mog Mode"], [14000, "Gigachad Prime"],
  ];
  // streak day -> charm name, reward (shield = Ice Shield forgives one missed day, holo = that day's card turns holo foil)
  const CHARMS = [
    [3, "Warm-Up", ""], [7, "Chrome Week", "shield"], [14, "Two-Week Lock", "holo"], [21, "Habit Forged", "shield"],
    [30, "Month Mogger", "holo"], [50, "Half-Century", "shield+holo"], [100, "Centurion Aura", "holo"],
  ];
  const KINDS = ["npc", "fresh", "glow", "arc", "main", "mog"];
  const KIND_NAME = { npc: "NPC", fresh: "Fresh Cut", glow: "Glow Up", arc: "Gym Arc", main: "Main Char", mog: "Mog Mode" };
  const KIND_COL = { npc: "#8b9299", fresh: "#e8eef3", glow: "#4de2f7", arc: "#8b5cf6", main: "#f5c542", mog: "#ff9ad5" };
  const MAX_SHIELDS = 2;

  const tierPts = { miracle: 100, t75: 85, t50: 60, t25: 30, trap: 15, t10: 10 };
  const CODE = { miracle: "G", t75: "A", t50: "B", t25: "C", trap: "X", t10: "N", miss: "M", timeout: "M" };
  const UNCODE = { G: "miracle", A: "t75", B: "t50", C: "t25", X: "trap", N: "t10", M: "timeout" };

  // one twist per weekday; check(results) -> bool. Pure side objective: no points change.
  const TWISTS = [
    { name: "Lock-In Sunday", goal: "Land 4 answers worth 60+", check: (r) => r.filter((x) => (tierPts[x.tier] || 0) >= 60).length >= 4 },
    { name: "No Copium Monday", goal: "Zero Copium, zero time-outs", check: (r) => !r.some((x) => x.tier === "trap" || x.tier === "timeout") },
    { name: "Chad Tuesday", goal: "Land 2 Chad or better", check: (r) => r.filter((x) => (tierPts[x.tier] || 0) >= 85).length >= 2 },
    { name: "Zero Grey Wednesday", goal: "No Grey answers at all", check: (r) => !r.some((x) => x.tier === "t10") },
    { name: "Gigachad Thursday", goal: "Find the Gigachad answer once", check: (r) => r.some((x) => x.tier === "miracle") },
    { name: "Quick-Draw Friday", goal: "Answer 4 prompts in under 10s each", check: (r) => r.filter((x) => typeof x.t === "number" && x.t < 10 && x.tier !== "timeout").length >= 4 },
    { name: "Heat Check Saturday", goal: "Score 350 or more", check: (r) => r.reduce((s, x) => s + (x.pts || 0), 0) >= 350 },
  ];
  const STAMP_TITLES = [[3, "Twist Rookie"], [7, "Twist Collector"], [15, "Twist Menace"], [30, "Twist Legend"]];
  const GIGA_TITLES = [[1, "First Mog"], [5, "Gigachad Hunter"], [15, "Gigachad Magnet"], [40, "Crown Collector"]];

  function load() {
    let o = {};
    try { o = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { o = {}; }
    return Object.assign({ charms: [], titles: [], shields: 0, stamps: [], holo: [], setDone: false, rank: 0 }, o);
  }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* ignore */ } }

  function rankIndex(pts) { let r = 0; RANKS.forEach((x, i) => { if (pts >= x[0]) r = i; }); return r; }
  function rankFor(pts) {
    const i = rankIndex(pts), cur = RANKS[i], nxt = RANKS[i + 1];
    return { i, name: cur[1], next: nxt ? nxt[1] : null, need: nxt ? nxt[0] - pts : 0, pct: nxt ? Math.round(((pts - cur[0]) / (nxt[0] - cur[0])) * 100) : 100 };
  }

  function weekday(dayDateObj) { return dayDateObj.getDay(); }
  function twistFor(dateObj) { return TWISTS[weekday(dateObj || new Date())]; }

  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

  // ---------- shields ----------
  function shields() { return load().shields; }
  function useShield() { const o = load(); if (o.shields < 1) return false; o.shields--; save(o); return true; }

  // ---------- titles ----------
  function addTitle(o, t) { if (o.titles.indexOf(t) < 0) { o.titles.push(t); return true; } return false; }
  function currentTitle() { const t = load().titles; return t.length ? t[t.length - 1] : ""; }

  // ---------- run title: memorable result names from the tier mix ----------
  function runTitle(results, score) {
    const n = (t) => results.filter((r) => r.tier === t).length;
    const giga = n("miracle"), trap = n("trap"), grey = n("t10"), out = n("timeout") + n("miss");
    const strong = results.filter((r) => (tierPts[r.tier] || 0) >= 60).length;
    if (giga >= 3) return { name: "Reality Glitch", line: giga + " Gigachads in one run. Tell the group chat." };
    if (giga === 2) return { name: "Double Mog", line: "Two Gigachads. Nobody does that by accident." };
    if (trap >= 4) return { name: "Copium Dealer", line: trap + " Copium answers. The clever pick, every time." };
    if (trap === 3) return { name: "Copium Merchant", line: "Three Copium picks. You and the crowd think alike." };
    if (giga === 1 && trap >= 1) return { name: "Big Brain, Loose Cap", line: "One Gigachad and one Copium in the same run." };
    if (out >= 3) return { name: "Buffering", line: "The clock got you " + out + " times. Type faster than you think." };
    if (strong >= 7) return { name: "Zero Fluff", line: "Every answer was 60 or better. Clean." };
    if (giga === 1 && score >= 450) return { name: "One Shot, Full Send", line: "A Gigachad on top of a Gigamogger run." };
    if (giga === 1) return { name: "One Shot, One Mog", line: "You found the Gigachad answer. Brag responsibly." };
    if (grey >= 5) return { name: "Certified NPC", line: "Grey on most prompts. The crowd's answers are your answers." };
    if (strong >= 5) return { name: "Quiet Menace", line: strong + " answers at 60 or better. Low noise, high aura." };
    if (results.filter((r) => r.tier === "t25").length >= 4) return { name: "High Tier Normie Energy", line: "Solid picks. Next run, go one step weirder." };
    if (score >= 350) return { name: "Mid-Arc Protagonist", line: "The glow-up is loading." };
    return { name: "Fresh Spawn", line: "Everyone starts here. Come back tomorrow." };
  }

  // ---------- Copium / Gigachad reactions ----------
  function pick(a, seed) { return a[Math.floor(hash(seed) * a.length) % a.length]; }
  function copiumLine(display, nth, seed) {
    const d = "“" + display + "”";
    if (nth >= 3) return "That's Copium number " + nth + ". Pattern recognized.";
    if (nth === 2) return "Copium again?! You two should start a podcast.";
    return pick([
      d + "? That's the one everybody thinks is clever.",
      "Bro really typed " + d + ". Copium.",
      d + " feels smart. That's the trap.",
      "Cap. " + d + " is the crowd's secret favourite.",
    ], seed || display);
  }
  function gigaLine(nth) {
    if (nth >= 3) return "THREE Gigachads. Somebody check this run for glitches.";
    if (nth === 2) return "SECOND Gigachad. Show your friends right now.";
    return "GIGACHAD. Screenshot this one.";
  }

  // ---------- head-to-head ----------
  function encodeRun(results) { return results.map((r) => CODE[r.tier] || "M").join(""); }
  function decodeRun(t) { return typeof t === "string" && /^[GABCXNM]{7}$/.test(t) ? t.split("").map((c) => UNCODE[c]) : null; }
  function h2h(mine, theirTiers, label, color, prompts) {
    let w = 0, l = 0, tie = 0;
    const rows = mine.map((r, i) => {
      const a = tierPts[r.tier] || 0, bt = theirTiers[i] || "timeout", b = tierPts[bt] || 0;
      const res = a > b ? "w" : a < b ? "l" : "t";
      if (res === "w") w++; else if (res === "l") l++; else tie++;
      return `<li class="h2h-${res}"><span class="h2h-n">${i + 1}</span><span class="h2h-p">${esc(prompts[i] || "")}</span>` +
        `<span class="h2h-c" style="--tc:${color(r.tier)}">${esc(label(r.tier))}</span><span class="h2h-vs">${res === "w" ? "&gt;" : res === "l" ? "&lt;" : "="}</span>` +
        `<span class="h2h-c" style="--tc:${color(bt)}">${esc(label(bt))}</span></li>`;
    }).join("");
    return { w, l, tie, rows };
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  // ---------- completion: all the rewards for a finished daily ----------
  // info: { day, date, score, results, before:{best,streak,maxStreak,miracles,totalPts}, after:{...same}, cards:[...], shielded }
  function complete(info) {
    const o = load();
    const out = [];
    const push = (k, text) => out.push({ k, text });
    const b = info.before, a = info.after;
    let holo = false;

    if (info.shielded) push("shield", "Ice Shield used. Your " + a.streak + "-day streak survived.");

    // rank
    const r0 = rankIndex(b.totalPts), r1 = rankIndex(a.totalPts);
    if (r1 > r0) { push("rank", "RANK UP: " + RANKS[r1][1]); addTitle(o, RANKS[r1][1]); }
    o.rank = r1;

    // personal bests
    if (b.played > 0 && info.score > b.best) push("pb", "New personal best: " + info.score + " (was " + b.best + ")");
    const giga = info.results.filter((r) => r.tier === "miracle").length;
    if (a.streak > b.maxStreak && a.streak >= 3 && b.maxStreak >= 2) push("pb", "Longest streak yet: " + a.streak + " days");
    if (giga > 0 && b.miracles === 0) push("first", "First Gigachad ever. Frame it.");
    else if (giga >= 2) push("first", giga + " Gigachads in one run");
    GIGA_TITLES.forEach((g) => { if (a.miracles >= g[0] && b.miracles < g[0]) { addTitle(o, g[1]); push("title", "Title unlocked: " + g[1]); } });

    // streak charms
    CHARMS.forEach((c) => {
      if (a.streak >= c[0] && o.charms.indexOf(c[0]) < 0) {
        o.charms.push(c[0]);
        addTitle(o, c[1]);
        let r = "";
        if (c[2].indexOf("shield") >= 0) { if (o.shields < MAX_SHIELDS) o.shields++; r += " + Ice Shield (forgives one missed day)"; }
        if (c[2].indexOf("holo") >= 0) { holo = true; r += " + holo card"; }
        push("charm", c[0] + "-day charm: " + c[1] + r);
      }
    });

    // Aura Card set: one of every rarity
    const kinds = {};
    (info.cards || []).forEach((c) => { kinds[c.kind] = 1; });
    const have = KINDS.filter((k) => kinds[k]).length;
    if (!o.setDone && have === KINDS.length) {
      o.setDone = true;
      addTitle(o, "Full Spectrum");
      if (o.shields < MAX_SHIELDS) o.shields++;
      push("set", "SET COMPLETE: every Aura Card rarity. Title: Full Spectrum + Ice Shield");
    } else if (info.newKind && !o.setDone && !kinds_had(info)) {
      push("set", "New rarity for your set: " + KIND_NAME[info.newKind] + " (" + have + "/6)");
    }

    // daily twist
    const tw = twistFor(info.date);
    if (tw.check(info.results) && o.stamps.indexOf(info.day) < 0) {
      o.stamps.push(info.day);
      push("twist", "Twist cleared: " + tw.name);
      STAMP_TITLES.forEach((s) => { if (o.stamps.length >= s[0] && o.stamps.length - 1 < s[0]) { addTitle(o, s[1]); push("title", "Title unlocked: " + s[1]); } });
    }

    // rare surprise: a seeded 1-in-9 holo drop (same answer on refresh, can't be rerolled)
    if (!holo && hash("holo:" + (info.pid || "x") + ":" + info.day) < 0.11) { holo = true; push("holo", "SECRET DROP: your card came out holo"); }
    if (holo) o.holo.push(info.day);

    save(o);
    return { callouts: out, holo };
  }
  function kinds_had(info) { return (info.cardsBefore || []).some((c) => c.kind === info.newKind); }

  // ---------- drawn icons (same chrome/cyan language as the Aura Cards) ----------
  let uid = 0;
  function charmSvg(n, got, size) {
    const id = "pg" + ++uid;
    const hue = n >= 100 ? ["#ff9ad5", "#4de2f7"] : n >= 30 ? ["#fff3b0", "#b8861a"] : n >= 14 ? ["#b8f6ff", "#0b7288"] : ["#ffffff", "#5d6772"];
    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hue[0]}"/><stop offset="1" stop-color="${hue[1]}"/></linearGradient></defs>` +
      `<path d="M20 2l15 9v18l-15 9L5 29V11z" fill="${got ? "#12161c" : "#0d0f12"}" stroke="${got ? "url(#" + id + ")" : "#3a434c"}" stroke-width="2.4" stroke-linejoin="round"${got ? "" : ' stroke-dasharray="3 3"'}/>` +
      (got ? `<path d="M20 7l10 6v14l-10 6" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1"/>` : "") +
      `<text x="20" y="25" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="${n >= 100 ? 12 : 15}" fill="${got ? "#f4f7fa" : "#56606b"}">${n}</text></svg>`;
  }
  function shieldSvg(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5z" fill="#12161c" stroke="#4de2f7" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 6v12M7.5 9l9 6M16.5 9l-9 6" stroke="#9af0ff" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  }

  // ---------- panel (results + home twist strip dialog) ----------
  function panelHtml(stats, streak, cards, todayDay) {
    const o = load();
    const rk = rankFor(stats.totalPts || 0);
    const tw = twistFor(new Date());
    const doneToday = o.stamps.indexOf(todayDay) >= 0;
    const nextC = CHARMS.filter((c) => streak < c[0])[0];
    const kinds = {};
    (cards || []).forEach((c) => { kinds[c.kind] = 1; });
    const have = KINDS.filter((k) => kinds[k]).length;
    const rewardTxt = (c) => (c[2].indexOf("shield") >= 0 ? "Ice Shield" : "") + (c[2] === "shield+holo" ? " + " : "") + (c[2].indexOf("holo") >= 0 ? "holo card" : "") || "charm + title";
    return `<div class="pg">
  <div class="pg-rank"><div class="pg-row"><b>${esc(rk.name)}</b><span>${(stats.totalPts || 0).toLocaleString()} aura</span></div>
    <div class="pg-bar"><i style="width:${rk.pct}%"></i></div>
    <small>${rk.next ? rk.need.toLocaleString() + " more aura to " + esc(rk.next) : "Top rank. Nothing above you."}</small></div>
  <div class="pg-sec"><h4>Today's twist${doneToday ? ' <em class="pg-ok">cleared</em>' : ""}</h4><p><b>${esc(tw.name)}</b> · ${esc(tw.goal)}</p><small>Bonus goal only. Points don't change. ${o.stamps.length} cleared so far.</small></div>
  <div class="pg-sec"><h4>Streak charms${o.shields ? ` <span class="pg-shield">${shieldSvg(16)} x${o.shields}</span>` : ""}</h4>
    <div class="pg-charms">${CHARMS.map((c) => `<span class="pg-charm${o.charms.indexOf(c[0]) >= 0 ? " got" : ""}" title="${esc(c[1])}">${charmSvg(c[0], o.charms.indexOf(c[0]) >= 0, 38)}</span>`).join("")}</div>
    <small>${nextC ? "Next: " + nextC[0] + " days · " + esc(nextC[1]) + " (" + rewardTxt(nextC) + ")" : "Every charm earned."} Ice Shield forgives one missed day.</small></div>
  <div class="pg-sec"><h4>Aura set <span>${have}/6${o.setDone ? " · complete" : ""}</span></h4>
    <div class="pg-set">${KINDS.map((k) => `<span class="pg-slot${kinds[k] ? " got" : ""}" style="--c:${KIND_COL[k]}"><i></i>${KIND_NAME[k]}</span>`).join("")}</div>
    <small>Land every rarity once to earn the Full Spectrum title and an Ice Shield.</small></div>
  ${o.titles.length ? `<div class="pg-sec"><h4>Titles</h4><div class="pg-titles">${o.titles.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>` : ""}
</div>`;
  }

  const CSS = `
.pg{display:grid;gap:12px;text-align:left;color:var(--page-ink,#f4f7fa)}
.pg-row{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.pg-row b{font:400 24px/1 var(--font-display);letter-spacing:.05em;text-transform:uppercase;color:var(--cyan,#4de2f7)}
.pg-row span,.pg h4 span,.pg h4 em{font:400 14px var(--font-display);letter-spacing:.08em;text-transform:uppercase;color:var(--page-muted,#98a3b0);font-style:normal}
.pg h4{margin:0 0 4px;font:400 15px var(--font-display);letter-spacing:.1em;text-transform:uppercase;color:var(--cyan,#4de2f7);display:flex;justify-content:space-between;align-items:center;gap:8px}
.pg h4 em.pg-ok{color:#5ee6a8}
.pg p{margin:0 0 2px;font-size:15px}
.pg small{display:block;font-size:12.5px;line-height:1.35;color:var(--page-muted,#98a3b0)}
.pg-bar{height:8px;margin:6px 0 4px;border:1px solid rgba(255,255,255,.25);background:#0d0f12;border-radius:2px;overflow:hidden}
.pg-bar i{display:block;height:100%;background:linear-gradient(90deg,#0b7288,#4de2f7);transition:width .6s ease}
.pg-charms{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px}
.pg-charm{display:inline-flex;opacity:.55}.pg-charm.got{opacity:1;filter:drop-shadow(0 0 5px rgba(77,226,247,.45))}
.pg-shield{display:inline-flex;align-items:center;gap:3px;color:var(--cyan,#4de2f7)}
.pg-set{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:4px}
.pg-slot{display:flex;align-items:center;gap:6px;padding:5px 7px;border:1px dashed rgba(255,255,255,.25);border-radius:4px;font:400 12.5px var(--font-display);letter-spacing:.06em;text-transform:uppercase;color:#6b7580}
.pg-slot i{width:9px;height:12px;border-radius:2px;border:1.5px solid currentColor;flex:none}
.pg-slot.got{border:1px solid var(--c);color:var(--page-ink,#f4f7fa);background:rgba(255,255,255,.05)}.pg-slot.got i{background:var(--c);border-color:var(--c)}
.pg-titles{display:flex;gap:5px;flex-wrap:wrap}.pg-titles span{padding:3px 8px;border:1px solid rgba(77,226,247,.5);border-radius:3px;font:400 13px var(--font-display);letter-spacing:.06em;text-transform:uppercase;color:#bff4fb}
.twist-strip{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;margin:12px 0 0;padding:9px 12px;border:1px solid rgba(77,226,247,.4);border-left:4px solid var(--cyan,#4de2f7);border-radius:var(--radius,6px);background:rgba(13,15,18,.7);color:var(--page-ink,#f4f7fa);font:inherit;text-align:left;cursor:pointer}
.twist-strip .ts-k{display:block;font:400 12.5px var(--font-display);letter-spacing:.12em;text-transform:uppercase;color:var(--cyan,#4de2f7)}
.twist-strip b{display:block;font:400 17px/1.15 var(--font-display);letter-spacing:.04em;text-transform:uppercase}
.twist-strip small{display:block;font-size:12.5px;color:var(--page-muted,#98a3b0)}
.twist-strip .ts-r{flex:none;text-align:right;font:400 13px var(--font-display);letter-spacing:.08em;text-transform:uppercase;color:var(--page-muted,#98a3b0)}
.twist-strip.done .ts-k:after{content:" · cleared";color:#5ee6a8}
.sum-title{margin-top:4px;font:400 22px/1.1 var(--font-display);letter-spacing:.06em;text-transform:uppercase;color:#fff}
.sum-title small{display:block;margin-top:3px;font:400 13.5px var(--font-body);letter-spacing:0;text-transform:none;color:var(--page-muted,#98a3b0)}
.callouts{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px}
.callouts li{padding:8px 11px;border-left:4px solid var(--cyan,#4de2f7);background:rgba(13,15,18,.72);border-radius:3px;font:400 15.5px/1.2 var(--font-display);letter-spacing:.04em;text-transform:uppercase;color:#f4f7fa;animation:co-in .5s cubic-bezier(.2,.9,.25,1.2) backwards;animation-delay:calc(var(--i,0) * .15s + .6s)}
.callouts li[data-k=rank],.callouts li[data-k=set],.callouts li[data-k=holo],.callouts li[data-k=first]{border-left-color:var(--gold,#f5c542);color:#ffe58a}
.callouts li[data-k=shield],.callouts li[data-k=charm]{border-left-color:#8b5cf6}
@keyframes co-in{from{opacity:0;transform:translateX(-14px)}}
.h2h{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:4px}
.h2h li{display:grid;grid-template-columns:18px 1fr auto 14px auto;gap:6px;align-items:center;padding:5px 7px;border-radius:3px;background:rgba(255,255,255,.04);font-size:12.5px}
.h2h-n{font:400 13px var(--font-display);color:var(--page-muted,#98a3b0)}.h2h-p{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--page-muted,#98a3b0)}
.h2h-c{font:400 12px var(--font-display);letter-spacing:.05em;text-transform:uppercase;color:var(--tc);padding:1px 5px;border:1px solid var(--tc);border-radius:3px}
.h2h-vs{text-align:center;font:400 14px var(--font-display);color:var(--page-muted,#98a3b0)}
.h2h-w{background:rgba(77,226,247,.1)}.h2h-l{background:rgba(255,77,94,.1)}
.h2h-score{margin:2px 0 6px;font:400 22px var(--font-display);letter-spacing:.05em;text-transform:uppercase;color:var(--gold,#f5c542)}
.cope-stamp{position:absolute;right:10px;top:10px;padding:2px 10px;border:3px solid #ff9a4d;border-radius:4px;color:#ff9a4d;font:400 22px var(--font-display);letter-spacing:.1em;transform:rotate(-12deg);background:rgba(13,15,18,.55);animation:cope-stamp .45s cubic-bezier(.2,1.6,.4,1) .35s backwards;pointer-events:none}
@keyframes cope-stamp{from{opacity:0;transform:rotate(-12deg) scale(2.6)}}
.feedback.fb-cope{animation:cope-wob .5s ease .2s}
@keyframes cope-wob{20%{transform:translateX(-6px) rotate(-.6deg)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}}
.feedback .fb-react{margin:0 0 6px;font:400 19px/1.2 var(--font-display);letter-spacing:.04em;text-transform:uppercase;color:var(--tc,#4de2f7)}
.feedback .fb-react:empty{display:none}
#summary.has-giga .scan-tag{color:var(--gold,#f5c542)}
.giga-band{margin:8px 0 0;padding:5px 12px;display:inline-block;border:2px solid var(--gold,#f5c542);border-radius:3px;background:linear-gradient(90deg,rgba(245,197,66,.25),rgba(245,197,66,.05));font:400 20px var(--font-display);letter-spacing:.14em;color:#ffe58a;animation:giga-pulse 2.2s ease-in-out infinite}
@keyframes giga-pulse{50%{box-shadow:0 0 18px rgba(245,197,66,.55)}}
@media (prefers-reduced-motion:reduce){.callouts li,.cope-stamp,.feedback.fb-cope,.giga-band{animation:none!important}.pg-bar i{transition:none}}
`;
  function injectCss() {
    if (document.getElementById("progress-css")) return;
    const s = document.createElement("style");
    s.id = "progress-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  injectCss();

  window.Progress = {
    RANKS, CHARMS, rankFor, twistFor, shields, useShield, currentTitle, runTitle, copiumLine, gigaLine,
    encodeRun, decodeRun, h2h, complete, panelHtml, load, charmSvg,
    twistDone: (day) => load().stamps.indexOf(day) >= 0,
    isHolo: (day) => load().holo.indexOf(day) >= 0,
  };
})();
