#!/usr/bin/env node

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client (uses OPENAI_API_KEY from environment)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Import Enhanced Prompt Engine
const EnhancedPromptEngine = require('../src/lib/enhancedPromptEngine.js');

// Import TopicSelectionService with dynamic import
async function initTopicService() {
  try {
    const TopicSelectionService = await import('../src/lib/TopicSelectionService.js');
    return new TopicSelectionService.default();
  } catch (error) {
    console.error('Failed to load TopicSelectionService:', error);
    throw error;
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sanitizeYamlValue(value) {
  if (typeof value === 'string') {
    // Escape quotes and handle multi-line content
    if (value.includes('\n') || value.includes('"') || value.includes('\'')) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  return value;
}

// AI Blog Topic Categories for automated selection
const AI_TOPICS = [
  'Machine Learning Fundamentals',
  'Deep Learning Architectures',
  'Natural Language Processing',
  'Computer Vision Applications',
  'AI Ethics and Responsible AI',
  'Generative AI and Large Language Models',
  'AI in Healthcare',
  'AI in Finance and Trading',
  'Autonomous Systems and Robotics',
  'AI Model Deployment and MLOps',
  'Data Science and Analytics',
  'AI Research Breakthroughs',
  'AI Tools and Frameworks',
  'Future of Artificial Intelligence',
  'AI in Creative Industries'
];

async function selectRandomTopic() {
  const randomTopic = AI_TOPICS[Math.floor(Math.random() * AI_TOPICS.length)];
  console.log(`🎯 Selected topic: ${randomTopic}`);
  return randomTopic;
}

async function generateWithOpenAI(prompt) {
  try {
    console.log('🤖 Generating content with OpenAI GPT-4...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using cost-effective model
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI and technology blogger. Write high-quality, informative, and engaging blog posts about artificial intelligence, machine learning, and related technologies. Your writing should be accessible to both technical and non-technical audiences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
    throw error;
  }
}

async function generateBlogPost() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for cloud deployment');
    }

    console.log('🚀 Starting enhanced blog post generation for cloud deployment...');
    
    // Step 1: Select a random AI topic
    const selectedTopic = await selectRandomTopic();
    
    // Step 2: Initialize services
    console.log('🔧 Initializing AI services...');
    const promptEngine = new EnhancedPromptEngine();
    const topicService = await initTopicService();
    
    // Step 3: Generate enhanced topic with context
    console.log('💡 Generating topic with AI context...');
    const enhancedTopic = await topicService.generateTopicWithContext(selectedTopic, 'ai');
    
    // Step 4: Create enhanced prompt
    console.log('📝 Creating enhanced prompt...');
    const enhancedPrompt = promptEngine.createEnhancedPrompt(
      enhancedTopic.title,
      enhancedTopic.subtitle,
      'technical',
      'blog'
    );
    
    // Step 5: Generate content with OpenAI
    const generatedContent = await generateWithOpenAI(enhancedPrompt.fullPrompt);
    
    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error('Failed to generate content - empty response');
    }
    
    // Step 6: Parse the generated content
    console.log('🔍 Parsing generated content...');
    const lines = generatedContent.split('\n');
    let title = enhancedTopic.title;
    let content = generatedContent;
    
    // Try to extract title from content if it starts with a markdown header
    if (lines[0].startsWith('#')) {
      title = lines[0].replace(/^#+\s*/, '').trim();
      content = lines.slice(1).join('\n').trim();
    }
    
    const slug = generateSlug(title);
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Step 7: Prepare frontmatter
    const frontmatter = {
      title: sanitizeYamlValue(title),
      date: currentDate,
      excerpt: sanitizeYamlValue(enhancedTopic.subtitle || `Exploring ${title.toLowerCase()} and its applications in modern AI systems.`),
      category: 'AI Technology',
      tags: ['AI', 'Machine Learning', 'Technology', 'Innovation'],
      author: 'AI Blog Generator',
      readTime: Math.max(3, Math.ceil(content.length / 200)) + ' min read',
      featured: true,
      published: true
    };
    
    // Step 8: Create final blog post
    const blogPost = `---
title: ${frontmatter.title}
date: ${frontmatter.date}
excerpt: ${frontmatter.excerpt}
category: ${frontmatter.category}
tags: [${frontmatter.tags.map(tag => `"${tag}"`).join(', ')}]
author: ${frontmatter.author}
readTime: ${frontmatter.readTime}
featured: ${frontmatter.featured}
published: ${frontmatter.published}
---

${content}
`;
    
    // Step 9: Save the blog post
    const contentDir = path.join(process.cwd(), 'src', 'content');
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    const filename = `${currentDate}-${slug}.md`;
    const filepath = path.join(contentDir, filename);
    
    fs.writeFileSync(filepath, blogPost, 'utf8');
    
    console.log('✅ Blog post generated successfully!');
    console.log(`📁 File: ${filename}`);
    console.log(`📝 Title: ${title}`);
    console.log(`📊 Word count: ${content.split(/\s+/).length} words`);
    console.log(`⏱️ Read time: ${frontmatter.readTime}`);
    
    return {
      success: true,
      filename,
      title,
      wordCount: content.split(/\s+/).length,
      readTime: frontmatter.readTime
    };
    
  } catch (error) {
    console.error('❌ Error generating blog post:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateBlogPost()
    .then((result) => {
      console.log('🎉 Blog generation completed!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Blog generation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { generateBlogPost };
