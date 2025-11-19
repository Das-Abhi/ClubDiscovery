/**
 * Sentry Error Tracking Configuration for Frontend
 */
import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,

      // Performance Monitoring
      tracesSampleRate: 0.1, // Capture 10% of transactions

      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

      // Filter out errors
      beforeSend(event, hint) {
        // Don't send errors in development
        if (process.env.NODE_ENV === 'development') {
          return null
        }

        // Filter out known non-critical errors
        const error = hint.originalException
        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message)

          // Ignore network errors that are expected
          if (
            message.includes('Network request failed') ||
            message.includes('Failed to fetch')
          ) {
            return null
          }
        }

        return event
      },

      // Additional options
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        // Random plugins/extensions
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        // Facebook errors
        'fb_xd_fragment',
        // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this
        'bmi_SafeAddOnload',
        'EBCallBackMessageReceived',
      ],
    })
  }
}

export { Sentry }
