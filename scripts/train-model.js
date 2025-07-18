#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ModelTrainer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.logsDir = path.join(this.projectRoot, 'logs');
    this.modelsDir = path.join(this.projectRoot, 'models');
    
    // Ensure directories exist
    [this.logsDir, this.modelsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    
    // Save to log file
    const logFile = path.join(this.logsDir, 'model-training.log');
    fs.appendFileSync(logFile, logMessage + '\n');
  }

  // Method 1: Create custom model with enhanced Modelfile
  async createCustomModel() {
    this.log('🚀 Creating custom model with enhanced Modelfile...');
    
    try {
      // Check if Ollama is running
      execSync('ollama list', { stdio: 'pipe' });
      
      // Create custom model
      const modelName = 'ai-blog-writer';
      const modelfilePath = path.join(this.projectRoot, 'Modelfile');
      
      this.log(`Creating model: ${modelName}`);
      execSync(`ollama create ${modelName} -f "${modelfilePath}"`, { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
      this.log(`✅ Custom model '${modelName}' created successfully!`);
      
      // Test the model
      await this.testModel(modelName);
      
      return modelName;
      
    } catch (error) {
      this.log(`❌ Error creating custom model: ${error.message}`, 'error');
      throw error;
    }
  }

  // Method 2: Collect and prepare training data
  async prepareTrainingData() {
    this.log('📊 Preparing training data...');
    
    try {
      // Run the training data collection script
      const { collectTrainingData, generateSyntheticData } = require('./create-training-data');
      
      const existingData = collectTrainingData();
      const syntheticData = generateSyntheticData();
      
      // Create enhanced training data with better examples
      const enhancedData = this.createEnhancedExamples();
      
      const allData = [...existingData, ...syntheticData, ...enhancedData];
      
      // Save complete training dataset
      const outputPath = path.join(this.projectRoot, 'training-data-complete.jsonl');
      const jsonlContent = allData.map(item => JSON.stringify(item)).join('\n');
      fs.writeFileSync(outputPath, jsonlContent);
      
      this.log(`✅ Training data prepared: ${allData.length} examples`);
      return outputPath;
      
    } catch (error) {
      this.log(`❌ Error preparing training data: ${error.message}`, 'error');
      throw error;
    }
  }

  // Create high-quality training examples
  createEnhancedExamples() {
    const examples = [
      {
        instruction: "Write an engaging blog post about AI automation",
        input: "Topic: AI automation tools, Target: developers and business owners, Style: conversational",
        output: JSON.stringify({
          metaTitle: "7 AI Automation Tools That Will 10x Your Productivity in 2025",
          metaDescription: "Discover the AI automation tools that top developers use to eliminate repetitive tasks and boost productivity by 10x.",
          title: "The AI Automation Revolution: 7 Tools That Will 10x Your Productivity",
          excerpt: "I spent 6 months testing every AI automation tool on the market. Here's what actually works.",
          content: "# The AI Automation Revolution\\n\\n## The Problem\\n\\nLast year, my startup was burning through $50,000 monthly on repetitive tasks. Here's how AI automation changed everything.\\n\\n## The Game-Changing Tools\\n\\n### 1. GitHub Copilot\\nIt's not just autocomplete - it writes entire functions in seconds.\\n\\n### 2. Zapier + AI\\nAutomates complex workflows with natural language commands.\\n\\n### 3. Notion AI\\nGenerates detailed content outlines in 30 seconds.\\n\\n## Results\\n- Development time: Reduced by 60%\\n- Content creation: 8x faster\\n- Customer response: Under 2 minutes\\n\\nThe AI revolution is here. Will you lead it or be left behind?",
          tags: ["ai-automation", "productivity", "developer-tools", "artificial-intelligence", "workflow"],
          category: "Technology",
          targetKeyword: "AI automation tools",
          readingTime: "7 min read"
        })
      },
      {
        instruction: "Write a technical tutorial about machine learning",
        input: "Topic: machine learning for beginners, Target: new developers, Style: educational",
        output: JSON.stringify({
          metaTitle: "Machine Learning for Beginners: Build Your First Model in 30 Minutes",
          metaDescription: "Complete beginner's guide to machine learning. Build your first working model with Python in just 30 minutes.",
          title: "Machine Learning for Beginners: Your First Model in 30 Minutes",
          excerpt: "Think machine learning is too complex? I'll prove you wrong in the next 30 minutes.",
          content: "# Machine Learning for Beginners\\n\\n## The Aha Moment\\n\\nMachine learning clicked for me when I built a simple house price prediction model. Today, I'll recreate that moment for you.\\n\\n## What You'll Build\\n- A working price prediction model\\n- Understanding of core ML concepts\\n- Code you can modify for your projects\\n\\n## Step 1: Setting Up\\n```bash\\npip install pandas scikit-learn matplotlib\\n```\\n\\n## Step 2: Building the Model\\n```python\\nimport pandas as pd\\nfrom sklearn.linear_model import LinearRegression\\n\\n# Create sample data\\ndata = {'size': [1500, 2000, 2500], 'price': [250000, 300000, 375000]}\\ndf = pd.DataFrame(data)\\n\\n# Train the model\\nmodel = LinearRegression()\\nmodel.fit(df[['size']], df['price'])\\n\\n# Make predictions\\nprint(model.predict([[2300]]))\\n```\\n\\n## The Magic\\nThe model found the pattern: bigger house = higher price.\\n\\n## Next Steps\\nNow you've built your first model. What problem will you solve next?",
          tags: ["machine-learning", "python", "beginners", "tutorial", "data-science"],
          category: "Technology",
          targetKeyword: "machine learning for beginners",
          readingTime: "8 min read"
        })
      }
    ];

    return examples;
  }

  // Test the model with a sample prompt
  async testModel(modelName) {
    this.log(`🧪 Testing model: ${modelName}`);
    
    try {
      const testPrompt = 'Write a blog post about the future of artificial intelligence in software development.';
      
      // Create a simple test file
      const testScript = `
const { spawn } = require('child_process');

const ollama = spawn('ollama', ['run', '${modelName}'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

ollama.stdin.write('${testPrompt}\\n');
ollama.stdin.end();

let output = '';
ollama.stdout.on('data', (data) => {
  output += data.toString();
});

ollama.on('close', (code) => {
  console.log('Model test output:', output.substring(0, 500) + '...');
  process.exit(code);
});
`;

      const testPath = path.join(this.projectRoot, 'test-model.js');
      fs.writeFileSync(testPath, testScript);
      
      execSync(`node "${testPath}"`, { stdio: 'inherit' });
      
      // Clean up
      fs.unlinkSync(testPath);
      
      this.log('✅ Model test completed successfully');
      
    } catch (error) {
      this.log(`⚠️ Model test failed: ${error.message}`, 'warning');
    }
  }

  // Create a fine-tuning workflow
  async createFineTuningWorkflow() {
    this.log('🔧 Setting up fine-tuning workflow...');
    
    const fineTuneScript = `#!/usr/bin/env python3
"""
Fine-tune your blog model using LoRA (Low-Rank Adaptation)
"""

import json
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    TrainingArguments, 
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import Dataset
import numpy as np

class BlogModelTrainer:
    def __init__(self, model_name="microsoft/DialoGPT-medium"):
        self.model_name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        
        # Add pad token if it doesn't exist
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
    
    def setup_lora(self):
        """Configure LoRA for efficient fine-tuning"""
        lora_config = LoraConfig(
            task_type=TaskType.CAUSAL_LM,
            inference_mode=False,
            r=8,  # rank
            lora_alpha=32,
            lora_dropout=0.1,
            target_modules=["c_attn", "c_proj"]  # GPT-2 style attention layers
        )
        
        self.model = get_peft_model(self.model, lora_config)
        return self.model
    
    def prepare_dataset(self, data_file="training-data-complete.jsonl"):
        """Load and prepare training data"""
        training_examples = []
        
        with open(data_file, 'r') as f:
            for line in f:
                data = json.loads(line)
                # Create a training text combining instruction and output
                text = f"Instruction: {data['instruction']}\\nInput: {data['input']}\\nOutput: {data['output']}"
                training_examples.append({"text": text})
        
        return Dataset.from_list(training_examples)
    
    def tokenize_function(self, examples):
        """Tokenize the training data"""
        return self.tokenizer(
            examples["text"], 
            truncation=True, 
            padding=True, 
            max_length=1024
        )
    
    def train(self, output_dir="./blog-model-finetuned"):
        """Train the model"""
        print("🚀 Starting fine-tuning process...")
        
        # Setup LoRA
        self.setup_lora()
        
        # Prepare data
        dataset = self.prepare_dataset()
        tokenized_dataset = dataset.map(self.tokenize_function, batched=True)
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False,  # We're doing causal LM, not masked LM
        )
        
        # Training arguments
        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=3,
            per_device_train_batch_size=2,
            gradient_accumulation_steps=4,
            warmup_steps=100,
            learning_rate=2e-4,
            save_steps=500,
            logging_steps=100,
            evaluation_strategy="no",  # No eval set for now
            save_total_limit=2,
            push_to_hub=False,
        )
        
        # Create trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=tokenized_dataset,
            tokenizer=self.tokenizer,
            data_collator=data_collator,
        )
        
        # Start training
        print("📚 Training in progress...")
        trainer.train()
        
        # Save the model
        trainer.save_model()
        self.tokenizer.save_pretrained(output_dir)
        
        print(f"✅ Model saved to {output_dir}")

if __name__ == "__main__":
    trainer = BlogModelTrainer()
    trainer.train()
`;

    const fineTunePath = path.join(this.projectRoot, 'scripts', 'fine-tune-model.py');
    fs.writeFileSync(fineTunePath, fineTuneScript);
    
    // Create requirements file for Python dependencies
    const requirements = `torch>=1.9.0
transformers>=4.21.0
peft>=0.3.0
datasets>=2.0.0
accelerate>=0.20.0
numpy>=1.21.0
`;

    const requirementsPath = path.join(this.projectRoot, 'requirements.txt');
    fs.writeFileSync(requirementsPath, requirements);
    
    this.log('✅ Fine-tuning workflow created');
    this.log(`📁 Python script: ${fineTunePath}`);
    this.log(`📋 Requirements: ${requirementsPath}`);
  }

  // Main training workflow
  async runTraining(method = 'modelfile') {
    this.log(`🎯 Starting training with method: ${method}`);
    
    try {
      switch (method) {
        case 'modelfile':
          await this.createCustomModel();
          break;
          
        case 'fine-tune':
          await this.prepareTrainingData();
          await this.createFineTuningWorkflow();
          this.log('🐍 Run: pip install -r requirements.txt');
          this.log('🚀 Then run: python scripts/fine-tune-model.py');
          break;
          
        case 'both':
          await this.createCustomModel();
          await this.prepareTrainingData();
          await this.createFineTuningWorkflow();
          break;
          
        default:
          throw new Error(`Unknown training method: ${method}`);
      }
      
      this.log('🎉 Training workflow completed successfully!');
      
    } catch (error) {
      this.log(`❌ Training failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const method = args[0] || 'modelfile';
  
  console.log('🤖 AI Blog Model Training System\n');
  
  const trainer = new ModelTrainer();
  
  try {
    await trainer.runTraining(method);
    
    console.log('\n✅ Training Complete! Next steps:');
    console.log('1. Test your model: npm run generate-post-local');
    console.log('2. Compare outputs with the original model');
    console.log('3. Iterate and improve based on results');
    
  } catch (error) {
    console.error('\n❌ Training failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ModelTrainer;
