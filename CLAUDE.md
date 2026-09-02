# כמה נשאר לי? — מסמך אפיון טכני

מסמך זה הוא נקודת הפתיחה לפיתוח. הדבק אותו כ-`CLAUDE.md` בשורש הפרויקט.

---

## 1. מה זה

אפליקציית מובייל (PWA) למורים בישראל. המורה מגדיר פעם אחת את בית הספר שלו ואת הדת/דתות שלו, והאפליקציה מציגה לו:

- ספירה לאחור ב**ימי לימוד** (לא ימי קלנדר) עד סוף שנת הלימודים
- לוח החגים הרלוונטי **שלו** בלבד
- ימים אישיים שהוא מגדיר בעצמו
- סנכרון אוטומטי ליומן גוגל

**הערך הייחודי:** אף לוח שנה אחר לא יודע להבחין בין "בית הספר סגור" לבין "אני בחופש אבל בית הספר פועל". זו ההבחנה שמצדיקה את המוצר.

**קהל יעד:** כל המורים בישראל — יהודים, מוסלמים, נוצרים, דרוזים, צ'רקסים.

**שפה:** עברית בלבד. RTL. שמות חגים של כל הדתות בתעתיק עברי ("עיד אל-פיטר", "נבי שועייב").

---

## 2. סטאק

| שכבה | טכנולוגיה |
|------|-----------|
| Framework | Next.js 15, App Router |
| שפה | TypeScript (strict) |
| DB + Auth | Supabase (Postgres) |
| Hosting + Cron | Vercel |
| Styling | Tailwind CSS |
| תאריכים | `date-fns` (אחסון כ-`DATE` בלבד, לא `TIMESTAMP`) |
| יומן | `googleapis` (Google Calendar API v3) |

---

## 3. עקרונות ארכיטקטורה

### 3.1 נתוני חגים הם סטטיים
כל החגים של כל הדתות לשנה = כמה מאות שורות. **אין קריאות ל-API חיצוני בזמן ריצה.** Cron שנתי ממלא את טבלת `holidays`, וכל השאר קורא מקומית עם קאש ארוך.

### 3.2 הפרדת domain logic
כל לוגיקת החישוב יושבת ב-`/lib/domain/` כ-TypeScript טהור, **בלי שום תלות ב-Supabase או ב-React**. הפונקציות מקבלות נתונים ומחזירות תוצאה. זה מאפשר בדיקות אמיתיות ומונע פיזור כללים בקוד.

```

src/
├── app/                    # Next.js routes
│   ├── (auth)/            # login, callback
│   ├── (app)/             # home, calendar, profile
│   └── api/
│       ├── cron/
│       │   ├── seed-holidays/route.ts
│       │   └── sync-calendars/route.ts
│       └── calendar/sync/route.ts
├── lib/
│   ├── domain/            # ← לוגיקה טהורה, מכוסה בבדיקות
│   │   ├── school-days.ts
│   │   ├── holidays.ts
│   │   └── school-year.ts
│   ├── supabase/
│   └── google/
└── components/
```

### 3.3 קריאה מול כתיבה
- `schools`, `holidays` — read-only למשתמש, קאש אגרסיבי (`revalidate: 86400`)
- `teachers`, `custom_days` — קריאה/כתיבה, מוגן ב-RLS

### 3.4 Offline first
האפליקציה חייבת לעבוד בלי רשת. כל הנתונים שהמורה צריך נשמרים ב-IndexedDB. Service Worker פשוט.

---

## 4. סכמת מסד נתונים

```sql
-- ============ נתוני יסוד (read-only) ============

create table schools (
  id            uuid primary key default gen_random_uuid(),
  symbol        text unique not null,        -- סמל מוסד ממשרד החינוך
  name          text not null,
  city          text,
  sector        text,                        -- יהודי / ערבי / דרוזי / בדואי / צרקסי
  supervision   text,                        -- ממלכתי / ממלכתי-דתי / חרדי
  education_stage text,                      -- יסודי / חטיבת ביניים / על-יסודי
  created_at    timestamptz default now()
);
create index on schools (symbol);
create index on schools (city);

create table religions (
  id      serial primary key,
  code    text unique not null,   -- jewish | muslim | christian | druze | circassian
  name    text not null           -- בעברית
);

create table holidays (
  id                uuid primary key default gen_random_uuid(),
  religion_id       int references religions(id),
  name              text not null,           -- תעתיק עברי
  date              date not null,
  school_year       text not null,           -- '2026-27'
  is_school_closed  boolean not null default false,
  source            text not null,           -- hebcal | ministry | manual
  created_at        timestamptz default now()
);
create index on holidays (religion_id, date);
create index on holidays (school_year);

-- ============ נתוני משתמש ============

create table teachers (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  school_id     uuid references schools(id),
  target_date   date,                        -- נגזר משלב החינוך, ניתן לעקיפה
  theme_color   text default 'emerald',
  theme_style   text default 'characters',   -- characters | landscape | clean
  created_at    timestamptz default now()
);

create table teacher_religions (
  teacher_id  uuid references teachers(id) on delete cascade,
  religion_id int references religions(id),
  primary key (teacher_id, religion_id)
);

create table custom_days (
  id                 uuid primary key default gen_random_uuid(),
  teacher_id         uuid references teachers(id) on delete cascade,
  title              text not null,
  date               date not null,
  affects_countdown  boolean not null default true,
  created_at         timestamptz default now()
);
create index on custom_days (teacher_id, date);

create table calendar_sync (
  teacher_id       uuid primary key references teachers(id) on delete cascade,
  google_calendar_id text,
  enabled          boolean default false,
  last_synced_at   timestamptz
);

-- מיפוי אירועים שנוצרו, למניעת כפילויות
create table synced_events (
  id               uuid primary key default gen_random_uuid(),
  teacher_id       uuid references teachers(id) on delete cascade,
  source_type      text not null,   -- holiday | custom_day
  source_id        uuid not null,
  google_event_id  text not null,
  unique (teacher_id, source_type, source_id)
);
```

### RLS
- `schools`, `religions`, `holidays` — `select` פתוח לכולם
- `teachers` — המורה רואה/עורך רק את השורה שלו (`auth.uid() = id`)
- `teacher_religions`, `custom_days`, `calendar_sync`, `synced_events` — רק שורות ששייכות ל-`auth.uid()`

---

## 5. לוגיקת הליבה

זו הפונקציה שכל המוצר נשען עליה. **חייבת להיות מכוסה בבדיקות.**

```typescript
// lib/domain/school-days.ts

interface CountdownInput {
  from: Date;
  target: Date;
  closedDates: Date[];   // ימים שביה"ס סגור
  personalDates: Date[]; // ימים אישיים שמנוכים
}

interface CountdownResult {
  schoolDays: number;    // ימי לימוד בפועל
  calendarDays: number;
  percentComplete: number;
}

export function calculateCountdown(input: CountdownInput): CountdownResult;
```

**כללים:**
1. שבוע הלימודים בישראל: ראשון–חמישי. שישי ושבת אינם ימי לימוד. **שים לב:** בחלק מבתי הספר במגזר הערבי הלימודים מתקיימים ראשון–חמישי גם כן, אך יש מוסדות עם שישי מקוצר — עדיף להוסיף שדה `school_week` לטבלת `schools` בהמשך אם מתברר שיש שונות.
2. יום שנופל בסופ"ש לא מנוכה פעמיים.
3. חג שסומן `is_school_closed = false` לא מנוכה מספירת ימי הלימוד הכללית, אבל מסומן ביומן האישי כ"חופשה אישית".
4. `custom_day` עם `affects_countdown = false` מוצג אך לא מנוכה.

### תאריך יעד לפי שלב חינוך
```typescript
// lib/domain/school-year.ts
// יסודי → 30/6 | חטיבת ביניים ועל-יסודי → 20/6
export function inferTargetDate(educationStage: string, year: number): Date;
```
נגזר אוטומטית מ-`schools.education_stage`, עם אפשרות לעקיפה ידנית. פחות שאלות ב-onboarding.

---

## 6. מקורות נתונים

### 6.1 רשימת בתי הספר
מקור: משרד החינוך (`meyda.education.gov.il`) או `data.gov.il` תחת ארגון `ministry_of_education`.

השדות הנדרשים קיימים שם מוכנים: סמל מוסד, שם, יישוב, **מגזר**, סוג פיקוח, שלב חינוך.

גישה ל-`data.gov.il` דרך CKAN API:
```
https://data.gov.il/api/action/datastore_search?resource_id=<ID>&limit=32000
```
הערות: אין תמיכה ב-`_id` keyset paging; יש להשתמש ב-offset עם `_links.next`, או להוריד CSV לייבוא bulk. שים לב ל-encoding עברי.

**משימה:** לאתר את ה-`resource_id` העדכני, לייבא ל-`schools` דרך seed script.

### 6.2 חגים

| דת | מקור | הערות |
|----|------|-------|
| יהודי | Hebcal API | אוטומטי, כולל ישראל-ספציפי |
| מוסלמי | לוח היג'רי + אימות מקומי | ייתכן פער של יום מול מקורות בינ"ל בגלל ראיית הירח |
| נוצרי | הבחנה בין לוח מערבי למזרחי | רוב הנוצרים בישראל יוונים-אורתודוקסים → לוח יוליאני |
| דרוזי | ידני | נבי שועייב 25/4 (קבוע) + עיד אל-אדחא |
| צ'רקסי | ידני | ברובם מוסלמים; + ראש השנה הצ'רקסי (מרץ) |

**המקור האמין ביותר בפועל:** מסמך ימי החופשה הרשמי של משרד החינוך, שמפורסם כל שנה לפי מגזר. הוא כבר עשה את כל העבודה. אסטרטגיה מומלצת: Hebcal אוטומטי ליהודי, `source='manual'` לשאר עם עדכון שנתי מהמסמך הרשמי.

---

## 7. סנכרון Google Calendar

- Auth: Supabase Auth עם Google provider. **flow אחד בלבד** — אותו OAuth משמש להתחברות ולגישה ליומן.
- Scope נדרש: `https://www.googleapis.com/auth/calendar.events`
- יוצר יומן ייעודי ("כמה נשאר לי") ולא כותב ליומן הראשי — נקי יותר ומאפשר למורה לכבות בקליק.
- **אין סנכרון real-time.** Cron יומי עובר על מורים עם `calendar_sync.enabled = true`.
- כל אירוע שנוצר נרשם ב-`synced_events` עם ה-`google_event_id`. בכל ריצה: עדכון קיימים, יצירה רק לחדשים. אחרת ייווצרו כפילויות.

---

## 8. מסכים

### 8.1 Onboarding
1. התחברות עם גוגל
2. בחירת בית ספר (חיפוש עם autocomplete על שם/יישוב/סמל)
3. בחירת דת/דתות (multi-select — יש מורים ממשפחות מעורבות)
4. תאריך יעד נגזר אוטומטית, עם אפשרות לשנות

### 8.2 מסך בית
- מספר ענק (ימי לימוד שנותרו) — הגיבור של המסך
- פס התקדמות + "X% מהשנה מאחוריך" (מסגור חיובי, לא המתנה)
- אמירת מוטיבציה מתחלפת יומית
- שני כרטיסי סטטיסטיקה
- רשימת הימים הקרובים (חגים + ימים אישיים מעורבבים באותה רשימה)
- כפתור "הוסף יום משלי"
- רקע מתחלף לפי החג הקרוב

### 8.3 מסך לוח
- תצוגת חודש
- כותרת כפולה: חודש לועזי + החודש בלוח הרלוונטי למורה
- סרגל סיכום: ימי לימוד / ימי חופש / עד הקיץ
- שלוש קטגוריות צבע: ביה"ס סגור / חג שלי / יום אישי
- לחיצה על יום → כרטיס פרטים עם "ליומן" ו"תזכורת"

### 8.4 פרופיל
עריכת בי"ס, דתות, תאריך יעד, ערכת נושא, סנכרון יומן

---

## 9. הנחיות עיצוב

**סגנון:** משחקי, רך, "עסיסי". פינות מעוגלות מאוד (20–32px). עומק דרך שכבות צבע שקופות, לא גרדיאנטים או צללים. איורים שטוחים גיאומטריים.

**התאמה אישית:** 5 צבעי בסיס × 3 סגנונות רקע (דמויות / נוף / נקי). ה"נקי" חובה — יהיו מורים שלא רוצים איורים בכלל.

**רקע לפי חג:** ככל שחג מתקרב, הרקע מתחלף לאובייקטים שלו (פנסים לעיד, קישוטי אור לחג המולד, רימונים לראש השנה, ים ושמש לקיץ).

### כלל קריטי: אובייקטים תרבותיים, לא סמלים דתיים
פנס — כן. סהר, צלב, מגן דוד — לא. אותה אפליקציה משרתת חמש קבוצות; אובייקט חגיגי יוצר אווירה, סמל דתי יוצר הצהרה. גם האיורים של הדמויות ניטרליים בכוונה.

### כלל צבע
הצבעים מקודדים **סטטוס**, לא **דת**. שלוש קטגוריות בלבד: ביה"ס סגור / חג אישי / יום אישי. צביעה לפי דת הייתה מציגה למורה חגים שאינם רלוונטיים לו.

---

## 10. סדר בנייה

**שלב 1 — הליבה**

1. `lib/domain/` + בדיקות (לפני כל UI)
2. סכמת DB + RLS
3. Seed: religions, schools (ייבוא ממשרד החינוך), holidays לשנה אחת

**שלב 2 — MVP**
4. Auth + onboarding
5. מסך בית
6. מסך לוח
7. ימים אישיים

**שלב 3 — סנכרון**
8. Google Calendar + Cron יומי
9. PWA + offline

**שלב 4 — הרחבות**
10. התראות push
11. "חדר מורים" (קהילתי)
12. שיתוף הספירה — זהו מנוע הצמיחה: מורה ששולח צילום מסך לחדר המורים מביא משתמשים חדשים בלי עלות שיווק

---

## 11. מלכודות מוכרות

1. **תאריכים כ-`TIMESTAMP`** — הבאג הנפוץ ביותר באפליקציות ספירה. אחסן `DATE` בלבד; שעות וזמן-אזור לא רלוונטיים כאן וגורמים לשגיאות של יום שלם.
2. **כפילויות ביומן** — חובה `synced_events`. בלעדיו כל ריצת Cron מייצרת עותקים.
3. **טבלת חגים ידנית שמתיישנת** — צריך התראה שנתית שמזכירה למלא את השנה הבאה, אחרת האפליקציה נשברת בשקט באוגוסט.
4. **שמות בתי ספר חופשיים** — לעולם לא לתת למורה להקליד. רק בחירה מרשימה עם סמל מוסד, אחרת יווצרו כפילויות.
5. **דיוק החישוב** — כל טעות בספירה שוברת את האמון מיידית. זה כל המוצר.
6. **Streak** — נשקל ונדחה. מנגנון רצף מייצר אשמה כשנשבר, וזה ההפך ממה שהאפליקציה אמורה לעשות למורה עמוס. השתמש ב"X ימים החודש" במקום.

---

## 12. הרחבה עתידית

- **ערבית** — הממשק עברי בלבד כרגע. אם יתגלה חסם אימוץ במגזר הערבי/דרוזי, זו ההרחבה הראשונה. אל תעצב את שדות הטקסט בצורה שתקשה על כך.
- **לוח צוותי** — מנהל/רכז רואה מי נעדר מתי, לתכנון מראש.
- **חיבור למערכת שיבוץ מורים** — כשמורה נעדר בגלל חג אישי וביה"ס פועל, המערכת יכולה להתריע מראש על צורך במילוי מקום. זה הגשר הטבעי בין שני הפרויקטים.

---

## מצב הפיתוח (Development status)

**מיושם (שלב 1, פריט 1):** `src/lib/domain/` — לוגיקת ליבה טהורה עם כיסוי בדיקות מלא.
- `school-days.ts` — `calculateCountdown` (ספירת ימי לימוד, ללא ניכוי כפול בסופ"ש)
- `school-year.ts` — `inferTargetDate`, גזירת שנת לימודים, תוויות
- `holidays.ts` — סינון חגים לפי דת, מיפוי ל-closed/personal dates, מיזוג אירועים קרובים

הרצת בדיקות: `npm test` · בדיקת טיפוסים: `npm run typecheck`

**הבא בתור:** סכמת DB + RLS (שלב 1, פריט 2), ואז seed data (פריט 3).
