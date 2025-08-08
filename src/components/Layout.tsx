import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'AI Powered Blog - Automated Content Generation',
  description = 'A modern blog powered by AI with automated content generation and SEO optimization',
  image = '/images/og-image.jpg',
  url = ''
}) => {
  const siteTitle = 'AI Powered Blog';
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;
  const fullUrl = `${process.env.SITE_URL}${url}`;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* OpenGraph tags */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="AI Powered Blog" />
        <link rel="canonical" href={fullUrl} />
        
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title={siteTitle} href="/rss.xml" />
        
        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
