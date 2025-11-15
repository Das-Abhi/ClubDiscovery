/**
 * Environment variable validation and configuration
 */

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export const env = {
  // Public environment variables
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Feature flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

export type Env = typeof env
