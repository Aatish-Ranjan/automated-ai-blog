import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import https from 'https';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { imageUrl, filename, tags } = req.body;

    if (!imageUrl || !filename) {
      return res.status(400).json({ error: 'Image URL and filename are required' });
    }

    try {
      const publicDir = path.join(process.cwd(), 'public');
      const imagesDir = path.join(publicDir, 'images');

      // Create images directory if it doesn't exist
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const filePath = path.join(imagesDir, filename);

      // Download the image
      const file = fs.createWriteStream(filePath);

      https.get(imageUrl, (response) => {
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          res.json({ 
            success: true, 
            message: 'Image downloaded successfully',
            filename,
            url: `/images/${filename}`,
            tags 
          });
        });

        file.on('error', (error) => {
          fs.unlink(filePath, () => {}); // Delete the incomplete file
          console.error('File write error:', error);
          res.status(500).json({ error: 'Failed to save image' });
        });
      }).on('error', (error) => {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download image' });
      });

    } catch (error) {
      console.error('Error downloading Pixabay image:', error);
      res.status(500).json({ error: 'Failed to download image' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
