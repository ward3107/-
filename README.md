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
| `src/app/calendar/` | מסך לוח (§8.3) — תצוגת חודש, כותרת כפולה, 3 קטגוריות צבע |
| `src/app/profile/` | מסך פרופיל (§8.4) — פרטי המורה וערכת נושא (עריכה בקרוב) |
| `src/lib/supabase/` | לקוחות Supabase (browser + server) + middleware לרענון סשן |
| `src/components/` | HeroCount · ProgressBar · StatCard · UpcomingList · MonthCalendar · BottomNav |

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

## Seed data (שלב 1, פריט 3)

```bash
# חגים לשנת 2026-27 — מייצר supabase/seed_holidays_2026-27.sql (הדבק ב-SQL editor)
npm run seed:holidays

# ייבוא בתי ספר ממשרד החינוך — דורש service_role, כותב ישירות ל-DB
SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... npm run seed:schools
```

חגים יהודיים נשלפים מ-Hebcal; שאר הדתות ידני ומקורב. `is_school_closed` הוא
best-effort — יש להצליב מול מסמך ימי החופשה של משרד החינוך (§11.3).

## הבא בתור

- הפעלת Google provider ב-Supabase (Authentication → Providers) — כדי שהתחברות תעבוד.
- פרופיל מלא + עריכה + ימים אישיים (§8.4): הוספה/מחיקה של `custom_days`.
- סנכרון Google Calendar + cron יומי (§7, שלב 3).
