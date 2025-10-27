import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  basePath: '/personal_website',
  trailingSlash: true,
};

export default nextConfig;
