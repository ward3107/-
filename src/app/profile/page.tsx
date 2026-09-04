import type { CSSProperties } from 'react';
import { themeColorValue, THEME_COLORS } from '@/lib/theme';
import { getScreenModel } from '@/lib/data/screen';
import { BottomNav } from '@/components/BottomNav';

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
      <header className="pt-4">
        <h1 className="text-xl font-bold text-slate-800">הפרופיל שלי</h1>
        <p className="text-sm text-slate-500">{model.teacherName}</p>
      </header>

      <div className="flex flex-col gap-2 rounded-card bg-white p-4 shadow-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="text-sm text-slate-400">{r.label}</span>
            <span className="text-sm font-semibold text-slate-700">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-card bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-semibold text-slate-500">ערכת נושא</div>
        <div className="flex gap-2">
          {Object.entries(THEME_COLORS).map(([code, hex]) => (
            <span
              key={code}
              aria-label={code}
              className="h-8 w-8 rounded-full"
              style={{
                backgroundColor: hex,
                boxShadow:
                  code === model.themeColor ? '0 0 0 2px white, 0 0 0 4px var(--theme)' : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <p className="px-1 text-center text-sm text-slate-400">
        עריכת פרטים, דתות, סנכרון יומן וימים אישיים — בקרוב.
      </p>

      <BottomNav />
    </main>
  );
}
