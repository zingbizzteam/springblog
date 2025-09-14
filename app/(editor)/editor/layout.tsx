'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import EditorHeader from '@/components/layout/EditorHeader';
import EditorSidebar from '@/components/layout/EditorSidebar';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      console.log('=== EDITOR LAYOUT INIT ===');
      
      const token = Cookies.get('authToken');
      console.log('Token exists:', !!token);
      
      if (token) {
        if (!user) {
          checkAuth();
        }
        
        setTimeout(() => {
          setAuthChecked(true);
          setIsLoading(false);
        }, 100);
      } else {
        console.log('No token found, redirecting to login');
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [checkAuth, user]);

  useEffect(() => {
    if (authChecked && !isLoading) {
      console.log('=== EDITOR LAYOUT AUTH CHECK ===');
      console.log('Authenticated:', isAuthenticated);
      console.log('User:', user?.username);
      console.log('User roles:', user?.roles);
      
      if (!isAuthenticated || !user) {
        console.log('Not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      // Check if user has editor role (not admin)
      const isEditor = user.roles.includes('ROLE_EDITOR');
      const isAdmin = user.roles.includes('ROLE_ADMIN');
      
      if (!isEditor) {
        console.log('Not an editor. Redirecting appropriately.');
        if (isAdmin) {
          // Redirect admins to admin panel
          router.push('/admin/dashboard');
        } else {
          // Redirect others to home
          router.push('/');
        }
        return;
      }
      
      console.log('Editor auth check passed for user:', user.username);
    }
  }, [authChecked, isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EditorHeader />
      <div className="flex">
        <EditorSidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
