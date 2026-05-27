# Site URL (`NEXT_PUBLIC_SITE_URL`)

One variable controls every **absolute link** the app generates:

- Booking confirmation & reminder emails (manage / reschedule links)
- Stripe Checkout success & cancel URLs
- Admin links in clinic notification emails
- Sitemap, Open Graph, canonical URLs

Implementation: `lib/site/url.ts` → `getSiteUrl()` / `SITE_URL`.

## Values by environment

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:3000` |
| Vercel preview (current dev) | `https://website-iota-vert-23.vercel.app` |
| Production | `https://nbskinrejuvenation.com.au` |

## Setup

### Local (`.env.local`)

```env
NEXT_PUBLIC_SITE_URL=https://website-iota-vert-23.vercel.app
```

Or `http://localhost:3000` if you only test on your machine.

Restart `npm run dev` after changing.

### Vercel

**Project → Settings → Environment Variables**

| Variable | Preview | Production |
|----------|---------|------------|
| `NEXT_PUBLIC_SITE_URL` | `https://website-iota-vert-23.vercel.app` | `https://nbskinrejuvenation.com.au` |

Redeploy after updating Production.

### Going live

1. Set Production `NEXT_PUBLIC_SITE_URL` to `https://nbskinrejuvenation.com.au`
2. Update Stripe webhook URL to `https://nbskinrejuvenation.com.au/api/webhooks/stripe`
3. Update Resend/email domain if needed
4. Redeploy
