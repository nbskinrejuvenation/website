/**
 * Extracts structured pricing data from a treatment's body_html.
 *
 * The body_html stores pricing as HTML tables under <h2>Pricing</h2>.
 * Each <h3> is a pricing group (e.g. "Single sessions", "Pack of 3").
 * Each <td> holds one item as plain text: "{Label} {Price} {Subtitle}".
 *
 * Example TD text:
 *   "Face only $140 One session"
 *   "Back From $300 One session"
 *   "Face only $336 $112 per session, Save $84"
 */

export interface PricingItem {
  label: string
  price: string
  subtitle?: string
}

export interface PricingGroup {
  name: string
  items: PricingItem[]
}

/** Parse one TD text string into a structured PricingItem. */
function parsePricingItem(raw: string): PricingItem | null {
  const text = raw.replace(/<[^>]+>/g, '').trim()
  if (!text) return null

  // Match: {label} {optional "From "} ${digits} {optional subtitle}
  const match = text.match(/^(.*?)\s+((?:From\s+)?\$[\d,]+)\s*(.*)$/i)
  if (!match) return null

  return {
    label: match[1].trim(),
    price: match[2].trim(),
    subtitle: match[3].trim() || undefined,
  }
}

/**
 * Parse all pricing groups from a treatment's body_html.
 * Returns null if no <h2>Pricing</h2> section is found.
 */
export function parsePricing(bodyHtml: string): PricingGroup[] | null {
  // Isolate the <h2>Pricing</h2> section up to the next <h2> or end of string
  const sectionMatch = bodyHtml.match(
    /<h2[^>]*>\s*Pricing\s*<\/h2>([\s\S]*?)(?=<h2[^>]*>|$)/i,
  )
  if (!sectionMatch) return null

  const sectionHtml = sectionMatch[1]
  const groups: PricingGroup[] = []

  // Split on <h3> tags — each one starts a new pricing group
  const h3Pattern = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3[^>]*>|$)/gi
  let h3Match: RegExpExecArray | null

  while ((h3Match = h3Pattern.exec(sectionHtml)) !== null) {
    const name = h3Match[1].replace(/<[^>]+>/g, '').trim()
    const tableHtml = h3Match[2]

    // Extract each <td> as a pricing item
    const items: PricingItem[] = []
    const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi
    let tdMatch: RegExpExecArray | null

    while ((tdMatch = tdPattern.exec(tableHtml)) !== null) {
      const item = parsePricingItem(tdMatch[1])
      if (item) items.push(item)
    }

    if (items.length > 0) {
      groups.push({ name, items })
    }
  }

  return groups.length > 0 ? groups : null
}

/**
 * Remove the <h2>Pricing</h2> section (and all its tables) from body_html.
 * Used so the raw HTML body doesn't duplicate the styled pricing component.
 */
export function stripPricingSection(bodyHtml: string): string {
  return bodyHtml
    .replace(/<h2[^>]*>\s*Pricing\s*<\/h2>[\s\S]*?(?=<h2[^>]*>|$)/i, '')
    .trim()
}

/**
 * Parse the "Recommended for" <ul> items from body_html.
 * Returns an array of plain-text condition strings, or null if section not found.
 */
export function parseRecommendedFor(bodyHtml: string): string[] | null {
  const sectionMatch = bodyHtml.match(
    /<h2[^>]*>\s*Recommended\s+for\s*<\/h2>\s*<ul[^>]*>([\s\S]*?)<\/ul>/i,
  )
  if (!sectionMatch) return null

  const listHtml = sectionMatch[1]
  const items: string[] = []
  const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let liMatch: RegExpExecArray | null

  while ((liMatch = liPattern.exec(listHtml)) !== null) {
    const text = liMatch[1].replace(/<[^>]+>/g, '').trim()
    if (text) items.push(text)
  }

  return items.length > 0 ? items : null
}

/**
 * Remove the "Recommended for" section from body_html.
 * Used so the raw HTML body doesn't duplicate the styled pills component.
 */
export function stripRecommendedForSection(bodyHtml: string): string {
  return bodyHtml
    .replace(/<h2[^>]*>\s*Recommended\s+for\s*<\/h2>\s*<ul[^>]*>[\s\S]*?<\/ul>/i, '')
    .trim()
}

/**
 * Remove the leading <p class="lead"> paragraph.
 * Its content equals the treatment's summary field, which is shown in TreatmentIntro.
 */
export function stripLeadParagraph(bodyHtml: string): string {
  return bodyHtml
    .replace(/<p[^>]*class="lead"[^>]*>[\s\S]*?<\/p>/i, '')
    .trim()
}

/**
 * Remove the stub <h2>Frequently asked questions</h2> block from body_html.
 * The real FAQ (with answers) is rendered via TreatmentFAQ from schema_faq.
 */
export function stripFaqSection(bodyHtml: string): string {
  return bodyHtml
    .replace(/<h2[^>]*>\s*Frequently\s+asked\s+questions\s*<\/h2>[\s\S]*?(?=<h2[^>]*>|$)/i, '')
    .trim()
}
