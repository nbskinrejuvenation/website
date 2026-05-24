# Clinic booking — Phase 1 setup

Replace Fresha for **free consultations** with your own system: client database + Google Calendar.

## What you have today

| Piece | Status |
|-------|--------|
| Marketing website (Next.js + Supabase) | Live |
| Contact form → `contact_submissions` (optional) | API exists |
| **New:** `/book` — pick time + details | After migration + deploy |
| **New:** `clients` + `consultation_bookings` tables | Run SQL below |
| **New:** Google Calendar event on each booking | After OAuth setup |

## Step-by-step

### 1. Run the database migration

In **Supabase → SQL Editor**, run:

`supabase/migrations/20260524_clinic_booking.sql`

Verify:

```sql
select count(*) from availability_rules where is_active;
select * from clients limit 1;
```

### 2. Deploy the site

Push to GitHub / Vercel so `/book` and `/api/booking/*` are live.

### 3. Connect Google Calendar

Follow **`docs/GOOGLE_CALENDAR_SETUP.md`** to set:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID` (usually your Gmail address or `primary`)

Add the same variables in **Vercel → Environment Variables**, then redeploy.

Until Google is configured, bookings still save to Supabase; calendar sync is skipped.

### 4. Point “Book” buttons to `/book`

Default booking path is `/book`. Optional: set `site_settings.booking_url` to `/book` in Supabase.

### 5. Fix “row-level security policy” on `clients`

The booking API must use the **service_role** secret, not the anon key.

1. Supabase → **Project Settings → API** → copy **`service_role`** (secret)
2. Set **`SUPABASE_SERVICE_ROLE_KEY`** in `.env.local` and Vercel — it must **not** match `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run **`supabase/migrations/20260525_fix_booking_rls.sql`** in SQL Editor
4. Restart `npm run dev` or redeploy Vercel

### 6. Test an end-to-end booking

1. Open `/book`
2. Choose a date and 30-minute slot
3. Submit name, email, phone
4. Check **Supabase → Table Editor → `consultation_bookings`** and **`clients`**
5. Check **Google Calendar** for the new event

### 7. Adjust clinic hours

Edit **`availability_rules`** in Supabase (day 0 = Sunday … 6 = Saturday).

---

## Phase 2 — Admin inbox (ready)

See **`docs/ADMIN_SETUP.md`**

- Sign in at `/admin/login`
- Manage consultations at `/admin/consultations`

## Email confirmations (Resend)

See **`docs/EMAIL_SETUP.md`**

- Client confirmation + clinic alert on every new booking
- Optional — booking works without it

## Phase 3 — In progress

- ✅ **Cancel in admin → removes Google Calendar event** (see `docs/ADMIN_SETUP.md`)
- ✅ **Booking confirmation emails** (Resend — `docs/EMAIL_SETUP.md`)
- Paid treatment appointments + Stripe
- ✅ **Reminder emails** (24h before — `docs/EMAIL_SETUP.md` + migration `20260527_consultation_reminder_sent.sql`)
- AI intake summary (optional)
