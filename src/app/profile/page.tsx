import type { CSSProperties } from 'react';
import { themeColorValue } from '@/lib/theme';
import { getScreenModel } from '@/lib/data/screen';
import { BottomNav } from '@/components/BottomNav';
import { LogoutButton } from '@/components/LogoutButton';
import { ThemePicker } from '@/components/ThemePicker';
import { ScheduleEditor } from '@/components/ScheduleEditor';
import { ThemeToggle } from '@/components/ThemeToggle';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

const CARD =
  'rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/70';

export default async function ProfilePage() {
  const model = await getScreenModel();
  const themeStyle = { '--theme': themeColorValue(model.themeColor) } as CSSProperties;

  const rows: { label: string; value: string }[] = [
    { label: 'בית ספר', value: model.schoolName || '—' },
    { label: 'שלב חינוך', value: model.educationStage },
    {
      label: 'תאריך יעד',
      value: new Intl.DateTimeFormat('he', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(model.target),
    },
  ];

  const initial = (model.teacherName || 'מ').trim().charAt(0);

  return (
    <main style={themeStyle} className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 pb-28">
      <div className="app-bg" aria-hidden />

      <header className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-black text-white shadow-sm"
            style={{ background: 'var(--theme)' }}
          >
            {initial}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
              הפרופיל שלי
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{model.teacherName}</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className={`${CARD} flex flex-col gap-3`}>
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">{r.label}</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{r.value}</span>
          </div>
        ))}
      </div>

      <div className={CARD}>
        <div className="mb-3 text-sm font-bold text-slate-600 dark:text-slate-300">לוח זמנים</div>
        {hasSupabaseEnv ? (
          <ScheduleEditor schoolWeek={model.schoolWeek} dayOff={model.dayOff} />
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            התחבר כדי לערוך את לוח הזמנים.
          </p>
        )}
      </div>

      <div className={CARD}>
        <div className="mb-3 text-sm font-bold text-slate-600 dark:text-slate-300">ערכת נושא</div>
        {hasSupabaseEnv ? (
          <ThemePicker current={model.themeColor} />
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">התחבר כדי לשמור ערכת נושא.</p>
        )}
      </div>

      <p className="px-1 text-center text-sm text-slate-400 dark:text-slate-500">
        עריכת בית ספר, דתות וסנכרון יומן — בקרוב.
      </p>

      {hasSupabaseEnv && (
        <div className="flex justify-center">
          <LogoutButton />
        </div>
      )}

      <BottomNav />
    </main>
  );
}
