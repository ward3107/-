# כמה נשאר לי?

ספירה לאחור ב**ימי לימוד** (לא ימי קלנדר) עד סוף שנת הלימודים, למורים בישראל.
אפיון טכני מלא: [`CLAUDE.md`](./CLAUDE.md).

## מצב הפיתוח

מיושם **שלב 1, פריט 1** מסדר הבנייה (CLAUDE.md §10): ליבת הלוגיקה הטהורה
תחת `src/lib/domain/`, לפני כל UI, עם כיסוי בדיקות מלא.

| קובץ | תוכן |
|------|------|
| `src/lib/domain/school-days.ts` | `calculateCountdown` — ספירת ימי לימוד, ללא ניכוי כפול בסופ"ש |
| `src/lib/domain/school-year.ts` | `inferTargetDate`, גזירת שנת לימודים ותוויות |
| `src/lib/domain/holidays.ts` | סינון חגים לפי דת, מיפוי ל-closed/personal dates, מיזוג ימים קרובים |

כל הלוגיקה טהורה — ללא תלות ב-Supabase, ב-React או ברשת (CLAUDE.md §3.2),
ומטפלת בתאריכים ברמת `DATE` בלבד כדי להימנע מבאגי אזור-זמן (CLAUDE.md §11.1).

## פקודות

```bash
npm install      # התקנת תלויות
npm test         # הרצת הבדיקות (vitest)
npm run typecheck  # בדיקת טיפוסים (tsc --noEmit, strict)
```

## הבא בתור

שלב 1: סכמת DB + RLS (פריט 2), seed data — religions / schools / holidays (פריט 3).
