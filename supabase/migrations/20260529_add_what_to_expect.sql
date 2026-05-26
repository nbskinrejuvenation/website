-- Add what_to_expect column to treatments
-- Stores an array of outcome/benefit strings shown in the "What To Expect" section
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS what_to_expect jsonb;

-- ── Carbon Peel ──────────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Instantly brighter, clearer skin","Reduced pore size","Smoother skin texture","Reduced oiliness and shine","Diminished acne and breakouts","More even skin tone","Reduced pigmentation","Gentle exfoliation with zero downtime","Stimulates natural collagen production"]'::jsonb WHERE slug = 'carbon-peel';

-- ── Fibroblast Plasma ────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Smooths and tightens under-eye area","Tightens and flattens stomach, jowls and neck","Decreases nose size","Raises droopy eyelids","Lifts sagging skin","Reduced scarring","Diminished lines and wrinkles","Instantly firmer, plumper skin","Sculpts the neck, eyes and face"]'::jsonb WHERE slug = 'fibroblast-plasma';

-- ── Fractional RF ────────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Firmer, tighter skin","Reduced fine lines and wrinkles","Improved skin texture and tone","Stimulated collagen production","Minimised pore size","Reduced stretch marks","Lifted and rejuvenated appearance","Plumper, more youthful complexion","Long-lasting results"]'::jsonb WHERE slug = 'fractional-rf';

-- ── HIFU ─────────────────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Non-surgical face lift results","Tightened and lifted skin","Reduced jowls and sagging","Sharper jawline definition","Lifted brow and eye area","Improved skin laxity on the neck","Stimulated deep collagen production","Natural-looking, gradual results","No downtime or surgery required"]'::jsonb WHERE slug = 'hifu';

-- ── Hydrodermabrasion ────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Deep pore cleansing","Intensely hydrated skin","Reduced blackheads and congestion","Smoother, softer texture","Brighter, more radiant complexion","Reduced fine lines","Balanced oil production","Instant visible results","Suitable for all skin types"]'::jsonb WHERE slug = 'hydrodermabrasion';

-- ── Laser Rejuvenation ───────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Reduced pigmentation and sun spots","Improved skin tone and clarity","Stimulated collagen production","Reduced fine lines and wrinkles","Tighter, firmer skin","Diminished vascular lesions","Brighter, more even complexion","Minimal downtime","Progressive results over time"]'::jsonb WHERE slug = 'laser-rejuvenation';

-- ── Medi-Aesthetic Peels ─────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Reduced hyperpigmentation","Smoother, more refined skin texture","Diminished acne and acne scarring","Reduced fine lines and wrinkles","Brightened and even skin tone","Unclogged and minimised pores","Renewed cell turnover","Fresh, glowing complexion","Customised to your skin type"]'::jsonb WHERE slug = 'medi-aesthetic-peels';

-- ── Microdermabrasion ────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Polished, smoother skin texture","Reduced age spots and pigmentation","Diminished fine lines","Reduced acne scarring","Brightened dull skin","Minimised pore size","Improved skincare product absorption","No downtime required","Instant visible improvement"]'::jsonb WHERE slug = 'microdermabrasion';

-- ── Micro Needling ───────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Stimulated collagen and elastin","Reduced acne scarring","Smoothed stretch marks","Diminished fine lines and wrinkles","Reduced skin pigmentation","Minimised enlarged pores","Firmer, more youthful skin","Improved overall skin texture","Natural healing process activated"]'::jsonb WHERE slug = 'micro-needling';

-- ── Radiofrequency ───────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Tightened and firmed skin","Reduced face and neck sagging","Stimulated collagen production","Lifted jawline and cheeks","Reduced fine lines","Improved skin elasticity","Contoured facial definition","No surgery or downtime","Progressive, long-lasting results"]'::jsonb WHERE slug = 'radiofrequency';

-- ── Tattoo Removal with Saline Solution ──────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Gradual, safe tattoo fading","Works on all ink colours","Suitable for cosmetic tattoos","Effective eyebrow tattoo removal","Minimal scarring risk","Natural saline solution process","Gentle on surrounding skin","Progressive results per session","No harsh chemicals required"]'::jsonb WHERE slug = 'tattoo-removal-with-saline-solution';

-- ── Zena Algae Peel ──────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Deep hydration and nourishment","Reduced pigmentation and sun damage","Smoother, revitalised skin texture","Tightened and firmed appearance","Natural algae-powered rejuvenation","Brightened and even complexion","Reduced fine lines","Suitable for sensitive skin","Gentle with minimal downtime"]'::jsonb WHERE slug = 'zena-algae-peel';

-- ── EMS for Muscle Gain ──────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Stronger, more defined muscles","Improved muscle tone and firmness","Enhanced athletic performance","Reduced body fat percentage","Better posture and core strength","Equivalent to thousands of contractions","Targeted area sculpting","No strenuous exercise required","Visible results from first sessions"]'::jsonb WHERE slug = 'ems-for-muscle-gain';

-- ── EMS for Pelvic Floor Strengthening ──────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Strengthened pelvic floor muscles","Reduced urinary incontinence","Improved bladder control","Enhanced intimacy and sensation","Non-invasive, fully clothed treatment","Equivalent to 11,000 kegel exercises","Suitable after childbirth","Improved core stability","Noticeable results within weeks"]'::jsonb WHERE slug = 'ems-for-pelvic-floor-strengthening';

-- ── Fat Cavitation ───────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Targeted fat cell reduction","Slimmer, more contoured body shape","Reduced circumference measurements","Smoother skin texture","Improved body confidence","Non-surgical alternative to liposuction","No needles or incisions","Treats stubborn fat deposits","Progressive results over sessions"]'::jsonb WHERE slug = 'fat-cavitation';

-- ── Laser for Nail Fungus ────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Eliminated nail fungus at the root","Healthier, clearer nail regrowth","Reduced nail discolouration","Improved nail thickness and texture","Pain-free treatment experience","No topical creams required","Suitable for fingernails and toenails","High success rate","Minimal sessions required"]'::jsonb WHERE slug = 'laser-for-nail-fungus';

-- ── Kumashape ────────────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Contoured and sculpted body shape","Reduced stubborn fat pockets","Improved skin firmness and tone","Smoother skin texture","Reduced cellulite appearance","Non-invasive body reshaping","No downtime required","Visible improvements from first session","Long-lasting contouring results"]'::jsonb WHERE slug = 'kumashape';

-- ── Tattoo Removal ───────────────────────────────────────────────────────────
UPDATE treatments SET what_to_expect = '["Effective ink fading and removal","Works on all skin tones and colours","Treats all tattoo sizes","Minimal scarring","Safe for professional and amateur tattoos","Gradual, progressive results","Short treatment sessions","No surgery required","Boost in skin confidence"]'::jsonb WHERE slug = 'tattoo-removal';
