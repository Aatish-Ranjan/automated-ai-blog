# 🚀 Quick Start: Train Your AI Blog Model

## 📋 **Prerequisites**

✅ **Ollama installed and running**
✅ **Node.js installed** 
✅ **Basic model downloaded** (llama3.1:8b recommended)

Check if everything is ready:
```powershell
ollama list
node --version
```

## 🎯 **Method 1: Enhanced Modelfile (Recommended - 5 minutes)**

This is the **fastest and easiest** way to improve your model. It creates a custom model with better prompts and parameters.

### Step 1: Create Your Custom Model
```powershell
npm run train-modelfile
```

This will:
- Create a custom model called `ai-blog-writer`
- Use your enhanced `Modelfile` with better prompts
- Test the model automatically

### Step 2: Test Your New Model
```powershell
npm run generate-post-local
```

Your script will automatically use the new `ai-blog-writer` model!

## 🔬 **Method 2: Advanced Fine-tuning (30+ minutes)**

For more sophisticated training with your own data.

### Step 1: Prepare Training Data
```powershell
npm run create-training-data
```

### Step 2: Setup Fine-tuning Environment
```powershell
npm run train-fine-tune
```

### Step 3: Install Python Dependencies
```powershell
pip install -r requirements.txt
```

### Step 4: Run Fine-tuning
```powershell
python scripts/fine-tune-model.py
```

## 🎪 **Method 3: Complete Workflow (Both methods)**

Get the best of both worlds:

```powershell
npm run train-both
```

## 🧪 **Testing Your Models**

### Compare Model Outputs
```powershell
# Test with original model
ollama run llama3.1:8b "Write a blog post about AI automation"

# Test with your custom model  
ollama run ai-blog-writer "Write a blog post about AI automation"
```

### Generate Sample Posts
```powershell
npm run generate-post-local
```

### Check Training Logs
```powershell
type logs\\model-training.log
```

## 📊 **Quick Quality Check**

Your custom model should produce:
- ✅ More engaging, conversational tone
- ✅ Better structured content with H2 headings
- ✅ More specific examples and actionable insights
- ✅ Natural keyword integration
- ✅ Compelling hooks and conclusions

## 🔄 **Iterative Improvement**

1. **Generate content** with your model
2. **Review quality** - what's good? What needs work?
3. **Update your Modelfile** with better examples
4. **Recreate the model**: `npm run train-modelfile`
5. **Test again** and repeat

## 🛠️ **Troubleshooting**

### Model Creation Failed
```powershell
# Check if Ollama is running
ollama list

# Make sure base model exists
ollama pull llama3.1:8b
```

### Fine-tuning Issues
```powershell
# Check Python dependencies
pip list | findstr transformers

# Verify training data exists
dir training-data-complete.jsonl
```

### No Improvement in Quality
- Update your `Modelfile` with more specific examples
- Try different temperature settings (0.6-0.9)
- Add more training examples to your dataset

## 🎯 **Pro Tips**

### Customize Your Modelfile
Edit `Modelfile` to improve results:
- Add examples of your best blog posts
- Include specific writing style instructions
- Adjust temperature for creativity (0.7-0.8 recommended)

### Monitor Performance
Track your model's improvement:
- Save sample outputs before/after training
- Test with consistent prompts
- Measure engagement on published posts

### Advanced Training Data
Improve your training dataset:
- Include your highest-performing blog posts
- Add examples from successful competitors
- Create prompt-response pairs for your specific niche

## 🚀 **Next Steps**

1. **Start with Method 1** - it's fast and effective
2. **Test thoroughly** with sample generations
3. **Iterate and improve** your Modelfile
4. **Scale to Method 2** if you need more customization
5. **Monitor real performance** on your published blog

Ready to start? Run:
```powershell
npm run train-modelfile
```

Your AI writing assistant is about to get a major upgrade! 🎉
