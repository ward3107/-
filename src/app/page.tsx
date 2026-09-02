import type { CSSProperties } from 'react';
import {
  buildUpcoming,
  calculateCountdown,
  getClosedDates,
  getPersonalDates,
  getSchoolYear,
  inferTargetDate,
  schoolYearStart,
} from '@/lib/domain';
import { themeColorValue } from '@/lib/theme';
import { dailyMotivation } from '@/lib/motivation';
import { MOCK_CUSTOM_DAYS, MOCK_HOLIDAYS, MOCK_TEACHER } from '@/lib/mock-data';
import { HeroCount } from '@/components/HeroCount';
import { ProgressBar } from '@/components/ProgressBar';
import { StatCard } from '@/components/StatCard';
import { UpcomingList } from '@/components/UpcomingList';
import { BottomNav } from '@/components/BottomNav';

// המסך תלוי בתאריך הנוכחי → מתרנדר לכל בקשה.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const today = new Date();
  const { endYear, label } = getSchoolYear(today);

  // TODO: להחליף בנתוני המורה האמיתיים מ-Supabase לאחר onboarding + seed.
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

  const upcoming = buildUpcoming(today, MOCK_HOLIDAYS, MOCK_CUSTOM_DAYS, 5);
  const remainingClosed = closedDates.filter((d) => d.getTime() >= startOfDay(today).getTime())
    .length;

  const themeStyle = { '--theme': themeColorValue(MOCK_TEACHER.themeColor) } as CSSProperties;

  return (
    <main style={themeStyle} className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 pb-28">
      <header className="pt-4">
        <p className="text-sm font-medium text-slate-400">שנת הלימודים {label}</p>
        <h1 className="text-xl font-bold text-slate-800">שלום, {MOCK_TEACHER.fullName}</h1>
        <p className="text-sm text-slate-500">{MOCK_TEACHER.schoolName}</p>
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

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
