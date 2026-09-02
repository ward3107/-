/** פס התקדמות + מסגור חיובי "X% מהשנה מאחוריך" (CLAUDE.md §8.2). */
export function ProgressBar({ percentComplete }: { percentComplete: number }) {
  const pct = Math.min(100, Math.max(0, percentComplete));
  return (
    <div className="rounded-card bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-500">ההתקדמות שלך</span>
        <span className="text-sm font-bold text-slate-700">{pct}% מהשנה מאחוריך</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, backgroundColor: 'var(--theme)' }}
        />
      </div>
    </div>
  );
}
