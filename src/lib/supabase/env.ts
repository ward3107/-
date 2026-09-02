/**
 * האם קרדנציאלס של Supabase מוגדרים.
 * מאפשר לאפליקציה לפעול עם נתוני דמה כשאין פרויקט מחובר (פיתוח/דמו).
 */
export const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
