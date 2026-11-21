# Merrillion: the Christmas daily run

7 Christmas prompts, 25 seconds each, one answer per prompt. Rarer answers score more (fixed tiers: 100 / 75 / 50 / 25 / 15 / 10 / 0; anything not on the list is **Invalid**).
- **Daily Sleigh Run**: free, the same for everyone, resets at local midnight.
- **Play Online**: free "Pass the Parcel" rooms (Quick Play or a private room code). Players sit in a circle; on your turn give any valid answer nobody has used, or lose a heart when time runs out. Private rooms let the host set seats, lives and minimum turn time.
- **Supporters** (one-time payment): Unlimited Runs + the full archive.

## Try it locally

Double-click `index.html`. Local-only test helpers (add to the end of the address):
- `?unlock=dev` unlocks supporter features without paying.
- `?reset` resets today's Daily Sleigh Run so you can replay it.
Before the launch date in `game.js` (`epoch`, currently **2026-12-01**) the daily shows as **"Preview"**.
Online play works between two tabs of the same browser until Supabase is connected.

## Files

| File | What it is |
|---|---|
| `index.html`, `styles.css`, `game.js` | The game |
| `sprites.js` | All the pixel art (icons, tiers, avatars, sleigh, knitted hero), so the art style stays in one place |
| `sounds.js` | All sound effects + music, synthesized in the browser (no audio files) |
| `fx.js` | Santa's sleigh reward animation |
| `online-core.js`, `online-ui.js` | Live multiplayer rooms |
| `prompts.js`, `prompts-2.js` … `prompts-19.js` | The 178 prompts (≈25 days without a repeat). Prompts marked `broad: true` (big everyday categories) are also used online |
| `config.js` | Your Supabase URL + public key (fill in after step 4) |
| `supabase-setup.sql` | One-time database setup for the "better than X% of players" curve |
| `api/` | Stripe payment functions (no npm packages) |

## Go live

### 1. Stripe (payments)
1. Create an account at stripe.com.
2. **Product catalog → Add product**: "Merrillion Supporter", **one-time** price. Copy the **Price ID** (`price_…`).
3. **Developers → API keys**: copy the **Secret key** (`sk_test_…` for testing).

### 2. GitHub (holds the code)
New repository → "uploading an existing file" → drag in **everything in this folder** (including `api`) → Commit.

### 3. Vercel (hosting)
Import the GitHub repo (framework preset **Other**) and add these Environment Variables:

| Name | Value |
|---|---|
| `STRIPE_SECRET_KEY` | your `sk_…` key |
| `STRIPE_PRICE_ID` | your `price_…` ID |
| `UNLOCK_SECRET` | any long random string (40+ characters) |
| `SITE_URL` | your site address, e.g. `https://chrillion.vercel.app` |
| `OWNER_CODE` | a private code only you know (8+ characters), giving you free Unlimited runs + archive |

**Your free unlock:** after deploying, open `https://your-site/?owner=YOUR_OWNER_CODE` once on each device you play on. The server checks the code, so it never appears in the page source. Don't share that link.

### 4. Supabase (online play + player comparison), free
1. Create a project at supabase.com.
2. **SQL Editor → New query**: paste all of `supabase-setup.sql` → **Run**.
3. **Project Settings → API**: copy the **Project URL** and the **anon public** (or publishable) key into `config.js`.
4. Upload the changed `config.js` to GitHub; Vercel redeploys automatically.

### 5. Test
Pay with Stripe's test card **4242 4242 4242 4242** (any future date/CVC). Open the site on two devices and try Quick Play. When it all works, switch Stripe to live keys.

## Editing prompts

```js
{
  id: "unique-id",
  text: "Name a …",
  miracle: "Best answer|Alt spelling", miracleNote: "Fun fact shown after.",
  trap: "The 'clever' answer everyone tries", trapNote: "Why it's a trap.",
  t75: [...], t50: [...], t25: [...], t10: [...],
  strip: "gift",   // optional, for word games: "gift card" also counts as "card"
},
```
Matching ignores capitals, punctuation, accents, a leading "the/a/an", a trailing "s", and small typos. Adding prompts reshuffles future Daily Sleigh Runs (players mid-run keep theirs).

## Notes
- The game runs in the browser, so a determined person could bypass the supporter lock or post fake scores. That's normal for a low-price web game.
- Supabase's free tier allows a few thousand multiplayer rounds a month; upgrade if it takes off.
