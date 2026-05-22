import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing — 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.05,   // 5% of all sessions
  replaysOnErrorSampleRate: 1.0,    // 100% of sessions with errors

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,            // OK for a public marketing site
      blockAllMedia: false,
    }),
  ],

  // Don't send events in development
  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,
})
