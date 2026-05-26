# Instagram feed on the website

The “Follow us on Instagram” section can show **your latest posts directly from Instagram** using Meta’s official **Instagram Graph API**.

Without API credentials, it falls back to images in `public/images/instagram/` (see `public/images/instagram/README.md`).

---

## Requirements

1. Instagram account converted to **Professional** (Business or Creator)
2. Instagram linked to a **Facebook Page**
3. A **Meta Developer** app with Instagram Graph API access
4. A **long-lived access token** with permission to read the account’s media

Personal Instagram accounts cannot use the Graph API for this.

---

## Setup (summary)

### 1. Meta Developer app

1. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps** → **Create App**
2. Type: **Business** (or Other → Business)
3. Add product: **Instagram Graph API**

### 2. Link Instagram to a Facebook Page

In Instagram app: **Settings → Account → Linked accounts → Facebook** → connect your clinic Page.

### 3. Get your Instagram User ID

In [Graph API Explorer](https://developers.facebook.com/tools/explorer):

1. Select your app
2. Generate a token with `instagram_basic`, `pages_show_list`, `pages_read_engagement` (and `instagram_manage_insights` if needed)
3. Query: `me/accounts?fields=instagram_business_account`
4. Copy the `instagram_business_account.id` value → this is `INSTAGRAM_USER_ID`

### 4. Long-lived access token

Exchange a short-lived token for a long-lived Page or User token (valid ~60 days, refresh before expiry):

[Meta docs: Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)

For production, use a **System User** or token refresh automation.

### 5. Environment variables

Add to `.env.local` and **Vercel**:

```env
INSTAGRAM_ACCESS_TOKEN=your-long-lived-token
INSTAGRAM_USER_ID=17841400000000000
```

Restart `npm run dev`. Posts refresh about every hour (cached).

---

## Notes

- **Image URLs expire** — the site re-fetches from Instagram hourly so links stay valid.
- **Rate limits** apply on Meta’s side; the site caches results.
- **@nb_skin_rejuv** must be the Business/Creator account tied to the token.
- Scraping Instagram HTML or hotlinking without the API violates Meta’s terms and breaks often.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Still see placeholders | Check env vars on Vercel; confirm Professional account + linked Page |
| `OAuthException` / invalid token | Regenerate long-lived token |
| Empty feed | Post at least one public image on Instagram |
| Images fail to load | Redeploy after adding env vars; check Vercel logs for `[instagram-feed]` |
