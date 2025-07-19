import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/content');

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  readingTime: string;
  image?: string;
  featured?: boolean;
}

export interface BlogPostFrontMatter {
  title: string;
  excerpt?: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  featured?: boolean;
}

// Calculate reading time based on content
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Generate excerpt from content if not provided
function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown formatting and get plain text
  const plainText = content
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
  
  // Extract first sentence or truncate to maxLength
  const firstSentence = plainText.split('.')[0];
  if (firstSentence.length <= maxLength) {
    return firstSentence + '.';
  }
  
  // Truncate to maxLength and add ellipsis
  return plainText.substring(0, maxLength).trim() + '...';
}

// Get all post slugs
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''));
}

// Get post data by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Process markdown content
  const processedContent = await remark()
    .use(html)
    .process(content);
  
  const contentHtml = processedContent.toString();
  
  const frontmatter = data as BlogPostFrontMatter;
  
  // Generate excerpt if not provided in frontmatter
  const excerpt = frontmatter.excerpt || generateExcerpt(content);
  
  const post: BlogPost = {
    slug,
    title: frontmatter.title,
    excerpt,
    content: contentHtml,
    date: frontmatter.date,
    author: frontmatter.author,
    tags: frontmatter.tags || [],
    readingTime: calculateReadingTime(content),
    featured: frontmatter.featured || false,
  };
  
  // Only add image field if it exists
  if (frontmatter.image) {
    post.image = frontmatter.image;
  }
  
  return post;
}

// Get all posts sorted by date
export async function getAllPosts(): Promise<BlogPost[]> {
  const slugs = getAllPostSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const post = await getPostBySlug(slug);
      return post;
    })
  );
  
  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
}

// Get recent posts
export async function getRecentPosts(limit: number = 5): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.slice(0, limit);
}

// Get posts by tag
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => 
    post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
  );
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const tagSet = new Set<string>();
  
  allPosts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
}

// Search posts
export async function searchPosts(query: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  const searchTerms = query.toLowerCase().split(' ');
  
  return allPosts.filter(post => {
    const searchContent = `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase();
    return searchTerms.every(term => searchContent.includes(term));
  });
}
