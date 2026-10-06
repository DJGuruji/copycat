'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security check');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await axios.post('/api/auth/register', {
        name,
        email,
        password,
        turnstileToken,
      });
      
      router.push('/auth/signin?registered=true');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', error);
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
        <p className="mt-2 text-[13px] text-mute">Create an account to get started</p>
      </div>

      <div className="w-full max-w-[400px] space-y-6 rounded-[10px] border border-line bg-surface p-6 shadow-card">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-[22px] font-medium text-ink">Create an account</h1>
          <p className="text-[13px] text-mute">
            Enter your details below to create your account
          </p>
        </div>
        
        {error && (
          <div className="rounded-[8px] bg-negative-soft p-3 text-[13px] text-negative text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-[12.5px] font-semibold leading-none text-ink">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder='John Doe'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-[12.5px] font-semibold leading-none text-ink">
              Email
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
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-[12.5px] font-semibold leading-none text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-[12.5px] font-semibold leading-none text-ink">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder='••••••••'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center text-[13px] text-mute">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-accent hover:text-accent-hover transition-colors hover:underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
 