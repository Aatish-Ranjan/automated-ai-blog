// API route to get recent blog posts
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const contentDir = path.join(process.cwd(), 'src', 'content');
    
    // Check if content directory exists
    if (!await fs.pathExists(contentDir)) {
      return res.status(200).json([]);
    }

    // Read all markdown files
    const files = await fs.readdir(contentDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    // Parse frontmatter and sort by date
    const posts = await Promise.all(
      mdFiles.map(async (filename) => {
        const filepath = path.join(contentDir, filename);
        const fileContent = await fs.readFile(filepath, 'utf8');
        const { data: frontmatter } = matter(fileContent);
        
        return {
          filename,
          title: frontmatter.title || 'Untitled',
          date: frontmatter.date || new Date().toISOString(),
          description: frontmatter.description || '',
          tags: frontmatter.tags || [],
          category: frontmatter.category || 'General',
          wordCount: frontmatter.wordCount || 0,
          readingTime: frontmatter.readingTime || '5 min read',
          generatedBy: frontmatter.generatedBy || 'unknown',
        };
      })
    );

    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(posts);

  } catch (error) {
    console.error('Error fetching recent posts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent posts',
      details: error.message
    });
  }
}
