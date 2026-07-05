import type { NextConfig } from 'next';
import path from 'node:path';

const monorepoRoot = path.resolve(__dirname, '../..');
const isProduction = process.env.NODE_ENV === 'production';

// Project site served from https://<user>.github.io/Embedded32/
const REPO_BASE = '/Embedded32';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProduction ? REPO_BASE : '',
  assetPrefix: isProduction ? `${REPO_BASE}/` : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  outputFileTracingRoot: monorepoRoot,
  reactStrictMode: true,
  transpilePackages: ['@embedded32/demo'],
  env: {
    NEXT_PUBLIC_BASE_PATH: isProduction ? REPO_BASE : '',
  },
};

export default nextConfig;
