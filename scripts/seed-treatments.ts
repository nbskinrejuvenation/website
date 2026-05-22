/**
 * Seed script: maps project-docs/01-services-crawl.json → treatments table SQL.
 *
 * Usage:
 *   npx tsx scripts/seed-treatments.ts
 *
 * Output:
 *   scripts/seed-treatments.sql  ← paste this into Supabase SQL editor and run.
 */

import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// ─── Types from the JSON ──────────────────────────────────────────────────────

interface ServiceEntry {
  h1: string
  category: string[]
  taglines?: string[]
  subtitle_hero?: string
  faq?: string[]
  pricing?: string[]
  pack_size?: number | null
  recommended_for?: string[]
}

interface CrawlFile {
  services: Record<string, ServiceEntry>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fixTypos(text: string): string {
  return text
    .replace(/Unever skin tone/gi, 'Uneven skin tone')
    .replace(/bemishes/gi, 'blemishes')
    .replace(/Acne scaring/gi, 'Acne scarring')
    .replace(/medi-easthetic/gi, 'medi-aesthetic')
}

function escape(s: string): string {
  return s.replace(/'/g, "''")
}

/**
 * Build minimal body_html from the crawled fields.
 * The client will flesh this out via the CMS — this gives them a working page from day one.
 */
function buildBodyHtml(slug: string, entry: ServiceEntry): string {
  const parts: string[] = []

  // Taglines as a lead paragraph
  if (entry.taglines?.length) {
    const lead = fixTypos(entry.taglines[0])
    parts.push(`<p class="lead">${lead}</p>`)
  }

  // Recommended for
  if (entry.recommended_for?.length) {
    const items = entry.recommended_for
      .map(r => `<li>${fixTypos(r)}</li>`)
      .join('\n')
    parts.push(`<h2>Recommended for</h2>\n<ul>\n${items}\n</ul>`)
  }

  // Pricing
  if (entry.pricing?.length) {
    // Split into single-session and pack rows (packs contain "per session")
    const singles = entry.pricing.filter(p => !p.includes('per session'))
    const packs   = entry.pricing.filter(p =>  p.includes('per session'))

    parts.push('<h2>Pricing</h2>')

    if (singles.length) {
      const rows = singles
        .map(p => `<tr><td>${fixTypos(p)}</td></tr>`)
        .join('\n')
      parts.push(
        `<h3>Single sessions</h3>\n<table>\n<tbody>\n${rows}\n</tbody>\n</table>`,
      )
    }

    if (packs.length && entry.pack_size) {
      const rows = packs
        .map(p => `<tr><td>${fixTypos(p)}</td></tr>`)
        .join('\n')
      parts.push(
        `<h3>Pack of ${entry.pack_size}</h3>\n<table>\n<tbody>\n${rows}\n</tbody>\n</table>`,
      )
    }
  }

  // FAQ questions (no answers yet — placeholder)
  if (entry.faq?.length) {
    const items = entry.faq
      .map(q => `<li><strong>${fixTypos(q)}</strong></li>`)
      .join('\n')
    parts.push(`<h2>Frequently asked questions</h2>\n<ul>\n${items}\n</ul>`)
  }

  return parts.join('\n\n')
}

/**
 * Build schema_faq JSON — questions only for now; answers to be filled in via CMS.
 * We include placeholder answers so the column is non-null and the accordion renders.
 */
function buildSchemaFaq(faq: string[] | undefined): string | null {
  if (!faq?.length) return null
  const items = faq.map(q => ({
    question: fixTypos(q),
    answer: 'Contact us for more information about this treatment.',
  }))
  return JSON.stringify(items)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const crawlPath = path.join(
  path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)),
  '..',
  'project-docs',
  '01-services-crawl.json',
)

const crawl: CrawlFile = JSON.parse(fs.readFileSync(crawlPath, 'utf8'))
const entries = Object.entries(crawl.services)

const rows: string[] = []

entries.forEach(([slug, entry], index) => {
  const id        = randomUUID()
  const title     = fixTypos(entry.h1)
  const subtitle  = entry.subtitle_hero
    ? fixTypos(entry.subtitle_hero)
    : (entry.taglines?.[1] ? fixTypos(entry.taglines[1]) : null)
  const summary   = entry.taglines?.[0] ? fixTypos(entry.taglines[0]) : null
  const bodyHtml  = buildBodyHtml(slug, entry)
  const schemaFaq = buildSchemaFaq(entry.faq)

  // DB only supports a single enum — use first listed category.
  // fibroblast-plasma lists ["face","body"]; we keep it in "face" since
  // the /services page groups by category and it was listed under face.
  const category  = entry.category[0] === 'body' ? 'body' : 'face'

  const seoTitle  = `${title} | Naturally Beautiful Skin Rejuvenation`
  const seoDesc   = summary
    ? `${summary} Treatment available in Dee Why, Northern Beaches, Sydney.`
    : `${title} treatment at Naturally Beautiful Skin Rejuvenation, Dee Why NSW.`

  const sortOrder = index + 1

  rows.push(`(
  '${id}',                          -- id
  '${escape(slug)}',                -- slug
  '${escape(title)}',               -- title
  ${subtitle  ? `'${escape(subtitle)}'`  : 'NULL'},  -- subtitle
  ${summary   ? `'${escape(summary)}'`   : 'NULL'},  -- summary
  '${escape(bodyHtml)}',            -- body_html
  NULL,                             -- hero_image  (upload via Supabase Storage)
  NULL,                             -- og_image_url
  '${category}',                    -- category
  'published',                      -- status
  ${sortOrder},                     -- sort_order
  '${escape(seoTitle)}',            -- seo_title
  '${escape(seoDesc)}',             -- seo_description
  ${schemaFaq ? `'${escape(schemaFaq)}'::jsonb` : 'NULL'},  -- schema_faq
  NOW(),                            -- created_at
  NOW()                             -- updated_at
)`)
})

const sql = `-- ============================================================
-- Seed: treatments (18 services from 01-services-crawl.json)
-- Generated: ${new Date().toISOString()}
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Clear existing rows first (safe to re-run)
TRUNCATE treatments RESTART IDENTITY CASCADE;

INSERT INTO treatments (
  id, slug, title, subtitle, summary, body_html,
  hero_image, og_image_url, category, status, sort_order,
  seo_title, seo_description, schema_faq, created_at, updated_at
) VALUES
${rows.join(',\n')};

-- Verify
SELECT slug, title, category, status FROM treatments ORDER BY sort_order;
`

const outPath = path.join(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)), 'seed-treatments.sql')
fs.writeFileSync(outPath, sql, 'utf8')
console.log(`✓ Written to ${outPath}`)
console.log(`  ${entries.length} treatment rows ready to insert.`)
