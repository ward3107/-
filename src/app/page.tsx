import type { CSSProperties } from 'react';
import {
  calculateCountdown,
  categorizeSchoolYear,
  schoolDaysForWeek,
  upcomingFromItems,
} from '@/lib/domain';
import { themeColorValue } from '@/lib/theme';
import { dailyMotivation } from '@/lib/motivation';
import { getScreenModel } from '@/lib/data/screen';
import { HeroCount } from '@/components/HeroCount';
import { ProgressBar } from '@/components/ProgressBar';
import { StatCard } from '@/components/StatCard';
import { UpcomingList } from '@/components/UpcomingList';
import { BottomNav } from '@/components/BottomNav';
import { AddDayDialog } from '@/components/AddDayDialog';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
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

  const upcoming = upcomingFromItems(today, items, 5);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const inRange = (d: Date) =>
    d.getTime() >= startOfToday && d.getTime() <= model.target.getTime();
  const remainingClosed = closedDates.filter(inRange).length;

  const targetLabel = new Intl.DateTimeFormat('he', { day: 'numeric', month: 'long' }).format(
    model.target,
  );

  const themeStyle = { '--theme': themeColorValue(model.themeColor) } as CSSProperties;

  return (
    <main style={themeStyle} className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 pb-28">
      <div className="app-bg" aria-hidden />

      <header className="pt-4">
        <p className="text-sm font-medium text-slate-500">שנת הלימודים {model.label}</p>
        <h1 className="text-2xl font-extrabold text-slate-800">שלום, {model.teacherName}</h1>
        {model.schoolName && <p className="text-sm text-slate-500">{model.schoolName}</p>}
      </header>

      <HeroCount schoolDays={countdown.schoolDays} subtitle={`עד ${targetLabel} · אחרי ניכוי חגים וסופ״ש`} />

      <p className="px-2 text-center text-sm font-medium text-slate-600">
        {dailyMotivation(today)}
      </p>

      <ProgressBar percentComplete={countdown.percentComplete} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="ימים עד הסיום" value={countdown.calendarDays} />
        <StatCard label="ימי חופשה שנותרו" value={remainingClosed} />
      </div>

      <section className="mt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-slate-700">הימים הקרובים</h2>
          <AddDayDialog />
        </div>
        <UpcomingList items={upcoming} />
      </section>

      <BottomNav />
    </main>
  );
}
