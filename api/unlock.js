// GET /api/unlock?session_id=cs_...  ->  { token }   (after a paid checkout)
// GET /api/unlock?token=...          ->  { valid }   (re-check a saved token)
// GET /api/unlock?owner=CODE         ->  { token }   (the site owner's free unlock; CODE is the OWNER_CODE env var)
const crypto = require("crypto");
const { stripe, sign, verify } = require("./_lib");

function sameSecret(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  const { session_id, token, owner } = req.query || {};
  try {
    if (token) return res.status(200).json({ valid: verify(String(token)) });

    if (owner) {
      const code = process.env.OWNER_CODE;
      if (!code || code.length < 8 || !sameSecret(owner, code)) return res.status(403).json({ error: "Wrong code" });
      return res.status(200).json({ token: sign("owner") });
    }

    if (!session_id || !/^cs_[A-Za-z0-9_]+$/.test(session_id)) {
      return res.status(400).json({ error: "Missing session_id" });
    }
    const s = await stripe("checkout/sessions/" + encodeURIComponent(session_id));
    if (s.payment_status !== "paid") return res.status(402).json({ error: "Not paid" });
    res.status(200).json({ token: sign(s.id) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unlock failed" });
  }
};
