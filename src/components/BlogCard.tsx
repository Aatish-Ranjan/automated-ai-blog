import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  readingTime: string;
  image?: string;
}

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  const formattedDate = format(new Date(post.date), 'MMMM d, yyyy');

  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${featured ? 'md:col-span-2' : ''}`}>
      {post.image && (
        <div className={`relative ${featured ? 'h-64' : 'h-48'}`}>
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <time dateTime={post.date}>{formattedDate}</time>
          <span>•</span>
          <span>{post.readingTime}</span>
          <span>•</span>
          <span>{post.author}</span>
        </div>
        
        <h3 className={`font-bold text-gray-900 mb-3 ${featured ? 'text-2xl' : 'text-xl'}`}>
          <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
            {post.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
          >
            Read more
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
