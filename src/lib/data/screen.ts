/**
 * מודל מסך אחיד למסכי הבית/לוח/פרופיל (server-only).
 *
 * כשיש Supabase — טוען את המורה המחובר (ומפנה ל-login/onboarding לפי הצורך).
 * כשאין קרדנציאלס — נופל לנתוני דמה, כדי שהאפליקציה תרוץ גם בפיתוח/CI.
 */
import 'server-only';
import { redirect } from 'next/navigation';
import {
  getSchoolYear,
  inferTargetDate,
  parseDateString,
  schoolYearStart,
} from '@/lib/domain';
import type { CustomDay, Holiday } from '@/lib/domain';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { loadTeacherContext } from '@/lib/data/teacher';
import { MOCK_CUSTOM_DAYS, MOCK_HOLIDAYS, MOCK_TEACHER } from '@/lib/mock-data';

export interface ScreenModel {
  teacherName: string;
  schoolName: string;
  educationStage: string;
  themeColor: string;
  holidays: Holiday[];
  customDays: CustomDay[];
  target: Date;
  yearStart: Date;
  label: string;
}

export async function getScreenModel(): Promise<ScreenModel> {
  const today = new Date();
  const { endYear, label } = getSchoolYear(today);

  if (!hasSupabaseEnv) {
    return {
      teacherName: MOCK_TEACHER.fullName,
      schoolName: MOCK_TEACHER.schoolName,
      educationStage: MOCK_TEACHER.educationStage,
      themeColor: MOCK_TEACHER.themeColor,
      holidays: MOCK_HOLIDAYS,
      customDays: MOCK_CUSTOM_DAYS,
      target: inferTargetDate(MOCK_TEACHER.educationStage, endYear),
      yearStart: schoolYearStart(endYear),
      label,
    };
  }

  const res = await loadTeacherContext();
  if (res.status === 'no-auth') redirect('/login');
  if (res.status === 'no-teacher') redirect('/onboarding');

  const d = res.data;
  const educationStage = d.school?.educationStage ?? 'יסודי';
  const target = d.teacher.targetDate
    ? parseDateString(d.teacher.targetDate)
    : inferTargetDate(educationStage, endYear);

  return {
    teacherName: d.teacher.fullName ?? 'מורה',
    schoolName: d.school?.name ?? '',
    educationStage,
    themeColor: d.teacher.themeColor,
    holidays: d.holidays,
    customDays: d.customDays,
    target,
    yearStart: schoolYearStart(endYear),
    label,
  };
}
