// Client-side AI Blog Service for GitHub Pages
// Works without API routes by calling Ollama directly from the browser

class ClientAIBlogService {
  constructor() {
    this.baseUrl = 'http://localhost:11434';
    this.model = 'ai-blog-writer-1b';
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
      throw new Error('Failed to generate blog post with local AI model. Make sure Ollama is running.');
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
    return topic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  formatContent(content) {
    let formatted = content.trim();
    formatted = formatted.replace(/^\*\*(.+)\*\*$/gm, '## $1');
    formatted = formatted.replace(/^###\s+(.+)$/gm, '### $1');
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    return formatted;
  }

  generateMetaDescription(content) {
    const firstParagraph = content.split('\n\n')[0];
    const description = firstParagraph.replace(/[#*]/g, '').trim();
    
    if (description.length > 160) {
      return description.substring(0, 157) + '...';
    }
    
    return description;
  }

  extractTags(topic, content) {
    const topicWords = topic.toLowerCase().split(' ');
    const commonTechWords = ['ai', 'javascript', 'react', 'nextjs', 'web development', 'programming', 'technology'];
    
    const tags = [...topicWords];
    
    commonTechWords.forEach(word => {
      if (content.toLowerCase().includes(word) && !tags.includes(word)) {
        tags.push(word);
      }
    });
    
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

  // Generate markdown file content
  generateMarkdownFile(blogData) {
    const date = new Date();
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

    const frontmatterStr = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n');

    return `---\n${frontmatterStr}\n---\n\n${blogData.content}`;
  }

  // Generate filename
  generateFilename(title) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return `${dateStr}-${slug}.md`;
  }
}

export default ClientAIBlogService;
