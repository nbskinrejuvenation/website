import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import '@/styles/globals.css'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PreviewBanner } from '@/components/layout/PreviewBanner'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getServicesByCategory } from '@/lib/data/services'

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const businessName = settings.business_name ?? 'Naturally Beautiful Skin Rejuvenation'

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nbskinrejuvenation.com.au',
    ),
    title: {
      default: businessName,
      template: `%s | ${businessName}`,
    },
    description:
      "Luxury skin rejuvenation on Sydney's Northern Beaches. Micro needling, HIFU, laser and more — book your free consultation in Dee Why.",
    openGraph: {
      type: 'website',
      siteName: businessName,
    },
    twitter: { card: 'summary_large_image' },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, servicesByCategory] = await Promise.all([
    getSiteSettings(),
    getServicesByCategory(),
  ])

  const headerList = await headers()
  const isPreview = headerList.get('x-preview-mode') === '1'

  return (
    <html lang="en-AU" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-cream text-ink antialiased">
        {isPreview && <PreviewBanner />}
        <Header settings={settings} servicesByCategory={servicesByCategory} />
        <main id="main-content">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
