'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { searchMockSchools, type School } from '@/lib/schools';

/** חיפוש בתי ספר על שם / יישוב / סמל (CLAUDE.md §8.1). */
export async function searchSchools(query: string): Promise<School[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  if (hasSupabaseEnv) {
    // ניקוי תווים בעלי משמעות ב-PostgREST or-filter.
    const safe = q.replace(/[,()*%]/g, ' ');
    const supabase = await createClient();
    const { data } = await supabase
      .from('schools')
      .select('id, symbol, name, city, sector, supervision, education_stage')
      .or(`name.ilike.%${safe}%,city.ilike.%${safe}%,symbol.ilike.%${safe}%`)
      .limit(10);

    if (data && data.length > 0) {
      return data.map((r) => ({
        id: r.id as string,
        symbol: r.symbol as string,
        name: r.name as string,
        city: (r.city as string | null) ?? null,
        sector: (r.sector as string | null) ?? null,
        supervision: (r.supervision as string | null) ?? null,
        educationStage: (r.education_stage as string | null) ?? null,
      }));
    }
  }

  // נפילה לנתוני דמה כשאין פרויקט מחובר או אין תוצאות.
  return searchMockSchools(q);
}

export interface OnboardingInput {
  schoolId: string;
  educationStage: string;
  religionIds: number[];
  targetDate: string; // 'yyyy-MM-dd'
  themeColor: string;
  schoolWeek: number; // 5 או 6
  dayOff: number | null; // 0=ראשון … 6=שבת; null=אין
}

/** שומר את פרופיל המורה בסיום ה-onboarding (§8.1). */
export async function completeOnboarding(input: OnboardingInput): Promise<void> {
  if (!hasSupabaseEnv) {
    // מצב דמו — אין היכן לשמור; נמשיך למסך הבית.
    redirect('/');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const meta = user.user_metadata ?? {};
  const fullName = (meta.full_name as string | undefined) ?? (meta.name as string | undefined) ?? null;

  await supabase.from('teachers').upsert({
    id: user.id,
    full_name: fullName,
    email: user.email,
    school_id: input.schoolId,
    target_date: input.targetDate,
    theme_color: input.themeColor,
    school_week: input.schoolWeek === 6 ? 6 : 5,
    day_off: input.dayOff,
  });

  // teacher_religions: מוחקים ומכניסים מחדש (multi-select).
  await supabase.from('teacher_religions').delete().eq('teacher_id', user.id);
  if (input.religionIds.length > 0) {
    await supabase
      .from('teacher_religions')
      .insert(input.religionIds.map((rid) => ({ teacher_id: user.id, religion_id: rid })));
  }

  redirect('/');
}
