// POST /api/restore  { email }  ->  { token }   (re-unlock on a new device or browser)
const { stripe, sign, gameOf, scopeId, sessionGame, sessionKind } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const email = String((req.body && req.body.email) || "").trim();
  if (!email || email.length > 200 || !email.includes("@")) {
    return res.status(400).json({ error: "Enter the email you used at checkout" });
  }
  try {
    const list = await stripe("checkout/sessions?" + new URLSearchParams({
      "customer_details[email]": email,
      status: "complete",
      limit: "10",
    }));
    const game = gameOf(req);
    const sessions = (list.data || []).filter((s) => s.payment_status === "paid");
    for (const s of sessions) {
      if (await sessionKind(s) === "all") return res.status(200).json({ token: sign(scopeId("all", s.id)) });
    }
    const paid = (await Promise.all(sessions.map(async (s) => (await sessionKind(s)) === "gift" ? null : s))).find((s) => s && sessionGame(s) === game);
    if (!paid) return res.status(404).json({ error: "No purchase found" });
    res.status(200).json({ token: sign(scopeId(game, paid.id)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Restore failed" });
  }
};
