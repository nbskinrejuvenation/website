# Session packages & promo codes

## Overview

| Feature | Client flow | Admin |
|---------|-------------|--------|
| **Session packages** | On `/book/treatment/[slug]`, choose a pack → pay → session 1 booked; remaining sessions redeemed with same email | **Promos & packs** → Session packages |
| **Promo codes** | Enter code on booking step 2 (single sessions only) | **Promos & packs** → Promo codes |

## Database migration

Run on Supabase:

`supabase/migrations/20260605_packages_and_promo_codes.sql`

Seeds example packs for **Fractional RF** and **Carbon Peel** (adjust in admin).

## Session packages

1. Client selects **Pack of 3** (or other pack) when booking.
2. Pays full package price via Stripe (deposit % applies if `STRIPE_DEPOSIT_PERCENT` &lt; 100).
3. On payment success, a **client package credit** row is created with `sessions_used = 1` (first visit).
4. For visit 2+, client books same treatment, enters email → **Use prepaid package** → no Stripe charge.

## Promo codes

- **Percent** (1–100) or **fixed AUD** off the single-session price.
- Optional: limit to one treatment, max redemptions, expiry (`valid_until`).
- Codes are stored uppercase (e.g. `INSTA20`).
- Not combinable with packages or prepaid redemption.

## Admin

**`/admin/promotions`**

- Create / activate / deactivate promo codes.
- Create / activate / deactivate treatment packages (treatment, label, session count, total price).

## API (public)

- `POST /api/booking/treatment/validate-promo` — `{ slug, code }`
- `GET /api/booking/treatment/credits?slug=&email=` — available prepaid sessions
- Checkout body accepts `package_id`, `promo_code`, `client_package_credit_id`
