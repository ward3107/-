import { describe, it, expect } from 'vitest';
import {
  filterHolidaysForReligions,
  getClosedDates,
  getPersonalHolidays,
  getPersonalDates,
  buildUpcoming,
  parseDateString,
} from './holidays';
import type { Holiday, CustomDay } from './holidays';

const JEWISH = 1;
const MUSLIM = 2;
const DRUZE = 4;

const holidays: Holiday[] = [
  {
    id: 'h1',
    religionId: JEWISH,
    name: 'ראש השנה',
    date: '2026-09-12',
    schoolYear: '2026-27',
    isSchoolClosed: true,
    source: 'hebcal',
  },
  {
    id: 'h2',
    religionId: MUSLIM,
    name: 'עיד אל-פיטר',
    date: '2027-03-20',
    schoolYear: '2026-27',
    isSchoolClosed: false, // בית הספר פתוח → חג אישי
    source: 'manual',
  },
  {
    id: 'h3',
    religionId: DRUZE,
    name: 'נבי שועייב',
    date: '2027-04-25',
    schoolYear: '2026-27',
    isSchoolClosed: true,
    source: 'manual',
  },
];

const customDays: CustomDay[] = [
  { id: 'c1', title: 'יום כיף משפחתי', date: '2027-05-10', affectsCountdown: true },
  { id: 'c2', title: 'אסיפת הורים', date: '2027-05-12', affectsCountdown: false },
];

function keys(dates: Date[]): string[] {
  return dates
    .map((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    .sort();
}

describe('parseDateString', () => {
  it('ממיר מחרוזת DATE לחצות מקומי (ללא היסט אזור-זמן)', () => {
    const d = parseDateString('2026-09-12');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8);
    expect(d.getDate()).toBe(12);
  });
});

describe('filterHolidaysForReligions', () => {
  it('שומר רק חגים של הדתות שנבחרו', () => {
    const r = filterHolidaysForReligions(holidays, [JEWISH, DRUZE]);
    expect(r.map((h) => h.id)).toEqual(['h1', 'h3']);
  });

  it('מספר דתות — משפחה מעורבת', () => {
    const r = filterHolidaysForReligions(holidays, [JEWISH, MUSLIM]);
    expect(r.map((h) => h.id).sort()).toEqual(['h1', 'h2']);
  });

  it('ללא דתות → רשימה ריקה', () => {
    expect(filterHolidaysForReligions(holidays, [])).toEqual([]);
  });
});

describe('getClosedDates / getPersonalHolidays', () => {
  it('getClosedDates מחזיר רק ימים שבהם בית הספר סגור', () => {
    expect(keys(getClosedDates(holidays))).toEqual(['2026-09-12', '2027-04-25']);
  });

  it('getPersonalHolidays מחזיר רק חגים שבהם בית הספר פתוח (כלל 3)', () => {
    const r = getPersonalHolidays(holidays);
    expect(r.map((h) => h.id)).toEqual(['h2']);
  });
});

describe('getPersonalDates', () => {
  it('מחזיר רק ימים אישיים שמנוכים (affects_countdown=true, כלל 4)', () => {
    expect(keys(getPersonalDates(customDays))).toEqual(['2027-05-10']);
  });
});

describe('buildUpcoming', () => {
  it('ממזג ומיין חגים וימים אישיים לפי תאריך', () => {
    const from = new Date(2026, 0, 1); // 1 בינואר 2026 — לפני הכל
    const r = buildUpcoming(from, holidays, customDays);
    expect(r.map((i) => i.date)).toEqual([
      '2026-09-12',
      '2027-03-20',
      '2027-04-25',
      '2027-05-10',
      '2027-05-12',
    ]);
  });

  it('מקודד את סוג הפריט לצביעה (סגור / חג אישי / יום אישי)', () => {
    const from = new Date(2026, 0, 1);
    const r = buildUpcoming(from, holidays, customDays);
    const byDate = Object.fromEntries(r.map((i) => [i.date, i.kind]));
    expect(byDate['2026-09-12']).toBe('school-closed');
    expect(byDate['2027-03-20']).toBe('personal-holiday');
    expect(byDate['2027-05-10']).toBe('personal-day');
    expect(byDate['2027-05-12']).toBe('personal-day');
  });

  it('מסנן פריטים שכבר עברו ושומר על "היום" עצמו', () => {
    const from = new Date(2027, 3, 25); // נבי שועייב — היום עצמו נשאר
    const r = buildUpcoming(from, holidays, customDays);
    expect(r.map((i) => i.date)).toEqual(['2027-04-25', '2027-05-10', '2027-05-12']);
  });

  it('מכבד את מגבלת מספר הפריטים', () => {
    const from = new Date(2026, 0, 1);
    const r = buildUpcoming(from, holidays, customDays, 2);
    expect(r.map((i) => i.date)).toEqual(['2026-09-12', '2027-03-20']);
  });
});
