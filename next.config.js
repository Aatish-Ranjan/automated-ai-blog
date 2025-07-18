/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/automated-ai-blog',
  assetPrefix: '/automated-ai-blog',
  images: {
    unoptimized: true,
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SITE_URL: process.env.SITE_URL || 'https://aatish-ranjan.github.io/automated-ai-blog',
  },
};

module.exports = nextConfig;
