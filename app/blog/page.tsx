import { Metadata } from 'next';
import { Suspense } from 'react';
import { blogApi } from '@/lib/api';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import BlogListClient from '@/components/blog/BlogListClient';
import { BlogPost } from '@/lib/types';

// SEO Metadata for blog listing page
export const metadata: Metadata = generateSEOMetadata({
  title: 'Blog | BlogCMS - Latest Articles and Insights',
  description: 'Discover the latest articles, tutorials, and insights on technology, design, and business. Stay updated with our comprehensive blog.',
  url: '/blog',
});

// Loading component
function BlogListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-lg max-w-2xl mx-auto animate-pulse"></div>
        </div>

        {/* Posts skeleton */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Server component for initial data fetching
async function BlogList({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page || '0');
  const searchQuery = searchParams.search;

  try {
    let postsData;
    
    if (searchQuery) {
      postsData = await blogApi.searchPublishedPosts(searchQuery, page, 12);
    } else {
      postsData = await blogApi.getPublishedPosts(page, 12);
    }

    return (
      <BlogListClient 
        initialPosts={postsData.content}
        initialTotalPages={postsData.totalPages}
        initialCurrentPage={page}
        searchQuery={searchQuery}
      />
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to load posts</h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }
}

export default function BlogPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  return (
    <Suspense fallback={<BlogListSkeleton />}>
      <BlogList searchParams={searchParams} />
    </Suspense>
  );
}
