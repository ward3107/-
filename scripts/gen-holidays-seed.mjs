// מחולל seed לחגים לשנת לימודים אחת.
//
// יהודי: לוח החופשות הרשמי של משרד החינוך לשנה"ל תשפ"ז (2026-27),
//        מורחב ליום-אחר-יום (ראשון–שישי; שבת ממילא אינה יום לימוד).
// שאר הדתות: רשימה ידנית מקורבת (source='manual') — לאימות מול מסמך המגזר.
//
// ⚠️ להצליב מול המסמך הרשמי לפי מגזר (CLAUDE.md §6, §11.3).
//
// שימוש:  node scripts/gen-holidays-seed.mjs > supabase/seed_holidays_2026-27.sql

const SCHOOL_YEAR = '2026-27';
const JEWISH = 1;
const MUSLIM = 2;
const CHRISTIAN = 3;
const DRUZE = 4;
const CIRCASSIAN = 5;

// חופשות בית הספר במגזר היהודי — תשפ"ז (מקור: לוח משרד החינוך).
const JEWISH_CLOSED_BLOCKS = [
  { name: 'ראש השנה', start: '2026-09-11', end: '2026-09-13' },
  { name: 'יום כיפור', start: '2026-09-20', end: '2026-09-24' },
  { name: 'סוכות', start: '2026-09-25', end: '2026-10-03' },
  { name: 'חנוכה', start: '2026-12-06', end: '2026-12-12' },
  { name: 'פורים', start: '2027-03-23', end: '2027-03-24' },
  { name: 'פסח', start: '2027-04-13', end: '2027-04-28' },
  { name: 'יום העצמאות', start: '2027-05-12', end: '2027-05-12' },
  { name: 'שבועות', start: '2027-06-10', end: '2027-06-11' },
];

// ימי ציון — לימודים מתקיימים (לא מנוכים), אך מוצגים בלוח.
const JEWISH_OPEN_DAYS = [
  { name: 'ט״ו בשבט', date: '2027-01-23' },
  { name: 'יום השואה', date: '2027-05-04' },
  { name: 'יום הזיכרון', date: '2027-05-11' },
  { name: 'ל״ג בעומר', date: '2027-05-25' },
  { name: 'יום ירושלים', date: '2027-06-04' },
];

// ידני, מקורב — לאימות מול מסמך משרד החינוך. תאריכים מוסלמיים תלויי ראיית הירח (±1-2 ימים).
const MANUAL = [
  { religion: MUSLIM, name: 'עיד אל-פיטר', date: '2027-03-20', closed: true },
  { religion: MUSLIM, name: 'עיד אל-אדחא', date: '2027-05-27', closed: true },
  { religion: MUSLIM, name: 'ראש השנה ההיג׳רי', date: '2027-06-16', closed: false },
  { religion: CHRISTIAN, name: 'חג המולד (מערבי)', date: '2026-12-25', closed: true },
  { religion: CHRISTIAN, name: 'חג המולד (מזרחי)', date: '2027-01-07', closed: true },
  { religion: CHRISTIAN, name: 'יום שישי הטוב (מזרחי)', date: '2027-04-30', closed: true },
  { religion: CHRISTIAN, name: 'פסחא (מזרחי)', date: '2027-05-02', closed: true },
  { religion: DRUZE, name: 'נבי שועייב', date: '2027-04-25', closed: true },
  { religion: DRUZE, name: 'עיד אל-אדחא', date: '2027-05-27', closed: true },
  { religion: CIRCASSIAN, name: 'ראש השנה הצ׳רקסי', date: '2027-03-21', closed: false },
];

function esc(s) {
  return s.replace(/'/g, "''");
}

function eachDate(startISO, endISO) {
  const [ys, ms, ds] = startISO.split('-').map(Number);
  const [ye, me, de] = endISO.split('-').map(Number);
  const out = [];
  const cur = new Date(ys, ms - 1, ds);
  const end = new Date(ye, me - 1, de);
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function buildRows() {
  const rows = [];
  // חופשות יהודיות — יום-אחר-יום, ראשון–שישי (שבת מדולגת).
  for (const b of JEWISH_CLOSED_BLOCKS) {
    for (const d of eachDate(b.start, b.end)) {
      if (d.getDay() === 6) continue; // שבת
      rows.push({ religion: JEWISH, name: b.name, date: iso(d), closed: true, source: 'ministry' });
    }
  }
  for (const o of JEWISH_OPEN_DAYS) {
    rows.push({ religion: JEWISH, name: o.name, date: o.date, closed: false, source: 'ministry' });
  }
  for (const m of MANUAL) {
    rows.push({ ...m, source: 'manual' });
  }
  return rows;
}

function main() {
  const rows = buildRows();
  const lines = [];
  lines.push('-- ============================================================================');
  lines.push(`-- Seed חגים לשנת ${SCHOOL_YEAR} (נוצר ע"י scripts/gen-holidays-seed.mjs)`);
  lines.push('-- יהודי: לוח החופשות הרשמי של משרד החינוך תשפ"ז (יום-אחר-יום).');
  lines.push('-- שאר הדתות: ידני, מקורב — לאימות מול מסמך המגזר (§6, §11.3).');
  lines.push('-- אידמפוטנטי: מוחק חגי השנה הזו לפני ההכנסה.');
  lines.push('-- ============================================================================');
  lines.push('');
  lines.push(`delete from holidays where school_year = '${SCHOOL_YEAR}';`);
  lines.push('');
  lines.push('insert into holidays (religion_id, name, date, school_year, is_school_closed, source) values');
  const values = rows.map(
    (r) =>
      `  (${r.religion}, '${esc(r.name)}', '${r.date}', '${SCHOOL_YEAR}', ${r.closed}, '${r.source}')`,
  );
  lines.push(values.join(',\n') + ';');
  lines.push('');
  process.stdout.write(lines.join('\n'));
}

main();
