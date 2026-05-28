import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Custom server handles socket.io, so we disable the default one
  // when running in dev with `tsx server.ts`
  experimental: {
    serverComponentsExternalPackages: ['socket.io'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        // Output and stage pages — allow embedding in OBS browser source etc.
        source: '/(output|stage)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
}

export default nextConfig
