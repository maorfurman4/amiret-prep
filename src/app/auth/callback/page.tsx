'use client';

import { Suspense, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackHandler() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';
    const safeNext = next.startsWith('/') ? next : '/';

    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(() => router.replace(safeNext))
        .catch(() => router.replace('/auth/login?error=callback'));
    } else {
      router.replace(safeNext);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-white text-center space-y-4">
        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-slate-300">מתחבר...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">טוען...</div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
