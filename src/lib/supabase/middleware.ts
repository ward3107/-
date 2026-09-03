import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasSupabaseEnv } from './env';

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * מרענן את סשן ה-Supabase בכל בקשה (דפוס SSR רשמי).
 * כשאין קרדנציאלס — מעביר הלאה בלי לגעת ב-auth (מצב דמו).
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  if (!hasSupabaseEnv) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // חשוב: לא להוסיף קוד בין יצירת הלקוח ל-getUser (דפוס רשמי).
  await supabase.auth.getUser();

  return supabaseResponse;
}
