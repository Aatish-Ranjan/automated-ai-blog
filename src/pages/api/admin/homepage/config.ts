import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Default homepage configuration
const defaultConfig = {
  hero: {
    title: 'AI Powered Blog',
    subtitle: 'Discover the latest insights in technology, AI, and innovation',
    backgroundImage: '',
    showNewsletter: true,
    ctaText: 'Explore Articles',
    ctaLink: '#featured',
  },
  featured: {
    enabled: true,
    title: 'Featured Articles',
    subtitle: 'Hand-picked stories worth your time',
    maxPosts: 3,
    layout: 'grid',
    posts: [],
  },
  recent: {
    enabled: true,
    title: 'Latest Posts',
    maxPosts: 6,
    showExcerpts: true,
  },
  layout: {
    template: 'blog',
    sidebar: true,
    containerWidth: 'normal',
  },
};

const configPath = path.join(process.cwd(), '.homepage-config.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      let config = defaultConfig;
      
      // Try to read existing config
      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const savedConfig = JSON.parse(fileContent);
        config = { ...defaultConfig, ...savedConfig };
      }

      res.json({ config });
    } catch (error) {
      console.error('Error reading homepage config:', error);
      res.json({ config: defaultConfig });
    }
  } else if (req.method === 'POST') {
    try {
      const { config } = req.body;
      
      // Save config to file
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      // Also update the actual homepage data file used by the website
      updateHomepageDataFile(config);
      
      res.json({ success: true, message: 'Homepage configuration saved successfully' });
    } catch (error) {
      console.error('Error saving homepage config:', error);
      res.status(500).json({ success: false, message: 'Failed to save configuration' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

function updateHomepageDataFile(config: any) {
  try {
    // Create a data file that the homepage can use
    const homepageDataPath = path.join(process.cwd(), 'src', 'data', 'homepage-config.json');
    
    // Ensure the data directory exists
    const dataDir = path.dirname(homepageDataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(homepageDataPath, JSON.stringify(config, null, 2));
    
    // Git commit the changes
    const { exec } = require('child_process');
    exec(`powershell -ExecutionPolicy Bypass -Command "cd d:\\ai-blog-website; git add .; git commit -m 'Homepage configuration updated via admin portal'; git push origin main"`, 
      (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error('Git commit error:', error);
        } else {
          console.log('Homepage config committed to git');
        }
      }
    );
    
  } catch (error) {
    console.error('Error updating homepage data file:', error);
  }
}
