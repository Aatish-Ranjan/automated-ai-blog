import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { apiKey } = req.body;

    try {
      // Test Pixabay API with a simple search
      const testUrl = `https://pixabay.com/api/?key=${apiKey}&q=test&image_type=photo&per_page=3`;
      
      const response = await fetch(testUrl);
      const data = await response.json();

      if (response.ok && data.hits) {
        res.json({ 
          success: true, 
          message: `Pixabay API working. Found ${data.totalHits} images available.`
        });
      } else {
        res.json({ 
          success: false, 
          message: data.error || 'Invalid API key or API error' 
        });
      }
    } catch (error) {
      res.json({ 
        success: false, 
        message: 'Failed to connect to Pixabay API' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
