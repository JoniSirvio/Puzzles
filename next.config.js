/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.karkkainen.com',
      },
      {
        protocol: 'https',
        hostname: 'www.karkkainen.com',
      },
      {
        protocol: 'https',
        hostname: 'kuvat.karkkainen.com',
      }
    ],
  },
};

module.exports = nextConfig;
