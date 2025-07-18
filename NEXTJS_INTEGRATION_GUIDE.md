# Next.js Integration Guide for AI Blog Writer

## Overview
This guide shows how to integrate the custom AI blog writer model (`ai-blog-writer-1b`) with your Next.js application for automated blog content generation.

## Prerequisites
- ✅ Ollama installed and running on D:\ollama-models
- ✅ Custom model `ai-blog-writer-1b` created and tested
- ✅ Next.js application set up in `d:\ai-blog-website`

## Step 1: Install Required Dependencies

```bash
npm install axios
npm install @types/node (if using TypeScript)
```

## Step 2: Create Ollama API Service

Create `src/services/ollamaService.ts`:

```typescript
interface BlogGenerationRequest {
  topic: string;
  audience?: string;
  length?: number;
  tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  includeIntro?: boolean;
  includeConclusion?: boolean;
}

interface BlogGenerationResponse {
  content: string;
  wordCount: number;
  generationTime: number;
}

class OllamaService {
  private baseUrl = 'http://localhost:11434';
  private model = 'ai-blog-writer-1b';

  async generateBlogPost(request: BlogGenerationRequest): Promise<BlogGenerationResponse> {
    const startTime = Date.now();
    
    const prompt = this.buildPrompt(request);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const content = data.response;
      const wordCount = content.split(' ').length;
      const generationTime = Date.now() - startTime;

      return {
        content,
        wordCount,
        generationTime,
      };
    } catch (error) {
      console.error('Error generating blog post:', error);
      throw new Error('Failed to generate blog post');
    }
  }

  async generateBlogPostStream(
    request: BlogGenerationRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const prompt = this.buildPrompt(request);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                onChunk(data.response);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in stream generation:', error);
      throw error;
    }
  }

  private buildPrompt(request: BlogGenerationRequest): string {
    const {
      topic,
      audience = 'general readers',
      length = 500,
      tone = 'professional',
      includeIntro = true,
      includeConclusion = true,
    } = request;

    let prompt = `Write a ${length}-word blog post about "${topic}" for ${audience}. `;
    prompt += `Use a ${tone} tone. `;
    
    if (includeIntro) {
      prompt += 'Include an engaging introduction that hooks the reader. ';
    }
    
    if (includeConclusion) {
      prompt += 'End with a strong conclusion that reinforces key points. ';
    }
    
    prompt += 'Use clear headings and subheadings for better readability. ';
    prompt += 'Make the content SEO-friendly with natural keyword integration.';

    return prompt;
  }

  async checkModelAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.models?.some((model: any) => model.name === this.model) || false;
    } catch {
      return false;
    }
  }
}

export const ollamaService = new OllamaService();
export type { BlogGenerationRequest, BlogGenerationResponse };
```

## Step 3: Create API Routes

Create `src/pages/api/generate-blog.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { ollamaService, BlogGenerationRequest } from '../../services/ollamaService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const request: BlogGenerationRequest = req.body;
    
    // Validate request
    if (!request.topic || request.topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Check if model is available
    const modelAvailable = await ollamaService.checkModelAvailability();
    if (!modelAvailable) {
      return res.status(503).json({ 
        error: 'AI model is not available. Please ensure Ollama is running.' 
      });
    }

    const result = await ollamaService.generateBlogPost(request);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate blog post',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

## Step 4: Create Blog Generation Component

Create `src/components/BlogGenerator.tsx`:

```typescript
import React, { useState } from 'react';
import { BlogGenerationRequest } from '../services/ollamaService';

interface BlogGeneratorProps {
  onBlogGenerated?: (content: string) => void;
}

export const BlogGenerator: React.FC<BlogGeneratorProps> = ({ onBlogGenerated }) => {
  const [formData, setFormData] = useState<BlogGenerationRequest>({
    topic: '',
    audience: 'general readers',
    length: 500,
    tone: 'professional',
    includeIntro: true,
    includeConclusion: true,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setGeneratedContent('');

    try {
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate blog post');
      }

      const content = result.data.content;
      setGeneratedContent(content);
      onBlogGenerated?.(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: keyof BlogGenerationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">AI Blog Generator</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blog Topic *
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            placeholder="Enter your blog topic..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select
              value={formData.audience}
              onChange={(e) => handleInputChange('audience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general readers">General Readers</option>
              <option value="small business owners">Small Business Owners</option>
              <option value="developers">Developers</option>
              <option value="marketers">Marketers</option>
              <option value="students">Students</option>
              <option value="professionals">Professionals</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              value={formData.tone}
              onChange={(e) => handleInputChange('tone', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="technical">Technical</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Word Count: {formData.length}
          </label>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={formData.length}
            onChange={(e) => handleInputChange('length', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>200</span>
            <span>2000</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.includeIntro}
              onChange={(e) => handleInputChange('includeIntro', e.target.checked)}
              className="mr-2"
            />
            Include Introduction
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.includeConclusion}
              onChange={(e) => handleInputChange('includeConclusion', e.target.checked)}
              className="mr-2"
            />
            Include Conclusion
          </label>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !formData.topic.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Blog Post'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {generatedContent && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Generated Content:</h3>
          <div className="p-4 bg-gray-50 border rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
          </div>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={() => navigator.clipboard.writeText(generatedContent)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => setGeneratedContent('')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Step 5: Update Your Main Page

Update `src/pages/index.tsx`:

```typescript
import Head from 'next/head';
import { BlogGenerator } from '../components/BlogGenerator';

export default function Home() {
  const handleBlogGenerated = (content: string) => {
    console.log('Blog generated:', content);
    // You can add logic here to save to database, show preview, etc.
  };

  return (
    <>
      <Head>
        <title>AI Blog Website</title>
        <meta name="description" content="Generate blog content with AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            AI Blog Content Generator
          </h1>
          <BlogGenerator onBlogGenerated={handleBlogGenerated} />
        </div>
      </main>
    </>
  );
}
```

## Step 6: Start Development

1. **Ensure Ollama is running:**
   ```bash
   ollama serve
   ```

2. **Start your Next.js development server:**
   ```bash
   npm run dev
   ```

3. **Visit your application:**
   - Open http://localhost:3000
   - Test the blog generation functionality

## Step 7: Production Considerations

### Environment Variables
Create `.env.local`:
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=ai-blog-writer-1b
```

### Docker Deployment (Optional)
If deploying with Docker, ensure Ollama is accessible from your container.

### Performance Optimization
- Implement caching for frequently requested topics
- Add request queuing for high traffic
- Consider implementing rate limiting

## Troubleshooting

### Common Issues:
1. **Ollama not responding**: Ensure `ollama serve` is running
2. **Model not found**: Verify model name matches exactly
3. **CORS issues**: Add proper headers if needed
4. **Memory issues**: Monitor system resources during generation

### Debug Commands:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test model directly
ollama run ai-blog-writer-1b "test prompt"

# Check system resources
Get-Process ollama
```

This integration provides a solid foundation for incorporating your custom AI blog writer into your Next.js application, enabling automated content generation with a user-friendly interface.
