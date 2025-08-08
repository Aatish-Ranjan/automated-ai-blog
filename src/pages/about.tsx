import React from 'react';
import Layout from '@/components/Layout';

export default function About() {
  return (
    <Layout
      title="About - AI Powered Blog"
      description="Learn about our AI-powered blog platform that generates high-quality content automatically."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About AI Powered Blog</h1>
          
          <div className="mb-8">
            <img 
              src="/images/ai-blog-hero.jpg" 
              alt="AI Powered Blog Platform" 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          <p className="text-xl text-gray-600 mb-8">
            Welcome to AI Powered Blog, where artificial intelligence meets content creation to deliver 
            fresh, insightful articles on technology, innovation, and the future.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            We believe in the power of AI to democratize content creation and provide valuable 
            insights to our readers. Our mission is to explore the intersection of artificial 
            intelligence and human creativity, delivering content that informs, inspires, and 
            educates.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">1. AI Generation</h3>
              <p className="text-blue-800">
                Our AI system analyzes current trends and generates engaging content ideas.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">2. Content Creation</h3>
              <p className="text-green-800">
                Advanced language models create comprehensive articles with proper structure.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">3. Automated Publishing</h3>
              <p className="text-purple-800">
                Content is automatically published and optimized for search engines.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6">
            <li>Next.js for fast, SEO-optimized static site generation</li>
            <li>OpenAI GPT for intelligent content generation</li>
            <li>GitHub Actions for automated deployment</li>
            <li>Tailwind CSS for modern, responsive design</li>
            <li>Markdown/MDX for structured content management</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Daily AI-generated content</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">SEO-optimized articles</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Automated publishing</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Mobile-responsive design</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">RSS feed support</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Social sharing integration</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
          <p className="text-gray-700 mb-6">
            Ready to explore the future of content creation? Browse our latest articles, 
            subscribe to our newsletter, or learn more about how AI is transforming the 
            way we create and consume content.
          </p>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Join Our Community</h3>
            <p className="text-blue-800 mb-4">
              Stay updated with the latest AI insights and be part of the conversation 
              about the future of artificial intelligence.
            </p>
            <a 
              href="/blog" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore Articles
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
