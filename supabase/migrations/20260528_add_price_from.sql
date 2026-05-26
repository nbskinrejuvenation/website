-- ============================================================
-- Migration: add price_from to treatments
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================
-- Stores the lowest single-session price (AUD, whole dollars).
-- NULL means pricing is not yet set for that treatment.
-- ============================================================

ALTER TABLE treatments
  ADD COLUMN IF NOT EXISTS price_from integer;

-- ── Seed price_from for all 18 published treatments ─────────────────────────

-- Face treatments
UPDATE treatments SET price_from = 140 WHERE slug = 'carbon-peel';
UPDATE treatments SET price_from = 70  WHERE slug = 'fibroblast-plasma';       -- skin tag removal from $70
UPDATE treatments SET price_from = 180 WHERE slug = 'fractional-rf';           -- stretch marks from $180
UPDATE treatments SET price_from = 400 WHERE slug = 'hifu';                    -- neck from $400
UPDATE treatments SET price_from = 120 WHERE slug = 'hydrodermabrasion';
UPDATE treatments SET price_from = 170 WHERE slug = 'laser-rejuvenation';
UPDATE treatments SET price_from = 120 WHERE slug = 'medi-aesthetic-peels';    -- Vitamin A face from $120
UPDATE treatments SET price_from = 60  WHERE slug = 'microdermabrasion';
UPDATE treatments SET price_from = 190 WHERE slug = 'micro-needling';
UPDATE treatments SET price_from = 90  WHERE slug = 'radiofrequency';
UPDATE treatments SET price_from = 150 WHERE slug = 'tattoo-removal-with-saline-solution';
UPDATE treatments SET price_from = 250 WHERE slug = 'zena-algae-peel';

-- Body treatments
UPDATE treatments SET price_from = 140 WHERE slug = 'ems-for-muscle-gain';
UPDATE treatments SET price_from = 140 WHERE slug = 'ems-for-pelvic-floor-strengthening';
UPDATE treatments SET price_from = 90  WHERE slug = 'fat-cavitation';          -- saddle bags / love handles from $90
UPDATE treatments SET price_from = 70  WHERE slug = 'laser-for-nail-fungus';   -- per nail from $70
UPDATE treatments SET price_from = 100 WHERE slug = 'kumashape';
UPDATE treatments SET price_from = 50  WHERE slug = 'tattoo-removal';          -- 4cm² from $50

-- Verify
SELECT slug, title, price_from FROM treatments ORDER BY sort_order;
