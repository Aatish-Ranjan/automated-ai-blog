/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://aatish-ranjan.github.io/automated-ai-blog',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  
  // Enhanced configuration
  generateIndexSitemap: true,
  exclude: ['/api/*', '/admin/*', '/404', '/500'],
  
  // Dynamic pages configuration
  additionalPaths: async (config) => {
    const result = [];
    
    // Add blog posts with higher priority
    const fs = require('fs-extra');
    const path = require('path');
    const matter = require('gray-matter');
    
    try {
      const contentDir = path.join(process.cwd(), 'src', 'content');
      const files = await fs.readdir(contentDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      for (const file of mdFiles) {
        const filePath = path.join(contentDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = matter(content);
        
        const slug = file.replace('.md', '');
        result.push({
          loc: `/blog/${slug}`,
          changefreq: 'weekly',
          priority: parsed.data.featured ? 0.9 : 0.8,
          lastmod: parsed.data.date || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn('Could not process blog posts for sitemap:', error.message);
    }
    
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
        disallow: ['/api/', '/_next/', '/admin/', '*.json$'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      }
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://aatish-ranjan.github.io/automated-ai-blog'}/sitemap.xml`,
    ],
  },
  
  // Transform function for custom URL formatting
  transform: async (config, path) => {
    // Custom transformation for blog posts
    if (path.startsWith('/blog/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }
    
    // Default transformation
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};