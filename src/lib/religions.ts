/**
 * חמש הדתות (CLAUDE.md §1, §4). ה-id תואם לסדר ה-seed ב-supabase/seed.sql.
 * משמש לבחירה מרובה ב-onboarding (§8.1) — יש מורים ממשפחות מעורבות.
 */
export const RELIGIONS = [
  { id: 1, code: 'jewish', name: 'יהודי' },
  { id: 2, code: 'muslim', name: 'מוסלמי' },
  { id: 3, code: 'christian', name: 'נוצרי' },
  { id: 4, code: 'druze', name: 'דרוזי' },
  { id: 5, code: 'circassian', name: 'צ׳רקסי' },
] as const;

export type Religion = (typeof RELIGIONS)[number];
