/**
 * טיפוס בית ספר + חיפוש נתוני דמה, עד שה-seed ממשרד החינוך מיושם
 * (CLAUDE.md §6.1, §10 שלב 1 פריט 3).
 *
 * חוק ברזל (CLAUDE.md §11.4): המורה בוחר בית ספר מרשימה עם סמל מוסד —
 * לעולם לא מקליד שם חופשי.
 */
export interface School {
  id: string;
  symbol: string;
  name: string;
  city: string | null;
  sector: string | null;
  supervision: string | null;
  educationStage: string | null; // 'יסודי' | 'חטיבת ביניים' | 'על-יסודי'
}

/** מדגם בתי ספר לפיתוח/דמו (מוחלף בקריאת Supabase). */
export const MOCK_SCHOOLS: School[] = [
  { id: 'mock-411303', symbol: '411303', name: 'יסודי האלון', city: 'חיפה', sector: 'יהודי', supervision: 'ממלכתי', educationStage: 'יסודי' },
  { id: 'mock-511201', symbol: '511201', name: 'חטיבת ביניים רבין', city: 'תל אביב-יפו', sector: 'יהודי', supervision: 'ממלכתי', educationStage: 'חטיבת ביניים' },
  { id: 'mock-611402', symbol: '611402', name: 'תיכון עתיד', city: 'ירושלים', sector: 'יהודי', supervision: 'ממלכתי', educationStage: 'על-יסודי' },
  { id: 'mock-711505', symbol: '711505', name: 'אלנור אלערבי', city: 'נצרת', sector: 'ערבי', supervision: 'ממלכתי', educationStage: 'יסודי' },
  { id: 'mock-811606', symbol: '811606', name: 'יסודי נבי שועייב', city: 'דלית אל-כרמל', sector: 'דרוזי', supervision: 'ממלכתי', educationStage: 'יסודי' },
];

/** חיפוש דמה על שם / יישוב / סמל מוסד (CLAUDE.md §8.1). */
export function searchMockSchools(query: string): School[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return MOCK_SCHOOLS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.city?.toLowerCase().includes(q) ?? false) ||
      s.symbol.includes(q),
  ).slice(0, 10);
}
