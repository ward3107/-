/**
 * אמירת מוטיבציה מתחלפת יומית (CLAUDE.md §8.2).
 * מסגור חיובי — לא "המתנה" אלא התקדמות.
 */
const QUOTES = [
  'עוד קצת, ואתם שם. כל יום נחשב.',
  'מורה טוב משפיע לנצח — גם היום.',
  'צעד אחר צעד, השנה מתקדמת יפה.',
  'הכיתה שלכם מזל שיש להם אתכם.',
  'נשימה עמוקה — אתם עושים עבודה חשובה.',
  'כל בוקר הוא הזדמנות חדשה להשפיע.',
  'הקיץ מתקרב, אבל הרגעים עכשיו שווים.',
  'סבלנות ונחישות — שילוב מנצח של מורים.',
];

/** בוחר אמירה יציבה לכל יום קלנדרי (אותה אמירה לאורך היום). */
export function dailyMotivation(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length] ?? QUOTES[0]!;
}
