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
import { RELIGIONS } from '@/lib/religions';
import { WaveHeader } from '@/components/WaveHeader';
import { TeacherToggleCard } from '@/components/TeacherToggleCard';
import { CountdownCard } from '@/components/CountdownCard';
import { MultiSectorHolidays } from '@/components/MultiSectorHolidays';
import { UpcomingList } from '@/components/UpcomingList';
import { BottomNav } from '@/components/BottomNav';
import { AddDayDialog } from '@/components/AddDayDialog';

export const dynamic = 'force-dynamic';

const MS_DAY = 86_400_000;
const codeById = new Map<number, string>(RELIGIONS.map((r) => [r.id, r.code]));

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

  // מדדים אמיתיים למונה (במקום נתוני הדמה של Stitch).
  const yearStartDay = new Date(
    model.yearStart.getFullYear(),
    model.yearStart.getMonth(),
    model.yearStart.getDate(),
  ).getTime();
  const passedDays = Math.max(0, Math.round((startOfToday - yearStartDay) / MS_DAY));
  const progressPercent = Math.round(countdown.percentComplete);

  const targetLabel = new Intl.DateTimeFormat('he', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(model.target);

  // בחירת חגים התחלתית לפי הדתות האמיתיות של המורה.
  const initialSectors = model.religionIds
    .map((id) => codeById.get(id))
    .filter((c): c is string => Boolean(c));

  const themeStyle = { '--theme': themeColorValue(model.themeColor) } as CSSProperties;

  return (
    <main style={themeStyle} className="mx-auto min-h-screen max-w-md pb-28">
      <div className="app-bg" aria-hidden />

      {/* באנר Stitch: נוף מתחלף + גלים מונפשים */}
      <WaveHeader />

      <div className="flex flex-col gap-4 p-4">
        <header>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            שנת הלימודים {model.label}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            שלום, {model.teacherName}
          </h1>
          {model.schoolName && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{model.schoolName}</p>
          )}
        </header>

        <TeacherToggleCard />

        <CountdownCard
          remainingDays={countdown.schoolDays}
          progressPercent={progressPercent}
          passedDays={passedDays}
          holidaysRemaining={remainingClosed}
          calendarDays={countdown.calendarDays}
          targetLabel={targetLabel}
          motivation={dailyMotivation(today)}
        />

        <MultiSectorHolidays
          initialSelected={initialSectors.length ? initialSectors : undefined}
        />

        <section className="mt-2 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-extrabold text-slate-700 dark:text-slate-200">
              הימים הקרובים
            </h2>
            <AddDayDialog />
          </div>
          <UpcomingList items={upcoming} />
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
