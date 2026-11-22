/*
  Trillion Online: the "Trading Floor" screens.
  Players sit around the floor; the order ticket moves to whoever's turn it is.
*/
(() => {
  "use strict";
  const C = window.Trillion, O = window.TrillionOnline;
  if (!C || !O) return;

  const $ = (s) => document.querySelector(s);
  const esc = C.esc;
  const root = $("#online");
  const Sfx = window.Sfx || { play() {}, duck() {} };
  const Spr = window.Sprites;
  const AVATARS = Spr ? Spr.AVATARS : ["broker", "bull", "bear", "coin", "bar", "bag", "chart", "briefcase", "tophat", "rocket"];
  const av = (name, size) => (Spr && Spr.has(name) ? Spr.svg(name, size || 22) : esc(name || "?"));
  const ico = (name, size) => (Spr ? Spr.svg(name, size || 48) : "");
  const heart = (full, size) => (Spr ? Spr.svg("heart", size || 14, full ? null : { dim: true }) : (full ? "♥" : "♡"));
  const myId = O.randId(12);   // one player per tab

  // Online games need categories with lots of answers, since every turn needs a fresh one.
  const answerCount = (p) => ["t75", "t50", "t25", "t10"].reduce((n, t) => n + (p[t] || []).length, 2);
  // Big categories first; fall back to any list if there aren't enough.
  const XMAS = C.PROMPTS.filter((p) => C.isCore && C.isCore(p) && answerCount(p) >= 45);
  const POOL0 = XMAS.length >= 15 ? XMAS : C.PROMPTS.filter((p) => p.broad || answerCount(p) >= 45);
  const POOL = POOL0.length >= 5 ? POOL0 : C.PROMPTS;

  let client = null, isOpen = false, lastTurn = "", lastLog = 0, lastSec = null, lastPhase = "", popUntil = 0, seen = new Set();

  // ---------- practice bots ----------
  // Each bot has a personality: which tiers it reaches for, how fast it answers, and how often it freezes up.
  const BOTS = [
    { name: "Warren", emoji: "bar", tiers: ["t50", "t25", "t75"], fail: 0.1, speed: [1.5, 4.5] },
    { name: "Ivy", emoji: "broker", tiers: ["miracle", "t75", "t50"], fail: 0.15, speed: [4, 9] },
    { name: "Marge", emoji: "briefcase", tiers: ["t10", "t25"], fail: 0.18, speed: [3, 8] },
    { name: "Jordan", emoji: "bear", tiers: ["trap", "t25", "t10"], fail: 0.22, speed: [2, 7] },
    { name: "Gordon", emoji: "bull", tiers: ["t25", "t50", "t10"], fail: 0.12, speed: [2, 6] },
  ];
  let bots = [], botTimer = null;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function practice() { saveNameField(); return botGame(5, "bots-", "Setting the table for you and 5 bots…", 1); }

  // Bots are always labelled with a robot so nobody mistakes them for real players.
  async function botGame(count, prefix, msg, failScale) {
    connecting(msg);
    const code = prefix + O.randId(6);
    try {
      const host = new O.RoomClient({ code, isPublic: false, transport: "memory", me: profile(), prompts: POOL, judge: C.judge, keyOf: C.key,
        timings: timings(), settings: { seats: 6, lives: 2, minTurn: 6 } });
      await host.connect();
      for (const b of BOTS.slice().sort(() => Math.random() - 0.5).slice(0, count)) {
        await sleep(5);
        const c = new O.RoomClient({ code, isPublic: false, transport: "memory", me: { id: O.randId(12), name: b.name + " 🤖", emoji: b.emoji },
          prompts: POOL, judge: C.judge, keyOf: C.key, timings: timings() });
        c.profile = Object.assign({}, b, { fail: Math.min(0.5, b.fail * failScale) });
        await c.connect();
        bots.push(c);
      }
      botTimer = setInterval(driveBots, 200);
      enterRoom(host);
    } catch (e) { stopBots(); renderEntry("Couldn't set up the practice table."); }
  }

  function driveBots() {
    bots.forEach((b) => {
      const v = b.view();
      if (v.phase !== "turn" || v.curPid !== b.me.id) return;
      const turnKey = b.game.id + ":" + b.game.turnNo;
      if (b._plan === turnKey) return;
      b._plan = turnKey;
      const prof = b.profile;
      if (Math.random() < prof.fail) return;              // freezes up and runs out of time
      const think = Math.min(Math.max(800, v.left - 700), (prof.speed[0] + Math.random() * (prof.speed[1] - prof.speed[0])) * 1000);
      b.typed = "…";
      setTimeout(() => {
        const vv = b.view();
        if (vv.phase !== "turn" || vv.curPid !== b.me.id || b.game.id + ":" + b.game.turnNo !== turnKey) return;
        const p = b.currentPrompt();
        if (!p) return;
        for (const t of prof.tiers.concat(["t25", "t50", "t10", "t75"])) {
          const list = (t === "miracle" || t === "trap" ? (p[t] ? [p[t]] : []) : (p[t] || [])).map((e) => e.split("|")[0]);
          for (const a of list.sort(() => Math.random() - 0.5)) if (b.submit(a).ok) return;
        }
      }, think);
    });
  }

  function stopBots() {
    clearInterval(botTimer);
    botTimer = null;
    bots.forEach((b) => b.leave());
    bots = [];
  }

  // ---------- identity ----------
  function profile() {
    let name = C.store.get("onlineName", "");
    if (!name) { name = "Trader " + (100 + Math.floor(Math.random() * 900)); C.store.set("onlineName", name); }
    let emoji = C.store.get("onlineEmoji", "");
    if (!AVATARS.includes(emoji)) { emoji = AVATARS[Math.floor(Math.random() * AVATARS.length)]; C.store.set("onlineEmoji", emoji); }
    return { id: myId, name, emoji };
  }
  const cleanName = (s) => String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 16);
  const timings = () => (window.CHRILLION_ONLINE && window.CHRILLION_ONLINE.timings) || undefined;
  const pinfo = (v, pid) => v.players.get(pid) || (v.game && v.game.names[pid]) || { name: "Someone", emoji: "" };

  // ---------- entry ----------
  function renderEntry(error) {
    const p = profile();
    const note = O.onlineMode() === "supabase" ? ""
      : "Test mode: until Supabase is connected (see README), rooms only work between tabs in this browser. Open a second tab to try it!";
    root.innerHTML = `
      <div class="screen-head"><button class="icon-btn" data-home aria-label="Back to home">←</button><h2>Trading Floor</h2></div>
      <div class="card ol-card">
        <label class="ol-label" for="ol-name">Your name</label>
        <input id="ol-name" class="ol-input" maxlength="16" autocomplete="nickname">
        <div class="ol-emojis" role="radiogroup" aria-label="Pick an avatar">
          ${AVATARS.map((e) => `<button class="ol-emoji" data-e="${e}" role="radio" aria-checked="${e === p.emoji}" aria-label="${e}">${av(e, 28)}</button>`).join("")}
        </div>
      </div>
      <button class="tile tile-online ol-quick" id="ol-quick">
        <span class="tile-ico" aria-hidden="true">${ico("bolt", 22)}</span>
        <span class="tile-text"><b>Quick Play</b><small>Jump into a public room</small></span>
      </button>
      <button class="btn btn-secondary btn-block" id="ol-create">Create a private room</button>
      <button class="btn btn-ghost btn-block ol-practice" id="ol-practice">Practice with bots</button>
      <form class="ol-join" id="ol-join">
        <input id="ol-code" class="ol-input" maxlength="4" placeholder="ROOM CODE" autocapitalize="characters" autocomplete="off" aria-label="Room code">
        <button class="btn btn-primary" type="submit">Join</button>
      </form>
      <div class="card pp-rules">
        <div class="card-head"><h3>How it works</h3></div>
        <p>Everyone sits around the trading floor and the order ticket goes round. On your turn, type <b>any valid answer nobody has used yet</b> and the order passes on.</p>
        <p>Run out of time and you lose a heart. Turns get faster every lap. Last one with hearts wins!</p>
      </div>
      ${error ? `<p class="ol-error">${esc(error)}</p>` : ""}
      ${note ? `<p class="muted ol-note">${esc(note)}</p>` : ""}`;
    $("#ol-name").value = p.name;
    $("#ol-name").addEventListener("change", (e) => { const n = cleanName(e.target.value); if (n) C.store.set("onlineName", n); e.target.value = n || p.name; });
    root.querySelectorAll(".ol-emoji").forEach((b) => b.addEventListener("click", () => {
      C.store.set("onlineEmoji", b.dataset.e);
      root.querySelectorAll(".ol-emoji").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    }));
    $("#ol-quick").addEventListener("click", quickPlay);
    $("#ol-create").addEventListener("click", () => joinRoom(makeCode(), false));
    $("#ol-practice").addEventListener("click", practice);
    $("#ol-join").addEventListener("submit", (e) => {
      e.preventDefault();
      const code = $("#ol-code").value.toUpperCase().replace(/[^A-Z]/g, "");
      if (code.length !== 4) { C.toast("Room codes are 4 letters."); return; }
      joinRoom(code, false);
    });
  }

  function makeCode() {
    const a = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    return Array.from({ length: 4 }, () => a[Math.floor(Math.random() * a.length)]).join("");
  }
  function saveNameField() { const f = $("#ol-name"); if (f) { const n = cleanName(f.value); if (n) C.store.set("onlineName", n); } }
  function connecting(text) {
    root.innerHTML = `<div class="screen-head"><button class="icon-btn" data-home aria-label="Back to home">←</button><h2>Trading Floor</h2></div>
      <div class="card ol-panel ol-center"><div class="ol-big">${ico("chart")}</div><p>${esc(text)}</p></div>`;
  }

  async function connect(code, isPublic) {
    const c = new O.RoomClient({ code, isPublic, me: profile(), prompts: POOL, judge: C.judge, keyOf: C.key, timings: timings() });
    await c.connect();
    return c;
  }

  async function quickPlay() {
    saveNameField();
    connecting("Finding a room…");
    try {
      for (let n = 1; n <= 30; n++) {
        const c = await connect("pp-" + n, true);
        await new Promise((r) => setTimeout(r, 1200));
        const v = c.view();
        if ((v.phase === "lobby" && c.players.size <= c.settings.seats) || n === 30) { enterRoom(c); waitForPlayers(c); return; }
        c.leave();
      }
    } catch (e) { renderEntry("Couldn't connect to online play. Check your connection and try again."); }
  }

  // Quick Play: if nobody else shows up soon, bots fill the table so there's always a game.
  const QUICK_WAIT = 12000;
  function waitForPlayers(c) {
    if (c.players.size > 1) return;
    C.toast(`Looking for players… bots join in ${QUICK_WAIT / 1000}s if nobody shows up`);
    setTimeout(() => {
      if (client !== c || !isOpen) return;                       // player left or already moved on
      if (c.players.size > 1 || c.view().phase !== "lobby") return;   // a real player joined
      c.leave(); client = null;
      botGame(4, "bots-q", "Nobody else is here yet. Bringing in some bots…", 1.4);
    }, QUICK_WAIT);
  }

  async function joinRoom(code, isPublic) {
    saveNameField();
    connecting(`Joining room ${code}…`);
    try { enterRoom(await connect(code, isPublic)); }
    catch (e) { renderEntry("Couldn't connect to that room. Try again."); }
  }

  // ---------- room ----------
  function enterRoom(c) {
    if (!isOpen) { c.leave(); return; }
    client = c;
    seen = new Set([myId]);
    lastTurn = ""; lastLog = 0; lastSec = null; lastPhase = ""; popUntil = 0;
    const practicing = c.code.startsWith("bots-");
    const quickBots = c.code.startsWith("bots-q");
    const label = quickBots ? "Quick Play" : practicing ? "Practice" : c.isPublic ? `Room ${c.code.replace("pp-", "")}` : c.code;
    root.innerHTML = `
      <div class="ol-top">
        <button class="icon-btn" id="ol-leave" aria-label="Leave room">←</button>
        <div class="ol-room"><span class="eyebrow">${quickBots ? `You vs ${bots.length} bots` : practicing ? "You vs 5 bots" : c.isPublic ? "Public room" : "Private room"}</span><b>${esc(label)}</b></div>
        ${c.isPublic || practicing ? "" : '<button class="btn btn-ghost ol-invite" id="ol-invite">Invite</button>'}
      </div>
      <div class="pp-stage" id="pp-stage">
        <div class="pp-banner" id="pp-banner"></div>
        <div class="pp-seats" id="pp-seats"></div>
        <div class="pp-parcel" id="pp-parcel">${ico("coin", 54)}</div>
        <div class="pp-center" id="pp-center"></div>
      </div>
      <p class="pp-status" id="pp-status"></p>
      <p class="answer-msg" id="pp-msg" aria-live="polite"></p>
      <div class="pp-bar">
        <div class="pp-ring" id="pp-ring"><span class="pp-ring-in" id="pp-ring-in"></span></div>
        <form class="pp-form" id="pp-form" autocomplete="off">
          <input id="pp-input" class="ol-input" maxlength="60" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="Your answer">
          <button class="btn btn-primary" id="pp-send" type="submit">Pass</button>
        </form>
      </div>
      <div class="card" id="pp-lobby"></div>
      <div class="card"><div class="card-head"><h3>Game log</h3><span id="pp-count"></span></div><ol class="pp-log" id="pp-log"></ol></div>`;
    $("#ol-leave").addEventListener("click", () => { leave(); renderEntry(); });
    const inv = $("#ol-invite");
    if (inv) inv.addEventListener("click", invite);
    const input = $("#pp-input");
    let lastKey = 0;
    input.addEventListener("input", () => { if (client) client.typed = input.value; });
    input.addEventListener("keydown", (e) => { if (e.key.length === 1 && performance.now() - lastKey > 35) { Sfx.play("key"); lastKey = performance.now(); } });
    $("#pp-form").addEventListener("submit", onSubmit);
    c.onChange(onChange);
    onChange(c.view(), true);
  }

  function onSubmit(e, confirmed) {
    if (e) e.preventDefault();
    const input = $("#pp-input");
    if (!client || !input.value.trim()) return;
    const res = client.submit(input.value, confirmed);
    if (res.reason === "fuzzy") {
      const msg = $("#pp-msg");
      msg.innerHTML = `Did you mean <b>${esc(res.matched)}</b>? <button type="button" class="dym-btn" id="pp-yes">Yes</button> <button type="button" class="dym-btn dym-no" id="pp-no">No</button>`;
      $("#pp-yes").addEventListener("click", () => onSubmit(null, true));
      $("#pp-no").addEventListener("click", () => shake("Okay! That one isn't on the list. Try another."));
      return;
    }
    if (res.ok) {
      input.value = "";
      client.typed = "";
      $("#pp-msg").textContent = "";
      Sfx.play(res.tier);
      if (window.Fx) {
        document.body.classList.add("fx-front");     // online, the coins fall in front of the circle…
        window.Fx.celebrate(res.tier);
        clearTimeout(onSubmit.t);
        onSubmit.t = setTimeout(() => window.Fx.fadeOut(), 4500);   // …and tidies up so the answer bar stays clear
      }
    } else if (res.reason === "invalid") {
      shake(`“${input.value.trim()}” isn't on the list. Try again!`);
    } else if (res.reason === "used") {
      shake(`${res.matched} was already said! Try another.`);
    }
  }

  function shake(text) {
    $("#pp-msg").textContent = text;
    const f = $("#pp-form");
    f.classList.remove("shake");
    void f.offsetWidth;
    f.classList.add("shake");
    Sfx.play("nope");
    $("#pp-input").select();
  }

  async function invite() {
    const link = /^https?:/.test(location.protocol) ? `${location.origin}${location.pathname}?room=${client.code}` : "";
    const text = link ? `Join me on the Trillion trading floor! Room ${client.code}: ${link}` : `Join my Trillion room! Code ${client.code}`;
    Sfx.play("share");
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); C.toast("Invite copied! Send it to your friends."); }
    } catch (err) { C.toast(`Room code: ${client.code}`); }
  }

  // ---------- rendering ----------
  function seatPos(i, n) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { x: 50 + Math.cos(a) * 40, y: 63 + Math.sin(a) * 26 };
  }

  function onChange(v, structural) {
    if (!client) return;
    for (const id of v.players.keys()) if (!seen.has(id)) { seen.add(id); Sfx.play("join"); }
    const g = v.game;

    // Phase changes.
    if (v.phase !== lastPhase) {
      if (v.phase === "over") Sfx.play("fanfare", v.winner === myId ? 1 : 0.3);
      if (v.phase === "countdown") Sfx.play("start");
      lastPhase = v.phase;
    }
    // New events in the log (sounds for other players' moves).
    if (g && g.log.length !== lastLog) {
      g.log.slice(lastLog).forEach((ev) => {
        if (ev.kind === "pass") { if (ev.pid !== myId) Sfx.play("submit"); popUntil = Math.max(popUntil, v.now + 2600); }
        else if (ev.kind === "fail") Sfx.play("miss");
        else if (ev.kind === "out") Sfx.play("timeout");
      });
      lastLog = g.log.length;
    } else if (!g) lastLog = 0;
    // Turn changes.
    const turnKey = v.phase === "turn" ? `${g.id}:${g.turnNo}` : "";
    if (turnKey !== lastTurn) {
      lastTurn = turnKey;
      lastSec = null;
      if (v.phase === "turn" && v.curPid === myId) {
        Sfx.play("start");
        $("#pp-msg").textContent = "";
        setTimeout(() => { const i = $("#pp-input"); if (i) i.focus(); }, 30);
      }
      structural = true;
    }
    if (popUntil && v.now > popUntil) { popUntil = 0; structural = true; }

    if (structural) {
      renderBanner(v);
      renderSeats(v);
      renderCenter(v);
      renderLobby(v);
      renderLog(v);
      renderInput(v);
    }
    updateTimers(v);
  }

  function renderBanner(v) {
    const el = $("#pp-banner");
    if (!el) return;
    if (v.phase === "lobby") {
      el.innerHTML = `<span class="eyebrow">Trading Floor</span><h2>Answer with something nobody's said</h2><small>Run out of time and you lose a heart</small>`;
    } else if (v.phase === "over") {
      const best = Object.entries(v.game.scores).sort((a, b) => b[1] - a[1])[0];
      const most = best && best[1] > 0 ? ` · most points: ${esc(pinfo(v, best[0]).name)} (${best[1]})` : "";
      el.innerHTML = `<span class="eyebrow">Game over</span><h2>${v.winner ? `${esc(pinfo(v, v.winner).name)} wins!` : "Nobody survived!"}</h2><small>${v.game.log.filter((e) => e.kind === "pass").length} answers passed${most}</small>`;
    } else {
      const used = v.game.used.length;
      el.innerHTML = `<span class="eyebrow">Category ${v.game.promptPos + 1}</span><h2>${esc(v.prompt ? v.prompt.text : "")}</h2>
        <small>▼ any new valid answer passes the order ▼${used ? ` · ${used} used` : ""}</small>`;
    }
  }

  function renderSeats(v) {
    const box = $("#pp-seats");
    if (!box) return;
    const g = v.game;
    const ids = v.seats;
    const n = v.phase === "lobby" ? Math.max(v.settings.seats, ids.length) : ids.length;
    const maxLives = g ? g.settings.lives : v.settings.lives;
    let html = "";
    for (let i = 0; i < n; i++) {
      const pid = ids[i];
      const { x, y } = seatPos(i, n);
      if (!pid) {
        html += `<div class="pp-seat is-empty" style="left:${x}%;top:${y}%"><div class="pp-av"></div><div class="pp-cushion"></div><div class="pp-name">empty</div></div>`;
        continue;
      }
      const p = pinfo(v, pid);
      const lives = g && v.phase !== "lobby" ? g.lives[pid] : maxLives;
      const out = g && v.phase !== "lobby" && lives <= 0;
      const turn = v.phase === "turn" && v.curPid === pid;
      const win = v.phase === "over" && v.winner === pid;
      let pop = "";
      if (g && v.phase !== "lobby") {
        const last = [...g.log].reverse().find((e) => e.pid === pid);
        if (last && last.kind === "pass" && v.now - last.at < 2600) pop = `<div class="pp-pop" data-tier="${esc(last.tier)}">${C.tierSprite(last.tier, 16)}<span>${esc(last.text)}</span></div>`;
        else if (last && last.kind === "fail" && v.now - last.at < 2600) pop = `<div class="pp-pop is-fail">${heart(false, 14)}<span>Too slow!</span></div>`;
      }
      const hearts = Array.from({ length: maxLives }, (_, k) => heart(k < lives, 13)).join("");
      html += `<div class="pp-seat${turn ? " is-turn" : ""}${out ? " is-out" : ""}${pid === myId ? " is-me" : ""}${win ? " is-win" : ""}" style="left:${x}%;top:${y}%">
        ${pop}
        <div class="pp-av">${out ? av("x", 40) : av(p.emoji, 40)}</div>
        <div class="pp-cushion"></div>
        <div class="pp-name">${esc(p.name)}${pid === myId ? " (you)" : ""}</div>
        <div class="pp-hearts">${hearts}</div>
        ${g && v.phase !== "lobby" ? `<div class="pp-score">${g.scores[pid] || 0} pts</div>` : ""}
      </div>`;
    }
    box.innerHTML = html;

    // Move the parcel toward whoever has it.
    const parcel = $("#pp-parcel");
    let target = null;
    if (v.phase === "turn") target = ids.indexOf(v.curPid);
    if (v.phase === "over" && v.winner) target = ids.indexOf(v.winner);
    let px = 50, py = 61;
    if (target != null && target >= 0) { const s = seatPos(target, n); px = 50 + (s.x - 50) * 0.36; py = 63 + (s.y - 63) * 0.3; }
    parcel.style.left = px + "%";
    parcel.style.top = py + "%";
    parcel.classList.toggle("is-hot", v.phase === "turn");
  }

  function renderCenter(v) {
    const el = $("#pp-center");
    if (!el) return;
    let html = "";
    if (v.phase === "lobby") {
      const seated = Math.min(v.players.size, v.settings.seats);
      if (client.isPublic) html = seated < 2 ? `<b>Waiting for players…</b>` : `<b>Starting in <span data-left="auto">10</span></b>`;
      else html = client.isHost() ? `<b>${seated < 2 ? "Invite a friend to start" : "Ready when you are!"}</b>` : `<b>Waiting for the host…</b>`;
    } else if (v.phase === "countdown") {
      html = `<span class="pp-count" data-left="phase">3</span>`;
    } else if (v.phase === "over") {
      html = client.isPublic ? `<b>Next game in <span data-left="phase">9</span></b>`
        : client.isHost() ? `<button class="btn btn-primary" id="pp-again">Play again</button>` : `<b>Waiting for the host…</b>`;
    }
    el.innerHTML = html;
    el.hidden = !html;
    const again = $("#pp-again");
    if (again) again.addEventListener("click", () => client.hostStart());
  }

  function stepper(key, label, value, suffix, enabled) {
    const [lo, hi] = O.LIMITS[key];
    return `<div class="pp-set"><span>${label}</span>
      <span class="pp-step">
        ${enabled ? `<button class="pp-stepbtn" data-k="${key}" data-d="-1" ${value <= lo ? "disabled" : ""} aria-label="Less ${label}">−</button>` : ""}
        <b>${value}${suffix}</b>
        ${enabled ? `<button class="pp-stepbtn" data-k="${key}" data-d="1" ${value >= hi ? "disabled" : ""} aria-label="More ${label}">+</button>` : ""}
      </span></div>`;
  }

  function renderLobby(v) {
    const el = $("#pp-lobby");
    if (!el) return;
    el.hidden = v.phase !== "lobby";
    if (el.hidden) return;
    const s = v.settings;
    const canEdit = client.isHost() && !client.isPublic;
    const seated = Math.min(v.players.size, s.seats);
    const watching = Math.max(0, v.players.size - s.seats);
    el.innerHTML = `
      <div class="card-head"><h3>Room settings</h3><span>${seated}/${s.seats} seated${watching ? ` · ${watching} watching` : ""}</span></div>
      ${stepper("seats", "Seats", s.seats, "", canEdit)}
      ${stepper("lives", "Lives", s.lives, "", canEdit)}
      ${stepper("minTurn", "Min. turn", s.minTurn, "s", canEdit)}
      <p class="muted pp-note">${client.isPublic ? "Public rooms use standard rules and start automatically."
        : canEdit ? `Turns start at ${s.minTurn + O.DEFAULT_TIMINGS.extra}s and get 1s shorter each lap.` : "Only the host can change settings."}</p>
      ${canEdit ? `<button class="btn btn-primary btn-block" id="pp-start" ${seated < 2 ? "disabled" : ""}>Start game</button>` : ""}`;
    el.querySelectorAll(".pp-stepbtn").forEach((b) => b.addEventListener("click", () => {
      client.setSettings({ [b.dataset.k]: client.settings[b.dataset.k] + Number(b.dataset.d) });
    }));
    const st = $("#pp-start");
    if (st) st.addEventListener("click", () => client.hostStart());
  }

  function renderLog(v) {
    const el = $("#pp-log");
    if (!el) return;
    $("#pp-count").textContent = `${v.players.size} here`;
    const g = v.game;
    if (!g || !g.log.length) { el.innerHTML = `<li class="muted">Nothing yet. Answers will show up here.</li>`; return; }
    el.innerHTML = g.log.slice(-8).reverse().map((e) => {
      const p = pinfo(v, e.pid);
      const who = `${av(p.emoji, 18)} <b>${esc(p.name)}</b>`;
      if (e.kind === "pass") return `<li>${who} passed with <b>${esc(e.text)}</b> ${C.tierSprite(e.tier, 16)} <span class="pp-pts">+${e.pts}</span></li>`;
      if (e.kind === "fail") return `<li class="is-bad">${who} ran out of time ${heart(false, 13)} −1</li>`;
      if (e.kind === "out") return `<li class="is-bad">${who} is out!</li>`;
      return `<li class="is-bad">${who} left the room</li>`;
    }).join("");
  }

  function renderInput(v) {
    const input = $("#pp-input"), send = $("#pp-send");
    if (!input) return;
    const g = v.game;
    const myTurn = v.phase === "turn" && v.curPid === myId;
    const amOut = g && v.phase !== "lobby" && g.order.includes(myId) && g.lives[myId] <= 0;
    input.disabled = !myTurn;
    send.disabled = !myTurn;
    if (!myTurn && input.value && v.phase !== "turn") input.value = "";
    input.placeholder = myTurn ? "Your turn! Type an answer…"
      : amOut ? "You're out. Cheer from the side!"
      : v.phase === "turn" ? `${pinfo(v, v.curPid).name} is up…`
      : v.phase === "countdown" ? "Get ready…" : "Waiting for the game to start…";
    $("#pp-status").innerHTML = v.phase === "turn" ? (myTurn ? "▸ <b>Your turn!</b>" : `▸ <b>${esc(pinfo(v, v.curPid).name)}</b> is up`) : "";
    $("#pp-stage").classList.toggle("my-turn", myTurn);
  }

  function updateTimers(v) {
    root.querySelectorAll("[data-left]").forEach((el) => {
      const ms = el.dataset.left === "auto" ? (v.autoStartAt ? v.autoStartAt - v.now : 0) : (v.left || 0);
      el.textContent = Math.max(0, Math.ceil(ms / 1000));
    });
    const ring = $("#pp-ring"), inner = $("#pp-ring-in");
    if (!ring) return;
    const g = v.game;
    const myLives = g && v.phase !== "lobby" && g.order.includes(myId) ? g.lives[myId] : v.settings.lives;
    if (v.phase === "turn") {
      const frac = Math.max(0, v.left / v.total);
      const myTurn = v.curPid === myId;
      ring.style.setProperty("--p", frac.toFixed(3));
      ring.classList.toggle("urgent", myTurn && v.left <= 3000);
      ring.classList.toggle("mine", myTurn);
      const s = Math.ceil(v.left / 1000);
      inner.innerHTML = `<b>${s}</b>`;
      if (myTurn && s !== lastSec) { if (s <= 3 && s >= 1 && lastSec !== null) Sfx.play("tick", s); lastSec = s; }
    } else {
      ring.style.setProperty("--p", "1");
      ring.classList.remove("urgent", "mine");
      inner.innerHTML = `${heart(true, 14)}<b>${myLives}</b>`;
    }
  }

  function leave() {
    if (client) { client.leave(); client = null; }
    stopBots();
    Sfx.duck(false);
    if (window.Fx) window.Fx.clear();
    document.body.classList.remove("fx-front");
  }

  // ---------- API for game.js ----------
  window.TrillionOnlineUI = {
    open() { isOpen = true; if (!client) renderEntry(); },
    leave() { isOpen = false; leave(); root.innerHTML = ""; },
    isOpen: () => isOpen,
    joinRoom(code) { isOpen = true; C.showScreen("online"); isOpen = true; joinRoom(code, false); },
  };

  root.addEventListener("click", (e) => { if (e.target.closest("[data-home]")) C.showScreen("menu"); });

  const room = new URLSearchParams(location.search).get("room");
  if (room && /^[A-Za-z]{4}$/.test(room)) {
    try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ }
    setTimeout(() => window.TrillionOnlineUI.joinRoom(room.toUpperCase()), 200);
  }
})();
