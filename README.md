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
3. Verify: `supabase/verify-seed.sql`

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
