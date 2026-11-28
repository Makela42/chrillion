/* Gift Pass + All Games Pass UI. Shared by Merrillion (/), Trillion (/trillion/) and Drillion (/drillion/).
   The unlock tokens themselves are handled server-side (api/unlock.js, api/gift.js); game.js only
   reads the shared "allGamesToken" key. Nothing here touches scoring or prompts. */
(function () {
  "use strict";
  var GIFT_LINK = "https://buy.stripe.com/14A28t3Hx0Z4bGL7Hlg7e05";
  var ALL_LINK = "https://buy.stripe.com/fZuaEZ3HxbDIaCH1iXg7e06";
  var path = location.pathname;
  var GAME = /\/trillion(\/|$)/.test(path) ? "trillion" : /\/drillion(\/|$)/.test(path) ? "drillion" : "merrillion";
  var HOME = GAME === "merrillion" ? "/" : "/" + GAME + "/";
  var ROOT = "https://www.merrillion.site/";
  var ONLINE = /^https?:$/.test(location.protocol);
  var IMG = GAME === "merrillion" ? "" : "../";
  var params = new URLSearchParams(location.search);

  function $(s) { return document.querySelector(s); }
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function api(p) {
    return fetch(p).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.error || "HTTP " + r.status); e.status = r.status; throw e; }
        return j;
      });
    });
  }

  var ICON = {
    gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>',
    grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>'
  };

  var css = el("style", {}, [
    ".pass-opts{display:grid;gap:10px;margin:14px 0 4px}",
    ".pass-opts-h{margin:6px 0 0;font:500 12px var(--font-mono,monospace);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}",
    ".pass-opt{appearance:none;cursor:pointer;width:100%;display:grid;grid-template-columns:44px 1fr 18px;gap:12px;align-items:center;text-align:left;padding:10px 12px;border-radius:var(--radius,12px);border:2px solid var(--ink);background:transparent;color:var(--ink);font:inherit}",
    ".pass-opt:hover{background:rgba(43,29,24,.06)}",
    ".pass-opt:focus-visible{outline:3px solid var(--gold);outline-offset:2px}",
    ".pass-opt b{display:block;font:800 16px/1.2 var(--font-display,inherit)}",
    ".pass-opt small{display:block;margin-top:2px;font-size:13px;color:var(--muted)}",
    ".pass-opt .po-ico{position:relative;width:44px;height:44px;border-radius:10px;background:rgba(43,29,24,.07);display:flex;align-items:center;justify-content:center;overflow:hidden}",
    ".pass-opt .po-ico svg,.pass-msg-ico svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
    ".pass-opt .po-ico img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}",
    ".pass-opt .po-go svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    "#dlg-pass-msg h2,#dlg-pass-msg p{text-align:center}",
    ".pass-msg-ico{text-align:center;margin-bottom:6px}.pass-msg-ico svg{width:44px;height:44px}",
    ".gift-url{width:100%;padding:11px 12px;border-radius:8px;border:2px solid var(--ink);background:#fff8ea;color:var(--ink);font:500 14px var(--font-mono,monospace);margin:6px 0 12px}",
    ".pass-btns{display:grid;gap:10px;margin-bottom:10px}.pass-btns .btn{display:flex;align-items:center;justify-content:center;gap:8px}",
    ".pass-btns .btn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}"
  ].join(""));
  document.head.appendChild(css);

  function opt(id, icon, img, title, sub, onclick) {
    var b = el("button", { type: "button", class: "pass-opt", id: id });
    b.innerHTML = '<span class="po-ico">' + icon + '<img src="' + img + '" alt="" onerror="this.style.display=\'none\'"></span>' +
      '<span><b>' + title + '</b><small>' + sub + '</small></span><span class="po-go">' + ICON.arrow + '</span>';
    b.addEventListener("click", onclick);
    return b;
  }
  function go(url) { if (ONLINE) location.href = url; }

  // ---- extra options in the paywall dialog ----
  function addOptions() {
    var dlg = $("#dlg-paywall"), anchor = dlg && dlg.querySelector(".restore");
    if (!dlg || !anchor || $("#pass-opts")) return;
    var box = el("div", { class: "pass-opts", id: "pass-opts" });
    box.appendChild(el("p", { class: "pass-opts-h" }, "More ways to play"));
    if (GAME === "merrillion") {
      box.appendChild(opt("btn-gift", ICON.gift, IMG + "gift-pass.png", "Gift a Season Pass, $3.99", "Send a Merrillion Season Pass to a friend", function () { go(GIFT_LINK); }));
    }
    box.appendChild(opt("btn-all", ICON.grid, IMG + "all-games-pass.png", "All Games Pass, $7.99", "Merrillion + Trillion + Drillion", function () { go(ALL_LINK); }));
    anchor.parentNode.insertBefore(box, anchor);
  }

  // ---- message dialog ----
  function msgDialog(o) {
    var d = $("#dlg-pass-msg");
    if (d) d.remove();
    d = el("dialog", { id: "dlg-pass-msg" });
    d.innerHTML = '<div class="pass-msg-ico">' + (o.icon || ICON.gift) + '</div><h2></h2><p></p>' +
      (o.url ? '<input class="gift-url" id="gift-url" readonly aria-label="Gift link">' : "") +
      '<div class="pass-btns" id="pass-btns"></div><form method="dialog"><button class="btn btn-ghost btn-block">' + (o.close || "Close") + '</button></form>';
    d.querySelector("h2").textContent = o.title;
    d.querySelector("p").textContent = o.body;
    var btns = d.querySelector("#pass-btns");
    if (o.url) {
      d.querySelector("#gift-url").value = o.url;
      var cp = el("button", { type: "button", class: "btn btn-primary" }, ICON.copy + "<span>Copy link</span>");
      cp.addEventListener("click", function () {
        var done = function () { cp.querySelector("span").textContent = "Copied"; };
        var sel = function () { var i = d.querySelector("#gift-url"); i.select(); try { document.execCommand("copy"); } catch (e) { /* ignore */ } done(); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(o.url).then(done, sel);
        else sel();
      });
      btns.appendChild(cp);
      var sh = el("button", { type: "button", class: "btn btn-secondary" }, ICON.share + "<span>Share</span>");
      sh.addEventListener("click", function () {
        if (navigator.share) navigator.share({ title: "Merrillion Season Pass", text: "I got you a Merrillion Season Pass 🎁", url: o.url }).catch(function () { /* cancelled */ });
        else cp.click();
      });
      btns.appendChild(sh);
    }
    document.body.appendChild(d);
    d.showModal();
  }

  function clean() { try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ } }

  // ---- gift: buyer returns from checkout ----
  function giftReturn(sid) {
    clean();
    api("/api/gift?session_id=" + encodeURIComponent(sid)).then(function (r) {
      msgDialog({ title: "Your gift link", body: "Send this link to a friend. They open it to claim a Merrillion Season Pass. It works once.", url: r.url || ROOT + "?gift=" + sid, close: "Done" });
    }).catch(function (e) {
      msgDialog({ title: "We couldn't confirm the gift", body: e.status === 402 ? "That payment hasn't gone through yet. Try again in a moment." : "Something went wrong. If you were charged, email us and we'll send your gift link." });
    });
  }

  // ---- gift: recipient opens the link ----
  function giftRedeem(gid) {
    clean();
    api("/api/gift?redeem=" + encodeURIComponent(gid)).then(function (r) {
      lsSet("chrillion:unlockToken", JSON.stringify(r.token));
      try { sessionStorage.setItem("passMsg", "claimed"); } catch (e) { /* ignore */ }
      location.replace(HOME);
    }).catch(function (e) {
      msgDialog({
        title: e.status === 409 ? "This gift has already been claimed" : "That gift link didn't work",
        body: e.status === 409 ? "Someone has already opened this gift link. If it was you, your pass is saved on that device." : "Check that you copied the whole link, or ask your friend to send it again.",
        close: "Play today's run"
      });
    });
  }

  function init() {
    addOptions();
    if (GAME !== "merrillion") return;
    var gs = params.get("gift_session"), g = params.get("gift");
    var shown = null;
    try { shown = sessionStorage.getItem("passMsg"); sessionStorage.removeItem("passMsg"); } catch (e) { /* ignore */ }
    if (shown === "claimed") msgDialog({ title: "Gift claimed", body: "Your Merrillion Season Pass is unlocked. Enjoy unlimited runs and the full archive.", close: "Start playing" });
    if (gs && /^cs_[A-Za-z0-9_]+$/.test(gs)) giftReturn(gs);
    else if (g && /^cs_[A-Za-z0-9_]+$/.test(g)) giftRedeem(g);
    else if (gs || g) { clean(); msgDialog({ title: "That gift link didn't work", body: "Check that you copied the whole link.", close: "Close" }); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
