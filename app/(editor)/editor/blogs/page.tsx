'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Globe,
  Clock,
  MoreHorizontal,
  RefreshCw,
  X
} from 'lucide-react';
import { blogApi } from '@/lib/api';
import { BlogPost } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/store';

export default function EditorPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const router = useRouter();
  const { user } = useAuthStore();

  // Debounce utility function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Debounced search function
  const debounceSearch = useCallback(
    debounce((query: string) => {
      performSearch(query);
    }, 500),
    []
  );

  useEffect(() => {
    if (activeSearch) {
      performSearch(activeSearch);
    } else {
      fetchPosts();
    }
  }, [currentPage, activeSearch]);

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearching(true);
      debounceSearch(searchQuery.trim());
    } else if (activeSearch) {
      // Clear search
      setActiveSearch('');
      setCurrentPage(0);
    }
  }, [searchQuery, debounceSearch]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await blogApi.getAllPosts(currentPage, 12);
      setPosts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      alert('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    try {
      setSearching(true);
      setActiveSearch(query);
      
      const searchPage = query !== activeSearch ? 0 : currentPage;
      if (query !== activeSearch) {
        setCurrentPage(0);
      }

      const response = await blogApi.getAllPosts(searchPage, 12);
      
      // Filter posts based on search query (client-side search)
      const filteredPosts = response.content.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        post.author.toLowerCase().includes(query.toLowerCase())
      );

      setPosts(filteredPosts);
      setTotalPages(Math.ceil(filteredPosts.length / 12));
      setTotalElements(filteredPosts.length);
    } catch (error) {
      console.error('Failed to search posts:', error);
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setCurrentPage(0);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await blogApi.deletePost(id);
        if (activeSearch) {
          performSearch(activeSearch);
        } else {
          fetchPosts();
        }
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const handlePublishToggle = async (post: BlogPost) => {
    try {
      if (!post.published) {
        await blogApi.publishPost(post.id);
      }
      if (activeSearch) {
        performSearch(activeSearch);
      } else {
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      alert('Failed to update post status. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !searching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Posts</h1>
          <p className="text-muted-foreground">
            Manage your blog posts and content
            {activeSearch && (
              <span className="text-primary"> • Searching for "{activeSearch}"</span>
            )}
          </p>
        </div>
        <Button onClick={() => router.push('/editor/blogs/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts by title, content, tags, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {(searchQuery || activeSearch) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={searching}>
                {searching ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {activeSearch ? `Found ${totalElements} results` : `Showing ${totalElements} posts`}
        </p>
        {activeSearch && (
          <Button variant="outline" size="sm" onClick={clearSearch}>
            <X className="h-4 w-4 mr-2" />
            Clear Search
          </Button>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Published
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Draft
                        </>
                      )}
                    </Badge>
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold leading-tight line-clamp-2">
                    {post.title}
                  </h3>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/editor/blogs/edit/${post.id}`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {post.published && (
                      <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Live
                      </DropdownMenuItem>
                    )}
                    {!post.published && (
                      <DropdownMenuItem onClick={() => handlePublishToggle(post)}>
                        <Globe className="h-4 w-4 mr-2" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>By {post.author}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading state for search */}
      {searching && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Searching...</span>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && !loading && !searching && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              {activeSearch ? (
                <Search className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Edit className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {activeSearch ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {activeSearch 
                ? `No posts match your search for "${activeSearch}". Try different keywords.`
                : 'Get started by creating your first blog post'
              }
            </p>
            {activeSearch ? (
              <Button onClick={clearSearch} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Clear Search
              </Button>
            ) : (
              <Button onClick={() => router.push('/editor/blogs/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
              if (pageNum >= totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
