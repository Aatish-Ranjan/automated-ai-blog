import React from 'react';
import Layout from '@/components/Layout';
import AIBlogGenerator from '@/components/AIBlogGenerator';

export default function Admin() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Blog Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate AI-powered blog posts with automated topic selection
          </p>
        </div>
        
        <AIBlogGenerator />
      </div>
    </Layout>
  );
}
