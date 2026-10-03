import type { NextConfig } from 'next'
import { createHash } from 'node:crypto'

// Native Vercel builds get their ID from the platform. Prebuilt releases supply
// a unique build ID; AWS uses the same version for its single regional artifact.
const customDeploymentId = process.env.APP_DEPLOYMENT_ID ||
  (process.env.VERCEL ? undefined : process.env.APP_VERSION)

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Vercel requires custom IDs to be at most 32 URL-safe characters.
  deploymentId: customDeploymentId
    ? createHash('sha256').update(customDeploymentId).digest('hex').slice(0, 32)
    : undefined,
  assetPrefix: process.env.ASSET_PREFIX || undefined,
  images: {
    remotePatterns: process.env.IMAGE_HOSTS?.split(',').filter(Boolean).map(hostname => ({ protocol: 'https' as const, hostname })) || [],
  },
  serverExternalPackages: ['phaser'],
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
    ] }]
  },
}
export default nextConfig
