/**
 * ליבת המוצר: ספירת ימי לימוד שנותרו.
 *
 * לוגיקה טהורה בלבד — ללא תלות ב-Supabase, ב-React או ברשת.
 * כל חישוב עובד ברמת יום (DATE), ללא שעות או אזור-זמן, כדי למנוע את הבאג
 * הנפוץ ביותר באפליקציות ספירה (ראו CLAUDE.md §11.1).
 *
 * כללי הספירה (CLAUDE.md §5):
 *   1. שבוע הלימודים בישראל: ראשון–חמישי. שישי ושבת אינם ימי לימוד.
 *   2. יום שנופל בסופ"ש לא מנוכה פעמיים.
 *   3. חג עם is_school_closed=false אינו מנוכה מספירת ימי הלימוד הכללית
 *      (המתקשר פשוט לא מעביר אותו כ-closedDate).
 *   4. יום אישי עם affects_countdown=false מוצג אך לא מנוכה
 *      (המתקשר פשוט לא מעביר אותו כ-personalDate).
 */

import { differenceInCalendarDays, eachDayOfInterval, getDay } from 'date-fns';

export interface CountdownInput {
  /** נקודת ההתחלה לספירה (בדרך כלל "היום"). */
  from: Date;
  /** תאריך היעד — יום הלימוד האחרון של השנה. */
  target: Date;
  /** ימים שבהם בית הספר סגור (חגים עם is_school_closed=true, חופשות). */
  closedDates: Date[];
  /** ימים אישיים המנוכים מהספירה (custom_days עם affects_countdown=true). */
  personalDates: Date[];
  /**
   * תחילת שנת הלימודים — אופציונלי.
   * כאשר מסופק, מאפשר לחשב percentComplete ("X% מהשנה מאחוריך") על בסיס ימי לימוד.
   * ללא ערך זה, percentComplete יהיה 0.
   */
  yearStart?: Date;
}

export interface CountdownResult {
  /** ימי לימוד שנותרו בפועל (כולל היום והיעד אם הם ימי לימוד). */
  schoolDays: number;
  /** ימים קלנדריים שנותרו (כולל היום והיעד). */
  calendarDays: number;
  /** אחוז ימי הלימוד שכבר עברו מתחילת השנה (0 אם yearStart לא סופק). */
  percentComplete: number;
}

/** ימי סוף השבוע לפי getDay של date-fns: 5=שישי, 6=שבת. (0=ראשון ... 4=חמישי) */
const WEEKEND_DAYS: ReadonlySet<number> = new Set([5, 6]);

/** האם התאריך נופל בסוף השבוע (שישי/שבת)? */
export function isWeekend(date: Date): boolean {
  return WEEKEND_DAYS.has(getDay(date));
}

/** האם התאריך הוא יום לימוד פוטנציאלי מבחינת יום בשבוע (ראשון–חמישי)? */
export function isSchoolWeekday(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * מפתח יום מקומי בפורמט yyyy-MM-dd.
 * מחושב מרכיבי התאריך המקומיים (ולא ISO/UTC) כדי לשמור על סמנטיקת DATE
 * ולהימנע מהיסטים של יום שלם באזורי-זמן שונים.
 */
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
 * סופר ימי לימוד בטווח [start, end] (כולל שני הקצוות).
 *
 * הספירה היא "מלמטה למעלה" — מונים רק ימים שהם ימי לימוד תקפים — ולכן
 * יום סוף-שבוע שגם מסומן כסגור/אישי לעולם לא מנוכה פעמיים (כלל 2).
 */
function countSchoolDays(
  start: Date,
  end: Date,
  closed: ReadonlySet<string>,
  personal: ReadonlySet<string>,
): number {
  if (differenceInCalendarDays(end, start) < 0) return 0;

  let count = 0;
  for (const day of eachDayOfInterval({ start, end })) {
    if (isWeekend(day)) continue; // כלל 1 + 2: סופ"ש לעולם אינו נספר
    const key = dateKey(day);
    if (closed.has(key)) continue; // בית הספר סגור
    if (personal.has(key)) continue; // יום אישי מנוכה
    count += 1;
  }
  return count;
}

/**
 * מחשב את ספירת ימי הלימוד שנותרה עד תאריך היעד.
 *
 * זו הפונקציה שכל המוצר נשען עליה — כל טעות בספירה שוברת אמון (CLAUDE.md §11.5).
 */
export function calculateCountdown(input: CountdownInput): CountdownResult {
  const { from, target, closedDates, personalDates, yearStart } = input;

  // היעד כבר עבר → אין ימים שנותרו, השנה הושלמה.
  if (differenceInCalendarDays(target, from) < 0) {
    return { schoolDays: 0, calendarDays: 0, percentComplete: 100 };
  }

  const closed = toKeySet(closedDates);
  const personal = toKeySet(personalDates);

  const schoolDays = countSchoolDays(from, target, closed, personal);
  // +1 כדי לכלול את שני הקצוות (היום והיעד).
  const calendarDays = differenceInCalendarDays(target, from) + 1;

  let percentComplete = 0;
  if (yearStart && differenceInCalendarDays(from, yearStart) > 0) {
    const totalSchoolDays = countSchoolDays(yearStart, target, closed, personal);
    if (totalSchoolDays > 0) {
      const past = totalSchoolDays - schoolDays;
      percentComplete = Math.round((past / totalSchoolDays) * 100);
    }
  }

  return { schoolDays, calendarDays, percentComplete };
}
