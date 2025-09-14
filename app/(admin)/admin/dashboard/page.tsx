'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp,
  Calendar,
  Globe,
  Clock,
  BarChart3,
  RefreshCw,
  Loader2,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { dashboardApi } from '@/lib/api';
import { BlogPost } from '@/lib/types';
import { useAuthStore } from '@/lib/store';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalUsers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalUsers: 0
  });
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();

  const isAdmin = user?.roles.includes('ROLE_ADMIN');

  // Fetch dashboard data
  const fetchDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setRefreshing(!showLoader);
      
      // Fetch stats and recent posts in parallel
      const [statsData, postsData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentPosts(5)
      ]);
      
      setStats(statsData);
      setRecentPosts(postsData);
      setLastUpdated(new Date());
      
      console.log('Dashboard data refreshed');
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      
      // Handle different error scenarios
      if (error.response?.status === 401) {
        // Token might be expired, redirect to login
        router.push('/login');
      } else if (error.response?.status === 403) {
        console.log('Some data not available due to permissions');
        // Still show what we can
      } else {
        // Show error message to user
        console.error('Dashboard error:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Manual refresh
  const handleRefresh = () => {
    fetchDashboardData(false);
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      change: '+2 this week', // You can calculate this from historical data
    },
    {
      title: 'Published',
      value: stats.publishedPosts,
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: `${Math.round((stats.publishedPosts / Math.max(stats.totalPosts, 1)) * 100)}%`,
    },
    {
      title: 'Drafts',
      value: stats.draftPosts,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      change: 'Ready to publish',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      adminOnly: true,
      change: 'Active users',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {refreshing && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {autoRefresh && !refreshing && (
              <div className="flex items-center space-x-1 text-green-600">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium">LIVE</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}! Last updated: {formatTime(lastUpdated)}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Live' : 'Manual'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards
          .filter(card => !card.adminOnly || isAdmin)
          .map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-xs text-muted-foreground">{card.change}</p>
                    </div>
                    <div className={`${card.bgColor} p-3 rounded-full`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Posts with Real-time Updates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>Recent Posts</span>
              {recentPosts.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {recentPosts.length}
                </Badge>
              )}
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/admin/blogs')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div 
                    key={post.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/admin/blogs/edit/${post.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                          {post.title}
                        </h4>
                        <Badge variant={post.published ? "default" : "secondary"} className="shrink-0">
                          {post.published ? (
                            <Globe className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {post.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(post.createdAt)}
                        </span>
                        <span>By {post.author}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No posts yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => router.push('/admin/blogs/create')}
                  >
                    Create your first post
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start hover:bg-primary/90" 
                onClick={() => router.push('/admin/blogs/create')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Create New Post
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/blogs')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Manage Posts
                {stats.draftPosts > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {stats.draftPosts} drafts
                  </Badge>
                )}
              </Button>

              {isAdmin && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/admin/users')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                  <Badge variant="secondary" className="ml-auto">
                    {stats.totalUsers}
                  </Badge>
                </Button>
              )}

              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => window.open('/blog', '_blank')}
              >
                <Globe className="h-4 w-4 mr-2" />
                View Live Blog
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Content Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg hover:shadow-sm transition-shadow">
              <div className="text-2xl font-bold text-green-600">{stats.publishedPosts}</div>
              <div className="text-sm text-muted-foreground">Published Posts</div>
              <div className="text-xs text-green-600 mt-1">✓ Live content</div>
            </div>
            <div className="text-center p-4 border rounded-lg hover:shadow-sm transition-shadow">
              <div className="text-2xl font-bold text-yellow-600">{stats.draftPosts}</div>
              <div className="text-sm text-muted-foreground">Draft Posts</div>
              <div className="text-xs text-yellow-600 mt-1">⏳ Pending review</div>
            </div>
            <div className="text-center p-4 border rounded-lg hover:shadow-sm transition-shadow">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Publish Rate</div>
              <div className="text-xs text-blue-600 mt-1">📊 Content ratio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
