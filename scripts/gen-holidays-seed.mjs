// מחולל seed לחגים לשנת לימודים אחת.
//
// יהודי: נשלף אוטומטית מ-Hebcal (לוח ישראל, שמות עבריים).
// שאר הדתות: רשימה ידנית מקורבת (source='manual').
//
// ⚠️ is_school_closed הוא best-effort לפי לוח החופשות הישראלי הרגיל.
//    המקור הסמכותי הוא מסמך ימי החופשה של משרד החינוך (CLAUDE.md §6, §11.3) —
//    יש להצליב ולתקן מולו לפני הסתמכות על הספירה.
//
// שימוש:  node scripts/gen-holidays-seed.mjs > supabase/seed_holidays_2026-27.sql

const SCHOOL_YEAR = '2026-27';
const START = '2026-09-01';
const END = '2027-08-31';
const JEWISH = 1;
const MUSLIM = 2;
const CHRISTIAN = 3;
const DRUZE = 4;
const CIRCASSIAN = 5;

// חגים יהודיים שבהם בית הספר סגור (לפי title_orig / משפחת חג).
const CLOSED_EXACT = new Set([
  'Rosh Hashana 5787',
  'Rosh Hashana II',
  'Yom Kippur',
  'Shmini Atzeret',
  'Purim',
  'Shushan Purim',
  'Yom HaZikaron',
  "Yom HaAtzma'ut",
  'Shavuot',
]);
// משפחות חג רב-יומיות שכולן חופשה בבתי הספר.
const CLOSED_PREFIX = ['Erev Sukkot', 'Sukkot', 'Erev Pesach', 'Pesach', 'Chanukah'];
// פריטים לא-רלוונטיים שלא נכניס כלל.
const SKIP_PREFIX = [
  'Leil Selichot',
  'Erev Rosh Hashana',
  'Erev Yom Kippur',
  'Erev Purim',
  'Purim Katan',
  'Shushan Purim Katan',
  'Chag HaBanot',
  'Pesach Sheni',
  "Tu B'Av",
  "Tish'a B'Av",
  "Erev Tish'a B'Av",
  'Jabotinsky Day',
  'Herzl Day',
  'Hebrew Language Day',
  'Family Day',
  'Ben-Gurion Day',
  'Yitzhak Rabin Memorial Day',
  'Yom HaAliyah',
  'Yom HaAliyah School Observance',
];

function esc(s) {
  return s.replace(/'/g, "''");
}

function isClosedJewish(titleOrig) {
  if (CLOSED_EXACT.has(titleOrig)) return true;
  return CLOSED_PREFIX.some((p) => titleOrig.startsWith(p));
}

function skip(titleOrig) {
  return SKIP_PREFIX.some((p) => titleOrig.startsWith(p));
}

async function fetchJewish() {
  const url = `https://www.hebcal.com/hebcal?cfg=json&v=1&maj=on&min=on&mod=on&nx=off&i=on&lg=h&start=${START}&end=${END}`;
  const res = await fetch(url);
  const data = await res.json();
  const rows = [];
  for (const item of data.items) {
    if (item.category !== 'holiday') continue;
    if (skip(item.title_orig)) continue;
    rows.push({
      religion: JEWISH,
      name: item.hebrew,
      date: item.date,
      closed: isClosedJewish(item.title_orig) || item.yomtov === true,
      source: 'hebcal',
    });
  }
  return rows;
}

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
].map((r) => ({ ...r, source: 'manual' }));

async function main() {
  const jewish = await fetchJewish();
  const rows = [...jewish, ...MANUAL];

  const lines = [];
  lines.push('-- ============================================================================');
  lines.push(`-- Seed חגים לשנת ${SCHOOL_YEAR} (נוצר ע"י scripts/gen-holidays-seed.mjs)`);
  lines.push('-- יהודי: Hebcal (לוח ישראל). שאר הדתות: ידני, מקורב.');
  lines.push('-- ⚠️ is_school_closed = best-effort; להצליב מול מסמך ימי החופשה של משרד החינוך (§6, §11.3).');
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
