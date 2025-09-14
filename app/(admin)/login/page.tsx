"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, isAuthenticated, user, checkAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  // Check auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      console.log('=== LOGIN PAGE AUTH CHECK ===');
      
      // Check if user is already authenticated
      checkAuth();
      
      // Small delay to allow auth state to update
      setTimeout(() => {
        console.log('Auth state:', { isAuthenticated, user: user?.username });
        
        if (isAuthenticated && user) {
          console.log('User already authenticated, redirecting...');
          redirectBasedOnRole(user.roles);
        } else {
          console.log('User not authenticated, showing login form');
        }
        
        setIsCheckingAuth(false);
      }, 100);
    };

    initAuth();
  }, [checkAuth]);

  // Also check when auth state changes
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated && user) {
      console.log('Auth state changed, user is now authenticated');
      redirectBasedOnRole(user.roles);
    }
  }, [isAuthenticated, user, isCheckingAuth]);

  const redirectBasedOnRole = (roles: string[]) => {
    const isAdmin = roles.includes("ROLE_ADMIN");
    const isEditor = roles.includes("ROLE_EDITOR");

    console.log('Redirecting user with roles:', roles);

    if (isAdmin) {
      console.log('Redirecting admin to dashboard');
      router.push("/admin/dashboard");
    } else if (isEditor) {
      console.log('Redirecting editor to panel');
      router.push("/editor");
    } else {
      console.log('Redirecting user to home');
      router.push("/");
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");

    try {
      console.log('Attempting login for:', data.username);
      const response = await authApi.login(data);
      console.log('Login successful:', response);

      // Store auth state
      login(
        {
          id: response.id,
          username: response.username,
          email: response.email,
          roles: response.roles,
        },
        response.accessToken
      );

      // Redirect based on role
      redirectBasedOnRole(response.roles);

    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking initial auth state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting authenticated users
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">B</span>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...register("username", { required: "Username is required" })}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-sm"
              disabled={isLoading}
            >
              ← Back to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
