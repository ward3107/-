'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';

async function currentUserId() {
  if (!hasSupabaseEnv) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** מוסיף יום אישי (custom_day) למורה המחובר. */
export async function addCustomDay(input: {
  title: string;
  date: string;
  affectsCountdown: boolean;
}) {
  if (!hasSupabaseEnv) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const title = input.title.trim();
  if (!title || !input.date) return;

  await supabase.from('custom_days').insert({
    teacher_id: user.id,
    title,
    date: input.date,
    affects_countdown: input.affectsCountdown,
  });

  revalidatePath('/');
  revalidatePath('/calendar');
}

/** מוחק יום אישי של המורה המחובר. */
export async function deleteCustomDay(id: string) {
  const uid = await currentUserId();
  if (!uid) return;
  const supabase = await createClient();
  await supabase.from('custom_days').delete().eq('id', id).eq('teacher_id', uid);
  revalidatePath('/');
  revalidatePath('/calendar');
}

/** מעדכן את ערכת הצבע של המורה. */
export async function updateTeacherTheme(themeColor: string) {
  const uid = await currentUserId();
  if (!uid) return;
  const supabase = await createClient();
  await supabase.from('teachers').update({ theme_color: themeColor }).eq('id', uid);
  revalidatePath('/', 'layout');
}

/** מעדכן את לוח הזמנים של המורה: מספר ימי לימוד בשבוע ויום החופש הקבוע. */
export async function updateSchedule(input: { schoolWeek: number; dayOff: number | null }) {
  const uid = await currentUserId();
  if (!uid) return;
  const supabase = await createClient();
  await supabase
    .from('teachers')
    .update({ school_week: input.schoolWeek === 6 ? 6 : 5, day_off: input.dayOff })
    .eq('id', uid);
  revalidatePath('/', 'layout');
}

/** עקיפה אישית של חג מוגדר-מראש: הסתרה / שינוי שם / הזזת תאריך. */
export async function setHolidayOverride(
  holidayId: string,
  patch: { hidden?: boolean; name?: string | null; date?: string | null },
) {
  const uid = await currentUserId();
  if (!uid) return;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('holiday_overrides')
    .select('hidden, custom_name, custom_date')
    .eq('teacher_id', uid)
    .eq('holiday_id', holidayId)
    .maybeSingle();

  await supabase.from('holiday_overrides').upsert(
    {
      teacher_id: uid,
      holiday_id: holidayId,
      hidden: patch.hidden ?? (existing?.hidden as boolean | undefined) ?? false,
      custom_name:
        patch.name !== undefined ? patch.name : ((existing?.custom_name as string | null) ?? null),
      custom_date:
        patch.date !== undefined ? patch.date : ((existing?.custom_date as string | null) ?? null),
    },
    { onConflict: 'teacher_id,holiday_id' },
  );

  revalidatePath('/');
  revalidatePath('/calendar');
}

/** מבטל עקיפה — משחזר את החג המקורי. */
export async function resetHolidayOverride(holidayId: string) {
  const uid = await currentUserId();
  if (!uid) return;
  const supabase = await createClient();
  await supabase.from('holiday_overrides').delete().eq('teacher_id', uid).eq('holiday_id', holidayId);
  revalidatePath('/');
  revalidatePath('/calendar');
}
