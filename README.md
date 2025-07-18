# AI Blog Website

A modern, automated blog website powered by AI with daily content generation, SEO optimization, and automated deployment.

## 🚀 Features

- **AI-Generated Content**: Daily blog posts created using OpenAI's GPT
- **SEO Optimized**: Dynamic meta tags, sitemap, and RSS feed
- **Automated Publishing**: GitHub Actions for continuous deployment
- **Modern Design**: Clean, responsive UI with Tailwind CSS
- **Fast Performance**: Static site generation with Next.js
- **Social Sharing**: Built-in social media sharing buttons
- **Search & Filter**: Full-text search and tag filtering
- **Analytics**: Google Analytics integration

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (Static Export)
- **Styling**: Tailwind CSS + Tailwind Typography
- **Content**: Markdown/MDX with gray-matter
- **AI**: OpenAI GPT API
- **Deployment**: GitHub Pages / Vercel
- **Automation**: GitHub Actions

## 📁 Project Structure

```
ai-blog-website/
├── .github/workflows/     # GitHub Actions workflows
├── public/               # Static assets
├── scripts/              # Automation scripts
├── src/
│   ├── components/       # React components
│   ├── content/         # Blog posts (Markdown)
│   ├── lib/             # Utility functions
│   ├── pages/           # Next.js pages
│   └── styles/          # CSS styles
├── .env.example         # Environment variables template
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## 🚀 Quick Start

### 1. Setup Environment

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

```bash
# Create sample blog posts and setup files
npm run setup
```

### 3. Development

```bash
# Start development server
npm run dev

# Generate a new AI blog post
npm run generate-post

# Build for production
npm run build
npm run export
```

### 4. Deployment

#### GitHub Pages
1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. Set up GitHub secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SITE_URL`: Your GitHub Pages URL

#### Vercel (Optional)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

## 🔧 Configuration

### Environment Variables

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here
SITE_URL=https://yourdomain.github.io

# Optional
NEXT_PUBLIC_GA_ID=your_google_analytics_id
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
# Generate a single post
npm run generate-post

# Posts are automatically created in src/content/
```

## 🚀 Deployment & Automation

### GitHub Actions

The included workflow (`deploy.yml`) automatically:
- Generates new content daily at 9 AM UTC
- Builds and deploys to GitHub Pages
- Updates sitemap and RSS feed
- Commits new content to repository

### Manual Deployment

```bash
# Build and export
npm run build
npm run export

# Deploy to GitHub Pages
npm run deploy
```

## 📊 Analytics & SEO

### Google Analytics
Add your GA tracking ID to `.env.local`:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### SEO Features
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
