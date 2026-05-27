#!/usr/bin/env node
/**
 * Build transparent logo assets from public/images/logo-source.png
 * Run: npx --yes -p sharp@0.33.5 node scripts/process-logo.mjs
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'public/images/logo-source.png')
const outDir = path.join(root, 'public/images')

async function removeWhite(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r >= 248 && g >= 248 && b >= 248) data[i + 3] = 0
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png()
}

async function toLight(pipeline) {
  const { data, info } = await pipeline.clone().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a < 10) continue
    const isGold = r > 150 && g > 120 && b < 160 && r - b > 30
    if (isGold) continue
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    if (lum < 140) {
      data[i] = 250
      data[i + 1] = 248
      data[i + 2] = 246
    } else if (lum < 200) {
      data[i] = 229
      data[i + 1] = 212
      data[i + 2] = 207
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png()
}

const base = await removeWhite(src)
await base.toFile(path.join(outDir, 'logo.png'))
await (await toLight(base)).toFile(path.join(outDir, 'logo-light.png'))
await base.resize(240, 240).toFile(path.join(outDir, 'logo-email.png'))
console.log('Wrote logo.png, logo-light.png, logo-email.png')
