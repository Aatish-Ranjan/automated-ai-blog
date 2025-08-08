import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (typeof slug !== 'string') {
    return res.status(400).json({ message: 'Invalid slug' });
  }

  switch (req.method) {
    case 'DELETE':
      return handleDelete(slug, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleDelete(slug: string, res: NextApiResponse) {
  try {
    // Find the file
    const contentDir = path.join(process.cwd(), 'src/content');
    const files = fs.readdirSync(contentDir);
    const file = files.find(f => f.includes(slug));

    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const filePath = path.join(contentDir, file);
    
    // Get post title for commit message
    const content = fs.readFileSync(filePath, 'utf8');
    const titleMatch = content.match(/title:\s*['"](.+?)['"]/);
    const title = titleMatch ? titleMatch[1] : 'Unknown post';

    // Delete the file
    fs.unlinkSync(filePath);

    // Auto-commit and deploy (same as your workflow)
    await autoCommitAndDeploy(`Delete post: ${title}`);

    res.status(200).json({ 
      success: true, 
      message: 'Post deleted and changes deployed successfully' 
    });

  } catch (error) {
    console.error('Failed to delete post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete post' 
    });
  }
}

async function autoCommitAndDeploy(message: string) {
  try {
    await execAsync('git add .');
    await execAsync(`git commit -m "${message}"`);
    await execAsync('git push');
    console.log('Auto-commit and deploy completed');
  } catch (error) {
    console.error('Auto-commit failed:', error);
  }
}
