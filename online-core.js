/*
  Chrillion Online: networking + "Pass the Parcel" game logic (no DOM here).

  How a game works:
    Players sit in a circle. The parcel goes to one player at a time.
    On your turn, type any valid answer to the category that nobody has used yet, and the parcel passes on.
    Run out of time and you lose a heart (and the category changes). Lose all hearts and you're out.
    Last player with hearts wins. Turns get shorter each lap, down to the room's minimum turn time.

  Transports:
    - supabase: real online play (needs config.js with your Supabase URL + anon key)
    - broadcast: same-browser tabs, for testing without an account
    - memory:    same page, for automated tests
*/
(() => {
  "use strict";

  const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Couldn't load " + src));
      document.head.appendChild(s);
    });
  }

  // ------------------------------------------------------------------
  // Transports: create(code, myId, { onMessage, onPresence }) -> { join(meta), send(msg), leave() }
  // Messages are never echoed back to the sender.
  // ------------------------------------------------------------------
  const memoryHubs = {};
  function createMemory(code, myId, h) {
    const hub = memoryHubs[code] || (memoryHubs[code] = new Set());
    const me = { id: myId, meta: null, h };
    const pushPresence = () => {
      const list = [...hub].map((c) => c.meta);
      hub.forEach((c) => setTimeout(() => c.h.onPresence(list), 0));
    };
    return {
      async join(meta) { me.meta = meta; hub.add(me); pushPresence(); },
      send(msg) { hub.forEach((c) => { if (c !== me) setTimeout(() => c.h.onMessage(msg), 5); }); },
      leave() { hub.delete(me); pushPresence(); },
    };
  }

  function createBroadcast(code, myId, h) {
    const bc = new BroadcastChannel("chrillion:" + code);
    const seen = new Map();
    let meta = null, beat = null;
    const emitPresence = () => {
      const now = Date.now();
      for (const [id, v] of seen) if (now - v.at > 7000) seen.delete(id);
      const list = [...seen.values()].map((v) => v.meta);
      if (meta) list.push(meta);
      h.onPresence(list);
    };
    bc.onmessage = (e) => {
      const d = e.data || {};
      if (d.kind === "hb") { const isNew = !seen.has(d.meta.id); seen.set(d.meta.id, { meta: d.meta, at: Date.now() }); if (isNew) emitPresence(); }
      else if (d.kind === "bye") { seen.delete(d.id); emitPresence(); }
      else if (d.kind === "msg") h.onMessage(d.msg);
    };
    return {
      async join(m) {
        meta = m;
        const hb = () => bc.postMessage({ kind: "hb", meta });
        hb();
        beat = setInterval(() => { hb(); emitPresence(); }, 2000);
        emitPresence();
      },
      send(msg) { bc.postMessage({ kind: "msg", msg }); },
      leave() { clearInterval(beat); bc.postMessage({ kind: "bye", id: myId }); bc.close(); },
    };
  }

  async function createSupabase(code, myId, h) {
    const cfg = window.CHRILLION_ONLINE || {};
    await loadScript(SDK_URL);
    const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { realtime: { params: { eventsPerSecond: 20 } } });
    const ch = client.channel("chrillion:" + code, { config: { broadcast: { self: false }, presence: { key: myId } } });
    ch.on("broadcast", { event: "m" }, ({ payload }) => h.onMessage(payload));
    ch.on("presence", { event: "sync" }, () => {
      const st = ch.presenceState();
      h.onPresence(Object.values(st).map((arr) => arr[0]).filter(Boolean));
    });
    return {
      join(meta) {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("Timed out connecting")), 10000);
          ch.subscribe(async (status) => {
            if (status === "SUBSCRIBED") { clearTimeout(timer); await ch.track(meta); resolve(); }
            else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { clearTimeout(timer); reject(new Error(status)); }
          });
        });
      },
      send(msg) { ch.send({ type: "broadcast", event: "m", payload: msg }); },
      leave() { client.removeChannel(ch); },
    };
  }

  function onlineMode() {
    const cfg = window.CHRILLION_ONLINE || {};
    if (cfg.forceTransport) return cfg.forceTransport;
    return cfg.supabaseUrl && cfg.supabaseAnonKey ? "supabase" : "broadcast";
  }

  async function createTransport(code, myId, handlers, forced) {
    const mode = forced || onlineMode();
    if (mode === "memory") return createMemory(code, myId, handlers);
    if (mode === "supabase") return createSupabase(code, myId, handlers);
    return createBroadcast(code, myId, handlers);
  }

  // ------------------------------------------------------------------
  // Game rules
  // ------------------------------------------------------------------
  const DEFAULT_SETTINGS = { seats: 8, lives: 2, minTurn: 7 };
  const LIMITS = { seats: [2, 12], lives: [1, 5], minTurn: [3, 15] };
  const DEFAULT_TIMINGS = { startIn: 4000, over: 9000, autoStart: 10000, extra: 8, grace: 2500 };

  function clampSettings(s) {
    const o = Object.assign({}, DEFAULT_SETTINGS, s || {});
    Object.keys(LIMITS).forEach((k) => { o[k] = Math.max(LIMITS[k][0], Math.min(LIMITS[k][1], Math.round(Number(o[k]) || DEFAULT_SETTINGS[k]))); });
    return o;
  }

  function randId(n = 10) {
    const a = "abcdefghijkmnpqrstuvwxyz23456789";
    let s = "";
    for (let i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }

  class RoomClient {
    constructor(opts) {
      this.code = opts.code;
      this.isPublic = !!opts.isPublic;
      this.transportMode = opts.transport || null;   // e.g. "memory" for a practice table with bots
      this.me = opts.me;
      this.prompts = opts.prompts;          // the online prompt pool
      this.judge = opts.judge;
      this.keyOf = opts.keyOf || ((s) => String(s).toLowerCase());
      this.t = Object.assign({}, DEFAULT_TIMINGS, opts.timings || {});
      this.now = opts.now || (() => Date.now());
      this.settings = clampSettings(opts.settings);
      this.players = new Map();
      this.hostId = null;
      this.game = null;
      this.autoStartAt = null;
      this.wins = {};
      this.listeners = new Set();
      this.joinedAt = this.now();
      this._failSent = -1;
      this._timer = null;
    }

    onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    _emit(structural) { const v = this.view(); this.listeners.forEach((fn) => fn(v, structural)); }

    async connect() {
      this.transport = await createTransport(this.code, this.me.id, {
        onMessage: (m) => this._onMsg(m),
        onPresence: (list) => this._onPresence(list),
      }, this.transportMode);
      await this.transport.join({ id: this.me.id, name: this.me.name, emoji: this.me.emoji, joinedAt: this.joinedAt });
      this._timer = setInterval(() => this._tick(), 150);
      this._tick();
    }

    leave() {
      clearInterval(this._timer);
      try { this.transport && this.transport.leave(); } catch (e) { /* ignore */ }
      this.listeners.clear();
    }

    isHost() { return this.hostId === this.me.id; }
    _send(msg) { this.transport.send(msg); this._onMsg(msg); }

    sortedPlayers() {
      return [...this.players.values()].sort((a, b) => (a.joinedAt - b.joinedAt) || (a.id < b.id ? -1 : 1));
    }

    _onPresence(list) {
      const prev = new Set(this.players.keys());
      this.players = new Map();
      list.forEach((m) => { if (m && m.id) this.players.set(m.id, m); });
      if (!this.players.has(this.me.id)) this.players.set(this.me.id, { ...this.me, joinedAt: this.joinedAt });
      this.hostId = this.sortedPlayers()[0].id;
      const g = this.game;
      if (this.isHost()) {
        // Catch newcomers up.
        const newcomers = [...this.players.keys()].filter((id) => !prev.has(id) && id !== this.me.id);
        if (newcomers.length) this.transport.send(this._snapshot());
        // Anyone who left mid-game is out.
        if (g && !g.over) g.order.forEach((pid) => { if (g.lives[pid] > 0 && !this.players.has(pid)) this._send({ t: "drop", gid: g.id, pid }); });
      }
      this._emit(true);
    }

    _snapshot() {
      const g = this.game;
      return {
        t: "state",
        settings: this.settings,
        autoIn: this.autoStartAt ? this.autoStartAt - this.now() : null,
        wins: this.wins,
        game: g ? Object.assign({}, g, {
          startIn: g.startAt - this.now(),
          turnElapsed: this.now() - g.turnStart,
          overElapsed: g.over ? this.now() - g.overAt : null,
          startAt: undefined, turnStart: undefined, overAt: undefined,
        }) : null,
      };
    }

    // ---------- applying events (every client runs the same rules) ----------
    _onMsg(m) {
      if (!m || !m.t) return;
      const g = this.game;
      if (m.t === "settings") {
        this.settings = clampSettings(m.settings);
      } else if (m.t === "auto") {
        this.autoStartAt = m.in == null ? null : this.now() + m.in;
      } else if (m.t === "game") {
        const now = this.now();
        const lives = {}, scores = {};
        m.order.forEach((pid) => { lives[pid] = m.settings.lives; scores[pid] = 0; });
        this.settings = clampSettings(m.settings);
        this.game = {
          id: m.id, order: m.order, names: m.names, settings: this.settings, prompts: m.prompts,
          lives, scores, promptPos: 0, turnNo: 0, cur: 0, lap: 0, used: [], log: [],
          startAt: now + m.startIn, turnStart: now + m.startIn, over: false, winner: null, overAt: 0,
        };
        this.autoStartAt = null;
        this._failSent = -1;
      } else if (m.t === "state") {
        this.settings = clampSettings(m.settings);
        if (m.autoIn != null) this.autoStartAt = this.now() + m.autoIn;
        if (m.wins) this.wins = Object.assign({}, m.wins, this.wins);
        if (m.game && (!g || g.id !== m.game.id || m.game.turnNo > g.turnNo)) {
          const now = this.now();
          const ng = Object.assign({}, m.game);
          ng.startAt = now + ng.startIn;
          ng.turnStart = now - ng.turnElapsed;
          ng.overAt = ng.over ? now - (ng.overElapsed || 0) : 0;
          this.game = ng;
        }
      } else if (g && m.gid === g.id && !g.over) {
        if (m.t === "pass" && m.turnNo === g.turnNo && m.pid === g.order[g.cur]) {
          g.used.push(this.keyOf(m.matched || m.input));
          g.scores[m.pid] = (g.scores[m.pid] || 0) + (m.pts || 0);
          g.log.push({ kind: "pass", pid: m.pid, text: m.matched || m.input, tier: m.tier, pts: m.pts || 0, at: this.now() });
          this._advance();
        } else if (m.t === "fail" && m.turnNo === g.turnNo && m.pid === g.order[g.cur]) {
          g.lives[m.pid] = Math.max(0, (g.lives[m.pid] || 0) - 1);
          g.log.push({ kind: "fail", pid: m.pid, text: m.typed || "", at: this.now() });
          if (g.lives[m.pid] === 0) g.log.push({ kind: "out", pid: m.pid, at: this.now() });
          g.promptPos++;               // a fresh category after every lost heart
          g.used = [];
          if (!this._checkOver()) this._advance();
        } else if (m.t === "drop" && g.lives[m.pid] > 0) {
          g.lives[m.pid] = 0;
          g.log.push({ kind: "left", pid: m.pid, at: this.now() });
          if (!this._checkOver() && g.order[g.cur] === m.pid) this._advance();
        }
      }
      this._emit(true);
    }

    _alive() { const g = this.game; return g.order.filter((pid) => g.lives[pid] > 0); }

    _checkOver() {
      const g = this.game;
      const alive = this._alive();
      if (alive.length > 1) return false;
      g.over = true;
      g.winner = alive[0] || null;
      g.overAt = this.now();
      if (g.winner) this.wins[g.winner] = (this.wins[g.winner] || 0) + 1;
      return true;
    }

    _advance() {
      const g = this.game;
      const n = g.order.length;
      let j = g.cur;
      for (let k = 1; k <= n; k++) {
        const idx = (g.cur + k) % n;
        if (g.lives[g.order[idx]] > 0) { j = idx; break; }
      }
      if (j <= g.cur) g.lap++;
      g.cur = j;
      g.turnNo++;
      g.turnStart = this.now();
    }

    turnMs(g) {
      const gg = g || this.game;
      const s = gg.settings;
      return Math.max(s.minTurn, s.minTurn + this.t.extra - gg.lap) * 1000;
    }

    currentPrompt() {
      const g = this.game;
      if (!g) return null;
      const id = g.prompts[g.promptPos % g.prompts.length];
      return this.prompts.find((p) => p.id === id) || null;
    }

    // ---------- the shared view ----------
    view() {
      const now = this.now();
      const g = this.game;
      const base = { now, players: this.players, hostId: this.hostId, me: this.me, code: this.code, isPublic: this.isPublic,
        settings: this.settings, autoStartAt: this.autoStartAt, wins: this.wins, game: g };
      if (!g || (g.over && now - g.overAt > this.t.over)) {
        const seated = this.sortedPlayers().slice(0, this.settings.seats);
        return { ...base, phase: "lobby", seats: seated.map((p) => p.id) };
      }
      const seats = g.order;
      if (g.over) return { ...base, phase: "over", seats, winner: g.winner, left: this.t.over - (now - g.overAt) };
      if (now < g.startAt) return { ...base, phase: "countdown", seats, left: g.startAt - now, prompt: this.currentPrompt() };
      const total = this.turnMs();
      return { ...base, phase: "turn", seats, curPid: g.order[g.cur], left: Math.max(0, total - (now - g.turnStart)), total, prompt: this.currentPrompt(), promptNo: g.promptPos + 1 };
    }

    // ---------- actions ----------
    // Returns { ok: true } or { ok: false, reason: "invalid" | "used" | "notyou", matched }.
    submit(text, confirmed) {
      const v = this.view();
      if (v.phase !== "turn" || v.curPid !== this.me.id || !v.prompt) return { ok: false, reason: "notyou" };
      const r = this.judge(v.prompt, text);
      if (r.tier === "miss") return { ok: false, reason: "invalid" };
      if (r.fuzzy && !confirmed) return { ok: false, reason: "fuzzy", matched: r.display };
      const k = this.keyOf(r.display);
      if (this.game.used.includes(k)) return { ok: false, reason: "used", matched: r.display };
      const pts = { miracle: 100, t75: 85, t50: 60, t25: 30, trap: 15, t10: 10 }[r.tier] || 0;
      this._send({ t: "pass", gid: this.game.id, turnNo: this.game.turnNo, pid: this.me.id, input: String(text).trim().slice(0, 60), matched: r.display, tier: r.tier, pts });
      return { ok: true, tier: r.tier, matched: r.display, pts };
    }

    setSettings(patch) {
      if (!this.isHost() || this.isPublic) return;
      const v = this.view();
      if (v.phase !== "lobby") return;
      this._send({ t: "settings", settings: clampSettings(Object.assign({}, this.settings, patch)) });
    }

    hostStart() {
      if (!this.isHost()) return;
      const seated = this.sortedPlayers().slice(0, this.settings.seats);
      if (seated.length < 2) return;
      const order = seated.map((p) => p.id);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      const names = {};
      seated.forEach((p) => { names[p.id] = { name: p.name, emoji: p.emoji }; });
      const pool = this.prompts.map((p) => p.id);
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      this._send({ t: "game", id: randId(), order, names, settings: this.settings, prompts: pool.slice(0, 40), startIn: this.t.startIn });
    }

    _tick() {
      const v = this.view();
      const g = this.game;
      if (v.phase === "turn") {
        const overdue = this.now() - g.turnStart - v.total;
        // The player whose turn it is reports their own timeout; the host covers anyone unresponsive.
        if (this._failSent !== g.turnNo && ((v.curPid === this.me.id && overdue >= 0) || (this.isHost() && overdue >= this.t.grace))) {
          this._failSent = g.turnNo;
          this._send({ t: "fail", gid: g.id, turnNo: g.turnNo, pid: v.curPid, typed: this.typed || "" });
        }
      }
      if (this.isHost() && this.isPublic && v.phase === "lobby") {
        const seated = Math.min(this.players.size, this.settings.seats);
        if (seated >= 2) {
          if (this.autoStartAt == null) this._send({ t: "auto", in: this.t.autoStart });
          else if (this.now() >= this.autoStartAt) this.hostStart();
        } else if (this.autoStartAt != null) {
          this._send({ t: "auto", in: null });
        }
      }
      this._emit(false);
    }
  }

  window.ChrillionOnline = { RoomClient, createTransport, onlineMode, randId, DEFAULT_SETTINGS, LIMITS, DEFAULT_TIMINGS, clampSettings };
})();
