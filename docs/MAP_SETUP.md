# Map (contact page)

The **Contact** page shows a **static, on-brand map** of the clinic: cream streets, rose main roads
and a gold **NB** pin, drawn from OpenStreetMap data. Below it are **Get directions** buttons for
**Google Maps**, **Apple Maps** and **Waze**, which open the visitor's own maps app. Clicking the
map opens Google Maps directions; **View larger map** opens openstreetmap.org.

No API key, Google Cloud project, billing, third-party script or cookie banner is needed: the map
is a plain SVG served from this site.

Code:

| File | Role |
|------|------|
| `public/images/clinic-map.svg` | The map image (generated, do not edit by hand) |
| `scripts/generate-clinic-map.mjs` | Generator: fetches OSM data, draws the SVG in the site palette |
| `components/contact/ClinicMap.tsx` | Map + directions buttons |
| `lib/maps/directions.ts` | Google / Apple / Waze directions URLs |
| `lib/maps/openstreetmap.ts` | "View larger map" link |

Directions use `site_settings` (`address`, `lat`, `lng`) from Supabase. Google Maps is given the
street address so it resolves the business listing; Apple Maps and Waze use the coordinates.

---

## If the clinic moves

The pin is drawn into the image, so the map must be regenerated:

1. Update `address`, `lat`, `lng` in Supabase `site_settings` (and the defaults in
   `lib/data/site-settings.ts` and `supabase/seed-site-settings.sql`).
2. Set `CLINIC` at the top of `scripts/generate-clinic-map.mjs` to the same `lat` / `lng`.
3. Run `node scripts/generate-clinic-map.mjs` and commit the new `public/images/clinic-map.svg`.

To show more or less of the area, change `SPAN_LNG` (visible width in degrees of longitude;
`0.015` is about 1.4 km).

---

## Licence

Map data © OpenStreetMap contributors, under the ODbL. The attribution is a small link over the
bottom-right corner of the map in `ClinicMap.tsx` (not baked into the SVG, because phones crop the
image's sides); keep it if you edit the component. The script makes one Overpass API query per
run, which is well within the public instances' fair use.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Pin in the wrong place | Regenerate with the correct `CLINIC` coordinates (see above) |
| Directions open the wrong place | Check `address` / `lat` / `lng` in Supabase `site_settings` |
| Generator fails with HTTP 504 / 429 | The Overpass servers are busy; the script tries three hosts. Wait a few minutes and re-run |

---

## History

Until 2026-10-02 this page used the Google Maps Embed API with `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`,
which requires a billing account. That variable is no longer read; remove it from Vercel if it was
set, and if a key was ever created, delete or restrict it in Google Cloud.
