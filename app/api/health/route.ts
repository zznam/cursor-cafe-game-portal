import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      region: process.env.AWS_REGION || process.env.VERCEL_REGION || 'local',
      version:
        process.env.APP_VERSION ||
        process.env.VERCEL_GIT_COMMIT_SHA ||
        'development',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
