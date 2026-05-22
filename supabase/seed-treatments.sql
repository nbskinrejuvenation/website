-- ============================================================
-- Seed: treatments (18 services from 01-services-crawl.json)
-- Generated: 2026-05-22T08:04:27.850Z
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Clear existing rows first (safe to re-run)
TRUNCATE treatments RESTART IDENTITY CASCADE;

INSERT INTO treatments (
  id, slug, title, subtitle, summary, body_html,
  hero_image, og_image_url, category, status, sort_order,
  seo_title, seo_description, schema_faq, created_at, updated_at
) VALUES
(
  'e3c4d7f6-66b3-4263-8c1e-13ebda7efdf1',                          -- id
  'carbon-peel',                -- slug
  'Carbon Peel',               -- title
  'CARBON PEEL AKA "HOLLYWOOD PEEL"',  -- subtitle
  'Gently exfoliates, clears and purifies your skin.',  -- summary
  '<p class="lead">Gently exfoliates, clears and purifies your skin.</p>

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
<tr><td>Face only $140 One session</td></tr>
<tr><td>Face & Neck $210 One session</td></tr>
<tr><td>Face, Neck & Décolletage $280 One session</td></tr>
<tr><td>Back $300 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $336 $112 per session, Save $84</td></tr>
<tr><td>Face & Neck $504 $168 per session, Save $126</td></tr>
<tr><td>Face, Neck & Décolletage $672 $224 per session, Save $168</td></tr>
<tr><td>Back $720 $240 per session, Save $180</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  1,                     -- sort_order
  'Carbon Peel | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Gently exfoliates, clears and purifies your skin. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many Carbon Peel sessions are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the treatment take?","answer":"Contact us for more information about this treatment."},{"question":"What is the recovery time?","answer":"Contact us for more information about this treatment."},{"question":"How long to these results last?","answer":"Contact us for more information about this treatment."},{"question":"Is Carbon Peel painful?","answer":"Contact us for more information about this treatment."},{"question":"Is this treatment suitable for everyone?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  '273d7f9c-348b-4b4d-b81a-52157479f738',                          -- id
  'fibroblast-plasma',                -- slug
  'Fibroblast Plasma',               -- title
  'FIBROBLAST PLASMA SKIN LIFT',  -- subtitle
  'Instant non-surgical skin lifting',  -- summary
  '<p class="lead">Instant non-surgical skin lifting</p>

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
<tr><td>Tummy tightening $800 One session</td></tr>
<tr><td>Pigmentation removal from $70 One session</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  2,                     -- sort_order
  'Fibroblast Plasma | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Instant non-surgical skin lifting Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions of Fibroblast Plasma are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"Is there any downtime?","answer":"Contact us for more information about this treatment."},{"question":"How long does it take until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"How long will the results last?","answer":"Contact us for more information about this treatment."},{"question":"Is Fibroblast Plasma suitable for everyone?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  '5578ed93-56b7-451f-a790-ecceee088aed',                          -- id
  'fractional-rf',                -- slug
  'Fractional RF',               -- title
  'Filters are great, but great skin is better.',  -- subtitle
  'Reclaim a firmer, plumper, younger skin.',  -- summary
  '<p class="lead">Reclaim a firmer, plumper, younger skin.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $250 One session</td></tr>
<tr><td>Face & Neck $300 One session</td></tr>
<tr><td>Face, Neck & Décolletage $350 One session</td></tr>
<tr><td>Stretch marks From $180 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $600 $200 per session, Save $150</td></tr>
<tr><td>Face & Neck $720 $240 per session, Save $180</td></tr>
<tr><td>Face, Neck & Décolletage $840 $280 per session, Save $210</td></tr>
<tr><td>Stretch marks From $432 From $144 per session, Save from $108</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  3,                     -- sort_order
  'Fractional RF | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Reclaim a firmer, plumper, younger skin. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many treatments are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the treatment take?","answer":"Contact us for more information about this treatment."},{"question":"What is the recovery time?","answer":"Contact us for more information about this treatment."},{"question":"How long does it take until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."},{"question":"How long will the results last?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  'a69f1a9f-9c9d-4162-b1c3-70df6192eee3',                          -- id
  'hifu',                -- slug
  'HIFU',               -- title
  'HIFU NON-SURGICAL FACELIFT',  -- subtitle
  'Just like cosmetic surgery, only not.',  -- summary
  '<p class="lead">Just like cosmetic surgery, only not.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $999 One session</td></tr>
<tr><td>Neck only $400 One session</td></tr>
<tr><td>Face & Neck $1200 One session</td></tr>
<tr><td>Face, Neck & Décolletage $1500 One session</td></tr>
<tr><td>Stomach $999 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $2398 $799 per session, Save $599</td></tr>
<tr><td>Neck only $960 $320 per session, Save $240</td></tr>
<tr><td>Face & Neck $2880 $960 per session, Save $720</td></tr>
<tr><td>Face, Neck & Décolletage $3600 $1200 per session, Save $900</td></tr>
<tr><td>Stomach $2398 $799 per session, Save $599</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  4,                     -- sort_order
  'HIFU | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Just like cosmetic surgery, only not. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many HIFU sessions are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"Is HIFU a natural treatment?","answer":"Contact us for more information about this treatment."},{"question":"Is this treatment suitable for everyone?","answer":"Contact us for more information about this treatment."},{"question":"How long does it take until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."},{"question":"Can I treat my whole body with this treatment?","answer":"Contact us for more information about this treatment."},{"question":"Can I combine other treatments with this?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  'da9490ed-a38d-4e73-a070-218e17a944ea',                          -- id
  'hydrodermabrasion',                -- slug
  'Hydrodermabrasion',               -- title
  'De-stress, De-grease and Detox.',  -- subtitle
  'Hydrated, happy and healthy skin.',  -- summary
  '<p class="lead">Hydrated, happy and healthy skin.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $120 One session</td></tr>
<tr><td>Face & Neck $180 One session</td></tr>
<tr><td>Face, Neck & Décolletage $240 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $288 $96 per session, Save $72</td></tr>
<tr><td>Face & Neck $432 $144 per session, Save $108</td></tr>
<tr><td>Face, Neck & Décolletage $576 $192 per session, Save $144</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  5,                     -- sort_order
  'Hydrodermabrasion | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Hydrated, happy and healthy skin. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many treatments are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the treatment take?","answer":"Contact us for more information about this treatment."},{"question":"How long is the recovery?","answer":"Contact us for more information about this treatment."},{"question":"How long does it take until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."},{"question":"Is this treatment right for me?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  'fa6fbf9a-47fb-4ba2-a5a2-bfe14c3bbccd',                          -- id
  'laser-rejuvenation',                -- slug
  'Laser Rejuvenation',               -- title
  'YAG LASER FOR REJUVENATION WAVELENGTH OF 1064 NM',  -- subtitle
  'Unleash the natural beauty from within.',  -- summary
  '<p class="lead">Unleash the natural beauty from within.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face $170 One session</td></tr>
<tr><td>Face & Neck $255 One session</td></tr>
<tr><td>Face, Neck & Décolletage $340 One session</td></tr>
<tr><td>Body From $170 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Face $816 $136 per session, Save $204</td></tr>
<tr><td>Face & Neck $1224 $204 per session, Save $306</td></tr>
<tr><td>Face, Neck & Décolletage $1632 $272 per session, Save $408</td></tr>
<tr><td>Body $816 $136 per session, Save $204</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  6,                     -- sort_order
  'Laser Rejuvenation | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Unleash the natural beauty from within. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"Is this treatment suitable for everyone?","answer":"Contact us for more information about this treatment."},{"question":"How long does it take until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."},{"question":"Is there any downtime?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  '656b5106-5056-4e0b-b3db-8e606c05afd1',                          -- id
  'medi-aesthetic-peels',                -- slug
  'Medi-Aesthetic Peels',               -- title
  'MEDI-AESTHETIC POWER PEELS',  -- subtitle
  'Peel away the years.',  -- summary
  '<p class="lead">Peel away the years.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Vitamin A - Face only $120 One session</td></tr>
<tr><td>Vitamin A - Face & Neck $150 One session</td></tr>
<tr><td>Vitamin A - Face, Neck & Décolletage $180 One session</td></tr>
<tr><td>Vitamin A - Back From $120 One session</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face only $190 One session</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face & Neck $220 One session</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face, Neck & Décolletage $250 One session</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Back From $190 One session</td></tr>
<tr><td>Tretinoin - Face only $160 One session</td></tr>
<tr><td>Tretinoin - Face & Neck $240 One session</td></tr>
<tr><td>Tretinoin - Face, Neck & Décolletage $320 One session</td></tr>
<tr><td>Tretinoin - Back From $160 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Vitamin A - Face only $288 $96 per session, Save $72</td></tr>
<tr><td>Vitamin A - Face & Neck $360 $120 per session, Save $90</td></tr>
<tr><td>Vitamin A - Face, Neck & Décolletage $432 $144 per session, Save $108</td></tr>
<tr><td>Vitamin A - Back From $288 From $96 per session, Save from $72</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face only $456 $152 per session, Save $114</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face & Neck $528 $176 per session, Save $132</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Face, Neck & Décolletage $600 $200 per session, Save $150</td></tr>
<tr><td>TCA 15% or Berry Pigment Control - Back From $456 From $152 per session, Save from $114</td></tr>
<tr><td>Tretinoin - Face only $384 $128 per session, Save $96</td></tr>
<tr><td>Tretinoin - Face & Neck $576 $192 per session, Save $144</td></tr>
<tr><td>Tretinoin - Face, Neck & Décolletage $768 $256 per session, Save $192</td></tr>
<tr><td>Tretinoin - Back From $384 From $128 per session, Save from $96</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  7,                     -- sort_order
  'Medi-Aesthetic Peels | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Peel away the years. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the treatment take?","answer":"Contact us for more information about this treatment."},{"question":"Is this treatment suitable for everyone?","answer":"Contact us for more information about this treatment."},{"question":"How long does it take until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."},{"question":"Can I use several peels and treatments at the same time?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  '7ad1c935-53a1-49ca-8f4f-4c93d6d525af',                          -- id
  'microdermabrasion',                -- slug
  'Microdermabrasion',               -- title
  'Don''t change it – revive it.',  -- subtitle
  'Say hello to the real you.',  -- summary
  '<p class="lead">Say hello to the real you.</p>

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
<tr><td>Face $60 One session</td></tr>
<tr><td>Face & Neck $90 One session</td></tr>
<tr><td>Face, Neck & Décolletage $120 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face $144 $48 per session, Save $36</td></tr>
<tr><td>Face & Neck $216 $72 per session, Save $54</td></tr>
<tr><td>Face, Neck & Décolletage $288 $96 per session, Save $72</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  8,                     -- sort_order
  'Microdermabrasion | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Say hello to the real you. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions will I need?","answer":"Contact us for more information about this treatment."},{"question":"How long until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"How long will the results last?","answer":"Contact us for more information about this treatment."},{"question":"Is there any  downtime?","answer":"Contact us for more information about this treatment."},{"question":"Is it suitable for everyone?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  'b14e5832-3fe2-4f2a-92f5-26d13eb7bc4b',                          -- id
  'micro-needling',                -- slug
  'Micro Needling',               -- title
  'Regain a smoother, healthier and younger complexion.',  -- subtitle
  'Turn back the clock',  -- summary
  '<p class="lead">Turn back the clock</p>

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
<tr><td>Face only $190 One session</td></tr>
<tr><td>Face & Neck $210 One session</td></tr>
<tr><td>Face, Neck & Décolletage $230 One session</td></tr>
<tr><td>Stretch marks From $190 One session</td></tr>
<tr><td>Add Tretinoin peel From $60 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $456 $152 per session, Save $114</td></tr>
<tr><td>Face & Neck $504 $168 per session, Save $126</td></tr>
<tr><td>Face, Neck & Décolletage $552 $184 per session, Save $138</td></tr>
<tr><td>Stretch marks From $456 From $152 per session, Save from $114</td></tr>
<tr><td>Add Tretinoin peel From $144 From $48 per session, Save from $36</td></tr>
</tbody>
</table>

<h2>Frequently asked questions</h2>
<ul>
<li><strong>How many treatments are recommended?</strong></li>
<li><strong>How long does the treatment take?</strong></li>
<li><strong>How long does it take until I can see the results?</strong></li>
<li><strong>Is the treatment painful?</strong></li>
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  9,                     -- sort_order
  'Micro Needling | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Turn back the clock Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many treatments are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the treatment take?","answer":"Contact us for more information about this treatment."},{"question":"How long does it take until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  'bf959b79-aba1-4d8a-8320-9c7d5ad005fc',                          -- id
  'radiofrequency',                -- slug
  'Radiofrequency',               -- title
  'Kick signs of aging to the curb.',  -- subtitle
  'Reawaken your youth.',  -- summary
  '<p class="lead">Reawaken your youth.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $90 One session</td></tr>
<tr><td>Neck only $90 One session</td></tr>
<tr><td>Face & Neck $135 One session</td></tr>
<tr><td>Face, Neck & Décolletage $180 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Face only $432 $72 per session, Save $108</td></tr>
<tr><td>Neck only $432 $72 per session, Save $108</td></tr>
<tr><td>Face & Neck $648 $108 per session, Save $162</td></tr>
<tr><td>Face, Neck & Décolletage $864 $144 per session, Save $216</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  10,                     -- sort_order
  'Radiofrequency | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Reawaken your youth. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions will I need?","answer":"Contact us for more information about this treatment."},{"question":"How long until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"How long will the results last?","answer":"Contact us for more information about this treatment."},{"question":"Is there any downtime?","answer":"Contact us for more information about this treatment."},{"question":"Is it suitable for everyone?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  'f3f3c79f-8ab1-450b-96fe-f2d0b95347f2',                          -- id
  'tattoo-removal-with-saline-solution',                -- slug
  'Tattoo Removal with Saline Solution',               -- title
  'Embrace new beginnings in a natural way',  -- subtitle
  'Time to wash away the past',  -- summary
  '<p class="lead">Time to wash away the past</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Eyebrow $150</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  11,                     -- sort_order
  'Tattoo Removal with Saline Solution | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Time to wash away the past Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"Is this treatment suitable for everyone?","answer":"Contact us for more information about this treatment."},{"question":"How long does it take until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."},{"question":"Is there any downtime?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  '235b9894-3944-4c50-8d8e-2eeac44ad061',                          -- id
  'zena-algae-peel',                -- slug
  'Zena Algae Peel',               -- title
  'Nature''s solution for beautiful skin.',  -- subtitle
  'Let nature transform you.',  -- summary
  '<p class="lead">Let nature transform you.</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Face only $250 One session</td></tr>
<tr><td>Face & Neck $375 One session</td></tr>
<tr><td>Face, Neck & Décolletage $500 One session</td></tr>
<tr><td>Back From $250 One session</td></tr>
</tbody>
</table>

<h3>Pack of 3</h3>
<table>
<tbody>
<tr><td>Face only $600 $200 per session, Save $150</td></tr>
<tr><td>Face & Neck $900 $300 per session, Save $225</td></tr>
<tr><td>Face, Neck & Décolletage $1200 $400 per session, Save $300</td></tr>
<tr><td>Back $600 From $200 per session, Save from $150</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'face',                    -- category
  'published',                      -- status
  12,                     -- sort_order
  'Zena Algae Peel | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Let nature transform you. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions will I need?","answer":"Contact us for more information about this treatment."},{"question":"How long until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"How long will the results last?","answer":"Contact us for more information about this treatment."},{"question":"Is there any downtime?","answer":"Contact us for more information about this treatment."},{"question":"Is it suitable for everyone?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  'c6de8d24-ab35-40d4-a273-6fd96c8682b3',                          -- id
  'ems-for-muscle-gain',                -- slug
  'EMS for Muscle Gain',               -- title
  'The results may shock you.',  -- subtitle
  'Take your body to the next level.',  -- summary
  '<p class="lead">Take your body to the next level.</p>

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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'body',                    -- category
  'published',                      -- status
  13,                     -- sort_order
  'EMS for Muscle Gain | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Take your body to the next level. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions will I need?","answer":"Contact us for more information about this treatment."},{"question":"How long until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"How long will the results last?","answer":"Contact us for more information about this treatment."},{"question":"Is there any downtime?","answer":"Contact us for more information about this treatment."},{"question":"Is this treatment suitable for everyone?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  '8a7a2b52-8ffb-4275-9fcc-7d4be55ea046',                          -- id
  'ems-for-pelvic-floor-strengthening',                -- slug
  'EMS for Pelvic Floor Strengthening',               -- title
  'Tighten up where it counts.',  -- subtitle
  'Regain control of the things that matter.',  -- summary
  '<p class="lead">Regain control of the things that matter.</p>

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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'body',                    -- category
  'published',                      -- status
  14,                     -- sort_order
  'EMS for Pelvic Floor Strengthening | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Regain control of the things that matter. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions do I need?","answer":"Contact us for more information about this treatment."},{"question":"How long until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"How long will the results last?","answer":"Contact us for more information about this treatment."},{"question":"Is there any downtime?","answer":"Contact us for more information about this treatment."},{"question":"Is this treatment suitable for everyone?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  '975ec979-39e2-47bc-9f8f-8fe04add3f90',                          -- id
  'fat-cavitation',                -- slug
  'Fat Cavitation',               -- title
  'Let go of what no longer serves you.',  -- subtitle
  'Get the body shape of your dreams.',  -- summary
  '<p class="lead">Get the body shape of your dreams.</p>

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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'body',                    -- category
  'published',                      -- status
  15,                     -- sort_order
  'Fat Cavitation | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Get the body shape of your dreams. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions will I need?","answer":"Contact us for more information about this treatment."},{"question":"How long until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"How long will the results last?","answer":"Contact us for more information about this treatment."},{"question":"Is there any downtime?","answer":"Contact us for more information about this treatment."},{"question":"Is it suitable for everyone?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  '29dbb73d-8a1b-4eaa-8ce9-cf33e22742b2',                          -- id
  'laser-for-nail-fungus',                -- slug
  'Laser for Nail Fungus',               -- title
  'Flawless nail health at your fingertips - and toes!',  -- subtitle
  'Put your best foot forward.',  -- summary
  '<p class="lead">Put your best foot forward.</p>

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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'body',                    -- category
  'published',                      -- status
  16,                     -- sort_order
  'Laser for Nail Fungus | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Put your best foot forward. Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions will I need?","answer":"Contact us for more information about this treatment."},{"question":"How long does the session take?","answer":"Contact us for more information about this treatment."},{"question":"How long will the results last?","answer":"Contact us for more information about this treatment."},{"question":"Is there any downtime?","answer":"Contact us for more information about this treatment."},{"question":"Is it suitable for everyone?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  '0c08fb88-71b8-4763-869e-2f2c5e108a13',                          -- id
  'kumashape',                -- slug
  'Kumashape',               -- title
  'Your body is beautiful, so let''s bring out the best of it!',  -- subtitle
  'Sculpt the body of your dreams!',  -- summary
  '<p class="lead">Sculpt the body of your dreams!</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Saddle Bags $100 One session</td></tr>
<tr><td>Love handles (aka muffin tops) $100 One session</td></tr>
<tr><td>Butt $100 One session</td></tr>
<tr><td>Stomach $140 One session</td></tr>
<tr><td>Legs front (thighs only) $140 One session</td></tr>
<tr><td>Legs back (thighs only) $140 One session</td></tr>
</tbody>
</table>

<h3>Pack of 6</h3>
<table>
<tbody>
<tr><td>Saddle Bags $480 $80 per session, Save $120</td></tr>
<tr><td>Love handles (aka muffin tops) $480 $80 per session, Save $120</td></tr>
<tr><td>Butt $480 $80 per session, Save $120</td></tr>
<tr><td>Stomach $672 $112 per session, Save $168</td></tr>
<tr><td>Legs front (thighs only) $672 $112 per session, Save $168</td></tr>
<tr><td>Legs back (thighs only) $672 $112 per session, Save $168</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'body',                    -- category
  'published',                      -- status
  17,                     -- sort_order
  'Kumashape | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Sculpt the body of your dreams! Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the treatment take?","answer":"Contact us for more information about this treatment."},{"question":"How long will the results last?","answer":"Contact us for more information about this treatment."},{"question":"How long does it take until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."},{"question":"What is the recovery time for Kumashape?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
),
(
  'ec614bfb-ee3c-40f6-a636-f801d67e79e3',                          -- id
  'tattoo-removal',                -- slug
  'Tattoo Removal',               -- title
  'No regrets, just fresh beginnings!',  -- subtitle
  'Reveal the real you',  -- summary
  '<p class="lead">Reveal the real you</p>

<h2>Pricing</h2>

<h3>Single sessions</h3>
<table>
<tbody>
<tr><td>Eyebrow cosmetic tattoo $120</td></tr>
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
</ul>',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  'body',                    -- category
  'published',                      -- status
  18,                     -- sort_order
  'Tattoo Removal | Naturally Beautiful Skin Rejuvenation',            -- seo_title
  'Reveal the real you Treatment available in Dee Why, Northern Beaches, Sydney.',             -- seo_description
  '[{"question":"How many sessions are recommended?","answer":"Contact us for more information about this treatment."},{"question":"How long does the treatment take?","answer":"Contact us for more information about this treatment."},{"question":"How long do I need to wait between sessions?","answer":"Contact us for more information about this treatment."},{"question":"How long does it take until I can see the results?","answer":"Contact us for more information about this treatment."},{"question":"Is the treatment painful?","answer":"Contact us for more information about this treatment."},{"question":"Is this treatment suitable for everyone?","answer":"Contact us for more information about this treatment."}]'::jsonb,  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
);

-- Verify
SELECT slug, title, category, status FROM treatments ORDER BY sort_order;
