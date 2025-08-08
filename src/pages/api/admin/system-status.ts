import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

interface SystemStatus {
  ollama: boolean;
  pixabay: boolean;
  git: boolean;
  lastGeneration: string | null;
  totalPosts: number;
  lastCommit: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const status: SystemStatus = {
      ollama: false,
      pixabay: false,
      git: false,
      lastGeneration: null,
      totalPosts: 0,
      lastCommit: null,
    };

    // Check Ollama status (using your existing workflow)
    try {
      const { stdout } = await execAsync('ollama ps');
      status.ollama = stdout.includes('ai-blog-writer-1b') || stdout.trim().length > 0;
    } catch (error) {
      status.ollama = false;
    }

    // Check Pixabay API (using environment variable like your script does)
    status.pixabay = !!process.env.PIXABAY_API_KEY;

    // Check Git status
    try {
      await execAsync('git status');
      status.git = true;
    } catch (error) {
      status.git = false;
    }

    // Count total blog posts
    try {
      const contentDir = path.join(process.cwd(), 'src/content');
      if (fs.existsSync(contentDir)) {
        const files = fs.readdirSync(contentDir);
        status.totalPosts = files.filter(file => file.endsWith('.md')).length;
      }
    } catch (error) {
      status.totalPosts = 0;
    }

    // Get last commit info
    try {
      const { stdout } = await execAsync('git log -1 --format="%cr"');
      status.lastCommit = stdout.trim().replace(/"/g, '');
    } catch (error) {
      status.lastCommit = null;
    }

    // Check for generation lock file (if exists from your scripts)
    const lockFile = path.join(process.cwd(), '.generation-lock');
    const lastGenFile = path.join(process.cwd(), '.last-generation');
    
    if (fs.existsSync(lastGenFile)) {
      try {
        const lastGen = fs.readFileSync(lastGenFile, 'utf8');
        status.lastGeneration = new Date(lastGen).toLocaleString();
      } catch (error) {
        status.lastGeneration = null;
      }
    }

    res.status(200).json(status);
  } catch (error) {
    console.error('System status check failed:', error);
    res.status(500).json({ error: 'Failed to check system status' });
  }
}
