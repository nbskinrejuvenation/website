import { existsSync } from 'fs'
import path from 'path'

const PREVIEW_COUNT = 6
const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'] as const

const instagramDir = () => path.join(process.cwd(), 'public', 'images', 'instagram')

/**
 * Paths for the Instagram section grid.
 * Add files: public/images/instagram/1.png … 6.png (or .jpg / .webp)
 */
export function getInstagramPreviewImages(): string[] {
  const images: string[] = []

  for (let i = 1; i <= PREVIEW_COUNT; i++) {
    let found: string | null = null
    for (const ext of EXTENSIONS) {
      const filePath = path.join(instagramDir(), `${i}${ext}`)
      if (existsSync(filePath)) {
        found = `/images/instagram/${i}${ext}`
        break
      }
    }
    if (found) images.push(found)
  }

  return images
}
