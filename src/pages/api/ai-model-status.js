// API route to check AI model status
import LocalAIBlogService from '../../lib/localAIBlogService';

const aiService = new LocalAIBlogService();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const available = await aiService.checkModelAvailability();
    
    res.status(200).json({
      available,
      model: 'ai-blog-writer-1b',
      status: available ? 'ready' : 'offline',
      message: available 
        ? 'AI model is ready for blog generation'
        : 'AI model is not available. Please ensure Ollama is running.',
    });

  } catch (error) {
    console.error('Model status check error:', error);
    res.status(500).json({ 
      available: false,
      error: 'Failed to check model status',
      details: error.message
    });
  }
}
