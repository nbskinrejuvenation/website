import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Vercel Blob
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers (supplemented by vercel.json for edge-level application)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Redirect www <-> apex (keep canonical in sync with Vercel domain config)
  async redirects() {
    return [
      {
        source: '/contact-us',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/contact-us/',
        destination: '/contact',
        permanent: true,
      },
      // Legacy WordPress service URLs (trailing slash variants)
      {
        source: '/services/:slug/',
        destination: '/services/:slug',
        permanent: true,
      },
    ]
  },

  // Enable React strict mode for development warnings
  reactStrictMode: true,
}

export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,          // Only show Sentry logs in CI
  widenClientFileUpload: true,       // Upload larger set of source maps
  sourcemaps: { disable: true },      // Don't include source maps in production bundle
  disableLogger: true,               // Remove Sentry logger from bundle
  automaticVercelMonitors: true,     // Auto-instrument Vercel Cron jobs
})
