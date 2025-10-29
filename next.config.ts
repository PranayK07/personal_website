import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/personal_website',
  trailingSlash: true,
};

export default nextConfig;
