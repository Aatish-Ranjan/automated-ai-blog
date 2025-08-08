import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const imagesDir = path.join(publicDir, 'images');

      // Create images directory if it doesn't exist
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
        return res.json({ files: [] });
      }

      // Read all files in the images directory
      const files = fs.readdirSync(imagesDir)
        .filter(file => {
          // Only include common image formats
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        })
        .map(file => {
          const filePath = path.join(imagesDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            name: file,
            path: filePath,
            size: stats.size,
            lastModified: stats.mtime.toLocaleDateString(),
            url: `/images/${file}`, // Public URL for the image
          };
        })
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

      res.json({ files });
    } catch (error) {
      console.error('Error reading local files:', error);
      res.status(500).json({ error: 'Failed to read local files' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
