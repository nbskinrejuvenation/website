# Treatment page photography

## How a treatment page finds its photo

`resolveTreatmentHeroUrl` ([lib/images/treatment-hero.ts](../lib/images/treatment-hero.ts)):

1. the `hero_image` column on the `treatments` row, if set;
2. otherwise `public/images/treatments/{slug}.png|jpg|jpeg|webp`;
3. otherwise no photo, and `TreatmentHero` draws the `.hero-fallback` panel.

So **dropping a correctly named file into `public/images/treatments/` is the whole
job** — no code change, no migration. The filename must match the slug exactly.

## The 9 pages still on the fallback panel

All nine are the laser treatments added from the September price list. They render
a dark brand panel with the heading, price and CTA; nothing is broken, they just
have no photograph yet.

| File to add | Page |
|---|---|
| `laser-hair-removal-for-face.png` | Laser Hair Removal — Face |
| `laser-hair-removal-upper-body.png` | Laser Hair Removal — Upper Body |
| `laser-hair-removal-lower-body.png` | Laser Hair Removal — Lower Body |
| `laser-genesis.png` | Laser Genesis |
| `fractional-laser.png` | Fractional Laser |
| `laser-genesis-fractional-laser.png` | Laser Genesis + Fractional Laser |
| `pico-laser-pigmentation.png` | Pico Laser for Pigmentation |
| `laser-for-pigmentation.png` | Laser for Pigmentation |
| `laser-for-vascular-lesions.png` | Laser for Vascular Lesions |

Nothing was substituted in from the existing library on purpose: the only
untexted laser photo on hand is `laser-rejuvenation.png`, and repeating one image
across nine pages would be obvious on the `/services` grid, where the cards sit
side by side.

### What each shot needs

The hero is `min-h-[60vh]`, full-bleed, with the heading and buttons over the
**bottom left** under a dark bottom-up gradient. So:

| Requirement | Why |
|---|---|
| **Landscape**, min 1600px wide | It renders full-bleed and gets cropped per viewport |
| **Subject in the upper or right portion** | The bottom left is covered by the gradient and text |
| **No text or logos in the frame** | See the two problems below |
| Nothing important in the bottom third | It sits behind the headline |

Easiest honest version: the clinic's own device and treatment room, client's face
out of frame (which also avoids needing a likeness release). One good photo of
the laser handpiece in use covers the three hair-removal pages if shot on three
different areas.

## Two existing images to replace

1. **`laser-for-nail-fungus.png`** — a card in the frame carries **another
   clinic's logo and name** ("Medical Wellness Clinic", "AFTER LASER TREATMENT").
   This is live on `/services/laser-for-nail-fungus` now and should be replaced
   rather than left up.
2. **`fractional-rf.png`** — has "RADIANT RENEWAL: RF MICRONEEDLING RESULTS"
   burned into the bottom right. Harmless but it reads as stock, and it pins the
   image to one treatment name.

Both are stock from the original site crawl, as is the rest of the folder.
