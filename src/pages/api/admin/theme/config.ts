import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const themeConfigPath = path.join(process.cwd(), '.theme-config.json');
const themeCSSPath = path.join(process.cwd(), 'src', 'styles', 'theme.css');

const defaultTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6366f1',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'Inter, system-ui, sans-serif',
    fontSize: {
      base: '16px',
      sm: '14px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
    },
    lineHeight: '1.6',
  },
  layout: {
    borderRadius: '8px',
    spacing: '1rem',
    maxWidth: '1200px',
    headerHeight: '64px',
  },
  theme: 'light',
  customCSS: '',
};

function generateCSS(config: any) {
  return `/* Auto-generated theme CSS - Do not edit manually */
:root {
  --color-primary: ${config.colors.primary};
  --color-secondary: ${config.colors.secondary};
  --color-accent: ${config.colors.accent};
  --color-background: ${config.colors.background};
  --color-surface: ${config.colors.surface};
  --color-text: ${config.colors.text};
  --color-text-secondary: ${config.colors.textSecondary};
  
  --font-family: ${config.typography.fontFamily};
  --font-heading: ${config.typography.headingFont};
  --font-size-base: ${config.typography.fontSize.base};
  --font-size-sm: ${config.typography.fontSize.sm};
  --font-size-lg: ${config.typography.fontSize.lg};
  --font-size-xl: ${config.typography.fontSize.xl};
  --font-size-2xl: ${config.typography.fontSize['2xl']};
  --line-height: ${config.typography.lineHeight};
  
  --border-radius: ${config.layout.borderRadius};
  --spacing: ${config.layout.spacing};
  --max-width: ${config.layout.maxWidth};
  --header-height: ${config.layout.headerHeight};
}

/* Apply theme mode */
${config.theme === 'dark' ? `
:root {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f1f5f9;
  --color-text-secondary: #cbd5e1;
}
` : ''}

/* Global theme application */
body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  color: var(--color-text);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

/* Theme-aware components */
.theme-primary {
  color: var(--color-primary);
}

.theme-bg-primary {
  background-color: var(--color-primary);
}

.theme-secondary {
  color: var(--color-secondary);
}

.theme-bg-secondary {
  background-color: var(--color-secondary);
}

.theme-accent {
  color: var(--color-accent);
}

.theme-bg-accent {
  background-color: var(--color-accent);
}

.theme-surface {
  background-color: var(--color-surface);
}

.theme-text {
  color: var(--color-text);
}

.theme-text-secondary {
  color: var(--color-text-secondary);
}

.theme-rounded {
  border-radius: var(--border-radius);
}

.theme-container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--spacing);
}

/* Button theme overrides */
.btn-theme-primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-theme-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-theme-secondary {
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-theme-secondary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-theme-outline {
  background-color: transparent;
  border-color: var(--color-primary);
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-theme-outline:hover {
  background-color: var(--color-primary);
  color: white;
}

/* Card theme */
.theme-card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
  padding: var(--spacing);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Navigation theme */
.theme-nav {
  background-color: var(--color-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: var(--header-height);
}

/* Auto dark mode support */
@media (prefers-color-scheme: dark) {
  ${config.theme === 'auto' ? `
  :root {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text: #f1f5f9;
    --color-text-secondary: #cbd5e1;
  }
  ` : ''}
}

/* Custom CSS from user */
${config.customCSS}
`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      let config = defaultTheme;
      
      if (fs.existsSync(themeConfigPath)) {
        const fileContent = fs.readFileSync(themeConfigPath, 'utf8');
        const savedConfig = JSON.parse(fileContent);
        config = { ...defaultTheme, ...savedConfig };
      }

      res.json({ config });
    } catch (error) {
      console.error('Error reading theme config:', error);
      res.json({ config: defaultTheme });
    }
  } else if (req.method === 'POST') {
    try {
      const { config } = req.body;
      
      // Save theme configuration
      fs.writeFileSync(themeConfigPath, JSON.stringify(config, null, 2));
      
      // Generate and save CSS file
      const cssContent = generateCSS(config);
      
      // Ensure styles directory exists
      const stylesDir = path.dirname(themeCSSPath);
      if (!fs.existsSync(stylesDir)) {
        fs.mkdirSync(stylesDir, { recursive: true });
      }
      
      fs.writeFileSync(themeCSSPath, cssContent);
      
      res.json({ success: true, message: 'Theme configuration saved successfully' });
    } catch (error) {
      console.error('Error saving theme config:', error);
      res.status(500).json({ success: false, message: 'Failed to save theme configuration' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
