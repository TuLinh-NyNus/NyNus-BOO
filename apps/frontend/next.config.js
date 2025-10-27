/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Note: swcMinify is default in Next.js 15+ and deprecated as config option
  
  // Keep google-protobuf stable across HMR updates
  // Don't transpile it - use as-is to prevent HMR issues
  transpilePackages: [],
  
  // External packages for server components (moved from experimental in Next.js 15+)
  serverExternalPackages: ['google-protobuf'],
  
  // Temporarily ignore eslint during builds to unblock development
  // TODO: Fix all eslint errors in library, questions, analytics systems
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip type checking during builds (handle separately)
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && process.env.ENABLE_STANDALONE === 'true' && {
    output: 'standalone',
    generateEtags: false,
    httpAgentOptions: {
      keepAlive: true,
    },
  }),

  // Advanced experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'date-fns'
    ],
    optimizeCss: true,
    scrollRestoration: true,
    // Memory optimization: Reduce worker threads and CPU usage
    workerThreads: false,  // Disable worker threads to reduce memory
    cpus: 1,               // Limit to 1 CPU to reduce memory footprint
    ...(process.env.NODE_ENV === 'production' && {
      webpackBuildWorker: true,
      parallelServerCompiles: true,
      parallelServerBuildTraces: true,
    }),
  },

  // Enhanced image optimization (memory-optimized)
  images: {
    formats: ['image/webp'], // Only WebP for smaller memory footprint
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Reduced sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Reduced sizes
    minimumCacheTTL: 60, // Shorter cache for development (reduce memory)
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Turbopack configuration (Next.js 15+)
  // Note: Turbopack has built-in optimizations and doesn't need webpack loaders
  // This config suppresses the "Webpack is configured while Turbopack is not" warning
  turbopack: {
    // Turbopack works great with defaults
    // Ensure google-protobuf is properly handled as CommonJS
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },

  // Webpack optimizations (only when NOT using Turbopack)
  // Note: Turbopack doesn't support webpack plugins
  // For bundle analysis with Turbopack, use: next build --turbo && du -sh .next
  webpack: (config, { dev, isServer }) => {
    // Skip webpack customizations when using Turbopack
    // Turbopack is enabled via --turbo flag in dev:fast and build:turbo scripts
    if (process.env.TURBOPACK) {
      return config;
    }

    // Fix HMR issues with google-protobuf
    // Prevent google-protobuf from being affected by HMR
    config.snapshot = config.snapshot || {};
    config.snapshot.managedPaths = config.snapshot.managedPaths || [];
    config.snapshot.managedPaths.push(/google-protobuf/);
    
    // Ensure google-protobuf is properly resolved
    config.resolve.alias = config.resolve.alias || {};
    // Force all google-protobuf imports to use the same instance
    const path = require('path');
    const googleProtobufPath = path.dirname(require.resolve('google-protobuf/package.json'));
    config.resolve.alias['google-protobuf'] = googleProtobufPath;

    // Memory optimization: Configure webpack cache to use filesystem instead of memory
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      },
      // Reduce memory usage by limiting cache size
      maxMemoryGenerations: 1,
    };

    // Fix Windows permission errors with pnpm node_modules structure
    // Exclude pnpm internal directories from webpack file watching and glob scanning
    config.watchOptions = config.watchOptions || {};
    config.watchOptions.ignored = config.watchOptions.ignored || [];

    // Add pnpm-specific ignore patterns
    const pnpmIgnorePatterns = [
      '**/node_modules/.pnpm/**',
      '**/node_modules/.ignored/**',
      '**/node_modules/.ignored_*/**',
      '**/node_modules/**/.ignored/**',
      '**/node_modules/**/.ignored_*/**',
    ];

    if (Array.isArray(config.watchOptions.ignored)) {
      config.watchOptions.ignored.push(...pnpmIgnorePatterns);
    } else if (typeof config.watchOptions.ignored === 'string') {
      config.watchOptions.ignored = [config.watchOptions.ignored, ...pnpmIgnorePatterns];
    } else {
      config.watchOptions.ignored = pnpmIgnorePatterns;
    }

    // Fix Windows EPERM errors - exclude Windows system directories from webpack scanning
    // These are symbolic links that webpack should not try to access
    config.resolve = config.resolve || {};
    config.resolve.symlinks = false; // Don't follow symbolic links (also reduces memory)

    // Add module resolution exclusions for Windows system directories
    const originalResolveModules = config.resolve.modules || [];
    config.resolve.modules = originalResolveModules.filter(modulePath => {
      // Exclude Windows system directories
      const excludedPaths = [
        'Application Data',
        'AppData',
        'ProgramData',
        'Program Files',
        'Program Files (x86)',
        'Windows'
      ];
      return !excludedPaths.some(excluded => modulePath && modulePath.includes(excluded));
    });

    // Bundle analyzer (Webpack only)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
        })
      );
    }

    return config;
  },

  // Note: File watching for Docker is configured via environment variables
  // WATCHPACK_POLLING=true and CHOKIDAR_USEPOLLING=true in docker-compose.override.yml
  // Turbopack (Next.js 15+) does not support watchOptions - use env vars instead

  // Enhanced security headers
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
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          ...(process.env.NODE_ENV === 'production' ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload'
            },
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:8080 ws://localhost:3000;"
            }
          ] : [])
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
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
