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

מיושם **תחילת שלב 2** — אפליקציית Next.js 15 (App Router, RTL עברית, Tailwind):

| נתיב | תוכן |
|------|------|
| `src/app/layout.tsx` | shell עברי RTL + גופן Heebo |
| `src/app/page.tsx` | מסך הבית (§8.2) — מונע מלוגיקת הליבה, כרגע עם נתוני דמה |
| `src/app/login/page.tsx` + `src/app/auth/callback/route.ts` | flow התחברות Google (§7, scope calendar.events) |
| `src/app/onboarding/` | אשף onboarding (§8.1) — בחירת בי"ס, דתות, תאריך יעד |
| `src/lib/supabase/` | לקוחות Supabase (browser + server) + middleware לרענון סשן |
| `src/components/` | HeroCount · ProgressBar · StatCard · UpcomingList |

מסך הבית פועל כבר עכשיו עם נתוני דמה (`src/lib/mock-data.ts`), עד שה-onboarding
וה-seed מחוברים. הצבעים מקודדים סטטוס בלבד, לא דת (§9).

## פקודות

```bash
npm install        # התקנת תלויות
npm run dev        # הרצת שרת פיתוח (http://localhost:3000)
npm run build      # build לפרודקשן
npm test           # הרצת הבדיקות (vitest)
npm run typecheck  # בדיקת טיפוסים (tsc --noEmit, strict)
```

הגדרת Supabase: העתק `.env.example` ל-`.env.local` ומלא את המפתחות.

אשף ה-onboarding עובד עם נתוני דמה (`src/lib/schools.ts`) כשאין פרויקט Supabase מחובר,
ומתחבר אוטומטית ל-`schools` האמיתיים כשיש קרדנציאלס.

## הבא בתור

- חיבור מסך הבית לנתוני Supabase אמיתיים (המורה שהתחבר) במקום נתוני הדמה.
- מסך לוח (§8.3), מסך פרופיל וימים אישיים (§8.4).
- seed נותר — ייבוא `schools` ממשרד החינוך ו-`holidays` (שלב 1, פריט 3).
