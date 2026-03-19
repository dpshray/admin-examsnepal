import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.68',
        port: '8001',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'api.examsnepal.dworklabs.com',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
