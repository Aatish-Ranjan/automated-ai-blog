import { NextApiRequest, NextApiResponse } from 'next';
import { generateRSSFeed } from '@/lib/rss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const feed = await generateRSSFeed();
    
    res.setHeader('Content-Type', 'application/rss+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    return res.status(200).send(feed);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return res.status(500).json({ message: 'Error generating RSS feed' });
  }
}
