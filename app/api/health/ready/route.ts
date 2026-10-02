import { database } from '@/lib/server/database'
import { requiredEnv, siteUrl } from '@/lib/server/config'
import { json } from '@/lib/server/http'
export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    siteUrl()
    requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    if (requiredEnv('SESSION_SECRET').length < 32)
      throw new Error('Invalid session secret')
    const checks = await Promise.all([
      database().from('games').select('id').limit(1),
      database({ primary: true }).from('games').select('id').limit(1),
      database({ write: true }).rpc('production_ready', {}),
    ])
    if (checks.some((check) => check.error))
      throw new Error('Database readiness failed')
    return json({
      status: 'ready',
      region: process.env.AWS_REGION || process.env.VERCEL_REGION || 'local',
      version:
        process.env.APP_VERSION ||
        process.env.VERCEL_GIT_COMMIT_SHA ||
        'development',
    })
  } catch {
    return json({ status: 'unavailable' }, 503)
  }
}
