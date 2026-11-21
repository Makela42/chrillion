// Shared helpers for the payment functions. Files starting with "_" are not routes on Vercel.
const crypto = require("crypto");

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
