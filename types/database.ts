/**
 * Hand-maintained TypeScript types aligned to the actual Supabase schema.
 * Source of truth: types/database.generated.ts (run `npm run db:types` to refresh).
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ContentStatus = 'draft' | 'published'
export type TreatmentCategory = 'face' | 'body'

// ─── Site Settings ────────────────────────────────────────────────────────────

export interface SiteSettings {
  id: string
  business_name: string | null
  phone: string | null
  address: string | null
  suburb: string | null
  state: string | null
  postcode: string | null
  lat: number | null
  lng: number | null
  facebook_url: string | null
  instagram_url: string | null
  booking_url: string | null
  updated_at: string | null
}

// ─── Pages ────────────────────────────────────────────────────────────────────

export interface Page {
  id: string
  slug: string
  title: string
  body_html: string | null
  seo_title: string | null
  seo_description: string | null
  status: ContentStatus | null
  updated_at: string | null
}

// ─── Treatments ───────────────────────────────────────────────────────────────

export interface Treatment {
  id: string
  slug: string
  title: string
  subtitle: string | null
  summary: string | null
  body_html: string | null
  hero_image: string | null       // Direct URL (not a media FK)
  og_image_url: string | null
  category: TreatmentCategory
  status: ContentStatus | null
  sort_order: number | null
  seo_title: string | null
  seo_description: string | null
  schema_faq: Array<{ question: string; answer: string }> | null
  created_at: string | null
  updated_at: string | null
}

/** Lightweight version for cards/listings */
export type TreatmentCard = Pick<
  Treatment,
  'id' | 'slug' | 'title' | 'subtitle' | 'hero_image' | 'category' | 'sort_order'
>

// ─── Specials ─────────────────────────────────────────────────────────────────

export interface Special {
  id: string
  title: string
  description: string | null
  image_url: string | null
  status: ContentStatus | null
  valid_from: string | null
  valid_to: string | null
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string
  client_name: string
  body: string
  treatment_ref: string | null
  avatar_url: string | null
  is_featured: boolean | null
  sort_order: number | null
  status: ContentStatus | null
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  id: string
  label: string
  href: string | null
  parent_id: string | null
  is_visible: boolean | null
  sort_order: number | null
}
