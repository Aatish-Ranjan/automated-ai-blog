import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if automation is already running
    const lockFile = path.join(process.cwd(), '.generation-lock');
    if (fs.existsSync(lockFile)) {
      return res.status(409).json({ 
        success: false, 
        message: 'Automation is already running. Please wait for it to complete.' 
      });
    }

    // Create lock file to prevent concurrent runs
    fs.writeFileSync(lockFile, new Date().toISOString());

    // Save timestamp for last generation tracking
    const lastGenFile = path.join(process.cwd(), '.last-generation');
    fs.writeFileSync(lastGenFile, new Date().toISOString());

    // Trigger your existing PowerShell automation script
    // This is the SAME script your desktop shortcut uses
    const scriptPath = path.join(process.cwd(), 'generate-and-deploy.ps1');
    
    if (!fs.existsSync(scriptPath)) {
      // Fallback to npm script if PowerShell script not found
      execAsync('npm run auto-post')
        .then(() => {
          // Clean up lock file on completion
          if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
          }
        })
        .catch((error) => {
          console.error('Auto-post failed:', error);
          // Clean up lock file on error
          if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
          }
        });
    } else {
      // Use your existing PowerShell script
      execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`)
        .then(() => {
          // Clean up lock file on completion
          if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
          }
        })
        .catch((error) => {
          console.error('PowerShell automation failed:', error);
          // Clean up lock file on error
          if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
          }
        });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Desktop automation triggered successfully! This uses your existing workflow.' 
    });

  } catch (error) {
    console.error('Failed to trigger automation:', error);
    
    // Clean up lock file on error
    const lockFile = path.join(process.cwd(), '.generation-lock');
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to trigger automation' 
    });
  }
}
