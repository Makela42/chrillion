/* Trillion shareholder vote widget. window.Vote.mount(el, {game, pollId, question, options, closes}) */
(function () {
  "use strict";

  var CSS = [
    ".vt-card{position:relative;box-sizing:border-box;max-width:440px;width:100%;margin:12px auto;padding:16px 16px 12px;background:#fbf4e0;color:#14301f;border:2px solid #1d4a32;box-shadow:inset 0 0 0 4px #fbf4e0,inset 0 0 0 5px #b8923a,0 2px 8px rgba(0,0,0,.18);font-family:Georgia,'Times New Roman',serif;text-align:left}",
    ".vt-card *{box-sizing:border-box}",
    ".vt-eyebrow{margin:0 0 6px;font:700 11px/1.2 Georgia,serif;letter-spacing:.22em;text-transform:uppercase;color:#a3201f}",
    ".vt-q{margin:0 0 12px;font:700 18px/1.25 Georgia,serif;color:#14301f}",
    ".vt-opts{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}",
    ".vt-opt{display:flex;align-items:flex-start;gap:10px;width:100%;padding:10px;background:#fffaf0;border:1.5px solid #1d4a32;color:inherit;font:inherit;text-align:left;cursor:pointer;min-height:44px}",
    ".vt-opt:hover{background:#f3e8c6}.vt-opt:focus-visible{outline:3px solid #b8923a;outline-offset:2px}",
    ".vt-box{flex:none;width:18px;height:18px;margin-top:2px;border:2px solid #1d4a32;background:#fff}",
    ".vt-lbl{display:block;font-weight:700;font-size:15px}",
    ".vt-desc{display:block;font-size:13px;line-height:1.3;color:#4b5b4f;margin-top:2px}",
    ".vt-res{padding:8px 10px;background:#fffaf0;border:1.5px solid #1d4a32}",
    ".vt-row{display:flex;justify-content:space-between;gap:8px;font-size:14px;font-weight:700;margin-bottom:5px}",
    ".vt-mine{display:inline-block;margin-left:6px;padding:1px 6px;font:700 10px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;background:#b8923a;color:#fff;vertical-align:middle}",
    ".vt-pct{font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".vt-pct small{font-weight:400;color:#4b5b4f}",
    ".vt-track{height:10px;background:#e8dcb5;border:1px solid #1d4a32;overflow:hidden}",
    ".vt-fill{height:100%;width:0;background:#1d4a32;transition:width .9s cubic-bezier(.2,.8,.2,1)}",
    ".vt-res.is-mine .vt-fill{background:#b8923a}",
    ".vt-list{display:flex;flex-direction:column;gap:8px}",
    ".vt-total,.vt-note{margin:10px 0 0;font-size:13px;color:#14301f;text-align:center}",
    ".vt-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px;padding-top:8px;border-top:1px solid #b8923a;font-size:12px;color:#4b5b4f;font-style:italic}",
    ".vt-skip{background:none;border:0;padding:6px 2px;font:inherit;color:#1d4a32;text-decoration:underline;cursor:pointer;font-style:normal}",
    ".vt-skip:focus-visible{outline:3px solid #b8923a}",
    "@media (prefers-reduced-motion:reduce){.vt-fill{transition:none}}"
  ].join("\n");

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  function voterId() {
    var v = lsGet("trillion:voter");
    if (!v) {
      v = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
      try {
        if (window.crypto && crypto.randomUUID) v = crypto.randomUUID();
      } catch (e) {}
      lsSet("trillion:voter", v);
    }
    return v;
  }

  function cfg() {
    var c = window.CHRILLION_ONLINE || {};
    return c.supabaseUrl && c.supabaseAnonKey ? c : null;
  }

  function headers(c, extra) {
    var h = { apikey: c.supabaseAnonKey, Authorization: "Bearer " + c.supabaseAnonKey, "Content-Type": "application/json" };
    for (var k in extra) h[k] = extra[k];
    return h;
  }

  function insertVote(o, optionId) {
    var c = cfg();
    if (!c) return Promise.reject(new Error("no-config"));
    return fetch(c.supabaseUrl.replace(/\/$/, "") + "/rest/v1/poll_votes", {
      method: "POST",
      headers: headers(c, { Prefer: "return=minimal" }),
      body: JSON.stringify({ game: o.game, poll_id: o.pollId, option_id: optionId, voter: voterId() })
    }).then(function (r) {
      if (r.ok || r.status === 409) return true;
      throw new Error("http " + r.status);
    });
  }

  function fetchResults(o) {
    var c = cfg();
    if (!c) return Promise.reject(new Error("no-config"));
    return fetch(c.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/poll_results", {
      method: "POST",
      headers: headers(c, {}),
      body: JSON.stringify({ p_game: o.game, p_poll: o.pollId })
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    });
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function closedNow(closes) {
    if (!closes) return false;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(closes);
    if (!m) return false;
    // closes at the end of that day (local)
    return Date.now() >= new Date(+m[1], +m[2] - 1, +m[3] + 1).getTime();
  }

  function closesText(closes) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(closes || "");
    if (!m) return "";
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return "Voting closes on " + (+m[3]) + " " + months[+m[2] - 1] + ".";
  }

  function mount(host, o) {
    try {
      if (!host || !o || !o.options) return;
      if (!document.getElementById("vote-css")) {
        var st = document.createElement("style");
        st.id = "vote-css";
        st.textContent = CSS;
        document.head.appendChild(st);
      }
      var skipKey = "trillion:vote-skip:" + o.pollId;
      var voteKey = "trillion:vote:" + o.pollId;
      if (ssGet(skipKey)) { host.textContent = ""; return; }

      var card = el("section", "vt-card");
      card.setAttribute("aria-label", "Shareholder vote");
      host.textContent = "";
      host.appendChild(card);

      var body = el("div");
      var foot = el("div", "vt-foot");
      var closed = closedNow(o.closes);
      foot.appendChild(el("span", "", closed ? "Voting has closed." : closesText(o.closes)));
      var skip = el("button", "vt-skip", "Not now");
      skip.type = "button";
      skip.onclick = function () { ssSet(skipKey, "1"); host.textContent = ""; };
      foot.appendChild(skip);

      card.appendChild(el("p", "vt-eyebrow", "Shareholder Vote"));
      card.appendChild(el("h3", "vt-q", o.question));
      card.appendChild(body);
      card.appendChild(foot);

      function showResults(mine, counts, failed) {
        body.textContent = "";
        if (!counts) {
          body.appendChild(el("p", "vt-note", failed ? "Thanks! Results will appear shortly." : "Loading results..."));
          // still show the user's pick
          var l0 = el("div", "vt-list");
          o.options.forEach(function (op) {
            if (op.id === mine) l0.appendChild(el("div", "vt-res is-mine", op.label + " - Your vote"));
          });
          if (l0.children.length) body.appendChild(l0);
          return;
        }
        var map = {}, total = 0;
        counts.forEach(function (r) { map[r.option_id] = +r.votes || 0; total += +r.votes || 0; });
        var list = el("div", "vt-list");
        var fills = [];
        o.options.forEach(function (op) {
          var n = map[op.id] || 0, pct = total ? Math.round(n * 100 / total) : 0;
          var row = el("div", "vt-res" + (op.id === mine ? " is-mine" : ""));
          var top = el("div", "vt-row");
          var name = el("span", "", op.label);
          if (op.id === mine) name.appendChild(el("span", "vt-mine", "Your vote"));
          var p = el("span", "vt-pct", pct + "% ");
          p.appendChild(el("small", "", "(" + n + ")"));
          top.appendChild(name); top.appendChild(p);
          var tr = el("div", "vt-track");
          var f = el("div", "vt-fill");
          tr.appendChild(f);
          row.appendChild(top); row.appendChild(tr);
          list.appendChild(row);
          fills.push([f, pct]);
        });
        body.appendChild(list);
        body.appendChild(el("p", "vt-total", total + (total === 1 ? " share voted" : " shares voted")));
        setTimeout(function () { fills.forEach(function (x) { x[0].style.width = x[1] + "%"; }); }, 30);
      }

      function loadResults(mine) {
        fetchResults(o).then(function (c) { showResults(mine, c, false); })
          .catch(function () { showResults(mine, null, true); });
      }

      var mine = lsGet(voteKey);
      if (mine || closed) {
        if (closed && !mine) card.querySelector(".vt-eyebrow").textContent = "Shareholder Vote - Closed";
        showResults(mine, null, false);
        loadResults(mine);
        return;
      }

      var ul = el("div", "vt-opts");
      var busy = false;
      o.options.forEach(function (op) {
        var b = el("button", "vt-opt");
        b.type = "button";
        b.setAttribute("role", "checkbox");
        b.setAttribute("aria-checked", "false");
        b.appendChild(el("span", "vt-box"));
        var t = el("span");
        t.appendChild(el("span", "vt-lbl", op.label));
        if (op.desc) t.appendChild(el("span", "vt-desc", op.desc));
        b.appendChild(t);
        b.onclick = function () {
          if (busy) return;
          busy = true;
          b.setAttribute("aria-checked", "true");
          b.querySelector(".vt-box").style.background = "#1d4a32";
          lsSet(voteKey, op.id);
          insertVote(o, op.id).then(function () { loadResults(op.id); })
            .catch(function () { showResults(op.id, null, true); });
        };
        ul.appendChild(b);
      });
      body.appendChild(ul);
    } catch (e) { /* never crash */ }
  }

  window.Vote = { mount: mount };
})();
