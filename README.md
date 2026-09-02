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

מיושם **שלב 1, פריט 2** — סכמת DB + RLS תחת `supabase/`:

| קובץ | תוכן |
|------|------|
| `supabase/migrations/0001_initial_schema.sql` | כל הטבלאות והאינדקסים (CLAUDE.md §4), תאריכים כ-`DATE` בלבד |
| `supabase/migrations/0002_rls.sql` | הפעלת RLS ומדיניות גישה לכל טבלה |
| `supabase/seed.sql` | seed לחמש הדתות (נתוני יסוד קבועים) |

החלת הסכמה על פרויקט Supabase:

```bash
# עם Supabase CLI, לאחר supabase link:
supabase db push          # מריץ את המיגרציות
psql "$DATABASE_URL" -f supabase/seed.sql   # או דרך ה-SQL editor
```

## פקודות

```bash
npm install      # התקנת תלויות
npm test         # הרצת הבדיקות (vitest)
npm run typecheck  # בדיקת טיפוסים (tsc --noEmit, strict)
```

## הבא בתור

שלב 1: seed נותר — ייבוא `schools` ממשרד החינוך ו-`holidays` (Hebcal + ידני), פריט 3.
לאחר מכן שלב 2: Auth + onboarding.
