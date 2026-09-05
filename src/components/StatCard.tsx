/** כרטיס סטטיסטיקה בסגנון Stitch (עם תמיכה במצב כהה). */
export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[22px] border border-slate-100 bg-white p-4 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70">
      <div className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
