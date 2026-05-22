import type { Metadata } from 'next'
import { Lato, Playfair_Display } from 'next/font/google'
import { headers } from 'next/headers'
import '@/styles/globals.css'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PreviewBanner } from '@/components/layout/PreviewBanner'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getServicesByCategory } from '@/lib/data/services'

const sans = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
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
      "Professional skin rejuvenation treatments on Sydney's Northern Beaches. Micro needling, HIFU, laser, and more. Book a free consultation today.",
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
      <body>
        {isPreview && <PreviewBanner />}
        <Header settings={settings} servicesByCategory={servicesByCategory} />
        <main id="main-content">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  )
}
