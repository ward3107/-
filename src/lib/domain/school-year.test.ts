import { describe, it, expect } from 'vitest';
import {
  inferTargetDate,
  schoolYearStart,
  formatSchoolYear,
  getSchoolYear,
  STAGE_ELEMENTARY,
  STAGE_MIDDLE,
  STAGE_SECONDARY,
} from './school-year';

function ymd(d: Date): [number, number, number] {
  return [d.getFullYear(), d.getMonth(), d.getDate()];
}

describe('inferTargetDate', () => {
  it('יסודי → 30 ביוני', () => {
    expect(ymd(inferTargetDate(STAGE_ELEMENTARY, 2027))).toEqual([2027, 5, 30]);
  });

  it('חטיבת ביניים → 20 ביוני', () => {
    expect(ymd(inferTargetDate(STAGE_MIDDLE, 2027))).toEqual([2027, 5, 20]);
  });

  it('על-יסודי → 20 ביוני (ולא נופל בטעות ל"יסודי")', () => {
    expect(ymd(inferTargetDate(STAGE_SECONDARY, 2027))).toEqual([2027, 5, 20]);
  });

  it('שלב לא מוכר → ברירת מחדל 30 ביוני', () => {
    expect(ymd(inferTargetDate('גן', 2027))).toEqual([2027, 5, 30]);
  });

  it('מתעלם מרווחים מיותרים', () => {
    expect(ymd(inferTargetDate('  יסודי  ', 2027))).toEqual([2027, 5, 30]);
    expect(ymd(inferTargetDate(' על-יסודי ', 2027))).toEqual([2027, 5, 20]);
  });
});

describe('schoolYearStart', () => {
  it('מחזיר 1 בספטמבר של השנה הקודמת לשנת הסיום', () => {
    expect(ymd(schoolYearStart(2027))).toEqual([2026, 8, 1]);
  });
});

describe('formatSchoolYear', () => {
  it('בונה תווית בפורמט yyyy-yy', () => {
    expect(formatSchoolYear(2026)).toBe('2026-27');
    expect(formatSchoolYear(2009)).toBe('2009-10');
  });

  it('מרפד אפס במעבר עשור', () => {
    expect(formatSchoolYear(1999)).toBe('1999-00');
  });
});

describe('getSchoolYear', () => {
  it('ספטמבר משתייך לשנה שמתחילה באותה שנה קלנדרית', () => {
    expect(getSchoolYear(new Date(2026, 8, 1))).toEqual({
      startYear: 2026,
      endYear: 2027,
      label: '2026-27',
    });
  });

  it('יוני משתייך לשנה שהתחילה בספטמבר הקודם', () => {
    expect(getSchoolYear(new Date(2027, 5, 20))).toEqual({
      startYear: 2026,
      endYear: 2027,
      label: '2026-27',
    });
  });

  it('אוגוסט (לפני ספטמבר) עדיין שייך לשנה הקודמת', () => {
    expect(getSchoolYear(new Date(2026, 7, 31))).toEqual({
      startYear: 2025,
      endYear: 2026,
      label: '2025-26',
    });
  });
});
