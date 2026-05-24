-- Verify clinic booking tables after migration
select 'clients' as tbl, count(*) from clients
union all
select 'consultation_bookings', count(*) from consultation_bookings
union all
select 'availability_rules (active)', count(*) from availability_rules where is_active;
