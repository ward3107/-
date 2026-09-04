import type { CSSProperties } from 'react';
import {
  buildUpcoming,
  calculateCountdown,
  getClosedDates,
  getPersonalDates,
} from '@/lib/domain';
import { themeColorValue } from '@/lib/theme';
import { dailyMotivation } from '@/lib/motivation';
import { getScreenModel } from '@/lib/data/screen';
import { HeroCount } from '@/components/HeroCount';
import { ProgressBar } from '@/components/ProgressBar';
import { StatCard } from '@/components/StatCard';
import { UpcomingList } from '@/components/UpcomingList';
import { BottomNav } from '@/components/BottomNav';

// המסך תלוי בתאריך הנוכחי ובמורה המחובר → מתרנדר לכל בקשה.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const today = new Date();
  const model = await getScreenModel();

  const closedDates = getClosedDates(model.holidays);
  const personalDates = getPersonalDates(model.customDays);

  const countdown = calculateCountdown({
    from: today,
    target: model.target,
    closedDates,
    personalDates,
    yearStart: model.yearStart,
  });

  const upcoming = buildUpcoming(today, model.holidays, model.customDays, 5);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const remainingClosed = closedDates.filter((d) => d.getTime() >= startOfToday).length;

  const themeStyle = { '--theme': themeColorValue(model.themeColor) } as CSSProperties;

  return (
    <main style={themeStyle} className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 pb-28">
      <header className="pt-4">
        <p className="text-sm font-medium text-slate-400">שנת הלימודים {model.label}</p>
        <h1 className="text-xl font-bold text-slate-800">שלום, {model.teacherName}</h1>
        {model.schoolName && <p className="text-sm text-slate-500">{model.schoolName}</p>}
      </header>

      <HeroCount schoolDays={countdown.schoolDays} />

      <p className="px-2 text-center text-sm font-medium text-slate-500">
        {dailyMotivation(today)}
      </p>

      <ProgressBar percentComplete={countdown.percentComplete} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="ימים עד הסיום" value={countdown.calendarDays} />
        <StatCard label="ימי חופשה שנותרו" value={remainingClosed} />
      </div>

      <section className="mt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-700">הימים הקרובים</h2>
          <button
            type="button"
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--theme)' }}
          >
            + הוסף יום משלי
          </button>
        </div>
        <UpcomingList items={upcoming} />
      </section>

      <BottomNav />
    </main>
  );
}
