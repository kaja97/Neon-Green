'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';
import api from '@/lib/api';

export default function VerifyOTPPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [farmingMethod, setFarmingMethod] = useState('organic');
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load email/phone from session storage
    const storedEmail = sessionStorage.getItem('register_email');
    const storedPhone = sessionStorage.getItem('register_phone');
    
    if (!storedEmail) {
      router.push('/register/request-otp'); // If no email, go back
    } else {
      setEmail(storedEmail);
      setPhone(storedPhone);
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/register/verify', {
        email,
        phone: phone || undefined,
        otp_code: otpCode,
        password,
        full_name: fullName,
        farming_method: farmingMethod,
        primary_language: primaryLanguage
      });

      const { access_token } = res.data.data;

      // Log the user in
      // Fetch me
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const userData = meRes.data.data;

      login(
        {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          name: userData.farmer_profile?.full_name,
        },
        access_token
      );

      // Clear session storage
      sessionStorage.removeItem('register_email');
      sessionStorage.removeItem('register_phone');

      router.push('/dashboard');
      
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error.message || 'Verification failed');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null; // Prevent rendering until email is loaded

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Email</CardTitle>
          <CardDescription className="text-center">
            We sent a 6-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="otpCode">6-Digit OTP Code</Label>
              <Input
                id="otpCode"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Must be at least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farmingMethod">Farming Method</Label>
                <select
                  id="farmingMethod"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={farmingMethod}
                  onChange={(e) => setFarmingMethod(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="organic">Organic</option>
                  <option value="conventional">Conventional</option>
                  <option value="integrated">Integrated</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryLanguage">Language</Label>
                <select
                  id="primaryLanguage"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={primaryLanguage}
                  onChange={(e) => setPrimaryLanguage(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="en">English</option>
                  <option value="si">Sinhala</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify and Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
