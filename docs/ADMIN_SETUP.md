# Clinic admin (Phase 2)

Password-protected inbox for free consultation bookings and client records.

## Setup

### 1. Run migration

In Supabase SQL Editor:

`supabase/migrations/20260526_consultation_internal_notes.sql`

### 2. Environment variables

Add to `.env.local` and **Vercel** (server-only, never `NEXT_PUBLIC_`):

```env
# Password you type at /admin/login
ADMIN_PASSWORD=choose-a-strong-password

# Random secret for session cookie (e.g. openssl rand -hex 32)
ADMIN_SECRET=your-long-random-string
```

Restart dev server or redeploy after adding.

### 3. Sign in

Open **`/admin/login`** → enter `ADMIN_PASSWORD`.

Default redirect: **`/admin/consultations`**

## What you can do

- View **upcoming** consultations (confirmed, future dates)
- See client **name, email, phone**, treatment interest, message
- Update **status**: Confirmed, Completed, Cancelled, No show
- Add **internal notes** (not shown on the public site)
- Tabs: All, Completed, Cancelled

## Security notes

- `/admin` is **not indexed** (robots noindex)
- Use a strong `ADMIN_PASSWORD`; do not share the URL publicly
- Phase 3 can add Supabase Auth or 2FA if needed

## Next phases

- Cancel event in Google Calendar when status → Cancelled
- Paid treatment booking
- Email reminders to clients
