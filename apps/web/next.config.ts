import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    reactCompiler: false,
  },
};

export default nextConfig;
