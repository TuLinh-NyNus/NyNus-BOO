/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic Next.js config
  reactStrictMode: true,
  poweredByHeader: false,
  
  // 🔥 Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Bundle analyzer cho development
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        openAnalyzer: true,
      }));
    }

    // 🔥 Optimize large libraries - basic optimizations only
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize date-fns
      'date-fns': 'date-fns/esm'
    };

    // 🔥 Advanced chunk splitting cho better caching
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          
          // Framework chunk (React, Next.js)
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /node_modules[\\\\/](react|react-dom|next)[\\\\/]/,
            priority: 40,
            enforce: true
          },
          
          // UI libraries chunk
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /node_modules[\\\\/](@radix-ui|lucide-react|framer-motion)[\\\\/]/,
            priority: 30
          },
          
          // Heavy libraries chunk  
          heavy: {
            name: 'heavy',
            chunks: 'all',
            test: /node_modules[\\\\/](monaco-editor|gsap|katex|prismjs|recharts)[\\\\/]/,
            priority: 25,
            minSize: 100000 // Chỉ chunk nếu >100kb
          },
          
          // Vendor chunk (other node_modules)
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules[\\\\/]/,
            priority: 20
          },
          
          // Common chunk (used trong multiple places)
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            minSize: 30000
          }
        }
      };
    }

    // 🔥 Tree shaking improvements
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    // 🔥 Module concatenation
    config.optimization.concatenateModules = true;

    return config;
  },

  // 🔥 Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 🔥 Experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      'date-fns',
      'lodash-es'
    ],
    // Enable App Router optimizations
    optimizeServerReact: true,
    
    // Gzip compression
    gzipSize: true,
    
  },

  // 🔥 Compiler optimizations
  compiler: {
    // Remove console.log trong production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    
    // Remove React DevTools trong production
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // 🔥 Output optimization  
  trailingSlash: false,
  
  // 🔥 Headers cho better caching
  async headers() {
    return [
      {
        source: '/(.*)\\\\.(js|css|woff2?|jpe?g|png|gif|ico|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
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
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // Rewrites, redirects, headers disabled for static export
  // async rewrites() { ... },
  // async redirects() { ... },

  // 🔥 Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 🔥 TypeScript configuration
  typescript: {
    // Ignore TypeScript errors trong build nếu cần
    ignoreBuildErrors: false,
  },

  // 🔥 ESLint configuration
  eslint: {
    // Ignore ESLint errors trong build nếu cần
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
