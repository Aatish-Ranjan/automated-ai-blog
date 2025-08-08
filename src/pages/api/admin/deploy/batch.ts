import { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { changes } = req.body;

    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ message: 'Invalid changes data' });
    }

    // Create deployment log
    const deploymentLog = {
      timestamp: new Date().toISOString(),
      changes: changes.map(change => ({
        type: change.type,
        description: change.description,
        timestamp: new Date(change.timestamp).toISOString(),
      })),
      status: 'deployed',
    };

    // Save deployment log
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logFile = path.join(logsDir, `deployment-${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(deploymentLog, null, 2));

    // Create commit message
    const changesSummary = changes.map(c => `${c.type}: ${c.description}`).join('; ');
    const commitMessage = `Admin: Batch deployment - ${changesSummary}`;

    try {
      // Git operations
      execSync('git add .', { cwd: process.cwd() });
      
      // Check if there are any changes to commit
      try {
        execSync('git diff --cached --exit-code', { cwd: process.cwd() });
        // No changes to commit
        return res.json({ 
          success: true, 
          message: 'No changes to deploy',
          deploymentId: path.basename(logFile, '.json')
        });
      } catch (diffError) {
        // There are changes, continue with commit
      }

      execSync(`git commit -m "${commitMessage}"`, { cwd: process.cwd() });
      
      // Try to push to remote
      try {
        execSync('git push', { cwd: process.cwd() });
        console.log('Successfully pushed to remote repository');
      } catch (pushError) {
        console.warn('Could not push to remote repository:', pushError);
        // Don't fail the deployment if push fails - changes are still saved locally
      }

      res.json({ 
        success: true, 
        message: 'Batch deployment completed successfully',
        deploymentId: path.basename(logFile, '.json'),
        changeCount: changes.length
      });

    } catch (gitError) {
      console.error('Git operation failed:', gitError);
      
      // Even if git fails, the changes are still saved
      res.json({ 
        success: true, 
        message: 'Changes saved successfully (git operations may have failed)',
        deploymentId: path.basename(logFile, '.json'),
        changeCount: changes.length,
        warning: 'Git operations failed, changes saved locally only'
      });
    }

  } catch (error) {
    console.error('Batch deployment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Batch deployment failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
