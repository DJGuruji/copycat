'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'react-hot-toast';

function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [success, setSuccess] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get('verified');
    const urlError = searchParams.get('error');

    if (verified === 'true') {
      setSuccess('Email verified successfully! You can now sign in.');
      toast.success('Email verified successfully!');
    }

    if (urlError) {
      setError(urlError);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security check');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        turnstileToken,
      });
      
      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
        } else {
          setError(result.error);
        }
        return;
      }
      
      router.push('/');
      router.refresh();
    } catch (error) {
      setError('An error occurred during sign in');
      console.error('Sign in error:', error);
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
        <p className="mt-2 text-[13px] text-mute">Welcome back to your workspace</p>
      </div>

      <div className="w-full max-w-[400px] space-y-6 rounded-[10px] border border-line bg-surface p-6 shadow-card">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-[22px] font-medium text-ink">Sign In</h1>
          <p className="text-[13px] text-mute">
            Enter your email to sign in to your account
          </p>
        </div>
        
        {error && (
          <div className="rounded-[8px] bg-negative-soft p-3 text-[13px] text-negative text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-[8px] bg-positive-soft p-3 text-[13px] text-positive text-center">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[12.5px] font-semibold leading-none text-ink">
                Password
              </label>
              <Link href="/auth/forgot-password" title="Forgot password" className="text-[12px] text-mute hover:text-accent transition-colors">
                Forgot password?
              </Link>
            </div>
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="text-center text-[13px] text-mute">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-accent hover:text-accent-hover transition-colors hover:underline underline-offset-4">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-line border-t-accent"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
 