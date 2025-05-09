/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'puppeteer-extra': false,
        'puppeteer-extra-plugin-stealth': false,
        'puppeteer': false,
      };
    }
    
    config.externals = [...(config.externals || []), 'puppeteer', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'];
    
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  serverExternalPackages: [
    'puppeteer-core', 
    'puppeteer', 
    'puppeteer-extra', 
    'puppeteer-extra-plugin-stealth'
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://instagram.com; img-src 'self' data:;"
          }
        ]
      }
    ]
  }
}

export default nextConfig
