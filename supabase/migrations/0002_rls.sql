-- ============================================================================
-- Row Level Security (CLAUDE.md §4 → RLS)
--
--   schools, religions, holidays          — SELECT פתוח לכולם (read-only למשתמש;
--                                            כתיבה רק דרך service role / cron seed).
--   teachers                              — המורה רואה/עורך רק את השורה שלו
--                                            (auth.uid() = id).
--   teacher_religions, custom_days,
--   calendar_sync, synced_events          — רק שורות ששייכות ל-auth.uid()
--                                            (teacher_id = auth.uid()).
--
-- הערה: ל-service role יש עקיפת RLS מובנית, ולכן ה-Cron השנתי/היומי
-- (seed-holidays, sync-calendars) כותב ללא מדיניות write ייעודית.
-- ============================================================================

-- ---------- טבלאות יסוד: קריאה פתוחה לכולם ----------

alter table schools enable row level security;
alter table religions enable row level security;
alter table holidays enable row level security;

drop policy if exists "schools are readable by everyone" on schools;
create policy "schools are readable by everyone"
  on schools for select
  using (true);

drop policy if exists "religions are readable by everyone" on religions;
create policy "religions are readable by everyone"
  on religions for select
  using (true);

drop policy if exists "holidays are readable by everyone" on holidays;
create policy "holidays are readable by everyone"
  on holidays for select
  using (true);

-- ---------- teachers: כל מורה רק את עצמו ----------

alter table teachers enable row level security;

drop policy if exists "teachers can view own row" on teachers;
create policy "teachers can view own row"
  on teachers for select
  using (auth.uid() = id);

drop policy if exists "teachers can insert own row" on teachers;
create policy "teachers can insert own row"
  on teachers for insert
  with check (auth.uid() = id);

drop policy if exists "teachers can update own row" on teachers;
create policy "teachers can update own row"
  on teachers for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "teachers can delete own row" on teachers;
create policy "teachers can delete own row"
  on teachers for delete
  using (auth.uid() = id);

-- ---------- teacher_religions: teacher_id = auth.uid() ----------

alter table teacher_religions enable row level security;

drop policy if exists "own teacher_religions" on teacher_religions;
create policy "own teacher_religions"
  on teacher_religions for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- ---------- custom_days: teacher_id = auth.uid() ----------

alter table custom_days enable row level security;

drop policy if exists "own custom_days" on custom_days;
create policy "own custom_days"
  on custom_days for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- ---------- calendar_sync: teacher_id = auth.uid() ----------

alter table calendar_sync enable row level security;

drop policy if exists "own calendar_sync" on calendar_sync;
create policy "own calendar_sync"
  on calendar_sync for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- ---------- synced_events: teacher_id = auth.uid() ----------

alter table synced_events enable row level security;

drop policy if exists "own synced_events" on synced_events;
create policy "own synced_events"
  on synced_events for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
