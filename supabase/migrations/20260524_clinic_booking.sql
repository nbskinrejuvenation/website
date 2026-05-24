-- Phase 1: Clients + free consultation bookings + weekly availability
-- Run in Supabase Dashboard → SQL Editor (after treatments RLS migration)

-- ─── Clients ────────────────────────────────────────────────────────────────
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  notes text,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists clients_email_lower_idx
  on clients (lower(email));

-- ─── Consultation bookings ───────────────────────────────────────────────────
create type consultation_status as enum ('confirmed', 'cancelled', 'completed', 'no_show');

create table if not exists consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status consultation_status not null default 'confirmed',
  treatment_interest text,
  message text,
  source_page text,
  google_event_id text,
  google_calendar_synced boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consultation_bookings_ends_after_start check (ends_at > starts_at)
);

create index if not exists consultation_bookings_starts_at_idx
  on consultation_bookings (starts_at);

create index if not exists consultation_bookings_client_id_idx
  on consultation_bookings (client_id);

-- Prevent double-booking the same slot (active bookings only)
create unique index if not exists consultation_bookings_slot_unique_idx
  on consultation_bookings (starts_at)
  where (status = 'confirmed');

-- ─── Weekly availability (clinic hours) ───────────────────────────────────────
create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  constraint availability_rules_end_after_start check (end_time > start_time)
);

create unique index if not exists availability_rules_day_unique_idx
  on availability_rules (day_of_week)
  where is_active;

-- Default hours (Australia/Sydney) — adjust in Supabase as needed
-- 0=Sun … 6=Sat
insert into availability_rules (day_of_week, start_time, end_time, is_active)
select 0, '09:00'::time, '17:00'::time, false where not exists (select 1 from availability_rules where day_of_week = 0);
insert into availability_rules (day_of_week, start_time, end_time, is_active)
select 1, '09:00'::time, '17:00'::time, true where not exists (select 1 from availability_rules where day_of_week = 1);
insert into availability_rules (day_of_week, start_time, end_time, is_active)
select 2, '09:00'::time, '17:00'::time, true where not exists (select 1 from availability_rules where day_of_week = 2);
insert into availability_rules (day_of_week, start_time, end_time, is_active)
select 3, '09:00'::time, '17:00'::time, true where not exists (select 1 from availability_rules where day_of_week = 3);
insert into availability_rules (day_of_week, start_time, end_time, is_active)
select 4, '09:00'::time, '17:00'::time, true where not exists (select 1 from availability_rules where day_of_week = 4);
insert into availability_rules (day_of_week, start_time, end_time, is_active)
select 5, '09:00'::time, '17:00'::time, true where not exists (select 1 from availability_rules where day_of_week = 5);
insert into availability_rules (day_of_week, start_time, end_time, is_active)
select 6, '09:00'::time, '13:00'::time, true where not exists (select 1 from availability_rules where day_of_week = 6);

-- RLS: clients/bookings have no public policies — only service_role (API) can write.
-- Do not add deny-all policies; they block inserts if the wrong API key is used.
alter table clients enable row level security;
alter table consultation_bookings enable row level security;
alter table availability_rules enable row level security;

drop policy if exists "public read availability_rules" on availability_rules;
create policy "public read availability_rules"
  on availability_rules for select
  to anon, authenticated
  using (is_active = true);
