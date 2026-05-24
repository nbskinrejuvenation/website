-- Internal notes for clinic admin (not shown to clients)
alter table consultation_bookings
  add column if not exists internal_notes text;
