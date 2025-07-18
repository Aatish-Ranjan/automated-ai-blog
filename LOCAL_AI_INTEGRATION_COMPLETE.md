# 🚀 Local AI Blog Generator Integration Guide

## Overview
Your AI blog writer model is now fully integrated with your Next.js website! This setup allows you to generate blog content locally and automatically deploy it to your GitHub Pages site.

## 🎯 What's New

### ✅ Local AI Integration
- **Service**: `src/lib/localAIBlogService.js` - Core AI communication service
- **API Routes**: 3 new API endpoints for web interface
- **Component**: `src/components/AIBlogGenerator.jsx` - Web-based generator
- **Scripts**: Automated generation and scheduling tools

### ✅ Automated Workflows
- **Manual Generation**: Interactive blog post creation
- **Scheduled Generation**: Automatic daily/weekly posting
- **GitHub Integration**: Auto-commit and deploy to your site

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Ollama Service
```bash
ollama serve
```

### 3. Verify Model is Available
```bash
ollama list
# Should show: ai-blog-writer-1b:latest
```

## 🎮 Usage Options

### Option 1: Web Interface (Recommended)
```bash
npm run dev
```
Visit `http://localhost:3000` and use the AI Blog Generator component.

### Option 2: Command Line - Interactive
```bash
npm run auto-blog-local
```
Choose topics and settings interactively.

### Option 3: Command Line - Scheduled
```bash
# Start the scheduler (runs continuously)
npm run blog-schedule-start

# Generate one post immediately
npm run blog-generate-now

# Check scheduler status
npm run blog-schedule status
```

### Option 4: Programmatic Generation
```javascript
const LocalAIBlogService = require('./src/lib/localAIBlogService');
const service = new LocalAIBlogService();

const result = await service.generateBlogPost({
  topic: "Your blog topic",
  audience: "developers",
  tone: "professional",
  length: 800
});
```

## 📁 File Structure

```
d:\ai-blog-website\
├── src/
│   ├── lib/
│   │   └── localAIBlogService.js      # Core AI service
│   ├── components/
│   │   └── AIBlogGenerator.jsx        # Web interface component
│   ├── pages/api/
│   │   ├── generate-blog-local.js     # Blog generation endpoint
│   │   ├── ai-model-status.js         # Model status check
│   │   └── recent-posts.js            # Recent posts API
│   └── content/                       # Generated blog posts
├── scripts/
│   ├── automated-blog-local.js        # Interactive CLI generator
│   └── blog-scheduler.js              # Scheduled generation
├── .github/workflows/
│   └── deploy.yml                     # GitHub Actions (existing)
└── blog-schedule-config.json          # Scheduler configuration
```

## ⚙️ Configuration

### Scheduler Configuration (`blog-schedule-config.json`)
```json
{
  "enabled": true,
  "schedule": "0 9 * * 1,3,5",          // Mon, Wed, Fri at 9 AM
  "autoTopics": true,
  "autoDeploy": true,
  "maxPostsPerDay": 1,
  "topics": [
    "Latest trends in AI and machine learning",
    "Web development best practices and tips",
    // Add your preferred topics here
  ]
}
```

### AI Model Configuration
The model is configured in `src/lib/localAIBlogService.js`:
- **Model**: `ai-blog-writer-1b` (memory efficient)
- **API Endpoint**: `http://localhost:11434`
- **Default Length**: 800 words
- **Output Format**: Markdown with frontmatter

## 🔄 Automated Workflow

### How It Works:
1. **Generation**: Script generates blog post using your local AI model
2. **Saving**: Post is saved to `src/content/` with proper frontmatter
3. **Git Operations**: Automatically commits and pushes to GitHub
4. **Deployment**: GitHub Actions builds and deploys your site
5. **Live**: New blog post appears on your website

### Workflow Commands:
```bash
# Run once manually
npm run auto-blog-local

# Start continuous scheduler
npm run blog-schedule-start

# Generate immediately
npm run blog-generate-now
```

## 🎯 Typical Daily Workflow

### Set It and Forget It:
```bash
# 1. Start Ollama (run once when you boot your computer)
ollama serve

# 2. Start the scheduler (runs continuously)
npm run blog-schedule-start
```

That's it! Your blog will automatically generate new posts based on your schedule.

### Manual Generation When Needed:
```bash
# Generate a specific post
npm run auto-blog-local

# Or generate immediately with random topic
npm run blog-generate-now
```

## 🔍 Monitoring

### Check Status:
```bash
npm run blog-schedule status
```

### View Logs:
```bash
npm run blog-schedule logs
```

### Verify Generated Content:
- Check `src/content/` folder for new `.md` files
- Visit your deployed website to see live posts
- Monitor GitHub Actions for deployment status

## 🛠 Troubleshooting

### Model Not Available:
```bash
# Check if Ollama is running
ollama list

# If not running, start it
ollama serve

# Verify your model exists
ollama show ai-blog-writer-1b
```

### Generation Fails:
1. Check Ollama is running: `ollama serve`
2. Verify model exists: `ollama list`
3. Check system memory (model needs ~2-3GB RAM)
4. Review logs: `npm run blog-schedule logs`

### Deployment Issues:
1. Check GitHub repository settings
2. Verify GitHub Actions are enabled
3. Check deployment logs in GitHub Actions tab
4. Ensure `deploy.yml` workflow is properly configured

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ `npm run blog-schedule status` shows "ENABLED"
- ✅ New `.md` files appear in `src/content/`
- ✅ GitHub shows new commits from automated generation
- ✅ Your website displays the new blog posts
- ✅ Web interface at `localhost:3000` shows "AI Model Ready"

## 🚀 Ready to Go!

Your AI blog writer is now fully integrated and ready for production. You can:

1. **Generate content manually** using the web interface
2. **Set up automated posting** with the scheduler
3. **Customize topics** in the configuration file
4. **Monitor everything** through logs and status commands

Happy blogging with AI! 🤖✨
