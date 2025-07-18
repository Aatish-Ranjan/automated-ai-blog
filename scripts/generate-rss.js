const fs = require('fs');
const path = require('path');
const { Feed } = require('feed');

// Import the blog functions
const matter = require('gray-matter');

function getAllPosts() {
  const postsDirectory = path.join(process.cwd(), 'src/content');
  
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // Calculate reading time
      const wordsPerMinute = 200;
      const words = content.trim().split(/\s+/).length;
      const readingTime = `${Math.ceil(words / wordsPerMinute)} min read`;
      
      return {
        slug,
        title: data.title,
        excerpt: data.excerpt,
        content: content,
        date: data.date,
        author: data.author,
        tags: data.tags || [],
        readingTime,
        image: data.image,
        featured: data.featured || false,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

async function generateRSSFeed() {
  const siteURL = process.env.SITE_URL || 'https://yourdomain.github.io';
  const posts = getAllPosts();
  
  const feed = new Feed({
    title: 'AI Blog',
    description: 'A modern blog powered by AI with automated content generation and SEO optimization',
    id: siteURL,
    link: siteURL,
    language: 'en',
    favicon: `${siteURL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, AI Blog`,
    author: {
      name: 'AI Blog',
      email: 'hello@example.com',
      link: siteURL,
    },
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `${siteURL}/blog/${post.slug}`,
      link: `${siteURL}/blog/${post.slug}`,
      description: post.excerpt,
      content: post.content,
      author: [
        {
          name: post.author,
          link: siteURL,
        },
      ],
      date: new Date(post.date),
      image: post.image ? `${siteURL}${post.image}` : undefined,
    });
  });

  // Write RSS feed to public directory
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const rssPath = path.join(publicDir, 'rss.xml');
  fs.writeFileSync(rssPath, feed.rss2());
  
  console.log('RSS feed generated successfully at /public/rss.xml');
  return feed.rss2();
}

if (require.main === module) {
  generateRSSFeed().catch(console.error);
}

module.exports = { generateRSSFeed };
