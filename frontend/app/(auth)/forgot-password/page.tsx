'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password/request-otp', {
        email_or_phone: identifier,
      });

      // Show OTP and new password fields
      setStep(2);
      
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error.message || 'Failed to request password reset');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password/verify', {
        email_or_phone: identifier,
        otp_code: otpCode,
        new_password: newPassword,
      });

      // After successful reset, the user is automatically logged in 
      // by the backend and tokens are returned.
      // But for better UX per user instruction: "then redirect to Login page."
      // Let's redirect to login page so they can test their new password.
      
      router.push('/login');
      
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error.message || 'Reset failed');
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
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? 'Enter your email or phone to reset your password' : `Enter the OTP sent to ${identifier}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 1 ? handleRequestOTP : handleVerifyAndReset} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            
            {/* STEP 1: Enter Email/Phone */}
            {step === 1 && (
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
            )}

            {/* STEP 2: Verify OTP and Set New Password */}
            {step === 2 && (
              <>
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
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter a new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading 
                ? 'Processing...' 
                : step === 1 
                  ? 'Send OTP Code' 
                  : 'Update Password'
              }
            </Button>
            
          </form>
        </CardContent>
        {step === 1 && (
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-500">
              Remember your password?{' '}
              <Link href="/login" className="text-green-600 font-semibold hover:underline">
                Back to Login
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
