const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OLLAMA_BASE_URL = 'http://localhost:11434';
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

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
  if (!value) return '';
  return value
    .replace(/\n/g, ' ')        // Replace newlines with spaces
    .replace(/"/g, '\\"')       // Escape quotes
    .replace(/\\/g, '\\\\')     // Escape backslashes
    .trim();
}

async function getAvailableModel() {
  try {
    // Try to get models from API first
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const models = response.data.models;
    
    if (models && models.length > 0) {
      // Prefer ai-blog-writer models, then phi3, then any available model
      const preferredModels = ['ai-blog-writer-1b:latest', 'ai-blog-writer:latest', 'phi3:mini', 'phi3:latest', 'llama3.2:latest'];
      
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
    } else {
      // Fallback: API returns empty but we know models exist via CLI
      console.log('⚠️ API returns no models, using known working model from CLI...');
      
      // Since we confirmed via CLI that ai-blog-writer-1b:latest works, use it directly
      const workingModel = 'ai-blog-writer-1b:latest';
      console.log(`✅ Using CLI-verified model: ${workingModel}`);
      return workingModel;
    }
    
  } catch (error) {
    console.error('Error fetching models:', error.message);
    throw error;
  }
}

async function generateWithOllama(prompt, modelName) {
  try {
    console.log(`🤖 Generating content with ${modelName} via CLI...`);
    
    // Use CLI with better buffering and timeout handling
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const process = spawn('ollama', ['run', modelName], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });
      
      let output = '';
      let errorOutput = '';
      
      // Increase buffer sizes to handle large content
      process.stdout.setEncoding('utf8');
      process.stderr.setEncoding('utf8');
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log(`📄 Generated ${output.length} characters`);
          // Remove any CLI artifacts or loading indicators
          const cleanOutput = output
            .replace(/⠙⠹⠸⠼⠴⠦⠧⠇⠏⠋/g, '') // Remove spinner characters
            .replace(/^[⠙⠹⠸⠼⠴⠦⠧⠇⠏⠋\s]*/, '') // Remove leading spinner
            .trim();
          resolve(cleanOutput);
        } else {
          reject(new Error(`Ollama CLI failed with code ${code}: ${errorOutput}`));
        }
      });
      
      process.on('error', (error) => {
        reject(new Error(`Failed to start ollama CLI: ${error.message}`));
      });
      
      // Send the prompt with explicit completion instruction
      const enhancedPrompt = `${prompt}

Important: Write a complete article with proper conclusion. Do not stop mid-sentence.`;
      
      process.stdin.write(enhancedPrompt);
      process.stdin.end();
      
      // Increase timeout to 5 minutes for longer content
      setTimeout(() => {
        process.kill();
        reject(new Error('Generation timeout after 5 minutes'));
      }, 300000);
    });
    
  } catch (error) {
    console.error('❌ Error calling Ollama CLI:', error.message);
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
    
    console.log(`🚀 Generating ${contentType} about "${topic}" using Enhanced Prompt Engine...`);

    // Initialize Enhanced Prompt Engine
    const promptEngine = new EnhancedPromptEngine();
    
    // Generate enhanced keywords if not provided
    const topicKeywords = selectedTopic.keywords && selectedTopic.keywords.length > 0 
      ? selectedTopic.keywords 
      : promptEngine.generateKeywordSuggestions(topic, selectedTopic.category);

    // Generate enhanced prompt
    const prompt = promptEngine.generateEnhancedPrompt({
      topic: topic,
      keywords: topicKeywords,
      difficulty: selectedTopic.difficulty || 'intermediate',
      targetWords: 4000,
      category: selectedTopic.category || 'technology',
      audience: 'technical professionals and developers'
    });

    // Validate prompt quality
    const validation = promptEngine.validatePrompt(prompt);
    console.log(`✅ Prompt validation: ${validation.score} (${validation.isValid ? 'PASSED' : 'NEEDS REVIEW'})`);
    
    if (!validation.isValid) {
      console.warn(`⚠️ Missing prompt features: ${validation.missing.join(', ')}`);
    }

    const response = await generateWithOllama(prompt, modelName);
    
    // Use the model's raw markdown output directly
    let blogData;
    try {
      console.log('📄 Raw AI response length:', response.length);
      
      // Use the model's content exactly as generated - no parsing needed!
      let markdownContent = response.trim();
      
      // Check if content seems complete (has a conclusion section)
      const hasConclusion = /##\s*Conclusion/i.test(markdownContent);
      const hasProperEnding = markdownContent.endsWith('.') || markdownContent.endsWith('!') || markdownContent.endsWith('?');
      
      if (!hasConclusion || !hasProperEnding) {
        console.log('⚠️ Content appears incomplete, adding conclusion...');
        
        // Add a proper conclusion if missing
        if (!hasConclusion) {
          markdownContent += `\n\n## Conclusion\n\n${topic} plays a crucial role in today's technology landscape. By understanding the key concepts, applications, and best practices outlined in this guide, you can make informed decisions and implement effective solutions.\n\nStaying current with developments in ${topic} will help you maximize its benefits while mitigating potential challenges. Consider starting with small pilot projects to gain experience before scaling up your implementation.\n\nReady to get started with ${topic}? Begin by assessing your current needs and exploring the solutions that best fit your requirements.`;
        }
      }
      
      // Extract title from the first # heading in the content
      let extractedTitle = `${topic}: A Comprehensive Guide`;
      const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        extractedTitle = titleMatch[1];
      }
      
      console.log('✅ Using model content directly');
      
      blogData = {
        title: extractedTitle,
        content: markdownContent,
        metaDescription: `Learn about ${topic} with this comprehensive guide covering key concepts, applications, and best practices.`,
        tags: selectedTopic.keywords || [topic.toLowerCase().replace(/\s+/g, '-'), 'technology', 'guide'],
        category: selectedTopic.category || 'Technology',
        excerpt: `Explore the essential concepts and practical applications of ${topic} in this detailed guide.`,
        targetKeyword: topic,
        readingTime: "8 min read"
      };
      
    } catch (error) {
      console.log('⚠️ Error with model content, using fallback');
      
      // Simple fallback if something goes wrong
      blogData = {
        title: `${topic}: A Comprehensive Guide`,
        content: response.trim() || `# ${topic}: A Comprehensive Guide\n\nThis is a comprehensive guide about ${topic}.`,
        metaDescription: `Learn about ${topic} with this comprehensive guide covering key concepts, applications, and best practices.`,
        tags: selectedTopic.keywords || [topic.toLowerCase().replace(/\s+/g, '-'), 'technology', 'guide'],
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
    
    // Fetch relevant image from Pixabay
    let imagePath = "/images/blog/default-blog-image.jpg";
    try {
      console.log('🖼️ Fetching relevant image from Pixabay...');
      const imageKeywords = extractKeywordsForImage(finalBlogData.title, finalBlogData.content, finalBlogData.tags);
      console.log(`🔍 Image search keywords: ${imageKeywords}`);
      
      const imageData = await fetchPixabayImage(imageKeywords);
      if (imageData) {
        console.log(`📥 Found image: ${imageData.tags} (${imageData.webformatWidth}x${imageData.webformatHeight})`);
        
        // Download the image
        const downloadedPath = await downloadImage(imageData.webformatURL, slug);
        if (downloadedPath) {
          imagePath = `/images/blog/${path.basename(downloadedPath)}`;
          console.log(`✅ Image downloaded: ${imagePath}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch Pixabay image, using default:', error.message);
    }

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
image: "${imagePath}"
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
      imagePath,
      selectedTopic: selectedTopic
    };
    
  } catch (error) {
    console.error('Error generating blog post:', error);
    throw error;
  }
}

// Image fetching functions
function extractKeywordsForImage(title, content, tags) {
  // Start with title keywords
  let keywords = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 3);
  
  // Add relevant tags
  if (tags && Array.isArray(tags)) {
    keywords = keywords.concat(tags.slice(0, 2));
  }
  
  // Look for key technical terms in content
  const commonTechTerms = [
    'artificial intelligence', 'machine learning', 'technology', 'software', 
    'development', 'programming', 'web', 'mobile', 'cloud', 'security', 
    'blockchain', 'automation', 'digital', 'innovation', 'business', 
    'marketing', 'design', 'science', 'research', 'analysis', 'data',
    'analytics', 'computing', 'network', 'database', 'algorithm'
  ];
  
  const contentLower = content.toLowerCase();
  const foundTerms = commonTechTerms.filter(term => contentLower.includes(term)).slice(0, 3);
  
  // Remove duplicates and combine
  const allKeywords = [...new Set([...keywords, ...foundTerms])];
  
  return allKeywords.slice(0, 5).join(' ');
}

async function fetchPixabayImage(query) {
  if (!PIXABAY_API_KEY) {
    console.log('⚠️ No Pixabay API key found, skipping image fetch');
    return null;
  }

  try {
    console.log(`🖼️ Searching for image with query: "${query}"`);
    
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: PIXABAY_API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        category: 'business,computer,education,science,people',
        min_width: 1920,
        min_height: 1080,
        safesearch: 'true',
        order: 'popular',
        per_page: 10
      }
    });

    if (response.data && response.data.hits && response.data.hits.length > 0) {
      const image = response.data.hits[0];
      console.log(`✅ Found image: ${image.tags} (${image.imageWidth}x${image.imageHeight})`);
      return {
        url: image.largeImageURL || image.webformatURL,
        tags: image.tags,
        user: image.user
      };
    } else {
      console.log('❌ No suitable images found on Pixabay');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching image from Pixabay:', error.message);
    return null;
  }
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading image: ${filename}`);
    
    const filePath = path.join(process.cwd(), 'public', 'images', 'blog', filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Image downloaded: ${filename}`);
        resolve(filePath);
      });
      
      file.on('error', (error) => {
        fs.unlink(filePath, () => {}); // Clean up partial file
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
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
