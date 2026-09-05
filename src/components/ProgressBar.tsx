/** פס התקדמות + מסגור חיובי "X% מהשנה מאחוריך" (CLAUDE.md §8.2). */
export function ProgressBar({ percentComplete }: { percentComplete: number }) {
  const pct = Math.min(100, Math.max(0, percentComplete));
  return (
    <div className="glass rounded-[24px] p-5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-500">ההתקדמות שלך</span>
        <span className="text-sm font-extrabold text-slate-700">{pct}% מהשנה מאחוריך</span>
      </div>
      <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-900/10">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, color-mix(in srgb, var(--theme) 70%, white), var(--theme))',
          }}
        />
      </div>
    </div>
  );
}
