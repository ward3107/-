'use client';

import { useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';

/** כפתור התנתקות — מנקה את הסשן ומחזיר למסך ההתחברות. */
export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      await createClient().auth.signOut();
      window.location.href = '/login';
    });
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isPending}
      className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 ring-1 ring-slate-200 disabled:opacity-50"
    >
      {isPending ? 'מתנתק…' : 'התנתקות'}
    </button>
  );
}
