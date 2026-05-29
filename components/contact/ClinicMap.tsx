import {
  buildGoogleMapsEmbedUrl,
  buildGoogleMapsSearchUrl,
  isGoogleMapsConfigured,
} from '@/lib/google/maps'
import { formatFullAddress } from '@/lib/site/address'
import type { SiteSettings } from '@/types/database'

interface Props {
  settings: SiteSettings
}

export function ClinicMap({ settings }: Props) {
  const address = formatFullAddress(settings)
  const mapsSearchUrl = buildGoogleMapsSearchUrl(address)
  const embedUrl = buildGoogleMapsEmbedUrl({
    lat: settings.lat,
    lng: settings.lng,
    addressQuery: address,
  })

  if (!isGoogleMapsConfigured() || !embedUrl) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-brand-100 px-6 text-center">
        <p className="text-sm text-ink-muted">
          Map preview is not configured yet. Open directions in Google Maps.
        </p>
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Open in Google Maps
        </a>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-sand-dark/40">
      <div className="aspect-video bg-brand-100">
        <iframe
          title="Map to Naturally Beautiful Skin Rejuvenation"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
        />
      </div>
      <p className="border-t border-sand-dark/40 bg-white px-4 py-3 text-center text-sm">
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-600 hover:underline"
        >
          Open in Google Maps
        </a>
      </p>
    </div>
  )
}
