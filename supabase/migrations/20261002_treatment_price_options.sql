-- Bookable price rows for treatment pages.
--
-- Each row on a treatment page's price list ("Full face $250", "Pack of 3:
-- Full face $600") becomes a "Book" button. Until now those rows were display
-- text read from a spreadsheet in another GitHub repository, so they could not
-- safely drive a Stripe charge. This table holds them in the clinic's own
-- database; the treatment page and the checkout both read from it, and the
-- client only ever sends a row id, never an amount.
--
-- The Stripe charge is the treatment's deposit percent of the row's price
-- (lib/stripe/config.ts); the balance is paid at the clinic.
--
-- After applying this, load the rows with:
--   node scripts/generate-price-options-sql.mjs prices.csv > price-options.sql
-- and run the generated SQL in the SQL Editor (see that script's header).

BEGIN;

CREATE TABLE IF NOT EXISTS treatment_price_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id uuid NOT NULL REFERENCES treatments (id) ON DELETE CASCADE,
  -- Heading the row is listed under: "Single sessions", "Pack of 3", ...
  group_name text NOT NULL,
  label text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 100),
  -- Sessions the price covers; 1 for a single session.
  session_count integer NOT NULL DEFAULT 1 CHECK (session_count BETWEEN 1 AND 20),
  subtitle text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT treatment_price_options_unique UNIQUE (treatment_id, group_name, label)
);

CREATE INDEX IF NOT EXISTS treatment_price_options_treatment_id_idx
  ON treatment_price_options (treatment_id, sort_order)
  WHERE active = true;

ALTER TABLE treatment_price_options ENABLE ROW LEVEL SECURITY;

-- Treatment pages read through the anon key (lib/supabase/public.ts).
DROP POLICY IF EXISTS "public read active treatment_price_options" ON treatment_price_options;
CREATE POLICY "public read active treatment_price_options"
  ON treatment_price_options FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Which price row a booking was made from. The label is copied so the booking
-- still reads correctly if the row is later edited or removed.
ALTER TABLE treatment_bookings
  ADD COLUMN IF NOT EXISTS price_option_id uuid REFERENCES treatment_price_options (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS price_option_label text;

COMMIT;
