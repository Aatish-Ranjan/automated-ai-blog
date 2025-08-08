import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Get recent git commits
      const { stdout } = await execAsync('git log --oneline -10 --format="%H|%s|%an|%cr"', {
        cwd: process.cwd()
      });

      const logs = stdout.trim().split('\n').map(line => {
        const [hash, message, author, date] = line.split('|');
        return {
          hash: hash?.substring(0, 8) || '',
          message: message || 'No message',
          author: author || 'Unknown',
          date: date || 'Unknown time',
        };
      }).filter(log => log.hash); // Filter out empty entries

      res.json({ logs });
    } catch (error) {
      console.error('Error getting git logs:', error);
      res.json({ logs: [] });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
