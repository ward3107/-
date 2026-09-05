import { describe, it, expect } from 'vitest';
import { categorizeSchoolYear, sectorClosureReligionIds } from './school-vacations';
import type { CustomDay, Holiday } from './holidays';

const YOM_KIPPUR: Holiday = {
  id: 'j1', religionId: 1, name: 'יום כיפור', date: '2026-09-21',
  schoolYear: '2026-27', isSchoolClosed: true, source: 'hebcal',
};
const EID: Holiday = {
  id: 'm1', religionId: 2, name: 'עיד אל-פיטר', date: '2027-03-20',
  schoolYear: '2026-27', isSchoolClosed: true, source: 'manual',
};
const MINOR_JEWISH: Holiday = {
  id: 'j2', religionId: 1, name: 'יום השואה', date: '2027-05-04',
  schoolYear: '2026-27', isSchoolClosed: false, source: 'hebcal',
};
const HOLIDAYS = [YOM_KIPPUR, EID, MINOR_JEWISH];

const CUSTOM: CustomDay[] = [
  { id: 'c1', title: 'יום כיף', date: '2026-11-10', affectsCountdown: true },
  { id: 'c2', title: 'אסיפה', date: '2027-02-18', affectsCountdown: false },
];

function keys(dates: Date[]): string[] {
  return dates
    .map((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    .sort();
}

describe('sectorClosureReligionIds', () => {
  it('ממפה כל מגזר לדתות הסוגרות', () => {
    expect(sectorClosureReligionIds('יהודי')).toEqual([1]);
    expect(sectorClosureReligionIds('דרוזי')).toEqual([4]);
    expect(sectorClosureReligionIds('ערבי')).toEqual([2, 3]);
    expect(sectorClosureReligionIds('בדואי')).toEqual([2, 3]);
    expect(sectorClosureReligionIds("צ'רקסי")).toEqual([2, 5]);
    expect(sectorClosureReligionIds('')).toEqual([]);
    expect(sectorClosureReligionIds(null)).toEqual([]);
  });
});

describe('categorizeSchoolYear', () => {
  it('מורה יהודי בבי"ס יהודי: חגיו סוגרים את ביה"ס, אין ימים אישיים דתיים', () => {
    const r = categorizeSchoolYear({
      sector: 'יהודי',
      teacherReligionIds: [1],
      holidays: HOLIDAYS,
      customDays: CUSTOM,
    });
    expect(keys(r.closedDates)).toEqual(['2026-09-21']);
    // אין חג אישי דתי (יום כיפור כבר סגירת ביה"ס); רק היום האישי המנוכה.
    expect(keys(r.personalDates)).toEqual(['2026-11-10']);
    expect(r.items.filter((i) => i.kind === 'personal-holiday')).toHaveLength(0);
  });

  it('מורה מוסלמי בבי"ס יהודי: ביה"ס סגור בחגים יהודיים, עיד הוא יום אישי מנוכה', () => {
    const r = categorizeSchoolYear({
      sector: 'יהודי',
      teacherReligionIds: [2],
      holidays: HOLIDAYS,
      customDays: CUSTOM,
    });
    expect(keys(r.closedDates)).toEqual(['2026-09-21']); // יום כיפור — ביה"ס סגור
    // עיד (דת המורה, ביה"ס פתוח) + יום אישי מנוכה
    expect(keys(r.personalDates)).toEqual(['2026-11-10', '2027-03-20']);
    const eidItem = r.items.find((i) => i.date === '2027-03-20');
    expect(eidItem?.kind).toBe('personal-holiday');
  });

  it('מתעלם מחגים שאינם ימי חופש (is_school_closed=false)', () => {
    const r = categorizeSchoolYear({
      sector: 'יהודי',
      teacherReligionIds: [1],
      holidays: HOLIDAYS,
      customDays: [],
    });
    expect(r.items.some((i) => i.date === '2027-05-04')).toBe(false);
  });

  it('כשהמגזר לא ידוע — נופל לדתות המורה לצורך סגירת ביה"ס', () => {
    const r = categorizeSchoolYear({
      sector: null,
      teacherReligionIds: [2],
      holidays: HOLIDAYS,
      customDays: [],
    });
    expect(keys(r.closedDates)).toEqual(['2027-03-20']); // עיד סוגר (fallback לדת המורה)
  });

  it('יום אישי עם affects_countdown=false מוצג אך לא מנוכה', () => {
    const r = categorizeSchoolYear({
      sector: 'יהודי',
      teacherReligionIds: [1],
      holidays: [],
      customDays: CUSTOM,
    });
    expect(keys(r.personalDates)).toEqual(['2026-11-10']); // רק c1
    expect(r.items.filter((i) => i.kind === 'personal-day')).toHaveLength(2); // שניהם מוצגים
  });
});
