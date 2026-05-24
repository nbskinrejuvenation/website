-- Fix: deny-all policies block inserts when SUPABASE_SERVICE_ROLE_KEY is wrong (e.g. anon key).
-- Service role bypasses RLS; with no public policies, anon/authenticated cannot access these tables.

drop policy if exists "service role only clients" on clients;
drop policy if exists "service role only consultation_bookings" on consultation_bookings;
