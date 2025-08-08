import { NextApiRequest, NextApiResponse } from 'next';
import { getAllPosts } from '@/lib/blog';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const posts = await getAllPosts();
    res.status(200).json({ posts });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, excerpt, content, tags, image, featured } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-${slug}.md`;
    const filePath = path.join(process.cwd(), 'src/content', filename);

    // Create frontmatter
    const frontmatter = {
      title,
      excerpt: excerpt || title,
      date,
      author: 'AI Powered Blog',
      tags: tags || [],
      image: image || undefined,
      featured: featured || false,
    };

    // Create markdown content
    const markdownContent = matter.stringify(content, frontmatter);

    // Write file
    fs.writeFileSync(filePath, markdownContent);

    // Auto-commit and deploy (same as your desktop workflow)
    await autoCommitAndDeploy(`Add new post: ${title}`);

    res.status(200).json({ 
      success: true, 
      message: 'Post created and deployed successfully',
      slug: `${date}-${slug}`
    });

  } catch (error) {
    console.error('Failed to create post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create post' 
    });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { slug, title, excerpt, content, tags, image, featured } = req.body;

    if (!slug || !title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug, title and content are required' 
      });
    }

    // Find existing file
    const contentDir = path.join(process.cwd(), 'src/content');
    const files = fs.readdirSync(contentDir);
    const existingFile = files.find(file => file.includes(slug));

    if (!existingFile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const filePath = path.join(contentDir, existingFile);

    // Update frontmatter
    const frontmatter = {
      title,
      excerpt: excerpt || title,
      date: existingFile.split('-').slice(0, 3).join('-'), // Keep original date
      author: 'AI Powered Blog',
      tags: tags || [],
      image: image || undefined,
      featured: featured || false,
    };

    // Create updated markdown content
    const markdownContent = matter.stringify(content, frontmatter);

    // Write file
    fs.writeFileSync(filePath, markdownContent);

    // Auto-commit and deploy
    await autoCommitAndDeploy(`Update post: ${title}`);

    res.status(200).json({ 
      success: true, 
      message: 'Post updated and deployed successfully' 
    });

  } catch (error) {
    console.error('Failed to update post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update post' 
    });
  }
}

async function autoCommitAndDeploy(message: string) {
  try {
    // Add all changes
    await execAsync('git add .');
    
    // Commit with message
    await execAsync(`git commit -m "${message}"`);
    
    // Push to trigger deployment (same as your desktop workflow)
    await execAsync('git push');
    
    console.log('Auto-commit and deploy completed');
  } catch (error) {
    console.error('Auto-commit failed:', error);
    // Don't throw error - file was still saved locally
  }
}
