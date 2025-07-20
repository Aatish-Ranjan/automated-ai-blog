/**
 * Enhanced Prompt System Demo & Testing
 * Shows the new capabilities and validates prompt generation
 */

const EnhancedPromptEngine = require('../src/lib/enhancedPromptEngine.js');
const SchemaGenerator = require('../src/lib/schemaGenerator.js');

class PromptEnhancementDemo {
  constructor() {
    this.promptEngine = new EnhancedPromptEngine();
    this.schemaGenerator = new SchemaGenerator();
  }

  /**
   * Demonstrates the original vs enhanced prompt
   */
  showPromptComparison() {
    console.log('🔄 PROMPT ENHANCEMENT COMPARISON\n');
    
    const topic = "AI Music and Audio Generation";
    const keywords = ["AI music", "audio generation", "machine learning", "creative AI"];
    
    // Original basic prompt
    const originalPrompt = `Write a comprehensive, SEO-optimized blog post about "${topic}".

Write a complete article of at least 2000 words with:
- An engaging title that includes "${topic}"
- Comprehensive introduction explaining what ${topic} is and why it matters
- Multiple detailed sections with ## headers covering key concepts, applications, benefits, challenges, and best practices
- Real-world examples and practical insights
- Professional, engaging tone suitable for technical professionals
- Natural keyword usage throughout
- Strong conclusion with actionable takeaways

Write the complete blog post in markdown format now:`;

    // Enhanced prompt
    const enhancedPrompt = this.promptEngine.generateEnhancedPrompt({
      topic,
      keywords,
      difficulty: 'intermediate',
      targetWords: 4000,
      category: 'generative_ai',
      audience: 'technical professionals and music creators'
    });

    console.log('📊 FEATURE COMPARISON:');
    console.log('='.repeat(80));
    
    const features = [
      { name: 'Length Guidance', original: '2000 words', enhanced: '4000 words + reading time' },
      { name: 'Markdown Structure', original: 'Basic ## headers', enhanced: 'Complete YAML + advanced formatting' },
      { name: 'Topic Coverage', original: 'General sections', enhanced: 'Structured mandatory sections' },
      { name: 'SEO Keywords', original: 'Natural usage', enhanced: 'Exact placement + density + semantic terms' },
      { name: 'Metadata Generation', original: 'None', enhanced: 'Complete YAML frontmatter' },
      { name: 'LSI/Related Terms', original: 'Not mentioned', enhanced: 'Explicit semantic keywords' },
      { name: 'Linking Strategy', original: 'Not included', enhanced: '2-3 internal + 1-2 external authority links' },
      { name: 'Examples & Case Studies', original: 'General examples', enhanced: 'Named companies and specific platforms' },
      { name: 'Professional Tone', original: 'Professional tone', enhanced: 'Accessibility + engagement guidelines' },
      { name: 'Conclusion + CTA', original: 'Strong conclusion', enhanced: 'Structured takeaways + specific CTA' }
    ];

    features.forEach(feature => {
      console.log(`✅ ${feature.name}:`);
      console.log(`   Original: ${feature.original}`);
      console.log(`   Enhanced: ${feature.enhanced}\n`);
    });

    // Validate enhanced prompt
    const validation = this.promptEngine.validatePrompt(enhancedPrompt);
    console.log(`🎯 ENHANCED PROMPT VALIDATION: ${validation.score}`);
    console.log(`Status: ${validation.isValid ? '✅ PASSED' : '❌ NEEDS REVIEW'}`);
    
    if (!validation.isValid) {
      console.log(`Missing features: ${validation.missing.join(', ')}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('📝 ENHANCED PROMPT PREVIEW (First 500 chars):');
    console.log('='.repeat(80));
    console.log(enhancedPrompt.substring(0, 500) + '...\n');

    return { original: originalPrompt, enhanced: enhancedPrompt, validation };
  }

  /**
   * Demonstrates Schema.org generation
   */
  showSchemaGeneration() {
    console.log('🏗️ SCHEMA.ORG STRUCTURED DATA DEMO\n');
    
    const sampleBlogData = {
      title: "The Complete Guide to AI Music and Audio Generation",
      metaTitle: "AI Music Generation: Complete Guide to Creative AI Tools 2025",
      metaDescription: "Discover how AI is revolutionizing music creation with machine learning algorithms, neural networks, and creative AI platforms. Complete guide for 2025.",
      slug: "ai-music-audio-generation-complete-guide",
      publishDate: "2025-01-20",
      lastModified: "2025-01-20",
      author: "AI Content Team",
      category: "generative_ai",
      tags: ["AI music", "audio generation", "machine learning", "creative AI", "neural networks"],
      readingTime: "16 min read",
      excerpt: "Explore the fascinating world of AI-powered music creation and learn how machine learning is transforming the audio industry.",
      estimatedWordCount: 4000
    };

    // Generate complete schema
    const articleSchema = this.schemaGenerator.generateArticleSchema(sampleBlogData);
    const breadcrumbSchema = this.schemaGenerator.generateBreadcrumbSchema(
      sampleBlogData.category, 
      sampleBlogData.slug, 
      sampleBlogData.title
    );

    console.log('📄 Article Schema.org JSON-LD:');
    console.log(JSON.stringify(articleSchema, null, 2));
    console.log('\n🍞 Breadcrumb Schema.org JSON-LD:');
    console.log(JSON.stringify(breadcrumbSchema, null, 2));

    // Sample FAQ extraction
    const sampleContent = `
## What is AI Music Generation?

AI music generation is the process of using artificial intelligence algorithms to create musical compositions, melodies, and audio content automatically.

## How Does Machine Learning Create Music?

Machine learning models analyze patterns in existing music to generate new compositions that follow similar structures and styles.

## What Are the Best AI Music Platforms?

Popular platforms include AIVA, Amper Music, and OpenAI's MuseNet for creating AI-generated music.
`;

    const faqItems = this.schemaGenerator.extractFAQFromContent(sampleContent);
    const faqSchema = this.schemaGenerator.generateFAQSchema(faqItems);

    if (faqSchema) {
      console.log('\n❓ FAQ Schema.org JSON-LD:');
      console.log(JSON.stringify(faqSchema, null, 2));
    }

    return { articleSchema, breadcrumbSchema, faqSchema };
  }

  /**
   * Demonstrates keyword generation
   */
  showKeywordGeneration() {
    console.log('🔍 KEYWORD GENERATION DEMO\n');
    
    const topics = [
      { topic: "Quantum Computing", category: "quantum_ai" },
      { topic: "React Native Development", category: "programming" },
      { topic: "Cybersecurity Best Practices", category: "security" },
      { topic: "Data Visualization", category: "data_science" }
    ];

    topics.forEach(({ topic, category }) => {
      const keywords = this.promptEngine.generateKeywordSuggestions(topic, category);
      console.log(`📊 Topic: "${topic}" (${category})`);
      console.log(`   Keywords: ${keywords.join(', ')}\n`);
    });
  }

  /**
   * Run complete demonstration
   */
  runCompleteDemo() {
    console.log('🚀 ENHANCED PROMPT SYSTEM - COMPLETE DEMONSTRATION');
    console.log('='.repeat(80) + '\n');

    try {
      // 1. Prompt comparison
      const promptResult = this.showPromptComparison();
      
      console.log('\n' + '='.repeat(80) + '\n');
      
      // 2. Schema generation
      const schemaResult = this.showSchemaGeneration();
      
      console.log('\n' + '='.repeat(80) + '\n');
      
      // 3. Keyword generation
      this.showKeywordGeneration();
      
      console.log('✅ DEMONSTRATION COMPLETE!');
      console.log('📈 Enhanced system provides:');
      console.log('   • 4000-word target with reading time estimation');
      console.log('   • Complete YAML frontmatter generation');
      console.log('   • Advanced SEO keyword placement strategy');
      console.log('   • Structured content with mandatory sections');
      console.log('   • Internal/external linking requirements');
      console.log('   • Named company examples and case studies');
      console.log('   • Schema.org JSON-LD structured data');
      console.log('   • Professional tone with accessibility guidelines\n');

      return {
        success: true,
        promptValidation: promptResult.validation,
        schemas: schemaResult
      };

    } catch (error) {
      console.error('❌ Demo failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Run demo if called directly
if (require.main === module) {
  const demo = new PromptEnhancementDemo();
  demo.runCompleteDemo();
}

module.exports = PromptEnhancementDemo;
