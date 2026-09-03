'use client';

import { useMemo, useState } from 'react';
import { addMonths, getDay, getDaysInMonth, startOfMonth } from 'date-fns';
import type { CustomDay, Holiday, UpcomingKind } from '@/lib/domain';

interface DayEntry {
  kind: UpcomingKind;
  title: string;
}

const WEEKDAY_LABELS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']; // ראשon..שבת

// עדיפות צבע כשיש כמה סטטוסים באותו יום (CLAUDE.md §9 — 3 קטגוריות).
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

export function MonthCalendar({
  holidays,
  customDays,
}: {
  holidays: Holiday[];
  customDays: CustomDay[];
}) {
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(null);

  const entries = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    const push = (date: string, kind: UpcomingKind, title: string) => {
      const list = map.get(date) ?? [];
      list.push({ kind, title });
      map.set(date, list);
    };
    for (const h of holidays) {
      push(h.date, h.isSchoolClosed ? 'school-closed' : 'personal-holiday', h.name);
    }
    for (const c of customDays) push(c.date, 'personal-day', c.title);
    return map;
  }, [holidays, customDays]);

  const leadingBlanks = getDay(viewDate); // כמה תאים ריקים לפני ה-1 בחודש
  const daysInMonth = getDaysInMonth(viewDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // כותרת כפולה: חודש לועזי + החודש בלוח העברי (CLAUDE.md §8.3).
  const gregorian = new Intl.DateTimeFormat('he', { month: 'long', year: 'numeric' }).format(
    viewDate,
  );
  const hebrewMonth = new Intl.DateTimeFormat('he-u-ca-hebrew', { month: 'long' }).format(
    new Date(year, month, 15),
  );

  const todayKey = dateKey(new Date());
  const selectedEntries = selected ? (entries.get(selected) ?? []) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="חודש קודם"
          onClick={() => setViewDate((d) => addMonths(d, -1))}
          className="rounded-full bg-white px-3 py-1.5 text-slate-500 shadow-sm"
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
          className="rounded-full bg-white px-3 py-1.5 text-slate-500 shadow-sm"
        >
          ‹
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="pb-1 text-xs font-semibold text-slate-400">
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
              className="relative flex aspect-square flex-col items-center justify-center rounded-soft text-sm"
              style={{
                backgroundColor: dominant
                  ? `color-mix(in srgb, ${KIND_COLOR[dominant]} 22%, white)`
                  : '#ffffff',
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

      <Legend />

      {selected && (
        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-bold text-slate-700">
            {new Intl.DateTimeFormat('he', { day: 'numeric', month: 'long' }).format(
              new Date(selected),
            )}
          </div>
          {selectedEntries.length === 0 ? (
            <p className="text-sm text-slate-400">אין אירועים ביום זה.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedEntries.map((e, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: KIND_COLOR[e.kind] }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-800">{e.title}</div>
                    <div className="text-xs text-slate-400">{KIND_LABEL[e.kind]}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--theme)' }}
            >
              ליומן
            </button>
            <button
              type="button"
              className="flex-1 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200"
            >
              תזכורת
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
      {KIND_ORDER.map((k) => (
        <span key={k} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: KIND_COLOR[k] }} />
          {KIND_LABEL[k]}
        </span>
      ))}
    </div>
  );
}
