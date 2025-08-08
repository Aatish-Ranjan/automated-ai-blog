import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message } = req.body;
    const commitMessage = message || 'Admin panel update';

    // Execute git commands
    const gitCommand = `powershell.exe -ExecutionPolicy Bypass -Command "cd d:\\ai-blog-website; git add .; git commit -m \\"${commitMessage}\\"; git push origin main"`;

    exec(gitCommand, { cwd: 'd:\\ai-blog-website' }, (error, stdout, stderr) => {
      if (error) {
        console.error('Git commit error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to commit changes',
          error: error.message 
        });
      }

      res.json({ 
        success: true, 
        message: 'Changes committed and pushed successfully',
        output: stdout 
      });
    });

  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
