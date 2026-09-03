/** כרטיס סטטיסטיקה (CLAUDE.md §8.2 — שני כרטיסים במסך הבית). */
export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card bg-white p-5 text-center shadow-sm">
      <div className="text-3xl font-extrabold tabular-nums text-slate-800">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-500">{label}</div>
    </div>
  );
}
