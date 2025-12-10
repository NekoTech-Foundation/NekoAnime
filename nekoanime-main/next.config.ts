import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.animevietsub.show',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'animevietsub.show',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: 's199.imacdn.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      }
    ],
    unoptimized: true,
  },
};

export default nextConfig;
