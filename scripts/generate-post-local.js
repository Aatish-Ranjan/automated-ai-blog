const axios = require('axios');
const fs = require('fs');
const path = require('path');

const OLLAMA_BASE_URL = 'http://localhost:11434';

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
  if (!value) return '';
  return value
    .replace(/\n/g, ' ')        // Replace newlines with spaces
    .replace(/"/g, '\\"')       // Escape quotes
    .replace(/\\/g, '\\\\')     // Escape backslashes
    .trim();
}

async function getAvailableModel() {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const models = response.data.models;
    
    if (!models || models.length === 0) {
      throw new Error('No models available. Please pull a model first with: ollama pull phi3:mini');
    }
    
    // Prefer ai-blog-writer models, then phi3, then any available model
    const preferredModels = ['ai-blog-writer-1b:latest', 'phi3:mini', 'phi3:latest', 'llama3.2:latest'];
    
    for (const preferred of preferredModels) {
      const found = models.find(model => model.name === preferred);
      if (found) {
        console.log(`✅ Using model: ${preferred}`);
        return preferred;
      }
    }
    
    // Use the first available model
    const firstModel = models[0].name;
    console.log(`✅ Using available model: ${firstModel}`);
    return firstModel;
    
  } catch (error) {
    console.error('Error fetching models:', error.message);
    throw error;
  }
}

async function generateWithOllama(prompt, modelName) {
  try {
    console.log(`🤖 Generating content with ${modelName}...`);
    
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: modelName,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 6000,       // Much longer content generation
        repeat_penalty: 1.1,
        stop: ['Human:', 'Assistant:']
      }
    }, {
      timeout: 180000  // 3 minute timeout for longer generation
    });
    
    console.log(`📄 Generated ${response.data.response.length} characters`);
    return response.data.response;
  } catch (error) {
    console.error('❌ Error calling Ollama:', error.message);
    throw error;
  }
}

async function generateBlogPost(modelName) {
  try {
    // Use TopicSelectionService to automatically select a topic
    console.log('🎯 Selecting topic using intelligent topic selection...');
    const topicService = await initTopicService();
    const selectedTopic = topicService.getSmartTopic();
    
    if (!selectedTopic) {
      throw new Error('Failed to select a topic automatically');
    }
    
    console.log(`📝 Selected topic: "${selectedTopic.title}" from category: ${selectedTopic.category}`);
    console.log(`📊 Topic metadata: Difficulty: ${selectedTopic.difficulty}, Keywords: ${selectedTopic.keywords?.join(', ')}`);
    
    const topic = selectedTopic.title;
    const contentType = selectedTopic.contentType || 'comprehensive-guide';
    
    console.log(`🚀 Generating ${contentType} about "${topic}" using local model...`);

    const prompt = `You are an expert SEO content strategist and blog copywriter. Write a comprehensive, engaging blog post about "${topic}".

CRITICAL REQUIREMENTS:
- Respond with ONLY a valid JSON object. No other text before or after.
- The content must be at least 3000 characters long and comprehensive
- Write in markdown format with proper headers, lists, and formatting
- Include practical examples, case studies, and actionable insights
- Write in a natural, engaging, human tone

Required JSON format:
{
  "title": "Engaging title with primary keyword",
  "content": "Complete markdown blog post content (minimum 3000 characters with ## headers, examples, and detailed explanations)",
  "metaDescription": "150-character SEO meta description",
  "tags": ["primary-keyword", "secondary-keyword", "related-term"],
  "category": "Technology",
  "excerpt": "Brief 2-sentence summary"
}

Topic: ${topic}
Content Type: ${contentType}
Target Audience: Technical professionals and enthusiasts
Writing Style: Professional, informative, engaging, human-like
Required Sections: Introduction, main concepts, practical applications, best practices, conclusion

Generate a comprehensive blog post now:`;

    const response = await generateWithOllama(prompt, modelName);
    
    // Parse the JSON response with improved error handling
    let blogData;
    try {
      console.log('📄 Raw AI response length:', response.length);
      
      // Clean up response to extract JSON
      let jsonText = response.trim();
      
      // Look for JSON structure
      const jsonStartIndex = jsonText.indexOf('{');
      const jsonEndIndex = jsonText.lastIndexOf('}');
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        jsonText = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
        
        // Fix common JSON issues
        jsonText = jsonText
          .replace(/```markdown\s*/g, '')
          .replace(/```/g, '')
          .replace(/[\u201C\u201D]/g, '"')  // Replace smart quotes
          .replace(/[\u2018\u2019]/g, "'")  // Replace smart apostrophes
          .replace(/\n\s*\n/g, '\\n\\n');   // Handle newlines in content
        
        console.log('🔍 Attempting to parse JSON...');
        blogData = JSON.parse(jsonText);
        console.log('✅ Successfully parsed JSON response');
        
      } else {
        throw new Error('No valid JSON structure found in response');
      }
      
      // Ensure content is a string, not an array
      if (Array.isArray(blogData.content)) {
        blogData.content = blogData.content.join('\\n\\n');
      }
      
      // More lenient validation - accept any reasonable content
      if (!blogData.content || blogData.content.length < 300) {
        throw new Error('Generated content is too short');
      }
      
    } catch (parseError) {
      console.log('⚠️ JSON parsing failed, extracting content from AI response');
      
      // Try to extract content from malformed JSON
      let extractedTitle = `Understanding ${topic}: A Comprehensive Guide`;
      let extractedContent = response.trim();
      
      // Look for title in JSON structure first
      const titleMatch = response.match(/"title":\s*"([^"]+)"/);
      if (titleMatch) {
        extractedTitle = titleMatch[1];
      }
      
      // Look for content in JSON structure - handle multiline content properly
      const contentMatch = response.match(/"content":\s*"((?:[^"\\]|\\.)*)"/s);
      if (contentMatch) {
        // Unescape the content properly
        extractedContent = contentMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      } else {
        // If no JSON content found, look for markdown content after any JSON
        const jsonEndMatch = response.lastIndexOf('}');
        if (jsonEndMatch !== -1 && jsonEndMatch < response.length - 50) {
          // There's content after the JSON
          extractedContent = response.substring(jsonEndMatch + 1).trim();
        } else {
          // Look for markdown headers to extract content
          const markdownMatch = response.match(/(#{1,2}\s*.+[\s\S]*)/);
          if (markdownMatch) {
            extractedContent = markdownMatch[1];
          }
        }
      }
      
      const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      blogData = {
        title: extractedTitle,
        content: extractedContent,
        metaDescription: `Learn about ${topic} with this comprehensive guide covering key concepts, applications, and best practices.`,
        tags: selectedTopic.keywords || [slug, 'technology', 'guide'],
        category: selectedTopic.category || 'Technology',
        excerpt: `Explore the essential concepts and practical applications of ${topic} in this detailed guide.`,
        targetKeyword: topic,
        readingTime: "8 min read"
      };
    }

    // Create the blog post data
    const currentDate = new Date().toISOString().split('T')[0];
    const slug = generateSlug(blogData.title);
    
    // Ensure all required fields exist and sanitize them for YAML
    const finalBlogData = {
      title: sanitizeYamlValue(blogData.title || `Understanding ${topic}: A Comprehensive Guide`),
      metaTitle: sanitizeYamlValue(blogData.metaTitle || blogData.title || `Understanding ${topic}: A Comprehensive Guide`),
      metaDescription: sanitizeYamlValue(blogData.metaDescription || `Learn about ${topic} with this comprehensive guide covering key concepts, applications, and best practices.`),
      excerpt: sanitizeYamlValue(blogData.excerpt || `Explore the essential concepts and practical applications of ${topic} in this detailed guide.`),
      content: blogData.content || `# Understanding ${topic}\n\nThis is a comprehensive guide about ${topic}.\n\n## Introduction\n\n${topic} is an important topic in today's technology landscape.\n\n## Key Concepts\n\nThis section covers the fundamental aspects of ${topic}.\n\n## Conclusion\n\nIn conclusion, ${topic} offers significant benefits for modern applications.`,
      tags: Array.isArray(blogData.tags) ? blogData.tags : (selectedTopic.keywords || [topic.toLowerCase().replace(/\s+/g, '-'), 'technology', 'guide']),
      category: sanitizeYamlValue(blogData.category || selectedTopic.category || 'Technology'),
      targetKeyword: sanitizeYamlValue(blogData.targetKeyword || topic),
      readingTime: sanitizeYamlValue(blogData.readingTime || "8 min read")
    };
    
    // Create frontmatter
    const frontmatter = `---
title: "${finalBlogData.title}"
metaTitle: "${finalBlogData.metaTitle}"
metaDescription: "${finalBlogData.metaDescription}"
excerpt: "${finalBlogData.excerpt}"
date: "${currentDate}"
author: "AI Blog"
tags: [${finalBlogData.tags.map(tag => `"${tag}"`).join(', ')}]
category: "${finalBlogData.category}"
targetKeyword: "${finalBlogData.targetKeyword}"
image: "/images/blog/default-blog-image.jpg"
featured: false
readingTime: "${finalBlogData.readingTime}"
---

`;

    const fullContent = frontmatter + finalBlogData.content;
    
    // Ensure content directory exists
    const contentDir = path.join(process.cwd(), 'src', 'content');
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    // Write the blog post
    const fileName = `${currentDate}-${slug}.md`;
    const filePath = path.join(contentDir, fileName);
    
    fs.writeFileSync(filePath, fullContent);
    
    console.log(`\n✅ Blog post generated successfully: ${fileName}`);
    console.log(`📝 Title: ${finalBlogData.title}`);
    console.log(`🎯 Target Keyword: ${finalBlogData.targetKeyword}`);
    console.log(`🏷️ Tags: ${finalBlogData.tags.join(', ')}`);
    console.log(`📊 Content Length: ${finalBlogData.content.length} characters`);
    
    // Mark topic as used in the selection service
    topicService.markTopicAsUsed(selectedTopic.id);
    console.log(`✅ Topic marked as used to prevent immediate reuse`);
    
    return {
      fileName,
      title: finalBlogData.title,
      metaTitle: finalBlogData.metaTitle,
      metaDescription: finalBlogData.metaDescription,
      slug,
      tags: finalBlogData.tags,
      category: finalBlogData.category,
      targetKeyword: finalBlogData.targetKeyword,
      readingTime: finalBlogData.readingTime,
      selectedTopic: selectedTopic
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
