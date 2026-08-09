'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    if (token && userParam) {
      try {
        const user = JSON.parse(userParam);
        login(token, user);
        router.push('/dashboard');
      } catch {
        router.push('/login?error=google_auth_failed');
      }
    } else {
      router.push('/login?error=google_auth_failed');
    }
  }, [searchParams, login, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-500">Signing you in with Google...</p>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-gray-500">Loading...</p>
        </main>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}
