/**
 * Enhanced Prompt Engine for AI Blog Generation
 * Incorporates advanced SEO, content structure, and metadata generation
 */

class EnhancedPromptEngine {
  constructor() {
    this.defaultWordTarget = 4000;
    this.defaultReadingTimePerWord = 0.25; // 250 words per minute average
  }

  /**
   * Generates a comprehensive, enhanced prompt for blog post creation
   * @param {Object} options - Configuration options
   * @returns {string} Enhanced prompt string
   */
  generateEnhancedPrompt(options = {}) {
    const {
      topic,
      keywords = [],
      difficulty = 'intermediate',
      targetWords = this.defaultWordTarget,
      category = 'technology',
      audience = 'technical professionals'
    } = options;

    const estimatedReadTime = Math.ceil(targetWords * this.defaultReadingTimePerWord / 60);
    const primaryKeyword = keywords[0] || topic;
    const semanticKeywords = keywords.slice(1, 4);
    
    return `You are an elite AI content strategist and SEO expert with 15+ years of experience in technical content creation.

**MISSION**: Write a complete, comprehensive blog post about "${topic}" that will rank in Google's top 3 results and provide exceptional value to readers.

## IMPORTANT: You must write the COMPLETE blog post, not just instructions or templates. Start immediately with the YAML frontmatter and write the entire article.

## CONTENT SPECIFICATIONS

### 📊 **Length & Reading Experience**
- **Target Length**: Exactly ${targetWords} words of actual content
- **Estimated Reading Time**: ${estimatedReadTime} minutes
- **Difficulty Level**: ${difficulty}
- **Target Audience**: ${audience}

### 🎯 **SEO & Keyword Strategy**
- **Primary Keyword**: "${primaryKeyword}" (use naturally throughout)
- **Include primary keyword in**: Title, first 100 words, at least 2 H2 headings
- **Semantic Keywords**: ${semanticKeywords.length > 0 ? semanticKeywords.join(', ') : 'technology, innovation, digital transformation'}
- **Keyword Density**: 1-2% natural usage throughout content

### 🏗️ **REQUIRED STRUCTURE - Write Complete Content for Each Section**

**1. Start with YAML Frontmatter**:
\`\`\`yaml
---
title: "[Compelling title with primary keyword]"
metaTitle: "[60-char SEO title]"
metaDescription: "[150-160 char description with primary keyword]"
slug: "[url-friendly-slug]"
publishDate: "${new Date().toISOString().split('T')[0]}"
lastModified: "${new Date().toISOString().split('T')[0]}"
author: "AI Content Team"
category: "${category}"
tags: ["${primaryKeyword}", ${semanticKeywords.map(k => `"${k}"`).join(', ')}]
readingTime: "${estimatedReadTime} min read"
difficulty: "${difficulty}"
featured: false
excerpt: "[2-3 sentence compelling summary]"
---
\`\`\`

**2. Write Complete Article Content**:

### Introduction (400-500 words)
- Start with an engaging hook (statistic, question, or bold statement)
- Include primary keyword "${primaryKeyword}" in first 100 words
- Provide clear value proposition
- Include a 40-50 word featured snippet answer

### Main Content Sections (Use ## headings):
Write detailed, comprehensive content for these sections:
- ## Understanding ${topic}: Core Concepts and Definitions
- ## Key Benefits and Applications of ${topic}
- ## Real-World Examples and Case Studies (include 2-3 named companies)
- ## Best Practices and Implementation Strategies
- ## Common Challenges and Solutions
- ## Future Trends and Considerations

### Advanced Formatting:
- Use **bold text** for key terms
- Include bullet points for easy scanning
- Add numbered lists for processes
- Write in clear, professional tone

### Conclusion (300-400 words)
- Summarize 3-5 key takeaways in bullet points
- Include clear call-to-action
- Professional closing statement

## 🔗 **LINKING REQUIREMENTS**
- Include 2-3 internal link placeholders: [Related Topic](internal-link-placeholder)
- Include 1-2 external authority link placeholders: [Authority Source](external-link-placeholder)

## 🏢 **COMPANY EXAMPLES**
Include specific references to 2-3 real companies or platforms relevant to ${topic}

## � **WRITING GUIDELINES**
- Professional yet conversational tone
- Clear explanations for complex concepts
- Practical, actionable insights
- Natural keyword integration
- Engaging and valuable content

**WRITE THE COMPLETE BLOG POST NOW, starting with the YAML frontmatter and including all ${targetWords} words of content:**`;
  }

  /**
   * Generates topic-specific keyword suggestions
   * @param {string} topic - Main topic
   * @param {string} category - Content category
   * @returns {Array} Suggested keywords
   */
  generateKeywordSuggestions(topic, category = 'technology') {
    const baseKeywords = [topic.toLowerCase()];
    
    // Add category-specific keywords
    const categoryKeywords = {
      'ai': ['artificial intelligence', 'machine learning', 'AI technology'],
      'generative_ai': ['generative AI', 'large language models', 'AI generation'],
      'technology': ['technology', 'innovation', 'digital transformation'],
      'programming': ['software development', 'coding', 'programming'],
      'data_science': ['data analysis', 'analytics', 'big data'],
      'cybersecurity': ['security', 'cybersecurity', 'data protection']
    };

    const suggested = categoryKeywords[category] || categoryKeywords['technology'];
    return [...baseKeywords, ...suggested].slice(0, 5);
  }

  /**
   * Validates prompt completeness
   * @param {string} prompt - Generated prompt
   * @returns {Object} Validation result
   */
  validatePrompt(prompt) {
    const checks = {
      hasWordTarget: prompt.includes('words'),
      hasKeywordStrategy: prompt.includes('Primary Keyword'),
      hasStructure: prompt.includes('YAML Frontmatter'),
      hasLinking: prompt.includes('LINKING STRATEGY'),
      hasExamples: prompt.includes('Named Companies'),
      hasSEO: prompt.includes('SEO TECHNICAL')
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    return {
      isValid: passed === total,
      score: `${passed}/${total}`,
      checks,
      missing: Object.keys(checks).filter(key => !checks[key])
    };
  }
}

module.exports = EnhancedPromptEngine;
