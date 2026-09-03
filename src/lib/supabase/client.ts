import { createBrowserClient } from '@supabase/ssr';

/**
 * לקוח Supabase לצד הדפדפן (Client Components).
 * קורא את משתני הסביבה הציבוריים בזמן קריאה — בטוח לייבוא ללא קרדנציאלס.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
