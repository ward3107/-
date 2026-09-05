'use client';

import { useMemo, useState, useTransition } from 'react';
import { getSchoolYear, inferTargetDate } from '@/lib/domain';
import { RELIGIONS } from '@/lib/religions';
import type { School } from '@/lib/schools';
import { AppIcon } from '@/components/AppIcon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { completeOnboarding, searchSchools, type OnboardingInput } from './actions';

function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

const INPUT =
  'rounded-2xl border border-slate-100 bg-white p-4 text-slate-800 shadow-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:ring-white/10 dark:placeholder:text-slate-400';
const CARD =
  'rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/70';
const LABEL = 'text-base font-bold text-slate-700 dark:text-slate-200';
const MUTED = 'text-sm text-slate-400 dark:text-slate-500';
const INACTIVE = 'bg-white/70 text-slate-600 dark:bg-white/10 dark:text-slate-300';

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<School[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [religionIds, setReligionIds] = useState<number[]>([]);
  const [targetDate, setTargetDate] = useState('');
  const [schoolWeek, setSchoolWeek] = useState<5 | 6>(5);
  const [dayOff, setDayOff] = useState<number | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [isSaving, startSave] = useTransition();

  const endYear = useMemo(() => getSchoolYear(new Date()).endYear, []);

  function onQueryChange(value: string) {
    setQuery(value);
    startSearch(async () => {
      setResults(await searchSchools(value));
    });
  }

  function pickSchool(s: School) {
    setSchool(s);
    setResults([]);
    setQuery(s.name);
    setTargetDate(toDateInput(inferTargetDate(s.educationStage ?? '', endYear)));
    setStep(2);
  }

  function toggleReligion(id: number) {
    setReligionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function finish() {
    if (!school) return;
    const input: OnboardingInput = {
      schoolId: school.id,
      educationStage: school.educationStage ?? '',
      religionIds,
      targetDate,
      themeColor: 'emerald',
      schoolWeek,
      dayOff,
    };
    startSave(async () => {
      await completeOnboarding(input);
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-4 pb-10">
      <div className="app-bg" aria-hidden />

      <header className="pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppIcon size={40} />
            <span className="font-display text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">
              כמה נשאר לי?
            </span>
          </div>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">בואו נתחיל</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          כמה פרטים חד-פעמיים כדי להתאים לך את הספירה.
        </p>
        <StepDots step={step} />
      </header>

      {step === 1 && (
        <section className="flex flex-col gap-3">
          <label className={LABEL}>בית הספר שלך</label>
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="חיפוש לפי שם, יישוב או סמל מוסד"
            className={INPUT}
          />
          {isSearching && <p className="px-1 text-sm text-slate-400 dark:text-slate-500">מחפש…</p>}
          <ul className="flex flex-col gap-2">
            {results.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => pickSchool(s)}
                  className={`w-full ${CARD} p-4 text-right transition-all hover:border-emerald-300`}
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {[s.city, s.educationStage, `סמל ${s.symbol}`].filter(Boolean).join(' · ')}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {query.length >= 2 && !isSearching && results.length === 0 && (
            <p className={`px-1 ${MUTED}`}>לא נמצאו בתי ספר תואמים.</p>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-3">
          <div>
            <label className={LABEL}>הדת/דתות שלך</label>
            <p className={MUTED}>אפשר לבחור יותר מאחת (משפחות מעורבות).</p>
          </div>
          <div className="flex flex-col gap-2">
            {RELIGIONS.map((r) => {
              const selected = religionIds.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleReligion(r.id)}
                  aria-pressed={selected}
                  className={`flex items-center justify-between ${CARD} p-4 text-right`}
                  style={selected ? { boxShadow: '0 0 0 2px var(--theme)' } : undefined}
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{r.name}</span>
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                    style={{ backgroundColor: selected ? 'var(--theme)' : '#cbd5e1' }}
                  >
                    {selected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
          <NavButtons
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            nextDisabled={religionIds.length === 0}
          />
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-3">
          <div>
            <label className={LABEL}>תאריך סיום השנה</label>
            <p className={MUTED}>נגזר אוטומטית משלב החינוך — אפשר לשנות.</p>
          </div>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={INPUT}
          />

          {/* מספר ימי לימוד בשבוע */}
          <div>
            <label className={LABEL}>שבוע הלימודים בבית הספר</label>
            <div className="mt-2 flex gap-2">
              {([5, 6] as const).map((w) => {
                const active = schoolWeek === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setSchoolWeek(w);
                      if (w === 5 && dayOff === 5) setDayOff(null);
                    }}
                    aria-pressed={active}
                    className={`flex-1 rounded-2xl py-3 text-sm font-bold ${
                      active ? 'text-white' : INACTIVE
                    }`}
                    style={active ? { background: 'var(--theme)' } : undefined}
                  >
                    {w === 5 ? '5 ימים (א׳–ה׳)' : '6 ימים (א׳–ו׳)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* יום חופש שבועי קבוע */}
          <div>
            <label className={LABEL}>יום חופש שבועי קבוע</label>
            <p className={MUTED}>אם יש לך יום קבוע בלי הוראה — נוריד אותו מהספירה.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { v: null as number | null, label: 'אין' },
                { v: 0, label: 'א׳' },
                { v: 1, label: 'ב׳' },
                { v: 2, label: 'ג׳' },
                { v: 3, label: 'ד׳' },
                { v: 4, label: 'ה׳' },
                ...(schoolWeek === 6 ? [{ v: 5, label: 'ו׳' }] : []),
              ].map((opt) => {
                const active = dayOff === opt.v;
                return (
                  <button
                    key={String(opt.v)}
                    type="button"
                    onClick={() => setDayOff(opt.v)}
                    aria-pressed={active}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      active ? 'text-white' : INACTIVE
                    }`}
                    style={active ? { background: 'var(--theme)' } : undefined}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`${CARD} p-4 text-sm text-slate-500 dark:text-slate-400`}>
            <div>
              בית ספר:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {school?.name}
              </span>
            </div>
            <div>
              דתות:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {RELIGIONS.filter((r) => religionIds.includes(r.id))
                  .map((r) => r.name)
                  .join(', ')}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-300"
            >
              חזרה
            </button>
            <button
              type="button"
              onClick={finish}
              disabled={isSaving || !targetDate}
              className="flex-1 rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--theme)' }}
            >
              {isSaving ? 'שומר…' : 'סיום'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div className="mt-4 flex gap-2">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700"
          style={n <= step ? { backgroundColor: 'var(--theme)' } : undefined}
        />
      ))}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onBack}
        className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-300"
      >
        חזרה
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        style={{ backgroundColor: 'var(--theme)' }}
      >
        המשך
      </button>
    </div>
  );
}
