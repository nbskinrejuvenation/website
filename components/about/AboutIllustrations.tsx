/**
 * Botanical line illustrations for the About page, drawn to match the Specials
 * page artwork (sage leaves, thin ink line icons in pale sage circles).
 * All decorative: aria-hidden.
 */

interface ArtProps {
  className?: string
  flip?: boolean
}

/** Low leafy branch, same shape language as the Specials page header leaves. */
export function LeafBranch({ className = '', flip = false }: ArtProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 95"
      className={`${className} ${flip ? '-scale-x-100' : ''}`}
    >
      <g opacity=".7">
        <path d="M0 82C60 70 106 46 166 6" fill="none" stroke="#7D8B72" strokeWidth="2" />
        <path
          d="M42 68C26 44 26 24 35 8c20 14 27 34 7 60ZM78 54C65 30 70 12 84 0c15 18 14 38-6 54ZM115 37c-7-22 2-35 18-42 8 19 2 34-18 42ZM149 20c0-17 10-27 25-29 3 16-6 27-25 29Z"
          fill="#9EAA95"
        />
      </g>
    </svg>
  )
}

/** Tall eucalyptus sprig with round leaves, for framing the portrait. */
export function EucalyptusSprig({ className = '', flip = false }: ArtProps) {
  const leaves: Array<[number, number, number, number]> = [
    // cx, cy, r, rotate
    [62, 34, 15, -20],
    [34, 70, 17, 25],
    [70, 104, 16, -15],
    [38, 142, 18, 30],
    [74, 176, 17, -25],
    [44, 214, 19, 20],
    [80, 248, 16, -10],
  ]
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 300"
      className={`${className} ${flip ? '-scale-x-100' : ''}`}
    >
      <path
        d="M60 296C66 240 52 190 60 140S56 50 58 6"
        fill="none"
        stroke="#7D8B72"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {leaves.map(([cx, cy, r, rot], i) => (
        <g key={i} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse
            cx={cx}
            cy={cy}
            rx={r}
            ry={r * 0.82}
            fill={i % 2 ? '#A8B19E' : '#9EAA95'}
            opacity=".85"
          />
          <path
            d={`M${cx - r * 0.7} ${cy}H${cx + r * 0.7}`}
            stroke="#7D8B72"
            strokeWidth="1"
            opacity=".6"
          />
        </g>
      ))}
    </svg>
  )
}

/** Soft organic blob used behind the portrait and cards. */
export function Blob({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={className}>
      <path
        d="M47 23C74 3 128 0 160 26s45 78 26 112-62 59-104 54S8 158 4 116 20 43 47 23Z"
        fill="currentColor"
      />
    </svg>
  )
}

// ── Line icons (48×48, 1.5px ink stroke, like the Specials artwork) ─────────

function LineIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="h-8 w-8"
      fill="none"
      stroke="#28332D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

export function IconNutrition() {
  return (
    <LineIcon>
      <path d="M24 15c-4-3-12-3-14 4-2 8 3 21 9 22 2 .4 3-1 5-1s3 1.4 5 1c6-1 11-14 9-22-2-7-10-7-14-4Z" />
      <path d="M24 15c0-4 1-7 4-9" />
      <path d="M27 11c3-3 8-3 10-1-2 3-6 4-10 1Z" />
    </LineIcon>
  )
}

export function IconSparkleFace() {
  return (
    <LineIcon>
      <path d="M22 8c-7 0-12 6-12 13 0 3 1 5-1 8l3 1v5c0 2 2 3 4 3h4v4" />
      <path d="M22 8c5 0 9 3 10 8" />
      <path d="M15 22h2M14 28c1 1 3 1 4 0" />
      <path d="M36 22v8M32 26h8M39 12v4M37 14h4" />
    </LineIcon>
  )
}

export function IconHeartHands() {
  return (
    <LineIcon>
      <path d="M24 22c-2-4-8-4-8 1 0 4 8 9 8 9s8-5 8-9c0-5-6-5-8-1Z" />
      <path d="M6 30l7 7c2 2 5 3 8 3h6c3 0 6-1 8-3l7-7" />
      <path d="M6 30c1-2 4-2 5 0l4 4M42 30c-1-2-4-2-5 0l-4 4" />
    </LineIcon>
  )
}

export function IconDropper() {
  return (
    <LineIcon>
      <path d="M18 20h12v19a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V20Z" />
      <path d="M20 20v-5h8v5M21 15v-4a3 3 0 0 1 6 0v4" />
      <path d="M18 28h12" />
      <path d="M36 12c0 2-1.4 3-3 3s-3-1-3-3 3-5 3-5 3 3 3 5Z" />
    </LineIcon>
  )
}

export function IconRosette() {
  return (
    <LineIcon>
      <circle cx="24" cy="19" r="11" />
      <circle cx="24" cy="19" r="6" />
      <path d="M17 28l-4 13 6-3 3 5 3-9M31 28l4 13-6-3-3 5-2-6" />
    </LineIcon>
  )
}

export function IconGift() {
  return (
    <LineIcon>
      <rect x="9" y="18" width="30" height="8" rx="1" />
      <path d="M12 26v14h24V26M24 18v22" />
      <path d="M24 18c-3-1-9-4-8-8 1-3 6-2 8 3 2-5 7-6 8-3 1 4-5 7-8 8Z" />
    </LineIcon>
  )
}

/** Pale sage circle that holds a line icon, as on the Specials artwork. */
export function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sage-200 ring-1 ring-sage-300">
      {children}
    </div>
  )
}
