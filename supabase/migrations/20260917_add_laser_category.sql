-- Add the 'laser' value to the treatment_category enum.
-- Run this on its own, BEFORE 20260918_price_list_sync.sql: Postgres will not allow a
-- newly added enum value to be used in the same transaction that adds it.

ALTER TYPE treatment_category ADD VALUE IF NOT EXISTS 'laser';

-- Verify
SELECT unnest(enum_range(NULL::treatment_category)) AS category;
