-- Secure tokens for client self-service cancel / reschedule links

alter table consultation_bookings
  add column if not exists management_token text;

alter table treatment_bookings
  add column if not exists management_token text;

update consultation_bookings
set management_token = encode(gen_random_bytes(24), 'hex')
where management_token is null;

update treatment_bookings
set management_token = encode(gen_random_bytes(24), 'hex')
where management_token is null;

alter table consultation_bookings
  alter column management_token set default encode(gen_random_bytes(24), 'hex'),
  alter column management_token set not null;

alter table treatment_bookings
  alter column management_token set default encode(gen_random_bytes(24), 'hex'),
  alter column management_token set not null;

create unique index if not exists consultation_bookings_management_token_idx
  on consultation_bookings (management_token);

create unique index if not exists treatment_bookings_management_token_idx
  on treatment_bookings (management_token);
