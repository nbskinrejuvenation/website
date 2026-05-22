# Nanobanana image prompts

Replace placeholders by uploading images and setting `hero_image` on each row in Supabase (`treatments` table), or by saving files under `public/images/treatments/` and using that path as the URL.

**Style suffix — append to every prompt:**

> Editorial beauty photography, soft natural light, luxury spa aesthetic, warm neutral and soft rose tones, photorealistic, calm premium mood, no text, no logo

**Aspect ratios**

| Use | Ratio | Notes |
|-----|-------|--------|
| Homepage hero | 16:9 | `hero-home.png` — wired in `app/page.tsx` |
| Treatment tiles & service heroes | 4:3 | Cards use `aspect-[4/3]`; centre subject for crop |

**File naming**

Save each treatment image as:

```text
public/images/treatments/{slug}.png
```

The app auto-detects files in that folder (`.png`, `.jpg`, `.jpeg`, `.webp`) when `hero_image` is empty in Supabase — no SQL required for local preview. Optional: set `hero_image` in Supabase if you host images in Storage instead.

**Homepage grid** shows the first **8** treatments by `sort_order` (currently all face treatments below).

---

## Homepage hero (16:9)

Homepage uses `public/images/hero-home.png` (wired in `app/page.tsx`).

<details>
<summary>Prompt (already generated)</summary>

```
Editorial beauty photography, woman aged 45-50 with healthy glowing skin,
soft window light from the left, cream and sand linen backdrop, luxury
medical-aesthetic clinic mood, shallow depth of field, warm neutral colour grade,
calm premium spa feeling, Northern Beaches Australia, no text no logo,
photorealistic 16:9 horizontal, subject slightly off-centre right,
negative space on left for headline
```

</details>

---

## Treatment tiles (4:3) — all services

Each block is ready to paste into Nanobanana. Add the style suffix above if your tool does not keep it in a preset.

### Face treatments

#### 1. Carbon Peel · `carbon-peel` · homepage tile

```
Close-up editorial beauty shot, woman's face with thin even black carbon
mask layer, soft rose-tinted clinic light, luxury medical-aesthetic setting,
cream linen drape, shallow depth of field, glowing purified skin mood,
photorealistic 4:3, subject centred, no devices visible, no text no logo
```

#### 2. Fibroblast Plasma · `fibroblast-plasma` · homepage tile

```
Elegant fibroblast plasma pen resting on white marble tray beside folded
cream towel, soft window light, rose and sand tones, luxury clinic still life,
shallow depth of field, premium medical-aesthetic mood, photorealistic 4:3,
no hands on face, no text no logo
```

#### 3. Fractional RF · `fractional-rf` · homepage tile

```
Fractional RF microneedling handset on clean treatment trolley, soft natural
light, warm neutral and rose colour grade, luxury spa clinic background softly
blurred, firmer skin renewal mood, photorealistic 4:3 product still life,
no text no logo
```

#### 4. HIFU · `hifu` · homepage tile

```
Profile of woman 45-50 with lifted jawline and smooth neck, soft side lighting,
cream backdrop, non-surgical facelift mood, calm confident expression,
luxury medical-aesthetic clinic, photorealistic 4:3 portrait, subject slightly
right of centre, negative space left, no devices, no text no logo
```

#### 5. Hydrodermabrasion · `hydrodermabrasion` · homepage tile

```
Fine hydrating mist over woman's cheek during hydrodermabrasion, dewy fresh skin,
soft rose-tinted light, hydro handset partially visible at edge of frame,
luxury clinic, shallow depth of field, photorealistic 4:3, calm hydrated mood,
no text no logo
```

#### 6. Laser Rejuvenation · `laser-rejuvenation` · homepage tile

```
Modern aesthetic laser handpiece beside serene woman with eyes closed on
treatment bed, protective eyewear nearby not worn, soft warm light, cream and
sand linens, rejuvenated radiant skin mood, photorealistic 4:3, luxury clinic,
no text no logo
```

#### 7. Medi-Aesthetic Peels · `medi-aesthetic-peels` · homepage tile

```
Glass bowl with amber peel solution, soft fan brush and cotton pads on marble
surface, rose and cream tones, luxury spa still life, chemical peel preparation
mood without showing application on face, photorealistic 4:3, no text no logo
```

#### 8. Microdermabrasion · `microdermabrasion` · homepage tile

```
Diamond-tip microdermabrasion wand over smooth woman's forehead, therapist hands
gloved and gentle, soft natural light, warm neutral palette, refreshed polished
skin mood, photorealistic 4:3, luxury clinic, no text no logo
```

#### 9. Micro Needling · `micro-needling`

```
Microneedling pen with fine serum droplets on rose-gold tray, macro texture of
healthy skin beside device, soft window light, collagen induction mood,
photorealistic 4:3 still life, luxury medical-aesthetic, no procedure blood,
no text no logo
```

#### 10. Radiofrequency · `radiofrequency`

```
Radiofrequency skin tightening handpiece on woman's lower cheek, warm golden
light, cream treatment cape, lifted youthful mood, photorealistic 4:3,
luxury clinic, hands professional and calm, no text no logo
```

#### 11. Tattoo Removal (Saline) · `tattoo-removal-with-saline-solution`

```
Minimalist still life, small glass saline solution vial and fine micro-cup
beside soft cotton gauze on marble, muted tattoo ink abstract in soft focus
background only, gentle renewal mood, rose and sand tones, photorealistic 4:3,
no graphic tattoo imagery, no text no logo
```

#### 12. Zena Algae Peel · `zena-algae-peel`

```
Bowl of deep green algae peel mask with natural botanical garnish, spatula on
cream linen, organic luxury spa mood, soft daylight, warm neutral and soft rose
accents, photorealistic 4:3 overhead still life, no text no logo
```

---

### Body treatments

#### 13. EMS for Muscle Gain · `ems-for-muscle-gain`

```
EMS muscle stimulation pads on woman's abdomen over white towel, athletic
wellness mood, soft side light, toned but natural body, luxury body clinic,
rose and cream tones, photorealistic 4:3, dignified and calm, no text no logo
```

#### 14. EMS for Pelvic Floor · `ems-for-pelvic-floor-strengthening`

```
Abstract wellness still life, modern EMS chair silhouette softly blurred,
folded cream towels and warm sand tones in foreground, pelvic health and
strength mood without explicit body focus, photorealistic 4:3, calm premium
spa, no text no logo
```

#### 15. Fat Cavitation · `fat-cavitation`

```
Ultrasound fat cavitation handpiece gliding over woman's side waist with
draped towel, soft warm light, body contouring mood, natural proportions,
luxury body treatment room, photorealistic 4:3, no before-after labels,
no text no logo
```

#### 16. Laser for Nail Fungus · `laser-for-nail-fungus`

```
Close-up of bare feet on white towel, modern nail laser device aimed at
toenails tastefully, clean pedicure-clinic mood, soft rose-tinted light,
healthy nails emerging, photorealistic 4:3, no fungus graphic detail,
no text no logo
```

#### 17. Kumashape · `kumashape`

```
Body sculpting vacuum-roller device on woman's thigh over cream drape, smooth
curves, contouring and firming mood, warm neutral light, luxury body clinic,
photorealistic 4:3, calm confident wellness, no text no logo
```

#### 18. Tattoo Removal · `tattoo-removal`

```
Q-switch laser tattoo removal handpiece beside woman's forearm with soft faded
ink suggestion only, protective eyewear on tray, cream linens, reveal fresh
skin mood, photorealistic 4:3, luxury clinic, no bold tattoo art, no text no logo
```

---

## After generation

1. Save files to `public/images/treatments/{slug}.png`.
2. In Supabase SQL Editor (one row per treatment):

```sql
UPDATE treatments
SET hero_image = '/images/treatments/carbon-peel.png'
WHERE slug = 'carbon-peel';
-- repeat for each slug
```

3. Revalidate cache: restart dev server or hit your revalidate webhook; production picks up on next deploy if images are in the repo, or immediately if URLs point to Supabase Storage.

**Tips**

- Keep faces and bodies natural (35–55, Northern Beaches clientele); avoid heavy filters or stock-photo smiles.
- Prefer implied treatment (devices, products, hands) over graphic clinical shots.
- If a prompt feels too literal, regenerate with more still-life and less skin contact.
