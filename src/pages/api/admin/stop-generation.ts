import { NextApiRequest, NextApiResponse } from 'next';

let generationProcess: any = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      if (generationProcess && generationProcess.pid) {
        // Kill the PowerShell process
        const { exec } = require('child_process');
        exec(`taskkill /PID ${generationProcess.pid} /T /F`, (error: any) => {
          if (error) {
            console.error('Error stopping generation:', error);
          }
        });
        
        generationProcess = null;
      }

      // Update status (would need to import the shared status object)
      res.json({ 
        success: true, 
        message: 'Generation stopped successfully' 
      });

    } catch (error) {
      console.error('Error stopping generation:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to stop generation' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
