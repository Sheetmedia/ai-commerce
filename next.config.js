/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'supabase.co',
      'shop.tiktok.com',
      'cf.shopee.vn',
      'laz-img-cdn.alicdn.com',
    ],
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'canvas', 'jsdom'];
    return config;
  },
}

module.exports = nextConfig;