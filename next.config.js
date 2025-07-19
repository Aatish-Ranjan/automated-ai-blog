/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL;

const nextConfig = {
  // Only use static export for GitHub Pages, not for Vercel
  ...(isProduction && !isVercel && {
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
    SITE_URL: process.env.SITE_URL || (isVercel ? 'https://automated-ai-blog-7xkyr4p75-aatish-ranjans-projects.vercel.app' : 'https://aatish-ranjan.github.io/automated-ai-blog'),
  },
};

module.exports = nextConfig;
