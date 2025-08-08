import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Set up streaming response for real-time logs
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const sendLog = (message: string) => {
      res.write(`${message}\n`);
    };

    sendLog('🚀 Starting deployment process...');
    
    // Run the deployment command (git add, commit, push)
    const deployProcess = exec('powershell.exe -ExecutionPolicy Bypass -Command "cd d:\\ai-blog-website; git add .; git commit -m \\"Manual deployment from admin panel\\"; git push origin main"', {
      cwd: 'd:\\ai-blog-website'
    });

    deployProcess.stdout?.on('data', (data) => {
      sendLog(`📤 ${data.toString().trim()}`);
    });

    deployProcess.stderr?.on('data', (data) => {
      sendLog(`⚠️ ${data.toString().trim()}`);
    });

    deployProcess.on('close', (code) => {
      if (code === 0) {
        sendLog('✅ Git operations completed successfully!');
        sendLog('🌐 Vercel will automatically deploy the changes...');
        sendLog('📱 Check https://smartiyo.com in a few minutes for updates');
      } else {
        sendLog(`❌ Deployment failed with exit code ${code}`);
      }
      res.end();
    });

    deployProcess.on('error', (error) => {
      sendLog(`❌ Deployment error: ${error.message}`);
      res.end();
    });

  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
