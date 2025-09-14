'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Plus, 
  Settings,
  Home,
  BookOpen
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['ROLE_ADMIN', 'ROLE_EDITOR']
  },
  {
    name: 'All Posts',
    href: '/admin/blogs',
    icon: FileText,
    roles: ['ROLE_ADMIN', 'ROLE_EDITOR']
  },
  {
    name: 'Create Post',
    href: '/admin/blogs/create',
    icon: Plus,
    roles: ['ROLE_ADMIN', 'ROLE_EDITOR']
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    roles: ['ROLE_ADMIN']
  },
  {
    name: 'View Blog',
    href: '/blog',
    icon: BookOpen,
    roles: ['ROLE_ADMIN', 'ROLE_EDITOR']
  },
  {
    name: 'Homepage',
    href: '/',
    icon: Home,
    roles: ['ROLE_ADMIN', 'ROLE_EDITOR']
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { sidebarOpen, closeSidebar } = useUIStore();

  const hasPermission = (requiredRoles: string[]) => {
    if (!user) return false;
    return requiredRoles.some(role => user.roles.includes(role));
  };

  const filteredNavigation = navigation.filter(item => hasPermission(item.roles));

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform bg-background border-r transition-transform duration-300 ease-in-out md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col px-4 py-6">
          <nav className="flex-1 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start space-x-3",
                    isActive && "bg-primary/10 text-primary font-medium"
                  )}
                  onClick={() => {
                    router.push(item.href);
                    closeSidebar();
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Button>
              );
            })}
          </nav>

          {/* User Info */}
          {user && (
            <div className="border-t pt-4">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
