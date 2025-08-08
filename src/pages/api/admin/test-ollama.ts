import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { model } = req.body;

    // Test Ollama connection
    exec('ollama ps', (error, stdout, stderr) => {
      if (error) {
        return res.json({ 
          success: false, 
          message: 'Ollama server not running or not accessible' 
        });
      }

      // Check if the specific model is available
      exec(`ollama list`, (listError, listStdout) => {
        if (listError) {
          return res.json({ 
            success: false, 
            message: 'Could not list available models' 
          });
        }

        const hasModel = listStdout.includes(model || 'ai-blog-writer-1b');
        
        res.json({ 
          success: hasModel,
          message: hasModel 
            ? `Model '${model}' is available and ready`
            : `Model '${model}' not found. Available models: ${listStdout.split('\n').slice(1, -1).map(line => line.split(' ')[0]).join(', ')}`
        });
      });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
