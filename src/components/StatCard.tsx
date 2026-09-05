/** כרטיס סטטיסטיקה זכוכיתי. */
export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-[22px] p-4 text-center">
      <div className="text-3xl font-black tabular-nums text-slate-800">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}
