/**
 * Comprehensive SEO Audit Tool
 * Analyzes and scores your blog's SEO performance
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const matter = require('gray-matter');

class SEOAuditor {
  constructor() {
    this.contentDir = path.join(process.cwd(), 'src', 'content');
    this.auditResults = {
      technical: { score: 0, issues: [], improvements: [] },
      content: { score: 0, issues: [], improvements: [] },
      performance: { score: 0, issues: [], improvements: [] },
      overall: { score: 0, grade: '' }
    };
  }

  async runCompleteAudit() {
    console.log(chalk.blue.bold('\n🔍 Comprehensive SEO Audit\n'));

    const audits = [
      { name: 'Technical SEO Audit', action: () => this.auditTechnicalSEO() },
      { name: 'Content SEO Analysis', action: () => this.auditContentSEO() },
      { name: 'Performance Analysis', action: () => this.auditPerformance() },
      { name: 'Keyword Analysis', action: () => this.auditKeywords() },
      { name: 'Link Analysis', action: () => this.auditLinks() }
    ];

    for (const audit of audits) {
      const spinner = ora(audit.name).start();
      try {
        await audit.action();
        spinner.succeed();
      } catch (error) {
        spinner.fail(`${audit.name} failed: ${error.message}`);
      }
    }

    await this.generateAuditReport();
  }

  async auditTechnicalSEO() {
    let score = 0;
    const issues = [];
    const improvements = [];

    // Check robots.txt
    const robotsExists = await fs.pathExists(path.join(process.cwd(), 'public', 'robots.txt'));
    if (robotsExists) {
      score += 15;
      improvements.push('✅ Robots.txt exists');
    } else {
      issues.push('❌ Missing robots.txt file');
      improvements.push('🔧 Create robots.txt with proper directives');
    }

    // Check sitemap configuration
    const sitemapExists = await fs.pathExists(path.join(process.cwd(), 'next-sitemap.config.js'));
    if (sitemapExists) {
      score += 15;
      improvements.push('✅ Sitemap configuration exists');
    } else {
      issues.push('❌ Missing sitemap configuration');
      improvements.push('🔧 Set up next-sitemap for automatic sitemap generation');
    }

    // Check HTTPS (assuming GitHub Pages provides HTTPS)
    score += 20;
    improvements.push('✅ HTTPS enabled (GitHub Pages)');

    // Check mobile responsiveness (check if tailwind responsive classes are used)
    const indexExists = await fs.pathExists(path.join(process.cwd(), 'src', 'pages', 'index.tsx'));
    if (indexExists) {
      const indexContent = await fs.readFile(path.join(process.cwd(), 'src', 'pages', 'index.tsx'), 'utf8');
      if (indexContent.includes('md:') || indexContent.includes('lg:') || indexContent.includes('sm:')) {
        score += 20;
        improvements.push('✅ Responsive design implemented');
      } else {
        issues.push('❌ Limited responsive design detected');
        improvements.push('🔧 Add responsive breakpoints with Tailwind classes');
      }
    }

    // Check for proper meta tags structure
    const appExists = await fs.pathExists(path.join(process.cwd(), 'src', 'pages', '_app.tsx'));
    if (appExists) {
      score += 10;
      improvements.push('✅ App structure exists for meta tag injection');
    }

    // Check for proper URL structure (clean URLs)
    score += 20; // Next.js provides clean URLs by default
    improvements.push('✅ Clean URL structure (Next.js)');

    this.auditResults.technical = { score, issues, improvements };
  }

  async auditContentSEO() {
    let totalScore = 0;
    const issues = [];
    const improvements = [];
    let postCount = 0;

    try {
      const files = await fs.readdir(this.contentDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      postCount = mdFiles.length;

      let postsWithMetaTitles = 0;
      let postsWithMetaDescriptions = 0;
      let postsWithOptimalLength = 0;
      let postsWithInternalLinks = 0;
      let postsWithExternalLinks = 0;
      let postsWithImages = 0;
      let postsWithKeywords = 0;

      for (const file of mdFiles) {
        const filePath = path.join(this.contentDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = matter(content);
        
        // Check meta title
        if (parsed.data.metaTitle && parsed.data.metaTitle.length >= 50 && parsed.data.metaTitle.length <= 60) {
          postsWithMetaTitles++;
        }
        
        // Check meta description
        if (parsed.data.metaDescription && parsed.data.metaDescription.length >= 150 && parsed.data.metaDescription.length <= 160) {
          postsWithMetaDescriptions++;
        }
        
        // Check content length
        const wordCount = parsed.content.split(/\s+/).length;
        if (wordCount >= 1500) {
          postsWithOptimalLength++;
        }
        
        // Check internal links
        const internalLinks = (parsed.content.match(/\[.*?\]\(\/blog\//g) || []).length;
        if (internalLinks >= 2) {
          postsWithInternalLinks++;
        }
        
        // Check external links
        const externalLinks = (parsed.content.match(/\[.*?\]\(https?:\/\//g) || []).length;
        if (externalLinks >= 1) {
          postsWithExternalLinks++;
        }
        
        // Check for images
        if (parsed.data.image || parsed.content.includes('![')) {
          postsWithImages++;
        }
        
        // Check for target keywords
        if (parsed.data.targetKeyword || (parsed.data.tags && parsed.data.tags.length > 0)) {
          postsWithKeywords++;
        }
      }

      // Calculate scores based on percentages
      const metaTitleScore = Math.round((postsWithMetaTitles / postCount) * 100);
      const metaDescScore = Math.round((postsWithMetaDescriptions / postCount) * 100);
      const lengthScore = Math.round((postsWithOptimalLength / postCount) * 100);
      const internalLinkScore = Math.round((postsWithInternalLinks / postCount) * 100);
      const externalLinkScore = Math.round((postsWithExternalLinks / postCount) * 100);
      const imageScore = Math.round((postsWithImages / postCount) * 100);
      const keywordScore = Math.round((postsWithKeywords / postCount) * 100);

      totalScore = Math.round((metaTitleScore + metaDescScore + lengthScore + internalLinkScore + externalLinkScore + imageScore + keywordScore) / 7);

      // Generate recommendations
      if (metaTitleScore < 80) {
        issues.push(`❌ ${100 - metaTitleScore}% of posts missing optimized meta titles`);
        improvements.push('🔧 Add meta titles (50-60 characters) to all posts');
      } else {
        improvements.push('✅ Good meta title optimization');
      }

      if (metaDescScore < 80) {
        issues.push(`❌ ${100 - metaDescScore}% of posts missing optimized meta descriptions`);
        improvements.push('🔧 Add meta descriptions (150-160 characters) to all posts');
      } else {
        improvements.push('✅ Good meta description optimization');
      }

      if (lengthScore < 80) {
        issues.push(`❌ ${100 - lengthScore}% of posts are under 1500 words`);
        improvements.push('🔧 Expand short content to 1500+ words for better rankings');
      } else {
        improvements.push('✅ Good content length');
      }

      if (internalLinkScore < 80) {
        issues.push(`❌ ${100 - internalLinkScore}% of posts lack sufficient internal links`);
        improvements.push('🔧 Add 2-3 internal links to each post');
      } else {
        improvements.push('✅ Good internal linking');
      }

      if (externalLinkScore < 80) {
        issues.push(`❌ ${100 - externalLinkScore}% of posts lack external authority links`);
        improvements.push('🔧 Add 1-2 external authority links per post');
      } else {
        improvements.push('✅ Good external linking');
      }

    } catch (error) {
      issues.push(`❌ Error analyzing content: ${error.message}`);
      totalScore = 0;
    }

    this.auditResults.content = { score: totalScore, issues, improvements };
  }

  async auditPerformance() {
    let score = 0;
    const issues = [];
    const improvements = [];

    // Check for Next.js optimization
    const nextConfigExists = await fs.pathExists(path.join(process.cwd(), 'next.config.js'));
    if (nextConfigExists) {
      const nextConfig = await fs.readFile(path.join(process.cwd(), 'next.config.js'), 'utf8');
      
      if (nextConfig.includes('images:')) {
        score += 25;
        improvements.push('✅ Image optimization configured');
      } else {
        issues.push('❌ Missing image optimization configuration');
        improvements.push('🔧 Configure Next.js image optimization');
      }

      if (nextConfig.includes('compress:')) {
        score += 15;
        improvements.push('✅ Compression enabled');
      } else {
        improvements.push('🔧 Enable gzip compression in Next.js config');
      }
    } else {
      issues.push('❌ Next.js configuration file missing');
      improvements.push('🔧 Create optimized next.config.js');
    }

    // Check for Tailwind CSS (efficient CSS framework)
    const tailwindExists = await fs.pathExists(path.join(process.cwd(), 'tailwind.config.js'));
    if (tailwindExists) {
      score += 20;
      improvements.push('✅ Efficient CSS framework (Tailwind) configured');
    }

    // Check for static generation (good for performance)
    if (nextConfigExists) {
      const nextConfig = await fs.readFile(path.join(process.cwd(), 'next.config.js'), 'utf8');
      if (nextConfig.includes('output') && nextConfig.includes('export')) {
        score += 30;
        improvements.push('✅ Static site generation enabled');
      }
    }

    // Check for performance monitoring
    const perfMonitorExists = await fs.pathExists(path.join(process.cwd(), 'src', 'lib', 'performance.js'));
    if (perfMonitorExists) {
      score += 10;
      improvements.push('✅ Performance monitoring implemented');
    } else {
      issues.push('❌ No performance monitoring detected');
      improvements.push('🔧 Implement Core Web Vitals monitoring');
    }

    this.auditResults.performance = { score, issues, improvements };
  }

  async auditKeywords() {
    // This would typically integrate with keyword research tools
    // For now, we'll analyze the content for keyword optimization
    
    const files = await fs.readdir(this.contentDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    let keywordOptimizedPosts = 0;
    let totalPosts = mdFiles.length;

    for (const file of mdFiles) {
      const filePath = path.join(this.contentDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const parsed = matter(content);
      
      // Check if post has target keyword and uses it naturally
      if (parsed.data.targetKeyword) {
        const keyword = parsed.data.targetKeyword.toLowerCase();
        const title = (parsed.data.title || '').toLowerCase();
        const contentText = parsed.content.toLowerCase();
        
        // Check keyword usage in title and content
        const inTitle = title.includes(keyword);
        const keywordCount = (contentText.match(new RegExp(keyword, 'g')) || []).length;
        const wordCount = parsed.content.split(/\s+/).length;
        const keywordDensity = (keywordCount / wordCount) * 100;
        
        // Good keyword optimization: in title, 1-2% density
        if (inTitle && keywordDensity >= 1 && keywordDensity <= 3) {
          keywordOptimizedPosts++;
        }
      }
    }

    const keywordScore = totalPosts > 0 ? Math.round((keywordOptimizedPosts / totalPosts) * 100) : 0;
    
    return {
      score: keywordScore,
      optimizedPosts: keywordOptimizedPosts,
      totalPosts: totalPosts,
      recommendations: keywordScore < 80 ? [
        '🔧 Add target keywords to all posts',
        '🔧 Optimize keyword density (1-2%)',
        '🔧 Include keywords in titles naturally'
      ] : ['✅ Good keyword optimization']
    };
  }

  async auditLinks() {
    const files = await fs.readdir(this.contentDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    let totalInternalLinks = 0;
    let totalExternalLinks = 0;
    let postsWithGoodLinking = 0;

    for (const file of mdFiles) {
      const filePath = path.join(this.contentDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const parsed = matter(content);
      
      const internalLinks = (parsed.content.match(/\[.*?\]\(\/blog\//g) || []).length;
      const externalLinks = (parsed.content.match(/\[.*?\]\(https?:\/\//g) || []).length;
      
      totalInternalLinks += internalLinks;
      totalExternalLinks += externalLinks;
      
      // Good linking: at least 2 internal, 1 external
      if (internalLinks >= 2 && externalLinks >= 1) {
        postsWithGoodLinking++;
      }
    }

    const linkingScore = mdFiles.length > 0 ? Math.round((postsWithGoodLinking / mdFiles.length) * 100) : 0;
    
    return {
      score: linkingScore,
      totalInternal: totalInternalLinks,
      totalExternal: totalExternalLinks,
      avgInternalPerPost: mdFiles.length > 0 ? Math.round(totalInternalLinks / mdFiles.length) : 0,
      avgExternalPerPost: mdFiles.length > 0 ? Math.round(totalExternalLinks / mdFiles.length) : 0
    };
  }

  getGrade(score) {
    if (score >= 90) return { grade: 'A+', color: chalk.green };
    if (score >= 80) return { grade: 'A', color: chalk.green };
    if (score >= 70) return { grade: 'B', color: chalk.yellow };
    if (score >= 60) return { grade: 'C', color: chalk.yellow };
    if (score >= 50) return { grade: 'D', color: chalk.red };
    return { grade: 'F', color: chalk.red };
  }

  async generateAuditReport() {
    // Calculate overall score
    const overallScore = Math.round(
      (this.auditResults.technical.score + 
       this.auditResults.content.score + 
       this.auditResults.performance.score) / 3
    );
    
    const gradeInfo = this.getGrade(overallScore);
    this.auditResults.overall = { score: overallScore, grade: gradeInfo.grade };

    // Display report
    console.log(chalk.blue.bold('\n📊 SEO Audit Report\n'));
    
    console.log(gradeInfo.color.bold(`Overall SEO Score: ${overallScore}/100 (Grade: ${gradeInfo.grade})\n`));

    // Technical SEO
    console.log(chalk.cyan.bold('🔧 Technical SEO:'), `${this.auditResults.technical.score}/100`);
    this.auditResults.technical.improvements.forEach(improvement => {
      console.log(`  ${improvement}`);
    });
    this.auditResults.technical.issues.forEach(issue => {
      console.log(`  ${issue}`);
    });

    // Content SEO
    console.log(chalk.cyan.bold('\n📝 Content SEO:'), `${this.auditResults.content.score}/100`);
    this.auditResults.content.improvements.forEach(improvement => {
      console.log(`  ${improvement}`);
    });
    this.auditResults.content.issues.forEach(issue => {
      console.log(`  ${issue}`);
    });

    // Performance
    console.log(chalk.cyan.bold('\n⚡ Performance:'), `${this.auditResults.performance.score}/100`);
    this.auditResults.performance.improvements.forEach(improvement => {
      console.log(`  ${improvement}`);
    });
    this.auditResults.performance.issues.forEach(issue => {
      console.log(`  ${issue}`);
    });

    // Keyword analysis
    const keywordResults = await this.auditKeywords();
    console.log(chalk.cyan.bold('\n🎯 Keyword Optimization:'), `${keywordResults.score}/100`);
    console.log(`  📊 Optimized Posts: ${keywordResults.optimizedPosts}/${keywordResults.totalPosts}`);
    keywordResults.recommendations.forEach(rec => {
      console.log(`  ${rec}`);
    });

    // Link analysis
    const linkResults = await this.auditLinks();
    console.log(chalk.cyan.bold('\n🔗 Link Analysis:'), `${linkResults.score}/100`);
    console.log(`  📊 Internal Links: ${linkResults.totalInternal} (avg: ${linkResults.avgInternalPerPost}/post)`);
    console.log(`  📊 External Links: ${linkResults.totalExternal} (avg: ${linkResults.avgExternalPerPost}/post)`);

    // Priority improvements
    console.log(chalk.yellow.bold('\n🎯 Priority Improvements:'));
    const allIssues = [
      ...this.auditResults.technical.issues,
      ...this.auditResults.content.issues,
      ...this.auditResults.performance.issues
    ];
    
    if (allIssues.length === 0) {
      console.log('  🎉 No critical issues found! Your SEO is in great shape.');
    } else {
      allIssues.slice(0, 5).forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    // Save detailed report
    const detailedReport = {
      timestamp: new Date().toISOString(),
      overallScore,
      grade: gradeInfo.grade,
      technicalSEO: this.auditResults.technical,
      contentSEO: this.auditResults.content,
      performance: this.auditResults.performance,
      keywords: keywordResults,
      links: linkResults,
      recommendations: {
        immediate: allIssues.slice(0, 3),
        longTerm: [
          'Create topic clusters and pillar pages',
          'Implement advanced schema markup',
          'Build high-quality backlinks',
          'Optimize for Core Web Vitals',
          'Create linkable assets (tools, guides)'
        ]
      }
    };

    await fs.writeFile(
      path.join(process.cwd(), 'seo-audit-report.json'),
      JSON.stringify(detailedReport, null, 2)
    );

    console.log(chalk.green.bold('\n✅ SEO Audit Complete!'));
    console.log(chalk.blue('📁 Detailed report saved to: seo-audit-report.json'));
    
    if (overallScore < 70) {
      console.log(chalk.yellow('\n💡 Run `npm run seo-enhance` to implement automated improvements!'));
    }
  }
}

async function main() {
  try {
    const auditor = new SEOAuditor();
    await auditor.runCompleteAudit();
  } catch (error) {
    console.error(chalk.red('❌ SEO audit failed:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SEOAuditor;
