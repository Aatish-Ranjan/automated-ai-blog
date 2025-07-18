/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SITE_URL: process.env.SITE_URL || 'https://yourdomain.github.io',
  },
};

module.exports = nextConfig;
