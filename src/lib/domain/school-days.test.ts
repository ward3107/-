import { describe, it, expect } from 'vitest';
import {
  calculateCountdown,
  isWeekend,
  isSchoolWeekday,
} from './school-days';

/**
 * חלון בקרה עם ימי שבוע ידועים (0-indexed month):
 *   ראשון 2026-03-01 ... שבת 2026-03-07
 *   שבוע לימוד מלא = 5 ימי לימוד (ראשון–חמישי), שישי+שבת סופ"ש.
 */
const SUN_MAR_1 = new Date(2026, 2, 1); // ראשון
const MON_MAR_2 = new Date(2026, 2, 2);
const TUE_MAR_3 = new Date(2026, 2, 3);
const WED_MAR_4 = new Date(2026, 2, 4);
const THU_MAR_5 = new Date(2026, 2, 5);
const FRI_MAR_6 = new Date(2026, 2, 6); // שישי
const SAT_MAR_7 = new Date(2026, 2, 7); // שבת
const SUN_MAR_8 = new Date(2026, 2, 8);
const SAT_MAR_14 = new Date(2026, 2, 14);

describe('isWeekend / isSchoolWeekday', () => {
  it('מזהה שישי ושבת כסוף שבוע', () => {
    expect(isWeekend(FRI_MAR_6)).toBe(true);
    expect(isWeekend(SAT_MAR_7)).toBe(true);
  });

  it('מזהה ראשון–חמישי כימי לימוד', () => {
    for (const d of [SUN_MAR_1, MON_MAR_2, TUE_MAR_3, WED_MAR_4, THU_MAR_5]) {
      expect(isWeekend(d)).toBe(false);
      expect(isSchoolWeekday(d)).toBe(true);
    }
  });
});

describe('calculateCountdown — ספירת בסיס', () => {
  it('שבוע לימוד מלא = 5 ימי לימוד, 7 ימים קלנדריים', () => {
    const r = calculateCountdown({
      from: SUN_MAR_1,
      target: SAT_MAR_7,
      closedDates: [],
      personalDates: [],
    });
    expect(r.schoolDays).toBe(5);
    expect(r.calendarDays).toBe(7);
    expect(r.percentComplete).toBe(0); // ללא yearStart
  });

  it('כולל את שני הקצוות (יום בודד שהוא יום לימוד = 1)', () => {
    const r = calculateCountdown({
      from: SUN_MAR_1,
      target: SUN_MAR_1,
      closedDates: [],
      personalDates: [],
    });
    expect(r.schoolDays).toBe(1);
    expect(r.calendarDays).toBe(1);
  });

  it('יום בודד שנופל בסוף שבוע = 0 ימי לימוד אך 1 יום קלנדרי', () => {
    const r = calculateCountdown({
      from: SAT_MAR_7,
      target: SAT_MAR_7,
      closedDates: [],
      personalDates: [],
    });
    expect(r.schoolDays).toBe(0);
    expect(r.calendarDays).toBe(1);
  });

  it('שבוע וחצי: ראשון עד ראשון הבא = 6 ימי לימוד', () => {
    const r = calculateCountdown({
      from: SUN_MAR_1,
      target: SUN_MAR_8,
      closedDates: [],
      personalDates: [],
    });
    expect(r.schoolDays).toBe(6);
    expect(r.calendarDays).toBe(8);
  });
});

describe('calculateCountdown — ניכויים (כללים 2-4)', () => {
  it('יום סגור באמצע השבוע מנוכה', () => {
    const r = calculateCountdown({
      from: SUN_MAR_1,
      target: SAT_MAR_7,
      closedDates: [WED_MAR_4],
      personalDates: [],
    });
    expect(r.schoolDays).toBe(4);
  });

  it('יום אישי באמצע השבוע מנוכה', () => {
    const r = calculateCountdown({
      from: SUN_MAR_1,
      target: SAT_MAR_7,
      closedDates: [],
      personalDates: [TUE_MAR_3],
    });
    expect(r.schoolDays).toBe(4);
  });

  it('יום סגור + יום אישי שונים מנוכים שניהם', () => {
    const r = calculateCountdown({
      from: SUN_MAR_1,
      target: SAT_MAR_7,
      closedDates: [WED_MAR_4],
      personalDates: [TUE_MAR_3],
    });
    expect(r.schoolDays).toBe(3);
  });

  it('כלל 2: יום סוף-שבוע שמסומן גם כסגור וגם כאישי לא מנוכה פעמיים', () => {
    const r = calculateCountdown({
      from: SUN_MAR_1,
      target: SAT_MAR_7,
      closedDates: [FRI_MAR_6, SAT_MAR_7],
      personalDates: [FRI_MAR_6, SAT_MAR_7],
    });
    // הסופ"ש ממילא לא נספר → עדיין 5 ימי לימוד.
    expect(r.schoolDays).toBe(5);
  });

  it('תאריכים כפולים ב-closedDates נספרים פעם אחת', () => {
    const r = calculateCountdown({
      from: SUN_MAR_1,
      target: SAT_MAR_7,
      closedDates: [WED_MAR_4, WED_MAR_4, new Date(2026, 2, 4)],
      personalDates: [],
    });
    expect(r.schoolDays).toBe(4);
  });

  it('אותו יום שגם סגור וגם אישי מנוכה פעם אחת בלבד', () => {
    const r = calculateCountdown({
      from: SUN_MAR_1,
      target: SAT_MAR_7,
      closedDates: [WED_MAR_4],
      personalDates: [WED_MAR_4],
    });
    expect(r.schoolDays).toBe(4);
  });
});

describe('calculateCountdown — קצוות', () => {
  it('יעד שכבר עבר מחזיר אפסים ו-100%', () => {
    const r = calculateCountdown({
      from: SAT_MAR_7,
      target: SUN_MAR_1,
      closedDates: [],
      personalDates: [],
    });
    expect(r).toEqual({ schoolDays: 0, calendarDays: 0, percentComplete: 100 });
  });
});

describe('calculateCountdown — percentComplete', () => {
  it('מחשב אחוז ימי לימוד שעברו כאשר yearStart מסופק', () => {
    // yearStart..target = שבועיים = 10 ימי לימוד; from = ראשון השני → נותרו 5.
    const r = calculateCountdown({
      from: SUN_MAR_8,
      target: SAT_MAR_14,
      closedDates: [],
      personalDates: [],
      yearStart: SUN_MAR_1,
    });
    expect(r.schoolDays).toBe(5);
    expect(r.percentComplete).toBe(50);
  });

  it('percentComplete נשאר 0 כאשר from שווה ל-yearStart (טרם עבר יום)', () => {
    const r = calculateCountdown({
      from: SUN_MAR_1,
      target: SAT_MAR_14,
      closedDates: [],
      personalDates: [],
      yearStart: SUN_MAR_1,
    });
    expect(r.percentComplete).toBe(0);
  });
});
