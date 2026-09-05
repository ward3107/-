import type { CSSProperties } from 'react';
import { themeColorValue } from '@/lib/theme';
import { getScreenModel } from '@/lib/data/screen';
import { BottomNav } from '@/components/BottomNav';
import { LogoutButton } from '@/components/LogoutButton';
import { ThemePicker } from '@/components/ThemePicker';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

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

  return (
    <main style={themeStyle} className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 pb-28">
      <div className="app-bg" aria-hidden />

      <header className="pt-4">
        <h1 className="text-2xl font-extrabold text-slate-800">הפרופיל שלי</h1>
        <p className="text-sm text-slate-500">{model.teacherName}</p>
      </header>

      <div className="glass flex flex-col gap-3 rounded-[24px] p-5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{r.label}</span>
            <span className="text-sm font-bold text-slate-800">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="glass rounded-[24px] p-5">
        <div className="mb-3 text-sm font-bold text-slate-600">ערכת נושא</div>
        {hasSupabaseEnv ? (
          <ThemePicker current={model.themeColor} />
        ) : (
          <p className="text-sm text-slate-400">התחבר כדי לשמור ערכת נושא.</p>
        )}
      </div>

      <p className="px-1 text-center text-sm text-slate-400">
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
