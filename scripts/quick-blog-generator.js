#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function generateBlogPost() {
  try {
    // Import fetch dynamically
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    
    console.log('🤖 Generating new blog post...');
    
    const topic = 'Next.js Performance Optimization Techniques';
    const audience = 'React developers';
    const category = 'Web Development';
    
    const prompt = `Write a comprehensive blog post about "${topic}" for ${audience}. 
The post should be around 800 words, include practical tips, code examples, and actionable insights.
Write in a professional yet accessible tone.
Structure the content with clear headings and bullet points where appropriate.
Include specific techniques and best practices.
Cover topics like:
- Code splitting and lazy loading
- Image optimization
- Server-side rendering vs static generation
- Bundle optimization
- Caching strategies
- Performance monitoring`;

    console.log('⠋ Calling AI model...');
    
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'ai-blog-writer-1b:latest',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Content generated successfully!');
    
    const date = new Date().toISOString();
    const slug = date.split('T')[0] + '-nextjs-performance-optimization-techniques';
    const content = data.message.content;
    const wordCount = content.split(' ').length;
    
    // Create markdown content with frontmatter
    const frontmatter = `---
title: ${topic}
date: '${date}'
description: 'Essential techniques for optimizing Next.js application performance and improving user experience'
tags:
  - nextjs
  - performance
  - react
  - optimization
  - web-development
category: ${category}
author: AI Assistant
draft: false
featured: false
wordCount: ${wordCount}
readingTime: ${Math.ceil(wordCount / 200)} min read
generatedBy: ai-blog-writer-1b
generatedAt: '${date}'
---

${content}`;

    // Save to file
    const contentDir = path.join(__dirname, '..', 'src', 'content');
    const filename = `${slug}.md`;
    const filepath = path.join(contentDir, filename);
    
    // Ensure content directory exists
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, frontmatter);
    
    console.log('✅ Blog post saved successfully!');
    console.log('📄 File:', filepath);
    console.log('📊 Word count:', wordCount);
    console.log('⏱️  Reading time:', Math.ceil(wordCount / 200), 'min');
    console.log('🏷️  Title:', topic);
    
    return filepath;
    
  } catch (error) {
    console.error('❌ Error generating blog post:', error.message);
    process.exit(1);
  }
}

generateBlogPost();
