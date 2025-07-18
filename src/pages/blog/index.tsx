import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import Layout from '@/components/Layout';
import BlogCard from '@/components/BlogCard';
import { getAllPosts, getAllTags, BlogPost } from '@/lib/blog';

interface BlogIndexProps {
  posts: BlogPost[];
  tags: string[];
}

export default function BlogIndex({ posts, tags }: BlogIndexProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Filter posts based on search term and selected tag
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === '' || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  return (
    <Layout
      title="Blog - AI-Generated Articles"
      description="Explore our collection of AI-generated articles covering technology, innovation, and the future of artificial intelligence."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI Blog Articles
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover insights on technology, AI, and innovation through our automated content generation.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTag === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {tags.slice(0, 10).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <BlogCard 
                key={post.slug} 
                post={post}
                featured={index === 0 && searchTerm === '' && selectedTag === ''}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedTag 
                ? "Try adjusting your search or filter criteria."
                : "No blog posts available yet. Check back soon for AI-generated content!"
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getAllPosts();
  const tags = await getAllTags();

  return {
    props: {
      posts,
      tags,
    },
  };
};
