'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateSchedule } from '@/app/actions';

const DAYS = [
  { v: null as number | null, label: 'אין' },
  { v: 0, label: 'א׳' },
  { v: 1, label: 'ב׳' },
  { v: 2, label: 'ג׳' },
  { v: 3, label: 'ד׳' },
  { v: 4, label: 'ה׳' },
  { v: 5, label: 'ו׳' },
];

/** עריכת לוח הזמנים: מספר ימי לימוד בשבוע + יום חופש שבועי. */
export function ScheduleEditor({
  schoolWeek,
  dayOff,
}: {
  schoolWeek: number;
  dayOff: number | null;
}) {
  const router = useRouter();
  const [week, setWeek] = useState<5 | 6>(schoolWeek === 6 ? 6 : 5);
  const [off, setOff] = useState<number | null>(dayOff);
  const [isSaving, startSave] = useTransition();

  function save(nextWeek: 5 | 6, nextOff: number | null) {
    setWeek(nextWeek);
    setOff(nextOff);
    startSave(async () => {
      await updateSchedule({ schoolWeek: nextWeek, dayOff: nextOff });
      router.refresh();
    });
  }

  const dayOptions = DAYS.filter((d) => d.v === null || d.v <= (week === 6 ? 5 : 4));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {([5, 6] as const).map((w) => (
          <button
            key={w}
            type="button"
            disabled={isSaving}
            onClick={() => save(w, w === 5 && off === 5 ? null : off)}
            className="flex-1 rounded-2xl py-2.5 text-sm font-bold disabled:opacity-60"
            style={
              week === w
                ? { background: 'var(--theme)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.6)', color: '#475569' }
            }
          >
            {w === 5 ? '5 ימים' : '6 ימים'}
          </button>
        ))}
      </div>

      <div>
        <div className="mb-1.5 text-xs font-medium text-slate-500">יום חופש שבועי</div>
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((opt) => (
            <button
              key={String(opt.v)}
              type="button"
              disabled={isSaving}
              onClick={() => save(week, opt.v)}
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold disabled:opacity-60"
              style={
                off === opt.v
                  ? { background: 'var(--theme)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.6)', color: '#475569' }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
