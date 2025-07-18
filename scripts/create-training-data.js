#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Collect training data from your existing blog posts
function collectTrainingData() {
  const contentDir = path.join(__dirname, '..', 'src', 'content');
  const trainingData = [];
  
  try {
    const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(contentDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Parse frontmatter and content
      const parts = content.split('---');
      if (parts.length >= 3) {
        const frontmatter = parts[1].trim();
        const articleContent = parts.slice(2).join('---').trim();
        
        // Extract metadata
        const title = extractFromFrontmatter(frontmatter, 'title');
        const tags = extractFromFrontmatter(frontmatter, 'tags');
        const category = extractFromFrontmatter(frontmatter, 'category') || 'Technology';
        const targetKeyword = extractFromFrontmatter(frontmatter, 'targetKeyword');
        
        // Create training example
        const trainingExample = {
          instruction: "Write a high-quality SEO blog post",
          input: `Topic: ${title}, Category: ${category}, Target Keyword: ${targetKeyword}`,
          output: JSON.stringify({
            title: title,
            content: articleContent,
            tags: tags ? JSON.parse(tags.replace(/'/g, '"')) : [],
            category: category,
            targetKeyword: targetKeyword
          }, null, 2)
        };
        
        trainingData.push(trainingExample);
      }
    }
    
    // Save training data
    const outputPath = path.join(__dirname, '..', 'training-data.jsonl');
    const jsonlContent = trainingData.map(item => JSON.stringify(item)).join('\n');
    fs.writeFileSync(outputPath, jsonlContent);
    
    console.log(`✅ Created training data with ${trainingData.length} examples`);
    console.log(`📁 Saved to: ${outputPath}`);
    
    return trainingData;
    
  } catch (error) {
    console.error('❌ Error collecting training data:', error);
    return [];
  }
}

function extractFromFrontmatter(frontmatter, key) {
  const regex = new RegExp(`${key}:\\s*(.+)`, 'i');
  const match = frontmatter.match(regex);
  return match ? match[1].replace(/"/g, '').trim() : '';
}

// Generate additional synthetic training data
function generateSyntheticData() {
  const topics = [
    'artificial intelligence trends',
    'machine learning applications', 
    'deep learning frameworks',
    'AI ethics and bias',
    'natural language processing',
    'computer vision advances',
    'robotics automation',
    'quantum computing basics',
    'blockchain development',
    'cybersecurity with AI'
  ];
  
  const contentTypes = ['guide', 'tutorial', 'analysis', 'trends', 'case study'];
  
  const syntheticData = [];
  
  for (const topic of topics) {
    for (const type of contentTypes) {
      const example = {
        instruction: `Write a ${type} blog post about ${topic}`,
        input: `Topic: ${topic}, Type: ${type}, Audience: tech professionals`,
        output: JSON.stringify({
          metaTitle: `Ultimate ${type} for ${topic}`,
          metaDescription: `Comprehensive ${type} covering ${topic} for developers and tech enthusiasts.`,
          title: `The Complete ${type} to ${topic}`,
          content: `# The Complete ${type} to ${topic}\n\n## Introduction\n\n${topic} is revolutionizing the tech industry...\n\n## Key Concepts\n\n...`,
          tags: [topic.split(' ')[0], type, 'technology', 'development'],
          category: 'Technology',
          targetKeyword: topic,
          readingTime: '5 min read'
        }, null, 2)
      };
      
      syntheticData.push(example);
    }
  }
  
  return syntheticData;
}

// Main function
async function main() {
  console.log('🔄 Collecting training data for your blog model...\n');
  
  // Collect existing data
  const existingData = collectTrainingData();
  
  // Generate synthetic data
  console.log('🤖 Generating synthetic training examples...');
  const syntheticData = generateSyntheticData();
  
  // Combine and save
  const allData = [...existingData, ...syntheticData];
  const outputPath = path.join(__dirname, '..', 'complete-training-data.jsonl');
  const jsonlContent = allData.map(item => JSON.stringify(item)).join('\n');
  fs.writeFileSync(outputPath, jsonlContent);
  
  console.log(`\n✅ Training data collection complete!`);
  console.log(`📊 Total examples: ${allData.length}`);
  console.log(`📁 Existing posts: ${existingData.length}`);
  console.log(`🤖 Synthetic examples: ${syntheticData.length}`);
  console.log(`💾 Saved to: ${outputPath}`);
  
  console.log('\n🚀 Next steps:');
  console.log('1. Review the training data');
  console.log('2. Use this data to fine-tune your model');
  console.log('3. Test the fine-tuned model with npm run generate-post-local');
}

if (require.main === module) {
  main();
}

module.exports = { collectTrainingData, generateSyntheticData };
