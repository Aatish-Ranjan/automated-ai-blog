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
      
      // Don't save empty password
      const settingsToSave = { ...settings };
      if (!settingsToSave.adminPassword) {
        delete settingsToSave.adminPassword;
      }

      // Save settings to file
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
