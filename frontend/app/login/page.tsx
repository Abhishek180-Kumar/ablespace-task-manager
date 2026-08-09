'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Triangle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await api.auth.login({ email, password });
      login(response.accessToken, response.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await api.auth.guestLogin();
      login(response.accessToken, response.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Guest login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL;
      if (googleUrl) {
        window.location.href = googleUrl;
      } else {
        setError('Google OAuth is not configured. Add NEXT_PUBLIC_GOOGLE_OAUTH_URL environment variable to enable it.');
      }
    } catch {
      setError('Google login is not available');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12 text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      <div className="w-full max-w-[384px] space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-950 text-white dark:bg-white dark:text-gray-950">
            <Triangle className="h-3.5 w-3.5 fill-current" />
          </span>
          AbleSpace
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-base font-semibold">Let&apos;s get back on track</h1>
          <p className="mt-1 text-xs text-gray-500">Enter your email below to login to your account.</p>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-left text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-2">
            <label className="sr-only" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-950"
            />
            <label className="sr-only" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-950"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full rounded-full bg-gray-950 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-gray-950"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="mt-2 h-10 w-full rounded-full bg-gray-950 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-gray-950"
          >
            Continue as Guest
          </button>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="mt-2 h-10 w-full rounded-full border border-gray-200 bg-white text-sm font-medium dark:border-gray-700 dark:bg-gray-900"
          >
            {isGoogleLoading ? 'Connecting...' : 'Login with Google'}
          </button>
        </section>

        <p className="px-8 text-xs leading-5 text-gray-500">
          By clicking continue, you agree to our <Link className="underline" href="/">Terms of Service</Link> and <Link className="underline" href="/">Privacy Policy</Link>.
        </p>
        <Link href="/register" className="block text-sm text-accent">Create an account</Link>
      </div>
    </main>
  );
}
