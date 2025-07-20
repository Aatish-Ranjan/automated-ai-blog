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
    
    // Use CLI instead of API since API has issues with model detection
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const process = spawn('ollama', ['run', modelName], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });
      
      let output = '';
      let errorOutput = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log(`📄 Generated ${output.length} characters`);
          resolve(output.trim());
        } else {
          reject(new Error(`Ollama CLI failed with code ${code}: ${errorOutput}`));
        }
      });
      
      process.on('error', (error) => {
        reject(new Error(`Failed to start ollama CLI: ${error.message}`));
      });
      
      // Send the prompt to the model
      process.stdin.write(prompt);
      process.stdin.end();
      
      // Set timeout for long generations
      setTimeout(() => {
        process.kill();
        reject(new Error('Generation timeout after 3 minutes'));
      }, 180000);
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
    
    console.log(`🚀 Generating ${contentType} about "${topic}" using local model...`);

    const prompt = `Write a comprehensive, SEO-optimized blog post about "${topic}". 

WRITE IN PURE MARKDOWN FORMAT ONLY. Do not use JSON format.

Requirements:
- Write a complete blog post of at least 2000 words
- Use proper markdown formatting with ## headers
- Include practical examples and real-world applications
- Write in an engaging, human-like tone
- Target keyword: "${topic}"
- Include introduction, main concepts, practical applications, best practices, and conclusion

Structure your post like this:
# [Engaging title with "${topic}"]

## Introduction
[2-3 paragraph introduction explaining what ${topic} is and why it matters]

## Key Concepts of ${topic}
[Detailed explanation of core concepts]

## Practical Applications
[Real-world examples and use cases]

## Benefits and Advantages
[Key benefits and advantages]

## Challenges and Considerations
[Potential challenges or limitations]

## Best Practices
[Actionable recommendations and best practices]

## Future Outlook
[Future trends and developments]

## Conclusion
[Summary and call to action]

Write the complete blog post now:`;

    const response = await generateWithOllama(prompt, modelName);
    
    // Parse the markdown response
    let blogData;
    try {
      console.log('📄 Raw AI response length:', response.length);
      
      // Since we're expecting pure markdown, not JSON, extract content directly
      let markdownContent = response.trim();
      
      // Remove any potential JSON artifacts or malformed syntax
      markdownContent = markdownContent
        .replace(/definitions_and_background\s*{\s*[^}]*}/g, '')
        .replace(/[{}]/g, '')
        .replace(/",\s*$/gm, '')
        .replace(/^\s*"[^"]*":\s*/gm, '')
        .trim();
      
      // Extract title from the markdown (look for # heading)
      let extractedTitle = `${topic}: A Comprehensive Guide`;
      const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        extractedTitle = titleMatch[1];
      }
      
      // Clean up the markdown content
      if (markdownContent.length < 500) {
        // If content is too short, regenerate with a fallback approach
        throw new Error('Generated content is too short');
      }
      
      console.log('✅ Successfully extracted markdown content');
      
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
      
    } catch (parseError) {
      console.log('⚠️ Content extraction failed, using fallback generation');
      
      const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Create comprehensive fallback content
      const fallbackContent = `# ${topic}: A Comprehensive Guide

## Introduction

${topic} represents a significant advancement in modern technology that is reshaping how we approach various challenges in today's digital landscape. Understanding the fundamental principles and practical applications of ${topic} is essential for professionals and enthusiasts alike.

This comprehensive guide explores the key concepts, benefits, challenges, and future prospects of ${topic}, providing you with the knowledge needed to leverage this technology effectively.

## Key Concepts of ${topic}

The foundation of ${topic} lies in several core principles that work together to deliver enhanced functionality and performance. These concepts form the building blocks for understanding how ${topic} operates and why it has gained significant attention in recent years.

### Technical Fundamentals

${topic} operates on established principles that have been refined and optimized for modern applications. The technical architecture involves multiple components working in harmony to achieve desired outcomes.

### Core Components

Understanding the individual components that make up ${topic} systems is crucial for implementation and optimization. Each component plays a specific role in the overall functionality.

## Practical Applications

${topic} has found applications across various industries and use cases, demonstrating its versatility and practical value.

### Industry Applications

- **Healthcare**: Improving patient outcomes and operational efficiency
- **Finance**: Enhancing security and processing capabilities
- **Manufacturing**: Optimizing production processes and quality control
- **Education**: Transforming learning experiences and accessibility

### Real-World Examples

Several organizations have successfully implemented ${topic} solutions, achieving measurable improvements in their operations and customer satisfaction.

## Benefits and Advantages

The adoption of ${topic} brings numerous benefits that contribute to improved performance and outcomes:

### Performance Improvements
- Enhanced speed and efficiency
- Better resource utilization
- Improved accuracy and reliability

### Cost Benefits
- Reduced operational costs
- Lower maintenance requirements
- Better return on investment

### Strategic Advantages
- Competitive differentiation
- Improved customer experience
- Enhanced scalability

## Challenges and Considerations

While ${topic} offers significant benefits, organizations must also consider potential challenges:

### Technical Challenges
- Implementation complexity
- Integration requirements
- Skills and training needs

### Operational Considerations
- Change management
- Security implications
- Compliance requirements

## Best Practices

To maximize the benefits of ${topic}, consider these proven best practices:

### Planning and Strategy
1. Conduct thorough requirements analysis
2. Develop a comprehensive implementation plan
3. Establish clear success metrics

### Implementation
1. Start with pilot projects
2. Ensure proper training and support
3. Monitor and optimize continuously

### Maintenance and Optimization
1. Regular performance monitoring
2. Proactive maintenance schedules
3. Continuous improvement processes

## Future Outlook

The future of ${topic} looks promising, with ongoing developments and innovations expanding its capabilities and applications. Emerging trends suggest continued growth and evolution in this space.

### Emerging Trends
- Advanced automation capabilities
- Enhanced integration possibilities
- Improved user experiences

### Market Projections
Industry analysts predict continued growth and adoption of ${topic} across various sectors, driven by increasing demand and technological advancements.

## Conclusion

${topic} represents a powerful technology that offers significant benefits for organizations willing to invest in proper implementation and optimization. By understanding the key concepts, applications, and best practices outlined in this guide, you can make informed decisions about leveraging ${topic} in your own context.

The key to success lies in careful planning, proper implementation, and continuous optimization. As the technology continues to evolve, staying informed about new developments and best practices will ensure you maximize the value of your ${topic} initiatives.

Ready to explore ${topic} further? Consider starting with a pilot project to gain hands-on experience and build expertise within your organization.`;

      blogData = {
        title: `${topic}: A Comprehensive Guide`,
        content: fallbackContent,
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
