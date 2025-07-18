const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TOPICS = [
  'artificial intelligence',
  'machine learning',
  'deep learning',
  'prompt engineering',
  'neural networks',
  'AI ethics',
 'AI in healthcare',
    'AI in finance',
    'AI in education',
    'AI in gaming',
    'AI in marketing',

    'AI in robotics',
    'AI in autonomous vehicles',
    'AI in smart cities',
    'AI in cybersecurity',
    'AI in supply chain management',
    'AI in customer service',
    'AI in content creation',
    'AI in creative arts',
    'AI in agriculture',
    'AI in manufacturing',

    'AI in climate change',
    'AI in social media',
    'AI in business intelligence',
    'AI in human-computer interaction',
    'AI in data analysis',
    'AI in software development',
    'AI in natural language understanding',
    'AI in knowledge management',
    'AI in information retrieval',
    'AI in data privacy',
    'AI in speech recognition',
    'AI in computer vision',
    'AI in recommendation systems',
    'AI in generative adversarial networks',

    'AI in predictive analytics',
    'AI in prescriptive analytics',
    'AI in time series analysis',
    'AI in sentiment analysis',
    'AI in anomaly detection',
    'AI in fraud detection',
    'AI in personalization',
    'AI in search engines',
    'AI in chatbots',
    'AI in virtual assistants',
    'AI in voice assistants',
    'AI in chat-based interfaces',
    'AI in image processing',
    'AI in video processing',
    'AI in audio processing',
    'AI in text processing',
    'AI in data visualization',
    'AI in knowledge management',
    'AI in information retrieval',


    'AI in natural language processing',


  'natural language processing',
  'computer vision',
  'robotics',
  'quantum computing',
    'augmented intelligence',
    'edge AI',
    'AI in IoT',
    'AI in smart devices',
    'AI in smart homes',
    'AI in smart wearables',
    'AI in smart appliances',
    'AI in blockchain technology',
    'AI in fintech',
    'AI in legal tech',

  'blockchain technology',
  'AI in supply chain management',
  'AI in customer service',
  'AI in content creation',
  'AI in creative arts',
  'AI in agriculture',
  'AI in manufacturing',

  'AI in climate change',
  'AI in social media',
  'AI in business intelligence',
  'AI in human-computer interaction',
  'AI in data analysis',
  'AI in software development',
  'AI in natural language understanding',
  'AI in knowledge management',
  'AI in information retrieval',
  'AI in data privacy',
  'AI in speech recognition',
  'AI in computer vision',
  'AI in recommendation systems',
  'AI in generative adversarial networks',

  'AI in predictive analytics',
  'AI in prescriptive analytics',
  'AI in time series analysis',
  'AI in sentiment analysis',
  'AI in anomaly detection',
  'AI in fraud detection',
  'AI in personalization',
  'AI in search engines',
  'AI in chatbots',
  'AI in virtual assistants',
  'AI in voice assistants',
  'AI in chat-based interfaces',
  'AI in image processing',
  'AI in video processing',
  'AI in audio processing',
  'AI in text processing',
  'AI in data visualization',
  'AI in knowledge management',
  'AI in information retrieval',


  'AI in natural language processing',


  'natural language processing',
    'computer vision',
    'robotics', 
    'quantum computing',
    'AI in cybersecurity',
  'software engineering',
  'tech startups',
  'digital transformation',
  'internet of things',
  'augmented reality',
  'virtual reality',
  'edge computing',
];

const CONTENT_TYPES = [
  'tutorial',
  'analysis',
  'opinion',
  'news',
  'review',
  'comparison',
  'guide',
  'trends',
  'predictions',
  'case study',
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

async function generateBlogPost() {
  try {
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const contentType = CONTENT_TYPES[Math.floor(Math.random() * CONTENT_TYPES.length)];
    
    console.log(`Generating ${contentType} about ${topic}...`);

    const prompt = `You are an expert SEO content strategist and blog copywriter.

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

Output only the final blog article content. Format the response as a JSON object with this structure:
{
  "metaTitle": "SEO-optimized title under 60 characters",
  "metaDescription": "Compelling description under 155 characters",
  "title": "Article title with target keyword",
  "excerpt": "Brief summary (150-200 characters)",
  "content": "Full article content in markdown format with H2 headings, real examples, links, and citations",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "category name",
  "targetKeyword": "${topic}",
  "readingTime": "estimated reading time"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO content strategist and blog copywriter with 10+ years of experience. You create high-quality, human-like content that ranks well in search engines and engages readers. You write in a friendly, informative tone while maintaining professional credibility. Always include real-world examples, actionable insights, and proper citations. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    
    // Parse the JSON response
    let blogData;
    try {
      blogData = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
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
    console.log(`Meta Description: ${blogData.metaDescription}`);
    console.log(`Target Keyword: ${blogData.targetKeyword}`);
    console.log(`Tags: ${blogData.tags.join(', ')}`);
    console.log(`Reading Time: ${blogData.readingTime}`);
    
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
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is not set');
    process.exit(1);
  }

  try {
    const result = await generateBlogPost();
    console.log('Blog post generation completed successfully!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Failed to generate blog post:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateBlogPost };
