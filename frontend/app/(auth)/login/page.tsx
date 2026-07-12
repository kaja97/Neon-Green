'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Authenticate
      const loginRes = await api.post('/auth/login', {
        email_or_phone: identifier,
        password: password,
      });

      const { access_token } = loginRes.data.data;

      // 2. Fetch User Profile
      // We temporarily set the token in Axios config just for this call, 
      // although the interceptor handles it if it's in the store. 
      // But the store updates asynchronously via Zustand.
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      const userData = meRes.data.data;

      // 3. Update Store
      login(
        {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          name: userData.farmer_profile?.full_name,
        },
        access_token
      );

      // 4. Redirect
      router.push('/dashboard');
      
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error.message || 'Invalid credentials');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your email or phone number to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Phone</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="farmer@example.com or +9477..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-green-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-green-600 font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
