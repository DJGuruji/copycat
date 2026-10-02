'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password,
      });
      
      setMessage(response.data.message);
      
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-ink p-4">
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="text-[21px] font-bold tracking-[-0.02em] text-accent">
          CopyCat
        </Link>
        <p className="mt-2 text-[13px] text-mute">Create a new password</p>
      </div>

      <div className="w-full max-w-[400px] space-y-6 rounded-[10px] border border-line bg-surface p-6 shadow-card">
        <div className="space-y-2 text-center">
          <h1 className="text-[21px] font-bold tracking-[-0.02em] text-ink">Reset Password</h1>
          <p className="text-[13px] text-mute">
            Enter your new password below
          </p>
        </div>
        
        {message && (
          <div className="rounded-[8px] bg-positive-soft p-3 text-[13px] text-positive text-center">
            {message}
            <div className="mt-2 text-[12px] text-positive">Redirecting to sign in...</div>
          </div>
        )}
        
        {error && (
          <div className="rounded-[8px] bg-negative-soft p-3 text-[13px] text-negative text-center">
            {error}
          </div>
        )}
        
        {token && !message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-[12.5px] font-semibold leading-none text-ink">
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-[12.5px] font-semibold leading-none text-ink">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder='••••••••'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold bg-accent text-nav-ink hover:bg-accent-hover transition-colors h-10 px-4 py-2 w-full mt-2"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        <div className="text-center text-[13px] text-mute">
          <Link href="/auth/signin" className="text-accent hover:text-accent-hover transition-colors hover:underline underline-offset-4">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-ink p-4">
        <div className="w-full max-w-[400px] rounded-[10px] border border-line bg-surface p-8 shadow-card">
          <div className="text-center text-[13px] text-mute">Loading...</div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
