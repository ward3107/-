/** המספר הענק — גיבור מסך הבית (CLAUDE.md §8.2). */
export function HeroCount({ schoolDays }: { schoolDays: number }) {
  return (
    <div className="theme-wash rounded-blob px-6 py-10 text-center">
      <div
        className="text-8xl font-extrabold leading-none tabular-nums"
        style={{ color: 'var(--theme)' }}
      >
        {schoolDays}
      </div>
      <p className="mt-4 text-lg font-semibold text-slate-600">ימי לימוד נשארו</p>
    </div>
  );
}
