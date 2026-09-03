/**
 * נתוני דמה זמניים למסך הבית — עד שה-seed האמיתי (schools + holidays) מיושם
 * (CLAUDE.md §10 שלב 1 פריט 3). מוחלף בקריאות Supabase בהמשך.
 *
 * ⚠️ TODO: להסיר כשמסך ה-onboarding וה-seed מחוברים.
 */

import type { CustomDay, Holiday } from '@/lib/domain';

export interface MockTeacher {
  fullName: string;
  schoolName: string;
  educationStage: string; // 'יסודי' | 'חטיבת ביניים' | 'על-יסודי'
  themeColor: string;
}

export const MOCK_TEACHER: MockTeacher = {
  fullName: 'מורה לדוגמה',
  schoolName: 'בית ספר יסודי "האלון"',
  educationStage: 'יסודי',
  themeColor: 'emerald',
};

/** חגים לדוגמה לשנת 2026-27 (מורה יהודי). */
export const MOCK_HOLIDAYS: Holiday[] = [
  { id: 'm1', religionId: 1, name: 'ראש השנה', date: '2026-09-12', schoolYear: '2026-27', isSchoolClosed: true, source: 'hebcal' },
  { id: 'm2', religionId: 1, name: 'יום כיפור', date: '2026-09-21', schoolYear: '2026-27', isSchoolClosed: true, source: 'hebcal' },
  { id: 'm3', religionId: 1, name: 'סוכות', date: '2026-09-26', schoolYear: '2026-27', isSchoolClosed: true, source: 'hebcal' },
  { id: 'm4', religionId: 1, name: 'חנוכה (יום א׳)', date: '2026-12-05', schoolYear: '2026-27', isSchoolClosed: false, source: 'hebcal' },
  { id: 'm5', religionId: 1, name: 'פורים', date: '2027-03-02', schoolYear: '2026-27', isSchoolClosed: true, source: 'hebcal' },
  { id: 'm6', religionId: 1, name: 'פסח (יום א׳)', date: '2027-04-01', schoolYear: '2026-27', isSchoolClosed: true, source: 'hebcal' },
];

/** ימים אישיים לדוגמה. */
export const MOCK_CUSTOM_DAYS: CustomDay[] = [
  { id: 'c1', title: 'יום גיבוש צוות', date: '2026-11-10', affectsCountdown: true },
  { id: 'c2', title: 'אסיפת הורים', date: '2027-02-18', affectsCountdown: false },
];
