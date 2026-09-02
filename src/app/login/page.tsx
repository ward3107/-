'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * מסך התחברות (CLAUDE.md §8.1).
 * אותו OAuth של גוגל משמש גם לגישה ליומן — scope calendar.events (§7).
 */
export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.events',
      },
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 p-6 text-center">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">כמה נשאר לי?</h1>
        <p className="mt-2 text-slate-500">ספירה לאחור בימי לימוד עד סוף השנה.</p>
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="rounded-card bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"
      >
        התחברות עם Google
      </button>
    </main>
  );
}
