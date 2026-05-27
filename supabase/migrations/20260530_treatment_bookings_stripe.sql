-- Paid treatment bookings (Stripe Checkout) + bookable treatment fields

-- ─── Treatment booking fields ────────────────────────────────────────────────
alter table treatments
  add column if not exists duration_minutes integer not null default 60,
  add column if not exists price_cents integer,
  add column if not exists bookable_online boolean not null default false;

-- Seed price_cents from price_from (AUD whole dollars → cents)
update treatments
set
  price_cents = price_from * 100,
  bookable_online = true
where price_from is not null
  and price_cents is null;

-- ─── Treatment booking status ─────────────────────────────────────────────────
create type treatment_booking_status as enum (
  'pending_payment',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

create table if not exists treatment_bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  treatment_id uuid not null references treatments (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status treatment_booking_status not null default 'pending_payment',
  amount_cents integer not null,
  currency text not null default 'aud',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  message text,
  source_page text,
  google_event_id text,
  google_calendar_synced boolean not null default false,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint treatment_bookings_ends_after_start check (ends_at > starts_at),
  constraint treatment_bookings_amount_positive check (amount_cents > 0)
);

create index if not exists treatment_bookings_starts_at_idx
  on treatment_bookings (starts_at);

create index if not exists treatment_bookings_client_id_idx
  on treatment_bookings (client_id);

create index if not exists treatment_bookings_treatment_id_idx
  on treatment_bookings (treatment_id);

create index if not exists treatment_bookings_stripe_session_idx
  on treatment_bookings (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

-- Prevent double-booking active slots (confirmed + checkout in progress)
create unique index if not exists treatment_bookings_slot_unique_idx
  on treatment_bookings (starts_at)
  where (status in ('confirmed', 'pending_payment'));

alter table treatment_bookings enable row level security;
