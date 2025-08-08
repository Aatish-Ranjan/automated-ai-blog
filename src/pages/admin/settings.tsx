import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Settings {
  siteName: string;
  siteDescription: string;
  pixabayApiKey: string;
  ollamaModel: string;
  autoPublish: boolean;
  deploymentBranch: string;
  maxPostsPerPage: number;
  adminPassword: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'AI Powered Blog',
    siteDescription: 'Automated blog powered by AI technology',
    pixabayApiKey: '51685291-3b4ae02a69eab1412b0961b63',
    ollamaModel: 'ai-blog-writer-1b',
    autoPublish: true,
    deploymentBranch: 'main',
    maxPostsPerPage: 10,
    adminPassword: '',
  });

  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'deployment' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        alert('✅ Settings saved successfully!');
      } else {
        alert('❌ Failed to save settings');
      }
    } catch (error) {
      alert('❌ Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async (type: 'ollama' | 'pixabay') => {
    try {
      const response = await fetch(`/api/admin/test-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: settings.ollamaModel,
          apiKey: settings.pixabayApiKey 
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} connection successful!`);
      } else {
        alert(`❌ ${type.charAt(0).toUpperCase() + type.slice(1)} connection failed: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error testing ${type} connection`);
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">⚙️ Settings</h2>
          <p className="text-gray-600">Configure your blog and automation settings</p>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'general', name: 'General', icon: '🌐' },
                { id: 'ai', name: 'AI & Media', icon: '🤖' },
                { id: 'deployment', name: 'Deployment', icon: '🚀' },
                { id: 'security', name: 'Security', icon: '🔒' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posts Per Page
                  </label>
                  <input
                    type="number"
                    value={settings.maxPostsPerPage}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxPostsPerPage: parseInt(e.target.value) }))}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ollama AI Model
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={settings.ollamaModel}
                      onChange={(e) => setSettings(prev => ({ ...prev, ollamaModel: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => testConnection('ollama')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      🔍 Test
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Your local Ollama model name</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pixabay API Key
                  </label>
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.pixabayApiKey}
                        onChange={(e) => setSettings(prev => ({ ...prev, pixabayApiKey: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <button
                      onClick={() => testConnection('pixabay')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      🔍 Test
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">For automatic image integration</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoPublish"
                    checked={settings.autoPublish}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoPublish: e.target.checked }))}
                    className="mr-3"
                  />
                  <label htmlFor="autoPublish" className="text-sm font-medium text-gray-700">
                    Auto-publish generated content
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'deployment' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deployment Branch
                  </label>
                  <select
                    value={settings.deploymentBranch}
                    onChange={(e) => setSettings(prev => ({ ...prev, deploymentBranch: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="main">main</option>
                    <option value="master">master</option>
                    <option value="gh-pages">gh-pages</option>
                  </select>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">🔧 Current Setup</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Repository:</strong> automated-ai-blog</li>
                    <li>• <strong>Platform:</strong> Vercel (smartiyo.com)</li>
                    <li>• <strong>Auto-Deploy:</strong> Enabled via Git hooks</li>
                    <li>• <strong>Build Command:</strong> npm run build</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Deployment Workflow</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Content generated locally</li>
                    <li>2. Files committed to Git automatically</li>
                    <li>3. Changes pushed to GitHub</li>
                    <li>4. Vercel detects changes and rebuilds</li>
                    <li>5. New content live on smartiyo.com</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={settings.adminPassword}
                    onChange={(e) => setSettings(prev => ({ ...prev, adminPassword: e.target.value }))}
                    placeholder="Enter new password (leave empty to keep current)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Only change if you want to update your password</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">🔒 Security Notes</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Admin portal is localhost-only (not accessible remotely)</li>
                    <li>• Session expires after inactivity</li>
                    <li>• All file operations are local to your machine</li>
                    <li>• API keys are stored securely in environment files</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">⚠️ Important</h4>
                  <p className="text-sm text-red-800">
                    Keep your API keys secure and never commit them to public repositories. 
                    This admin portal is designed for local development only.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center">
              <button
                onClick={loadSettings}
                className="text-gray-600 hover:text-gray-800"
              >
                🔄 Reset to Saved
              </button>
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? '💾 Saving...' : '💾 Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
