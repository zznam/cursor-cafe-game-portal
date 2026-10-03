import 'server-only'
import { createHmac, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { query } from './database'
import { requiredEnv, siteUrl } from './config'
import { signGuest, verifyGuest } from './guest-token'

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}
export function handleError(error: unknown) {
  if (error instanceof z.ZodError)
    return json(
      {
        error: 'Invalid request',
        details: error.issues.map(({ path, message }) => ({ path, message })),
      },
      400,
    )
  if (error instanceof HttpError) {
    const response = json({ error: error.message }, error.status)
    if (error.status === 429) response.headers.set('Retry-After', '60')
    return response
  }
  const requestId = randomUUID()
  console.error(
    JSON.stringify({
      event: 'request_failed',
      requestId,
      message:
        error instanceof Error ? error.message : 'Database request failed',
    }),
  )
  return json(
    { error: 'Service temporarily unavailable. Please try again.', requestId },
    503,
  )
}

export async function readJson<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  if (
    request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !==
    'application/json'
  )
    throw new HttpError(415, 'Use application/json')
  if (!request.body) throw new HttpError(400, 'Request body required')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let bytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    bytes += value.byteLength
    if (bytes > 16384) {
      await reader.cancel()
      throw new HttpError(413, 'Request body too large')
    }
    chunks.push(value)
  }
  try {
    return schema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')))
  } catch (error) {
    if (error instanceof SyntaxError) throw new HttpError(400, 'Invalid JSON')
    throw error
  }
}

export async function guestForWrite(request: Request): Promise<string> {
  if (request.headers.get('origin') !== new URL(siteUrl()).origin)
    throw new HttpError(403, 'Origin not allowed')
  const secret = requiredEnv('SESSION_SECRET')
  if (secret.length < 32)
    throw new Error('SESSION_SECRET must contain at least 32 characters')
  const cookieStore = await cookies()
  const token = cookieStore.get('cafe_guest')?.value || ''
  const existing = verifyGuest(token, secret)
  const id = existing || randomUUID()
  // Vercel overwrites this header; ALB appends the actual peer. Never trust a client-supplied first entry.
  const address =
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() || 'local'
  const hash = (value: string) =>
    createHmac('sha256', secret).update(value).digest('hex')
  for (const [key, limit] of [
    [`ip:${hash(address)}`, 120],
    [`guest:${hash(id)}`, 30],
  ] as const) {
    const [result] = await query<{ allowed: boolean }>(
      'SELECT public.consume_rate_limit($1, $2) AS allowed', [key, limit],
    )
    if (!result.allowed)
      throw new HttpError(429, 'Too many requests. Try again in a minute.')
  }
  if (!existing)
    cookieStore.set(
      'cafe_guest',
      signGuest(id, secret, Date.now() + 365 * 86400000),
      {
        httpOnly: true,
        secure: new URL(siteUrl()).protocol === 'https:',
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 86400,
      },
    )
  return id
}
