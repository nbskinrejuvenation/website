# SEO Head-Tag Audit — nbskinrejuvenation.com.au

**Audit date:** 21 May 2026
**Pages inspected:** Home, About, Specials, Contact, Carbon Peel, Medi-Aesthetic Peels, Services index, Thank You, sitemap.xml, robots.txt

---

## Executive summary

The current site is leaving **significant** SEO value on the table. Most of these issues are zero-cost fixes in a Next.js rebuild — they're basically free wins.

| Issue | Severity | Pages affected | Fix in Next.js |
|---|---|---|---|
| No meta descriptions anywhere | **High** | All 24 | `metadata.description` per page |
| No Open Graph or Twitter Card tags | **High** | All 24 | `metadata.openGraph` + `metadata.twitter` |
| No JSON-LD structured data | **High** | All 24 | LocalBusiness, Service, FAQPage schemas |
| No SEO plugin installed | **High** | Site-wide | Built into Next.js metadata API |
| WordPress 6.0.9 (current is 6.7+) | **High** (security) | Site-wide | Resolved by migrating off WP |
| `lang="en-US"` for an Australian clinic | Medium | All 24 | `<html lang="en-AU">` |
| Empty `/services/` index page | Medium | `/services/` | Either populate or 301 redirect to home |
| `/thank-you/` typo: "tha main page" | Low | `/thank-you/` | Fix during migration |
| 1 image without alt text on Carbon Peel | Low (acc) | At least Carbon Peel | Require alt text in CMS |

---

## What's currently on the page `<head>`

Across every page checked, the situation is identical:

```
✓ <title>{Page name} – Naturally Beautiful Skin Rejuvenation</title>
✓ <link rel="canonical" href="..." />
✓ <meta name="robots" content="max-image-preview:large">
✓ <meta name="generator" content="WordPress 6.0.9">
✓ <link rel="icon" href=".../cropped-NB-15-32x32.png">
✗ <meta name="description" ...>                  MISSING
✗ <meta property="og:title" ...>                 MISSING
✗ <meta property="og:description" ...>           MISSING
✗ <meta property="og:image" ...>                 MISSING
✗ <meta property="og:type" ...>                  MISSING
✗ <meta property="og:url" ...>                   MISSING
✗ <meta name="twitter:card" ...>                 MISSING
✗ <script type="application/ld+json"> ...        MISSING (zero schema markup)
✗ <link rel="alternate" hreflang="...">          MISSING (en-AU not declared)
```

## What this means in practice

1. **Social sharing is broken.** When someone shares a service page in WhatsApp, Facebook, LinkedIn, or iMessage, the preview will be a bare URL with no image, no title, no description. For a beauty clinic where word-of-mouth and social sharing matter, this is a significant loss.

2. **No rich results in Google.** A local beauty clinic with FAQ accordions on every service page is an ideal candidate for:
   - **LocalBusiness schema** → Google Business Profile integration, knowledge panel
   - **Service schema** → "Carbon Peel — Naturally Beautiful Skin Rejuvenation" with star rating snippet
   - **FAQPage schema** → expandable FAQ in search results (very high CTR boost)
   - **Review schema** (from the testimonials)

3. **No meta descriptions = Google writes its own.** Google will pull text from the page, which currently means snippets like "RESULTS What To Expect Smoother skin tone" — meaningless to a searcher. A 155-character meta description per page would dramatically improve click-through.

4. **`lang="en-US"`** subtly hurts Australian SEO. Google uses page language signals for geographic relevance.

## Sitemap & robots

- **`robots.txt`** is the WordPress default — fine, no changes needed.
- **`/wp-sitemap.xml`** is the WP core sitemap (not Yoast). Lists 24 URLs:
  - 5 main pages: `/`, `/about/`, `/contact-us/`, `/services/`, `/specials/`
  - 18 service pages
  - 1 form-confirmation page: `/thank-you/`

- The `/services/` URL is in the sitemap but is **essentially blank** (550 chars body text, just an H1). It's not linked from the main nav. Either populate it as a proper services index/listing page in the rebuild, or 301 to home.

## Site-wide rebuild recommendations (SEO)

### Must-have metadata, per page

For each page in the new Next.js site:

```typescript
export const metadata = {
  title: string,                    // 50-60 chars
  description: string,              // 150-160 chars
  openGraph: {
    title, description,
    images: [hero_image_url],
    type: 'website' | 'article',
    locale: 'en_AU',
    siteName: 'Naturally Beautiful Skin Rejuvenation',
  },
  twitter: {
    card: 'summary_large_image',
    title, description,
    images: [hero_image_url],
  },
  alternates: { canonical: full_url },
}
```

### Schema markup, per page type

| Page | Schema |
|---|---|
| Site-wide | `LocalBusiness` (or `BeautySalon` subtype) with full NAP, opening hours, geo, image |
| Each service page | `Service` + `FAQPage` (using the FAQ accordion content) + linked `provider` → LocalBusiness |
| Testimonials | `Review` entities attached to either the service or the LocalBusiness |
| About | `Person` for Lilian (founder), linked to the LocalBusiness |

### Other site-wide fixes

- `<html lang="en-AU">` (Australian audience)
- `<meta name="theme-color" content="..."` for mobile browser chrome
- Favicon set: 16/32/180/192/512 + maskable variant
- `next-sitemap` plugin or manual `sitemap.xml` + `robots.txt` generation
- All images use `next/image` with proper `alt` text (CMS-required field, never empty)
- Default OG image fallback (1200×630) when a page has no hero image set
