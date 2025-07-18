#!/usr/bin/env node

/**
 * Automated Local AI Blog Generator
 * Integrates with existing blog infrastructure using local Ollama model
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const matter = require('gray-matter');
const LocalAIBlogService = require('../src/lib/localAIBlogService');
const { execSync } = require('child_process');

class AutomatedLocalBlogGenerator {
  constructor() {
    this.aiService = new LocalAIBlogService();
    this.contentDir = path.join(__dirname, '../src/content');
    this.scriptsDir = path.join(__dirname);
    
    // Blog topics for automated generation
    this.blogTopics = [
      {
        topic: "Future of AI in Web Development",
        audience: "web developers",
        tone: "technical",
        category: "AI & Web Development"
      },
      {
        topic: "Next.js Performance Optimization Techniques",
        audience: "React developers",
        tone: "technical",
        category: "Web Development"
      },
      {
        topic: "Building Scalable Applications with Modern JavaScript",
        audience: "software engineers",
        tone: "professional",
        category: "Programming"
      },
      {
        topic: "AI-Powered Content Creation for Businesses",
        audience: "business owners",
        tone: "professional",
        category: "Business & AI"
      },
      {
        topic: "Getting Started with Local AI Models",
        audience: "developers",
        tone: "friendly",
        category: "Artificial Intelligence"
      }
    ];
  }

  async run() {
    console.log(chalk.blue.bold('\n🤖 AI Blog Generator (Local Model)\n'));

    try {
      // Check if Ollama is running and model is available
      await this.checkPrerequisites();

      // Choose mode: manual or automatic
      const mode = await this.selectMode();

      if (mode === 'manual') {
        await this.runManualMode();
      } else {
        await this.runAutoMode();
      }

    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    const spinner = ora('Checking prerequisites...').start();

    try {
      // Check if content directory exists
      await fs.ensureDir(this.contentDir);

      // Check if Ollama model is available
      const modelAvailable = await this.aiService.checkModelAvailability();
      
      if (!modelAvailable) {
        spinner.fail();
        throw new Error(
          'AI model not available. Please ensure Ollama is running with the ai-blog-writer-1b model.\n' +
          'Run: ollama serve (in another terminal)\n' +
          'Verify: ollama list'
        );
      }

      spinner.succeed('Prerequisites checked successfully');
    } catch (error) {
      spinner.fail();
      throw error;
    }
  }

  async selectMode() {
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Select generation mode:',
        choices: [
          { name: '📝 Manual - Choose topic and settings', value: 'manual' },
          { name: '🤖 Automatic - Generate from predefined topics', value: 'auto' },
        ],
      },
    ]);

    return mode;
  }

  async runManualMode() {
    console.log(chalk.yellow('\n📝 Manual Blog Generation Mode\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'topic',
        message: 'Enter blog topic:',
        validate: input => input.trim().length > 0 || 'Topic is required',
      },
      {
        type: 'list',
        name: 'audience',
        message: 'Target audience:',
        choices: [
          'general readers',
          'web developers',
          'business owners',
          'students',
          'professionals',
          'beginners',
        ],
      },
      {
        type: 'list',
        name: 'tone',
        message: 'Writing tone:',
        choices: ['professional', 'casual', 'technical', 'friendly'],
      },
      {
        type: 'number',
        name: 'length',
        message: 'Target word count:',
        default: 800,
        validate: input => input > 200 || 'Word count must be at least 200',
      },
      {
        type: 'confirm',
        name: 'deploy',
        message: 'Deploy to GitHub after generation?',
        default: true,
      },
    ]);

    await this.generateAndSaveBlog(answers, answers.deploy);
  }

  async runAutoMode() {
    console.log(chalk.yellow('\n🤖 Automatic Blog Generation Mode\n'));

    const { selectedTopics, deploy } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTopics',
        message: 'Select topics to generate:',
        choices: this.blogTopics.map((topic, index) => ({
          name: `${topic.topic} (${topic.audience})`,
          value: index,
          checked: index === 0, // First item checked by default
        })),
        validate: input => input.length > 0 || 'Select at least one topic',
      },
      {
        type: 'confirm',
        name: 'deploy',
        message: 'Deploy to GitHub after generation?',
        default: true,
      },
    ]);

    for (const topicIndex of selectedTopics) {
      const topicConfig = this.blogTopics[topicIndex];
      await this.generateAndSaveBlog({
        ...topicConfig,
        length: 800,
      }, false); // Don't deploy individually
    }

    if (deploy && selectedTopics.length > 0) {
      await this.deployToGitHub();
    }
  }

  async generateAndSaveBlog(config, shouldDeploy = true) {
    const spinner = ora(`Generating blog post: "${config.topic}"`).start();

    try {
      // Generate blog content using local AI
      const blogData = await this.aiService.generateBlogPost(config);

      // Create filename
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const slug = this.createSlug(blogData.title);
      const filename = `${dateStr}-${slug}.md`;
      const filepath = path.join(this.contentDir, filename);

      // Create frontmatter
      const frontmatter = {
        title: blogData.title,
        date: date.toISOString(),
        description: blogData.metaDescription,
        tags: blogData.tags,
        category: blogData.category,
        author: 'AI Assistant',
        draft: false,
        featured: false,
        wordCount: blogData.wordCount,
        readingTime: Math.ceil(blogData.wordCount / 200) + ' min read',
        generatedBy: 'ai-blog-writer-1b',
        generatedAt: blogData.generatedAt,
      };

      // Create complete markdown file
      const fileContent = matter.stringify(blogData.content, frontmatter);

      // Save file
      await fs.writeFile(filepath, fileContent, 'utf8');

      spinner.succeed(`Blog post generated: ${filename}`);
      console.log(chalk.green(`📄 File saved: ${filepath}`));
      console.log(chalk.blue(`📊 Word count: ${blogData.wordCount}`));
      console.log(chalk.blue(`🏷️  Tags: ${blogData.tags.join(', ')}`));

      if (shouldDeploy) {
        await this.deployToGitHub();
      }

      return { filename, filepath, blogData };

    } catch (error) {
      spinner.fail();
      throw new Error(`Failed to generate blog post: ${error.message}`);
    }
  }

  createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async deployToGitHub() {
    const spinner = ora('Deploying to GitHub...').start();

    try {
      // Check if this is a git repository
      if (!await fs.pathExists(path.join(__dirname, '../.git'))) {
        spinner.warn('Not a git repository. Skipping deployment.');
        return;
      }

      // Run the existing deployment commands
      execSync('git add .', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      
      const commitMessage = `Add new AI-generated blog post - ${new Date().toISOString().split('T')[0]}`;
      execSync(`git commit -m "${commitMessage}"`, { 
        cwd: path.join(__dirname, '..'), 
        stdio: 'inherit' 
      });
      
      execSync('git push origin main', { 
        cwd: path.join(__dirname, '..'), 
        stdio: 'inherit' 
      });

      // If you have a build/deploy script, run it
      if (await fs.pathExists(path.join(__dirname, '../.github/workflows'))) {
        spinner.succeed('Pushed to GitHub. GitHub Actions will handle deployment.');
      } else {
        // Run manual deployment if needed
        try {
          execSync('npm run build', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
          spinner.succeed('Content deployed successfully!');
        } catch (buildError) {
          spinner.warn('Pushed to GitHub, but build failed. Check your deployment pipeline.');
        }
      }

    } catch (error) {
      spinner.fail();
      console.error(chalk.red('Deployment failed:'), error.message);
      console.log(chalk.yellow('You can manually deploy by running:'));
      console.log(chalk.yellow('  git add .'));
      console.log(chalk.yellow('  git commit -m "Add new blog post"'));
      console.log(chalk.yellow('  git push origin main'));
    }
  }

  async showSummary() {
    const files = await fs.readdir(this.contentDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    console.log(chalk.green.bold('\n📈 Blog Summary'));
    console.log(chalk.blue(`📁 Total posts: ${mdFiles.length}`));
    console.log(chalk.blue(`📍 Content directory: ${this.contentDir}`));
    
    if (mdFiles.length > 0) {
      const latestFile = mdFiles.sort().reverse()[0];
      console.log(chalk.blue(`📄 Latest post: ${latestFile}`));
    }
  }
}

// Run the generator
if (require.main === module) {
  const generator = new AutomatedLocalBlogGenerator();
  generator.run()
    .then(() => generator.showSummary())
    .catch(error => {
      console.error(chalk.red('Fatal error:'), error.message);
      process.exit(1);
    });
}

module.exports = AutomatedLocalBlogGenerator;
