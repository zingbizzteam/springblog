'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Plus,
  Eye,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/editor', icon: LayoutDashboard },
  { name: 'My Posts', href: '/editor/blogs', icon: FileText },
  { name: 'New Post', href: '/editor/blogs/create', icon: Plus },
  { name: 'Preview Blog', href: '/blog', icon: Globe, external: true },
];

export default function EditorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, closeSidebar } = useUIStore();

  const handleNavigation = (item: typeof navigation[0]) => {
    if (item.external) {
      window.open(item.href, '_blank');
    } else {
      router.push(item.href);
      closeSidebar();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" 
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <nav className="h-full px-4 py-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = !item.external && pathname === item.href;
              
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary font-medium"
                  )}
                  onClick={() => handleNavigation(item)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.external && <Eye className="ml-auto h-4 w-4" />}
                </Button>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
