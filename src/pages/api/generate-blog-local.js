// API route for generating blog posts with local AI model
import LocalAIBlogService from '../../lib/localAIBlogService';
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';

const aiService = new LocalAIBlogService();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, audience, tone, length } = req.body;

    // Validate request
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Check if model is available
    const modelAvailable = await aiService.checkModelAvailability();
    if (!modelAvailable) {
      return res.status(503).json({ 
        error: 'AI model is not available. Please ensure Ollama is running with the ai-blog-writer-1b model.' 
      });
    }

    // Generate blog post
    const blogData = await aiService.generateBlogPost({
      topic,
      audience: audience || 'general readers',
      tone: tone || 'professional',
      length: length || 800,
    });

    // Create filename and save to content directory
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const slug = createSlug(blogData.title);
    const filename = `${dateStr}-${slug}.md`;
    
    const contentDir = path.join(process.cwd(), 'src', 'content');
    await fs.ensureDir(contentDir);
    
    const filepath = path.join(contentDir, filename);

    // Create frontmatter
    const frontmatter = {
      title: blogData.title,
      date: date.toISOString(),
      description: blogData.metaDescription,
      tags: blogData.tags,
      category: blogData.category,
      author: 'AI Assistant',
      draft: false,
      featured: false,
      wordCount: blogData.wordCount,
      readingTime: Math.ceil(blogData.wordCount / 200) + ' min read',
      generatedBy: 'ai-blog-writer-1b',
      generatedAt: blogData.generatedAt,
    };

    // Create complete markdown file
    const fileContent = matter.stringify(blogData.content, frontmatter);

    // Save file
    await fs.writeFile(filepath, fileContent, 'utf8');

    res.status(200).json({
      success: true,
      filename,
      data: {
        ...blogData,
        frontmatter,
        filepath: filepath.replace(process.cwd(), ''),
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate blog post',
      details: error.message
    });
  }
}

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
