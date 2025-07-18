const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Ollama local model configuration
const OLLAMA_BASE_URL = 'http://localhost:11434';

// Try multiple models in order of preference (fallback system)
const MODELS_TO_TRY = [
  'ai-blog-writer',    // Your custom model (if created)
  'llama3.1:8b',      // Preferred model
  'llama3:8b',        // Alternative version
  'gemma:7b',         // Google's model  
  'phi3:latest',      // Microsoft's model
  'phi3:mini',        // Smaller Microsoft model
  'tinyllama',        // Lightweight fallback
  'codellama:7b'      // Code-focused model
];

const TOPICS = [
  'artificial intelligence',
  'machine learning',
  'deep learning',
  'prompt engineering',
  'neural networks',
  'AI ethics',
  'AI in healthcare',
  'AI in finance',
  'computer vision',
  'natural language processing',
  'robotics',
  'quantum computing',
  'blockchain technology',
  'tech startups',
  'digital transformation',
  'internet of things',
  'augmented reality',
  'virtual reality',
  'edge computing',
  'cybersecurity',
];

const CONTENT_TYPES = [
  'tutorial',
  'analysis',
  'guide',
  'trends',
  'predictions',
  'case study',
  'comparison',
  'review',
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getAvailableModel() {
  try {
    // Get list of available models
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const availableModels = response.data.models.map(m => m.name);
    
    console.log('📋 Available models:', availableModels);
    
    // Find the first model from our preference list that's available
    for (const model of MODELS_TO_TRY) {
      if (availableModels.includes(model)) {
        console.log(`✅ Using model: ${model}`);
        return model;
      }
    }
    
    // If none of our preferred models are available, use the first available one
    if (availableModels.length > 0) {
      const fallbackModel = availableModels[0];
      console.log(`⚠️ Using fallback model: ${fallbackModel}`);
      return fallbackModel;
    }
    
    throw new Error('No models available. Please download a model first.');
    
  } catch (error) {
    console.error('❌ Error checking available models:', error.message);
    console.log('💡 Try: ollama pull phi3:mini');
    throw error;
  }
}

async function generateWithOllama(prompt, modelName) {
  try {
    console.log(`🤖 Generating with model: ${modelName}`);
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: modelName,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 3000,
      }
    });
    
    return response.data.response;
  } catch (error) {
    console.error('Error calling Ollama:', error);
    throw error;
  }
}

async function generateBlogPost(modelName) {
  try {
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const contentType = CONTENT_TYPES[Math.floor(Math.random() * CONTENT_TYPES.length)];
    
    console.log(`Generating ${contentType} about ${topic} using local model...`);

    const prompt = `You are an expert SEO content strategist and blog copywriter with 10+ years of experience.

Generate a blog article with the following criteria:
- Topic: ${contentType} about ${topic}
- Target keyword: ${topic}
- Tone: Friendly, informative, and human-like
- Audience: Tech enthusiasts, developers, and AI professionals

Requirements:
1. Title with the main keyword
2. Catchy introduction (2–3 lines)
3. At least 5 sections with headings (use H2 tags)
4. Add real-world examples and engaging language
5. Add internal links (e.g., [related post](/blog/related-topic))
6. Add one external citation to a credible source
7. Include meta title and meta description (under 155 characters)
8. End with a human-style conclusion and call to action
9. Maintain readability: short sentences, active voice
10. Avoid robotic or spammy language

Output ONLY a valid JSON object with this exact structure:
{
  "metaTitle": "SEO-optimized title under 60 characters",
  "metaDescription": "Compelling description under 155 characters",
  "title": "Article title with target keyword",
  "excerpt": "Brief summary (150-200 characters)",
  "content": "Full article content in markdown format with H2 headings, real examples, links, and citations",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "Technology",
  "targetKeyword": "${topic}",
  "readingTime": "5 min read"
}`;

    const response = await generateWithOllama(prompt, modelName);
    
    // Parse the JSON response
    let blogData;
    try {
      // Clean up response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        blogData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', response);
      throw new Error('Failed to parse AI response');
    }

    // Generate metadata
    const currentDate = new Date().toISOString().split('T')[0];
    const slug = generateSlug(blogData.title);
    
    // Create frontmatter
    const frontmatter = `---
title: "${blogData.title}"
metaTitle: "${blogData.metaTitle}"
metaDescription: "${blogData.metaDescription}"
excerpt: "${blogData.excerpt}"
date: "${currentDate}"
author: "AI Blog"
tags: [${blogData.tags.map(tag => `"${tag}"`).join(', ')}]
category: "${blogData.category}"
targetKeyword: "${blogData.targetKeyword}"
image: "/images/blog/default-blog-image.jpg"
featured: false
readingTime: "${blogData.readingTime}"
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
    console.log(`Meta Title: ${blogData.metaTitle}`);
    console.log(`Target Keyword: ${blogData.targetKeyword}`);
    console.log(`Tags: ${blogData.tags.join(', ')}`);
    
    return {
      fileName,
      title: blogData.title,
      metaTitle: blogData.metaTitle,
      metaDescription: blogData.metaDescription,
      slug,
      tags: blogData.tags,
      category: blogData.category,
      targetKeyword: blogData.targetKeyword,
      readingTime: blogData.readingTime,
    };
    
  } catch (error) {
    console.error('Error generating blog post:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting local AI blog generation...');
    
    // Check if Ollama is running
    await axios.get(`${OLLAMA_BASE_URL}/api/version`);
    console.log('✅ Ollama is running');
    
    // Get available model
    const modelName = await getAvailableModel();
    
    const result = await generateBlogPost(modelName);
    console.log('\n🎉 Blog post generation completed successfully!');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Ollama is not running. Please start Ollama first.');
      console.error('💡 Run: ollama serve');
      console.error('💡 Then download a model: ollama pull phi3:mini');
    } else if (error.message.includes('No models available')) {
      console.error('\n❌ No models found. Please download a model first.');
      console.error('💡 Try: ollama pull phi3:mini');
      console.error('💡 Or check: ollama list');
    } else {
      console.error('\n❌ Failed to generate blog post:', error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateBlogPost };
