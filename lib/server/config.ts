import 'server-only'

export function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required server configuration: ${name}`)
  return value
}

export function databaseUrl(readOnly = false): string {
  const value =
    (readOnly && process.env.SUPABASE_READ_URL) ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!value) throw new Error('Missing SUPABASE_URL')
  return new URL(value).origin
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
