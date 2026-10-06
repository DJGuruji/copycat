'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Turnstile } from '@marsidev/react-turnstile';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security check');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const response = await axios.post('/api/auth/forgot-password', { 
        email,
        turnstileToken 
      });
      setMessage(response.data.message);
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-ink p-4">
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="font-display text-[22px] font-medium text-accent">
          CopyCat
        </Link>
        <p className="mt-2 text-[13px] text-mute">Reset your password</p>
      </div>

      <div className="w-full max-w-[400px] space-y-6 rounded-[10px] border border-line bg-surface p-6 shadow-card">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-[22px] font-medium text-ink">Forgot Password</h1>
          <p className="text-[13px] text-mute">
            Enter your email to receive a password reset link
          </p>
        </div>
        
        {message && (
          <div className="rounded-[8px] bg-positive-soft p-3 text-[13px] text-positive text-center">
            {message}
          </div>
        )}
        
        {error && (
          <div className="rounded-[8px] bg-negative-soft p-3 text-[13px] text-negative text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-[12.5px] font-semibold leading-none text-ink">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder='name@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="flex justify-center pt-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
              onSuccess={(token) => setTurnstileToken(token)}
              options={{ theme: 'light' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-[8px] text-[13px] font-semibold bg-accent text-on-brass border border-accent hover:bg-accent-hover hover:border-accent-hover hover:text-nav-hover-ink transition-colors h-10 px-4 py-2 w-full mt-2"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="text-center text-[13px] text-mute">
          Remember your password?{' '}
          <Link href="/auth/signin" className="text-accent hover:text-accent-hover transition-colors hover:underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
