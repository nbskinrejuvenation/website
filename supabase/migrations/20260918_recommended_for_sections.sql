-- Add the "Recommended for" section to treatment pages that were missing it.
--
-- Carbon Peel is the reference layout: lead, Recommended for, Pricing, FAQ.
-- 14 pages had no Recommended for block, so TreatmentRecommendedFor never
-- rendered and those pages jumped from the hero straight to What To Expect.
--
-- The copy is the clinic's own, harvested from the corresponding page on the
-- current live site (nbskinrejuvenation.com.au) and verified against each
-- page's <h1> so no treatment received another treatment's indications.
--
-- Not included, needing clinic copy:
--   ems-for-muscle-gain                 old site serves Laser Hair Removal copy at this URL
--   ems-for-pelvic-floor-strengthening  no corresponding page on the old site

BEGIN;

UPDATE treatments SET body_html = '<p class="lead">Instant non-surgical skin lifting</p>

<h2>Recommended for</h2>
<ul>
<li>Drooping neck and jawline</li>
<li>Saggy eyelids</li>
<li>Stretch marks</li>
<li>Warts and skin tags</li>
<li>Wrinkles and fine lines</li>
<li>Aged or dull complexion</li>
<li>Scarring</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'fibroblast-plasma';

UPDATE treatments SET body_html = '<p class="lead">Reclaim a firmer, plumper, younger skin.</p>

<h2>Recommended for</h2>
<ul>
<li>Stretch marks</li>
<li>Acne</li>
<li>Fine lines and wrinkles</li>
<li>Aged skin texture</li>
<li>Scarring</li>
<li>Dull skin tone</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'fractional-rf';

UPDATE treatments SET body_html = '<p class="lead">Just like cosmetic surgery, only not.</p>

<h2>Recommended for</h2>
<ul>
<li>Wrinkles & lines</li>
<li>Loose facial skin</li>
<li>Excess stomach skin</li>
<li>Dull and lifeless complexion</li>
<li>Sagging cheeks, jowls</li>
<li>Droopy forehead and under-eye skin</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'hifu';

UPDATE treatments SET body_html = '<p class="lead">Hydrated, happy and healthy skin.</p>

<h2>Recommended for</h2>
<ul>
<li>Dry or flaky skin</li>
<li>Acne and blemishes</li>
<li>Blocked pores and blackheads</li>
<li>Lines and wrinkles</li>
<li>Oily or combination skin</li>
<li>Unpleasant texture</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'hydrodermabrasion';

UPDATE treatments SET body_html = '<p class="lead">Peel away the years.</p>

<h2>Recommended for</h2>
<ul>
<li>Dark spots</li>
<li>Redness</li>
<li>Acne</li>
<li>Fine lines and wrinkles</li>
<li>Pigmentation</li>
<li>Scarring</li>
<li>Enlarged pores</li>
<li>Dull or tired complexion</li>
<li>Aged skin texture</li>
<li>General signs of aging</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'medi-aesthetic-peels';

UPDATE treatments SET body_html = '<p class="lead">Reawaken your youth.</p>

<h2>Recommended for</h2>
<ul>
<li>Dull skin tone</li>
<li>Loose skin</li>
<li>Sagging areas</li>
<li>Wrinkles</li>
<li>Uneven skin texture</li>
<li>Heavy facial folds</li>
<li>Fine lines</li>
<li>Signs of aging</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'radiofrequency';

UPDATE treatments SET body_html = '<p class="lead">Let nature transform you.</p>

<h2>Recommended for</h2>
<ul>
<li>Acne</li>
<li>Scarring</li>
<li>Wrinkles and fine lines</li>
<li>Inflammation</li>
<li>Hyperpigmentation</li>
<li>Stretch marks</li>
<li>Enlarged pores</li>
<li>Dark circles</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'zena-algae-peel';

UPDATE treatments SET body_html = '<p class="lead">Get the body shape of your dreams.</p>

<h2>Recommended for</h2>
<ul>
<li>Excess body fat</li>
<li>Stubborn areas incl. abdomen, thighs and buttocks</li>
<li>Uneven body tone</li>
<li>Fat deposits</li>
<li>Love-handles</li>
<li>Cellulite</li>
<li>Indistinct silhouette</li>
</ul>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Saddle Bags $90 One session</td></tr>
<tr><td>Love handles (aka muffin tops) $90 One session</td></tr>
<tr><td>Butt $90 One session</td></tr>
<tr><td>Stomach $130 One session</td></tr>
<tr><td>Legs front (thighs only) $180 One session</td></tr>
<tr><td>Legs back (thighs only) $180 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Saddle Bags $432 $72 per session, Save $108</td></tr>
<tr><td>Love handles (aka muffin tops) $432 $72 per session, Save $108</td></tr>
<tr><td>Butt $432 $72 per session, Save $108</td></tr>
<tr><td>Stomach $624 $104 per session, Save $156</td></tr>
<tr><td>Legs front (thighs only) $864 $144 per session, Save $216</td></tr>
<tr><td>Legs back (thighs only) $864 $144 per session, Save $216</td></tr>
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
</ul>', updated_at = NOW()
 WHERE slug = 'fat-cavitation';

UPDATE treatments SET body_html = '<p class="lead">Sculpt the body of your dreams!</p>

<h2>Recommended for</h2>
<ul>
<li>Muffin tops / Love handles</li>
<li>Saddlebags</li>
<li>Cellulite</li>
<li>Stubborn fat</li>
<li>Skin dimples</li>
<li>Superficial fat deposits</li>
<li>Saggy buttocks</li>
<li>Large thighs</li>
<li>Lumpy skin texture</li>
<li>Stomach circumference</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'kumashape';

UPDATE treatments SET body_html = '<p class="lead">Reveal the real you</p>

<h2>Recommended for</h2>
<ul>
<li>No longer like an old tattoo</li>
<li>Tattoo poorly done</li>
<li>Help prepare skin for a cover-up</li>
<li>Addition or altering a previous tattoo</li>
<li>Updating names, dates or other details</li>
<li>Not happy with previous tattoo removal attempt</li>
<li>Broke-up with that girlfriend/boyfriend</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'tattoo-removal';

UPDATE treatments SET body_html = '<p class="lead">Unleash the natural beauty from within.</p>

<h2>Recommended for</h2>
<ul>
<li>Wrinkles and fine lines</li>
<li>Enlarged pores</li>
<li>Age spots</li>
<li>Skin pigmentation</li>
<li>Sun damage</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'laser-rejuvenation';

UPDATE treatments SET body_html = '<p class="lead">Put your best foot forward.</p>

<h2>Recommended for</h2>
<ul>
<li>Nail discolouration</li>
<li>Brittle nails</li>
<li>Persistent fungal infection</li>
<li>Deformed appearance</li>
<li>Nail cracks and chips</li>
<li>Thickened or misshaped nails</li>
<li>Toe pain and bruising</li>
<li>Traumatized nail bed</li>
</ul>

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
</ul>', updated_at = NOW()
 WHERE slug = 'laser-for-nail-fungus';

COMMIT;

-- Verify: every published treatment should now report true except the two EMS pages
SELECT slug, category,
       body_html LIKE '%<h2>Recommended for</h2>%' AS has_recommended_for
  FROM treatments
 WHERE status = 'published'
 ORDER BY has_recommended_for, category, sort_order;