import { createHmac, timingSafeEqual } from 'node:crypto'

export function signGuest(id: string, secret: string, expires: number): string {
  const value = `${id}.${expires}`
  return `${value}.${createHmac('sha256', secret).update(value).digest('base64url')}`
}

export function verifyGuest(
  token: string,
  secret: string,
  now = Date.now(),
): string | null {
  const [id, expires, signature, extra] = token.split('.')
  if (
    extra ||
    !/^[0-9a-f-]{36}$/.test(id || '') ||
    !/^\d+$/.test(expires || '') ||
    !signature ||
    Number(expires) <= now
  )
    return null
  const expected = signGuest(id, secret, Number(expires)).split('.')[2]
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
    ? id
    : null
}
