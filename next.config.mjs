import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/nextjs',
  assetPrefix: '/nextjs',
  images: { unoptimized: true },
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
  // Keep builds resilient in production; tighten in CI if desired
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  webpack: (config) => {
    // Ensure TS path alias `@/*` also works in Webpack
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
    };
    return config;
  },
};
export default nextConfig;
