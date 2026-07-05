import type { NextConfig } from 'next';
import path from 'node:path';

const monorepoRoot = path.resolve(__dirname, '../..');

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
