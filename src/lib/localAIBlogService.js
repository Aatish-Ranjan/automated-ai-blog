// Local Ollama AI Blog Service
// Integrates with your existing blog generation workflow

class LocalAIBlogService {
  constructor() {
    this.baseUrl = 'http://localhost:11434';
    this.model = 'ai-blog-writer-1b:latest';
  }

  async generateBlogPost(request) {
    const { topic, audience, length, tone, includeIntro, includeConclusion } = request;
    
    const prompt = this.buildPrompt({
      topic,
      audience: audience || 'general readers',
      length: length || 800,
      tone: tone || 'professional',
      includeIntro: includeIntro !== false,
      includeConclusion: includeConclusion !== false,
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.processResponse(data.response, request);
    } catch (error) {
      console.error('Error generating blog post:', error);
      throw new Error('Failed to generate blog post with local AI model');
    }
  }

  buildPrompt(request) {
    const { topic, audience, length, tone, includeIntro, includeConclusion } = request;
    
    let prompt = `Write a comprehensive blog post about "${topic}" for ${audience}. `;
    prompt += `Target length: approximately ${length} words. `;
    prompt += `Tone: ${tone}. `;
    
    if (includeIntro) {
      prompt += 'Start with an engaging introduction that hooks the reader. ';
    }
    
    if (includeConclusion) {
      prompt += 'End with a strong conclusion that reinforces key points. ';
    }
    
    prompt += 'Structure the content with clear headings and subheadings (use ## for main sections). ';
    prompt += 'Make it SEO-friendly with natural keyword integration. ';
    prompt += 'Include practical examples and actionable insights where relevant. ';
    prompt += 'Write in a conversational yet professional style that provides real value to readers.';

    return prompt;
  }

  processResponse(content, request) {
    // Extract title from content or generate one
    const lines = content.split('\n').filter(line => line.trim());
    let title = '';
    let processedContent = content;

    // Look for title in the content
    const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/^\*\*(.+)\*\*$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      // Generate title from topic
      title = this.generateTitleFromTopic(request.topic);
    }

    // Clean up content and ensure proper formatting
    processedContent = this.formatContent(processedContent);

    return {
      title,
      content: processedContent,
      metaDescription: this.generateMetaDescription(processedContent),
      tags: this.extractTags(request.topic, processedContent),
      category: this.determineCategory(request.topic),
      wordCount: processedContent.split(' ').length,
      generatedAt: new Date().toISOString(),
    };
  }

  generateTitleFromTopic(topic) {
    // Convert topic to a proper title
    return topic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  formatContent(content) {
    // Ensure proper markdown formatting
    let formatted = content.trim();
    
    // Fix heading formats
    formatted = formatted.replace(/^\*\*(.+)\*\*$/gm, '## $1');
    formatted = formatted.replace(/^###\s+(.+)$/gm, '### $1');
    
    // Ensure proper spacing
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    return formatted;
  }

  generateMetaDescription(content) {
    // Extract first paragraph or first 160 characters
    const firstParagraph = content.split('\n\n')[0];
    const description = firstParagraph.replace(/[#*]/g, '').trim();
    
    if (description.length > 160) {
      return description.substring(0, 157) + '...';
    }
    
    return description;
  }

  extractTags(topic, content) {
    // Simple tag extraction based on topic and content keywords
    const topicWords = topic.toLowerCase().split(' ');
    const commonTechWords = ['ai', 'javascript', 'react', 'nextjs', 'web development', 'programming', 'technology'];
    
    const tags = [...topicWords];
    
    // Add relevant tech tags if content mentions them
    commonTechWords.forEach(word => {
      if (content.toLowerCase().includes(word) && !tags.includes(word)) {
        tags.push(word);
      }
    });
    
    // Limit to 5 tags and clean them up
    return tags
      .slice(0, 5)
      .map(tag => tag.replace(/[^a-zA-Z0-9\s]/g, '').trim())
      .filter(tag => tag.length > 2);
  }

  determineCategory(topic) {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('ai') || topicLower.includes('artificial intelligence')) {
      return 'Artificial Intelligence';
    }
    if (topicLower.includes('javascript') || topicLower.includes('react') || topicLower.includes('nextjs')) {
      return 'Web Development';
    }
    if (topicLower.includes('programming') || topicLower.includes('coding')) {
      return 'Programming';
    }
    if (topicLower.includes('business') || topicLower.includes('startup')) {
      return 'Business';
    }
    
    return 'Technology';
  }

  async checkModelAvailability() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.models?.some(model => model.name === this.model) || false;
    } catch {
      return false;
    }
  }
}

module.exports = LocalAIBlogService;
