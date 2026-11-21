// POST /api/checkout  ->  { url }  (a Stripe Checkout page for the Unlimited unlock)
const { stripe, siteUrl } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    if (!process.env.STRIPE_PRICE_ID) throw new Error("STRIPE_PRICE_ID is not set");
    const base = siteUrl(req);
    const session = await stripe("checkout/sessions", {
      method: "POST",
      form: {
        mode: "payment",
        "line_items[0][price]": process.env.STRIPE_PRICE_ID,
        "line_items[0][quantity]": "1",
        success_url: base + "/?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: base + "/",
      },
    });
    res.status(200).json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Checkout unavailable" });
  }
};
