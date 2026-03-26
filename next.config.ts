import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: 'standalone',
  /** Pin Turbopack to this app so dev doesn’t pick a parent workspace root (fixes flaky _buildManifest / ENOENT). */
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
