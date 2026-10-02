#!/usr/bin/env node
/**
 * Generates public/images/clinic-map.svg: the static, on-brand map on /contact.
 *
 * Streets, parks, beach and coastline come from OpenStreetMap (Overpass API) and are
 * drawn in the site palette with a gold pin on the clinic. Re-run only if the clinic
 * moves (update CLINIC to match site_settings lat/lng first):
 *
 *   node scripts/generate-clinic-map.mjs
 *
 * Map data © OpenStreetMap contributors (ODbL). The attribution is shown over the map
 * by components/contact/ClinicMap.tsx (so it survives the mobile crop); keep it there.
 * @see docs/MAP_SETUP.md
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const CLINIC = { lat: -33.75436, lng: 151.28517 }
const OUT = path.join(process.cwd(), 'public', 'images', 'clinic-map.svg')

// Drawn small and scaled up on screen (~570px wide on desktop, ~360px on phones)
// so labels and the pin stay legible.
const W = 800
const H = 450
/** Visible width in degrees of longitude (~1.4 km at Dee Why). */
const SPAN_LNG = 0.015

const OVERPASS_HOSTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const C = {
  land: '#F3EDE6', // cream-dark
  building: '#EBE3DA', // sand
  green: '#E6E5D5',
  beach: '#F1E6D2',
  water: '#DCE3E4',
  casing: '#E0D5C9', // sand-dark
  road: '#FFFFFF',
  mainRoad: '#F0E6E3', // brand-100
  mainCasing: '#D4B5AD', // brand-300
  label: '#6E6863', // ink-muted
  gold: '#C3A77F', // logo gold
  ink: '#2A2624',
}

// ── Projection (Web Mercator, clinic at centre) ──────────────────────────────
const rad = d => (d * Math.PI) / 180
const mercY = lat => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))
const scale = W / rad(SPAN_LNG)
const cx = rad(CLINIC.lng)
const cy = mercY(CLINIC.lat)
const project = ({ lat, lon }) => [
  W / 2 + (rad(lon) - cx) * scale,
  H / 2 - (mercY(lat) - cy) * scale,
]

function bbox(padDeg) {
  const halfLng = SPAN_LNG / 2 + padDeg
  const halfLat = (SPAN_LNG * (H / W)) / 2 / Math.cos(rad(CLINIC.lat)) + padDeg
  return [CLINIC.lat - halfLat, CLINIC.lng - halfLng, CLINIC.lat + halfLat, CLINIC.lng + halfLng]
    .map(n => n.toFixed(5))
    .join(',')
}

async function fetchOsm() {
  const inner = bbox(0.001)
  const outer = bbox(0.01)
  const query = `[out:json][timeout:60];(
    way["highway"](${inner});
    way["leisure"~"park|pitch|golf_course|playground"](${inner});
    way["landuse"~"grass|recreation_ground"](${inner});
    way["building"](${inner});
    way["natural"~"beach|sand|water|coastline"](${outer});
  );out geom;`
  for (const host of OVERPASS_HOSTS) {
    try {
      const res = await fetch(host, {
        method: 'POST',
        headers: { 'User-Agent': 'nbskinrejuvenation-site-map/1.0' },
        body: new URLSearchParams({ data: query }),
      })
      if (res.ok) return (await res.json()).elements
      console.warn(`${host}: HTTP ${res.status}`)
    } catch (err) {
      console.warn(`${host}: ${err.message}`)
    }
  }
  throw new Error('All Overpass hosts failed. Try again in a few minutes.')
}

// ── Geometry helpers ─────────────────────────────────────────────────────────
const fmt = n => Math.round(n * 10) / 10
const inView = pts => {
  const m = 60
  const xs = pts.map(p => p[0])
  const ys = pts.map(p => p[1])
  return Math.max(...xs) > -m && Math.min(...xs) < W + m && Math.max(...ys) > -m && Math.min(...ys) < H + m
}
const toD = (pts, close) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${fmt(p[0])} ${fmt(p[1])}`).join('') + (close ? 'Z' : '')
const visibleLength = pts =>
  pts.slice(1).reduce((s, p, i) => {
    const q = pts[i]
    const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
    const inside = mid[0] > 40 && mid[0] < W - 40 && mid[1] > 30 && mid[1] < H - 30
    return inside ? s + Math.hypot(p[0] - q[0], p[1] - q[1]) : s
  }, 0)

/** Chains ways that share a name and an endpoint into longer runs (labels only). */
function joinNamedRoads(roads) {
  const same = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.5
  const runs = []
  for (const r of roads.filter(r => r.tags.name)) {
    let pts = r.pts
    let merged = true
    while (merged) {
      merged = false
      for (let i = 0; i < runs.length; i++) {
        const o = runs[i]
        if (o.tags.name !== r.tags.name) continue
        const op = o.pts
        let joined = null
        if (same(op[op.length - 1], pts[0])) joined = [...op, ...pts.slice(1)]
        else if (same(pts[pts.length - 1], op[0])) joined = [...pts, ...op.slice(1)]
        else if (same(op[0], pts[0])) joined = [...[...op].reverse(), ...pts.slice(1)]
        else if (same(op[op.length - 1], pts[pts.length - 1])) joined = [...op, ...[...pts].reverse().slice(1)]
        if (joined) {
          runs.splice(i, 1)
          pts = joined
          merged = true
          break
        }
      }
    }
    runs.push({ tags: r.tags, pts })
  }
  return runs
}

const pathLength = pts =>
  pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0)

function pointAt(pts, fraction) {
  let remaining = pathLength(pts) * fraction
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    if (remaining <= seg) {
      const t = seg ? remaining / seg : 0
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]
    }
    remaining -= seg
  }
  return pts[pts.length - 1]
}

/** Label position along a path: as central as possible, clear of the pin and the edges. */
function labelOffset(pts, pin, halfWidth) {
  const total = pathLength(pts)
  for (const f of [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8]) {
    const [x, y] = pointAt(pts, f)
    const clearOfPin = Math.hypot(x - pin[0], y - (pin[1] - 20)) > halfWidth + 45
    const clearOfEdges =
      x > halfWidth + 10 && x < W - halfWidth - 10 && y > 20 && y < H - 25
    const fitsOnPath = f * total > halfWidth && (1 - f) * total > halfWidth
    if (clearOfPin && clearOfEdges && fitsOnPath) return f
  }
  return null
}

const ROAD_STYLE = {
  trunk: { w: 11, main: true },
  trunk_link: { w: 6, main: true },
  primary: { w: 10, main: true },
  secondary: { w: 8 },
  secondary_link: { w: 5 },
  tertiary: { w: 7 },
  unclassified: { w: 5 },
  residential: { w: 5 },
  living_street: { w: 4 },
  pedestrian: { w: 4 },
  service: { w: 2.5, noCasing: true },
}
const LABELLED_ROADS = new Set(['trunk', 'primary', 'secondary', 'tertiary', 'residential', 'unclassified'])

function render(elements) {
  const ways = elements
    .filter(e => e.type === 'way' && e.geometry?.length > 1)
    .map(e => ({ tags: e.tags ?? {}, pts: e.geometry.map(project) }))
    .filter(w => inView(w.pts))

  const areas = { water: [], beach: [], green: [], building: [] }
  const roads = []
  let coastline = []

  for (const w of ways) {
    const t = w.tags
    if (t.natural === 'coastline') coastline.push(w.pts)
    else if (t.natural === 'water') areas.water.push(w.pts)
    else if (t.natural === 'beach' || t.natural === 'sand') areas.beach.push(w.pts)
    else if (t.leisure || t.landuse) areas.green.push(w.pts)
    else if (t.building) areas.building.push(w.pts)
    else if (t.highway && ROAD_STYLE[t.highway]) roads.push(w)
  }

  // Sea lies to the right of the coastline's direction (OSM convention). Close
  // each coastline run along the east edge of the map to fill the ocean.
  const sea = coastline.map(pts => {
    const first = pts[0]
    const last = pts[pts.length - 1]
    const east = W + 200
    return toD([...pts, [east, last[1]], [east, first[1]], first], true)
  })

  const order = Object.keys(ROAD_STYLE).reverse()
  roads.sort((a, b) => order.indexOf(a.tags.highway) - order.indexOf(b.tags.highway))

  const casings = roads
    .filter(r => !ROAD_STYLE[r.tags.highway].noCasing)
    .map(r => {
      const s = ROAD_STYLE[r.tags.highway]
      return `<path d="${toD(r.pts)}" stroke="${s.main ? C.mainCasing : C.casing}" stroke-width="${s.w + 2.5}"/>`
    })
  const fills = roads.map(r => {
    const s = ROAD_STYLE[r.tags.highway]
    return `<path d="${toD(r.pts)}" stroke="${s.main ? C.mainRoad : C.road}" stroke-width="${s.w}"/>`
  })

  // One label per street name, on its longest visible run, reading left to right.
  // OSM splits long roads (Pittwater Road) into short ways, so chain ways of the
  // same name end to end first.
  const byName = new Map()
  for (const r of joinNamedRoads(roads)) {
    const name = r.tags.name
    if (!LABELLED_ROADS.has(r.tags.highway)) continue
    const vis = visibleLength(r.pts)
    if (vis > (byName.get(name)?.vis ?? 0)) byName.set(name, { r, vis })
  }
  const pinXY = project({ lat: CLINIC.lat, lon: CLINIC.lng })
  const labels = []
  const defs = []
  let i = 0
  for (const [name, { r, vis }] of byName) {
    const fontSize = ROAD_STYLE[r.tags.highway].main ? 17 : 15
    if (vis < name.length * fontSize * 0.62 + 40) continue
    let pts = r.pts
    if (pts[pts.length - 1][0] < pts[0][0]) pts = [...pts].reverse()
    const offset = labelOffset(pts, pinXY, (name.length * fontSize * 0.62) / 2)
    if (offset == null) continue
    const id = `r${i++}`
    defs.push(`<path id="${id}" d="${toD(pts)}"/>`)
    labels.push(
      `<text font-size="${fontSize}" dy="${fontSize * 0.34}"><textPath href="#${id}" startOffset="${Math.round(offset * 100)}%" text-anchor="middle">${name}</textPath></text>`,
    )
  }

  const [px, py] = pinXY
  const pin = `
  <g transform="translate(${fmt(px)} ${fmt(py)}) scale(1.3)">
    <ellipse cx="0" cy="2" rx="14" ry="5" fill="${C.ink}" opacity="0.18"/>
    <path d="M0 0C-6-14-22-24-22-40a22 22 0 0 1 44 0C22-24 6-14 0 0Z" fill="${C.gold}" stroke="#FFFFFF" stroke-width="3"/>
    <text x="0" y="-34" font-size="15" font-weight="600" letter-spacing="0.5" fill="#FFFFFF" text-anchor="middle">NB</text>
  </g>`

  const font = `'DM Sans','Avenir Next','Helvetica Neue',Arial,sans-serif`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Map of Naturally Beautiful Skin Rejuvenation, Pacific Parade, Dee Why">
<!-- Generated by scripts/generate-clinic-map.mjs. Map data © OpenStreetMap contributors (ODbL). -->
<defs>${defs.join('')}</defs>
<rect width="${W}" height="${H}" fill="${C.land}"/>
<g fill="${C.water}">${sea.map(d => `<path d="${d}"/>`).join('')}${areas.water.map(p => `<path d="${toD(p, true)}"/>`).join('')}</g>
<g fill="${C.beach}">${areas.beach.map(p => `<path d="${toD(p, true)}"/>`).join('')}</g>
<g fill="${C.green}">${areas.green.map(p => `<path d="${toD(p, true)}"/>`).join('')}</g>
<g fill="${C.building}">${areas.building.map(p => `<path d="${toD(p, true)}"/>`).join('')}</g>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">${casings.join('')}${fills.join('')}</g>
<g font-family="${font}" fill="${C.label}" stroke="${C.land}" stroke-width="3" paint-order="stroke" letter-spacing="0.3">${labels.join('')}</g>
<g font-family="${font}">${pin}</g>
</svg>
`
}

const elements = await fetchOsm()
const svg = render(elements)
writeFileSync(OUT, svg)
console.log(`Wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB)`)
