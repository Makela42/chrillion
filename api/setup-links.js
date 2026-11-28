// One-off: set "after payment" redirects on the Gift + All Games payment links. Deleted right after use.
const NONCE = "3b4f6841165bd64f0eaee04e3ecce1b0";
const LINKS = {
  "https://buy.stripe.com/14A28t3Hx0Z4bGL7Hlg7e05": "https://www.merrillion.site/?gift_session={CHECKOUT_SESSION_ID}",
  "https://buy.stripe.com/fZuaEZ3HxbDIaCH1iXg7e06": "https://www.merrillion.site/?session_id={CHECKOUT_SESSION_ID}",
};
async function s(path, body) {
  const r = await fetch("https://api.stripe.com/v1/" + path, {
    method: body ? "POST" : "GET",
    headers: { Authorization: "Bearer " + process.env.STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded" },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  return r.json();
}
module.exports = async (req, res) => {
  if ((req.query || {}).n !== NONCE) return res.status(404).end();
  const out = {};
  let list = await s("payment_links?limit=100");
  for (const pl of (list.data || [])) {
    if (!LINKS[pl.url]) continue;
    const u = await s("payment_links/" + pl.id, { "after_completion[type]": "redirect", "after_completion[redirect][url]": LINKS[pl.url] });
    out[pl.url] = { id: pl.id, ok: !u.error, redirect: u.after_completion && u.after_completion.redirect && u.after_completion.redirect.url, err: u.error && u.error.message };
  }
  out.found = Object.keys(out).length;
  res.json(out);
};
