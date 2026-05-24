-- Track 24h reminder emails (Vercel Cron + Resend)
alter table consultation_bookings
  add column if not exists reminder_sent_at timestamptz;

create index if not exists consultation_bookings_reminder_pending_idx
  on consultation_bookings (starts_at)
  where (status = 'confirmed' and reminder_sent_at is null);
