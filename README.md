# AI Blog Website

A modern blog website with AI-powered content generation using local Ollama models and manual deployment control.

## 🚀 Features

- **Local AI Content Generation**: Blog posts created using local Ollama AI models
- **SEO Optimized**: Dynamic meta tags, sitemap, and RSS feed
- **Manual Deployment**: GitHub Actions for deployment when you push changes
- **Modern Design**: Clean, responsive UI with Tailwind CSS
- **Fast Performance**: Static site generation with Next.js
- **Social Sharing**: Built-in social media sharing buttons
- **Search & Filter**: Full-text search and tag filtering

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (Static Export)
- **Styling**: Tailwind CSS + Tailwind Typography
- **Content**: Markdown with gray-matter
- **AI**: Local Ollama models
- **Deployment**: GitHub Pages
- **Automation**: GitHub Actions for deployment only

## 📁 Project Structure

```
ai-blog-website/
├── .github/workflows/     # GitHub Actions workflows
├── public/               # Static assets
├── scripts/              # Content generation scripts
├── src/
│   ├── components/       # React components
│   ├── content/         # Blog posts (Markdown)
│   ├── data/            # Topic pools and usage history
│   ├── lib/             # Utility functions
│   ├── pages/           # Next.js pages
│   └── styles/          # CSS styles
├── templates/           # Blog post templates
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Ollama installed locally with ai-blog-writer-1b model

### 2. Setup Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-blog-website.git
cd ai-blog-website

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your API keys
# OPENAI_API_KEY=your_openai_api_key_here
# SITE_URL=https://yourdomain.github.io
```

### 2. Run Initial Setup
# Install dependencies
npm install
```

### 3. Development

```bash
# Start development server
npm run dev

# Generate a new AI blog post using local Ollama
npm run generate-post-local

# Generate RSS feed
npm run generate-rss

# Build for production
npm run build
```

### 4. Deployment

#### GitHub Pages (Automated)
1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. The GitHub Action will automatically deploy on push to main branch
4. Manual deployment trigger available in Actions tab

## 🔧 Configuration

### Local AI Setup

Ensure Ollama is running locally with the required model:

```bash
# Start Ollama service
ollama serve

# Verify model is available
ollama list
# Should show: ai-blog-writer-1b
```

### Customization

- **Logo & Branding**: Update components in `src/components/`
- **Styling**: Modify `src/styles/globals.css` and `tailwind.config.js`
- **Content Topics**: Edit `TOPICS` array in `scripts/generate-post.js`
- **SEO**: Update meta tags in `src/components/Layout.tsx`

## 📝 Content Management

### Manual Posts

Create Markdown files in `src/content/` with frontmatter:

```markdown
---
title: "Your Blog Post Title"
excerpt: "Brief description of the post"
date: "2025-01-18"
author: "Your Name"
tags: ["AI", "Technology", "Tutorial"]
image: "/images/blog/your-image.jpg"
featured: false
---

# Your Blog Post Content

Write your blog post content here using Markdown.
```

### AI-Generated Posts

```bash
# Generate a single post using local AI
npm run generate-post-local

# Posts are automatically created in src/content/
```

## 🚀 Deployment

### GitHub Actions

The included workflow (`deploy.yml`) automatically:
- Builds and deploys to GitHub Pages when you push to main
- Updates sitemap and RSS feed
- Can be manually triggered from GitHub Actions tab

### Manual Workflow

1. Generate content locally: `npm run generate-post-local`
2. Commit and push changes to main branch
3. GitHub Actions automatically deploys your updated site

## 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate-post-local` - Generate blog post with local AI
- `npm run generate-rss` - Update RSS feed
- `npm run deploy` - Manual deployment helper
- Dynamic meta tags
- Open Graph tags
- Twitter Card support
- JSON-LD structured data
- Automatic sitemap generation
- RSS feed
- robots.txt

## 🔄 Automation Schedule

- **Daily**: New blog post generation (9 AM UTC)
- **On Push**: Automatic deployment
- **Weekly**: Sitemap regeneration
- **Monthly**: Content optimization

## 📚 API Routes

- `/api/rss.xml` - RSS feed
- `/sitemap.xml` - XML sitemap
- `/robots.txt` - Robots file

## 🛡️ Security

- API keys stored as GitHub secrets
- Content sanitization
- Rate limiting for API calls
- CORS protection

## 📱 Mobile Responsive

- Fully responsive design
- Touch-friendly navigation
- Optimized images
- Fast loading times

## 🔍 Search & Discovery

- Full-text search
- Tag-based filtering
- Related posts
- SEO optimized URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues and questions:
- Check the [Issues](https://github.com/yourusername/ai-blog-website/issues) page
- Create a new issue with detailed description
- Review the documentation

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

---

Built with ❤️ using AI and modern web technologies.
