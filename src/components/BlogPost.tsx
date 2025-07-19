import React from 'react';
import { format } from 'date-fns';
import type { BlogPost } from '@/lib/blog';

interface BlogPostProps {
  post: BlogPost;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  const formattedDate = format(new Date(post.date), 'MMMM d, yyyy');

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out this article: ${post.title}`;

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    // You might want to show a toast notification here
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Hero Image */}
      {post.image && (
        <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 text-gray-600">
            <time dateTime={post.date}>{formattedDate}</time>
            <span>•</span>
            <span>{post.readingTime}</span>
            <span>•</span>
            <span>{post.author}</span>
          </div>
          
          {/* Social Share Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 mr-2">Share:</span>
            <button
              onClick={shareOnTwitter}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Share on Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </button>
            <button
              onClick={shareOnLinkedIn}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Share on LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy link"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Article Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
};

export default BlogPost;
