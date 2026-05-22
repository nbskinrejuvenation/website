import { existsSync } from 'fs'
import path from 'path'

const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'] as const

const treatmentsDir = () =>
  path.join(process.cwd(), 'public', 'images', 'treatments')

/** Resolve hero URL: Supabase `hero_image` first, else `public/images/treatments/{slug}.*` */
export function resolveTreatmentHeroUrl(
  slug: string,
  heroImage: string | null | undefined,
): string | null {
  if (heroImage?.trim()) return heroImage.trim()

  for (const ext of EXTENSIONS) {
    const filePath = path.join(treatmentsDir(), `${slug}${ext}`)
    if (existsSync(filePath)) {
      return `/images/treatments/${slug}${ext}`
    }
  }

  return null
}

export function withResolvedHeroImage<
  T extends { slug: string; hero_image: string | null },
>(treatment: T): T {
  return {
    ...treatment,
    hero_image: resolveTreatmentHeroUrl(treatment.slug, treatment.hero_image),
  }
}
