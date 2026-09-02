-- ============================================================================
-- "כמה נשאר לי?" — סכמת מסד נתונים ראשונית (CLAUDE.md §4)
-- שלב 1, פריט 2 מסדר הבנייה.
--
-- עקרון קריטי (CLAUDE.md §11.1): כל התאריכים מאוחסנים כ-DATE בלבד,
-- לעולם לא כ-TIMESTAMP — שעות ואזור-זמן גורמים לשגיאות של יום שלם בספירה.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============ נתוני יסוד (read-only למשתמש) ============

create table if not exists schools (
  id              uuid primary key default gen_random_uuid(),
  symbol          text unique not null,        -- סמל מוסד ממשרד החינוך
  name            text not null,
  city            text,
  sector          text,                        -- יהודי / ערבי / דרוזי / בדואי / צרקסי
  supervision     text,                        -- ממלכתי / ממלכתי-דתי / חרדי
  education_stage text,                         -- יסודי / חטיבת ביניים / על-יסודי
  created_at      timestamptz default now()
);
create index if not exists schools_symbol_idx on schools (symbol);
create index if not exists schools_city_idx on schools (city);

create table if not exists religions (
  id   serial primary key,
  code text unique not null,   -- jewish | muslim | christian | druze | circassian
  name text not null           -- בעברית
);

create table if not exists holidays (
  id               uuid primary key default gen_random_uuid(),
  religion_id      int references religions(id),
  name             text not null,           -- תעתיק עברי
  date             date not null,           -- DATE בלבד (CLAUDE.md §11.1)
  school_year      text not null,           -- '2026-27'
  is_school_closed boolean not null default false,
  source           text not null,           -- hebcal | ministry | manual
  created_at       timestamptz default now()
);
create index if not exists holidays_religion_date_idx on holidays (religion_id, date);
create index if not exists holidays_school_year_idx on holidays (school_year);

-- ============ נתוני משתמש (קריאה/כתיבה, מוגן ב-RLS) ============

create table if not exists teachers (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  school_id   uuid references schools(id),
  target_date date,                          -- נגזר משלב החינוך, ניתן לעקיפה
  theme_color text default 'emerald',
  theme_style text default 'characters',     -- characters | landscape | clean
  created_at  timestamptz default now()
);

create table if not exists teacher_religions (
  teacher_id  uuid references teachers(id) on delete cascade,
  religion_id int references religions(id),
  primary key (teacher_id, religion_id)
);

create table if not exists custom_days (
  id                uuid primary key default gen_random_uuid(),
  teacher_id        uuid references teachers(id) on delete cascade,
  title             text not null,
  date              date not null,           -- DATE בלבד (CLAUDE.md §11.1)
  affects_countdown boolean not null default true,
  created_at        timestamptz default now()
);
create index if not exists custom_days_teacher_date_idx on custom_days (teacher_id, date);

create table if not exists calendar_sync (
  teacher_id         uuid primary key references teachers(id) on delete cascade,
  google_calendar_id text,
  enabled            boolean default false,
  last_synced_at     timestamptz
);

-- מיפוי אירועים שנוצרו ביומן, למניעת כפילויות (CLAUDE.md §7, §11.2)
create table if not exists synced_events (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid references teachers(id) on delete cascade,
  source_type     text not null,   -- holiday | custom_day
  source_id       uuid not null,
  google_event_id text not null,
  unique (teacher_id, source_type, source_id)
);
