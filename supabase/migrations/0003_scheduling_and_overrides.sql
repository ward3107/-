-- ============================================================================
-- שלב 2 — לוח זמנים אישי + עקיפות חגים למורה.
--
-- teachers.school_week  — 5 או 6 ימי לימוד בשבוע (שישי מקוצר במגזרים מסוימים).
-- teachers.day_off      — יום החופש השבועי הקבוע של המורה (0=ראשון…6=שבת; null=אין).
-- holiday_overrides     — עקיפה אישית של חג מוגדר-מראש: הסתרה / שינוי שם / הזזת תאריך.
-- ============================================================================

alter table teachers add column if not exists school_week smallint not null default 5;
alter table teachers add column if not exists day_off smallint; -- 0=ראשון … 6=שבת; null=אין יום קבוע

create table if not exists holiday_overrides (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid references teachers(id) on delete cascade,
  holiday_id  uuid references holidays(id) on delete cascade,
  hidden      boolean not null default false,
  custom_name text,
  custom_date date,
  created_at  timestamptz default now(),
  unique (teacher_id, holiday_id)
);
create index if not exists holiday_overrides_teacher_idx on holiday_overrides (teacher_id);

alter table holiday_overrides enable row level security;

drop policy if exists "own holiday_overrides" on holiday_overrides;
create policy "own holiday_overrides"
  on holiday_overrides for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
