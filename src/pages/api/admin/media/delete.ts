import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    try {
      const publicDir = path.join(process.cwd(), 'public');
      const imagesDir = path.join(publicDir, 'images');
      const filePath = path.join(imagesDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete the file
      fs.unlinkSync(filePath);

      res.json({ 
        success: true, 
        message: 'File deleted successfully',
        filename 
      });

    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
