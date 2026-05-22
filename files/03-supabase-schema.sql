-- ============================================================================
-- Supabase schema for nbskinrejuvenation.com.au rebuild
-- ============================================================================
-- Derived from the content audit + 18-service crawl on 2026-05-21.
-- Designed for a Next.js (App Router) frontend + Claude voice editing via MCP.
--
-- Design principles:
--   1. ONE row of site-wide config (site_settings) — phone, address, etc. live here
--      and are referenced everywhere. No duplication.
--   2. Services are richly modeled because they're the main editable content
--      and have the most variety (different pack sizes, variant groups, etc.).
--   3. Many-to-many between services and categories (Fibroblast Plasma is in both).
--   4. Pricing is its own table because variants are free-form text labels and
--      can be 1–24 rows per service.
--   5. FAQs are their own table — voice command "add an FAQ" is a clear use case.
--   6. Reusable page sections (footer CTA appears on every page) live in a
--      `sections` table and join to pages via `page_sections`.
--   7. ALL public-facing tables get a `published_at` column for draft/preview
--      workflows — voice editor can save drafts without publishing.
--   8. RLS is enabled on every table. Public anon role can SELECT published
--      rows only. The MCP write key uses a dedicated `editor` role.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "citext";


-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type pricing_mode as enum ('single', 'pack');
create type special_type as enum ('evergreen', 'time_bound');
create type media_kind   as enum ('image', 'pdf', 'video');


-- ---------------------------------------------------------------------------
-- SITE SETTINGS — single source of truth for site-wide info
-- ---------------------------------------------------------------------------
-- Modeled as a single-row table with explicit columns (not key/value) so the
-- voice tool can have precise schemas like "update phone" / "update address".
-- A CHECK constraint enforces exactly one row.

create table site_settings (
    id                  uuid primary key default uuid_generate_v4(),
    is_singleton        boolean not null default true,

    -- Contact
    phone               text not null,                 -- '0404 203 800'
    phone_international text,                          -- '+61404203800' for tel: links
    email               citext not null,
    whatsapp_enabled    boolean not null default true,

    -- Address
    address_line_1      text not null,                 -- '9 and 10/8-12 Pacific Parade'
    suburb              text not null,                 -- 'Dee Why'
    state               text not null,                 -- 'NSW'
    postcode            text not null,                 -- '2099'
    country             text not null default 'AU',
    region              text,                          -- 'Northern Beaches'
    lat                 numeric(9,6),
    lng                 numeric(9,6),
    parking_note        text,                          -- '3-hour FREE parking at Dee Why Grand...'

    -- Social
    facebook_url        text,
    instagram_url       text,

    -- Brand
    business_name       text not null,                 -- 'Naturally Beautiful Skin Rejuvenation'
    tagline             text,                          -- 'Enhance your natural beauty'
    logo_media_id       uuid,                          -- FK to media (set below)
    default_og_image_id uuid,                          -- FK to media (set below)

    -- Footer
    copyright_year      int  not null default extract(year from now())::int,
    copyright_text      text,

    -- SEO defaults
    default_seo_title_suffix text default ' – Naturally Beautiful Skin Rejuvenation',
    site_lang           text not null default 'en-AU',

    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),

    constraint site_settings_singleton check (is_singleton = true),
    constraint site_settings_singleton_unique unique (is_singleton)
);


-- ---------------------------------------------------------------------------
-- MEDIA LIBRARY
-- ---------------------------------------------------------------------------
create table media (
    id              uuid primary key default uuid_generate_v4(),
    kind            media_kind not null default 'image',
    storage_path    text not null,                     -- Supabase Storage path
    public_url      text not null,
    filename        text not null,
    alt_text        text,                              -- REQUIRED for images at app level
    width           int,
    height          int,
    bytes           bigint,
    mime_type       text,
    uploaded_by     text,                              -- e.g. 'voice-editor' or admin user id
    created_at      timestamptz not null default now()
);

-- Hook up the FKs on site_settings that needed media to exist first
alter table site_settings
    add constraint site_settings_logo_fk            foreign key (logo_media_id)        references media(id) on delete set null,
    add constraint site_settings_default_og_img_fk foreign key (default_og_image_id) references media(id) on delete set null;


-- ---------------------------------------------------------------------------
-- PAGES — the 4 main static pages: home, about, specials, contact
-- (services live in their own dedicated table because they're so structured)
-- ---------------------------------------------------------------------------
create table pages (
    id                  uuid primary key default uuid_generate_v4(),
    slug                text not null unique,          -- 'home','about','specials','contact','services'
    title               text not null,                 -- visible page title (H1)
    hero_eyebrow        text,                          -- "OUR MISSION IS TO"
    hero_heading        text,                          -- "Enhance your natural beauty"
    hero_image_id       uuid references media(id),
    hero_cta_label      text,
    hero_cta_url        text,
    body                jsonb not null default '{}'::jsonb,  -- typed sections (see app types)

    -- SEO
    seo_title           text,                          -- override; null = use title + suffix
    seo_description     text,
    og_image_id         uuid references media(id),

    -- Publishing
    published_at        timestamptz,                   -- null = draft
    updated_at          timestamptz not null default now()
);

-- Seed slugs (insert at migration time, voice editor can never delete these)
-- INSERT INTO pages (slug, title) VALUES
--   ('home', 'Naturally Beautiful Skin Rejuvenation'),
--   ('about', 'About'),
--   ('specials', 'Specials'),
--   ('contact', 'Contact');


-- ---------------------------------------------------------------------------
-- SERVICE CATEGORIES — currently just 'face' and 'body', but extensible
-- ---------------------------------------------------------------------------
create table service_categories (
    id          uuid primary key default uuid_generate_v4(),
    slug        text not null unique,                  -- 'face', 'body'
    name        text not null,                         -- 'Face', 'Body'
    sort_order  int  not null default 0
);


-- ---------------------------------------------------------------------------
-- SERVICES — the heart of the content model
-- ---------------------------------------------------------------------------
create table services (
    id                          uuid primary key default uuid_generate_v4(),
    slug                        text not null unique,  -- 'carbon-peel', 'fibroblast-plasma', etc.
    name                        text not null,         -- 'Carbon Peel'
    hero_eyebrow                text,                  -- 'CARBON PEEL AKA "HOLLYWOOD PEEL"'
    hero_tagline                text,                  -- 'Gently exfoliates, clears and purifies your skin.'
    intro                       text,                  -- "Get the Hollywood look with our completely..."
    hero_image_id               uuid references media(id),

    -- "Recommended For" — nullable; not every service has this section
    recommended_for_intro       text,                  -- "They don't call it the China Doll Peel for nothing..."
    recommended_for             text[],                -- ['Uneven skin tone', 'Oily skin', 'Sun damage', ...]

    -- "What To Expect" benefits — almost every service has this; 6–12 items
    benefits_intro              text,
    benefits                    text[],                -- ['A vibrant, glowing complexion', ...]

    -- "How It Works" section
    how_it_works_heading        text,                  -- 'Long-lasting clearer, brighter and smoother skin'
    how_it_works_body           text,                  -- the descriptive paragraph

    -- Pre/Post Care
    pre_post_heading            text,                  -- 'Simple and easy care.'
    pre_post_body               text,

    -- Pack pricing config (per-service because it varies: null, 3, 4, 6)
    pack_size                   int,                   -- nullable: null = no pack pricing offered
    pack_label                  text,                  -- 'Pack of 3' / 'Pack of 6'

    -- SEO
    seo_title                   text,
    seo_description             text,
    og_image_id                 uuid references media(id),

    -- Sort & publish
    sort_order                  int  not null default 0,
    published_at                timestamptz,
    updated_at                  timestamptz not null default now()
);

create index services_published_idx on services (published_at) where published_at is not null;


-- Many-to-many: services <-> categories (Fibroblast Plasma is in both)
create table service_category_assignments (
    service_id     uuid not null references services(id) on delete cascade,
    category_id    uuid not null references service_categories(id) on delete restrict,
    sort_order_in_category int not null default 0,
    primary key (service_id, category_id)
);


-- ---------------------------------------------------------------------------
-- SERVICE PRICING — one row per visible price line on a service page
-- ---------------------------------------------------------------------------
-- Why a separate table:
--   - Variants per service range 1 (Tattoo-Removal-Saline) to 24 (Medi-Aesthetic).
--   - Variant labels are free-form text ('Saddle Bags', 'Vitamin A - Face only',
--     '4 cm2 - 2cm x 2cm'), not a fixed enum.
--   - Voice command "change the Carbon Peel face-only price to $160" needs to
--     update exactly one row precisely.

create table service_pricing (
    id                  uuid primary key default uuid_generate_v4(),
    service_id          uuid not null references services(id) on delete cascade,

    -- Grouping (e.g. 'Vitamin A' / 'TCA 15%' / 'Tretinoin' for Medi-Aesthetic Peels).
    -- Null for services with a single group.
    variant_group       text,

    -- The visible variant label as shown on the site.
    variant_label       text not null,                 -- 'Face only', 'Saddle Bags', '4 cm2 - 2cm x 2cm'

    -- A free-form helper shown alongside the price (size comparison, prereqs, etc.).
    variant_note        text,                          -- 'Approximate size of a 20c coin'

    -- Pricing mode: single session OR pack of N (N defined on services.pack_size).
    mode                pricing_mode not null,

    -- Price in cents (integer) — store as cents to avoid float issues.
    price_cents         int not null,
    -- For "From $X" pricing patterns.
    is_from_price       boolean not null default false,

    -- For pack mode: per-session breakdown shown to users.
    per_session_cents   int,
    savings_cents       int,
    savings_is_from     boolean not null default false,

    -- Special flags surfaced by some services.
    requires_medical_clearance boolean not null default false,

    sort_order          int not null default 0,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create index service_pricing_service_idx on service_pricing (service_id, sort_order);

-- Useful constraint: pack rows must come with per_session_cents
alter table service_pricing
    add constraint pricing_pack_needs_per_session
    check (
        mode = 'single'
        or (mode = 'pack' and per_session_cents is not null)
    );


-- ---------------------------------------------------------------------------
-- SERVICE FAQs — every service has 4–8 FAQ accordions
-- ---------------------------------------------------------------------------
create table service_faqs (
    id              uuid primary key default uuid_generate_v4(),
    service_id      uuid not null references services(id) on delete cascade,
    question        text not null,
    answer          text not null,
    sort_order      int not null default 0,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index service_faqs_service_idx on service_faqs (service_id, sort_order);


-- ---------------------------------------------------------------------------
-- SPECIALS / PROMOTIONS
-- ---------------------------------------------------------------------------
-- The current site has 6 evergreen cards. The voice tool should also be able
-- to create truly time-bound specials (e.g. "30% off micro-needling for May").

create table specials (
    id              uuid primary key default uuid_generate_v4(),
    slug            text unique,                       -- 'free-consultation', 'refer-a-friend' (nullable for time-bound)
    title           text not null,                     -- 'Free Consultation'
    eyebrow         text,                              -- 'FREE CONSULTATION' (uppercase variant on cards)
    body            text not null,
    cta_label       text not null default 'BOOK NOW',
    cta_url         text not null default '/contact',  -- might point to Instagram for 'Special of the Week'
    image_id        uuid references media(id),

    -- Linkage (optional): if a special applies to a specific service
    service_id      uuid references services(id) on delete set null,
    -- Discount fields (optional, for time-bound specials)
    discount_percent int,
    discount_amount_cents int,

    type            special_type not null default 'evergreen',
    start_at        timestamptz,                       -- null for evergreen
    end_at          timestamptz,                       -- null for evergreen
    sort_order      int not null default 0,
    published_at    timestamptz,
    updated_at      timestamptz not null default now()
);

-- Index for "what specials are currently live"
create index specials_window_idx on specials (start_at, end_at) where published_at is not null;


-- ---------------------------------------------------------------------------
-- TESTIMONIALS
-- ---------------------------------------------------------------------------
create table testimonials (
    id              uuid primary key default uuid_generate_v4(),
    client_name     text not null,                     -- 'Glaucia Huxley'
    quote           text not null,
    treatment_text  text,                              -- 'Micro needling & Fractional RF' (free text)
    service_id      uuid references services(id) on delete set null,  -- optional structured link
    image_id        uuid references media(id),         -- optional photo
    date_received   date,
    -- Where this testimonial shows up — array of page slugs.
    featured_on     text[] not null default '{}'::text[],
    sort_order      int not null default 0,
    published_at    timestamptz,
    updated_at      timestamptz not null default now()
);

create index testimonials_featured_idx on testimonials using gin (featured_on);


-- ---------------------------------------------------------------------------
-- FOUNDER PROFILE + CERTIFICATES (for the About page)
-- ---------------------------------------------------------------------------
create table founders (
    id              uuid primary key default uuid_generate_v4(),
    slug            text not null unique,              -- 'lilian'
    name            text not null,
    role            text not null,                     -- 'Founder and Head Therapist'
    bio             text not null,                     -- multi-paragraph
    photo_id        uuid references media(id),
    sort_order      int not null default 0,
    published_at    timestamptz,
    updated_at      timestamptz not null default now()
);

create table certificates (
    id              uuid primary key default uuid_generate_v4(),
    founder_id      uuid not null references founders(id) on delete cascade,
    title           text not null,                     -- 'GentleMax Laser System'
    file_id         uuid references media(id),         -- PDF stored in Supabase Storage
    sort_order      int not null default 0,
    created_at      timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- REUSABLE SECTIONS — for content blocks that appear on multiple pages
-- e.g. the "Book your free consultation" CTA section appears on home, about,
-- specials, AND every service page (the Elementor "Contact Us Section" post 339)
-- ---------------------------------------------------------------------------
create table sections (
    id              uuid primary key default uuid_generate_v4(),
    slug            text not null unique,              -- 'contact_cta', 'value_props', 'footer_gallery'
    kind            text not null,                     -- discriminator: 'cta' | 'value_props' | 'gallery' | 'newsletter' | ...
    config          jsonb not null default '{}'::jsonb,
    updated_at      timestamptz not null default now()
);

-- Which sections appear on which pages (excluding services, which all share defaults)
create table page_sections (
    id              uuid primary key default uuid_generate_v4(),
    page_id         uuid not null references pages(id) on delete cascade,
    section_id      uuid not null references sections(id) on delete cascade,
    sort_order      int not null default 0,
    unique (page_id, section_id)
);


-- ---------------------------------------------------------------------------
-- HOMEPAGE FEATURED SERVICES — the curated grid on the home page
-- (currently 15 of the 18 services are featured; layout is hand-curated)
-- ---------------------------------------------------------------------------
create table homepage_featured_services (
    id              uuid primary key default uuid_generate_v4(),
    service_id      uuid not null references services(id) on delete cascade unique,
    sort_order      int  not null default 0
);


-- ---------------------------------------------------------------------------
-- VALUE PROPS — the "Why us" 4-tile row on home + about
-- ---------------------------------------------------------------------------
create table value_props (
    id              uuid primary key default uuid_generate_v4(),
    title           text not null,                     -- 'ACCREDITED PROFESSIONALS'
    body            text,
    icon            text,                              -- icon name or media_id
    sort_order      int not null default 0
);


-- ---------------------------------------------------------------------------
-- CONTACT SUBMISSIONS — public form posts land here, editor reads only
-- ---------------------------------------------------------------------------
create table contact_submissions (
    id              uuid primary key default uuid_generate_v4(),
    full_name       text not null,
    email           citext not null,
    phone           text,
    treatment_interest text,                           -- 'Face' / 'Body' / 'Tattoo Removal' from the dropdown
    message         text,
    source_page     text,                              -- which page they submitted from
    user_agent      text,
    ip_hash         text,                              -- hashed for spam analysis, never plaintext IP
    received_at     timestamptz not null default now(),
    -- Workflow
    status          text not null default 'new',       -- 'new' | 'contacted' | 'archived'
    notes           text
);


-- ---------------------------------------------------------------------------
-- NEWSLETTER SUBSCRIBERS
-- ---------------------------------------------------------------------------
-- If using an external service (Mailchimp etc.), this might just be a log.
create table newsletter_subscribers (
    id              uuid primary key default uuid_generate_v4(),
    email           citext not null unique,
    source_page     text,
    subscribed_at   timestamptz not null default now(),
    unsubscribed_at timestamptz
);


-- ---------------------------------------------------------------------------
-- REDIRECTS — for preserving SEO when slugs change
-- ---------------------------------------------------------------------------
create table redirects (
    id              uuid primary key default uuid_generate_v4(),
    from_path       text not null unique,              -- '/services/old-slug/'
    to_path         text not null,                     -- '/services/new-slug/'
    status_code     int not null default 301,
    created_at      timestamptz not null default now()
);


-- ===========================================================================
-- ROW-LEVEL SECURITY
-- ===========================================================================
-- Two relevant roles besides the default Supabase ones:
--   - `anon`    — public site visitors. SELECT-only, published rows only.
--   - `editor`  — the MCP-server service role. Used by Claude voice commands.
--                 Can SELECT all rows, can INSERT/UPDATE on editable tables.
--                 Cannot DELETE published service pages (see RLS rules).
-- ===========================================================================

alter table site_settings              enable row level security;
alter table media                      enable row level security;
alter table pages                      enable row level security;
alter table service_categories         enable row level security;
alter table services                   enable row level security;
alter table service_category_assignments enable row level security;
alter table service_pricing            enable row level security;
alter table service_faqs               enable row level security;
alter table specials                   enable row level security;
alter table testimonials               enable row level security;
alter table founders                   enable row level security;
alter table certificates               enable row level security;
alter table sections                   enable row level security;
alter table page_sections              enable row level security;
alter table homepage_featured_services enable row level security;
alter table value_props                enable row level security;
alter table contact_submissions        enable row level security;
alter table newsletter_subscribers     enable row level security;
alter table redirects                  enable row level security;

-- Public read: published content only
create policy "public read pages"         on pages         for select to anon using (published_at is not null and published_at <= now());
create policy "public read services"      on services      for select to anon using (published_at is not null and published_at <= now());
create policy "public read specials"      on specials      for select to anon using (published_at is not null and published_at <= now());
create policy "public read testimonials"  on testimonials  for select to anon using (published_at is not null and published_at <= now());
create policy "public read founders"      on founders      for select to anon using (published_at is not null and published_at <= now());

-- Public read for ref tables (categories, pricing, FAQs, sections, media, value_props)
create policy "public read categories"    on service_categories for select to anon using (true);
create policy "public read sca"           on service_category_assignments for select to anon using (true);
create policy "public read pricing"       on service_pricing    for select to anon using (true);
create policy "public read faqs"          on service_faqs       for select to anon using (true);
create policy "public read media"         on media              for select to anon using (true);
create policy "public read sections"      on sections           for select to anon using (true);
create policy "public read page_sections" on page_sections      for select to anon using (true);
create policy "public read homepage_feat" on homepage_featured_services for select to anon using (true);
create policy "public read value_props"   on value_props        for select to anon using (true);
create policy "public read certificates"  on certificates       for select to anon using (true);
create policy "public read site_settings" on site_settings      for select to anon using (true);
create policy "public read redirects"     on redirects          for select to anon using (true);

-- Contact form submissions: anon can INSERT only (forms post here), never SELECT.
create policy "public insert contact"        on contact_submissions    for insert to anon with check (true);
create policy "public insert newsletter"     on newsletter_subscribers for insert to anon with check (true);

-- Editor role (for the MCP server): full access except where explicitly blocked.
-- The MCP write-permission model layer adds further restrictions on top.
-- See file 04-mcp-write-permissions.md for the detailed allow-list/deny-list.

-- Helper trigger: maintain updated_at on every write
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_pages_uat            before update on pages            for each row execute function set_updated_at();
create trigger trg_services_uat         before update on services         for each row execute function set_updated_at();
create trigger trg_service_pricing_uat  before update on service_pricing  for each row execute function set_updated_at();
create trigger trg_service_faqs_uat     before update on service_faqs     for each row execute function set_updated_at();
create trigger trg_specials_uat         before update on specials         for each row execute function set_updated_at();
create trigger trg_testimonials_uat     before update on testimonials     for each row execute function set_updated_at();
create trigger trg_founders_uat         before update on founders         for each row execute function set_updated_at();
create trigger trg_sections_uat         before update on sections         for each row execute function set_updated_at();
create trigger trg_site_settings_uat    before update on site_settings    for each row execute function set_updated_at();
