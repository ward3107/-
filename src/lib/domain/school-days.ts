/**
 * ליבת המוצר: ספירת ימי לימוד שנותרו.
 *
 * לוגיקה טהורה בלבד — ללא תלות ב-Supabase, ב-React או ברשת.
 * כל חישוב עובד ברמת יום (DATE), ללא שעות או אזור-זמן (ראו CLAUDE.md §11.1).
 *
 * כללי הספירה (CLAUDE.md §5):
 *   1. שבוע הלימודים בישראל: ראשון–חמישי (5 ימים). בבתי ספר עם 6 ימים גם שישי.
 *   2. יום שנופל בסופ"ש / ביום שאינו יום לימוד לא מנוכה פעמיים.
 *   3. חג עם is_school_closed=false אינו מנוכה מספירת ימי הלימוד.
 *   4. יום אישי עם affects_countdown=false מוצג אך לא מנוכה.
 *   5. יום החופש השבועי הקבוע של המורה מנוכה מימי העבודה שלו.
 */

import { differenceInCalendarDays, eachDayOfInterval, getDay } from 'date-fns';

export interface CountdownInput {
  from: Date;
  target: Date;
  closedDates: Date[];
  personalDates: Date[];
  yearStart?: Date;
  /** ימי הלימוד בשבוע (getDay: 0=ראשון…6=שבת). ברירת מחדל: ראשון–חמישי. */
  schoolDaysOfWeek?: number[];
  /** יום החופש השבועי הקבוע של המורה (0–6), אם קיים — מנוכה מימי העבודה. */
  weeklyDayOff?: number | null;
}

export interface CountdownResult {
  schoolDays: number;
  calendarDays: number;
  percentComplete: number;
}

/** שבוע לימודים בן 5 ימים — ראשון עד חמישי. */
export const SCHOOL_WEEK_5 = [0, 1, 2, 3, 4];
/** שבוע לימודים בן 6 ימים — ראשון עד שישי. */
export const SCHOOL_WEEK_6 = [0, 1, 2, 3, 4, 5];

/** ממיר מספר ימי לימוד בשבוע (5/6) לרשימת ימי השבוע. */
export function schoolDaysForWeek(weekType: number): number[] {
  return weekType === 6 ? SCHOOL_WEEK_6 : SCHOOL_WEEK_5;
}

const WEEKEND_DAYS: ReadonlySet<number> = new Set([5, 6]);

/** האם התאריך נופל בסוף השבוע (שישי/שבת)? */
export function isWeekend(date: Date): boolean {
  return WEEKEND_DAYS.has(getDay(date));
}

/** האם התאריך הוא יום לימוד פוטנציאלי (ראשון–חמישי)? */
export function isSchoolWeekday(date: Date): boolean {
  return !isWeekend(date);
}

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toKeySet(dates: Date[]): Set<string> {
  const set = new Set<string>();
  for (const d of dates) set.add(dateKey(d));
  return set;
}

/**
 * סופר ימי לימוד בטווח [start, end] (כולל), בגישת "מלמטה למעלה" —
 * מונים רק ימים שהם יום לימוד תקף, ולכן אין ניכוי כפול (כלל 2).
 */
function countSchoolDays(
  start: Date,
  end: Date,
  closed: ReadonlySet<string>,
  personal: ReadonlySet<string>,
  schoolDays: ReadonlySet<number>,
  weeklyDayOff: number | null,
): number {
  if (differenceInCalendarDays(end, start) < 0) return 0;

  let count = 0;
  for (const day of eachDayOfInterval({ start, end })) {
    const weekday = getDay(day);
    if (!schoolDays.has(weekday)) continue; // לא יום לימוד בשבוע (כלל 1+2)
    if (weeklyDayOff !== null && weekday === weeklyDayOff) continue; // יום חופש שבועי (כלל 5)
    const key = dateKey(day);
    if (closed.has(key)) continue; // בית הספר סגור
    if (personal.has(key)) continue; // יום אישי מנוכה
    count += 1;
  }
  return count;
}

/** מחשב את ספירת ימי הלימוד שנותרה עד תאריך היעד. */
export function calculateCountdown(input: CountdownInput): CountdownResult {
  const { from, target, closedDates, personalDates, yearStart } = input;

  if (differenceInCalendarDays(target, from) < 0) {
    return { schoolDays: 0, calendarDays: 0, percentComplete: 100 };
  }

  const closed = toKeySet(closedDates);
  const personal = toKeySet(personalDates);
  const schoolDaysSet = new Set(input.schoolDaysOfWeek ?? SCHOOL_WEEK_5);
  const weeklyDayOff = input.weeklyDayOff ?? null;

  const schoolDays = countSchoolDays(from, target, closed, personal, schoolDaysSet, weeklyDayOff);
  const calendarDays = differenceInCalendarDays(target, from) + 1;

  let percentComplete = 0;
  if (yearStart && differenceInCalendarDays(from, yearStart) > 0) {
    const total = countSchoolDays(yearStart, target, closed, personal, schoolDaysSet, weeklyDayOff);
    if (total > 0) {
      percentComplete = Math.round(((total - schoolDays) / total) * 100);
    }
  }

  return { schoolDays, calendarDays, percentComplete };
}
