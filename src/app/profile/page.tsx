import type { CSSProperties } from 'react';
import { getSchoolYear, inferTargetDate } from '@/lib/domain';
import { themeColorValue, THEME_COLORS } from '@/lib/theme';
import { MOCK_TEACHER } from '@/lib/mock-data';
import { BottomNav } from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { endYear } = getSchoolYear(new Date());
  const target = inferTargetDate(MOCK_TEACHER.educationStage, endYear);
  const themeStyle = { '--theme': themeColorValue(MOCK_TEACHER.themeColor) } as CSSProperties;

  const rows: { label: string; value: string }[] = [
    { label: 'בית ספר', value: MOCK_TEACHER.schoolName },
    { label: 'שלב חינוך', value: MOCK_TEACHER.educationStage },
    {
      label: 'תאריך יעד',
      value: new Intl.DateTimeFormat('he', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        target,
      ),
    },
  ];

  return (
    <main style={themeStyle} className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 pb-28">
      <header className="pt-4">
        <h1 className="text-xl font-bold text-slate-800">הפרופיל שלי</h1>
        <p className="text-sm text-slate-500">{MOCK_TEACHER.fullName}</p>
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
              className="h-8 w-8 rounded-full ring-2"
              style={{
                backgroundColor: hex,
                boxShadow:
                  code === MOCK_TEACHER.themeColor ? '0 0 0 2px white, 0 0 0 4px var(--theme)' : undefined,
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
