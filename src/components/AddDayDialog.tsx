'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addCustomDay } from '@/app/actions';

function todayInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export function AddDayDialog({ defaultDate }: { defaultDate?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate ?? todayInput());
  const [affects, setAffects] = useState(true);
  const [isSaving, startSave] = useTransition();

  function submit() {
    if (!title.trim() || !date) return;
    startSave(async () => {
      await addCustomDay({ title: title.trim(), date, affectsCountdown: affects });
      setOpen(false);
      setTitle('');
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-theme rounded-full px-4 py-1.5 text-sm font-semibold"
      >
        + יום משלי
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass w-full max-w-md rounded-[28px] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100">
              הוספת יום משלי
            </h3>

            <label className="mb-1 block text-sm font-medium text-slate-500 dark:text-slate-400">כותרת</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="למשל: יום כיף, אסיפת הורים"
              className="mb-3 w-full rounded-2xl bg-white/70 p-3 text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-2 dark:bg-white/10 dark:text-slate-100 dark:ring-white/10 dark:placeholder:text-slate-400"
            />

            <label className="mb-1 block text-sm font-medium text-slate-500 dark:text-slate-400">תאריך</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mb-3 w-full rounded-2xl bg-white/70 p-3 text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-2 dark:bg-white/10 dark:text-slate-100 dark:ring-white/10 dark:placeholder:text-slate-400"
            />

            <label className="mb-4 flex items-center justify-between rounded-2xl bg-white/60 p-3 dark:bg-white/5">
              <span className="text-sm text-slate-700 dark:text-slate-200">
                לנכות מספירת ימי הלימוד
              </span>
              <input
                type="checkbox"
                checked={affects}
                onChange={(e) => setAffects(e.target.checked)}
                className="h-5 w-5 accent-[var(--theme)]"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 ring-1 ring-slate-200 dark:text-slate-300 dark:ring-white/10"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={isSaving || !title.trim()}
                className="btn-theme flex-1 rounded-full px-4 py-2.5 text-sm font-bold disabled:opacity-50"
              >
                {isSaving ? 'שומר…' : 'הוספה'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
