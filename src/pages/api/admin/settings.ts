import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Default settings
const defaultSettings = {
  siteName: 'AI Powered Blog',
  siteDescription: 'Automated blog powered by AI technology',
  pixabayApiKey: '51685291-3b4ae02a69eab1412b0961b63',
  ollamaModel: 'ai-blog-writer-1b',
  autoPublish: true,
  deploymentBranch: 'main',
  maxPostsPerPage: 10,
};

const settingsPath = path.join(process.cwd(), '.admin-settings.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      let settings = defaultSettings;
      
      // Try to read existing settings
      if (fs.existsSync(settingsPath)) {
        const fileContent = fs.readFileSync(settingsPath, 'utf8');
        const savedSettings = JSON.parse(fileContent);
        settings = { ...defaultSettings, ...savedSettings };
      }

      res.json({ settings });
    } catch (error) {
      console.error('Error reading settings:', error);
      res.json({ settings: defaultSettings });
    }
  } else if (req.method === 'POST') {
    try {
      const { settings } = req.body;
      
      // Handle password change separately
      if (settings.adminPassword && settings.adminPassword.trim()) {
        const envPath = path.join(process.cwd(), '.env.local');
        let envContent = '';
        
        // Read existing .env.local if it exists
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Update or add ADMIN_PASSWORD
        const lines = envContent.split('\n');
        let passwordUpdated = false;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('ADMIN_PASSWORD=')) {
            lines[i] = `ADMIN_PASSWORD=${settings.adminPassword}`;
            passwordUpdated = true;
            break;
          }
        }
        
        // If password line doesn't exist, add it
        if (!passwordUpdated) {
          if (!envContent.includes('# Admin Portal Configuration')) {
            lines.unshift('# Admin Portal Configuration');
          }
          lines.splice(1, 0, `ADMIN_PASSWORD=${settings.adminPassword}`);
        }
        
        // Write updated .env.local
        fs.writeFileSync(envPath, lines.join('\n'));
      }
      
      // Don't save password in settings file
      const settingsToSave = { ...settings };
      delete settingsToSave.adminPassword;

      // Save other settings to file
      fs.writeFileSync(settingsPath, JSON.stringify(settingsToSave, null, 2));
      
      res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ success: false, message: 'Failed to save settings' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
