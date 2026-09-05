'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * מסך התחברות (CLAUDE.md §8.1) — עיצוב זכוכית מינימליסטי בסגנון iOS.
 * אותו OAuth של גוגל משמש גם לגישה ליומן — scope calendar.events (§7).
 */
export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.events',
      },
    });
    if (error) setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <div className="app-bg" aria-hidden />

      <div className="glass w-full max-w-sm rounded-[36px] px-7 py-10 text-center">
        <div
          className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[28px] text-4xl"
          style={{ background: 'var(--theme)', boxShadow: '0 14px 30px -10px var(--theme)' }}
        >
          <span aria-hidden>🎒</span>
        </div>

        <h1 className="text-3xl font-black text-slate-800">כמה נשאר לי?</h1>
        <p className="mt-2 text-slate-500">
          ספירה לאחור בימי לימוד עד סוף השנה — מותאמת לבית הספר ולחגים שלך.
        </p>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3.5 font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-transform active:scale-95 disabled:opacity-60"
        >
          <GoogleMark />
          {loading ? 'מתחבר…' : 'התחברות עם Google'}
        </button>

        <p className="mt-6 text-xs text-slate-400">
          נשתמש בחשבון Google גם לסנכרון עתידי ליומן.
        </p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
