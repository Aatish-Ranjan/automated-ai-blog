import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const AIBlogGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelStatus, setModelStatus] = useState('checking');
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    audience: 'general readers',
    tone: 'professional',
    length: 800,
    useAutoTopic: false,
  });

  useEffect(() => {
    checkModelStatus();
    loadRecentPosts();
    loadTopicSuggestions();
  }, []);

  const checkModelStatus = async () => {
    try {
      const response = await fetch('/api/ai-model-status');
      const data = await response.json();
      setModelStatus(data.available ? 'available' : 'unavailable');
    } catch (error) {
      setModelStatus('unavailable');
    }
  };

  const loadRecentPosts = async () => {
    try {
      const response = await fetch('/api/recent-posts');
      const posts = await response.json();
      setGeneratedPosts(posts.slice(0, 5)); // Show last 5 posts
    } catch (error) {
      console.error('Failed to load recent posts:', error);
    }
  };

  const loadTopicSuggestions = async () => {
    setIsLoadingTopics(true);
    try {
      const response = await fetch('/api/topic-selection?type=suggestions&count=5');
      const data = await response.json();
      setSuggestedTopics(data.suggestions || []);
    } catch (error) {
      console.error('Failed to load topic suggestions:', error);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const getSmartTopic = async () => {
    try {
      const response = await fetch('/api/topic-selection?type=smart');
      const data = await response.json();
      return data.topic;
    } catch (error) {
      console.error('Failed to get smart topic:', error);
      return null;
    }
  };

  const selectSuggestedTopic = (topic) => {
    setFormData({ ...formData, topic: topic.title });
  };

  const generateBlogPost = async () => {
    let topicToUse = formData.topic.trim();

    // Auto-select topic if enabled and no manual topic provided
    if (formData.useAutoTopic || !topicToUse) {
      const smartTopic = await getSmartTopic();
      if (smartTopic) {
        topicToUse = smartTopic.title;
        console.log('Auto-selected topic:', smartTopic.title);
      }
    }

    if (!topicToUse) {
      alert('Please enter a topic or enable auto-topic selection');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-blog-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          topic: topicToUse
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate blog post');
      }

      // Refresh recent posts and topic suggestions
      await loadRecentPosts();
      await loadTopicSuggestions();
      
      // Reset form
      setFormData({ ...formData, topic: '' });
      
      alert(`Blog post generated successfully: ${result.filename}`);

    } catch (error) {
      console.error('Generation error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const ModelStatusBadge = () => {
    const statusConfig = {
      checking: { color: 'bg-yellow-100 text-yellow-800', text: 'Checking...', icon: '⏳' },
      available: { color: 'bg-green-100 text-green-800', text: 'AI Model Ready', icon: '✅' },
      unavailable: { color: 'bg-red-100 text-red-800', text: 'AI Model Offline', icon: '❌' },
    };

    const config = statusConfig[modelStatus];

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <span className="mr-2">{config.icon}</span>
        {config.text}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Local AI Blog Generator</h2>
        <ModelStatusBadge />
      </div>

      {modelStatus === 'unavailable' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            <strong>AI Model Offline:</strong> Please ensure Ollama is running with the ai-blog-writer-1b model.
          </p>
          <code className="block mt-2 text-sm bg-red-100 p-2 rounded">
            ollama serve
          </code>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Form */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Generate New Post</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Blog Topic *
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={formData.useAutoTopic}
                    onChange={(e) => setFormData({ ...formData, useAutoTopic: e.target.checked })}
                    className="mr-2"
                  />
                  Auto-select topic
                </label>
              </div>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder={formData.useAutoTopic ? "Topic will be auto-selected..." : "Enter your blog topic..."}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating || modelStatus !== 'available' || formData.useAutoTopic}
              />
              
              {/* Topic Suggestions */}
              {!formData.useAutoTopic && suggestedTopics.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">Suggested topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTopics.slice(0, 3).map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => selectSuggestedTopic(topic)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 transition-colors"
                        disabled={isGenerating}
                      >
                        {topic.title}
                      </button>
                    ))}
                    <button
                      onClick={loadTopicSuggestions}
                      className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded hover:bg-gray-100 transition-colors"
                      disabled={isLoadingTopics}
                    >
                      {isLoadingTopics ? '...' : '↻'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience
                </label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                >
                  <option value="general readers">General Readers</option>
                  <option value="developers">Developers</option>
                  <option value="business owners">Business Owners</option>
                  <option value="students">Students</option>
                  <option value="professionals">Professionals</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word Count: {formData.length}
              </label>
              <input
                type="range"
                min="400"
                max="1500"
                step="100"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: parseInt(e.target.value) })}
                className="w-full"
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>400</span>
                <span>1500</span>
              </div>
            </div>

            <button
              onClick={generateBlogPost}
              disabled={isGenerating || (!formData.topic.trim() && !formData.useAutoTopic) || modelStatus !== 'available'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : 'Generate Blog Post'}
            </button>
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recently Generated</h3>
          
          {generatedPosts.length > 0 ? (
            <div className="space-y-3">
              {generatedPosts.map((post, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md border">
                  <h4 className="font-medium text-gray-900 line-clamp-2">{post.title}</h4>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                    <span>{format(new Date(post.date), 'MMM dd, yyyy')}</span>
                    <span>{post.readingTime}</span>
                  </div>
                  {post.tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No posts generated yet.</p>
              <p className="text-sm mt-1">Generate your first AI blog post!</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{generatedPosts.length}</div>
            <div className="text-sm text-gray-500">Posts Generated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {generatedPosts.reduce((acc, post) => acc + (post.wordCount || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Words</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">AI</div>
            <div className="text-sm text-gray-500">Powered</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBlogGenerator;
