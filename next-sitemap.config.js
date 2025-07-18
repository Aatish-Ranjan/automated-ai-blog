/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://aatish-ranjan.github.io/automated-ai-blog',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  additionalPaths: async (config) => {
    const result = [];
    
    // Add RSS feed
    result.push({
      loc: '/rss.xml',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    });
    
    return result;
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://yourdomain.github.io'}/sitemap.xml`,
    ],
  },
  exclude: ['/api/*'],
};
