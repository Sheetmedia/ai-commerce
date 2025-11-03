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

<<<<<<< HEAD
module.exports = nextConfig;
=======
module.exports = nextConfig;
>>>>>>> 439cfb979d4c7259c31b187d06bcfef88d7a5637
