// GET /api/gift?session_id=cs_...  -> { ok, url }   (buyer, after paying for the gift link)
// GET /api/gift?redeem=cs_...      -> { token }     (recipient; single use, tracked on the payment intent metadata)
const { stripe, sign, scopeId, sessionKind } = require("./_lib");

const ID = /^cs_[A-Za-z0-9_]+$/;

module.exports = async (req, res) => {
  const { session_id, redeem } = req.query || {};
  try {
    if (session_id) {
      if (!ID.test(session_id)) return res.status(400).json({ error: "Missing session_id" });
      const s = await stripe("checkout/sessions/" + encodeURIComponent(session_id));
      if (s.payment_status !== "paid") return res.status(402).json({ error: "Not paid" });
      if (await sessionKind(s) !== "gift") return res.status(403).json({ error: "That purchase is not a gift" });
      return res.status(200).json({ ok: true, url: "https://www.merrillion.site/?gift=" + s.id });
    }
    if (redeem) {
      if (!ID.test(redeem)) return res.status(400).json({ error: "That gift link isn't valid" });
      const s = await stripe("checkout/sessions/" + encodeURIComponent(redeem));
      if (s.payment_status !== "paid" || await sessionKind(s) !== "gift") return res.status(404).json({ error: "That gift link isn't valid" });
      const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent && s.payment_intent.id;
      if (!pi) return res.status(404).json({ error: "That gift link isn't valid" });
      const intent = await stripe("payment_intents/" + encodeURIComponent(pi));
      if (intent.metadata && intent.metadata.gift_redeemed) return res.status(409).json({ error: "This gift has already been claimed" });
      await stripe("payment_intents/" + encodeURIComponent(pi), { method: "POST", form: { "metadata[gift_redeemed]": new Date().toISOString() } });
      return res.status(200).json({ token: sign(scopeId("merrillion", "gift_" + s.id)) });
    }
    res.status(400).json({ error: "Missing session_id" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gift failed" });
  }
};
