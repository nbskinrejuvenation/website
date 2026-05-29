# Google Maps (contact page)

The **Contact** page shows an embedded map when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set.

Coordinates come from **Supabase → `site_settings`** (`lat`, `lng`). Defaults are seeded for Dee Why; update there if the clinic moves.

---

## 1. Google Cloud project

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project (can be the same project as Google Calendar OAuth)
3. **Billing** must be enabled (Maps Embed has a free monthly quota)

---

## 2. Enable Maps Embed API

1. **APIs & Services → Library**
2. Search **Maps Embed API**
3. Click **Enable**

> Use **Maps Embed API** only (not JavaScript Maps API) for the iframe on `/contact`.

---

## 3. Create an API key

1. **APIs & Services → Credentials → Create credentials → API key**
2. Copy the key (starts with `AIza...`)

---

## 4. Restrict the key (recommended)

Edit the key → **Application restrictions**:

- **HTTP referrers (websites)**
  - `http://localhost:3000/*`
  - `https://website-iota-vert-23.vercel.app/*`
  - `https://nbskinrejuvenation.com.au/*`
  - `https://*.vercel.app/*` (optional, for preview deploys)

**API restrictions**:

- Restrict key → **Maps Embed API** only

This keeps the public key safer even though it appears in the browser.

---

## 5. Environment variables

Add to `.env.local` and **Vercel → Environment Variables**:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

Restart `npm run dev` after changing locally. Redeploy on Vercel.

---

## 6. Verify

1. Open `/contact`
2. You should see the embedded map for the clinic
3. If the key is missing, visitors still get an **Open in Google Maps** button

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Grey map / “This page can't load Google Maps” | Enable **Maps Embed API**; check billing |
| `RefererNotAllowedMapError` | Add your site URL to HTTP referrer restrictions |
| Map shows wrong location | Update `lat` / `lng` in Supabase `site_settings` |
| Map missing on production only | Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` on Vercel Production |

---

## Security note

If an API key was ever committed in git without restrictions, **rotate it** in Google Cloud (create a new key, update env, delete the old key).
