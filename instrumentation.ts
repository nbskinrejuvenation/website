export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = async (
  err: unknown,
  request: Request,
  context: { routerKind: string; routePath: string; routeType: string },
) => {
  const Sentry = await import('@sentry/nextjs')
  // captureRequestError expects Sentry's own RequestInfo shape — build it from the Request.
  const url = request.url ? new URL(request.url) : null
  Sentry.captureRequestError(err, {
    path: url?.pathname ?? '',
    headers: Object.fromEntries(request.headers.entries()),
    method: request.method,
  }, context)
}
