'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import AuthDebug from '@/components/debug/AuthDebug';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check auth state on mount
    const initAuth = async () => {
      // console.log('=== ADMIN LAYOUT INIT ===');
      
      // Check if we have a token
      const token = Cookies.get('authToken');
      // console.log('Token exists:', !!token);
      
      if (token) {
        // If we have a token but no user, try to restore from localStorage
        if (!user) {
          checkAuth();
        }
        
        // Wait a bit for the auth state to update
        setTimeout(() => {
          setAuthChecked(true);
          setIsLoading(false);
        }, 100);
      } else {
        // No token, redirect to login
        // console.log('No token found, redirecting to login');
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [checkAuth, user]);

  useEffect(() => {
    // Only run auth checks after we've checked the initial state
    if (authChecked && !isLoading) {
      // console.log('=== ADMIN LAYOUT AUTH CHECK ===');
      // console.log('Authenticated:', isAuthenticated);
      // console.log('User:', user?.username);
      // console.log('User roles:', user?.roles);
      
      if (!isAuthenticated || !user) {
        // console.log('Not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      // Check if user has admin or editor role
      const hasValidRole = user.roles.some(role => 
        ['ROLE_ADMIN', 'ROLE_EDITOR'].includes(role)
      );
      
      // console.log('Has valid role:', hasValidRole);
      
      if (!hasValidRole) {
        // console.log('Insufficient permissions. User roles:', user.roles);
        alert('You do not have permission to access the admin panel.');
        router.push('/');
        return;
      }
      
      // console.log('Auth check passed for user:', user.username);
    }
  }, [authChecked, isLoading, isAuthenticated, user, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check roles one more time before rendering
  const hasValidRole = user.roles.some(role => 
    ['ROLE_ADMIN', 'ROLE_EDITOR'].includes(role)
  );

  if (!hasValidRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You do not have permission to access this area.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Current roles: {user.roles.join(', ')}
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
             {/* <AuthDebug /> */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
