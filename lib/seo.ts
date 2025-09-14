import { Metadata } from 'next';
import { BlogPost } from './types';

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

export function generateMetadata(seo: SEOProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const fullUrl = seo.url ? `${siteUrl}${seo.url}` : siteUrl;
  const imageUrl = seo.image || `${siteUrl}/og-default.jpg`;

  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: fullUrl,
      siteName: 'BlogCMS',
      type: seo.type || 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
      ...(seo.type === 'article' && {
        publishedTime: seo.publishedTime,
        modifiedTime: seo.modifiedTime,
        authors: seo.author ? [seo.author] : undefined,
        tags: seo.tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateBlogPostMetadata(post: BlogPost): Metadata {
  return generateMetadata({
    title: `${post.title} | BlogCMS`,
    description: post.excerpt,
    image: post.featuredImage,
    url: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.createdAt,
    modifiedTime: post.updatedAt,
    author: post.author,
    tags: post.tags,
  });
}

export function generateJsonLd(post: BlogPost) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage ? `${siteUrl}${post.featuredImage}` : undefined,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BlogCMS',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };
}
