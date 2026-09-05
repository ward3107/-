'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addMonths, getDay, getDaysInMonth, startOfMonth } from 'date-fns';
import type { CategorizedDay, UpcomingKind } from '@/lib/domain';
import { deleteCustomDay, resetHolidayOverride, setHolidayOverride } from '@/app/actions';
import { AddDayDialog } from '@/components/AddDayDialog';

interface DayEntry {
  kind: UpcomingKind;
  title: string;
  customId?: string;
  holidayId?: string;
}

const WEEKDAY_LABELS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

const KIND_ORDER: UpcomingKind[] = ['school-closed', 'personal-holiday', 'personal-day'];
const KIND_COLOR: Record<UpcomingKind, string> = {
  'school-closed': '#38bdf8',
  'personal-holiday': '#fbbf24',
  'personal-day': '#c084fc',
};
const KIND_LABEL: Record<UpcomingKind, string> = {
  'school-closed': 'בית הספר סגור',
  'personal-holiday': 'חג שלי',
  'personal-day': 'יום אישי',
};

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export function MonthCalendar({ items }: { items: CategorizedDay[] }) {
  const router = useRouter();
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const entries = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    for (const it of items) {
      const list = map.get(it.date) ?? [];
      list.push({ kind: it.kind, title: it.title, customId: it.customId, holidayId: it.holidayId });
      map.set(it.date, list);
    }
    return map;
  }, [items]);

  const leadingBlanks = getDay(viewDate);
  const daysInMonth = getDaysInMonth(viewDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const gregorian = new Intl.DateTimeFormat('he', { month: 'long', year: 'numeric' }).format(viewDate);
  const hebrewMonth = new Intl.DateTimeFormat('he-u-ca-hebrew', { month: 'long' }).format(
    new Date(year, month, 15),
  );

  const todayKey = dateKey(new Date());
  const selectedEntries = selected ? (entries.get(selected) ?? []) : [];

  function removeDay(id: string) {
    startDelete(async () => {
      await deleteCustomDay(id);
      router.refresh();
    });
  }

  function renameHoliday(id: string, current: string) {
    const name = window.prompt('שם חדש לחג:', current);
    if (name === null) return;
    startDelete(async () => {
      await setHolidayOverride(id, { name: name.trim() || current });
      router.refresh();
    });
  }

  function moveHoliday(id: string, currentDate: string) {
    const date = window.prompt('תאריך חדש (YYYY-MM-DD):', currentDate);
    if (date === null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    startDelete(async () => {
      await setHolidayOverride(id, { date });
      router.refresh();
    });
  }

  function hideHoliday(id: string) {
    startDelete(async () => {
      await setHolidayOverride(id, { hidden: true });
      router.refresh();
    });
  }

  function restoreHoliday(id: string) {
    startDelete(async () => {
      await resetHolidayOverride(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-[28px] p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="חודש קודם"
            onClick={() => setViewDate((d) => addMonths(d, -1))}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-slate-500"
          >
            ›
          </button>
          <div className="text-center">
            <div className="font-bold text-slate-800">{gregorian}</div>
            <div className="text-xs text-slate-400">{hebrewMonth}</div>
          </div>
          <button
            type="button"
            aria-label="חודש הבא"
            onClick={() => setViewDate((d) => addMonths(d, 1))}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-slate-500"
          >
            ‹
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="pb-1 text-xs font-bold text-slate-400">
              {w}
            </div>
          ))}

          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const key = dateKey(date);
            const dayEntries = entries.get(key) ?? [];
            const dominant = KIND_ORDER.find((k) => dayEntries.some((e) => e.kind === k));
            const isWeekend = getDay(date) >= 5;
            const isToday = key === todayKey;
            const isSelected = key === selected;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(isSelected ? null : key)}
                className="relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition-transform active:scale-95"
                style={{
                  background: dominant
                    ? `color-mix(in srgb, ${KIND_COLOR[dominant]} 30%, white)`
                    : 'rgba(255,255,255,0.5)',
                  color: isWeekend ? '#94a3b8' : '#1f2430',
                  boxShadow: isSelected ? '0 0 0 2px var(--theme)' : undefined,
                  fontWeight: isToday ? 800 : 500,
                }}
              >
                <span>{day}</span>
                {isToday && (
                  <span
                    className="absolute bottom-1 h-1 w-1 rounded-full"
                    style={{ backgroundColor: 'var(--theme)' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
          {KIND_ORDER.map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: KIND_COLOR[k] }} />
              {KIND_LABEL[k]}
            </span>
          ))}
        </div>
      </div>

      {selected && (
        <div className="glass rounded-[24px] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-700">
              {new Intl.DateTimeFormat('he', { day: 'numeric', month: 'long' }).format(
                new Date(selected),
              )}
            </div>
            <AddDayDialog defaultDate={selected} />
          </div>

          {selectedEntries.length === 0 ? (
            <p className="text-sm text-slate-400">אין אירועים ביום זה.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedEntries.map((e, idx) => (
                <li key={idx} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: KIND_COLOR[e.kind] }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">{e.title}</div>
                      <div className="text-xs text-slate-400">{KIND_LABEL[e.kind]}</div>
                    </div>
                    {e.customId && (
                      <button
                        type="button"
                        onClick={() => removeDay(e.customId!)}
                        disabled={isDeleting}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-rose-500 ring-1 ring-rose-200 disabled:opacity-50"
                      >
                        מחיקה
                      </button>
                    )}
                  </div>

                  {e.holidayId && selected && (
                    <div className="flex flex-wrap gap-2 pr-5">
                      <button
                        type="button"
                        onClick={() => renameHoliday(e.holidayId!, e.title)}
                        disabled={isDeleting}
                        className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 disabled:opacity-50"
                      >
                        שינוי שם
                      </button>
                      <button
                        type="button"
                        onClick={() => moveHoliday(e.holidayId!, selected)}
                        disabled={isDeleting}
                        className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 disabled:opacity-50"
                      >
                        שינוי תאריך
                      </button>
                      <button
                        type="button"
                        onClick={() => hideHoliday(e.holidayId!)}
                        disabled={isDeleting}
                        className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-rose-500 ring-1 ring-rose-200 disabled:opacity-50"
                      >
                        הסתרה
                      </button>
                      <button
                        type="button"
                        onClick={() => restoreHoliday(e.holidayId!)}
                        disabled={isDeleting}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-slate-400 disabled:opacity-50"
                      >
                        שחזור
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
