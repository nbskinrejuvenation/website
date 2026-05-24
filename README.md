# NB Skin Rejuvenation — Website

Next.js site for [nbskinrejuvenation.com.au](https://nbskinrejuvenation.com.au), backed by Supabase.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

## Database

1. Apply RLS policies: `supabase/migrations/20260523_treatments_rls.sql`
2. Seed treatments: `supabase/seed-treatments.sql`
3. **Booking (Phase 1):** `supabase/migrations/20260524_clinic_booking.sql` — see `docs/CLINIC_BOOKING_SETUP.md`
4. **Admin (Phase 2):** `supabase/migrations/20260526_consultation_internal_notes.sql` — see `docs/ADMIN_SETUP.md`
5. Verify: `supabase/verify-seed.sql` and `supabase/verify-booking.sql`

Refresh TypeScript types after schema changes:

```bash
npm run db:types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
