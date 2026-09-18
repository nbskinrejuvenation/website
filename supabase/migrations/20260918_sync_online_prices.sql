-- Re-sync the online-booking prices with the treatment prices.
--
-- 20260917_price_list_sync.sql updated treatments.price_from from the clinic price
-- list but left treatments.price_cents and treatment_packages.price_cents untouched.
-- lib/data/treatments-admin.ts derives price_from from price_cents, so the two are
-- meant to agree; after that migration 7 treatments and both packages disagreed,
-- and every one of them was bookable online at the old, lower price.
--
-- price_cents is the full treatment price. The Stripe charge is
-- STRIPE_DEPOSIT_PERCENT of it (lib/stripe/config.ts), so the cash taken was a
-- deposit against a stale basis rather than a full undercharge.

BEGIN;

-- ── 1. Treatments where the new price_from is the correct online basis ───────
--    price_cents = price_from * 100, restoring the invariant the admin UI keeps.
UPDATE treatments SET price_cents = 17000, updated_at = NOW() WHERE slug = 'carbon-peel';        -- was $140, list $170
UPDATE treatments SET price_cents = 20000, updated_at = NOW() WHERE slug = 'fractional-rf';      -- was $180, list $200
UPDATE treatments SET price_cents = 16000, updated_at = NOW() WHERE slug = 'hydrodermabrasion';  -- was $120, list $160
UPDATE treatments SET price_cents = 12000, updated_at = NOW() WHERE slug = 'kumashape';          -- was $100, list $120
UPDATE treatments SET price_cents = 10000, updated_at = NOW() WHERE slug = 'microdermabrasion';  -- was  $60, list $100
UPDATE treatments SET price_cents = 35000, updated_at = NOW() WHERE slug = 'zena-algae-peel';    -- was $250, list $350

-- ── 2. HIFU: withdrawn from online booking ──────────────────────────────────
--    HIFU now ranges from $200 (eyebrow lift) to $1700 (face, neck and
--    décolletage). A single price_cents cannot represent that: leaving it at
--    $400 contradicts the advertised "from $200", and lowering it to $200 would
--    take a $200 basis for a $1000 face treatment. Withdrawn until the clinic
--    decides whether to price per area.
--    To reverse: UPDATE treatments SET bookable_online = true WHERE slug = 'hifu';
UPDATE treatments SET bookable_online = false, updated_at = NOW() WHERE slug = 'hifu';

-- ── 3. Packages, priced from the same list ──────────────────────────────────
--    Carbon Peel pack of 3 (face): $336 -> $408
UPDATE treatment_packages SET price_cents = 40800, updated_at = NOW()
 WHERE id = 'c6de0357-6259-49d8-b229-f61864c69fbb';
--    RF Needling (fractional-rf) pack of 3 (face): $600 -> $648
UPDATE treatment_packages SET price_cents = 64800, updated_at = NOW()
 WHERE id = '32fe01d5-51ae-4bb4-abcb-2648b460c5da';

COMMIT;

-- Verify: price_from and price_cents should now agree everywhere that is bookable.
SELECT slug, price_from, price_cents / 100 AS price_dollars, bookable_online,
       (price_cents / 100 = price_from) AS in_sync
  FROM treatments
 WHERE price_cents IS NOT NULL
 ORDER BY in_sync, slug;

SELECT p.label, p.session_count, p.price_cents / 100 AS price_dollars, t.slug
  FROM treatment_packages p JOIN treatments t ON t.id = p.treatment_id
 ORDER BY t.slug;
