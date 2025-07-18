const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TOPICS = [
  'artificial intelligence',
  'machine learning',
  'deep learning',
  'natural language processing',
  'computer vision',
  'robotics',
  'quantum computing',
  'blockchain technology',
  'cloud computing',
  'cybersecurity',
  'data science',
  'web development',
  'mobile development',
  'software engineering',
  'tech startups',
  'digital transformation',
  'internet of things',
  'augmented reality',
  'virtual reality',
  'edge computing',
];

const CONTENT_TYPES = [
  'tutorial',
  'analysis',
  'opinion',
  'news',
  'review',
  'comparison',
  'guide',
  'trends',
  'predictions',
  'case study',
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

async function generateBlogPost() {
  try {
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const contentType = CONTENT_TYPES[Math.floor(Math.random() * CONTENT_TYPES.length)];
    
    console.log(`Generating ${contentType} about ${topic}...`);

    const prompt = `Write a comprehensive ${contentType} article about ${topic}. 
    The article should be:
    - Well-structured with clear headings
    - Informative and engaging
    - Around 800-1200 words
    - Include practical examples where relevant
    - Written in a professional yet accessible tone
    - Include a compelling introduction and conclusion
    
    Format the response as a JSON object with the following structure:
    {
      "title": "Article title",
      "excerpt": "Brief summary (150-200 characters)",
      "content": "Full article content in markdown format",
      "tags": ["tag1", "tag2", "tag3"],
      "category": "category name"
    }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a skilled technical writer and blogger who creates high-quality content about technology and AI. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    
    // Parse the JSON response
    let blogData;
    try {
      blogData = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    // Generate metadata
    const currentDate = new Date().toISOString().split('T')[0];
    const slug = generateSlug(blogData.title);
    
    // Create frontmatter
    const frontmatter = `---
title: "${blogData.title}"
excerpt: "${blogData.excerpt}"
date: "${currentDate}"
author: "AI Blog"
tags: [${blogData.tags.map(tag => `"${tag}"`).join(', ')}]
image: "/images/blog/default-blog-image.jpg"
featured: false
---

`;

    const fullContent = frontmatter + blogData.content;
    
    // Ensure content directory exists
    const contentDir = path.join(process.cwd(), 'src', 'content');
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    // Write the blog post
    const fileName = `${currentDate}-${slug}.md`;
    const filePath = path.join(contentDir, fileName);
    
    fs.writeFileSync(filePath, fullContent);
    
    console.log(`Blog post generated successfully: ${fileName}`);
    console.log(`Title: ${blogData.title}`);
    console.log(`Tags: ${blogData.tags.join(', ')}`);
    
    return {
      fileName,
      title: blogData.title,
      slug,
      tags: blogData.tags,
    };
    
  } catch (error) {
    console.error('Error generating blog post:', error);
    throw error;
  }
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is not set');
    process.exit(1);
  }

  try {
    const result = await generateBlogPost();
    console.log('Blog post generation completed successfully!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Failed to generate blog post:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateBlogPost };
