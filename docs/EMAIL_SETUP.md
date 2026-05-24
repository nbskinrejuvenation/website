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
EMAIL_FROM="Naturally Beautiful <bookings@nbskinrejuvenation.com.au>"
CLINIC_NOTIFICATION_EMAIL=nbskinrejuvenation@gmail.com
```

**Important:** Wrap `EMAIL_FROM` in **double quotes** in `.env.local` because of the spaces in the display name. Without quotes, Node may only read `Naturally` and emails will fail silently.

On **Vercel**, paste the full value in the env var field (no quotes needed in the UI):

`Naturally Beautiful <bookings@nbskinrejuvenation.com.au>`

Or use the simple form (no quotes anywhere):

```env
EMAIL_FROM=bookings@nbskinrejuvenation.com.au
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
| `EMAIL_FROM looks truncated` | Quote the value in `.env.local` (see above) |
| `Domain not verified` | Finish DNS setup in Resend for your sending domain |
| Emails in spam | Complete domain verification; avoid free `@gmail.com` as `EMAIL_FROM` |
| Client email fails, clinic works | Check client address; view error in Resend logs |

---

## 24-hour reminder emails

A Vercel Cron job runs **every hour** and emails clients whose consultation starts in about **24 hours** (23–25h window).

### Database migration

Run in Supabase SQL Editor:

`supabase/migrations/20260527_consultation_reminder_sent.sql`

Adds `reminder_sent_at` so each booking only gets one reminder.

### Cron secret

Add to `.env.local` and Vercel:

```env
CRON_SECRET=<openssl rand -hex 32>
```

Vercel sends `Authorization: Bearer <CRON_SECRET>` when invoking cron routes.

`vercel.json` schedules: `GET /api/cron/consultation-reminders` **once per day** at `21:00 UTC` (~8am Sydney, varies with DST).

**Vercel Hobby** only allows daily cron jobs — hourly schedules block deployment. Upgrade to Pro for hourly reminders, or trigger manually via curl (below).

### Test locally

1. Run the migration in Supabase  
2. Create a **confirmed** booking with `starts_at` ~24 hours from now (or adjust in Supabase for testing)  
3. Trigger the job:

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/consultation-reminders | jq
```

Response example:

```json
{
  "ok": true,
  "configured": true,
  "candidates": 1,
  "sent": 1,
  "failed": 0,
  "skipped": 0
}
```

Reminders are **not** sent for cancelled, completed, or no-show bookings.

---

## Cancellation emails (admin)

When staff mark a consultation **Cancelled** in `/admin/consultations`, the client receives a branded cancellation email with the original date/time and a prominent **Book a new consultation** button linking to `/book`.

Requires `RESEND_API_KEY` and `EMAIL_FROM` (not `CLINIC_NOTIFICATION_EMAIL`). Google Calendar may also notify attendees if an event existed.

**Note:** The email is only sent when status changes *to* cancelled (not if already cancelled). The admin inbox shows whether the email was sent.

---

## Next

- Paid treatment booking + Stripe
