import React from 'react';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import Layout from '@/components/Layout';
import BlogCard from '@/components/BlogCard';
import { getRecentPosts, BlogPost } from '@/lib/blog';

interface HomeProps {
  recentPosts: BlogPost[];
}

export default function Home({ recentPosts }: HomeProps) {
  const featuredPost = recentPosts[0];
  const otherPosts = recentPosts.slice(1);

  return (
    <Layout>
      {/* Hero/Header Section - Blog Style */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
              Smartiyo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Exploring the intersection of AI, technology, and human innovation through thoughtful analysis and insights.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article Section */}
      {featuredPost && (
        <section className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Featured Article</span>
            </div>
            <article className="group">
              <Link href={`/blog/${featuredPost.slug}`}>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="order-2 md:order-1">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <time dateTime={featuredPost.date}>
                        {new Date(featuredPost.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <span className="mx-2">•</span>
                      <span>{featuredPost.readingTime || '5 min read'}</span>
                    </div>
                  </div>
                  <div className="order-1 md:order-2">
                    {featuredPost.image && (
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                      />
                    )}
                  </div>
                </div>
              </Link>
            </article>
          </div>
        </section>
      )}

      {/* Recent Posts Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Latest Posts
            </h2>
            <p className="text-gray-600">
              Discover insights on AI, technology, and innovation
            </p>
          </div>

          {otherPosts.length > 0 ? (
            <div className="space-y-8">
              {otherPosts.map((post) => (
                <article key={post.slug} className="group">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="grid md:grid-cols-3 gap-6 items-start">
                      <div className="md:col-span-2">
                        <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                          <span className="mx-2">•</span>
                          <span>{post.readingTime || '5 min read'}</span>
                        </div>
                      </div>
                      {post.image && (
                        <div className="md:col-span-1">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-32 md:h-24 object-cover rounded-md group-hover:opacity-90 transition-opacity"
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Smartiyo</h3>
              <p className="text-gray-500">
                Our AI-powered blog will start publishing thoughtful articles soon.
              </p>
            </div>
          )}

          {recentPosts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View all posts
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter/Subscribe Section */}
      <section className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            Stay in the Loop
          </h2>
          <p className="text-gray-600 mb-8">
            Get notified when we publish new articles about AI, technology, and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No spam. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const recentPosts = await getRecentPosts(3);

  return {
    props: {
      recentPosts,
    },
  };
};
