-- Sync treatment pricing and add the Laser category.
-- Source: "NB PRICE LIST UPDATED.xlsx" (NEW TREATMETNS OFFERED IN THE CLINIC sheet), 2026-09-17.
--
-- PREREQUISITE: run 20260917_add_laser_category.sql FIRST, in its own execution.
-- Postgres will not let a newly added enum value be used in the same transaction
-- that adds it, so the two files cannot be combined.
--
-- Covers:
--   * 16 treatments repriced from the spreadsheet (38 corrected rows, 5 added rows)
--   * Tretinoin peel add-on restored on Micro Needling as "Add on peel" (not redlined in sheet)
--   * LED Light $40 add-on appended to every facial treatment (sheet row 229)
--   * Tattoo Removal with Saline Solution unpublished (redlined: no longer performed)
--   * Fractional RF renamed to RF Needling (sheet note in cell B25); slug left unchanged
--   * Laser Rejuvenation + Laser for Nail Fungus moved to the new 'laser' category
--   * 7 new laser treatments inserted

BEGIN;

-- ── 1. Redlined service: no longer performed ────────────────────────────────
UPDATE treatments SET status = 'draft', updated_at = NOW()
 WHERE slug = 'tattoo-removal-with-saline-solution';

-- ── 2. Rename Fractional RF -> RF Needling (slug kept to preserve the URL) ──
UPDATE treatments SET
   title = 'RF Needling',
   seo_title = 'RF Needling | Naturally Beautiful Skin Rejuvenation',
   updated_at = NOW()
 WHERE slug = 'fractional-rf';

-- ── 3. Repriced treatments ──────────────────────────────────────────────────
UPDATE treatments SET
   body_html = '<p class="lead">Gently exfoliates, clears and purifies your skin.</p>

<h2>Recommended for</h2>
<ul>
<li>Uneven skin tone</li>
<li>Oily skin</li>
<li>Sun damage</li>
<li>Pigmentation</li>
<li>Enlarged pores</li>
<li>Acne and blemishes</li>
<li>Rosacea</li>
<li>Wrinkles</li>
<li>Blackheads</li>
</ul>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $170 One session</td></tr>
<tr><td>Face & Neck $250 One session</td></tr>
<tr><td>Face, Neck & Décolletage $300 One session</td></tr>
<tr><td>Back $500 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $408 $136 per session, Save $102</td></tr>
<tr><td>Face & Neck $600 $200 per session, Save $150</td></tr>
<tr><td>Face, Neck & Décolletage $720 $240 per session, Save $180</td></tr>
<tr><td>Back $1200 $400 per session, Save $300</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many Carbon Peel sessions are recommended?</strong></li>
<li><strong>How long does the treatment take?</strong></li>
<li><strong>What is the recovery time?</strong></li>
<li><strong>How long to these results last?</strong></li>
<li><strong>Is Carbon Peel painful?</strong></li>
<li><strong>Is this treatment suitable for everyone?</strong></li>
</ul>',
   price_from = 170,
   updated_at = NOW()
 WHERE slug = 'carbon-peel';

UPDATE treatments SET
   body_html = '<p class="lead">Take your body to the next level.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>One area $140 One session</td></tr>
<tr><td>Two areas $210 One session</td></tr>
<tr><td>Three areas $280 One session</td></tr>
<tr><td>Four areas $350 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>One area $672 $112 per session, Save $168</td></tr>
<tr><td>Two areas $1008 $168 per session, Save $252</td></tr>
<tr><td>Three areas $1344 $224 per session, Save $336</td></tr>
<tr><td>Four areas $1680 $280 per session, Save $420</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions will I need?</strong></li>
<li><strong>How long until I can see the results?</strong></li>
<li><strong>How long does the session take?</strong></li>
<li><strong>How long will the results last?</strong></li>
<li><strong>Is there any downtime?</strong></li>
<li><strong>Is this treatment suitable for everyone?</strong></li>
</ul>',
   price_from = 140,
   updated_at = NOW()
 WHERE slug = 'ems-for-muscle-gain';

UPDATE treatments SET
   body_html = '<p class="lead">Regain control of the things that matter.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Pelvic floor $140 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Pelvic floor $672 $112 per session, Save $168</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions do I need?</strong></li>
<li><strong>How long until I can see the results?</strong></li>
<li><strong>How long does the session take?</strong></li>
<li><strong>How long will the results last?</strong></li>
<li><strong>Is there any downtime?</strong></li>
<li><strong>Is this treatment suitable for everyone?</strong></li>
</ul>',
   price_from = 140,
   updated_at = NOW()
 WHERE slug = 'ems-for-pelvic-floor-strengthening';

UPDATE treatments SET
   body_html = '<p class="lead">Instant non-surgical skin lifting</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Skin tag and warts removal From $70 Please note we require a medical clearance for this treatment</td></tr>
<tr><td>Wrinkles From $100 One session</td></tr>
<tr><td>Under eye $300 One session</td></tr>
<tr><td>Belly button lift $300 One session</td></tr>
<tr><td>Crows feet (sides of the eyes) $300 One session</td></tr>
<tr><td>Blepharoplasty (droopy eyelids) $300 One session</td></tr>
<tr><td>Lip flip $300 One session</td></tr>
<tr><td>Eyebrow lift $300 One session</td></tr>
<tr><td>Marionette lines (sides of the mouth aka Nasolabial folds) $300 One session</td></tr>
<tr><td>Smoker lines (around the mouth) $300 One session</td></tr>
<tr><td>Forehead $400 One session</td></tr>
<tr><td>Neck $500 One session</td></tr>
<tr><td>Tummy tightening $1000 One session</td></tr>
<tr><td>Pigmentation removal From $70 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions of Fibroblast Plasma are recommended?</strong></li>
<li><strong>How long does the session take?</strong></li>
<li><strong>Is there any downtime?</strong></li>
<li><strong>How long does it take until I can see the results?</strong></li>
<li><strong>How long will the results last?</strong></li>
<li><strong>Is Fibroblast Plasma suitable for everyone?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
</ul>',
   price_from = 70,
   updated_at = NOW()
 WHERE slug = 'fibroblast-plasma';

UPDATE treatments SET
   body_html = '<p class="lead">Reclaim a firmer, plumper, younger skin.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $270 One session</td></tr>
<tr><td>Face & Neck $300 One session</td></tr>
<tr><td>Face, Neck & Décolletage $350 One session</td></tr>
<tr><td>Stretch marks From $200 One session</td></tr>
<tr><td>Abdomen $350 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $648 $216 per session, Save $162</td></tr>
<tr><td>Face & Neck $720 $240 per session, Save $180</td></tr>
<tr><td>Face, Neck & Décolletage $840 $280 per session, Save $210</td></tr>
<tr><td>Stretch marks From $480 From $160 per session, Save from $120</td></tr>
<tr><td>Abdomen $840 $280 per session, Save $210</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many treatments are recommended?</strong></li>
<li><strong>How long does the treatment take?</strong></li>
<li><strong>What is the recovery time?</strong></li>
<li><strong>How long does it take until I can see the results?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
<li><strong>How long will the results last?</strong></li>
</ul>',
   price_from = 200,
   updated_at = NOW()
 WHERE slug = 'fractional-rf';

UPDATE treatments SET
   body_html = '<p class="lead">Just like cosmetic surgery, only not.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $1000 One session</td></tr>
<tr><td>Neck only $500 One session</td></tr>
<tr><td>Face & Neck $1300 One session</td></tr>
<tr><td>Face, Neck & Décolletage $1700 One session</td></tr>
<tr><td>Stomach $1000 One session</td></tr>
<tr><td>Double chin $300 One session</td></tr>
<tr><td>Eyebrow lift $200 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $2400 $800 per session, Save $600</td></tr>
<tr><td>Neck only $1200 $400 per session, Save $300</td></tr>
<tr><td>Face & Neck $3120 $1040 per session, Save $780</td></tr>
<tr><td>Face, Neck & Décolletage $4080 $1360 per session, Save $1020</td></tr>
<tr><td>Stomach $2400 $800 per session, Save $600</td></tr>
<tr><td>Double chin $720 $240 per session, Save $180</td></tr>
<tr><td>Eyebrow lift $480 $160 per session, Save $120</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many HIFU sessions are recommended?</strong></li>
<li><strong>How long does the session take?</strong></li>
<li><strong>Is HIFU a natural treatment?</strong></li>
<li><strong>Is this treatment suitable for everyone?</strong></li>
<li><strong>How long does it take until I can see the results?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
<li><strong>Can I treat my whole body with this treatment?</strong></li>
<li><strong>Can I combine other treatments with this?</strong></li>
</ul>',
   price_from = 200,
   updated_at = NOW()
 WHERE slug = 'hifu';

UPDATE treatments SET
   body_html = '<p class="lead">Hydrated, happy and healthy skin.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $160 One session</td></tr>
<tr><td>Face & Neck $190 One session</td></tr>
<tr><td>Face, Neck & Décolletage $220 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $384 $128 per session, Save $96</td></tr>
<tr><td>Face & Neck $456 $152 per session, Save $114</td></tr>
<tr><td>Face, Neck & Décolletage $528 $176 per session, Save $132</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many treatments are recommended?</strong></li>
<li><strong>How long does the treatment take?</strong></li>
<li><strong>How long is the recovery?</strong></li>
<li><strong>How long does it take until I can see the results?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
<li><strong>Is this treatment right for me?</strong></li>
</ul>',
   price_from = 160,
   updated_at = NOW()
 WHERE slug = 'hydrodermabrasion';

UPDATE treatments SET
   body_html = '<p class="lead">Sculpt the body of your dreams!</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Saddle Bags $120 One session</td></tr>
<tr><td>Love handles (aka muffin tops) $120 One session</td></tr>
<tr><td>Butt $120 One session</td></tr>
<tr><td>Stomach $150 One session</td></tr>
<tr><td>Legs front (thighs only) $170 One session</td></tr>
<tr><td>Legs back (thighs only) $170 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Saddle Bags $576 $96 per session, Save $144</td></tr>
<tr><td>Love handles (aka muffin tops) $576 $96 per session, Save $144</td></tr>
<tr><td>Butt $576 $96 per session, Save $144</td></tr>
<tr><td>Stomach $720 $120 per session, Save $180</td></tr>
<tr><td>Legs front (thighs only) $816 $136 per session, Save $204</td></tr>
<tr><td>Legs back (thighs only) $816 $136 per session, Save $204</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions are recommended?</strong></li>
<li><strong>How long does the treatment take?</strong></li>
<li><strong>How long will the results last?</strong></li>
<li><strong>How long does it take until I can see the results?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
<li><strong>What is the recovery time for Kumashape?</strong></li>
</ul>',
   price_from = 120,
   updated_at = NOW()
 WHERE slug = 'kumashape';

UPDATE treatments SET
   body_html = '<p class="lead">Put your best foot forward.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Per nail $70 One session</td></tr>
</tbody>
</table>

<h3>Pack of 4</h3>
<table>
<tbody>
<tr><td>Per nail $224 $56 per session, Save $56</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions will I need?</strong></li>
<li><strong>How long does the session take?</strong></li>
<li><strong>How long will the results last?</strong></li>
<li><strong>Is there any downtime?</strong></li>
<li><strong>Is it suitable for everyone?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
</ul>',
   price_from = 70,
   updated_at = NOW()
 WHERE slug = 'laser-for-nail-fungus';

UPDATE treatments SET
   body_html = '<p class="lead">Unleash the natural beauty from within.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face $170 One session</td></tr>
<tr><td>Face & Neck $255 One session</td></tr>
<tr><td>Face, Neck & Décolletage $340 One session</td></tr>
<tr><td>Body From $170 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Face $816 $136 per session, Save $204</td></tr>
<tr><td>Face & Neck $1224 $204 per session, Save $306</td></tr>
<tr><td>Face, Neck & Décolletage $1632 $272 per session, Save $408</td></tr>
<tr><td>Body From $816 From $136 per session, Save from $204</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions are recommended?</strong></li>
<li><strong>How long does the session take?</strong></li>
<li><strong>Is this treatment suitable for everyone?</strong></li>
<li><strong>How long does it take until I can see the results?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
<li><strong>Is there any downtime?</strong></li>
</ul>',
   price_from = 170,
   updated_at = NOW()
 WHERE slug = 'laser-rejuvenation';

UPDATE treatments SET
   body_html = '<p class="lead">Peel away the years.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Vitamin A - Face only $120 One session</td></tr>
<tr><td>Vitamin A - Face & Neck $150 One session</td></tr>
<tr><td>Vitamin A - Face, Neck & Décolletage $180 One session</td></tr>
<tr><td>Vitamin A - Back From $210 One session</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face only $170 One session</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face & Neck $200 One session</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face, Neck & Décolletage $230 One session</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Back From $350 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Vitamin A - Face only $288 $96 per session, Save $72</td></tr>
<tr><td>Vitamin A - Face & Neck $360 $120 per session, Save $90</td></tr>
<tr><td>Vitamin A - Face, Neck & Décolletage $432 $144 per session, Save $108</td></tr>
<tr><td>Vitamin A - Back From $504 From $168 per session, Save from $126</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face only $408 $136 per session, Save $102</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face & Neck $480 $160 per session, Save $120</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face, Neck & Décolletage $552 $184 per session, Save $138</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Back From $840 From $280 per session, Save from $210</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions are recommended?</strong></li>
<li><strong>How long does the treatment take?</strong></li>
<li><strong>Is this treatment suitable for everyone?</strong></li>
<li><strong>How long does it take until I can see the results?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
<li><strong>Can I use several peels and treatments at the same time?</strong></li>
</ul>',
   price_from = 120,
   updated_at = NOW()
 WHERE slug = 'medi-aesthetic-peels';

UPDATE treatments SET
   body_html = '<p class="lead">Turn back the clock</p>

<h2>Recommended for</h2>
<ul>
<li>Stretch marks</li>
<li>Acne scarring</li>
<li>Fine lines</li>
<li>Skin pigmentation</li>
<li>Scarring</li>
<li>Enlarged pores</li>
</ul>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $220 One session</td></tr>
<tr><td>Face & Neck $270 One session</td></tr>
<tr><td>Face, Neck & Décolletage $300 One session</td></tr>
<tr><td>Stretch marks From $190 One session</td></tr>
<tr><td>Add on peel $60 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $528 $176 per session, Save $132</td></tr>
<tr><td>Face & Neck $648 $216 per session, Save $162</td></tr>
<tr><td>Face, Neck & Décolletage $720 $240 per session, Save $180</td></tr>
<tr><td>Stretch marks From $456 From $152 per session, Save from $114</td></tr>
<tr><td>Add on peel $144 $48 per session, Save $36</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many treatments are recommended?</strong></li>
<li><strong>How long does the treatment take?</strong></li>
<li><strong>How long does it take until I can see the results?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
</ul>',
   price_from = 190,
   updated_at = NOW()
 WHERE slug = 'micro-needling';

UPDATE treatments SET
   body_html = '<p class="lead">Say hello to the real you.</p>

<h2>Recommended for</h2>
<ul>
<li>Age spots</li>
<li>Uneven skin tone</li>
<li>Wrinkles and fine lines</li>
<li>Acne scarring</li>
<li>Dull and lifeless skin</li>
<li>Dark spots</li>
<li>Stretch marks</li>
</ul>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face $100 One session</td></tr>
<tr><td>Face & Neck $130 One session</td></tr>
<tr><td>Face, Neck & Décolletage $160 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face $240 $80 per session, Save $60</td></tr>
<tr><td>Face & Neck $312 $104 per session, Save $78</td></tr>
<tr><td>Face, Neck & Décolletage $384 $128 per session, Save $96</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions will I need?</strong></li>
<li><strong>How long until I can see the results?</strong></li>
<li><strong>How long does the session take?</strong></li>
<li><strong>How long will the results last?</strong></li>
<li><strong>Is there any  downtime?</strong></li>
<li><strong>Is it suitable for everyone?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
</ul>',
   price_from = 100,
   updated_at = NOW()
 WHERE slug = 'microdermabrasion';

UPDATE treatments SET
   body_html = '<p class="lead">Reawaken your youth.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $120 One session</td></tr>
<tr><td>Neck only $90 One session</td></tr>
<tr><td>Face & Neck $150 One session</td></tr>
<tr><td>Face, Neck & Décolletage $180 One session</td></tr>
<tr><td>Body $180 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Face only $576 $96 per session, Save $144</td></tr>
<tr><td>Neck only $432 $72 per session, Save $108</td></tr>
<tr><td>Face & Neck $720 $120 per session, Save $180</td></tr>
<tr><td>Face, Neck & Décolletage $864 $144 per session, Save $216</td></tr>
<tr><td>Body $864 $144 per session, Save $216</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions will I need?</strong></li>
<li><strong>How long until I can see the results?</strong></li>
<li><strong>How long does the session take?</strong></li>
<li><strong>How long will the results last?</strong></li>
<li><strong>Is there any downtime?</strong></li>
<li><strong>Is it suitable for everyone?</strong></li>
</ul>',
   price_from = 90,
   updated_at = NOW()
 WHERE slug = 'radiofrequency';

UPDATE treatments SET
   body_html = '<p class="lead">Reveal the real you</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Eyebrow cosmetic tattoo $130 One session</td></tr>
<tr><td>4 cm2 - 2cm x 2cm $50 Approximate size of a 20c coin</td></tr>
<tr><td>20 cm2 - 5cm x 4cm $100 Approximate size of a matchbox</td></tr>
<tr><td>50 cm2 - 10cm x 5cm $130 Approximate size of a credit card</td></tr>
<tr><td>100 cm2 - 10cm x 10cm $170 Approximate size of a passport</td></tr>
<tr><td>150 cm2 - 15cm x 10cm $240 Approximate size of quarter A4 page</td></tr>
<tr><td>300 cm2 - 20cm x 15cm $320 Approximate size of half A4 page</td></tr>
<tr><td>400 cm2 - 20cm x 20cm $380 Approximate size of a dinner plate</td></tr>
<tr><td>600 cm2 - 30cm x 20cm $580 Approximate size of a A4 page</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions are recommended?</strong></li>
<li><strong>How long does the treatment take?</strong></li>
<li><strong>How long do I need to wait between sessions?</strong></li>
<li><strong>How long does it take until I can see the results?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
<li><strong>Is this treatment suitable for everyone?</strong></li>
</ul>',
   price_from = 50,
   updated_at = NOW()
 WHERE slug = 'tattoo-removal';

UPDATE treatments SET
   body_html = '<p class="lead">Let nature transform you.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $350 One session</td></tr>
<tr><td>Face & Neck $400 One session</td></tr>
<tr><td>Face, Neck & Décolletage $500 One session</td></tr>
<tr><td>Back From $350 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $840 $280 per session, Save $210</td></tr>
<tr><td>Face & Neck $960 $320 per session, Save $240</td></tr>
<tr><td>Face, Neck & Décolletage $1200 $400 per session, Save $300</td></tr>
<tr><td>Back From $840 From $280 per session, Save from $210</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many sessions will I need?</strong></li>
<li><strong>How long until I can see the results?</strong></li>
<li><strong>How long does the session take?</strong></li>
<li><strong>How long will the results last?</strong></li>
<li><strong>Is there any downtime?</strong></li>
<li><strong>Is it suitable for everyone?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
</ul>',
   price_from = 350,
   updated_at = NOW()
 WHERE slug = 'zena-algae-peel';

-- ── 4. Move the existing laser treatments into the Laser category ───────────
UPDATE treatments SET category = 'laser', sort_order = 20, updated_at = NOW()
 WHERE slug = 'laser-rejuvenation';

UPDATE treatments SET category = 'laser', sort_order = 27, updated_at = NOW()
 WHERE slug = 'laser-for-nail-fungus';

-- ── 5. New laser treatments ─────────────────────────────────────────────────
-- Delete-then-insert rather than ON CONFLICT: this does not depend on a unique
-- index existing on treatments.slug, and is safe to re-run.
DELETE FROM treatments WHERE slug IN ('laser-hair-removal', 'laser-genesis', 'fractional-laser', 'laser-genesis-fractional-laser', 'pico-laser-pigmentation', 'laser-for-pigmentation', 'laser-for-vascular-lesions');

INSERT INTO treatments (slug, title, subtitle, summary, body_html, category, status, sort_order, price_from, seo_title, seo_description, what_to_expect, schema_faq, duration_minutes, price_cents, bookable_online, created_at, updated_at)
VALUES
 (
   'laser-hair-removal',
   'Laser Hair Removal',
   'LASER HAIR REMOVAL FOR FACE AND BODY',
   'Smooth, hair-free skin without the endless shaving and waxing.',
   '<p class="lead">Smooth, hair-free skin without the endless shaving and waxing.</p>

<h2>Recommended for</h2>
<ul>
<li>Unwanted facial hair</li>
<li>Unwanted body hair</li>
<li>Ingrown hairs</li>
<li>Razor burn and irritation</li>
<li>Folliculitis</li>
<li>Shaving rash</li>
<li>Waxing sensitivity</li>
</ul>

<h2>Pricing</h2>

<h3>Upper body — single session</h3>
<table>
<tbody>
<tr><td>Areola (Female) $10</td></tr>
<tr><td>Areola (Male) $28</td></tr>
<tr><td>Full Back and Shoulders (Male) $159</td></tr>
<tr><td>Full Back and Shoulder (Female) $139</td></tr>
<tr><td>Underarms (Female) $28</td></tr>
<tr><td>Underarms (Male) $38</td></tr>
<tr><td>Full Arms (Female) $79</td></tr>
<tr><td>Full Arms (Male) $99</td></tr>
<tr><td>Half Arms (Female) $59</td></tr>
<tr><td>Half Arms (Male) $79</td></tr>
<tr><td>Full Back (Male) $139</td></tr>
<tr><td>Full Back (Female) $139</td></tr>
<tr><td>Half Back (Male) $109</td></tr>
<tr><td>Half Back (Female) $109</td></tr>
<tr><td>Back of neck (Male) $29</td></tr>
<tr><td>Back of Neck (Female) $29</td></tr>
<tr><td>Chest (Female) $49</td></tr>
<tr><td>Chest (Male) $89</td></tr>
<tr><td>Chest and Stomach (Female) $109</td></tr>
<tr><td>Chest and Stomach (Male) $144</td></tr>
<tr><td>Hands and Fingers (Female) $19</td></tr>
<tr><td>Hands and Fingers (Male) $25</td></tr>
<tr><td>Shoulders (Female) $39</td></tr>
<tr><td>Shoulders (Male) $49</td></tr>
<tr><td>Snail trail (Female) $19</td></tr>
<tr><td>Snail trail (Male) $29</td></tr>
<tr><td>Stomach (Female) $49</td></tr>
<tr><td>Stomach (Male) $79</td></tr>
<tr><td>Full Back, Shoulders, Chest and Back (Male) $280</td></tr>
<tr><td>Full Back, Shoulders, Chest and Stomach (Female) $220</td></tr>
</tbody>
</table>

<h3>Upper body — pack of 6</h3>
<table>
<tbody>
<tr><td>Areola (Female) $48 $8 per session, Save $12</td></tr>
<tr><td>Areola (Male) $134 $22 per session, Save $34</td></tr>
<tr><td>Full Back and Shoulders (Male) $763 $127 per session, Save $191</td></tr>
<tr><td>Full Back and Shoulder (Female) $667 $111 per session, Save $167</td></tr>
<tr><td>Underarms (Female) $134 $22 per session, Save $34</td></tr>
<tr><td>Underarms (Male) $182 $30 per session, Save $46</td></tr>
<tr><td>Full Arms (Female) $379 $63 per session, Save $95</td></tr>
<tr><td>Full Arms (Male) $475 $79 per session, Save $119</td></tr>
<tr><td>Half Arms (Female) $283 $47 per session, Save $71</td></tr>
<tr><td>Half Arms (Male) $379 $63 per session, Save $95</td></tr>
<tr><td>Full Back (Male) $667 $111 per session, Save $167</td></tr>
<tr><td>Full Back (Female) $667 $111 per session, Save $167</td></tr>
<tr><td>Half Back (Male) $523 $87 per session, Save $131</td></tr>
<tr><td>Half Back (Female) $523 $87 per session, Save $131</td></tr>
<tr><td>Back of neck (Male) $139 $23 per session, Save $35</td></tr>
<tr><td>Back of Neck (Female) $139 $23 per session, Save $35</td></tr>
<tr><td>Chest (Female) $235 $39 per session, Save $59</td></tr>
<tr><td>Chest (Male) $427 $71 per session, Save $107</td></tr>
<tr><td>Chest and Stomach (Female) $523 $87 per session, Save $131</td></tr>
<tr><td>Chest and Stomach (Male) $691 $115 per session, Save $173</td></tr>
<tr><td>Hands and Fingers (Female) $91 $15 per session, Save $23</td></tr>
<tr><td>Hands and Fingers (Male) $120 $20 per session, Save $30</td></tr>
<tr><td>Shoulders (Female) $187 $31 per session, Save $47</td></tr>
<tr><td>Shoulders (Male) $235 $39 per session, Save $59</td></tr>
<tr><td>Snail trail (Female) $91 $15 per session, Save $23</td></tr>
<tr><td>Snail trail (Male) $139 $23 per session, Save $35</td></tr>
<tr><td>Stomach (Female) $235 $39 per session, Save $59</td></tr>
<tr><td>Stomach (Male) $379 $63 per session, Save $95</td></tr>
<tr><td>Full Back, Shoulders, Chest and Back (Male) $1344 $224 per session, Save $336</td></tr>
<tr><td>Full Back, Shoulders, Chest and Stomach (Female) $1056 $176 per session, Save $264</td></tr>
</tbody>
</table>

<h3>Lower body — single session</h3>
<table>
<tbody>
<tr><td>Anus (Female) $15</td></tr>
<tr><td>Anus (Male) $70</td></tr>
<tr><td>Brazilian incl. anus (Female) $62</td></tr>
<tr><td>Brazilian incl. anus (Male) $200</td></tr>
<tr><td>Combo: Brazilian, anus, underarms (Female) $69</td></tr>
<tr><td>Combo: Brazilian, anus and Underarms (Male) $180</td></tr>
<tr><td>Bikini Line (Female) $35</td></tr>
<tr><td>Bikini Line (Male) $130</td></tr>
<tr><td>Buttocks (Female) $59</td></tr>
<tr><td>Buttocks (Male) $89</td></tr>
<tr><td>Full Legs (Female) $129</td></tr>
<tr><td>Full Legs (Male) $169</td></tr>
<tr><td>Combo: Full Legs, Brazilian, Anus, underarms (Female) $174</td></tr>
<tr><td>Combo: Full Legs, Brazilian, Anus, underarms (Male) $320</td></tr>
<tr><td>Half Legs (Female) $79</td></tr>
<tr><td>Half Legs (Male) $109</td></tr>
<tr><td>Combo: Half Legs, Brazilian, Anus, underarms (Female) $139</td></tr>
<tr><td>Combo: Half Legs, Brazilian, Anus, underarms (Male) $270</td></tr>
<tr><td>Knees (Female) $15</td></tr>
<tr><td>Knees (Male) $25</td></tr>
<tr><td>G-string (Female) $55</td></tr>
<tr><td>G-string (Male) $160</td></tr>
</tbody>
</table>

<h3>Lower body — pack of 6</h3>
<table>
<tbody>
<tr><td>Anus (Female) $72 $12 per session, Save $18</td></tr>
<tr><td>Anus (Male) $336 $56 per session, Save $84</td></tr>
<tr><td>Brazilian incl. anus (Female) $298 $50 per session, Save $74</td></tr>
<tr><td>Brazilian incl. anus (Male) $960 $160 per session, Save $240</td></tr>
<tr><td>Combo: Brazilian, anus, underarms (Female) $331 $55 per session, Save $83</td></tr>
<tr><td>Combo: Brazilian, anus and Underarms (Male) $864 $144 per session, Save $216</td></tr>
<tr><td>Bikini Line (Female) $168 $28 per session, Save $42</td></tr>
<tr><td>Bikini Line (Male) $624 $104 per session, Save $156</td></tr>
<tr><td>Buttocks (Female) $283 $47 per session, Save $71</td></tr>
<tr><td>Buttocks (Male) $427 $71 per session, Save $107</td></tr>
<tr><td>Full Legs (Female) $619 $103 per session, Save $155</td></tr>
<tr><td>Full Legs (Male) $811 $135 per session, Save $203</td></tr>
<tr><td>Combo: Full Legs, Brazilian, Anus, underarms (Female) $835 $139 per session, Save $209</td></tr>
<tr><td>Combo: Full Legs, Brazilian, Anus, underarms (Male) $1536 $256 per session, Save $384</td></tr>
<tr><td>Half Legs (Female) $379 $63 per session, Save $95</td></tr>
<tr><td>Half Legs (Male) $523 $87 per session, Save $131</td></tr>
<tr><td>Combo: Half Legs, Brazilian, Anus, underarms (Female) $667 $111 per session, Save $167</td></tr>
<tr><td>Combo: Half Legs, Brazilian, Anus, underarms (Male) $1296 $216 per session, Save $324</td></tr>
<tr><td>Knees (Female) $72 $12 per session, Save $18</td></tr>
<tr><td>Knees (Male) $120 $20 per session, Save $30</td></tr>
<tr><td>G-string (Female) $264 $44 per session, Save $66</td></tr>
<tr><td>G-string (Male) $768 $128 per session, Save $192</td></tr>
</tbody>
</table>

<h3>Face — single session</h3>
<table>
<tbody>
<tr><td>Chin (Female) $19</td></tr>
<tr><td>Chin (Male) $32</td></tr>
<tr><td>Ears (Female) $19</td></tr>
<tr><td>Ears (Male) $19</td></tr>
<tr><td>Full Face (Female) $49</td></tr>
<tr><td>Full Face (Male) $69</td></tr>
<tr><td>Lip (Female) $19</td></tr>
<tr><td>Lip (Male) $32</td></tr>
<tr><td>Lip and Chin (Female) $29</td></tr>
<tr><td>Lip and Chin (Male) $43</td></tr>
<tr><td>Nose (Female) $15</td></tr>
<tr><td>Nose (Male) $18</td></tr>
<tr><td>Face sides (Female) $19</td></tr>
<tr><td>Face sides (Male) $29</td></tr>
</tbody>
</table>

<h3>Face — pack of 6</h3>
<table>
<tbody>
<tr><td>Chin (Female) $91 $15 per session, Save $23</td></tr>
<tr><td>Chin (Male) $154 $26 per session, Save $38</td></tr>
<tr><td>Ears (Female) $91 $15 per session, Save $23</td></tr>
<tr><td>Ears (Male) $91 $15 per session, Save $23</td></tr>
<tr><td>Full Face (Female) $235 $39 per session, Save $59</td></tr>
<tr><td>Full Face (Male) $331 $55 per session, Save $83</td></tr>
<tr><td>Lip (Female) $91 $15 per session, Save $23</td></tr>
<tr><td>Lip (Male) $154 $26 per session, Save $38</td></tr>
<tr><td>Lip and Chin (Female) $139 $23 per session, Save $35</td></tr>
<tr><td>Lip and Chin (Male) $206 $34 per session, Save $52</td></tr>
<tr><td>Nose (Female) $72 $12 per session, Save $18</td></tr>
<tr><td>Nose (Male) $86 $14 per session, Save $22</td></tr>
<tr><td>Face sides (Female) $91 $15 per session, Save $23</td></tr>
<tr><td>Face sides (Male) $139 $23 per session, Save $35</td></tr>
</tbody>
</table>

<h3>Add-on areas — single session</h3>
<table>
<tbody>
<tr><td>Anus (Female) $12</td></tr>
<tr><td>Anus (Male) $60</td></tr>
<tr><td>Face sides (Female) $19</td></tr>
<tr><td>Face sides (Male) $29</td></tr>
<tr><td>Feet (Female) $12</td></tr>
<tr><td>Feet (Male) $25</td></tr>
<tr><td>Lip OR Chin (Female) $12</td></tr>
<tr><td>Lip OR Chin (Male) $25</td></tr>
<tr><td>Lip and Chin (Female) $29</td></tr>
<tr><td>Lip and Chin (Male) $43</td></tr>
<tr><td>Snail trail (Female) $12</td></tr>
<tr><td>Snail trail (Male) $25</td></tr>
<tr><td>Shave (Female) $30</td></tr>
<tr><td>Shave (Male) $40</td></tr>
</tbody>
</table>

<h3>Add-on areas — pack of 6</h3>
<table>
<tbody>
<tr><td>Anus (Female) $58 $10 per session, Save $14</td></tr>
<tr><td>Anus (Male) $288 $48 per session, Save $72</td></tr>
<tr><td>Face sides (Female) $91 $15 per session, Save $23</td></tr>
<tr><td>Face sides (Male) $139 $23 per session, Save $35</td></tr>
<tr><td>Feet (Female) $58 $10 per session, Save $14</td></tr>
<tr><td>Feet (Male) $120 $20 per session, Save $30</td></tr>
<tr><td>Lip OR Chin (Female) $58 $10 per session, Save $14</td></tr>
<tr><td>Lip OR Chin (Male) $120 $20 per session, Save $30</td></tr>
<tr><td>Lip and Chin (Female) $139 $23 per session, Save $35</td></tr>
<tr><td>Lip and Chin (Male) $206 $34 per session, Save $52</td></tr>
<tr><td>Snail trail (Female) $58 $10 per session, Save $14</td></tr>
<tr><td>Snail trail (Male) $120 $20 per session, Save $30</td></tr>
<tr><td>Shave (Female) $144 $24 per session, Save $36</td></tr>
<tr><td>Shave (Male) $192 $32 per session, Save $48</td></tr>
</tbody>
</table>',
   'laser',
   'published',
   19,
   10,
   'Laser Hair Removal | Naturally Beautiful Skin Rejuvenation',
   'Smooth, hair-free skin without the endless shaving and waxing. Treatment available in Dee Why, Northern Beaches, Sydney.',
   '["Permanent hair reduction", "Smoother skin", "No more ingrown hairs", "No razor burn", "Less time spent shaving", "Reduced irritation", "Comfortable, fast sessions", "Treatment for face and body", "Progressive results over a course"]'::jsonb,
   '[{"question": "How many sessions are recommended?", "answer": "Hair grows in cycles, so a course of 6 sessions spaced a few weeks apart is standard. Pack pricing below is built around a course of 6."}, {"question": "How long does the treatment take?", "answer": "From 10 minutes for a small area such as the lip, up to around an hour for full legs or a full back."}, {"question": "Is this treatment suitable for everyone?", "answer": "A patch test and skin assessment are carried out before your first treatment. Your therapist will confirm this at your free consultation."}, {"question": "Is the treatment painful?", "answer": "Most clients describe the sensation as a warm flick against the skin. Your therapist will confirm this at your free consultation."}]'::jsonb,
   60,
   NULL,
   false,
   NOW(), NOW()
 ),
 (
   'laser-genesis',
   'Laser Genesis',
   'LASER GENESIS SKIN THERAPY',
   'Gentle laser therapy that calms redness and rebuilds collagen with no downtime.',
   '<p class="lead">Gentle laser therapy that calms redness and rebuilds collagen with no downtime.</p>

<h2>Recommended for</h2>
<ul>
<li>Redness and flushing</li>
<li>Rosacea</li>
<li>Enlarged pores</li>
<li>Fine lines</li>
<li>Uneven texture</li>
<li>Acne scarring</li>
<li>Dull skin</li>
</ul>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Full Face $180 One session</td></tr>
<tr><td>Full face and neck $250 One session</td></tr>
<tr><td>Full face, neck and decolletage $320 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Full Face $864 $144 per session, Save $216</td></tr>
<tr><td>Full face and neck $1200 $200 per session, Save $300</td></tr>
<tr><td>Full face, neck and decolletage $1536 $256 per session, Save $384</td></tr>
</tbody>
</table>',
   'laser',
   'published',
   21,
   180,
   'Laser Genesis | Naturally Beautiful Skin Rejuvenation',
   'Gentle laser therapy that calms redness and rebuilds collagen with no downtime. Treatment available in Dee Why, Northern Beaches, Sydney.',
   '["Reduced redness", "Smaller-looking pores", "Stimulated collagen", "Smoother texture", "Softened fine lines", "Even skin tone", "No downtime", "A comfortable, warming treatment", "Progressive results over a course"]'::jsonb,
   '[{"question": "How many sessions are recommended?", "answer": "A course of 6 sessions is recommended for best results, which is how the pack below is priced."}, {"question": "How long does the treatment take?", "answer": "Around 30 to 45 minutes for the face, a little longer with neck and décolletage."}, {"question": "Is this treatment suitable for everyone?", "answer": "A patch test and skin assessment are carried out before your first treatment. Your therapist will confirm this at your free consultation."}, {"question": "Is the treatment painful?", "answer": "Most clients describe the sensation as a warm flick against the skin. Your therapist will confirm this at your free consultation."}]'::jsonb,
   60,
   NULL,
   false,
   NOW(), NOW()
 ),
 (
   'fractional-laser',
   'Fractional Laser',
   'FRACTIONAL LASER RESURFACING',
   'Targeted resurfacing that softens scarring, lines and sun damage.',
   '<p class="lead">Targeted resurfacing that softens scarring, lines and sun damage.</p>

<h2>Recommended for</h2>
<ul>
<li>Acne scarring</li>
<li>Fine lines and wrinkles</li>
<li>Sun damage</li>
<li>Uneven texture</li>
<li>Enlarged pores</li>
<li>Pigmentation</li>
<li>Loss of firmness</li>
</ul>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Full Face $180 One session</td></tr>
<tr><td>Full face and neck $250 One session</td></tr>
<tr><td>Full face, neck and decolletage $320 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Full Face $864 $144 per session, Save $216</td></tr>
<tr><td>Full face and neck $1200 $200 per session, Save $300</td></tr>
<tr><td>Full face, neck and decolletage $1536 $256 per session, Save $384</td></tr>
</tbody>
</table>',
   'laser',
   'published',
   22,
   180,
   'Fractional Laser | Naturally Beautiful Skin Rejuvenation',
   'Targeted resurfacing that softens scarring, lines and sun damage. Treatment available in Dee Why, Northern Beaches, Sydney.',
   '["Smoother, refined texture", "Softened acne scarring", "Reduced fine lines", "Improved firmness", "Faded sun damage", "Stimulated collagen", "More even tone", "Refined pores", "Progressive results over a course"]'::jsonb,
   '[{"question": "How many sessions are recommended?", "answer": "A course of 6 sessions is recommended, which is how the pack below is priced."}, {"question": "How long does the treatment take?", "answer": "Around 45 minutes for the face, longer for face, neck and décolletage."}, {"question": "Is this treatment suitable for everyone?", "answer": "A patch test and skin assessment are carried out before your first treatment. Your therapist will confirm this at your free consultation."}, {"question": "Is the treatment painful?", "answer": "Most clients describe the sensation as a warm flick against the skin. Your therapist will confirm this at your free consultation."}]'::jsonb,
   60,
   NULL,
   false,
   NOW(), NOW()
 ),
 (
   'laser-genesis-fractional-laser',
   'Laser Genesis + Fractional Laser',
   'COMBINED LASER GENESIS AND FRACTIONAL LASER',
   'Our two signature laser therapies in one session for a deeper result.',
   '<p class="lead">Our two signature laser therapies in one session for a deeper result.</p>

<h2>Recommended for</h2>
<ul>
<li>Acne scarring</li>
<li>Redness and rosacea</li>
<li>Fine lines and wrinkles</li>
<li>Sun damage</li>
<li>Enlarged pores</li>
<li>Uneven texture</li>
<li>Dull skin</li>
</ul>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Full Face $280 One session</td></tr>
<tr><td>Full face and neck $360 One session</td></tr>
<tr><td>Full face, neck and decolletage $410 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Full Face $1344 $224 per session, Save $336</td></tr>
<tr><td>Full face and neck $1728 $288 per session, Save $432</td></tr>
<tr><td>Full face, neck and decolletage $1968 $328 per session, Save $492</td></tr>
</tbody>
</table>',
   'laser',
   'published',
   23,
   280,
   'Laser Genesis + Fractional Laser | Naturally Beautiful Skin Rejuvenation',
   'Our two signature laser therapies in one session for a deeper result. Treatment available in Dee Why, Northern Beaches, Sydney.',
   '["Redness reduction and resurfacing together", "Stronger collagen stimulation", "Smoother texture", "Softened scarring", "More even tone", "Refined pores", "Fewer appointments than booking separately", "A comfortable combined session", "Progressive results over a course"]'::jsonb,
   '[{"question": "How many sessions are recommended?", "answer": "A course of 6 combined sessions is recommended, which is how the pack below is priced."}, {"question": "How long does the treatment take?", "answer": "Around 60 to 75 minutes, as two therapies are performed in the one appointment."}, {"question": "Is this treatment suitable for everyone?", "answer": "A patch test and skin assessment are carried out before your first treatment. Your therapist will confirm this at your free consultation."}, {"question": "Is the treatment painful?", "answer": "Most clients describe the sensation as a warm flick against the skin. Your therapist will confirm this at your free consultation."}]'::jsonb,
   60,
   NULL,
   false,
   NOW(), NOW()
 ),
 (
   'pico-laser-pigmentation',
   'Pico Laser Pigmentation',
   'PICOSECOND LASER FOR PIGMENTATION',
   'Picosecond laser energy that breaks down stubborn pigment.',
   '<p class="lead">Picosecond laser energy that breaks down stubborn pigment.</p>

<h2>Recommended for</h2>
<ul>
<li>Sun spots</li>
<li>Age spots</li>
<li>Freckles</li>
<li>Melasma</li>
<li>Post-inflammatory pigmentation</li>
<li>Uneven skin tone</li>
<li>Pigmentation on the hands</li>
</ul>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face $170 One session</td></tr>
<tr><td>Face & Neck $255 One session</td></tr>
<tr><td>Face, Neck & Décolletage $340 One session</td></tr>
<tr><td>Hands $150 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Face $816 $136 per session, Save $204</td></tr>
<tr><td>Face & Neck $1224 $204 per session, Save $306</td></tr>
<tr><td>Face, Neck & Décolletage $1632 $272 per session, Save $408</td></tr>
<tr><td>Hands $720 $120 per session, Save $180</td></tr>
</tbody>
</table>',
   'laser',
   'published',
   24,
   150,
   'Pico Laser Pigmentation | Naturally Beautiful Skin Rejuvenation',
   'Picosecond laser energy that breaks down stubborn pigment. Treatment available in Dee Why, Northern Beaches, Sydney.',
   '["Faded sun and age spots", "More even skin tone", "Brighter complexion", "Reduced pigmentation", "Minimal downtime", "Fast, targeted sessions", "Suitable for face, neck, décolletage and hands", "Stimulated collagen", "Progressive results over a course"]'::jsonb,
   '[{"question": "How many sessions are recommended?", "answer": "A course of 6 sessions is recommended, which is how the pack below is priced."}, {"question": "How long does the treatment take?", "answer": "Around 30 minutes, depending on the area treated."}, {"question": "Is this treatment suitable for everyone?", "answer": "A patch test and skin assessment are carried out before your first treatment. Your therapist will confirm this at your free consultation."}, {"question": "Is the treatment painful?", "answer": "Most clients describe the sensation as a warm flick against the skin. Your therapist will confirm this at your free consultation."}]'::jsonb,
   60,
   NULL,
   false,
   NOW(), NOW()
 ),
 (
   'laser-for-pigmentation',
   'Laser for Pigmentation',
   'LASER TREATMENT FOR MELASMA AND FRECKLES',
   'Targeted laser treatment for melasma, freckles and pigment patches.',
   '<p class="lead">Targeted laser treatment for melasma, freckles and pigment patches.</p>

<h2>Recommended for</h2>
<ul>
<li>Melasma</li>
<li>Freckles</li>
<li>Sun damage</li>
<li>Uneven skin tone</li>
<li>Pigment patches on the cheeks</li>
<li>Hormonal pigmentation</li>
</ul>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Melasma Full face $230 One session</td></tr>
<tr><td>Freckles Full Face $180 One session</td></tr>
<tr><td>Cheeks Freckles $120 One session</td></tr>
<tr><td>Add LED Light $40 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Freckles Full Face $432 $144 per session, Save $108</td></tr>
<tr><td>Cheeks Freckles $288 $96 per session, Save $72</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Melasma Full face $1104 $184 per session, Save $276</td></tr>
</tbody>
</table>',
   'laser',
   'published',
   25,
   120,
   'Laser for Pigmentation | Naturally Beautiful Skin Rejuvenation',
   'Targeted laser treatment for melasma, freckles and pigment patches. Treatment available in Dee Why, Northern Beaches, Sydney.',
   '["Faded melasma", "Lightened freckles", "More even skin tone", "Brighter complexion", "Targeted treatment by area", "Minimal downtime", "A comfortable session", "Tailored to your pigment type", "Progressive results over a course"]'::jsonb,
   '[{"question": "How many sessions are recommended?", "answer": "Melasma is priced as a course of 6; freckle treatments are priced as a course of 3. Your therapist will recommend the right course for your pigment type."}, {"question": "How long does the treatment take?", "answer": "Between 20 and 40 minutes depending on the area treated."}, {"question": "Is this treatment suitable for everyone?", "answer": "A patch test and skin assessment are carried out before your first treatment. Your therapist will confirm this at your free consultation."}, {"question": "Is the treatment painful?", "answer": "Most clients describe the sensation as a warm flick against the skin. Your therapist will confirm this at your free consultation."}]'::jsonb,
   60,
   NULL,
   false,
   NOW(), NOW()
 ),
 (
   'laser-for-vascular-lesions',
   'Laser for Vascular Lesions',
   'LASER TREATMENT FOR VESSELS AND REDNESS',
   'Clears visible vessels, redness and cherry angiomas.',
   '<p class="lead">Clears visible vessels, redness and cherry angiomas.</p>

<h2>Recommended for</h2>
<ul>
<li>Facial redness</li>
<li>Rosacea</li>
<li>Thread veins</li>
<li>Red and purple leg vessels</li>
<li>Cherry angiomas</li>
<li>Redness on the nose</li>
<li>Flushed cheeks</li>
</ul>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Cheeks $120 One session</td></tr>
<tr><td>Cherry Angiomas $70 One session</td></tr>
<tr><td>Legs (red and purple vessels only) $120 One session</td></tr>
<tr><td>Nose $80 One session</td></tr>
<tr><td>Rosacea cheeks $120 One session</td></tr>
<tr><td>Rosacea Full Face $280 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Cherry Angiomas $168 $56 per session, Save $42</td></tr>
</tbody>
</table>

<h3>Pack of 4</h3>
<table>
<tbody>
<tr><td>Cheeks $384 $96 per session, Save $96</td></tr>
<tr><td>Legs (red and purple vessels only) $384 $96 per session, Save $96</td></tr>
<tr><td>Nose $256 $64 per session, Save $64</td></tr>
<tr><td>Rosacea cheeks $384 $96 per session, Save $96</td></tr>
<tr><td>Rosacea Full Face $896 $224 per session, Save $224</td></tr>
</tbody>
</table>',
   'laser',
   'published',
   26,
   70,
   'Laser for Vascular Lesions | Naturally Beautiful Skin Rejuvenation',
   'Clears visible vessels, redness and cherry angiomas. Treatment available in Dee Why, Northern Beaches, Sydney.',
   '["Cleared visible vessels", "Reduced facial redness", "Calmer rosacea", "Removal of cherry angiomas", "More even skin tone", "Targeted treatment by area", "Minimal downtime", "A quick, comfortable session", "Progressive results over a course"]'::jsonb,
   '[{"question": "How many sessions are recommended?", "answer": "Most areas are priced as a course of 4; cherry angiomas are priced as a course of 3."}, {"question": "How long does the treatment take?", "answer": "Between 15 and 45 minutes depending on the area treated."}, {"question": "Is this treatment suitable for everyone?", "answer": "A patch test and skin assessment are carried out before your first treatment. Your therapist will confirm this at your free consultation."}, {"question": "Is the treatment painful?", "answer": "Most clients describe the sensation as a warm flick against the skin. Your therapist will confirm this at your free consultation."}]'::jsonb,
   60,
   NULL,
   false,
   NOW(), NOW()
 );

COMMIT;

-- Verify
SELECT category, slug, title, price_from, status, sort_order
  FROM treatments ORDER BY category, sort_order;