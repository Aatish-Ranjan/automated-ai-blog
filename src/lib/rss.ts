import { Feed } from 'feed';
import { getAllPosts } from './blog';

export async function generateRSSFeed(): Promise<string> {
  const siteURL = process.env.SITE_URL || 'https://yourdomain.github.io';
  const posts = await getAllPosts();
  
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

  return feed.rss2();
}
