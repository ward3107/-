/**
 * לוגיקת חגים וימים אישיים — טהורה, ללא תלות ב-Supabase או ברשת.
 *
 * אחריות המודול:
 *   - לסנן חגים לפי הדתות של המורה (CLAUDE.md §1 — "לוח החגים שלו בלבד").
 *   - למפות חגים/ימים אישיים למבנים ש-calculateCountdown מצפה להם:
 *       closedDates  = ימים שבהם בית הספר סגור.
 *       personalDates = ימים שהמורה נעדר בהם והם מנוכים מהספירה.
 *   - למזג חגים וימים אישיים לרשימת "הימים הקרובים" של מסך הבית (CLAUDE.md §8.2).
 *
 * תאריכים מאוחסנים כמחרוזת DATE ('yyyy-MM-dd') — ללא שעות/אזור-זמן (CLAUDE.md §11.1).
 */

import { parseISO } from 'date-fns';

export interface Holiday {
  id: string;
  religionId: number;
  /** שם החג בתעתיק עברי (CLAUDE.md §1). */
  name: string;
  /** תאריך בפורמט DATE 'yyyy-MM-dd'. */
  date: string;
  /** תווית שנת לימודים, למשל '2026-27'. */
  schoolYear: string;
  /** האם בית הספר סגור ביום זה. */
  isSchoolClosed: boolean;
  /** מקור הנתון: hebcal | ministry | manual. */
  source: string;
}

export interface CustomDay {
  id: string;
  title: string;
  /** תאריך בפורמט DATE 'yyyy-MM-dd'. */
  date: string;
  /** האם היום מנוכה מספירת ימי הלימוד. */
  affectsCountdown: boolean;
}

/** סוג הפריט ברשימת הימים הקרובים — משמש את קידוד הצבע במסך (CLAUDE.md §9). */
export type UpcomingKind = 'school-closed' | 'personal-holiday' | 'personal-day';

export interface UpcomingItem {
  kind: UpcomingKind;
  title: string;
  /** תאריך בפורמט DATE 'yyyy-MM-dd'. */
  date: string;
  /** התאריך כאובייקט Date (חצות מקומי), לנוחות תצוגה. */
  dateObj: Date;
}

/**
 * ממיר מחרוזת DATE ('yyyy-MM-dd') לאובייקט Date בחצות מקומי.
 * parseISO על מחרוזת ללא שעה מחזיר חצות מקומי — מה שמשמר סמנטיקת DATE.
 */
export function parseDateString(date: string): Date {
  return parseISO(date);
}

/**
 * מסנן חגים כך שיישארו רק אלה השייכים לדתות שהמורה בחר.
 * מורה יכול לבחור כמה דתות (משפחות מעורבות, CLAUDE.md §8.1).
 */
export function filterHolidaysForReligions(
  holidays: Holiday[],
  religionIds: number[],
): Holiday[] {
  const wanted = new Set(religionIds);
  return holidays.filter((h) => wanted.has(h.religionId));
}

/** ימים שבהם בית הספר סגור → נכנסים כ-closedDates לספירה (כלל 3). */
export function getClosedDates(holidays: Holiday[]): Date[] {
  return holidays.filter((h) => h.isSchoolClosed).map((h) => parseDateString(h.date));
}

/**
 * חגים אישיים: החג רלוונטי למורה אך בית הספר פתוח (is_school_closed=false).
 * לפי כלל 3 הם אינם מנוכים מספירת ימי הלימוד הכללית — הם מסומנים בלוח בלבד.
 */
export function getPersonalHolidays(holidays: Holiday[]): Holiday[] {
  return holidays.filter((h) => !h.isSchoolClosed);
}

/** ימים אישיים המנוכים מהספירה (affects_countdown=true) → personalDates (כלל 4). */
export function getPersonalDates(customDays: CustomDay[]): Date[] {
  return customDays.filter((c) => c.affectsCountdown).map((c) => parseDateString(c.date));
}

/**
 * בונה את רשימת "הימים הקרובים" למסך הבית — חגים וימים אישיים מעורבבים,
 * ממוינים לפי תאריך, מהיום והלאה בלבד (CLAUDE.md §8.2).
 *
 * @param from     נקודת ההתחלה (בדרך כלל "היום"); פריטים לפניה מסוננים.
 * @param holidays חגים שכבר סוננו לדתות המורה.
 * @param customDays הימים האישיים של המורה.
 * @param limit    מספר פריטים מרבי להחזרה (ברירת מחדל: כל הפריטים).
 */
export function buildUpcoming(
  from: Date,
  holidays: Holiday[],
  customDays: CustomDay[],
  limit?: number,
): UpcomingItem[] {
  const items: UpcomingItem[] = [];

  for (const h of holidays) {
    items.push({
      kind: h.isSchoolClosed ? 'school-closed' : 'personal-holiday',
      title: h.name,
      date: h.date,
      dateObj: parseDateString(h.date),
    });
  }

  for (const c of customDays) {
    items.push({
      kind: 'personal-day',
      title: c.title,
      date: c.date,
      dateObj: parseDateString(c.date),
    });
  }

  const upcoming = items
    .filter((item) => item.dateObj.getTime() >= startOfLocalDay(from).getTime())
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming;
}

/** חצות מקומי של תאריך נתון — להשוואת ימים ללא שעות. */
function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
