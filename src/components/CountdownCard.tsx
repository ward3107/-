import React from 'react';

/**
 * כרטיס ה-Hero: מונה הספירה לאחור + מד התקדמות + שני מדדים — עיצוב Stitch.
 * המספרים מגיעים ממנוע החישוב האמיתי (calculateCountdown), לא מנתוני דמה.
 */
interface Props {
  remainingDays: number;
  progressPercent: number;
  passedDays: number;
  holidaysRemaining: number;
  calendarDays: number;
  /** תווית תאריך היעד, למשל "30 ביוני 2027". */
  targetLabel?: string;
  /** משפט מוטיבציה מתחלף (dailyMotivation). */
  motivation?: string;
}

export const CountdownCard: React.FC<Props> = ({
  remainingDays,
  progressPercent,
  passedDays,
  holidaysRemaining,
  calendarDays,
  targetLabel = '30 ביוני 2027',
  motivation = 'עוד קצת — קטן עליך! 🌸',
}) => {
  return (
    <div className="space-y-4">
      {/* כרטיס ספירה מרכזי */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-white to-emerald-50/40 p-6 text-center shadow-lg dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-800/80">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span>ספירה לאחור מעודכנת</span>
        </div>

        <div className="my-2">
          <span className="font-display text-7xl font-black tracking-tight text-emerald-800 tabular-nums dark:text-emerald-400">
            {remainingDays}
          </span>
        </div>

        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">ימי לימוד נשארו</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          עד {targetLabel} • אחרי ניכוי חגים, ימי שישי ושבת
        </p>

        {/* באנר מוטיבציה */}
        <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-indigo-100/80 bg-indigo-50/80 px-3 py-2 text-xs font-medium text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-200">
          <span>🌸</span>
          <span>{motivation}</span>
        </div>
      </div>

      {/* מד התקדמות שנתי */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {progressPercent}% מהשנה מאחוריך
          </span>
          <span className="text-slate-400">{passedDays} ימים עברו 🎉</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-400 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* רשת נתונים כפולה */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            ימי חופשה שנותרו
          </span>
          <div className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
            {holidaysRemaining}
          </div>
          <span className="text-[11px] text-slate-400">חגים וחופשות משרד</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            ימים עד הסיום
          </span>
          <div className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
            {calendarDays}
          </div>
          <span className="text-[11px] text-slate-400">ימים בלוח השנה</span>
        </div>
      </div>
    </div>
  );
};
