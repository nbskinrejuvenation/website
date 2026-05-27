# Clinic admin portal

Password-protected portal for consultations, paid treatments, clients, and calendar.

## Setup

### 1. Environment variables

Add to `.env.local` and **Vercel** (server-only, never `NEXT_PUBLIC_`):

```env
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_SECRET=your-long-random-string
```

Restart dev server or redeploy after adding.

### 2. Sign in

Open **`/admin/login`** → enter `ADMIN_PASSWORD`.

Default redirect: **`/admin`** (dashboard)

## Portal sections

| URL | Purpose |
|-----|---------|
| `/admin` | Dashboard — today’s stats, next appointment, schedule |
| `/admin/appointments` | All bookings — consultations + paid treatments |
| `/admin/calendar` | Week view of confirmed appointments |
| `/admin/blocks` | Block time off (holidays, lunch, closures) — removes slots from online booking |
| `/admin/clients` | Client directory, notes, booking history |
| `/admin/messages` | Contact form submissions |
| `/admin/treatments` | Online booking price, duration, enable/disable per treatment |
| `/admin/promotions` | Promo codes & multi-session packages |
| `/admin/reports` | Revenue and booking counts (7 / 30 days, this month) |
| `/admin/availability` | Edit clinic opening hours (no SQL) |

Legacy URLs redirect automatically:

- `/admin/consultations` → appointments (consultations only)
- `/admin/treatment-bookings` → appointments (paid treatments only)

## Appointments inbox

- Filter by **type**: All, Consultations, Paid treatments
- Filter by **status**: Upcoming, Awaiting payment, All, Cancelled
- Update status, internal notes, resend cancellation emails (consultations)
- **Reschedule** confirmed appointments (new time, client email, calendar update)
- Cancelling removes Google Calendar events and emails the client (when configured)
- Paid treatments: treatment-specific cancellation email; optional **Stripe refund** on cancel

## Clients

- Search by name, email, or phone
- Per-client **notes** (stored on `clients.notes`)
- Full booking history (consultations + paid treatments)

## Security notes

- `/admin` is **not indexed** (robots noindex)
- Use a strong `ADMIN_PASSWORD`; do not share the URL publicly
- Future: Supabase Auth with individual staff accounts + 2FA

## Related docs

- [CLINIC_BOOKING_SETUP.md](./CLINIC_BOOKING_SETUP.md) — booking + availability
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) — paid treatments
- [EMAIL_SETUP.md](./EMAIL_SETUP.md) — Resend confirmations
