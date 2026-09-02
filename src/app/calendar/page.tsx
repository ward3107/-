import type { CSSProperties } from 'react';
import {
  calculateCountdown,
  getClosedDates,
  getPersonalDates,
  getSchoolYear,
  inferTargetDate,
  schoolYearStart,
} from '@/lib/domain';
import { themeColorValue } from '@/lib/theme';
import { MOCK_CUSTOM_DAYS, MOCK_HOLIDAYS, MOCK_TEACHER } from '@/lib/mock-data';
import { MonthCalendar } from '@/components/MonthCalendar';
import { StatCard } from '@/components/StatCard';
import { BottomNav } from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  const today = new Date();
  const { endYear } = getSchoolYear(today);

  // TODO: להחליף בנתוני המורה האמיתיים מ-Supabase.
  const target = inferTargetDate(MOCK_TEACHER.educationStage, endYear);
  const yearStart = schoolYearStart(endYear);
  const closedDates = getClosedDates(MOCK_HOLIDAYS);
  const personalDates = getPersonalDates(MOCK_CUSTOM_DAYS);

  const countdown = calculateCountdown({
    from: today,
    target,
    closedDates,
    personalDates,
    yearStart,
  });

  const remainingClosed = closedDates.filter(
    (d) => d.getTime() >= new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime(),
  ).length;

  const themeStyle = { '--theme': themeColorValue(MOCK_TEACHER.themeColor) } as CSSProperties;

  return (
    <main style={themeStyle} className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 pb-28">
      <header className="pt-4">
        <h1 className="text-xl font-bold text-slate-800">הלוח שלי</h1>
      </header>

      {/* סרגל סיכום (CLAUDE.md §8.3) */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="ימי לימוד" value={countdown.schoolDays} />
        <StatCard label="ימי חופש" value={remainingClosed} />
        <StatCard label="עד הקיץ" value={countdown.calendarDays} />
      </div>

      <MonthCalendar holidays={MOCK_HOLIDAYS} customDays={MOCK_CUSTOM_DAYS} />

      <BottomNav />
    </main>
  );
}
