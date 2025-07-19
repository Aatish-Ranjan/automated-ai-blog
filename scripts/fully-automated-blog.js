#!/usr/bin/env node

/**
 * Fully Automated Blog Generation Script
 * Uses intelligent topic selection and local AI
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Import our services (we'll need to handle ES modules in CommonJS)
const TopicSelectionService = require('../src/lib/TopicSelectionService.js').default;

class FullyAutomatedBlogGenerator {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/auto-blog.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async generateFullyAutomatedPost() {
    try {
      this.log('🤖 Starting fully automated blog generation...');
      
      // Use the existing script but with automated topic selection
      this.log('🎯 Using intelligent topic selection...');
      
      // Run the existing automated blog script
      const result = execSync('npm run auto-blog-local', { 
        cwd: process.cwd(),
        encoding: 'utf8'
      });
      
      this.log('✅ Blog generation completed');
      this.log('🔄 Auto-committing changes...');
      
      // Auto-commit the changes
      execSync('git add .', { cwd: process.cwd() });
      execSync('git commit -m "🤖 Automated blog post generation"', { cwd: process.cwd() });
      
      if (process.env.AUTO_PUSH === 'true') {
        execSync('git push origin main', { cwd: process.cwd() });
        this.log('🚀 Changes pushed to GitHub');
      }
      
      this.log('🎉 Fully automated generation completed!');
      
    } catch (error) {
      this.log('❌ Automated generation failed: ' + error.message);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const generator = new FullyAutomatedBlogGenerator();
  
  generator.generateFullyAutomatedPost().then(() => {
    console.log('✅ Automation completed successfully');
  }).catch(error => {
    console.error('❌ Automation failed:', error.message);
    process.exit(1);
  });
}

module.exports = FullyAutomatedBlogGenerator;
