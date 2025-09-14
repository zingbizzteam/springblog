import axios from 'axios';
import { AuthResponse, BlogPost, User, LoginCredentials, CreateUserRequest, ApiResponse } from './types';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');
  // console.log('API Request - Token:', token ? token.substring(0, 20) + '...' : 'No token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // If unauthorized, clear auth state and redirect
    if (error.response?.status === 401) {
      Cookies.remove('authToken');
      localStorage.removeItem('user');
      // Force redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // console.log('Login API call:', credentials.username);
    const response = await api.post('/api/auth/signin', credentials);
    // console.log('Login API raw response:', response.data);
    
    // Map the backend response to our frontend types
    const mappedResponse: AuthResponse = {
      accessToken: response.data.accessToken,  // Keep accessToken as is
      tokenType: response.data.tokenType,      // Keep tokenType as is
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      roles: response.data.roles
    };
    
    // console.log('Login API mapped response:', mappedResponse);
    return mappedResponse;
  },

  signup: async (userData: CreateUserRequest): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },
};

// Blog API
export const blogApi = {
  // Public endpoints
  getPublishedPosts: async (page = 0, size = 10): Promise<ApiResponse<BlogPost>> => {
    const response = await api.get(`/api/posts/public?page=${page}&size=${size}`);
    return response.data;
  },

  getPublishedPostBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await api.get(`/api/posts/public/${slug}`);
    return response.data;
  },

  searchPublishedPosts: async (query: string, page = 0, size = 10): Promise<ApiResponse<BlogPost>> => {
    const response = await api.get(`/api/posts/public/search?q=${query}&page=${page}&size=${size}`);
    return response.data;
  },

  getPublishedPostsByTag: async (tag: string, page = 0, size = 10): Promise<ApiResponse<BlogPost>> => {
    const response = await api.get(`/api/posts/public/tags/${tag}?page=${page}&size=${size}`);
    return response.data;
  },

  // Admin endpoints
  getAllPosts: async (page = 0, size = 10): Promise<ApiResponse<BlogPost>> => {
    const response = await api.get(`/api/posts?page=${page}&size=${size}`);
    return response.data;
  },

  getPostById: async (id: string): Promise<BlogPost> => {
    const response = await api.get(`/api/posts/${id}`);
    return response.data;
  },

  createPost: async (post: Omit<BlogPost, 'id' | 'author' | 'authorId' | 'createdAt' | 'updatedAt' | 'slug'>): Promise<BlogPost> => {
    const response = await api.post('/api/posts', post);
    return response.data;
  },

  updatePost: async (id: string, post: Partial<BlogPost>): Promise<BlogPost> => {
    const response = await api.put(`/api/posts/${id}`, post);
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/api/posts/${id}`);
  },

  publishPost: async (id: string): Promise<BlogPost> => {
    const response = await api.put(`/api/posts/${id}/publish`);
    return response.data;
  },
};

export const dashboardApi = {
  getStats: async (): Promise<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalUsers: number;
  }> => {
    try {
      // Fetch posts stats
      const postsResponse = await blogApi.getAllPosts(0, 1);
      const publishedResponse = await api.get('/api/posts/public?page=0&size=1');
      
      // Fetch user count (admin only)
      let userCount = 0;
      try {
        const userResponse = await api.get('/api/auth/users/count');
        userCount = userResponse.data.count;
      } catch (error) {
        // console.log('User count not available (likely not admin)');
      }

      return {
        totalPosts: postsResponse.totalElements,
        publishedPosts: publishedResponse.data.totalElements,
        draftPosts: postsResponse.totalElements - publishedResponse.data.totalElements,
        totalUsers: userCount,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getRecentPosts: async (limit: number = 5): Promise<BlogPost[]> => {
    const response = await blogApi.getAllPosts(0, limit);
    return response.content;
  },
};

export const userApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/auth/users');
    return response.data;
  },

  getUserCount: async (): Promise<number> => {
    const response = await api.get('/api/auth/users/count');
    return response.data.count;
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/auth/users/${userId}`);
    return response.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<{ message: string }> => {
    const response = await api.put(`/api/auth/users/${userId}/role`, { role });
    return response.data;
  },
};

export default api;
