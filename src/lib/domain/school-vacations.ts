/**
 * ההבחנה שמצדיקה את המוצר (CLAUDE.md §1): שני מקורות נפרדים לימי חופש למורה —
 *   1. חופשות בית הספר — לפי המגזר של בית הספר (כולם סגורים באותם ימים).
 *   2. חגים אישיים — לפי הדת של המורה, שמותר לו להיעדר בהם גם אם ביה"ס פתוח.
 *
 * לוגיקה טהורה, מכוסה בבדיקות.
 */
import { parseDateString } from './holidays';
import type { CustomDay, Holiday, UpcomingItem, UpcomingKind } from './holidays';

export const RELIGION_ID = {
  jewish: 1,
  muslim: 2,
  christian: 3,
  druze: 4,
  circassian: 5,
} as const;

/**
 * מיפוי מגזר בית הספר → הדתות שחגיהן סוגרים את בית הספר.
 * מכסה את כלל המגזרים בישראל (CLAUDE.md §6 — לוח החופשות לפי מגזר).
 */
export function sectorClosureReligionIds(sector: string | null | undefined): number[] {
  const s = (sector ?? '').trim();
  if (!s) return [];
  if (s.includes('יהוד')) return [RELIGION_ID.jewish];
  if (s.includes('דרוז')) return [RELIGION_ID.druze];
  if (s.includes('צרקס') || s.includes('צ׳רקס') || s.includes("צ'רקס")) {
    return [RELIGION_ID.muslim, RELIGION_ID.circassian];
  }
  if (s.includes('ערב') || s.includes('בדוא')) {
    return [RELIGION_ID.muslim, RELIGION_ID.christian];
  }
  return [];
}

export interface CategorizedDay {
  date: string; // 'yyyy-MM-dd'
  kind: UpcomingKind;
  title: string;
  customId?: string; // רק לימים אישיים, לצורך מחיקה
}

export interface Categorization {
  /** ימים שבהם בית הספר סגור (מגזר) — מנוכים מהספירה. */
  closedDates: Date[];
  /** ימים אישיים מנוכים: חגי דת המורה כשביה"ס פתוח + ימים אישיים affects_countdown. */
  personalDates: Date[];
  /** כל הפריטים לתצוגה בלוח/רשימה, מסווגים לצבע. */
  items: CategorizedDay[];
}

interface CategorizeInput {
  sector: string | null | undefined;
  teacherReligionIds: number[];
  holidays: Holiday[]; // כל חגי השנה (כל הדתות)
  customDays: CustomDay[];
}

/**
 * מסווג את חגי השנה + הימים האישיים לשלוש קטגוריות, ומחזיר את קבוצות הניכוי
 * לספירת "כמה נשאר לי" (ימי העבודה בפועל של המורה).
 */
export function categorizeSchoolYear(input: CategorizeInput): Categorization {
  const closureFromSector = sectorClosureReligionIds(input.sector);
  // אם המגזר לא ידוע — נופלים לדתות המורה, כדי שלפחות חגיו יסגרו.
  const closureReligions = new Set(
    closureFromSector.length > 0 ? closureFromSector : input.teacherReligionIds,
  );
  const teacherReligions = new Set(input.teacherReligionIds);

  const closedKeys = new Set<string>();
  const personalKeys = new Set<string>();
  const closedDates: Date[] = [];
  const personalDates: Date[] = [];
  const items: CategorizedDay[] = [];

  // 1. בית ספר סגור — חגי המגזר שמסומנים כסגירה.
  for (const h of input.holidays) {
    if (!h.isSchoolClosed || !closureReligions.has(h.religionId)) continue;
    if (closedKeys.has(h.date)) continue;
    closedKeys.add(h.date);
    closedDates.push(parseDateString(h.date));
    items.push({ date: h.date, kind: 'school-closed', title: h.name });
  }

  // 2. חג אישי — חג של דת המורה (יום חופש) שבו ביה"ס פתוח.
  for (const h of input.holidays) {
    if (!h.isSchoolClosed || !teacherReligions.has(h.religionId)) continue;
    if (closedKeys.has(h.date) || personalKeys.has(h.date)) continue;
    personalKeys.add(h.date);
    personalDates.push(parseDateString(h.date));
    items.push({ date: h.date, kind: 'personal-holiday', title: h.name });
  }

  // 3. ימים אישיים ידניים.
  for (const c of input.customDays) {
    items.push({ date: c.date, kind: 'personal-day', title: c.title, customId: c.id });
    if (c.affectsCountdown) personalDates.push(parseDateString(c.date));
  }

  return { closedDates, personalDates, items };
}

/** בונה רשימת "ימים קרובים" מהפריטים המסווגים — מהיום והלאה, ממוין. */
export function upcomingFromItems(
  from: Date,
  items: CategorizedDay[],
  limit?: number,
): UpcomingItem[] {
  const startOfDay = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const upcoming = items
    .map((i) => ({ kind: i.kind, title: i.title, date: i.date, dateObj: parseDateString(i.date) }))
    .filter((i) => i.dateObj.getTime() >= startOfDay)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming;
}
