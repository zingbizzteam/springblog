import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogApi } from '@/lib/api';
import { generateBlogPostMetadata, generateJsonLd } from '@/lib/seo';
import BlogPostClient from '@/components/blog/BlogPostClient';
import { BlogPost } from '@/lib/types';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await blogApi.getPublishedPostBySlug(params.slug);
    return generateBlogPostMetadata(post);
  } catch {
    return {
      title: 'Post Not Found | BlogCMS',
      description: 'The requested blog post could not be found.',
    };
  }
}

// Generate static paths for better performance (optional)
export async function generateStaticParams() {
  try {
    // In production, you might want to generate paths for the most popular posts
    const response = await blogApi.getPublishedPosts(0, 50);
    return response.content.map((post) => ({
      slug: post.slug,
    }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post: BlogPost;
  
  try {
    post = await blogApi.getPublishedPostBySlug(params.slug);
  } catch (error) {
    notFound();
  }

  // Generate structured data for SEO
  const jsonLd = generateJsonLd(post);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <BlogPostClient post={post} />
    </>
  );
}
