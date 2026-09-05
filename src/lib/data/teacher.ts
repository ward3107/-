/**
 * טעינת נתוני המורה המחובר מ-Supabase (server-only).
 *
 * מחזיר תוצאה מובחנת כדי שהמסכים יחליטו: להפנות ל-login, ל-onboarding,
 * או להציג נתונים אמיתיים. כל הקריאות עוברות דרך RLS (המורה רואה רק את עצמו).
 */
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { getSchoolYear } from '@/lib/domain';
import type { CustomDay, Holiday } from '@/lib/domain';

export interface TeacherContext {
  teacher: {
    id: string;
    fullName: string | null;
    email: string | null;
    themeColor: string;
    targetDate: string | null; // 'yyyy-MM-dd'
    schoolWeek: number; // 5 או 6
    dayOff: number | null; // 0=ראשון … 6=שבת; null=אין
  };
  school: { name: string | null; educationStage: string | null; sector: string | null } | null;
  religionIds: number[];
  /** כל חגי השנה (כל הדתות) — הסיווג לפי מגזר/דת נעשה בשכבת ה-domain. */
  holidays: Holiday[];
  customDays: CustomDay[];
}

export type TeacherLoad =
  | { status: 'no-auth' }
  | { status: 'no-teacher' }
  | { status: 'ok'; data: TeacherContext };

interface SchoolJoin {
  name: string | null;
  education_stage: string | null;
  sector: string | null;
}

function normalizeSchool(value: unknown): SchoolJoin | null {
  if (Array.isArray(value)) return (value[0] as SchoolJoin) ?? null;
  return (value as SchoolJoin) ?? null;
}

/** טוען את הקשר המלא של המורה המחובר. */
export async function loadTeacherContext(): Promise<TeacherLoad> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'no-auth' };

  const { data: teacherRow } = await supabase
    .from('teachers')
    .select(
      'id, full_name, email, theme_color, target_date, school_week, day_off, school_id, schools(name, education_stage, sector)',
    )
    .eq('id', user.id)
    .maybeSingle();

  if (!teacherRow) return { status: 'no-teacher' };

  const schoolYear = getSchoolYear(new Date()).label;

  // רץ במקביל — מקצר את זמן הטעינה בכל ניווט.
  // חגים: נטענים כולם (כל הדתות) לשנה; הסיווג לפי מגזר/דת נעשה ב-domain.
  const [religionRes, customRes, holidayRes, overrideRes] = await Promise.all([
    supabase.from('teacher_religions').select('religion_id').eq('teacher_id', user.id),
    supabase
      .from('custom_days')
      .select('id, title, date, affects_countdown')
      .eq('teacher_id', user.id)
      .order('date'),
    supabase
      .from('holidays')
      .select('id, religion_id, name, date, school_year, is_school_closed, source')
      .eq('school_year', schoolYear)
      .order('date'),
    supabase
      .from('holiday_overrides')
      .select('holiday_id, hidden, custom_name, custom_date')
      .eq('teacher_id', user.id),
  ]);

  const religionIds = (religionRes.data ?? []).map((r) => r.religion_id as number);
  const customDays = (customRes.data ?? []).map(mapCustomDay);

  // החלת עקיפות אישיות על החגים המוגדרים-מראש (הסתרה / שם / תאריך).
  const overrides = new Map<string, { hidden: boolean; name: string | null; date: string | null }>();
  for (const o of overrideRes.data ?? []) {
    overrides.set(o.holiday_id as string, {
      hidden: (o.hidden as boolean) ?? false,
      name: (o.custom_name as string | null) ?? null,
      date: (o.custom_date as string | null) ?? null,
    });
  }
  const holidays: Holiday[] = [];
  for (const row of holidayRes.data ?? []) {
    const h = mapHoliday(row);
    const ov = overrides.get(h.id);
    if (ov?.hidden) continue;
    holidays.push({
      ...h,
      name: ov?.name ?? h.name,
      date: ov?.date ?? h.date,
    });
  }

  return {
    status: 'ok',
    data: {
      teacher: {
        id: teacherRow.id as string,
        fullName: (teacherRow.full_name as string | null) ?? null,
        email: (teacherRow.email as string | null) ?? null,
        themeColor: (teacherRow.theme_color as string | null) ?? 'emerald',
        targetDate: (teacherRow.target_date as string | null) ?? null,
        schoolWeek: (teacherRow.school_week as number | null) ?? 5,
        dayOff: (teacherRow.day_off as number | null) ?? null,
      },
      school: normalizeSchool(teacherRow.schools)
        ? {
            name: normalizeSchool(teacherRow.schools)!.name,
            educationStage: normalizeSchool(teacherRow.schools)!.education_stage,
            sector: normalizeSchool(teacherRow.schools)!.sector,
          }
        : null,
      religionIds,
      holidays,
      customDays,
    },
  };
}

function mapHoliday(row: Record<string, unknown>): Holiday {
  return {
    id: row.id as string,
    religionId: row.religion_id as number,
    name: row.name as string,
    date: row.date as string,
    schoolYear: row.school_year as string,
    isSchoolClosed: row.is_school_closed as boolean,
    source: row.source as string,
  };
}

function mapCustomDay(row: Record<string, unknown>): CustomDay {
  return {
    id: row.id as string,
    title: row.title as string,
    date: row.date as string,
    affectsCountdown: row.affects_countdown as boolean,
  };
}
