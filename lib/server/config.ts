import 'server-only'

export function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required server configuration: ${name}`)
  return value
}

export function databaseUrl(readOnly = false): string {
  const value =
    (readOnly && process.env.DATABASE_READ_URL) || requiredEnv('DATABASE_URL')
  const url = new URL(value)
  if (!['postgres:', 'postgresql:'].includes(url.protocol))
    throw new Error('DATABASE_URL must be a PostgreSQL connection string')
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
      !['require', 'verify-ca', 'verify-full'].includes(url.searchParams.get('sslmode') || ''))
    throw new Error('Remote database connections must require TLS')
  return value
}

export function siteUrl(): string {
  const value =
    process.env.SITE_URL ||
    (process.env.NODE_ENV === 'production'
      ? requiredEnv('SITE_URL')
      : 'http://localhost:3000')
  const url = new URL(value)
  if (
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error('SITE_URL must be an origin')
  if (
    url.protocol !== 'https:' &&
    !['localhost', '127.0.0.1'].includes(url.hostname)
  )
    throw new Error('SITE_URL must use HTTPS')
  return url.origin
}
