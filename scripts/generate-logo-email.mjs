#!/usr/bin/env node
/**
 * Renders public/images/logo.svg → logo-email.png (480px) for email clients.
 * Run: npx --yes -p @resvg/resvg-js node scripts/generate-logo-email.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = path.join(root, 'public/images/logo.svg')
const outPath = path.join(root, 'public/images/logo-email.png')

const svg = fs.readFileSync(svgPath)
const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 480 } })
fs.writeFileSync(outPath, resvg.render().asPng())
console.log(`Wrote ${outPath}`)
