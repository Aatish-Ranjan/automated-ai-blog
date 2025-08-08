import { NextApiRequest, NextApiResponse } from 'next';

// This is shared across the module - in production you'd use Redis or similar
let generationStatus = {
  isGenerating: false,
  progress: '',
  logs: [] as string[],
  lastGeneration: null as string | null,
};

// Import the same status object from generate-content.ts
export { generationStatus };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Check if there are any recent log files we can read
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Try to read the most recent generation info from the data directory
      const dataDir = path.join(process.cwd(), 'src', 'data');
      if (fs.existsSync(dataDir)) {
        const files = fs.readdirSync(dataDir)
          .filter((file: string) => file.endsWith('.md'))
          .map((file: string) => ({
            name: file,
            time: fs.statSync(path.join(dataDir, file)).mtime.getTime()
          }))
          .sort((a: any, b: any) => b.time - a.time);

        if (files.length > 0 && !generationStatus.lastGeneration) {
          const lastFile = files[0];
          generationStatus.lastGeneration = new Date(lastFile.time).toLocaleString();
        }
      }
    } catch (error) {
      console.error('Error checking last generation:', error);
    }

    res.json(generationStatus);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
