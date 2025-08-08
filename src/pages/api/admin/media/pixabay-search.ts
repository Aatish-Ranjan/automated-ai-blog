import { NextApiRequest, NextApiResponse } from 'next';

const PIXABAY_API_KEY = '51685291-3b4ae02a69eab1412b0961b63';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    try {
      const searchUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(q)}&image_type=photo&orientation=all&category=&min_width=1920&min_height=1080&per_page=20&safesearch=true`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Pixabay API error');
      }

      res.json(data);
    } catch (error) {
      console.error('Pixabay search error:', error);
      res.status(500).json({ error: 'Failed to search Pixabay' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
