-- Manual schedule blocks (time off, closures) — excluded from online booking slots

create table if not exists schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  title text,
  created_at timestamptz not null default now(),
  constraint schedule_blocks_ends_after_start check (ends_at > starts_at)
);

create index if not exists schedule_blocks_starts_at_idx
  on schedule_blocks (starts_at);

create index if not exists schedule_blocks_range_idx
  on schedule_blocks (starts_at, ends_at);

alter table schedule_blocks enable row level security;
