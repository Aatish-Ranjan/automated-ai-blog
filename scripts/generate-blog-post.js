#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateBlogPost() {
  try {
    console.log('🤖 AI Blog Generator (Local Ollama)');
    console.log('⠋ Generating new blog post...');
    
    const topic = 'Next.js Performance Optimization Techniques';
    const audience = 'React developers';
    const category = 'Web Development';
    
    const prompt = `Write a comprehensive blog post about "${topic}" for ${audience}. 
The post should be around 800 words and include:
- An engaging introduction
- Clear section headings
- Practical code examples
- Performance tips and best practices
- Specific techniques like code splitting, image optimization, SSR vs SSG
- Actionable insights
- A solid conclusion

Write in a professional yet accessible tone suitable for a technical blog.
Structure the content with proper markdown formatting.`;
    
    // Use ollama command line to generate content
    console.log('⠋ Calling local AI model...');
    const tempPromptFile = path.join(__dirname, 'temp_prompt.txt');
    fs.writeFileSync(tempPromptFile, prompt);
    
    const content = execSync(`ollama run ai-blog-writer-1b:latest "${prompt}"`, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    // Clean up temp file
    if (fs.existsSync(tempPromptFile)) {
      fs.unlinkSync(tempPromptFile);
    }
    
    console.log('✅ Content generated successfully!');
    
    const date = new Date().toISOString();
    const slug = date.split('T')[0] + '-' + generateSlug(topic);
    const wordCount = content.trim().split(/\s+/).length;
    
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

${content.trim()}`;

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
    console.log('📄 File:', filename);
    console.log('📊 Word count:', wordCount);
    console.log('⏱️  Reading time:', Math.ceil(wordCount / 200), 'min');
    console.log('🏷️  Title:', topic);
    
    console.log('\n📈 Blog Summary');
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
    console.log('📁 Total posts:', files.length);
    console.log('📍 Content directory:', contentDir);
    console.log('📄 Latest post:', filename);
    
    return filepath;
    
  } catch (error) {
    console.error('❌ Error generating blog post:', error.message);
    process.exit(1);
  }
}

generateBlogPost();
