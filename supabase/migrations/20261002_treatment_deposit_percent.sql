-- Per-treatment deposit percentage for online booking.
--
-- Until now every Stripe charge was STRIPE_DEPOSIT_PERCENT of price_cents, one
-- percentage for the whole clinic. deposit_percent lets each treatment take its
-- own share upfront (as Fresha did); the balance is paid at the clinic.
--
-- NULL means "use the clinic default" (STRIPE_DEPOSIT_PERCENT, see
-- lib/stripe/config.ts), so applying this migration changes no charge until a
-- percentage is set in Admin → Treatments.

ALTER TABLE treatments
  ADD COLUMN IF NOT EXISTS deposit_percent smallint
    CHECK (deposit_percent BETWEEN 1 AND 100);

COMMENT ON COLUMN treatments.deposit_percent IS
  'Percent of price_cents charged online (1-100). NULL = STRIPE_DEPOSIT_PERCENT.';
