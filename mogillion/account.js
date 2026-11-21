/* Optional accounts (Supabase magic-link) for cross-device stats sync. */
(function () {
  "use strict";
  var SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
  var cfg = window.MOGILLION_ONLINE || {};
  var available = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  var hooks = { getStats: function () { return {}; }, setStats: function () {}, onChange: function () {} };
  var client = null, currentUser = null, pushTimer = null, status = "", statusBad = false;

  function loadSdk() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = SDK_URL; s.async = true;
      s.onload = function () { res(); };
      s.onerror = function () { rej(new Error("sdk")); };
      document.head.appendChild(s);
    });
  }

  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function mergeStats(local, remote) {
    local = local || {}; remote = remote || {};
    var out = {}, keys = {}, k;
    for (k in local) keys[k] = 1;
    for (k in remote) keys[k] = 1;
    for (k in keys) {
      if (k === "streak" || k === "lastDay") continue;
      var a = local[k], b = remote[k];
      if (isNum(a) && isNum(b)) out[k] = Math.max(a, b);
      else if (a !== undefined && a !== null) out[k] = a;
      else out[k] = b;
    }
    var la = isNum(local.lastDay) ? local.lastDay : -Infinity;
    var lb = isNum(remote.lastDay) ? remote.lastDay : -Infinity;
    var src;
    if (la > lb) src = local;
    else if (lb > la) src = remote;
    else src = (isNum(remote.streak) ? remote.streak : 0) > (isNum(local.streak) ? local.streak : 0) ? remote : local;
    if (src.lastDay !== undefined) out.lastDay = src.lastDay;
    if (src.streak !== undefined) out.streak = src.streak;
    return out;
  }

  async function ensureClient() {
    if (client) return client;
    await loadSdk();
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return client;
  }

  async function upsert(stats) {
    if (!client || !currentUser) return;
    var r = await client.from("profiles_mog").upsert({ id: currentUser.id, stats: stats, updated_at: new Date().toISOString() });
    if (r.error) throw r.error;
  }

  async function syncNow() {
    if (!client || !currentUser) return;
    var r = await client.from("profiles_mog").select("stats").eq("id", currentUser.id).maybeSingle();
    if (r.error) throw r.error;
    var merged = mergeStats(hooks.getStats(), r.data && r.data.stats);
    hooks.setStats(merged);
    await upsert(merged);
  }

  function cleanUrl() {
    try {
      if (/access_token|refresh_token|error_description|type=magiclink|code=/.test(location.hash + location.search)) {
        history.replaceState(null, "", location.pathname);
      }
    } catch (e) {}
  }

  async function handleUser(u, notify) {
    var changed = (u && u.id) !== (currentUser && currentUser.id);
    currentUser = u || null;
    if (u && changed) {
      try { await syncNow(); } catch (e) { setStatus("Could not sync right now.", true); }
    }
    if (changed || notify) { try { hooks.onChange(currentUser); } catch (e) {} }
    render();
  }

  async function init(h) {
    if (h) for (var k in h) if (typeof h[k] === "function") hooks[k] = h[k];
    if (!available) return;
    try {
      await ensureClient();
      client.auth.onAuthStateChange(function (ev, session) {
        if (ev === "SIGNED_IN" || ev === "TOKEN_REFRESHED" || ev === "USER_UPDATED") {
          setTimeout(function () { handleUser(session && session.user, false).then(cleanUrl); }, 0);
        } else if (ev === "SIGNED_OUT") {
          setTimeout(function () { handleUser(null, true); }, 0);
        }
      });
      var r = await client.auth.getSession();
      await handleUser(r.data && r.data.session && r.data.session.user, false);
      cleanUrl();
    } catch (e) { /* offline or blocked: stay signed out */ }
  }

  async function signIn(email) {
    if (!available) return { error: "unavailable" };
    email = String(email || "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email." };
    try {
      await ensureClient();
      var r = await client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + location.pathname } });
      if (r.error) return { error: r.error.message || "Could not send link." };
      return { ok: true };
    } catch (e) { return { error: "Could not reach the server." }; }
  }

  async function signOut() {
    if (!client) return;
    try { await client.auth.signOut(); } catch (e) {}
    await handleUser(null, true);
  }

  function push() {
    if (!available || !client || !currentUser) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      upsert(hooks.getStats()).catch(function () {});
    }, 2000);
  }

  /* ---------- UI ---------- */
  var CSS = "#dlg-account .acc-row{display:flex;justify-content:space-between;gap:12px;margin:0 0 12px}" +
    "#dlg-account .acc-stat{flex:1;text-align:center;padding:10px 6px;border:2px dashed var(--stitch,rgba(43,29,24,.28));border-radius:8px}" +
    "#dlg-account .acc-stat b{display:block;font:400 34px/1 var(--font-display,inherit)}" +
    "#dlg-account input[type=email]{width:100%;box-sizing:border-box;padding:11px 12px;margin:4px 0 6px;font:700 16px var(--font-body,inherit);border:2px solid var(--ink,#2b1d18);border-radius:8px;background:#fffaf0;color:var(--ink,#2b1d18)}" +
    "#dlg-account .acc-status{min-height:20px;font-size:14px;margin:6px 0 0}" +
    "#dlg-account .acc-status.bad{color:var(--red-deep,#8e1f26)}" +
    "#dlg-account .acc-who{word-break:break-all}";

  function el(id) { return document.getElementById(id); }
  function ensureDialog() {
    var d = el("dlg-account");
    if (d) return d;
    if (!el("account-css")) {
      var st = document.createElement("style");
      st.id = "account-css"; st.textContent = CSS;
      document.head.appendChild(st);
    }
    d = document.createElement("dialog");
    d.id = "dlg-account";
    d.innerHTML = '<div class="dlg-bar"><span class="eyebrow">Account</span>' +
      '<button type="button" class="dlg-x" id="acc-x" aria-label="Close">✕</button></div>' +
      '<div id="acc-body"></div>';
    document.body.appendChild(d);
    el("acc-x").addEventListener("click", function () { d.close(); });
    return d;
  }

  function setStatus(msg, bad) {
    status = msg || ""; statusBad = !!bad;
    var s = el("acc-status");
    if (s) { s.textContent = status; s.className = "acc-status muted" + (statusBad ? " bad" : ""); }
  }

  function render() {
    var body = el("acc-body");
    if (!body) return;
    body.textContent = "";
    function add(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text !== undefined) n.textContent = text;
      body.appendChild(n); return n;
    }
    function btn(label, cls, fn) {
      var b = add("button", "btn " + cls + " btn-block", label);
      b.type = "button"; b.addEventListener("click", fn); return b;
    }
    if (!available) {
      add("h2", "", "Accounts");
      add("p", "", "Accounts are coming soon.");
      btn("Close", "btn-primary", function () { el("dlg-account").close(); });
      return;
    }
    if (!currentUser) {
      add("h2", "", "Save your streak");
      add("p", "", "Sign in to keep your streak and progress on every device.");
      var lab = add("label", "", "Your email"); lab.setAttribute("for", "acc-email"); lab.style.fontWeight = "700";
      var inp = add("input"); inp.type = "email"; inp.id = "acc-email"; inp.autocomplete = "email"; inp.placeholder = "you@example.com";
      var send = btn("Email me a sign-in link", "btn-primary", async function () {
        send.disabled = true; setStatus("Sending...");
        var r = await signIn(inp.value);
        send.disabled = false;
        if (r.ok) setStatus("Check your inbox!"); else setStatus(r.error || "Something went wrong.", true);
      });
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") send.click(); });
      var s = add("p", "acc-status muted"); s.id = "acc-status";
      btn("Close", "btn-ghost", function () { el("dlg-account").close(); });
      setStatus(status, statusBad);
    } else {
      add("h2", "", "Your account");
      var p = add("p", "acc-who", "Signed in as "); p.appendChild(document.createElement("b")).textContent = currentUser.email || "your account";
      var st = {}; try { st = hooks.getStats() || {}; } catch (e) {}
      var row = add("div", "acc-row");
      [["Streak", st.streak || 0], ["Best streak", Math.max(st.maxStreak || 0, st.streak || 0)]].forEach(function (x) {
        var c = document.createElement("div"); c.className = "acc-stat";
        c.appendChild(document.createElement("b")).textContent = x[1];
        c.appendChild(document.createTextNode(x[0])); row.appendChild(c);
      });
      var s2 = add("p", "acc-status muted"); s2.id = "acc-status";
      btn("Sync now", "btn-secondary", async function () {
        setStatus("Syncing...");
        try { await syncNow(); try { hooks.onChange(currentUser); } catch (e) {} setStatus("Synced!"); render(); }
        catch (e) { setStatus("Sync failed. Try again.", true); }
      });
      btn("Sign out", "btn-ghost", async function () { await signOut(); setStatus(""); });
      btn("Close", "btn-primary", function () { el("dlg-account").close(); });
      setStatus(status, statusBad);
    }
  }

  function open() {
    var d = ensureDialog();
    status = ""; statusBad = false;
    render();
    if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute("open", ""); } }
  }

  window.Account = {
    available: available, init: init, signIn: signIn, signOut: signOut,
    user: function () { return currentUser; }, push: push, mergeStats: mergeStats, open: open,
  };
})();
