-- ============================================================================
-- Seed: religions (CLAUDE.md §4, §10 שלב 1 פריט 3)
--
-- חמש הקבוצות שהאפליקציה משרתת (CLAUDE.md §1). נתוני יסוד קבועים.
-- schools ו-holidays מיובאים בנפרד (schools ממשרד החינוך, holidays דרך cron/ידני).
-- ============================================================================

insert into religions (code, name) values
  ('jewish',     'יהודי'),
  ('muslim',     'מוסלמי'),
  ('christian',  'נוצרי'),
  ('druze',      'דרוזי'),
  ('circassian', 'צ''רקסי')
on conflict (code) do nothing;
