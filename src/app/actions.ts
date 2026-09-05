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
