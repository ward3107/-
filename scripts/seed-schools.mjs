// ייבוא בתי ספר ממשרד החינוך (data.gov.il) לטבלת schools (CLAUDE.md §6.1).
//
// דורש service_role (כתיבה עוקפת RLS). הרצה מקומית בלבד — לא בקוד לקוח.
//
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   node scripts/seed-schools.mjs
//
// הנתונים מכילים את כל השנים וגם גני ילדים; הסקריפט משאיר רק את הרשומה
// האחרונה לכל סמל מוסד, וממפה את שלב החינוך ל-יסודי/חטיבת ביניים/על-יסודי.

const RESOURCE_ID = '5548fd63-5868-4053-ad81-98caddc5e232';
const CKAN = 'https://data.gov.il/api/3/action/datastore_search';
const PAGE = 32000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('חסר SUPABASE_URL או SUPABASE_SERVICE_ROLE_KEY בסביבה.');
  process.exit(1);
}

function mapStage(row) {
  const t = `${row['סוג מוסד'] ?? ''} ${row['סוג חינוך מוסד'] ?? ''}`;
  if (t.includes('גן')) return null; // גני ילדים — מחוץ לסקופ הנוכחי
  if (t.includes('חטיבת ביניים') || t.includes('חט"ב')) return 'חטיבת ביניים';
  if (
    t.includes('על יסודי') ||
    t.includes('על-יסודי') ||
    t.includes('חטיבה עליונה') ||
    t.includes('תיכון')
  ) {
    return 'על-יסודי';
  }
  if (t.includes('יסודי')) return 'יסודי';
  return null;
}

async function fetchAll() {
  const bySymbol = new Map(); // symbol -> {row, year}
  let offset = 0;
  for (;;) {
    const url = `${CKAN}?resource_id=${RESOURCE_ID}&limit=${PAGE}&offset=${offset}`;
    const res = await fetch(url);
    const json = await res.json();
    const records = json.result.records;
    if (!records || records.length === 0) break;
    for (const r of records) {
      const symbol = String(r['סמל מוסד'] ?? '').trim();
      if (!symbol) continue;
      const year = Number(r['שנה'] ?? 0);
      const prev = bySymbol.get(symbol);
      if (!prev || year >= prev.year) bySymbol.set(symbol, { row: r, year });
    }
    offset += records.length;
    console.error(`  נשלפו ${offset}/${json.result.total} רשומות…`);
    if (offset >= json.result.total) break;
  }
  return bySymbol;
}

function toSchool(symbol, r) {
  return {
    symbol,
    name: String(r['שם מוסד'] ?? '').trim(),
    city: (r['שם ישוב'] ?? null) || null,
    sector: (r['מגזר'] ?? null) || null,
    supervision: (r['פיקוח'] ?? null) || null,
    education_stage: mapStage(r),
  };
}

async function upsert(rows) {
  const BATCH = 1000;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/schools?on_conflict=symbol`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      console.error('שגיאת upsert:', res.status, await res.text());
      process.exit(1);
    }
    console.error(`  הוכנסו ${Math.min(i + BATCH, rows.length)}/${rows.length}…`);
  }
}

async function main() {
  console.error('שולף נתונים מ-data.gov.il…');
  const bySymbol = await fetchAll();
  const rows = [];
  for (const [symbol, { row }] of bySymbol) {
    const s = toSchool(symbol, row);
    if (s.name) rows.push(s);
  }
  console.error(`סה"כ ${rows.length} בתי ספר ייחודיים. מכניס ל-Supabase…`);
  await upsert(rows);
  console.error('הושלם ✅');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
