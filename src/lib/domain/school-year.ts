/**
 * גזירת תאריכי שנת הלימודים הישראלית.
 *
 * שנת הלימודים מתחילה ב-1 בספטמבר ומסתיימת בסוף יוני.
 * תווית שנה בפורמט '2026-27' פירושה: ספטמבר 2026 עד קיץ 2027.
 *
 * לוגיקה טהורה בלבד — ראו CLAUDE.md §5, §3.2.
 */

/** שלב חינוך יסודי — סיום מאוחר יותר (30/6). */
export const STAGE_ELEMENTARY = 'יסודי';
/** חטיבת ביניים — סיום מוקדם (20/6). */
export const STAGE_MIDDLE = 'חטיבת ביניים';
/** על-יסודי — סיום מוקדם (20/6). */
export const STAGE_SECONDARY = 'על-יסודי';

/** חודש (0-indexed) ויום של סיום שנה ליסודי: 30 ביוני. */
const ELEMENTARY_END = { month: 5, day: 30 } as const;
/** חודש (0-indexed) ויום של סיום שנה לחטיבה ולעל-יסודי: 20 ביוני. */
const SECONDARY_END = { month: 5, day: 20 } as const;

/** ספטמבר, 0-indexed. תחילת שנת הלימודים. */
const SCHOOL_YEAR_START_MONTH = 8;

/**
 * מסיק את תאריך היעד (יום הלימוד האחרון) לפי שלב החינוך.
 *
 * יסודי → 30/6 · חטיבת ביניים / על-יסודי → 20/6 (CLAUDE.md §5).
 * שלב לא מוכר → ברירת מחדל ל-30/6 (המאוחר), כדי לא להציג פחות ימים מהאמת;
 * ממילא המורה יכול לעקוף ידנית.
 *
 * @param educationStage מחרוזת שלב החינוך כפי שמאוחסנת ב-schools.education_stage.
 * @param year השנה הקלנדרית של חודש יוני (שנת הסיום).
 */
export function inferTargetDate(educationStage: string, year: number): Date {
  const stage = educationStage.trim();
  const end =
    stage === STAGE_MIDDLE || stage === STAGE_SECONDARY ? SECONDARY_END : ELEMENTARY_END;
  return new Date(year, end.month, end.day);
}

/** תחילת שנת הלימודים (1 בספטמבר) עבור שנה שמסתיימת ב-endYear. */
export function schoolYearStart(endYear: number): Date {
  return new Date(endYear - 1, SCHOOL_YEAR_START_MONTH, 1);
}

/**
 * תווית שנת לימודים לפי שנת ההתחלה, למשל 2026 → '2026-27'.
 */
export function formatSchoolYear(startYear: number): string {
  const endShort = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}-${endShort}`;
}

export interface SchoolYear {
  /** השנה הקלנדרית של ספטמבר (תחילת השנה). */
  startYear: number;
  /** השנה הקלנדרית של יוני (סיום השנה). */
  endYear: number;
  /** תווית בפורמט '2026-27'. */
  label: string;
}

/**
 * מזהה לאיזו שנת לימודים שייך תאריך נתון.
 * תאריך בספטמבר ואילך משתייך לשנה שמתחילה באותה שנה קלנדרית;
 * תאריך לפני ספטמבר משתייך לשנה שהתחילה בשנה הקלנדרית הקודמת.
 */
export function getSchoolYear(date: Date): SchoolYear {
  const month = date.getMonth();
  const year = date.getFullYear();
  const startYear = month >= SCHOOL_YEAR_START_MONTH ? year : year - 1;
  return {
    startYear,
    endYear: startYear + 1,
    label: formatSchoolYear(startYear),
  };
}
