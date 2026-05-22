# Content Inventory — nbskinrejuvenation.com.au

**Audit date:** 21 May 2026
**Audited by:** Claude (via Chrome extension)
**Pages crawled in depth:** Home, About, Specials, Contact, Carbon Peel (representative service template)
**Pages inventoried from navigation + template inference:** all 18 service pages

---

## Key findings before the table

1. **Site engine:** WordPress + Elementor, hosted with WP S3 offload. The Elementor "Theme Builder" uses reusable Sections: Main Header (post 18), Main Footer (post 34), Services grid (post 230), Testimonials (post 186), Contact Us CTA (post 339), Menu Popup (post 517). These map cleanly to React layout components + a `site_settings` / `sections` table in Supabase.
2. **Service taxonomy:** 18 distinct service slugs under `/services/`, surfaced via two top-nav menus (Face — 12 items, Body — 7 items). Fibroblast Plasma appears under both, so it needs a many-to-many relationship between services and categories, not a single `category` column.
3. **Service-page template is uniform:** Hero + tagline → Recommended For (condition list) → What To Expect (benefit list) → How It Works → Pre/Post Care → Prices (per-session + pack-of-3) → FAQ → Contact CTA. This is the single most important repeated structure — design the `services` schema around it.
4. **Prices are on-page and editable.** Carbon Peel shows 4 single-session prices ($140–$300) and 4 pack-of-3 prices ($336–$720). Pricing changes are the most likely "voice command" use case, so prices must be a first-class field, not free-text inside a description.
5. **Specials are static cards, not time-based.** Six evergreen offers (Free Consultation, Refer a Friend, 2 Friends 25% Off, Gift Voucher, Special of the Week → Instagram, 3-Session Packs). No real "this week's special" on the site — they defer to Instagram. Worth adding a true time-bound `specials` table so voice commands like *"add a special for May: 30% off micro needling"* actually work.
6. **Testimonials:** 2 on Home (Glaucia Huxley, Natalie Violandi), 2 on About (Stephanie Diartt, Fernanda Cordeiro). All include client name + treatment. No star rating. Schema should support name, treatment_id, quote, date_added, featured_on (array).
7. **Contact details appear in 4 places:** header phone link, footer block, Contact page, every-page CTA block. Must live in **one** `site_settings` row and be referenced everywhere — otherwise the editor will update one and forget the others.
8. **Founder/About page** has biographical content about Lilian (qualified Nutritionist + beauty therapist) plus 6 PDF certificates hosted on S3. These are SEO-relevant trust signals — preserve them but probably no need for voice editing.
9. **SEO observations:**
   - Page titles follow `{Page name} – Naturally Beautiful Skin Rejuvenation`
   - URL slugs are clean (`/services/carbon-peel/`) — preserve these in the rebuild for SEO continuity, with 301s if any change
   - H1 on each service page = the service name; tagline is an H2-equivalent
   - No blog detected; adding one would be a low-cost SEO win
   - Footer copyright still says "© 2018" — stale, surface as an editable field
   - Newsletter form appears in footer but its backend (Mailchimp? Sendinblue?) isn't visible from the front-end
10. **Security note worth raising separately:** the browser session I audited from is logged in as the WordPress admin user `riceandbeans`. Whoever is doing this discovery is currently authenticated to the production site. Recommend signing out before sharing screen recordings of this audit.

---

## Editing scope (default applied — adjust if needed)

| Tier | What | Editable by Claude? |
|---|---|---|
| **Locked (structure)** | Page templates, navigation menus, URL slugs, taxonomy (Face/Body categories), schema | No |
| **Editable (content)** | Hero copy, service descriptions, prices, pack pricing, FAQ Q&A, testimonials, specials, contact details, social links, founder bio | Yes |
| **Editable (media)** | Hero images, service images, gallery, founder photo (with safeguards: filename + alt text required, max file size, no replacing logo) | Yes |
| **Restricted** | Footer legal text, copyright year, certificate PDFs, form-submission backend config, SEO meta when it conflicts with title-tag patterns | Yes but with confirmation prompts |

---

## Content inventory table

| # | Content type | Page / title | URL | Current purpose | Editable by Claude? | Suggested Supabase table | Notes |
|---|---|---|---|---|---|---|---|
| **MAIN PAGES** |
| 1 | Page | Home | `/` | Brand entry, mission statement, treatment grid, testimonials, contact CTA | Yes (copy + hero CTA target) | `pages` (slug=`home`) with related `page_sections` | Hero copy: "OUR MISSION IS TO / Enhance your natural beauty" + "Why us / We see your natural beauty" 3-paragraph intro |
| 2 | Page | About | `/about/` | Founder story (Lilian), qualifications, holistic-approach pitch | Yes (bio + intro paragraphs) | `pages` (slug=`about`) + `founder_profile` (1 row) | 6 cert PDFs (GentleMax Laser, Laser Safety, Skin Penetration, Laser Hair Removal, Laser & IPL) live on S3 — store as `certificates` table or a JSON column |
| 3 | Page | Specials | `/specials/` | Lists 6 evergreen offers + intro "Our Gift To You" | Yes | `pages` (slug=`specials`) + `specials` table | Headline + intro paragraph editable; individual offer cards in `specials` table |
| 4 | Page | Contact | `/contact-us/` | Phone, email, address, parking info, contact form, embedded map | Yes (contact details + parking text) | `site_settings` + `pages` (slug=`contact`) | Form submissions belong in a separate `contact_submissions` table; the embedded map address comes from `site_settings.address` |
| **FACE TREATMENTS (12)** — all follow the same template observed on Carbon Peel |
| 5 | Service (Face) | Carbon Peel | `/services/carbon-peel/` | "Hollywood Peel" — exfoliation, pigmentation, acne | Yes | `services` (slug=`carbon-peel`, categories=[`face`]) | Tagline: "Gently exfoliates, clears and purifies your skin." Prices: Face $140 / F+Neck $210 / F+N+Décolletage $280 / Back $300. Packs of 3: $336/$504/$672/$720 |
| 6 | Service (Face) | Fibroblast Plasma | `/services/fibroblast-plasma/` | Non-surgical face lifting | Yes | `services` (slug=`fibroblast-plasma`, categories=[`face`,`body`]) | **Appears in BOTH Face and Body menus — proves you need many-to-many** |
| 7 | Service (Face) | Fractional RF | `/services/fractional-rf/` | Skin firming, plumping | Yes | `services` (slug=`fractional-rf`, categories=[`face`]) | Homepage tagline: "Reclaim a firmer, plumper, younger skin." |
| 8 | Service (Face) | HIFU | `/services/hifu/` | High-intensity focused ultrasound — non-surgical lift | Yes | `services` (slug=`hifu`, categories=[`face`]) | Homepage tagline: "Just like cosmetic surgery, only not." |
| 9 | Service (Face) | Hydrodermabrasion | `/services/hydrodermabrasion/` | Hydrating exfoliation | Yes | `services` (slug=`hydrodermabrasion`, categories=[`face`]) | Tagline: "Hydrated, happy and healthy skin." |
| 10 | Service (Face) | Laser Rejuvenation | `/services/laser-rejuvenation/` | Laser-based skin rejuvenation | Yes | `services` (slug=`laser-rejuvenation`, categories=[`face`]) | Not featured on homepage grid — confirms grid is curated, not auto-rendered |
| 11 | Service (Face) | Medi-Aesthetic Peels | `/services/medi-aesthetic-peels/` | Chemical peels | Yes | `services` (slug=`medi-aesthetic-peels`, categories=[`face`]) | Tagline: "Peel away the years" |
| 12 | Service (Face) | Microdermabrasion | `/services/microdermabrasion/` | Mechanical exfoliation | Yes | `services` (slug=`microdermabrasion`, categories=[`face`]) | Not featured on homepage |
| 13 | Service (Face) | Micro Needling | `/services/micro-needling/` | Collagen induction | Yes | `services` (slug=`micro-needling`, categories=[`face`]) | Tagline: "Turn back the clock" — also referenced in 2 testimonials |
| 14 | Service (Face) | Radiofrequency | `/services/radiofrequency/` | Skin tightening | Yes | `services` (slug=`radiofrequency`, categories=[`face`]) | Tagline: "Reawaken your youth." |
| 15 | Service (Face) | Tattoo Removal with Saline Solution | `/services/tattoo-removal-with-saline-solution/` | Saline-based tattoo/cosmetic-tattoo removal | Yes | `services` (slug=`tattoo-removal-with-saline-solution`, categories=[`face`]) | Distinct from laser Tattoo Removal — preserve both |
| 16 | Service (Face) | Zena Algae Peel | `/services/zena-algae-peel/` | Botanical resurfacing peel | Yes | `services` (slug=`zena-algae-peel`, categories=[`face`]) | Tagline: "Let nature transform you." |
| **BODY TREATMENTS (7)** |
| 17 | Service (Body) | EMS for Muscle Gain | `/services/ems-for-muscle-gain/` | Electromagnetic muscle stimulation | Yes | `services` (slug=`ems-for-muscle-gain`, categories=[`body`]) | Tagline: "Take your body to the next level." |
| 18 | Service (Body) | EMS for Pelvic Floor Strengthening | `/services/ems-for-pelvic-floor-strengthening/` | Pelvic-floor toning | Yes | `services` (slug=`ems-for-pelvic-floor-strengthening`, categories=[`body`]) | Tagline: "Regain control of the things that matter." |
| 19 | Service (Body) | Fat Cavitation | `/services/fat-cavitation/` | Ultrasonic fat reduction | Yes | `services` (slug=`fat-cavitation`, categories=[`body`]) | Tagline: "Get the body shape of your dreams." |
| 20 | Service (Body) | Fibroblast Plasma (Body) | `/services/fibroblast-plasma/` | Same URL as #6 — body applications | — (same record as #6) | `services` | **Confirms many-to-many: same page, two menu locations** |
| 21 | Service (Body) | Laser for Nail Fungus | `/services/laser-for-nail-fungus/` | Onychomycosis laser treatment | Yes | `services` (slug=`laser-for-nail-fungus`, categories=[`body`]) | Tagline: "Put your best foot forward." |
| 22 | Service (Body) | Kumashape | `/services/kumashape/` | Body contouring / cellulite | Yes | `services` (slug=`kumashape`, categories=[`body`]) | Tagline: "Sculpt the body of your dreams." — 2 testimonials reference it |
| 23 | Service (Body) | Tattoo Removal | `/services/tattoo-removal/` | Laser tattoo removal | Yes | `services` (slug=`tattoo-removal`, categories=[`body`]) | Tagline: "Reveal the real you." |
| **SPECIALS / PROMOTIONS** |
| 24 | Special | Free Consultation | `/specials/` (card) | 30-min free assessment | Yes | `specials` (type=`evergreen`) | Card title + body + CTA target |
| 25 | Special | Refer a Friend | `/specials/` (card) | $50 credit per friend referred | Yes | `specials` (type=`evergreen`) | CTA link is missing/broken — flag for fix |
| 26 | Special | 2 Friends Get 25% Off | `/specials/` (card) | 25% discount for any 2 new clients booking together | Yes | `specials` (type=`evergreen`) | New-client only — note in fine print |
| 27 | Special | Gift Voucher | `/specials/` (card) | Vouchers in any amount | Yes | `specials` (type=`evergreen`) | Worth turning into an actual purchase flow long-term |
| 28 | Special | Special of the Week | `/specials/` (card) | Defers to Instagram | Yes | `specials` (type=`evergreen`) | **Replace with real `time_bound_specials` records driven by voice commands** |
| 29 | Special | 3-Session Packs | `/specials/` (card) + every service page | Pack pricing | Yes (per service) | derived from `service_pricing` | Already encoded in service pricing — surface as a global pitch card too |
| **TESTIMONIALS** |
| 30 | Testimonial | Glaucia Huxley | Home, Testimonials section | Micro needling + Fractional RF | Yes | `testimonials` | featured_on: [`home`] |
| 31 | Testimonial | Natalie Violandi | Home, Testimonials section | Micro needling — acne scarring | Yes | `testimonials` | featured_on: [`home`] |
| 32 | Testimonial | Stephanie Diartt | About page | Kumashape — cellulite | Yes | `testimonials` | featured_on: [`about`] |
| 33 | Testimonial | Fernanda Cordeiro | About page | Kumashape — 2-session results | Yes | `testimonials` | featured_on: [`about`] |
| **CONTACT DETAILS** |
| 34 | Contact field | Phone | Header, footer, contact, every CTA block | 0404 203 800 (also WhatsApp + SMS) | Yes | `site_settings` (single row, key/value or columns) | Surfaces in 4+ locations — **must be single source of truth** |
| 35 | Contact field | Email | Contact page | hello@nbskinrejuvenation.com.au | Yes | `site_settings` | |
| 36 | Contact field | Address | Footer, Contact, every CTA block | 9 and 10 / 8-12 Pacific Parade, Dee Why NSW 2099 | Yes | `site_settings` | Used to render embedded map — store lat/lng too |
| 37 | Contact field | Parking note | Contact page only | "3-hour FREE parking at Dee Why Grand" | Yes | `site_settings` | |
| 38 | Contact field | Facebook URL | Header, footer | facebook.com/naturallybeautifulskinrejuvenation | Yes | `site_settings.social[]` | |
| 39 | Contact field | Instagram URL | Header, footer, Specials page | instagram.com/naturally_beautiful_skin_rejuv | Yes | `site_settings.social[]` | |
| 40 | Form | Contact form | `/contact-us/` | Name, email, treatment dropdown (Face/Body/Tattoo Removal), phone, message | Form fields **not** editable by Claude; submissions stored | `contact_submissions` | Voice-edit risk too high — lock the form. Allow editing of the dropdown options only, via a controlled list |
| 41 | Form | Newsletter signup | Footer (all pages) | Email-only capture | Lock fields | `newsletter_subscribers` or external (Mailchimp etc.) | Confirm which backend is in use before migrating |
| **CALLS TO ACTION (CTA)** |
| 42 | CTA (button) | "Book Free Consultation" — hero | Home hero | → /contact-us/ | Yes (label + target) | `page_sections` config | The primary site-wide CTA |
| 43 | CTA (button) | "Book a Free Consultation" — About | About page bottom | → /contact-us/ | Yes | `page_sections` config | |
| 44 | CTA (section) | "Book your free consultation" block | Repeated on: Home, About, Specials, every service page | Standard footer-of-content CTA before the real footer | Yes (copy) | `sections` (key=`contact_cta`) | Single Elementor Section (post 339) reused — model as one `sections` row referenced by many pages |
| 45 | CTA (button) | "BOOK NOW" — Specials cards | Specials page | → /contact-us/ or Instagram | Yes | inside `specials` record | |
| 46 | CTA (button) | "Book Now" — service pages | Each service page (×2: after How It Works, after Pre/Post Care) | → /contact-us/ | Yes | template-level setting | Same target everywhere — keep as global default |
| 47 | CTA (button) | "Contact Us" — footer CTA block | Footer of every page | → /contact-us/ | Yes | `sections` (key=`contact_cta`) | Part of section #44 |
| 48 | CTA (link) | "Follow us on Instagram" | Specials page | → Instagram | Yes (URL) | `site_settings.social[]` | |
| **REPEATED PAGE SECTIONS** |
| 49 | Section | Site header / nav | every page | Logo, primary menu, phone icon, menu toggle | No (structure) / Yes (menu labels) | `navigation_menus` + `site_settings` | Currently Elementor Section post 18 |
| 50 | Section | Site footer | every page | CTA, contact, newsletter, gallery thumbnails, copyright | Partial — copy + gallery yes, layout no | `sections` (key=`footer`) + `gallery_thumbnails` | Footer copyright "© 2018" is stale |
| 51 | Section | "Why us" / 4 value props | Home, About | ACCREDITED PROFESSIONALS / TOP OF THE LINE EQUIPMENT / HOLISTIC APPROACH / EXCEPTIONAL CUSTOMER SERVICE | Yes | `sections` (key=`value_props`) with rows | 4 fixed slots; copy editable |
| 52 | Section | "Our Treatments" grid (15 cards) | Home | Curated selection of services for the homepage grid | Yes (which services + order) | `homepage_featured_services` (ordered join table) | Currently NOT all 18 — Laser Rejuvenation, Microdermabrasion, Tattoo Removal with Saline, Medi-Aesthetic Peels (sometimes) excluded |
| 53 | Section | Testimonials carousel | Home, About | 2 testimonials each | Yes | `testimonials` filtered by `featured_on` | |
| 54 | Section | Contact CTA block | Home, About, Specials, every service page | "Book your free consultation" + Contact Us button | Yes (copy) | `sections` (key=`contact_cta`) | The most reused section on the site |
| 55 | Section | Pricing block | every service page | Per-session + Pack of 3 tiers | Yes | `service_pricing` (FK → services) | Multiple tiers per service — Carbon Peel has 4 tiers × 2 modes = 8 rows |
| 56 | Section | FAQ accordion | every service page | 5–7 Q&A per service | Yes | `service_faqs` (FK → services) | |
| 57 | Section | "Recommended For" condition list | every service page | Bulleted conditions the treatment addresses | Yes | `services.recommended_for` (text[]) | Note typos in current copy ("Unever skin tone", "bemishes") — flag for editor review |
| 58 | Section | "What To Expect" benefits | every service page | 9 benefits in 3 columns | Yes | `services.benefits` (text[]) | |
| 59 | Section | Hero with tagline | every service page | Service name + tagline + intro + hero image | Yes | `services.{name,tagline,intro,hero_image}` | |
| 60 | Popup | Mobile menu popup | mobile only | Slide-in nav | No | derived from `navigation_menus` | Elementor Popup post 517 |
| **IMAGES / MEDIA** |
| 61 | Image | Homepage hero | Home | Brand-defining hero shot | Yes (with alt text rules) | `media_library` + `pages.hero_image_id` | |
| 62 | Image | "We see your natural beauty" portrait (ben-scott-unsplash) | Home, About | Why-us section illustration | Yes | `media_library` | Currently a stock Unsplash photo — likely worth replacing with real clinic photography |
| 63 | Image | Specials hero (natalie-grainger-unsplash) | Home Specials section | Special-of-the-week illustration | Yes | `media_library` | Stock photo |
| 64 | Image | Service hero images | each service page | Hero for each treatment | Yes | `services.hero_image_id` | 18 needed — many currently appear to be templated placeholders ("FREE (4).png") |
| 65 | Image | Footer gallery (6 thumbnails) | Footer of every page | Decorative grid linking to full-size files | Yes (which images, alt text) | `gallery_thumbnails` (ordered) | All Unsplash stock — strong candidate for real before/after gallery rebuild |
| 66 | Image | Founder photo | About page | Lilian portrait | Yes | `founder_profile.photo_id` | Currently appears absent — flag as a "missing media" item |
| 67 | PDF | Founder certificates ×6 | About page | GentleMax Laser, Laser Safety, Skin Penetration, Laser Hair Removal, Laser & IPL, GentleMax Achievement | Yes (replace files, edit titles) | `certificates` (FK → `founder_profile`) | Hosted on `wp-s3-nbskinrejuvenation.s3.amazonaws.com` — migrate to Supabase Storage |
| 68 | Logo | Site logo | Header | Brand mark | Restricted (confirmation required) | `site_settings.logo_id` | High-risk to swap accidentally via voice |
| **SEO-RELEVANT** |
| 69 | SEO | Page title pattern | All pages | `{Page} – Naturally Beautiful Skin Rejuvenation` | Yes (per page) | `pages.seo_title`, `services.seo_title` | Preserve pattern as a default; allow per-page override |
| 70 | SEO | URL slugs | All pages | Clean, kebab-case, SEO-friendly | No (locked) — would break SEO if changed | — | If a slug must change, generate a 301 redirect row in `redirects` table automatically |
| 71 | SEO | H1 on service pages | each service page | The service name | Yes | `services.name` | H1 is auto-derived from service name |
| 72 | SEO | Meta descriptions | Not visible on render — need to inspect `<head>` separately | Likely missing or default | Yes | `pages.seo_description`, `services.seo_description` | Recommend Claude generates a draft per page on-demand |
| 73 | SEO | Local SEO data | Footer / Contact | "Northern Beaches", "Dee Why" mentioned 8+ times | Yes (location keywords) | `site_settings.location_*` | Strong local-search signal — preserve in rebuild |
| 74 | SEO | OG / Twitter tags | Not verified | Likely Yoast-generated currently | Yes (per page) | `pages.og_*` fields | Worth auditing separately |
| 75 | SEO | Sitemap.xml | `/sitemap.xml` (likely Yoast) | Search engine discovery | No (auto-generate from Supabase) | derived | Generate from `pages` + `services` at build time |
| 76 | SEO | Blog | **None detected** | — | — | `blog_posts` (recommended to add) | Adding even a small blog (treatment guides, before/after stories) would help organic traffic significantly |

---

## Suggested Supabase tables (summary)

```
site_settings              -- single row: phone, email, address, lat, lng, parking_note, copyright, logo, social[]
pages                      -- home, about, specials, contact (+ future): seo_title, seo_description, hero, copy_blocks
sections                   -- reusable blocks: contact_cta, value_props, footer, etc.
page_sections              -- which section appears on which page, in what order
navigation_menus           -- header menu, footer menu, mobile menu
nav_items                  -- ordered links inside each menu

services                   -- the big one: slug, name, tagline, intro, hero_image_id, recommended_for[], benefits[], how_it_works, pre_post_care, seo_*
service_categories         -- face, body (extensible)
service_category_map       -- many-to-many (lets Fibroblast Plasma live in both)
service_pricing            -- service_id, tier_name, mode (single|pack3), price_cents, savings_cents, sort_order
service_faqs               -- service_id, question, answer, sort_order

specials                   -- title, body, cta_label, cta_url, type (evergreen|time_bound), start_at, end_at, image_id, sort_order
testimonials               -- client_name, treatment_id (FK services), quote, date_added, featured_on[], sort_order
homepage_featured_services -- service_id, sort_order  (controls homepage grid)

founder_profile            -- name, role, bio, photo_id
certificates               -- founder_profile_id, title, file_url, sort_order

media_library              -- id, filename, alt_text, width, height, storage_path, uploaded_by, uploaded_at
gallery_thumbnails         -- ordered footer gallery

contact_submissions        -- form responses (write-only from public, read-only for editor)
newsletter_subscribers     -- or external integration

redirects                  -- old_path, new_path, status_code (for SEO continuity)
```

---

## Recommendations for the rebuild (out of scope for this audit, but worth flagging)

1. **Voice-editing safety:** wrap any write operation in a 2-step confirmation. *"You're about to change the Carbon Peel face price from $140 to $160 — confirm?"* Especially for price, contact details, and image swaps.
2. **Pricing audit before launch:** the prices on the live site may be out of date — ask the client to walk through every service's prices before they go into Supabase as source of truth.
3. **Typo cleanup:** copy on Carbon Peel includes "Unever skin tone", "bemishes", "CONTAC us" (footer). Worth fixing during the content migration rather than carrying over.
4. **Replace stock photography:** the entire footer gallery and "Why us" section uses Unsplash photos. Real clinic photos would meaningfully lift trust signal.
5. **301 redirects:** preserve every current `/services/{slug}/` URL exactly — these have years of SEO value.
6. **The "Special of the Week" → Instagram fallback** is a workaround for not having an easy way to update specials. Once Claude voice editing is live, this becomes the most valuable feature: actual rotating weekly specials managed by voice.
7. **Currently-logged-in admin warning:** the audit was performed from a browser still signed in as WordPress admin `riceandbeans` — recommend signing out before sharing the audit output externally.
