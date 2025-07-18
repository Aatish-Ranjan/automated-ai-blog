import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import BlogPost from '@/components/BlogPost';
import { getAllPostSlugs, getPostBySlug, BlogPost as BlogPostType } from '@/lib/blog';

interface BlogPostPageProps {
  post: BlogPostType;
}

export default function BlogPostPage({ post }: BlogPostPageProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <p className="text-gray-600">The blog post you're looking for doesn't exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={post.title}
      description={post.excerpt}
      image={post.image}
      url={`/blog/${post.slug}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogPost post={post} />
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllPostSlugs();
  const paths = slugs.map((slug) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
};
