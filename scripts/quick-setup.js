#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupAndTrainModel() {
  console.log('🚀 Setting up your AI blog model training...\n');
  
  try {
    // Check if Ollama is running
    console.log('1. Checking Ollama status...');
    const models = execSync('ollama list', { encoding: 'utf8' });
    console.log('✅ Ollama is running');
    
    // Check if base model is available
    if (models.includes('llama3.1:8b')) {
      console.log('✅ Base model (llama3.1:8b) is available');
      
      // Create custom model
      console.log('\n2. Creating your custom AI blog writer model...');
      const modelfilePath = path.join(__dirname, '..', 'Modelfile');
      
      try {
        execSync(`ollama create ai-blog-writer -f "${modelfilePath}"`, { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
        console.log('✅ Custom model "ai-blog-writer" created successfully!');
        
        // Test the model
        console.log('\n3. Testing your new model...');
        execSync('ollama run ai-blog-writer "Hello, test the model"', { stdio: 'inherit' });
        
        console.log('\n🎉 Training complete! Your AI blog writer is ready!');
        console.log('\nNext steps:');
        console.log('1. Test: npm run generate-post-local');
        console.log('2. Generate: npm run auto-blog');
        console.log('3. Compare outputs with the original model');
        
      } catch (error) {
        console.error('❌ Error creating custom model:', error.message);
        console.log('\nTroubleshooting:');
        console.log('- Make sure the Modelfile exists');
        console.log('- Check that llama3.1:8b is fully downloaded');
      }
      
    } else {
      console.log('⏳ Base model is still downloading...');
      console.log('Please wait for download to complete, then run: npm run train-modelfile');
    }
    
  } catch (error) {
    console.error('❌ Ollama is not running or not installed');
    console.log('\nPlease:');
    console.log('1. Install Ollama from: https://ollama.com/download');
    console.log('2. Start Ollama: ollama serve');
    console.log('3. Then run this script again');
  }
}

setupAndTrainModel();
