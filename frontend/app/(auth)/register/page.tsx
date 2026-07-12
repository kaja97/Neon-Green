'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [farmingMethod, setFarmingMethod] = useState('organic');
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  
  // OTP State
  const [step, setStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(120);
  
  // UI State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Timer logic for step 2
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/register/request-otp', {
        email,
        phone: phone || undefined,
      });

      // Transition to OTP step
      setStep(2);
      setCountdown(120);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error.message || 'Failed to request OTP');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Ensure account is set up, log user in, then redirect to dashboard
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

      // The user wants to redirect to login or dashboard? 
      // "allow to login page to login" means redirect to /login
      router.push('/login');
      
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

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/register/request-otp', {
        email,
        phone: phone || undefined,
      });
      setCountdown(120); // Reset timer
    } catch (err: any) {
      setError('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? 'Join AgriFarm AI today.' : `Enter the 6-digit code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 1 ? handleRequestOTP : handleVerifyOTP} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            
            {/* STEP 1: Registration Details */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
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
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="+94771234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
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
              </>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-4">
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
                    autoFocus
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading 
                ? 'Processing...' 
                : step === 1 
                  ? 'Sign Up & Send Code' 
                  : 'Verify & Create Account'
              }
            </Button>
            
            {step === 2 && (
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-gray-500">
                  {countdown > 0 ? `Resend code in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}` : 'Did not receive code?'}
                </span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-green-600 p-0 h-auto font-medium"
                  disabled={countdown > 0 || isLoading}
                  onClick={handleResendOTP}
                >
                  Resend OTP
                </Button>
              </div>
            )}
          </form>
        </CardContent>
        {step === 1 && (
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-green-600 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
