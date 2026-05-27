-- Contact form submissions + admin fields

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  treatment_interest text,
  message text,
  source_page text,
  ip_hash text,
  user_agent text,
  is_read boolean not null default false,
  admin_notes text,
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on contact_submissions (created_at desc);

alter table contact_submissions enable row level security;
