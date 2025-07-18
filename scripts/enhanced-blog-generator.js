/**
 * Enhanced AI Blog Post Generator
 * High-quality, SEO-optimized, human-like content generation
 */

const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const ContentQualityManager = require('../src/lib/contentQualityManager');

class EnhancedBlogGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.qualityManager = new ContentQualityManager();
    this.contentDir = path.join(process.cwd(), 'src', 'content');
  }

  async generateHighQualityPost() {
    console.log(chalk.blue.bold('\n🚀 Enhanced AI Blog Generator\n'));

    const spinner = ora('Selecting optimal topic...').start();

    try {
      // 1. Smart topic selection
      const optimalTopic = await this.qualityManager.selectOptimalTopic();
      spinner.succeed(`Selected topic: ${optimalTopic.topic} (Score: ${optimalTopic.finalScore})`);

      // 2. Generate enhanced SEO prompt
      spinner.start('Generating SEO-optimized content...');
      const seoPrompt = this.qualityManager.generateAdvancedSEOPrompt(
        optimalTopic.topic,
        optimalTopic.keyword,
        optimalTopic.difficulty
      );

      const humanPrompt = this.qualityManager.generateHumanLikePrompt();

      // 3. Generate content with enhanced prompts
      const content = await this.generateContent(seoPrompt, humanPrompt, optimalTopic);
      spinner.succeed('Content generated successfully');

      // 4. Validate content quality
      spinner.start('Validating content quality...');
      const qualityResults = await this.qualityManager.validateContentQuality(
        content.content,
        content
      );
      
      if (qualityResults.overallScore >= 70) {
        spinner.succeed(`Quality validation passed (Score: ${qualityResults.overallScore}/100)`);
      } else {
        spinner.warn(`Quality score: ${qualityResults.overallScore}/100 - Content needs improvement`);
        console.log(chalk.yellow('Issues found:'));
        qualityResults.issues.forEach(issue => {
          console.log(chalk.yellow(`  • ${issue}`));
        });
      }

      // 5. Save the content
      const result = await this.saveContent(content, optimalTopic, qualityResults);
      
      console.log(chalk.green.bold('\n✅ High-quality blog post generated successfully!\n'));
      console.log(chalk.cyan('Content Details:'));
      console.log(`  📝 Title: ${content.title}`);
      console.log(`  🎯 Keyword: ${optimalTopic.keyword}`);
      console.log(`  📊 SEO Score: ${qualityResults.seoScore}/100`);
      console.log(`  📖 Readability: ${qualityResults.readabilityScore}/100`);
      console.log(`  🤖 Human-like: ${qualityResults.humanLikeScore}/100`);
      console.log(`  🏆 Overall: ${qualityResults.overallScore}/100`);
      console.log(`  📄 File: ${result.fileName}`);

      return result;

    } catch (error) {
      spinner.fail('Content generation failed');
      throw error;
    }
  }

  async generateContent(seoPrompt, humanPrompt, topic) {
    const systemPrompt = `You are an elite SEO content strategist and copywriter with 15+ years of experience. You create content that:

1. RANKS HIGH in search engines (top 3 positions)
2. ENGAGES readers with human-like writing
3. CONVERTS visitors into loyal readers
4. ESTABLISHES thought leadership

You write for tech professionals who value:
- Actionable insights over fluff
- Real-world examples over theory
- Clear explanations over jargon
- Practical advice over generic tips

${humanPrompt}

ALWAYS respond with valid JSON matching the exact structure specified.`;

    const userPrompt = `${seoPrompt}

Additional Context:
- Topic Difficulty: ${topic.difficulty}/100
- Target Audience: Tech professionals, developers, business leaders
- Content Goal: Establish thought leadership while providing actionable value
- Tone: Professional yet conversational, authoritative but approachable

Make this content so valuable that readers bookmark it and share it with colleagues.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Use GPT-4 for higher quality
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const content = response.choices[0].message.content;
    
    // Parse and validate JSON
    try {
      const blogData = JSON.parse(content);
      
      // Validate required fields
      const requiredFields = ['title', 'metaTitle', 'metaDescription', 'content', 'tags'];
      for (const field of requiredFields) {
        if (!blogData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return blogData;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse AI response as valid JSON');
    }
  }

  async saveContent(content, topic, qualityResults) {
    const currentDate = new Date().toISOString().split('T')[0];
    const slug = this.generateSlug(content.title);
    
    // Enhanced frontmatter with quality metrics
    const frontmatter = `---
title: "${content.title}"
metaTitle: "${content.metaTitle}"
metaDescription: "${content.metaDescription}"
excerpt: "${content.excerpt}"
date: "${currentDate}"
author: "AI Blog"
tags: [${content.tags.map(tag => `"${tag}"`).join(', ')}]
category: "${content.category}"
targetKeyword: "${content.primaryKeyword || topic.keyword}"
image: "/images/blog/default-blog-image.jpg"
featured: ${qualityResults.overallScore >= 85}
readingTime: "${content.readingTime}"
seoScore: ${qualityResults.seoScore}
readabilityScore: ${qualityResults.readabilityScore}
humanLikeScore: ${qualityResults.humanLikeScore}
overallQualityScore: ${qualityResults.overallScore}
generatedBy: "Enhanced AI System"
topicDifficulty: ${topic.difficulty}
searchVolume: "${topic.searchVolume}"
---

`;

    const fullContent = frontmatter + content.content;
    
    // Ensure content directory exists
    await fs.ensureDir(this.contentDir);

    // Generate unique filename
    const fileName = `${currentDate}-${slug}.md`;
    const filePath = path.join(this.contentDir, fileName);
    
    // Check if file already exists
    if (await fs.pathExists(filePath)) {
      const timestamp = Date.now();
      const uniqueFileName = `${currentDate}-${slug}-${timestamp}.md`;
      const uniqueFilePath = path.join(this.contentDir, uniqueFileName);
      await fs.writeFile(uniqueFilePath, fullContent);
      return { fileName: uniqueFileName, ...content, qualityScore: qualityResults.overallScore };
    }

    await fs.writeFile(filePath, fullContent);
    
    return {
      fileName,
      title: content.title,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
      slug,
      tags: content.tags,
      category: content.category,
      targetKeyword: content.primaryKeyword || topic.keyword,
      readingTime: content.readingTime,
      qualityScore: qualityResults.overallScore,
      seoScore: qualityResults.seoScore,
      topicDifficulty: topic.difficulty
    };
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60); // Limit slug length
  }

  async runQualityCheck(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const matter = require('gray-matter');
    const parsed = matter(content);
    
    const qualityResults = await this.qualityManager.validateContentQuality(
      parsed.content,
      parsed.data
    );

    console.log(chalk.cyan('\n📊 Content Quality Report:'));
    console.log(`  SEO Score: ${qualityResults.seoScore}/100`);
    console.log(`  Readability: ${qualityResults.readabilityScore}/100`);
    console.log(`  Human-like: ${qualityResults.humanLikeScore}/100`);
    console.log(`  Overall: ${qualityResults.overallScore}/100`);

    if (qualityResults.issues.length > 0) {
      console.log(chalk.yellow('\n⚠️ Issues to address:'));
      qualityResults.issues.forEach(issue => {
        console.log(chalk.yellow(`  • ${issue}`));
      });
    }

    return qualityResults;
  }
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error(chalk.red('❌ OPENAI_API_KEY environment variable is not set'));
    process.exit(1);
  }

  try {
    const generator = new EnhancedBlogGenerator();
    const result = await generator.generateHighQualityPost();
    
    console.log(chalk.green('\n🎉 Enhanced blog post generation completed!'));
    console.log(chalk.blue(`🔗 Content will be available after deployment`));
    
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('❌ Failed to generate blog post:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = EnhancedBlogGenerator;
