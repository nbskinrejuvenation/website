# NB Skin Rejuvenation — Discovery & Planning Package

This folder contains the complete discovery and planning output for rebuilding
**nbskinrejuvenation.com.au** as a Next.js + Supabase site editable by voice via Claude MCP.

## Files

1. **`00-content-inventory.md`** — 76-row inventory of every piece of content on the current WordPress site, categorized by content type, with notes on what voice-editability tier each should sit in.
2. **`01-services-crawl.json`** — Structured data for all 18 service pages: taglines, FAQ questions, complete pricing tables. The raw material for seeding Supabase.
3. **`02-seo-audit.md`** — Head-tag inspection across the site. The headline finding: there are essentially no SEO meta tags, OG tags, or schema markup. The Next.js rebuild gets every one of these for free.
4. **`03-supabase-schema.sql`** — A complete SQL migration: 18 tables, RLS policies, indices, triggers. Derived from the actual content shapes, not generic templates.
5. **`04-mcp-write-permissions.md`** — The safety model for the voice-editing feature. Defines 4 permission tiers (Locked / Direct / Confirmed / Restricted) and assigns each table/operation to a tier, with a sample confirmation flow for price changes.

## How the files relate

```
00-content-inventory.md
    └── informs ──▶ 01-services-crawl.json (real data)
                        └── informs ──▶ 03-supabase-schema.sql (table shapes)
                                            └── informs ──▶ 04-mcp-write-permissions.md (what's safe to expose)
                ─── 02-seo-audit.md (parallel track) ───
```

## The biggest decisions still open (need your input before build starts)

1. **Pricing accuracy.** I scraped the prices currently on the live site, but they may be out of date. Before they become source-of-truth in Supabase, the client should walk through all 18 services and confirm each row. The voice tool will then make ongoing updates easy.

2. **The thin/stub pages.** A few service pages are incomplete on the current site:
   - **`/services/tattoo-removal-with-saline-solution/`** has only ONE price ($150 for eyebrow). Is the variant list intentionally short, or is content missing?
   - **`/services/`** (the index) is essentially blank. Should we build a proper services index page, or 301 it to home?
   - **`/services/microdermabrasion/`** is missing "Recommended For" and "Pre and Post Care" sections that most other services have.

3. **Typos to fix during migration.** The current site has typos that should be cleaned up rather than carried over:
   - "Unever skin tone" → "Uneven skin tone" (Carbon Peel)
   - "Acne bemishes" → "Acne blemishes" (Carbon Peel)
   - "Acne scaring" → "Acne scarring" (Micro Needling)
   - "medi-easthetic" → "medi-aesthetic" (Medi-Aesthetic Peels intro)
   - "Is there any  downtime?" (double space, Microdermabrasion FAQ)
   - "CONTAC us" (footer label, every page)
   - "tha main page" → "the main page" (`/thank-you/`)

4. **Stock photography replacement.** The entire footer gallery and "Why us" section uses Unsplash stock photos. Real clinic photos would meaningfully lift trust signals.

5. **"Special of the Week"** currently defers to Instagram because updating the live site is hard. Once voice editing is live, this becomes a real time-bound `specials` row managed weekly.

6. **Security: WordPress admin session.** During this audit, the browser was signed in as WordPress admin user `riceandbeans`. Recommend signing out before sharing this package externally, and rotating that password before site decommissioning.

7. **WordPress 6.0.9 is 3+ years out of date.** This is a security concern for the legacy site, not just an SEO one. If there's a gap between this audit and the Next.js launch, consider updating WP urgently or putting the site behind a maintenance page.

## Recommended build sequence

1. Spin up Supabase project, apply `03-supabase-schema.sql`.
2. Run a one-time seed script that loads `01-services-crawl.json` into the schema — **with the client present** to confirm prices and fix typos as they go.
3. Build the Next.js frontend (App Router, server components reading from Supabase via PostgREST).
4. Stand up the MCP server (Cloudflare Worker or similar) implementing the tool surface in `04-mcp-write-permissions.md`.
5. Connect Claude to the MCP server, do a 30-minute live training with the editor.
6. Capture 301 redirects for any URLs that change, deploy.
7. Submit new `sitemap.xml` to Google Search Console; monitor for crawl errors.

## What was NOT in scope here

- Visual design / brand refresh
- Hosting decisions (Vercel vs Cloudflare vs self-hosted)
- Booking integration (the current site uses "call to book" — could become a real booking flow)
- Email/transactional integration for form submissions
- Analytics setup
- Cost estimation
