import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { UpcomingItem, UpcomingKind } from '@/lib/domain';

/**
 * רשימת הימים הקרובים — חגים וימים אישיים מעורבבים באותה רשימה (CLAUDE.md §8.2).
 * הצבע מקודד סטטוס בלבד, לא דת (CLAUDE.md §9).
 */
const KIND_META: Record<UpcomingKind, { label: string; dotClass: string }> = {
  'school-closed': { label: 'בית הספר סגור', dotClass: 'bg-status-closed' },
  'personal-holiday': { label: 'חג שלי', dotClass: 'bg-status-holiday' },
  'personal-day': { label: 'יום אישי', dotClass: 'bg-status-personal' },
};

export function UpcomingList({ items }: { items: UpcomingItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-card bg-white p-5 text-center text-sm text-slate-400">
        אין ימים קרובים ברשימה.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const meta = KIND_META[item.kind];
        return (
          <li
            key={`${item.kind}-${item.date}`}
            className="flex items-center gap-3 rounded-soft bg-white p-4 shadow-sm"
          >
            <span className={`h-3 w-3 shrink-0 rounded-full ${meta.dotClass}`} aria-hidden />
            <div className="flex-1">
              <div className="font-semibold text-slate-800">{item.title}</div>
              <div className="text-xs text-slate-400">{meta.label}</div>
            </div>
            <time className="text-sm font-medium text-slate-500" dateTime={item.date}>
              {format(item.dateObj, 'd בMMMM', { locale: he })}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
