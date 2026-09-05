/** המספר הענק — גיבור מסך הבית, בכרטיס זכוכית (iOS). */
export function HeroCount({
  schoolDays,
  subtitle,
}: {
  schoolDays: number;
  subtitle?: string;
}) {
  return (
    <div className="glass rounded-[32px] px-6 py-10 text-center">
      <div
        className="text-[5.5rem] font-black leading-none tabular-nums"
        style={{ color: 'var(--theme)' }}
      >
        {schoolDays}
      </div>
      <p className="mt-3 text-lg font-bold text-slate-700">ימי לימוד נשארו</p>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
