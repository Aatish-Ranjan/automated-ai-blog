import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (typeof slug !== 'string') {
    return res.status(400).json({ message: 'Invalid slug' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Find the file
    const contentDir = path.join(process.cwd(), 'src/content');
    const files = fs.readdirSync(contentDir);
    const file = files.find(f => f.includes(slug));

    if (!file) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { content } = matter(fileContent);

    res.status(200).json({ content });

  } catch (error) {
    console.error('Failed to load post content:', error);
    res.status(500).json({ error: 'Failed to load post content' });
  }
}
