/**
 * Content Quality Checker
 * Validates existing content quality and suggests improvements
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const matter = require('gray-matter');
const ContentQualityManager = require('../src/lib/contentQualityManager');

class ContentQualityChecker {
  constructor() {
    this.qualityManager = new ContentQualityManager();
    this.contentDir = path.join(process.cwd(), 'src', 'content');
  }

  async checkAllContent() {
    console.log(chalk.blue.bold('\n📊 Content Quality Analysis\n'));

    const spinner = ora('Scanning content directory...').start();

    try {
      const files = await fs.readdir(this.contentDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      if (mdFiles.length === 0) {
        spinner.warn('No markdown files found in content directory');
        return;
      }

      spinner.succeed(`Found ${mdFiles.length} blog posts to analyze`);

      const results = [];

      for (const file of mdFiles) {
        const filePath = path.join(this.contentDir, file);
        const result = await this.analyzeFile(filePath, file);
        results.push(result);
      }

      // Generate summary report
      this.generateReport(results);

    } catch (error) {
      spinner.fail('Content analysis failed');
      throw error;
    }
  }

  async analyzeFile(filePath, fileName) {
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = matter(content);
    
    const qualityResults = await this.qualityManager.validateContentQuality(
      parsed.content,
      parsed.data
    );

    console.log(chalk.cyan(`\n📄 ${fileName}`));
    console.log(`  Title: ${parsed.data.title || 'No title'}`);
    console.log(`  SEO Score: ${this.getScoreColor(qualityResults.seoScore)}${qualityResults.seoScore}/100${chalk.reset}`);
    console.log(`  Readability: ${this.getScoreColor(qualityResults.readabilityScore)}${qualityResults.readabilityScore}/100${chalk.reset}`);
    console.log(`  Human-like: ${this.getScoreColor(qualityResults.humanLikeScore)}${qualityResults.humanLikeScore}/100${chalk.reset}`);
    console.log(`  Overall: ${this.getScoreColor(qualityResults.overallScore)}${qualityResults.overallScore}/100${chalk.reset}`);

    if (qualityResults.issues.length > 0) {
      console.log(chalk.yellow('  Issues:'));
      qualityResults.issues.forEach(issue => {
        console.log(chalk.yellow(`    • ${issue}`));
      });
    }

    return {
      fileName,
      title: parsed.data.title,
      ...qualityResults
    };
  }

  getScoreColor(score) {
    if (score >= 80) return chalk.green;
    if (score >= 60) return chalk.yellow;
    return chalk.red;
  }

  generateReport(results) {
    console.log(chalk.blue.bold('\n📈 Quality Summary Report\n'));

    const avgSEO = Math.round(results.reduce((sum, r) => sum + r.seoScore, 0) / results.length);
    const avgReadability = Math.round(results.reduce((sum, r) => sum + r.readabilityScore, 0) / results.length);
    const avgHuman = Math.round(results.reduce((sum, r) => sum + r.humanLikeScore, 0) / results.length);
    const avgOverall = Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length);

    console.log(`Total Posts Analyzed: ${results.length}`);
    console.log(`Average SEO Score: ${this.getScoreColor(avgSEO)}${avgSEO}/100${chalk.reset}`);
    console.log(`Average Readability: ${this.getScoreColor(avgReadability)}${avgReadability}/100${chalk.reset}`);
    console.log(`Average Human-like: ${this.getScoreColor(avgHuman)}${avgHuman}/100${chalk.reset}`);
    console.log(`Average Overall: ${this.getScoreColor(avgOverall)}${avgOverall}/100${chalk.reset}`);

    // Top performers
    const topPosts = results
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 3);

    console.log(chalk.green.bold('\n🏆 Top Performing Posts:'));
    topPosts.forEach((post, index) => {
      console.log(`  ${index + 1}. ${post.title} (${post.overallScore}/100)`);
    });

    // Posts needing improvement
    const needsImprovement = results.filter(r => r.overallScore < 70);
    if (needsImprovement.length > 0) {
      console.log(chalk.red.bold('\n⚠️ Posts Needing Improvement:'));
      needsImprovement.forEach(post => {
        console.log(`  • ${post.title} (${post.overallScore}/100)`);
      });
    }

    // Recommendations
    console.log(chalk.blue.bold('\n💡 Recommendations:'));
    if (avgSEO < 70) {
      console.log('  • Focus on SEO optimization: add more internal/external links, improve meta descriptions');
    }
    if (avgReadability < 70) {
      console.log('  • Improve readability: use shorter paragraphs, add bullet points, break up long sentences');
    }
    if (avgHuman < 70) {
      console.log('  • Make content more human-like: use contractions, ask questions, add personal touch');
    }

    console.log(chalk.green.bold('\n✅ Quality analysis complete!'));
  }

  async checkSpecificFile(fileName) {
    const filePath = path.join(this.contentDir, fileName);
    
    if (!await fs.pathExists(filePath)) {
      throw new Error(`File not found: ${fileName}`);
    }

    console.log(chalk.blue.bold(`\n📊 Analyzing: ${fileName}\n`));
    
    const result = await this.analyzeFile(filePath, fileName);
    
    console.log(chalk.blue.bold('\n💡 Improvement Suggestions:'));
    if (result.seoScore < 80) {
      console.log('  • Add more internal links to related posts');
      console.log('  • Include at least one external authoritative source');
      console.log('  • Optimize meta description length (150-155 characters)');
    }
    if (result.readabilityScore < 80) {
      console.log('  • Break long paragraphs into shorter ones');
      console.log('  • Add more bullet points and numbered lists');
      console.log('  • Use subheadings to improve structure');
    }
    if (result.humanLikeScore < 80) {
      console.log('  • Use more contractions (don\'t, won\'t, it\'s)');
      console.log('  • Ask engaging questions');
      console.log('  • Add personal anecdotes or industry stories');
    }

    return result;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const checker = new ContentQualityChecker();

  try {
    if (args.length > 0) {
      // Check specific file
      const fileName = args[0];
      await checker.checkSpecificFile(fileName);
    } else {
      // Check all content
      await checker.checkAllContent();
    }
  } catch (error) {
    console.error(chalk.red('❌ Quality check failed:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ContentQualityChecker;
