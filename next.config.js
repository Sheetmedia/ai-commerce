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
  webpack: (config) => {
    config.externals = [...config.externals, 'canvas', 'jsdom'];
    config.resolve.fallback = {
      ...config.resolve.fallback,
      punycode: false,
    };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['canvas', 'jsdom'],
  },
  staticPageGenerationTimeout: 300, // Increase timeout to 5 minutes
}

module.exports = nextConfig;
