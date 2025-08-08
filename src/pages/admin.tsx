import React from 'react';
import Layout from '@/components/Layout';

export default function Admin() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Powered Blog Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate AI-powered blog posts with automated topic selection
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Blog Generation Available via Desktop Shortcut
          </h2>
          <p className="text-gray-600 mb-6">
            Use your desktop shortcut or run the command: <code className="bg-gray-100 px-2 py-1 rounded">npm run auto-post</code>
          </p>
          <div className="text-sm text-gray-500">
            <p>The automated system will:</p>
            <ul className="mt-2 space-y-1">
              <li>• Generate AI-powered content using local Ollama models</li>
              <li>• Fetch relevant Pixabay images</li>
              <li>• Optimize for SEO and readability</li>
              <li>• Auto-deploy to smartiyo.com</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
