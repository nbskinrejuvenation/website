# MCP Write-Permission Model

**Purpose:** Define exactly what a non-technical editor can change via Claude voice commands, what requires confirmation, and what is locked.

---

## Architecture overview

```
┌──────────────┐    voice    ┌────────────┐    MCP tools     ┌─────────────────┐
│ Editor (Lily)│ ──────────▶ │ Claude app │ ───────────────▶ │ MCP server      │
└──────────────┘             └────────────┘                  │ (Cloudflare      │
                                                             │  Worker)         │
                                                             └────────┬─────────┘
                                                                      │ service-role JWT
                                                                      │ (PostgREST)
                                                                      ▼
                                                             ┌─────────────────┐
                                                             │ Supabase DB     │
                                                             └─────────────────┘
```

**Two important properties of this design:**

1. **Claude never gets a service-role key.** The MCP server holds the key. Claude calls semantic tools like `update_service_price`, not raw SQL.
2. **Every write tool has a built-in confirmation rule.** Claude is instructed to read back the change and require an explicit "yes" before calling the write. This is enforced both in the MCP server's prompt and again at the tool boundary for high-risk ops (pricing, contact details, deletions).

---

## Permission tiers

Every editable thing falls into one of these tiers. The tier determines what tools the MCP server exposes for it.

| Tier | What it means | Examples |
|---|---|---|
| **Locked**  | No tool exposed. Editor cannot change via voice; needs developer. | URL slugs, navigation structure, schema, RLS policies, `services` table deletions |
| **Direct**  | Single voice command → write happens. Confirmation is conversational, not mandatory. | Adding a testimonial, editing a service description, updating a hero tagline |
| **Confirmed** | Voice command requires explicit "yes" before write executes. The MCP tool returns a `pending_confirmation` token; only a second tool call with that token commits the change. | **Any price change**, contact details, deleting testimonials/specials, swapping the logo, publishing/unpublishing |
| **Restricted** | Like Confirmed, but also requires a typed pass-phrase from the editor (entered via the Claude app, not voice). | Deleting a service entirely, deleting all submissions, dropping a redirect that has live traffic |

---

## Tier assignments per table

| Table | Field/operation | Tier | Why |
|---|---|---|---|
| `site_settings` | `phone`, `email`, `address_*` | **Confirmed** | Customers call/email/visit these. A typo costs real business. Claude reads back the new value and waits for "yes". |
| `site_settings` | `parking_note`, `tagline`, `copyright_text`, social URLs | **Direct** | Lower stakes, easy to spot and fix. |
| `site_settings` | `logo_media_id`, `business_name`, `site_lang` | **Restricted** | Almost never changes; high blast radius. |
| `pages` | `title`, `hero_*`, `body`, SEO fields | **Direct** | Copy edits. |
| `pages` | `published_at` (publishing/unpublishing) | **Confirmed** | Unpublishing the contact page is a serious outage. |
| `pages` | INSERT / DELETE | **Locked** | Editor cannot add or remove the 4 core pages; structure is fixed. |
| `pages.slug` | UPDATE | **Locked** | URL changes break SEO and inbound links. |
| `services` | `name`, `hero_tagline`, `intro`, `recommended_for`, `benefits`, `how_it_works_*`, `pre_post_*`, SEO fields | **Direct** | Copy. |
| `services` | `hero_image_id`, `og_image_id` | **Confirmed** | Image swaps are highly visible; easy to pick wrong one. |
| `services` | `pack_size`, `pack_label` | **Confirmed** | Affects all pricing math. |
| `services` | `published_at` | **Confirmed** | Hiding a service from the public site. |
| `services` | INSERT (add a new service) | **Confirmed** | Allowed but rare — needs slug, name, category. |
| `services` | DELETE | **Restricted** | Almost never the right move; voice-deletable services are dangerous (loses URL = SEO loss). Suggest unpublish instead. |
| `services.slug` | UPDATE | **Locked** | URL change. Use a `redirects` row instead. |
| `service_pricing` | INSERT / UPDATE / DELETE | **Confirmed** | **The single highest-value voice command target, and the highest-risk.** Always read back the variant + old → new price. |
| `service_faqs` | INSERT / UPDATE / DELETE | **Direct** | Q&A churn is normal. |
| `service_category_assignments` | All operations | **Confirmed** | Moving a service between Face/Body changes nav structure. |
| `service_categories` | INSERT / UPDATE / DELETE | **Locked** | Only 2 categories exist by design. Adding a third needs frontend work. |
| `specials` | All operations | **Direct** for INSERT/UPDATE, **Confirmed** for DELETE | Specials are meant to rotate; adding one should feel light. |
| `testimonials` | All operations | **Direct** | Same rationale. |
| `founders.bio`, `founders.role` | UPDATE | **Direct** | |
| `founders` | INSERT / DELETE | **Restricted** | One founder profile exists; almost never changes. |
| `certificates` | INSERT / UPDATE / DELETE | **Direct** | |
| `sections.config`, reusable section content | UPDATE | **Direct** | |
| `sections` | INSERT / DELETE | **Locked** | Section types are defined by the frontend code. |
| `page_sections` (which sections appear where) | All operations | **Locked** | Layout decision. |
| `homepage_featured_services` | All operations | **Confirmed** | Changing which services appear on home is a marketing decision. |
| `value_props` | UPDATE | **Direct** | |
| `value_props` | INSERT / DELETE | **Confirmed** | 4 slots is the layout assumption. |
| `media` | INSERT (uploading new images) | **Direct** | Editor can upload. |
| `media` | UPDATE (alt text, filename) | **Direct** | |
| `media` | DELETE | **Restricted** | Might be in use; deletion needs a check. |
| `contact_submissions` | SELECT, UPDATE status | **Direct** | Reading inbox; marking contacted. |
| `contact_submissions` | DELETE | **Locked** | Compliance/legal: keep submissions. |
| `newsletter_subscribers` | SELECT | **Direct** | |
| `newsletter_subscribers` | DELETE | **Restricted** | Spam-removal only. |
| `redirects` | INSERT | **Direct** | Helping SEO. |
| `redirects` | UPDATE / DELETE | **Restricted** | A wrong delete here breaks an inbound link. |

---

## MCP tools surface (the actual functions Claude calls)

Each tool is named for the user intent, not the table. Internally, the MCP server validates inputs, looks up the right rows, and performs the write. Tools that touch Confirmed/Restricted operations always include a `confirm: boolean` parameter that defaults to `false` and returns a preview.

### Site-wide

| Tool | Tier | Description |
|---|---|---|
| `get_site_settings` | read | Returns current contact details, social links, etc. |
| `update_contact_phone(new_phone, confirm)` | Confirmed | New phone is normalized to AU format. Returns preview if `!confirm`. |
| `update_contact_email(new_email, confirm)` | Confirmed | |
| `update_address(line1, suburb, state, postcode, confirm)` | Confirmed | |
| `update_parking_note(text)` | Direct | |
| `update_social(facebook_url?, instagram_url?)` | Direct | |
| `update_tagline(text)` | Direct | |

### Services (content)

| Tool | Tier | Description |
|---|---|---|
| `find_service(query)` | read | Search by name/slug. Always call this first when the editor names a service. |
| `get_service(slug)` | read | Full detail. |
| `update_service_text(slug, fields)` | Direct | Fields = `{ hero_tagline, intro, recommended_for, benefits, how_it_works_body, pre_post_body, seo_description }` |
| `update_service_image(slug, field, media_id, confirm)` | Confirmed | field ∈ `hero_image_id`, `og_image_id` |
| `publish_service(slug, confirm)` / `unpublish_service(slug, confirm)` | Confirmed | |
| `add_service(name, slug, category_slugs[], confirm)` | Confirmed | Returns a draft service. |
| `delete_service(slug, pass_phrase)` | Restricted | Requires typed pass-phrase. Suggests `unpublish_service` first. |

### Services (pricing)

| Tool | Tier | Description |
|---|---|---|
| `list_service_pricing(slug)` | read | Returns all rows for that service with IDs. |
| `update_price(pricing_id, new_price_cents, confirm)` | Confirmed | Reads back: "Carbon Peel — Face only: change from $140 to $160. Confirm?" |
| `update_pack_price(pricing_id, new_total_cents, confirm)` | Confirmed | Recomputes per-session and savings. |
| `add_pricing_variant(service_slug, variant_label, single_price_cents, pack_price_cents?, confirm)` | Confirmed | |
| `remove_pricing_variant(pricing_id, confirm)` | Confirmed | |

### FAQs

| Tool | Tier | Description |
|---|---|---|
| `list_faqs(service_slug)` | read | |
| `add_faq(service_slug, question, answer)` | Direct | |
| `update_faq(faq_id, question?, answer?)` | Direct | |
| `delete_faq(faq_id)` | Direct | |
| `reorder_faqs(service_slug, ordered_ids[])` | Direct | |

### Specials & testimonials

| Tool | Tier | Description |
|---|---|---|
| `list_specials(active_only?)` | read | |
| `add_special(title, body, cta_label?, cta_url?, start_at?, end_at?)` | Direct | |
| `update_special(id, fields)` | Direct | |
| `delete_special(id, confirm)` | Confirmed | |
| `list_testimonials(featured_on?)` | read | |
| `add_testimonial(client_name, quote, treatment_text?, featured_on?[])` | Direct | |
| `update_testimonial(id, fields)` | Direct | |
| `delete_testimonial(id)` | Direct | |

### Media

| Tool | Tier | Description |
|---|---|---|
| `upload_media(filename, base64_or_url, alt_text)` | Direct | alt_text required. Server validates filetype, size, and SVG safety. |
| `update_media_alt(id, alt_text)` | Direct | |
| `delete_media(id, pass_phrase)` | Restricted | Server first checks no row in any table references this media. |

### Submissions (read-only inbox)

| Tool | Tier | Description |
|---|---|---|
| `list_submissions(status?, since?)` | read | |
| `mark_submission_contacted(id, notes?)` | Direct | |

---

## Confirmation flow (canonical pattern)

For every Confirmed-tier tool, the flow looks like:

```
USER:    "Change the Carbon Peel face-only price to one-hundred-sixty"
CLAUDE:  [calls find_service("carbon peel") → finds slug]
         [calls list_service_pricing("carbon-peel") → finds pricing_id for "Face only" single]
         [calls update_price(pricing_id, 16000, confirm=false)]
SERVER:  {
           pending_token: "pcg_8f1a...",
           preview: {
             service: "Carbon Peel",
             variant: "Face only (single session)",
             old_price: "$140",
             new_price: "$160",
             expires_in_seconds: 120
           }
         }
CLAUDE:  "I'm about to change the Carbon Peel face-only single-session price
          from $140 to $160. Confirm?"
USER:    "Yes"
CLAUDE:  [calls update_price(pricing_id, 16000, confirm=true, token="pcg_8f1a...")]
SERVER:  ✓ Updated. New price live in 1–2 minutes (after revalidate webhook).
```

The token expires after 2 minutes. If the user says anything other than a clear yes, Claude does not call the confirm step.

---

## Audit log

Every successful write also goes into an `audit_log` table (not shown in the schema — append-only):

```sql
create table audit_log (
    id            uuid primary key default uuid_generate_v4(),
    actor         text not null,             -- 'voice-editor:lily' or similar
    tool          text not null,             -- 'update_price'
    target_table  text not null,
    target_id     uuid,
    before        jsonb,
    after         jsonb,
    confirmed_via text,                      -- 'voice' | 'pass_phrase' | 'auto'
    at            timestamptz not null default now()
);
```

This gives full undoability — if Lilian changes a price by mistake, you can find the previous value in `audit_log.before` and revert.

---

## Out of scope for voice (the "Locked" list, restated)

The following can only be changed by a developer with direct database access:

- URL slugs (`pages.slug`, `services.slug`)
- Categories (face/body — adding a third needs frontend work)
- Adding or removing the 4 main pages
- Form field definitions (the contact form's structure)
- Schema (tables, columns, constraints, RLS policies)
- The header/footer layout — only the content within reusable sections is editable
- The newsletter signup form's destination
- Anything not explicitly listed in the tool surface above
