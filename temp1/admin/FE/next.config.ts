import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server external packages (moved from experimental)
  serverExternalPackages: ["@nynusboo/database"],

  // Transpile packages from monorepo
  transpilePackages: ["@nynusboo/lib"],

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Security headers for admin panel
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  // Output configuration for deployment
  // output: "standalone", // Disabled due to Windows symlink permission issues

  // URL Rewrites for secret admin path
  async rewrites() {
    const secretPath = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH || "3141592654";

    return [
      {
        source: `/${secretPath}`,
        destination: "/admin",
      },
      {
        source: `/${secretPath}/:path*`,
        destination: "/admin/:path*",
      },
    ];
  },

  // Redirect root to secret admin path
  async redirects() {
    const secretPath = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH || "3141592654";

    return [
      {
        source: "/",
        destination: `/${secretPath}`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
