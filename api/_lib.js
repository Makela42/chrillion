// Shared helpers for the payment functions. Files starting with "_" are not routes on Vercel.
const crypto = require("crypto");

// Values pasted into the Vercel dashboard or piped from a shell can carry an invisible byte-order mark
// or stray whitespace, which breaks the Stripe Authorization header. Clean them once, before any use.
for (const k of ["STRIPE_SECRET_KEY", "STRIPE_PRICE_ID", "UNLOCK_SECRET", "SITE_URL", "TRI_PAYMENT_LINK_ID", "DRI_PAYMENT_LINK_ID", "MOG_PAYMENT_LINK_ID", "OWNER_CODE"]) {
  if (typeof process.env[k] === "string") process.env[k] = process.env[k].replace(/^﻿+/, "").trim();
}

// Unlock tokens are "<stripe session id>.<HMAC signature>", so only this server can mint them.
function sign(sessionId) {
  const secret = process.env.UNLOCK_SECRET;
  if (!secret) throw new Error("UNLOCK_SECRET is not set");
  const sig = crypto.createHmac("sha256", secret).update("unlimited:" + sessionId).digest("base64url");
  return `${sessionId}.${sig}`;
}

function verify(token) {
  if (typeof token !== "string" || token.length > 500) return false;
  const i = token.lastIndexOf(".");
  if (i < 1) return false;
  let expected;
  try { expected = sign(token.slice(0, i)); } catch (e) { return false; }
  const a = Buffer.from(expected), b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Minimal Stripe REST client (no npm package needed).
async function stripe(path, { method = "GET", form } = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  const res = await fetch("https://api.stripe.com/v1/" + path, {
    method,
    headers: Object.assign(
      { Authorization: "Bearer " + key },
      form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}
    ),
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data.error && data.error.message) || "Stripe error");
  return data;
}

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = { sign, verify, stripe, siteUrl };

// Each game has its own pass. Mogillion purchases come from the Payment Link whose id is MOG_PAYMENT_LINK_ID,
// and Mogillion tokens are signed with a "mog:" prefix so a Merrillion pass can't unlock Mogillion (or the reverse).
function gameOf(req) {
  const g = (req.query && req.query.game) || (req.body && req.body.game);
  return g === "mogillion" || g === "trillion" || g === "drillion" ? g : "merrillion";
}
function scopeId(game, id) { return game === "mogillion" ? "mog:" + id : game === "trillion" ? "tri:" + id : game === "drillion" ? "dri:" + id : String(id); }
function tokenGame(token) { const t = String(token); return t.startsWith("mog:") ? "mogillion" : t.startsWith("tri:") ? "trillion" : t.startsWith("dri:") ? "drillion" : "merrillion"; }
function sessionGame(s) {
  const mog = process.env.MOG_PAYMENT_LINK_ID, tri = process.env.TRI_PAYMENT_LINK_ID, dri = process.env.DRI_PAYMENT_LINK_ID;
  if (mog && s && s.payment_link === mog) return "mogillion";
  if (tri && s && s.payment_link === tri) return "trillion";
  if (dri && s && s.payment_link === dri) return "drillion";
  return "merrillion";
}
module.exports.gameOf = gameOf;
module.exports.scopeId = scopeId;
module.exports.tokenGame = tokenGame;
module.exports.sessionGame = sessionGame;
