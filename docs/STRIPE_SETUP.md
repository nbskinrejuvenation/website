# Stripe — paid treatment booking

Online booking charges clients via **Stripe Checkout** before confirming the appointment.

## 1. Stripe account

1. Create or sign in at [stripe.com](https://stripe.com) (Australia).
2. Complete business verification to accept live payments.
3. Use **Test mode** while developing.

## 2. API keys

Dashboard → **Developers → API keys**

| Variable | Where |
|----------|--------|
| `STRIPE_SECRET_KEY` | Secret key (`sk_test_…` or `sk_live_…`) — server only |
| `STRIPE_WEBHOOK_SECRET` | From webhook endpoint (step 3) |

Add to `.env.local` and Vercel project settings.

Optional:

| Variable | Default | Purpose |
|----------|---------|---------|
| `STRIPE_DEPOSIT_PERCENT` | `100` | Percent of `price_cents` to charge (100 = full payment) |

## 3. Webhook

Dashboard → **Developers → Webhooks → Add endpoint**

| Environment | URL |
|-------------|-----|
| Production | `https://nbskinrejuvenation.com.au/api/webhooks/stripe` |
| Local (Stripe CLI) | `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |

Events to subscribe:

- `checkout.session.completed`
- `checkout.session.expired`

Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.

### Local testing

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use test card `4242 4242 4242 4242`, any future expiry, any CVC.

## 4. Database migration

Run in Supabase SQL Editor:

`supabase/migrations/20260530_treatment_bookings_stripe.sql`

This adds `treatment_bookings`, `duration_minutes`, `price_cents`, and `bookable_online` on treatments.

## 5. Treatment pricing

- `price_from` — display price on the website (AUD, whole dollars).
- `price_cents` — amount charged online (`price_from × 100`, set by migration).
- `bookable_online` — shows **Book & pay** on the treatment page.
- `duration_minutes` — slot length (default 60).

To disable online booking for a treatment:

```sql
update treatments set bookable_online = false where slug = 'hifu';
```

To change online price or duration:

```sql
update treatments
set price_cents = 15000, duration_minutes = 90
where slug = 'micro-needling';
```

## 6. Flow

1. Client picks a time on `/book/treatment/[slug]`.
2. Booking is created as `pending_payment` (slot held ~30 minutes).
3. Stripe Checkout collects payment.
4. Webhook marks booking `confirmed`, sends email, creates Google Calendar event.
5. Admin manages bookings at `/admin/treatment-bookings`.

## 7. Related docs

- [CLINIC_BOOKING_SETUP.md](./CLINIC_BOOKING_SETUP.md) — availability & consultations
- [EMAIL_SETUP.md](./EMAIL_SETUP.md) — confirmation emails
- [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md) — calendar sync
