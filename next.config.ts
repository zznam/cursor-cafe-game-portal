import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // One build is promoted to every region; CloudFront retains previous hashed chunks.
  deploymentId: process.env.APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA,
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
