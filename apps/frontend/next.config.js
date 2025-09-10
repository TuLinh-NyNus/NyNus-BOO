/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic Next.js config only
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Simplified experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons'
    ]
  },
  
  // Basic image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Basic headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ];
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
};

module.exports = nextConfig;
