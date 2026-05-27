-- Treatment SMS reminders, review requests, no-show notes, pre-appointment intake

alter table consultation_bookings
  add column if not exists review_request_sent_at timestamptz,
  add column if not exists no_show_notes text;

alter table treatment_bookings
  add column if not exists reminder_sent_at timestamptz,
  add column if not exists sms_reminder_sent_at timestamptz,
  add column if not exists review_request_sent_at timestamptz,
  add column if not exists no_show_notes text;

create table if not exists booking_intake (
  booking_kind text not null check (booking_kind in ('consultation', 'treatment')),
  booking_id uuid not null,
  skin_concerns text,
  medications text,
  allergies text,
  notes text,
  submitted_at timestamptz not null default now(),
  primary key (booking_kind, booking_id)
);

alter table booking_intake enable row level security;
