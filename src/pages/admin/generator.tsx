import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface GenerationStatus {
  isGenerating: boolean;
  progress: string;
  logs: string[];
  lastGeneration: string | null;
}

export default function AIGenerator() {
  const [status, setStatus] = useState<GenerationStatus>({
    isGenerating: false,
    progress: '',
    logs: [],
    lastGeneration: null,
  });
  const [customTopic, setCustomTopic] = useState('');
  const [settings, setSettings] = useState({
    useCustomTopic: false,
    autoPublish: true,
    includePictures: true,
  });

  useEffect(() => {
    checkGenerationStatus();
    const interval = setInterval(checkGenerationStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const checkGenerationStatus = async () => {
    try {
      const response = await fetch('/api/admin/generation-status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to check generation status:', error);
    }
  };

  const startGeneration = async () => {
    try {
      const response = await fetch('/api/admin/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customTopic: settings.useCustomTopic ? customTopic : null,
          settings,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus(prev => ({ 
          ...prev, 
          isGenerating: true, 
          progress: 'Starting AI generation...',
          logs: ['🚀 Generation started...']
        }));
      } else {
        alert('❌ Failed to start generation: ' + data.message);
      }
    } catch (error) {
      alert('❌ Error starting generation');
    }
  };

  const stopGeneration = async () => {
    try {
      const response = await fetch('/api/admin/stop-generation', {
        method: 'POST',
      });

      if (response.ok) {
        setStatus(prev => ({ 
          ...prev, 
          isGenerating: false, 
          progress: 'Generation stopped by user' 
        }));
      }
    } catch (error) {
      console.error('Failed to stop generation:', error);
    }
  };

  return (
    <AdminLayout title="AI Content Generator">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🤖 AI Content Generator</h2>
              <p className="text-gray-600">Generate blog posts using your existing AI workflow</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${status.isGenerating ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-600">
                {status.isGenerating ? 'Generating...' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generation Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useCustomTopic"
                  checked={settings.useCustomTopic}
                  onChange={(e) => setSettings(prev => ({ ...prev, useCustomTopic: e.target.checked }))}
                  className="mr-3"
                />
                <label htmlFor="useCustomTopic" className="text-sm font-medium text-gray-700">
                  Use Custom Topic
                </label>
              </div>

              {settings.useCustomTopic && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Topic
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your topic here..."
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoPublish"
                  checked={settings.autoPublish}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoPublish: e.target.checked }))}
                  className="mr-3"
                />
                <label htmlFor="autoPublish" className="text-sm font-medium text-gray-700">
                  Auto-publish when complete
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includePictures"
                  checked={settings.includePictures}
                  onChange={(e) => setSettings(prev => ({ ...prev, includePictures: e.target.checked }))}
                  className="mr-3"
                />
                <label htmlFor="includePictures" className="text-sm font-medium text-gray-700">
                  Include Pixabay images
                </label>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              {!status.isGenerating ? (
                <button
                  onClick={startGeneration}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
                >
                  🚀 Start Generation
                </button>
              ) : (
                <button
                  onClick={stopGeneration}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-medium"
                >
                  ⏹️ Stop Generation
                </button>
              )}
              
              <button
                onClick={() => window.open('/admin/content', '_self')}
                className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700"
              >
                📝 Manage Posts
              </button>
            </div>
          </div>

          {/* Status & Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Status</h3>
            
            {status.isGenerating && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">Processing...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{status.progress}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🤖</span>
                  <div>
                    <h4 className="font-medium text-gray-900">AI Engine</h4>
                    <p className="text-sm text-gray-600">Local Ollama (ai-blog-writer-1b)</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">✅ Ready</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📸</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Pixabay Images</h4>
                    <p className="text-sm text-gray-600">Stock photo integration</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">✅ Ready</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🚀</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-Deploy</h4>
                    <p className="text-sm text-gray-600">Git + Vercel workflow</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">✅ Ready</span>
              </div>
            </div>

            {status.lastGeneration && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Last Generation</h4>
                <p className="text-sm text-gray-600">{status.lastGeneration}</p>
              </div>
            )}
          </div>
        </div>

        {/* Generation Logs */}
        {status.logs.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Generation Logs</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {status.logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integration Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🔧 Workflow Integration</h3>
          <p className="text-blue-800 mb-3">
            This AI generator uses your <strong>exact same scripts</strong> as your desktop shortcut:
          </p>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• <code>generate-post-local.js</code> - AI content generation</li>
            <li>• <code>Ollama ai-blog-writer-1b</code> - Your local AI model</li>
            <li>• <code>Pixabay API integration</code> - Stock images</li>
            <li>• <code>Git commit & push</code> - Auto-deployment</li>
          </ul>
          <p className="text-blue-600 text-sm mt-3">
            💡 Your desktop shortcut workflow remains completely unchanged!
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
