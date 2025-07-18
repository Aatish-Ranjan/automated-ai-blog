/**
 * Schema Markup Components
 */

export const generateArticleSchema = (post) => {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": post.title,
    "description": post.metaDescription || post.excerpt,
    "image": {
      "@type": "ImageObject",
      "url": `https://aatish-ranjan.github.io/automated-ai-blog${post.image}`,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Person",
      "name": post.author || "AI Blog Team",
      "url": "https://aatish-ranjan.github.io/automated-ai-blog/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Blog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aatish-ranjan.github.io/automated-ai-blog/logo.png",
        "width": 512,
        "height": 512
      }
    },
    "datePublished": post.date,
    "dateModified": post.lastModified || post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://aatish-ranjan.github.io/automated-ai-blog/blog/${post.slug}`
    },
    "articleSection": post.category,
    "keywords": post.tags?.join(", "),
    "wordCount": post.wordCount,
    "timeRequired": post.readingTime,
    "about": post.tags?.map(tag => ({
      "@type": "Thing",
      "name": tag
    }))
  };
};

export const generateHowToSchema = (steps, title, description) => {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "totalTime": "PT30M",
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.description,
      "image": step.image ? {
        "@type": "ImageObject",
        "url": step.image
      } : undefined
    }))
  };
};

export const generateFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};