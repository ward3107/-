import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { UpcomingItem, UpcomingKind } from '@/lib/domain';

/**
 * רשימת הימים הקרובים — חגים וימים אישיים מעורבבים (CLAUDE.md §8.2).
 * הצבע מקודד סטטוס בלבד, לא דת (CLAUDE.md §9).
 */
const KIND_META: Record<UpcomingKind, { label: string; color: string }> = {
  'school-closed': { label: 'בית הספר סגור', color: '#38bdf8' },
  'personal-holiday': { label: 'חג שלי', color: '#fbbf24' },
  'personal-day': { label: 'יום אישי', color: '#c084fc' },
};

export function UpcomingList({ items }: { items: UpcomingItem[] }) {
  if (items.length === 0) {
    return (
      <div className="glass rounded-[22px] p-5 text-center text-sm text-slate-500">
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
            className="glass flex items-center gap-3 rounded-[20px] p-4"
          >
            <span
              className="h-9 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: meta.color }}
              aria-hidden
            />
            <div className="flex-1">
              <div className="font-semibold text-slate-800">{item.title}</div>
              <div className="text-xs text-slate-400">{meta.label}</div>
            </div>
            <time className="text-sm font-semibold text-slate-500" dateTime={item.date}>
              {format(item.dateObj, 'd בMMMM', { locale: he })}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
