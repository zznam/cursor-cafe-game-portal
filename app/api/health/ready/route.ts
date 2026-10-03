import { query } from '@/lib/server/database'
import { requiredEnv, siteUrl } from '@/lib/server/config'
import { json } from '@/lib/server/http'
export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    siteUrl()
    if (requiredEnv('SESSION_SECRET').length < 32)
      throw new Error('Invalid session secret')
    const [catalog, , readiness] = await Promise.all([
      query('SELECT id FROM public.games LIMIT 1', [], { readOnly: true }),
      query('SELECT id FROM public.games LIMIT 1'),
      query<{ ready: boolean }>('SELECT public.production_ready() AS ready'),
    ])
    if (!catalog.length || !readiness[0]?.ready)
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
