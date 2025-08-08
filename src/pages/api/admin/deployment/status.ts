import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const status = {
        lastDeploy: null as string | null,
        deploymentUrl: 'https://smartiyo.com',
        gitStatus: {
          branch: 'main',
          lastCommit: '',
          uncommittedChanges: false,
        },
        vercelStatus: {
          status: 'ready',
          lastBuild: null as string | null,
        },
      };

      try {
        // Get current branch
        const { stdout: branchOutput } = await execAsync('git branch --show-current', {
          cwd: process.cwd()
        });
        status.gitStatus.branch = branchOutput.trim();
      } catch (error) {
        console.error('Error getting git branch:', error);
      }

      try {
        // Get last commit
        const { stdout: commitOutput } = await execAsync('git log -1 --oneline', {
          cwd: process.cwd()
        });
        status.gitStatus.lastCommit = commitOutput.trim();
      } catch (error) {
        console.error('Error getting last commit:', error);
      }

      try {
        // Check for uncommitted changes
        const { stdout: statusOutput } = await execAsync('git status --porcelain', {
          cwd: process.cwd()
        });
        status.gitStatus.uncommittedChanges = statusOutput.trim().length > 0;
      } catch (error) {
        console.error('Error checking git status:', error);
      }

      try {
        // Get last deployment time from git log
        const { stdout: deployOutput } = await execAsync('git log -1 --format="%cd" --date=relative', {
          cwd: process.cwd()
        });
        status.lastDeploy = deployOutput.trim();
      } catch (error) {
        console.error('Error getting last deploy:', error);
      }

      res.json(status);
    } catch (error) {
      console.error('Error getting deployment status:', error);
      res.status(500).json({ error: 'Failed to get deployment status' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
