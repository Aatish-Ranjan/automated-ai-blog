#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const BLOG_DIR = 'D:\\ai-blog-website'; // Update with your actual path
const BRANCH = 'main';
const COMMIT_MESSAGE = 'Add new AI-generated blog post';

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { 
      cwd: BLOG_DIR,
      stdio: 'inherit',
      shell: true,
      ...options 
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function generateAndPushBlogPost() {
  try {
    console.log('🚀 Starting automated blog post generation...');
    
    // Step 1: Generate blog post using local model
    console.log('📝 Generating blog post with local model...');
    await runCommand('node', ['scripts/generate-post-local.js']);
    
    // Step 2: Check if new content was generated
    console.log('🔍 Checking for new content...');
    const { stdout } = await runCommand('git', ['status', '--porcelain'], { stdio: 'pipe' });
    
    if (!stdout || stdout.trim() === '') {
      console.log('ℹ️  No new content generated, skipping push.');
      return;
    }
    
    // Step 3: Add new content to git
    console.log('📁 Adding new content to git...');
    await runCommand('git', ['add', 'src/content/']);
    
    // Step 4: Commit changes
    console.log('💾 Committing changes...');
    await runCommand('git', ['commit', '-m', COMMIT_MESSAGE]);
    
    // Step 5: Push to GitHub
    console.log('🚀 Pushing to GitHub...');
    await runCommand('git', ['push', 'origin', BRANCH]);
    
    console.log('✅ Blog post successfully generated and pushed!');
    console.log('🌐 GitHub Actions will automatically deploy to your website.');
    
  } catch (error) {
    console.error('❌ Error in automated blog generation:', error);
    
    // Log error details for debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    
    fs.appendFileSync(
      path.join(BLOG_DIR, 'logs', 'blog-generation-errors.log'),
      JSON.stringify(errorLog) + '\n'
    );
    
    process.exit(1);
  }
}

// Run the automation
generateAndPushBlogPost();
