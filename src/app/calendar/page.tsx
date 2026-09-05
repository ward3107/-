import type { CSSProperties } from 'react';
import { calculateCountdown, categorizeSchoolYear, schoolDaysForWeek } from '@/lib/domain';
import { themeColorValue } from '@/lib/theme';
import { getScreenModel } from '@/lib/data/screen';
import { MonthCalendar } from '@/components/MonthCalendar';
import { StatCard } from '@/components/StatCard';
import { BottomNav } from '@/components/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const today = new Date();
  const model = await getScreenModel();

  const { closedDates, personalDates, items } = categorizeSchoolYear({
    sector: model.sector,
    teacherReligionIds: model.religionIds,
    holidays: model.holidays,
    customDays: model.customDays,
  });

  const countdown = calculateCountdown({
    from: today,
    target: model.target,
    closedDates,
    personalDates,
    yearStart: model.yearStart,
    schoolDaysOfWeek: schoolDaysForWeek(model.schoolWeek),
    weeklyDayOff: model.dayOff,
  });

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const remainingClosed = closedDates.filter(
    (d) => d.getTime() >= startOfToday && d.getTime() <= model.target.getTime(),
  ).length;

  const themeStyle = { '--theme': themeColorValue(model.themeColor) } as CSSProperties;

  return (
    <main style={themeStyle} className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 pb-28">
      <div className="app-bg" aria-hidden />

      <header className="flex items-center justify-between pt-4">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">הלוח שלי</h1>
        <ThemeToggle />
      </header>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="ימי לימוד" value={countdown.schoolDays} />
        <StatCard label="ימי חופש" value={remainingClosed} />
        <StatCard label="עד הקיץ" value={countdown.calendarDays} />
      </div>

      <MonthCalendar items={items} />

      <BottomNav />
    </main>
  );
}
