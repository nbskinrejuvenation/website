-- Google Calendar sync for schedule blocks
alter table schedule_blocks
  add column if not exists google_event_id text;

-- SMS reminder tracking (consultations)
alter table consultation_bookings
  add column if not exists sms_reminder_sent_at timestamptz;

-- Abandoned Stripe checkout follow-up
alter table treatment_bookings
  add column if not exists abandoned_checkout_email_sent_at timestamptz;
