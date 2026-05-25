import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import '@/styles/globals.css'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PreviewBanner } from '@/components/layout/PreviewBanner'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getServicesByCategory } from '@/lib/data/services'
import { buildOpenGraphImages, SITE_URL } from '@/lib/seo/metadata'
import { CLINIC_ADDRESS_FULL } from '@/lib/site/address'

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
  const [settings, headerList] = await Promise.all([getSiteSettings(), headers()])
  const businessName = settings.business_name ?? 'Naturally Beautiful Skin Rejuvenation'
  const isPreview = headerList.get('x-preview-mode') === '1'
  const description = `Luxury skin rejuvenation on Sydney's Northern Beaches. Micro needling, HIFU, laser and more — ${CLINIC_ADDRESS_FULL}.`
  const ogImages = buildOpenGraphImages()

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: businessName,
      template: `%s | ${businessName}`,
    },
    description,
    openGraph: {
      type: 'website',
      siteName: businessName,
      locale: 'en_AU',
      url: SITE_URL,
      title: businessName,
      description,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: businessName,
      description,
      images: [ogImages[0].url],
    },
    robots: isPreview
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
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
  const isAdmin = headerList.get('x-admin-route') === '1'

  return (
    <html lang="en-AU" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-cream text-ink antialiased">
        {isPreview && <PreviewBanner />}
        {isAdmin ? (
          children
        ) : (
          <>
            <Header settings={settings} servicesByCategory={servicesByCategory} />
            <main id="main-content">{children}</main>
            <Footer settings={settings} />
            <ChatWidget />
          </>
        )}
      </body>
    </html>
  )
}
