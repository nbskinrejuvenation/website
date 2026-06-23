import { createPublicClient } from '@/lib/supabase/public'
import { withResolvedHeroImage } from '@/lib/images/treatment-hero'
import { unstable_cache } from 'next/cache'
import type { Treatment, TreatmentCard } from '@/types/database'

const SPREADSHEET_PRICE_FROM: Record<string, number> = {"carbon-peel":170.0,"ems-for-muscle-gain":140.0,"ems-pelvic-floor":140.0,"fibroblast":70.0,"fractional-rf-mude-o-nome-para-rf-needling":200.0,"hifu":200.0,"hydrodermabrasion":160.0,"kumashape":120.0,"medi-peels-5-berry-and-tca":170.0,"medi-peels-vit-a":120.0,"medi-peels-tretinoin":170.0,"microdermabrasion":100.0,"microneedling":60.0,"radio-frequency":90.0,"tattoo-removal":50.0,"tattoo-removal-with-saline-solution":200.0,"zena-algae-peel":350.0,"laser-rejuvenation":170.0,"pico-laser-pigmentation":150.0,"laser-for-nail-fungus":70.0,"laser-hair-removal-upper-body":10.0,"laser-hair-removal-lower-body":15.0,"laser-hair-removal-for-face":15.0,"add-on-areas":12.0,"laser-for-vascular-lesions":70.0,"laser-for-pigmentation":120.0,"fractional-laser":180.0,"laser-genesis":180.0,"laser-genesis-plus-fractional-laser":280.0,"add-on-to-all-facial-treatments":40.0}
const SPREADSHEET_PRICE_ALIASES: Record<string, string> = {"fractional-rf":"fractional-rf-mude-o-nome-para-rf-needling","rf-needling":"fractional-rf-mude-o-nome-para-rf-needling","fibroblast-plasma":"fibroblast","hydra-facial":"hydrodermabrasion","micro-needling":"microneedling","pico-laser":"pico-laser-pigmentation","laser-genesis-fractional-laser":"laser-genesis-plus-fractional-laser","add-on-to-all-facial-treatments":"add-on-to-all-facial-treatments"}

function normalisePriceKey(value: string): string {
  return value.toLowerCase().trim().replace(/&/g, 'and').replace(/\+/g, 'plus').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function spreadsheetPriceFrom(slug?: string | null, title?: string | null): number | null {
  const keys = [slug, title].filter(Boolean).map(value => normalisePriceKey(value!))
  for (const key of keys) {
    const canonical = SPREADSHEET_PRICE_ALIASES[key] ?? key
    const price = SPREADSHEET_PRICE_FROM[canonical]
    if (price != null) return price
  }
  return null
}

function applySpreadsheetPrice<T extends { slug: string; title?: string | null; price_from?: number | null }>(treatment: T): T {
  const price = spreadsheetPriceFrom(treatment.slug, treatment.title)
  return price != null ? { ...treatment, price_from: price } : treatment
}

/** All published treatments — used for nav, index page, sitemap, generateStaticParams. */
export const getAllServices = unstable_cache(
  async (): Promise<TreatmentCard[]> => {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('treatments')
      .select('id, slug, title, subtitle, hero_image, category, sort_order, price_from')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`getAllServices: ${error.message}`)
    return ((data ?? []) as TreatmentCard[])
      .map(withResolvedHeroImage)
      .map(applySpreadsheetPrice)
  },
  ['all-services'],
  { tags: ['services'], revalidate: 60 },
)

/** Single published treatment by slug — used in /services/[slug]. */
export const getServiceBySlug = unstable_cache(
  async (slug: string): Promise<Treatment | null> => {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`getServiceBySlug(${slug}): ${error.message}`)
    }

    return applySpreadsheetPrice(withResolvedHeroImage(data as Treatment))
  },
  ['service-by-slug'],
  { tags: ['services'], revalidate: 60 },
)

/** Preview variant — fetches draft + published. Not cached. */
export async function getServiceBySlugPreview(slug: string): Promise<Treatment | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getServiceBySlugPreview(${slug}): ${error.message}`)
  }
  return applySpreadsheetPrice(withResolvedHeroImage(data as Treatment))
}

/** Treatments grouped by category — used for nav dropdowns. */
export const getServicesByCategory = unstable_cache(
  async (): Promise<Record<string, TreatmentCard[]>> => {
    const treatments = await getAllServices()
    return treatments.reduce<Record<string, TreatmentCard[]>>((acc, t) => {
      if (!acc[t.category]) acc[t.category] = []
      acc[t.category].push(t)
      return acc
    }, {})
  },
  ['services-by-category'],
  { tags: ['services'], revalidate: 60 },
)

/** All published slugs for generateStaticParams. */
export async function getAllServiceSlugs(): Promise<string[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('treatments')
    .select('slug')
    .eq('status', 'published')

  return (data ?? []).map(t => t.slug)
}
