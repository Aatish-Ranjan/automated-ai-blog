#!/usr/bin/env node

/**
 * Scheduled Local AI Blog Generator
 * Runs on your local machine and pushes to GitHub automatically
 */

const cron = require('node-cron');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const AutomatedLocalBlogGenerator = require('./automated-blog-local');

class ScheduledBlogGenerator {
  constructor() {
    this.generator = new AutomatedLocalBlogGenerator();
    this.configFile = path.join(__dirname, '../blog-schedule-config.json');
    this.logFile = path.join(__dirname, '../logs/blog-generation.log');
  }

  async init() {
    console.log(chalk.blue.bold('\n🕒 AI Blog Scheduler (Local)\n'));
    
    // Ensure logs directory exists
    await fs.ensureDir(path.dirname(this.logFile));
    
    // Load or create config
    await this.loadConfig();
    
    console.log(chalk.green('📅 Blog generation scheduler initialized!'));
    console.log(chalk.yellow('Available commands:'));
    console.log(chalk.white('  - start: Start the scheduled blog generation'));
    console.log(chalk.white('  - generate-now: Generate a blog post immediately'));
    console.log(chalk.white('  - status: Show current schedule status'));
    console.log(chalk.white('  - config: Update schedule configuration'));
    console.log(chalk.white('  - logs: View recent logs'));
    
    this.showCurrentSchedule();
  }

  async loadConfig() {
    const defaultConfig = {
      enabled: false,
      schedule: '0 9 * * 1,3,5', // Monday, Wednesday, Friday at 9 AM
      autoTopics: true,
      autoDeploy: true,
      maxPostsPerDay: 1,
      lastGenerated: null,
      topics: [
        "Latest trends in AI and machine learning",
        "Web development best practices and tips",
        "JavaScript frameworks comparison and guides",
        "Building scalable applications with modern tools",
        "Performance optimization for web applications"
      ]
    };

    try {
      if (await fs.pathExists(this.configFile)) {
        const config = await fs.readJson(this.configFile);
        this.config = { ...defaultConfig, ...config };
      } else {
        this.config = defaultConfig;
        await this.saveConfig();
      }
    } catch (error) {
      console.error(chalk.red('Error loading config:'), error.message);
      this.config = defaultConfig;
    }
  }

  async saveConfig() {
    try {
      await fs.writeJson(this.configFile, this.config, { spaces: 2 });
    } catch (error) {
      console.error(chalk.red('Error saving config:'), error.message);
    }
  }

  showCurrentSchedule() {
    console.log(chalk.blue('\n📊 Current Schedule:'));
    console.log(chalk.white(`  Status: ${this.config.enabled ? chalk.green('ENABLED') : chalk.red('DISABLED')}`));
    console.log(chalk.white(`  Schedule: ${this.config.schedule} (${this.cronToHuman(this.config.schedule)})`));
    console.log(chalk.white(`  Auto Deploy: ${this.config.autoDeploy ? 'Yes' : 'No'}`));
    console.log(chalk.white(`  Max Posts/Day: ${this.config.maxPostsPerDay}`));
    
    if (this.config.lastGenerated) {
      console.log(chalk.white(`  Last Generated: ${new Date(this.config.lastGenerated).toLocaleString()}`));
    }
  }

  cronToHuman(cronExpression) {
    // Simple cron to human readable conversion
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return cronExpression;
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    let human = '';
    
    if (dayOfWeek !== '*') {
      const days = {
        '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
        '4': 'Thursday', '5': 'Friday', '6': 'Saturday'
      };
      const dayNames = dayOfWeek.split(',').map(d => days[d]).join(', ');
      human += `${dayNames} `;
    }
    
    if (hour !== '*' && minute !== '*') {
      human += `at ${hour}:${minute.padStart(2, '0')}`;
    }
    
    return human || cronExpression;
  }

  async startScheduler() {
    if (!this.config.enabled) {
      console.log(chalk.yellow('Scheduler is disabled. Enable it first with the config command.'));
      return;
    }

    console.log(chalk.green('🚀 Starting blog generation scheduler...'));
    console.log(chalk.blue(`📅 Next generation: ${this.cronToHuman(this.config.schedule)}`));

    // Schedule the blog generation
    cron.schedule(this.config.schedule, async () => {
      await this.runScheduledGeneration();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    // Keep the process running
    console.log(chalk.green('✅ Scheduler is running! Press Ctrl+C to stop.'));
    
    // Log startup
    await this.log('Scheduler started');
    
    // Prevent process from exiting
    process.stdin.resume();
  }

  async runScheduledGeneration() {
    try {
      await this.log('Starting scheduled blog generation');
      console.log(chalk.blue(`\n🤖 ${new Date().toLocaleString()} - Generating scheduled blog post...`));

      // Check if we've already generated today
      const today = new Date().toDateString();
      const lastGenerated = this.config.lastGenerated ? new Date(this.config.lastGenerated).toDateString() : null;
      
      if (lastGenerated === today) {
        console.log(chalk.yellow('Blog post already generated today. Skipping.'));
        await this.log('Skipped - already generated today');
        return;
      }

      // Select a random topic
      const topic = this.config.topics[Math.floor(Math.random() * this.config.topics.length)];
      
      // Generate blog post
      const result = await this.generator.generateAndSaveBlog({
        topic,
        audience: 'developers and tech enthusiasts',
        tone: 'professional',
        length: 800,
      }, this.config.autoDeploy);

      // Update last generated time
      this.config.lastGenerated = new Date().toISOString();
      await this.saveConfig();

      console.log(chalk.green(`✅ Blog post generated successfully: ${result.filename}`));
      await this.log(`Generated: ${result.filename}`);

    } catch (error) {
      console.error(chalk.red('❌ Scheduled generation failed:'), error.message);
      await this.log(`Error: ${error.message}`);
    }
  }

  async generateNow() {
    console.log(chalk.blue('\n🚀 Generating blog post immediately...'));
    
    try {
      const topic = this.config.topics[Math.floor(Math.random() * this.config.topics.length)];
      
      const result = await this.generator.generateAndSaveBlog({
        topic,
        audience: 'developers and tech enthusiasts',
        tone: 'professional',
        length: 800,
      }, true);

      console.log(chalk.green(`✅ Blog post generated: ${result.filename}`));
      await this.log(`Manual generation: ${result.filename}`);

    } catch (error) {
      console.error(chalk.red('❌ Generation failed:'), error.message);
      await this.log(`Manual generation error: ${error.message}`);
    }
  }

  async showLogs() {
    try {
      if (await fs.pathExists(this.logFile)) {
        const logs = await fs.readFile(this.logFile, 'utf8');
        const recentLogs = logs.split('\n').slice(-20).join('\n');
        console.log(chalk.blue('\n📋 Recent Logs (last 20 entries):'));
        console.log(recentLogs);
      } else {
        console.log(chalk.yellow('No logs found.'));
      }
    } catch (error) {
      console.error(chalk.red('Error reading logs:'), error.message);
    }
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;
    
    try {
      await fs.appendFile(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write log:', error.message);
    }
  }
}

// CLI interface
async function main() {
  const scheduler = new ScheduledBlogGenerator();
  await scheduler.init();

  const command = process.argv[2];

  switch (command) {
    case 'start':
      await scheduler.startScheduler();
      break;
      
    case 'generate-now':
      await scheduler.generateNow();
      break;
      
    case 'status':
      scheduler.showCurrentSchedule();
      break;
      
    case 'logs':
      await scheduler.showLogs();
      break;
      
    case 'config':
      console.log(chalk.blue('\n⚙️ Configuration:'));
      console.log(JSON.stringify(scheduler.config, null, 2));
      console.log(chalk.yellow('\nTo modify config, edit: blog-schedule-config.json'));
      break;
      
    default:
      console.log(chalk.red('Unknown command. Available commands:'));
      console.log('  start, generate-now, status, config, logs');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  });
}

module.exports = ScheduledBlogGenerator;
