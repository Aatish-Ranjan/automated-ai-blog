#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Custom model creation and testing
const OLLAMA_BASE_URL = 'http://localhost:11434';

async function createCustomModel() {
  try {
    console.log('🔨 Creating custom blog writing model...');
    
    // Read the Modelfile
    const modelfilePath = path.join(__dirname, '..', 'Modelfile');
    const modelfileContent = fs.readFileSync(modelfilePath, 'utf8');
    
    // Create the custom model
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/create`, {
      name: 'ai-blog-writer',
      modelfile: modelfileContent,
      stream: false
    });
    
    console.log('✅ Custom model "ai-blog-writer" created successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error creating custom model:', error.message);
    return false;
  }
}

async function testModel(modelName = 'ai-blog-writer') {
  try {
    console.log(`🧪 Testing model: ${modelName}`);
    
    const testPrompt = `Generate a blog post about "AI in healthcare trends" as a "guide" for tech professionals.

Requirements:
- Include meta title and description
- 5 H2 sections minimum  
- Real-world examples
- Internal links
- External citation
- Call to action

Respond with valid JSON only.`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: modelName,
      prompt: testPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 3000
      }
    });
    
    console.log('📝 Model response received!');
    console.log('Response length:', response.data.response.length);
    
    // Try to parse as JSON
    try {
      const jsonMatch = response.data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Valid JSON response generated!');
        console.log('Title:', parsed.title);
        console.log('Meta Title:', parsed.metaTitle);
        console.log('Tags:', parsed.tags);
        return true;
      } else {
        console.log('⚠️  Response is not in JSON format');
        console.log('Raw response:', response.data.response.substring(0, 500) + '...');
        return false;
      }
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing model:', error.message);
    return false;
  }
}

async function compareModels() {
  console.log('🔄 Comparing baseline vs custom model...\n');
  
  const testPrompt = 'Write a tutorial about machine learning for beginners';
  
  try {
    // Test baseline model
    console.log('Testing baseline model (llama3.1:8b)...');
    const baselineResult = await testModel('llama3.1:8b');
    
    // Test custom model
    console.log('Testing custom model (ai-blog-writer)...');
    const customResult = await testModel('ai-blog-writer');
    
    console.log('\n📊 Comparison Results:');
    console.log(`Baseline model: ${baselineResult ? '✅ Working' : '❌ Issues'}`);
    console.log(`Custom model: ${customResult ? '✅ Working' : '❌ Issues'}`);
    
  } catch (error) {
    console.error('❌ Error in model comparison:', error);
  }
}

async function listModels() {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    console.log('📋 Available models:');
    response.data.models.forEach(model => {
      console.log(`  - ${model.name} (${model.size})`);
    });
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

async function deleteModel(modelName) {
  try {
    await axios.delete(`${OLLAMA_BASE_URL}/api/delete`, {
      data: { name: modelName }
    });
    console.log(`🗑️  Deleted model: ${modelName}`);
  } catch (error) {
    console.error(`❌ Error deleting model ${modelName}:`, error.message);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  // Check if Ollama is running
  try {
    await axios.get(`${OLLAMA_BASE_URL}/api/version`);
  } catch (error) {
    console.error('❌ Ollama is not running. Please start it with: ollama serve');
    process.exit(1);
  }
  
  switch (command) {
    case 'create':
      await createCustomModel();
      break;
      
    case 'test':
      const modelName = args[1] || 'ai-blog-writer';
      await testModel(modelName);
      break;
      
    case 'compare':
      await compareModels();
      break;
      
    case 'list':
      await listModels();
      break;
      
    case 'delete':
      const modelToDelete = args[1];
      if (modelToDelete) {
        await deleteModel(modelToDelete);
      } else {
        console.log('❌ Please specify model name to delete');
      }
      break;
      
    case 'setup':
      await createCustomModel();
      await testModel('ai-blog-writer');
      break;
      
    default:
      console.log(`
🤖 AI Blog Model Manager

Usage: node model-manager.js <command>

Commands:
  create    Create custom ai-blog-writer model
  test      Test a model (default: ai-blog-writer)
  compare   Compare baseline vs custom model
  list      List all available models
  delete    Delete a model
  setup     Create and test custom model
  
Examples:
  node model-manager.js create
  node model-manager.js test llama3.1:8b
  node model-manager.js compare
  node model-manager.js delete ai-blog-writer
`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  createCustomModel, 
  testModel, 
  compareModels, 
  listModels 
};
