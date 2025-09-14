import { create } from 'zustand';
import { User } from './types';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: (user: User, token: string) => {
    console.log('Store login called with:', { username: user.username, roles: user.roles });
    
    // Store token in cookie (1 day expiry)
    Cookies.set('authToken', token, { expires: 1, sameSite: 'strict' });
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update store state
    set({ 
      user, 
      token, 
      isAuthenticated: true 
    });
    
    console.log('Store state updated:', get());
  },
  
  logout: () => {
    console.log('Store logout called');
    
    // Remove token from cookie
    Cookies.remove('authToken');
    
    // Remove user from localStorage
    localStorage.removeItem('user');
    
    // Clear store state
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },
  
  checkAuth: () => {
    console.log('Checking auth state...');
    
    // Check if token exists in cookie
    const token = Cookies.get('authToken');
    const userStr = localStorage.getItem('user');
    
    console.log('Found token in cookie:', !!token);
    console.log('Found user in localStorage:', !!userStr);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Restoring auth state for user:', user.username, 'with roles:', user.roles);
        
        set({ 
          user,
          token, 
          isAuthenticated: true 
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        Cookies.remove('authToken');
        localStorage.removeItem('user');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      }
    } else {
      console.log('No valid auth data found, clearing state');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      });
    }
  },
}));

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
