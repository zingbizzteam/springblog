'use client';

import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Cookies from 'js-cookie';

export default function AuthDebug() {
  const { user, isAuthenticated, token } = useAuthStore();
  const cookieToken = Cookies.get('authToken');
  const localUser = localStorage.getItem('user');

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div><strong>Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}</div>
        <div><strong>User:</strong> {user?.username || 'None'}</div>
        <div><strong>Roles:</strong> {user?.roles?.join(', ') || 'None'}</div>
        <div><strong>Store Token:</strong> {token ? '✅' : '❌'}</div>
        <div><strong>Cookie Token:</strong> {cookieToken ? '✅' : '❌'}</div>
        <div><strong>LocalStorage User:</strong> {localUser ? '✅' : '❌'}</div>
      </CardContent>
    </Card>
  );
}
