# NB Skin Rejuvenation — Production Architecture Plan

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase · Vercel · Sentry  
**Purpose:** AI-editable website for Naturally Beautiful Skin Rejuvenation, Dee Why NSW  
**Architecture date:** May 2026

---

## 1. Folder Structure

```
nbskin/
├── app/                          # Next.js App Router (all routes)
├── components/                   # All UI components
├── lib/                          # Shared utilities, clients, helpers
├── hooks/                        # Custom React hooks
├── types/                        # Global TypeScript types/interfaces
├── styles/                       # Global CSS, Tailwind config
├── public/                       # Static assets (images, fonts, icons)
├── supabase/                     # Supabase config, migrations, seeds
├── instrumentation.ts            # Sentry + OpenTelemetry bootstrap
├── middleware.ts                 # Preview mode, auth guards, redirects
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json
├── .env.local                    # Local secrets (gitignored)
├── .env.example                  # Template committed to repo
└── sentry.*.config.ts            # Sentry client/server/edge configs
```

---

## 2. App Router Structure

```
app/
├── layout.tsx                    # Root layout: fonts, providers, Sentry
├── page.tsx                      # Homepage (/)
├── not-found.tsx                 # Global 404
├── error.tsx                     # Global error boundary
├── loading.tsx                   # Global loading skeleton
│
├── about/
│   └── page.tsx                  # /about
│
├── services/
│   ├── layout.tsx                # Shared services layout (breadcrumbs, sidebar)
│   ├── page.tsx                  # /services — treatment index
│   └── [slug]/
│       ├── page.tsx              # /services/[slug] — dynamic treatment page
│       └── loading.tsx           # Per-treatment skeleton
│
├── specials/
│   └── page.tsx                  # /specials
│
├── contact/
│   └── page.tsx                  # /contact
│
├── preview/
│   └── [...path]/
│       └── page.tsx              # Preview mode entry for any route
│
└── api/
    ├── revalidate/
    │   └── route.ts              # Webhook: Supabase → on-demand ISR revalidation
    ├── preview/
    │   └── route.ts              # Enable/disable preview mode (token-gated)
    └── health/
        └── route.ts              # /api/health — uptime check
```

**Key routing rules:**
- All public pages use React Server Components (RSC) by default.
- Client Components (`"use client"`) are used only at leaf-level interactivity (nav dropdowns, forms, modals).
- The `[slug]` segment is resolved against `treatments.slug` in Supabase.
- `generateStaticParams` pre-renders all published treatment slugs at build time.

---

## 3. Component Organization

```
components/
│
├── ui/                           # Primitive, design-system components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Skeleton.tsx
│   └── ...
│
├── layout/                       # Site-wide structural components
│   ├── Header.tsx                # Database-driven nav
│   ├── Footer.tsx
│   ├── MobileMenu.tsx            # Client Component
│   └── PreviewBanner.tsx         # Visible only in preview mode
│
├── sections/                     # Full-width page sections (homepage blocks)
│   ├── HeroSection.tsx
│   ├── TreatmentsGrid.tsx
│   ├── TestimonialsCarousel.tsx  # Client Component
│   ├── SpecialsSection.tsx
│   └── CTABanner.tsx
│
├── treatment/                    # Treatment-specific components
│   ├── TreatmentHero.tsx
│   ├── TreatmentBenefits.tsx
│   ├── TreatmentFAQ.tsx          # Accordion — Client Component
│   ├── TreatmentGallery.tsx      # Client Component
│   └── TreatmentBookingCTA.tsx
│
├── forms/                        # Contact and booking forms
│   ├── ConsultationForm.tsx      # Client Component
│   └── NewsletterForm.tsx        # Client Component
│
└── seo/
    ├── StructuredData.tsx        # JSON-LD schema injection
    └── OpenGraphImage.tsx        # OG image generation helper
```

**Rules:**
- Server Components fetch their own data directly. Props are typed strictly.
- Client Components receive only serializable props (no Supabase clients passed down).
- `ui/` components are stateless and design-system-only — no data fetching.
- Component file names use PascalCase. Directory names use lowercase kebab-case.

---

## 4. Supabase Client Architecture

Three distinct clients, one for each execution context.

```
lib/supabase/
├── server.ts         # Server Component / Route Handler client (SSR)
├── client.ts         # Browser client (Client Components)
├── middleware.ts     # Edge middleware client
└── admin.ts          # Service-role client — server only, never exposed
```

**server.ts** — uses `@supabase/ssr` `createServerClient` with Next.js cookies.  
**client.ts** — uses `@supabase/ssr` `createBrowserClient`, singleton pattern.  
**middleware.ts** — thin edge client for session refresh on every request.  
**admin.ts** — uses `SUPABASE_SERVICE_ROLE_KEY`, only ever called in Route Handlers or scripts. Never imported from a Client Component.

**Row-Level Security (RLS) philosophy:**
- All tables have RLS enabled by default.
- Public visitors read only `status = 'published'` rows via the anon key.
- Preview mode uses a signed short-lived token that grants read access to `status = 'draft'` rows via a Postgres function, not the service key.
- Write operations (MCP editing) use the service-role client behind a server-side API route, never the browser.

---

## 5. Environment Variable Structure

```bash
# .env.example

# ── Supabase ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>          # server-only

# ── Preview ───────────────────────────────────────────────
PREVIEW_SECRET=<random-32-char-token>                 # gates /api/preview

# ── Revalidation ──────────────────────────────────────────
REVALIDATION_SECRET=<random-32-char-token>            # gates /api/revalidate

# ── Sentry ────────────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=<org-slug>
SENTRY_PROJECT=<project-slug>
SENTRY_AUTH_TOKEN=<token>                             # CI/release uploads only

# ── App ───────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://nbskinrejuvenation.com.au
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX           # optional

# ── Auth (future) ─────────────────────────────────────────
# SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
# SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=
```

**Rules:**
- `NEXT_PUBLIC_` prefix = safe to expose to the browser. Everything else is server-only.
- `SUPABASE_SERVICE_ROLE_KEY` and `SENTRY_AUTH_TOKEN` must never appear in client bundles.
- All secrets are set in Vercel's Environment Variables UI, scoped per environment (Production / Preview / Development).

---

## 6. SEO Architecture

**Metadata generation** — via Next.js `generateMetadata()` in each `page.tsx`, reading from the database.

```typescript
// app/services/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const treatment = await getTreatmentBySlug(params.slug)
  return {
    title: `${treatment.seo_title} | Naturally Beautiful Skin Rejuvenation`,
    description: treatment.seo_description,
    openGraph: { images: [treatment.og_image_url] },
    alternates: { canonical: `/services/${treatment.slug}` },
  }
}
```

**Supabase SEO fields** on the `treatments` table:
- `seo_title`, `seo_description`, `og_image_url`, `og_image_alt`, `schema_faq` (JSON)

**Sitemap** — `app/sitemap.ts` (dynamic, queries all published slugs).  
**Robots** — `app/robots.ts` (disallows `/api/`, `/preview/`).  
**Structured Data** — `components/seo/StructuredData.tsx` injects:
- `LocalBusiness` schema on every page (address, phone, geo)
- `Service` schema on each treatment page
- `FAQPage` schema when FAQs exist

**OG Images** — `app/opengraph-image.tsx` using Next.js `ImageResponse` for the homepage. Treatment pages use a stored `og_image_url` from Supabase/Vercel Blob.

---

## 7. Data Fetching Strategy

All data lives in Supabase. Fetching is split by render context:

**Server Components (RSC)** — the default. Fetch directly in the component body using the server Supabase client. No API route middleman needed.

```typescript
// Direct RSC fetch — preferred pattern
const treatment = await supabaseServer()
  .from('treatments')
  .select('*')
  .eq('slug', slug)
  .eq('status', 'published')
  .single()
```

**Route Handlers** — used for: revalidation webhooks, preview mode toggle, form submissions (contact/newsletter), MCP write operations.

**Client Components** — use SWR or React Query only when truly needed for real-time or user-interaction-driven fetches (e.g. loading more testimonials). The vast majority of the site is static server-rendered.

**`generateStaticParams`** — called at build time for `/services/[slug]` to generate all treatment pages. This gives full ISR + static generation benefits.

**Data shape (key tables):**
- `treatments` — slug, category, title, summary, body_html, status, sort_order, seo_*
- `navigation` — label, href, parent_id, sort_order, is_visible
- `site_settings` — singleton row: business name, phone, address, social links
- `testimonials` — name, text, treatment_ref, is_featured, status
- `specials` — title, description, image_url, valid_from, valid_to, status
- `pages` — slug, title, body_html, seo_*, status (for About, Contact, etc.)

---

## 8. Caching & Revalidation Strategy

**Static generation + ISR** is the primary caching mode. Treatment pages are pre-rendered at build time and revalidated on demand.

| Route | Strategy | Revalidation |
|---|---|---|
| `/` Homepage | ISR | On-demand via webhook |
| `/services` index | ISR | On-demand via webhook |
| `/services/[slug]` | `generateStaticParams` + ISR | On-demand via webhook |
| `/about`, `/contact` | ISR | On-demand via webhook |
| `/specials` | ISR, 1hr fallback | On-demand + time-based |
| `/api/revalidate` | Dynamic | — |
| `/preview/*` | No cache (dynamic) | — |

**On-demand revalidation flow:**
1. MCP tool updates a row in Supabase.
2. Supabase Database Webhook fires a `POST` to `/api/revalidate`.
3. Route Handler verifies `REVALIDATION_SECRET`, calls `revalidatePath()` or `revalidateTag()`.
4. Next.js purges only the affected page(s) from the Vercel Edge Network cache.

**`next/cache` tags** are set at the fetch level:
```typescript
fetch(..., { next: { tags: ['treatments', `treatment-${slug}`] } })
```

This allows surgical per-treatment cache invalidation without a full site rebuild.

---

## 9. Preview / Published Content Strategy

**Two-status content model:** every content row has `status: 'draft' | 'published'`.

**Preview mode architecture:**
- `/api/preview?secret=TOKEN&slug=/services/carbon-peel` validates the token, sets a `__previewMode` cookie, and redirects to the target URL.
- `/api/preview?disable=true` clears the cookie.
- `middleware.ts` reads the cookie and passes `isPreview: boolean` via a request header.
- All server-side data fetches check `isPreview` — if true, the `.eq('status', 'published')` filter is dropped, showing both draft and published content.
- The `PreviewBanner` component renders a dismissible yellow banner at the top of every page in preview mode, with a "Exit Preview" button.
- Preview URLs are shareable with the cookie token for stakeholder review — but the token is short-lived (24h, managed in Supabase `preview_tokens` table).

**MCP editing workflow:**
1. MCP tool writes to `status = 'draft'` (never touches `published` directly unless explicitly published).
2. Operator previews via `/api/preview?secret=...`.
3. MCP tool or operator calls a `publish` action that copies `draft` content to `published` fields (or flips `status`).
4. Supabase webhook fires → `/api/revalidate` → cache purge → live site updated.

---

## 10. Error Handling Strategy

**Levels of error handling:**

**Route-level** — each route segment has a co-located `error.tsx` (Client Component with `reset` function). The root `app/error.tsx` is the global fallback.

**`not-found.tsx`** — returned by `notFound()` when a treatment slug doesn't exist in Supabase.

**Data fetch errors** — all Supabase queries check the `error` return value. Errors are thrown to the nearest error boundary rather than silently failing:
```typescript
const { data, error } = await supabase.from('treatments').select(...)
if (error) throw new Error(`Failed to fetch treatment: ${error.message}`)
```

**Form errors** — contact/newsletter forms use server actions with typed `ActionState` return objects. Validation errors are returned to the form without a page reload.

**API Route errors** — all Route Handlers return structured JSON errors with appropriate HTTP status codes (400, 401, 500). Never expose raw Supabase error messages to the client.

**Middleware errors** — caught and logged; on failure, the request falls through (fail-open for public content, fail-closed for protected routes).

**Global unhandled rejections** — caught by Sentry's automatic instrumentation in `instrumentation.ts`.

---

## 11. Sentry Integration Strategy

Sentry is integrated at three levels following Next.js's recommended pattern.

**Files:**
- `sentry.client.config.ts` — browser SDK init, replay, user feedback
- `sentry.server.config.ts` — Node.js SDK init, performance tracing
- `sentry.edge.config.ts` — Edge runtime SDK init (middleware tracing)
- `instrumentation.ts` — bootstraps all three via Next.js `register()` hook

**`next.config.ts` wrapper:**
```typescript
import { withSentryConfig } from '@sentry/nextjs'
export default withSentryConfig(nextConfig, { silent: true, hideSourceMaps: true })
```

**Capture strategy:**
- Automatic: all unhandled errors, slow page loads, failed API calls.
- Manual in error boundaries: `Sentry.captureException(error, { contexts: { route: pathname } })`
- Manual in Route Handlers: wrap with `Sentry.withServerActionInstrumentation` or try/catch.
- Custom tags added on init: `environment`, `site_version` (from package.json), `region` (Vercel region env var).

**Performance monitoring:**
- `tracesSampleRate: 0.1` in production (10% of transactions).
- `replaysOnErrorSampleRate: 1.0` — full session replay on every error.
- `replaysSessionSampleRate: 0.05` — 5% baseline session replay.

**Source maps** are uploaded at build time via `SENTRY_AUTH_TOKEN` in CI, then deleted from the Vercel deployment so they're never publicly accessible.

**Alerts:** Configure Sentry alerts for: error spike (>10 new errors/hour), first occurrence of any new issue, p95 response time >3s.

---

## 12. Authentication Recommendations

The public-facing website requires no user authentication. Authentication applies only to the content editing layer.

**Recommended approach: Supabase Auth + MCP-only write access**

- Supabase Auth is already included in the stack. Use it for editor/admin access.
- A single admin user (the clinic owner or developer) authenticates via **Magic Link** (email OTP) — no password to manage or forget.
- Authentication gates the MCP write tools, not the website frontend.
- The website itself remains fully public (no login wall).
- RLS policies ensure: anonymous users → read published only; authenticated admin → read + write all.

**Future-proofing:**
- If a client-facing booking/account system is ever needed, Supabase Auth supports Google OAuth, Apple, and phone OTP out of the box.
- Keep auth logic in `lib/auth/` so it's isolated from the rest of the app.

**Do not** implement a Next.js admin dashboard in this project phase — defer that to a separate internal tool or use the Supabase Studio UI directly.

---

## 13. Deployment Recommendations (Vercel)

**Project setup:**
- Connect the GitHub repo to Vercel. Enable automatic deployments on push to `main`.
- `main` → Production environment (`nbskinrejuvenation.com.au`)
- `develop` → Preview environment (e.g. `staging.nbskinrejuvenation.com.au`)
- Feature branches → ephemeral Preview deployments (great for stakeholder review)

**Vercel configuration (`vercel.json`):**
```json
{
  "regions": ["syd1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

**Recommended Vercel features to enable:**
- **Edge Network**: default, no action needed.
- **Image Optimization**: use `next/image` throughout. Set `domains` in `next.config.ts` to include the Supabase Storage bucket URL.
- **Web Analytics**: enable in Vercel dashboard — free, privacy-friendly, no script needed.
- **Speed Insights**: enable for Core Web Vitals tracking.
- **Vercel Blob**: store treatment images and OG images (avoids Supabase Storage egress costs for frequently-accessed media).
- **Cron Jobs**: use Vercel Cron to expire old specials and trigger weekly cache refreshes (`0 2 * * *`).

**Domain:** Point `nbskinrejuvenation.com.au` and `www.nbskinrejuvenation.com.au` to Vercel. Set `www` as canonical, redirect apex to `www` (or vice versa — be consistent).

**CI/CD checklist per deployment:**
1. TypeScript type check (`tsc --noEmit`)
2. ESLint
3. Unit/integration tests
4. Sentry source map upload
5. Vercel build

---

## 14. Naming Conventions

| Concern | Convention | Example |
|---|---|---|
| React components | PascalCase | `TreatmentCard.tsx` |
| Hooks | camelCase, `use` prefix | `useTreatments.ts` |
| Utilities / helpers | camelCase | `formatSlug.ts` |
| Server actions | camelCase, verb first | `submitConsultationForm.ts` |
| Route Handlers | `route.ts` (fixed by Next.js) | `app/api/revalidate/route.ts` |
| Supabase table names | snake_case, plural | `treatments`, `site_settings` |
| Supabase column names | snake_case | `seo_title`, `body_html` |
| TypeScript interfaces | PascalCase, noun | `Treatment`, `NavItem`, `SiteSettings` |
| TypeScript type aliases | PascalCase | `TreatmentStatus`, `ContentStatus` |
| Environment variables | SCREAMING_SNAKE_CASE | `SUPABASE_SERVICE_ROLE_KEY` |
| CSS / Tailwind | Utility-first; custom classes in `@layer components` | `.btn-primary` |
| Directory names | lowercase kebab-case | `components/treatment/` |
| Git branches | kebab-case, feature prefix | `feature/treatment-gallery` |
| Supabase migrations | timestamp prefix | `20260522_add_specials_table.sql` |

---

## 15. Recommended Libraries & Packages

### Core
| Package | Purpose |
|---|---|
| `next` (15.x) | Framework |
| `react`, `react-dom` (19.x) | UI runtime |
| `typescript` | Type safety |
| `tailwindcss` (v4) | Styling |
| `@supabase/supabase-js` | Supabase SDK |
| `@supabase/ssr` | SSR-safe Supabase client helpers |

### SEO & Metadata
| Package | Purpose |
|---|---|
| `next` built-in `Metadata` API | Page metadata |
| `schema-dts` | TypeScript types for JSON-LD structured data |

### Forms & Validation
| Package | Purpose |
|---|---|
| `zod` | Schema validation for forms and API payloads |
| `react-hook-form` | Form state management (Client Components only) |
| `@hookform/resolvers` | Zod adapter for react-hook-form |

### UI & Interaction
| Package | Purpose |
|---|---|
| `@radix-ui/react-*` | Accessible primitives (dialog, accordion, dropdown) |
| `class-variance-authority` (CVA) | Component variant management |
| `clsx` + `tailwind-merge` | Conditional class merging |
| `lucide-react` | Icon set (consistent, tree-shakeable) |
| `embla-carousel-react` | Testimonials / gallery carousel |
| `framer-motion` | Subtle page transitions and section reveals |

### Image & Media
| Package | Purpose |
|---|---|
| `next/image` | Responsive image optimization |
| `@vercel/blob` | Image storage (treatment photos, OG images) |

### Monitoring & Observability
| Package | Purpose |
|---|---|
| `@sentry/nextjs` | Error tracking, performance, replays |

### Developer Experience
| Package | Purpose |
|---|---|
| `eslint` + `eslint-config-next` | Linting |
| `prettier` | Code formatting |
| `@types/node`, `@types/react` | TypeScript definitions |
| `tsx` | Run TypeScript scripts (e.g. DB seed scripts) |

### Testing (recommended additions)
| Package | Purpose |
|---|---|
| `vitest` | Unit and integration tests |
| `@testing-library/react` | Component tests |
| `playwright` | End-to-end tests (critical flows: homepage, treatment page, contact form) |

---

## Supabase Schema Overview

A minimal but complete schema to support all features above:

```sql
-- Content status enum
create type content_status as enum ('draft', 'published');

-- Treatment categories
create type treatment_category as enum ('face', 'body');

-- Treatments (19 total from existing site)
create table treatments (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  category     treatment_category not null,
  title        text not null,
  subtitle     text,
  summary      text,                   -- card/index excerpt
  body_html    text,                   -- full page content
  hero_image   text,                   -- Vercel Blob URL
  sort_order   int default 0,
  status       content_status default 'draft',
  seo_title    text,
  seo_description text,
  og_image_url text,
  schema_faq   jsonb,                  -- [{q, a}, ...]
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Navigation (database-driven menu)
create table navigation (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  href       text,
  parent_id  uuid references navigation(id),
  sort_order int default 0,
  is_visible boolean default true
);

-- Site-wide settings (singleton)
create table site_settings (
  id             uuid primary key default gen_random_uuid(),
  business_name  text,
  phone          text,
  address        text,
  suburb         text,
  postcode       text,
  state          text,
  lat            numeric,
  lng            numeric,
  facebook_url   text,
  instagram_url  text,
  booking_url    text,
  updated_at     timestamptz default now()
);

-- Testimonials
create table testimonials (
  id             uuid primary key default gen_random_uuid(),
  client_name    text not null,
  body           text not null,
  treatment_ref  text,
  avatar_url     text,
  is_featured    boolean default false,
  sort_order     int default 0,
  status         content_status default 'published'
);

-- Specials (weekly offers)
create table specials (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  image_url   text,
  valid_from  date,
  valid_to    date,
  status      content_status default 'draft'
);

-- Static pages (About, Contact, etc.)
create table pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  body_html       text,
  status          content_status default 'draft',
  seo_title       text,
  seo_description text,
  updated_at      timestamptz default now()
);
```

---

## Architecture Decision Notes

**Why no separate CMS?** Supabase serves as both database and CMS backend. Combined with MCP tooling for AI-assisted editing, a separate headless CMS (Contentful, Sanity) adds cost and complexity without meaningful benefit at this scale.

**Why ISR over full SSR?** Treatment content changes rarely. ISR delivers static performance (Vercel Edge cache, CDN hit) with freshness on demand. Full SSR would add latency on every request without benefit.

**Why not the Pages Router?** App Router is the current Next.js standard. RSC dramatically reduces client-side JavaScript, which directly improves Core Web Vitals — important for local SEO ranking.

**Why Vercel Blob over Supabase Storage for images?** Vercel Blob integrates directly with `next/image` optimization pipeline and serves from the same CDN edge network as the app. Supabase Storage is better suited for user-uploaded files or non-image assets.

**MCP voice editing readiness:** The schema's `body_html` fields are intentionally simple strings. For future voice editing, these can be replaced with or supplemented by structured JSON content (e.g. a `content_blocks` JSONB column) without breaking the existing page render logic.
