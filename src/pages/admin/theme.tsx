import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: {
      base: string;
      sm: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    lineHeight: string;
  };
  layout: {
    borderRadius: string;
    spacing: string;
    maxWidth: string;
    headerHeight: string;
  };
  theme: 'light' | 'dark' | 'auto';
  customCSS: string;
}

const defaultTheme: ThemeConfig = {
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

const colorPresets = [
  {
    name: 'Default Blue',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#f59e0b',
    }
  },
  {
    name: 'Ocean Green',
    colors: {
      primary: '#059669',
      secondary: '#0d9488',
      accent: '#06b6d4',
    }
  },
  {
    name: 'Sunset Orange',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#f59e0b',
    }
  },
  {
    name: 'Purple Dreams',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#ec4899',
    }
  },
  {
    name: 'Professional Dark',
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#3b82f6',
    }
  }
];

const fontPresets = [
  { name: 'Inter (Modern)', value: 'Inter, system-ui, sans-serif' },
  { name: 'Roboto (Clean)', value: 'Roboto, system-ui, sans-serif' },
  { name: 'Open Sans (Readable)', value: 'Open Sans, system-ui, sans-serif' },
  { name: 'Lato (Elegant)', value: 'Lato, system-ui, sans-serif' },
  { name: 'Poppins (Rounded)', value: 'Poppins, system-ui, sans-serif' },
  { name: 'Playfair (Serif)', value: 'Playfair Display, Georgia, serif' },
  { name: 'Merriweather (Serif)', value: 'Merriweather, Georgia, serif' },
];

export default function ThemeCustomizer() {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultTheme);
  const [originalThemeConfig, setOriginalThemeConfig] = useState<ThemeConfig>(defaultTheme);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'preview' | 'custom'>('colors');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { addPendingChange } = useAdmin();

  useEffect(() => {
    loadThemeConfig();
  }, []);

  const loadThemeConfig = async () => {
    try {
      const response = await fetch('/api/admin/theme/config');
      if (response.ok) {
        const data = await response.json();
        const config = data.config || defaultTheme;
        setThemeConfig(config);
        setOriginalThemeConfig(config); // Store original for undo functionality
      }
    } catch (error) {
      console.error('Failed to load theme config:', error);
    }
  };

  const saveThemeConfig = async () => {
    setIsSaving(true);
    try {
      // Save locally without deployment
      const response = await fetch('/api/admin/theme/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: themeConfig }),
      });

      if (response.ok) {
        setIsDirty(false);
        
        // Add to pending changes for batch deployment
        addPendingChange({
          type: 'theme',
          description: `Theme customization changes`,
          data: { config: themeConfig },
          originalData: { config: originalThemeConfig },
        });
        
        alert('✅ Theme saved! Use "Deploy All" to publish changes.');
      } else {
        alert('Failed to save theme configuration');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Error saving theme configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const updateThemeConfig = (updates: Partial<ThemeConfig>) => {
    setThemeConfig(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const updateNestedConfig = (path: string[], value: any) => {
    setThemeConfig(prev => {
      const newConfig = { ...prev };
      let current: any = newConfig;
      
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      setIsDirty(true);
      return newConfig;
    });
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updateNestedConfig(['colors', 'primary'], preset.colors.primary);
    updateNestedConfig(['colors', 'secondary'], preset.colors.secondary);
    updateNestedConfig(['colors', 'accent'], preset.colors.accent);
  };

  const generateCSS = () => {
    return `
:root {
  --color-primary: ${themeConfig.colors.primary};
  --color-secondary: ${themeConfig.colors.secondary};
  --color-accent: ${themeConfig.colors.accent};
  --color-background: ${themeConfig.colors.background};
  --color-surface: ${themeConfig.colors.surface};
  --color-text: ${themeConfig.colors.text};
  --color-text-secondary: ${themeConfig.colors.textSecondary};
  
  --font-family: ${themeConfig.typography.fontFamily};
  --font-heading: ${themeConfig.typography.headingFont};
  --font-size-base: ${themeConfig.typography.fontSize.base};
  --line-height: ${themeConfig.typography.lineHeight};
  
  --border-radius: ${themeConfig.layout.borderRadius};
  --spacing: ${themeConfig.layout.spacing};
  --max-width: ${themeConfig.layout.maxWidth};
  --header-height: ${themeConfig.layout.headerHeight};
}

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

.btn-primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-secondary {
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
}

.text-accent {
  color: var(--color-accent);
}

${themeConfig.customCSS}
`.trim();
  };

  const tabs = [
    { id: 'colors', name: 'Colors', icon: '🎨' },
    { id: 'typography', name: 'Typography', icon: '📝' },
    { id: 'layout', name: 'Layout', icon: '📐' },
    { id: 'custom', name: 'Custom CSS', icon: '💻' },
    { id: 'preview', name: 'Preview', icon: '👀' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎨 Theme Customizer</h1>
            <p className="text-gray-600 mt-1">Customize your website's visual appearance</p>
          </div>
          <div className="flex items-center space-x-3">
            {isDirty && (
              <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                • Unsaved changes
              </span>
            )}
            <button
              onClick={saveThemeConfig}
              disabled={isSaving || !isDirty}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Theme</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Color Presets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {colorPresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => applyColorPreset(preset)}
                        className="p-4 border rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="flex space-x-2 mb-2">
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: preset.colors.primary }}
                          ></div>
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: preset.colors.secondary }}
                          ></div>
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: preset.colors.accent }}
                          ></div>
                        </div>
                        <p className="text-sm font-medium">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(themeConfig.colors).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateNestedConfig(['colors', key], e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateNestedConfig(['colors', key], e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Font Presets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fontPresets.map((font, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          updateNestedConfig(['typography', 'fontFamily'], font.value);
                          updateNestedConfig(['typography', 'headingFont'], font.value);
                        }}
                        className="p-4 border rounded-lg hover:border-blue-300 transition-colors text-left"
                        style={{ fontFamily: font.value }}
                      >
                        <p className="font-semibold mb-1">{font.name}</p>
                        <p className="text-sm text-gray-600">The quick brown fox jumps</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Font Family
                    </label>
                    <input
                      type="text"
                      value={themeConfig.typography.fontFamily}
                      onChange={(e) => updateNestedConfig(['typography', 'fontFamily'], e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Inter, system-ui, sans-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heading Font Family
                    </label>
                    <input
                      type="text"
                      value={themeConfig.typography.headingFont}
                      onChange={(e) => updateNestedConfig(['typography', 'headingFont'], e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Inter, system-ui, sans-serif"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(themeConfig.typography.fontSize).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {key === 'base' ? 'Base Size' : key.toUpperCase()}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateNestedConfig(['typography', 'fontSize', key], e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="16px"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Line Height
                    </label>
                    <input
                      type="text"
                      value={themeConfig.typography.lineHeight}
                      onChange={(e) => updateNestedConfig(['typography', 'lineHeight'], e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="1.6"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(themeConfig.layout).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateNestedConfig(['layout', key], e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder={
                          key === 'borderRadius' ? '8px' :
                          key === 'spacing' ? '1rem' :
                          key === 'maxWidth' ? '1200px' :
                          key === 'headerHeight' ? '64px' : ''
                        }
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme Mode
                  </label>
                  <select
                    value={themeConfig.theme}
                    onChange={(e) => updateThemeConfig({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="auto">Auto (System Preference)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Custom CSS Tab */}
            {activeTab === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom CSS
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Add custom CSS rules. Use CSS variables defined in the generated CSS for consistency.
                  </p>
                  <textarea
                    value={themeConfig.customCSS}
                    onChange={(e) => updateThemeConfig({ customCSS: e.target.value })}
                    rows={12}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                    placeholder="/* Custom CSS rules */
.custom-class {
  color: var(--color-primary);
  background: var(--color-surface);
}

.hero-section {
  background: linear-gradient(var(--color-primary), var(--color-secondary));
}"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Available CSS Variables</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><code>--color-primary</code>, <code>--color-secondary</code>, <code>--color-accent</code></p>
                    <p><code>--color-background</code>, <code>--color-surface</code>, <code>--color-text</code></p>
                    <p><code>--font-family</code>, <code>--font-heading</code>, <code>--font-size-base</code></p>
                    <p><code>--border-radius</code>, <code>--spacing</code>, <code>--max-width</code></p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Theme Preview</h3>
                  <button
                    onClick={() => window.open('/', '_blank')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <span>🔗</span>
                    <span>Open Live Site</span>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Generated CSS</h4>
                  <pre className="bg-white border rounded-lg p-4 text-sm overflow-x-auto">
                    <code>{generateCSS()}</code>
                  </pre>
                </div>

                <div className="border rounded-lg p-6" style={{
                  backgroundColor: themeConfig.colors.background,
                  color: themeConfig.colors.text,
                  fontFamily: themeConfig.typography.fontFamily,
                }}>
                  <h2 className="text-2xl font-bold mb-4" style={{
                    color: themeConfig.colors.primary,
                    fontFamily: themeConfig.typography.headingFont,
                  }}>
                    Sample Blog Post
                  </h2>
                  <p className="mb-4" style={{ color: themeConfig.colors.textSecondary }}>
                    This is a preview of how your theme will look on the website.
                  </p>
                  <div className="space-y-4">
                    <button 
                      className="px-4 py-2 rounded text-white"
                      style={{ 
                        backgroundColor: themeConfig.colors.primary,
                        borderRadius: themeConfig.layout.borderRadius,
                      }}
                    >
                      Primary Button
                    </button>
                    <button 
                      className="px-4 py-2 rounded text-white ml-3"
                      style={{ 
                        backgroundColor: themeConfig.colors.secondary,
                        borderRadius: themeConfig.layout.borderRadius,
                      }}
                    >
                      Secondary Button
                    </button>
                    <div 
                      className="p-4 rounded"
                      style={{ 
                        backgroundColor: themeConfig.colors.surface,
                        borderRadius: themeConfig.layout.borderRadius,
                      }}
                    >
                      <p>This is a surface element with your custom styling.</p>
                      <span style={{ color: themeConfig.colors.accent }}>
                        Accent color text element
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
