-- Treatment packages (multi-session bundles) + promo codes

-- ─── Promo codes ─────────────────────────────────────────────────────────────
create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed_cents')),
  discount_value integer not null check (discount_value > 0),
  treatment_id uuid references treatments (id) on delete set null,
  valid_from timestamptz,
  valid_until timestamptz,
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promo_codes_code_unique unique (code)
);

create index if not exists promo_codes_code_idx on promo_codes (upper(code));

-- ─── Treatment packages ──────────────────────────────────────────────────────
create table if not exists treatment_packages (
  id uuid primary key default gen_random_uuid(),
  treatment_id uuid not null references treatments (id) on delete cascade,
  label text not null,
  session_count integer not null check (session_count >= 2),
  price_cents integer not null check (price_cents >= 50),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists treatment_packages_treatment_id_idx
  on treatment_packages (treatment_id)
  where active = true;

-- ─── Client package credits (purchased bundles) ──────────────────────────────
create table if not exists client_package_credits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  treatment_id uuid not null references treatments (id) on delete restrict,
  package_id uuid not null references treatment_packages (id) on delete restrict,
  sessions_total integer not null check (sessions_total >= 2),
  sessions_used integer not null default 0 check (sessions_used >= 0),
  purchase_amount_cents integer not null check (purchase_amount_cents >= 0),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_package_credits_sessions_check check (sessions_used <= sessions_total)
);

create index if not exists client_package_credits_client_id_idx
  on client_package_credits (client_id);

-- ─── Booking payment extras ──────────────────────────────────────────────────
alter table treatment_bookings
  drop constraint if exists treatment_bookings_amount_positive;

alter table treatment_bookings
  add column if not exists original_amount_cents integer,
  add column if not exists discount_cents integer not null default 0,
  add column if not exists promo_code_id uuid references promo_codes (id) on delete set null,
  add column if not exists treatment_package_id uuid references treatment_packages (id) on delete set null,
  add column if not exists client_package_credit_id uuid references client_package_credits (id) on delete set null;

alter table treatment_bookings
  add constraint treatment_bookings_amount_non_negative check (amount_cents >= 0);

-- Seed example packs (Fractional RF Face, Carbon Peel Face) — adjust in admin anytime
insert into treatment_packages (treatment_id, label, session_count, price_cents, sort_order)
select t.id, 'Pack of 3 — Face', 3, 60000, 10
from treatments t
where t.slug = 'fractional-rf'
  and not exists (
    select 1 from treatment_packages p where p.treatment_id = t.id and p.label = 'Pack of 3 — Face'
  );

insert into treatment_packages (treatment_id, label, session_count, price_cents, sort_order)
select t.id, 'Pack of 3 — Face', 3, 33600, 10
from treatments t
where t.slug = 'carbon-peel'
  and not exists (
    select 1 from treatment_packages p where p.treatment_id = t.id and p.label = 'Pack of 3 — Face'
  );

alter table promo_codes enable row level security;
alter table treatment_packages enable row level security;
alter table client_package_credits enable row level security;
