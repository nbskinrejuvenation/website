import Image from "next/image";
import { Navigation } from "lucide-react";
import {
  buildAppleDirectionsUrl,
  buildGoogleDirectionsUrl,
  buildWazeDirectionsUrl,
} from "@/lib/maps/directions";
import { buildOpenStreetMapLinkUrl } from "@/lib/maps/openstreetmap";
import { formatFullAddress } from "@/lib/site/address";
import type { SiteSettings } from "@/types/database";

interface Props {
  settings: SiteSettings;
}

/**
 * Static on-brand map (public/images/clinic-map.svg, made by
 * scripts/generate-clinic-map.mjs) with buttons into the visitor's maps app.
 */
export function ClinicMap({ settings }: Props) {
  const address = formatFullAddress(settings);
  const target = { address, lat: settings.lat, lng: settings.lng };

  const apps = [
    { label: "Google Maps", href: buildGoogleDirectionsUrl(target) },
    { label: "Apple Maps", href: buildAppleDirectionsUrl(target) },
    { label: "Waze", href: buildWazeDirectionsUrl(target) },
  ];

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-sand-dark/40">
      <div className="relative">
        <a
          href={apps[0].href}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-[4/3] bg-cream-dark sm:aspect-video"
          aria-label={`Get directions to ${address} in Google Maps`}
        >
          <Image
            src="/images/clinic-map.svg"
            alt={`Map showing Naturally Beautiful Skin Rejuvenation at ${address}`}
            width={800}
            height={450}
            unoptimized
            className="h-full w-full object-cover"
          />
        </a>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-1.5 right-2 rounded-sm bg-cream/80 px-1.5 py-0.5 text-[10px] text-ink-muted hover:underline"
        >
          © OpenStreetMap contributors
        </a>
      </div>
      <div className="border-t border-sand-dark/40 bg-white px-4 py-4">
        <p className="mb-3 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
          Get directions
        </p>
        <div className="grid grid-cols-3 gap-2">
          {apps.map((app) => (
            <a
              key={app.label}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-2 text-center text-xs sm:text-sm"
            >
              {app.label}
            </a>
          ))}
        </div>
        {settings.lat != null && settings.lng != null && (
          <p className="mt-3 text-center text-xs">
            <a
              href={buildOpenStreetMapLinkUrl(settings.lat, settings.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted hover:underline"
            >
              View larger map
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
