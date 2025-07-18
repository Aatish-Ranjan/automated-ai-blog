# Local AI Blog Generation Setup Guide

## 🚀 **Complete Setup Instructions**

### **Step 1: Install Ollama**
1. Download Ollama from: https://ollama.com/download
2. Install and run: `ollama serve`
3. Download a model: `ollama pull llama3.1:8b` (or `mistral`, `codellama`)

### **Step 2: Install Dependencies**
```bash
npm install axios  # For local model API calls
```

### **Step 3: Test Local Generation**
```bash
# Test with local model
npm run generate-post-local

# Test full automation
npm run auto-blog
```

### **Step 4: Set up Windows Task Scheduler**

1. **Open Task Scheduler**
2. **Create Basic Task**:
   - Name: "AI Blog Generator"
   - Description: "Daily automated blog post generation"
   - Trigger: Daily at your preferred time (e.g., 9:00 AM)
   - Action: Start a program
   - Program: `D:\ai-blog-website\scripts\daily-blog-automation.bat`

### **Step 5: Alternative - Cron Job (Linux/Mac)**
```bash
# Edit crontab
crontab -e

# Add this line for daily 9 AM execution
0 9 * * * cd /path/to/ai-blog-website && node scripts/automated-blog-generator.js
```

## 🔄 **How It Works**

1. **Local Model** generates SEO-optimized content
2. **Automation Script** creates markdown files
3. **Git Commands** commit and push to GitHub
4. **GitHub Actions** automatically deploy to your website

## 🛠️ **Available Commands**

- `npm run generate-post-local` - Generate single post with local model
- `npm run auto-blog` - Full automation (generate + push)
- `npm run dev` - Start development server
- `npm run build` - Build for production

## 📊 **Models You Can Use**

- **llama3.1:8b** - Best quality, slower
- **mistral** - Good balance of speed/quality
- **codellama** - Great for technical content
- **phi3** - Fastest, smaller model

## 🔧 **Configuration**

Edit `scripts/generate-post-local.js`:
- Change `MODEL_NAME` to your preferred model
- Adjust `TOPICS` array for your niche
- Modify `CONTENT_TYPES` for different article styles

## 📈 **Benefits**

- ✅ **Free** - No API costs
- ✅ **Private** - Data stays local
- ✅ **Fast** - No rate limits
- ✅ **Reliable** - No internet dependency for generation
- ✅ **Customizable** - Full control over prompts and models

## 🔍 **Troubleshooting**

- **Ollama not running**: Start with `ollama serve`
- **Model not found**: Download with `ollama pull MODEL_NAME`
- **Git push fails**: Check GitHub authentication
- **JSON parsing error**: Model output may need cleaning

## 🚨 **Important Notes**

1. Update `BLOG_DIR` path in `automated-blog-generator.js`
2. Ensure GitHub authentication is set up
3. Keep Ollama running for automated generation
4. Monitor logs in `logs/` directory for errors

Your AI blog will now generate content locally and deploy automatically! 🎉
