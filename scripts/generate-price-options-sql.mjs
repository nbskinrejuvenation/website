#!/usr/bin/env node
/**
 * Turn the clinic price spreadsheet (exported as CSV) into SQL that loads
 * treatment_price_options. Reads a local file only and prints SQL to stdout;
 * nothing is written to the database until you run the output yourself.
 *
 *   node scripts/generate-price-options-sql.mjs prices.csv > price-options.sql
 *
 * Then paste price-options.sql into Supabase → SQL Editor (after applying
 * supabase/migrations/20261002_treatment_price_options.sql). Re-running it is
 * safe: existing rows are updated in place.
 *
 * Expected columns: Category, Treatment, Area, Single Price, Pack Quantity,
 * Package Price, Per Treatment in Package, Savings.
 */
import { readFileSync } from 'node:fs'

// Spreadsheet treatment names that don't normalise to the site slug.
const SHEET_TO_SLUG = {
  fibroblast: 'fibroblast-plasma',
  'fractional-rf-mude-o-nome-para-rf-needling': 'fractional-rf',
  'rf-needling': 'fractional-rf',
  microneedling: 'micro-needling',
  'hydra-facial': 'hydrodermabrasion',
  'pico-laser': 'pico-laser-pigmentation',
}

// Treatments that weren't bookable online before price rows existed.
const ENABLE_ONLINE_BOOKING = [
  'fractional-laser',
  'hifu',
  'laser-for-pigmentation',
  'laser-for-vascular-lesions',
  'laser-genesis',
  'laser-genesis-fractional-laser',
  'laser-hair-removal-for-face',
  'laser-hair-removal-lower-body',
  'laser-hair-removal-upper-body',
  'pico-laser-pigmentation',
]

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/generate-price-options-sql.mjs <prices.csv>')
  process.exit(1)
}

function normalise(value) {
  return value.toLowerCase().trim().replace(/&/g, 'and').replace(/\+/g, 'plus').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseCSV(text) {
  const rows = []
  let row = []
  let cell = ''
  let quote = false
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]
    const n = text[i + 1]
    if (c === '"' && quote && n === '"') { cell += '"'; i += 1; continue }
    if (c === '"') { quote = !quote; continue }
    if (c === ',' && !quote) { row.push(cell); cell = ''; continue }
    if ((c === '\n' || c === '\r') && !quote) {
      if (c === '\r' && n === '\n') i += 1
      row.push(cell)
      if (row.some(v => v.trim())) rows.push(row)
      row = []
      cell = ''
      continue
    }
    cell += c
  }
  if (cell || row.length) {
    row.push(cell)
    if (row.some(v => v.trim())) rows.push(row)
  }
  return rows
}

/**
 * Some amounts are exported unquoted ($1,344), so the comma splits them into
 * "$1" and "344" and shifts the rest of the row. Rejoin until the row fits.
 */
function repairSplitThousands(row, width) {
  const cells = [...row]
  for (let i = 0; i < cells.length - 1 && cells.length > width; ) {
    if (/^\$?\d{1,3}$/.test(cells[i].trim()) && /^\d{3}(\.\d+)?$/.test(cells[i + 1].trim())) {
      cells.splice(i, 2, `${cells[i].trim()}${cells[i + 1].trim()}`)
    } else {
      i += 1
    }
  }
  return cells
}

function toCents(value) {
  const match = (value ?? '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  return match ? Math.round(Number(match[1]) * 100) : null
}

function money(cents) {
  const dollars = cents / 100
  return `$${dollars.toLocaleString('en-AU', { maximumFractionDigits: 2 })}`
}

const sql = value => (value == null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`)

const rows = parseCSV(readFileSync(file, 'utf8'))
const header = rows[0].map(h => h.trim())
const col = Object.fromEntries(header.map((name, i) => [name, i]))
for (const name of ['Treatment', 'Area', 'Single Price', 'Pack Quantity', 'Package Price']) {
  if (col[name] == null) {
    console.error(`Missing column "${name}" in ${file}`)
    process.exit(1)
  }
}

const options = []
const problems = []
const slugs = new Map()
const sortBySlug = {}

rows.slice(1).forEach((raw, i) => {
  const line = i + 2
  const row = raw.length > header.length ? repairSplitThousands(raw, header.length) : raw
  if (row.length !== header.length) {
    problems.push(`line ${line}: ${row.length} cells after repair, expected ${header.length}; skipped`)
    return
  }
  const treatment = row[col.Treatment]?.trim()
  const area = row[col.Area]?.trim()
  if (!treatment || !area) return

  const key = normalise(treatment)
  const slug = SHEET_TO_SLUG[key] ?? key
  slugs.set(slug, treatment)

  const single = toCents(row[col['Single Price']])
  if (single != null) {
    sortBySlug[slug] = (sortBySlug[slug] ?? 0) + 1
    options.push({ slug, group: 'Single sessions', label: area, cents: single, sessions: 1, subtitle: 'One session', sort: sortBySlug[slug] })
  }

  const qty = Number.parseInt(row[col['Pack Quantity']] ?? '', 10)
  const pack = toCents(row[col['Package Price']])
  if (Number.isFinite(qty) && qty > 1 && pack != null) {
    const per = toCents(row[col['Per Treatment in Package']])
    const savings = toCents(row[col.Savings])
    if (single != null && pack <= single) {
      problems.push(`line ${line}: ${treatment} / ${area} pack of ${qty} is ${money(pack)}, not more than one session (${money(single)}); skipped`)
      return
    }
    const subtitle = [per != null ? `${money(per)} per session` : '', savings ? `Save ${money(savings)}` : ''].filter(Boolean).join(', ')
    options.push({ slug, group: `Pack of ${qty}`, label: area, cents: pack, sessions: qty, subtitle: subtitle || null, sort: 1000 + qty * 100 + (sortBySlug[slug] ?? 0) })
  }
})

const out = []
out.push('-- Generated by scripts/generate-price-options-sql.mjs from ' + file.split('/').pop())
out.push(`-- ${options.length} price rows across ${slugs.size} spreadsheet treatments.`)
for (const p of problems) out.push(`-- WARNING ${p}`)
out.push('', 'BEGIN;', '')
for (const o of options) {
  out.push(
    `INSERT INTO treatment_price_options (treatment_id, group_name, label, price_cents, session_count, subtitle, sort_order)\n` +
      `SELECT id, ${sql(o.group)}, ${sql(o.label)}, ${o.cents}, ${o.sessions}, ${sql(o.subtitle)}, ${o.sort} FROM treatments WHERE slug = ${sql(o.slug)}\n` +
      `ON CONFLICT (treatment_id, group_name, label) DO UPDATE SET price_cents = EXCLUDED.price_cents, session_count = EXCLUDED.session_count, subtitle = EXCLUDED.subtitle, sort_order = EXCLUDED.sort_order, active = true, updated_at = now();`,
  )
}
out.push(
  '',
  '-- Treatments with no base online price take their cheapest single session,',
  '-- keeping price_from = price_cents / 100 as Admin → Treatments does.',
  `UPDATE treatments t SET price_cents = o.min_cents, price_from = ROUND(o.min_cents / 100.0), updated_at = now()`,
  `FROM (SELECT treatment_id, MIN(price_cents) AS min_cents FROM treatment_price_options WHERE active AND session_count = 1 GROUP BY treatment_id) o`,
  `WHERE o.treatment_id = t.id AND t.price_cents IS NULL;`,
  '',
  `UPDATE treatments SET bookable_online = true, updated_at = now()`,
  `WHERE slug IN (${ENABLE_ONLINE_BOOKING.map(sql).join(', ')}) AND price_cents IS NOT NULL;`,
  '',
  'COMMIT;',
  '',
  '-- Check: published treatments that ended up with no price rows (spreadsheet',
  '-- name didn\'t match a slug). Add them to SHEET_TO_SLUG and re-run.',
  `SELECT slug FROM treatments t WHERE status = 'published'`,
  `AND NOT EXISTS (SELECT 1 FROM treatment_price_options o WHERE o.treatment_id = t.id);`,
)
console.log(out.join('\n'))

console.error(`${options.length} price rows, ${problems.length} warnings.`)
for (const p of problems) console.error(`  ${p}`)
