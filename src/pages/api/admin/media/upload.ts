import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // For now, we'll return a message that upload will be implemented via drag & drop
    // In a real implementation, you'd use formidable or similar for file uploads
    res.status(501).json({ 
      error: 'Direct upload not implemented yet. Please use drag & drop in the interface or download from Pixabay.' 
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
