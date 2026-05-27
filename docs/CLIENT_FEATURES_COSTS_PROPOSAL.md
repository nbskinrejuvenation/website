# Client Proposal: Website + Clinic Operations Platform

This document summarizes the complete solution now in place for Naturally Beautiful Skin Rejuvenation, including feature scope, ongoing monthly costs, Stripe charging model, and a direct comparison against the previous website.

## 1) Executive summary

The new platform is no longer just a marketing website. It is a clinic operations system that combines:

- Public website + treatment content
- Online consultations and paid treatment booking
- Client self-service reschedule/cancel links
- Automated reminders (email + optional SMS)
- Admin portal for daily clinic operations
- Revenue and booking reporting
- Promotions and treatment packages

In practice, this replaces several manual tasks previously done by phone, DMs, spreadsheets, and third-party booking tools.

## 2) Complete feature list

### A. Public website and brand presence

- Mobile-optimized website with About, Treatments, Specials, Contact
- Treatment pages with structured information and SEO metadata
- Canonical URL management per environment (`NEXT_PUBLIC_SITE_URL`)
- Privacy page and privacy consent integrated in booking forms
- AI website assistant to answer treatment and booking questions
- Instagram feed support (API-backed, with fallback content)

### B. Booking and payments

- Free consultation booking (`/book`) with live slot availability
- Paid treatment booking (`/book/treatment/[slug]`) with Stripe Checkout
- Deposit or full-payment mode using `STRIPE_DEPOSIT_PERCENT`
- Pending-payment slot hold with automatic expiration handling
- Success pages with direct "Manage appointment" links
- Stripe webhook confirmation flow (`checkout.session.completed` + `expired`)

### C. Client self-service

- Secure tokenized manage links (`/manage/[token]`)
- Client-side reschedule and cancellation (with notice window rules)
- Pre-visit intake form tied to each booking
- Automatic treatment refund support when applicable

### D. Admin portal (clinic operations)

- Password-protected admin login
- Unified appointments inbox (consultations + paid treatments)
- Filters (upcoming, awaiting payment, cancelled, all)
- Internal notes and no-show notes
- Week calendar view
- Time-off / schedule blocks to remove unavailable slots
- Client directory with notes and booking history
- Contact submission inbox
- Treatment settings (price, duration, online availability)
- Promotions page (promo codes + multi-session packages)
- Dashboard KPIs (today, next 7 days, no-shows, pending payments, weekly paid)
- Reports and CSV export (clients, bookings)

### E. Automations and notifications

- Booking confirmation emails (client + clinic)
- Consultation reminder emails
- Treatment reminder emails
- Optional SMS reminders (Twilio)
- Review request automation when booking is marked completed
- Abandoned checkout follow-up email flow
- Optional clinic alerts for new bookings (Slack webhook / clinic SMS)
- Google Calendar sync for bookings and schedule blocks

### F. Revenue growth features

- Promo codes (percent or fixed amount)
- Optional limits: expiry, max redemptions, treatment-specific targeting
- Session packages (e.g., Pack of 3)
- Prepaid package credit redemption on future bookings
- Admin control to activate/deactivate promos and packs instantly

## 3) Monthly cost to keep everything running

> Pricing below is estimated from official provider pages and should be re-validated before final budgeting. Most providers bill in USD. AUD values below use an indicative FX of **1 USD = 1.55 AUD**.

## 3.1 Core platform costs (fixed)

| Service | Typical plan for this clinic | Est. monthly |
|---|---|---:|
| Vercel (hosting/deploy) | Hobby (`$0`) or Pro (`$20`) | `$0–$20` USD |
| Supabase (database + APIs) | Pro | `$25` USD |
| Resend (transactional email) | Free (`3,000/mo`) or Pro (`50,000/mo`) | `$0–$20` USD |
| Domain (`.com.au`) | Registrar dependent | ~`$2–$5` USD equivalent |

**Baseline total (excluding Stripe/Twilio variable usage):**

- Lean (Hobby + Free email): about **$27–$32 USD/mo** (approx **A$42–A$50/mo**)
- Business-ready (Pro hosting + Pro email): about **$67–$72 USD/mo** (approx **A$104–A$112/mo**)

## 3.2 Usage-based costs (variable)

| Service | Pricing model | Example monthly impact |
|---|---|---:|
| Stripe | Per successful payment transaction | Depends on sales volume |
| Twilio SMS | Per SMS segment (outbound to AU) | ~`$0.0515` USD per SMS segment |
| Vercel/Supabase overages | If traffic/storage/egress exceeds included quotas | Usually low at clinic scale |

### Practical SMS example

If 300 reminder SMS are sent in a month:

- `300 × $0.0515 = $15.45 USD` (approx `A$23.95`)

## 3.3 Recommended budgeting scenarios

### Scenario A — Essential operations

- Vercel Hobby + Supabase Pro + Resend Free + light SMS
- Estimated monthly platform cost: **A$50–A$90** + Stripe fees

### Scenario B — Professional operations (recommended)

- Vercel Pro + Supabase Pro + Resend Pro + regular SMS reminders
- Estimated monthly platform cost: **A$110–A$180** + Stripe fees

### Scenario C — Growth mode

- Scenario B + heavier email/SMS + overages
- Estimated monthly platform cost: **A$180–A$350+** + Stripe fees

## 4) Stripe fee model (how payment is charged)

For Australia online card payments (standard pricing):

- **Domestic cards:** `1.7% + A$0.30` per successful charge
- **International cards:** `3.5% + A$0.30` per successful charge
- No setup/monthly fee for Stripe standard account

## 4.1 Worked examples (domestic cards)

### Example 1: Single treatment A$140

- Fee = `A$140 × 1.7% + A$0.30 = A$2.68`
- Net received = `A$137.32`

### Example 2: Package purchase A$600

- Fee = `A$600 × 1.7% + A$0.30 = A$10.50`
- Net received = `A$589.50`

### Example 3: 30% deposit on A$250 treatment

- Charged now: `A$75.00`
- Fee = `A$75 × 1.7% + A$0.30 = A$1.58`
- Net received now = `A$73.42`
- Remaining balance (`A$175`) is paid at the clinic

## 5) Previous website vs new platform

### Previous website (what it did well)

- Beautiful brand presentation
- Treatment catalogue and clinic information
- Contact information and social proof

### Previous website limitations

- No integrated online consultation booking workflow
- No paid treatment checkout flow
- No self-service reschedule/cancel links
- No operations dashboard for staff
- No automation for reminders, reviews, abandoned checkout follow-up
- No client CRM-like history, notes, package credits, or promo engine

### New platform improvements

- End-to-end booking + payment + confirmation + management in one stack
- Less manual admin load and fewer phone back-and-forths
- Better attendance and conversion via reminders and follow-ups
- Better visibility through dashboard/reporting/exports
- Better revenue tools (promo codes + packages)
- Direct ownership of client/booking data and workflows

## 6) Pros and cons of this setup

### Pros

- Full control over branding, flows, and data
- Lower software overhead than multiple disconnected SaaS tools
- Fast iteration: promotions, packages, pricing, and hours can be updated quickly
- Scales with clinic growth (can add auth roles, analytics, advanced automations)
- Integrates marketing and operations in one platform

### Cons

- Requires basic technical maintenance (deploys, env vars, provider keys)
- Multiple provider dependencies (Vercel, Supabase, Stripe, Resend, Twilio)
- Costs are partly variable (Stripe/SMS/overages)
- Shared-password admin auth is currently simpler than full staff IAM (upgrade path exists)

## 7) Business benefits for the clinic owner

By choosing this setup, she gets:

1. **Higher conversion**: clients can book and pay immediately online.
2. **Lower admin workload**: fewer calls/messages for reschedules, reminders, and confirmations.
3. **Fewer no-shows**: reminders + self-service management reduce missed appointments.
4. **Higher lifetime value**: packages and promo campaigns increase repeat bookings.
5. **Operational clarity**: dashboard, reports, and exports show real performance.
6. **Data ownership**: client and booking data stay in her own system.
7. **Future flexibility**: can add advanced auth, loyalty, subscriptions, and analytics without replatforming.

## 8) Recommended positioning for client presentation

- Position this as a **clinic growth and operations platform**, not just a redesigned website.
- Present monthly cost as:
  - predictable core infrastructure (low fixed cost)
  - variable revenue-linked costs (Stripe/SMS), which only grow when bookings grow
- Emphasize ROI: one or two additional confirmed treatments per month can typically offset the full platform operating cost.

## 9) References (pricing and current sites)

- Current project website: https://website-iota-vert-23.vercel.app
- Previous/live brand site: https://nbskinrejuvenation.com.au
- Vercel pricing: https://vercel.com/pricing
- Supabase pricing: https://supabase.com/pricing
- Resend pricing: https://resend.com/pricing
- Twilio AU SMS pricing: https://www.twilio.com/en-us/sms/pricing/au
- Stripe AU pricing: https://stripe.com/au/pricing

