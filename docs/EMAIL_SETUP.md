# Email — Resend booking confirmations

When a client books at `/book`, the site sends:

1. **Client** — confirmation with date, time, and clinic address  
2. **Clinic** — new booking alert with client details + link to `/admin/consultations`

Booking still succeeds if email is not configured (same pattern as Google Calendar).

---

## 1. Create a Resend account

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain (e.g. `nbskinrejuvenation.com.au`)
   - Add the DNS records Resend provides (SPF, DKIM)
3. Create an API key → **API Keys** → Create

---

## 2. Environment variables

Add to `.env.local` and **Vercel → Project → Settings → Environment Variables**:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Naturally Beautiful <bookings@nbskinrejuvenation.com.au>
CLINIC_NOTIFICATION_EMAIL=nbskinrejuvenation@gmail.com
```

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API key (server-only) |
| `EMAIL_FROM` | Verified sender (`Name <email@yourdomain>`) |
| `CLINIC_NOTIFICATION_EMAIL` | Where new booking alerts are sent |

`EMAIL_FROM` must use an address on your **verified domain** in Resend.

Restart `npm run dev` after changing `.env.local`.

---

## 3. Test

1. Book a test consultation at http://localhost:3000/book  
2. Check the client inbox and `CLINIC_NOTIFICATION_EMAIL`  
3. In Resend dashboard → **Emails**, confirm both messages were delivered

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No emails sent | All three env vars must be set; check server logs for `[email]` |
| `Domain not verified` | Finish DNS setup in Resend for your sending domain |
| Emails in spam | Complete domain verification; avoid free `@gmail.com` as `EMAIL_FROM` |
| Client email fails, clinic works | Check client address; view error in Resend logs |

---

## Next

- Reminder email 24h before appointment (Vercel Cron + Resend)
- Cancellation email when admin marks booking cancelled (in addition to Google Calendar)
