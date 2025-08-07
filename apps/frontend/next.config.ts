import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sử dụng turbopack thay vì webpack để tránh lỗi bundling
  experimental: {
    turbo: {
      // Cấu hình turbopack
    }
  },
  // Cấu hình webpack fallback nếu cần
  webpack: (config, { isServer }) => {
    // Tránh lỗi module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};
