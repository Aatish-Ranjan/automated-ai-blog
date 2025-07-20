/**
 * Schema.org JSON-LD Generator for Blog Posts
 * Generates structured data for better SEO and rich snippets
 */

class SchemaGenerator {
  constructor() {
    this.baseUrl = 'https://your-blog-domain.com'; // Update with actual domain
    this.organizationName = 'AI Content Lab';
    this.authorName = 'AI Content Team';
  }

  /**
   * Generates Article Schema.org JSON-LD
   * @param {Object} blogData - Blog post metadata
   * @returns {Object} JSON-LD structured data
   */
  generateArticleSchema(blogData) {
    const {
      title,
      metaDescription,
      slug,
      publishDate,
      lastModified,
      author,
      category,
      tags = [],
      readingTime,
      excerpt,
      estimatedWordCount = 4000
    } = blogData;

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": metaDescription || excerpt,
      "url": `${this.baseUrl}/blog/${slug}`,
      "datePublished": publishDate,
      "dateModified": lastModified || publishDate,
      "author": {
        "@type": "Person",
        "name": author || this.authorName,
        "url": `${this.baseUrl}/about`
      },
      "publisher": {
        "@type": "Organization",
        "name": this.organizationName,
        "logo": {
          "@type": "ImageObject",
          "url": `${this.baseUrl}/logo.png`,
          "width": 400,
          "height": 400
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${this.baseUrl}/blog/${slug}`
      },
      "articleSection": category,
      "keywords": tags.join(', '),
      "wordCount": estimatedWordCount,
      "timeRequired": `PT${readingTime?.replace(' min read', '')}M`,
      "inLanguage": "en-US",
      "isAccessibleForFree": true,
      "genre": ["Technology", "Educational"],
      "audience": {
        "@type": "Audience",
        "audienceType": "Technical professionals and developers"
      }
    };
  }

  /**
   * Generates BreadcrumbList Schema
   * @param {string} category - Blog category
   * @param {string} slug - Post slug
   * @param {string} title - Post title
   * @returns {Object} BreadcrumbList JSON-LD
   */
  generateBreadcrumbSchema(category, slug, title) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": this.baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": `${this.baseUrl}/blog`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": category.charAt(0).toUpperCase() + category.slice(1),
          "item": `${this.baseUrl}/blog/category/${category}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": title,
          "item": `${this.baseUrl}/blog/${slug}`
        }
      ]
    };
  }

  /**
   * Generates FAQ Schema from content headings
   * @param {Array} faqItems - Array of {question, answer} objects
   * @returns {Object} FAQPage JSON-LD
   */
  generateFAQSchema(faqItems = []) {
    if (faqItems.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };
  }

  /**
   * Generates complete Schema.org structured data
   * @param {Object} blogData - Complete blog post data
   * @param {Array} faqItems - Optional FAQ items
   * @returns {string} Complete JSON-LD script tag content
   */
  generateCompleteSchema(blogData, faqItems = []) {
    const schemas = [
      this.generateArticleSchema(blogData),
      this.generateBreadcrumbSchema(blogData.category, blogData.slug, blogData.title)
    ];

    const faqSchema = this.generateFAQSchema(faqItems);
    if (faqSchema) {
      schemas.push(faqSchema);
    }

    return schemas.map(schema => 
      `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`
    ).join('\n');
  }

  /**
   * Extracts potential FAQ items from content
   * @param {string} content - Blog post content
   * @returns {Array} Extracted FAQ items
   */
  extractFAQFromContent(content) {
    const faqItems = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1]?.trim();
      
      // Look for question patterns (headings with question words)
      if (line.startsWith('##') && this.isQuestion(line)) {
        const question = line.replace(/^#+\s*/, '').trim();
        
        // Find the answer (content until next heading)
        let answer = '';
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('#')) break;
          answer += lines[j] + '\n';
        }
        
        if (answer.trim()) {
          faqItems.push({
            question,
            answer: answer.trim().substring(0, 300) + (answer.length > 300 ? '...' : '')
          });
        }
      }
    }
    
    return faqItems.slice(0, 5); // Limit to 5 FAQ items
  }

  /**
   * Checks if a heading is likely a question
   * @param {string} heading - Heading text
   * @returns {boolean} True if appears to be a question
   */
  isQuestion(heading) {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'which', 'who'];
    const headingLower = heading.toLowerCase();
    
    return questionWords.some(word => headingLower.includes(word)) || 
           headingLower.includes('?') ||
           headingLower.includes('common') && headingLower.includes('question');
  }

  /**
   * Updates the base URL for the schema
   * @param {string} newBaseUrl - New base URL
   */
  updateBaseUrl(newBaseUrl) {
    this.baseUrl = newBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  }
}

module.exports = SchemaGenerator;
