/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Only use static export for production builds
  ...(isProduction && {
    output: 'export',
    trailingSlash: true,
    basePath: '/automated-ai-blog',
    assetPrefix: '/automated-ai-blog',
  }),
  images: {
    unoptimized: true,
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SITE_URL: process.env.SITE_URL || 'https://aatish-ranjan.github.io/automated-ai-blog',
  },
};

module.exports = nextConfig;
