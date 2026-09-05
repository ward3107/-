'use client';

import { useMemo, useState, useTransition } from 'react';
import { getSchoolYear, inferTargetDate } from '@/lib/domain';
import { RELIGIONS } from '@/lib/religions';
import type { School } from '@/lib/schools';
import { completeOnboarding, searchSchools, type OnboardingInput } from './actions';

function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

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
        <h1 className="text-2xl font-extrabold text-slate-800">בואו נתחיל</h1>
        <p className="text-sm text-slate-500">כמה פרטים חד-פעמיים כדי להתאים לך את הספירה.</p>
        <StepDots step={step} />
      </header>

      {step === 1 && (
        <section className="flex flex-col gap-3">
          <label className="text-base font-bold text-slate-700">בית הספר שלך</label>
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="חיפוש לפי שם, יישוב או סמל מוסד"
            className="glass rounded-2xl p-4 shadow-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-300"
          />
          {isSearching && <p className="px-1 text-sm text-slate-400">מחפש…</p>}
          <ul className="flex flex-col gap-2">
            {results.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => pickSchool(s)}
                  className="w-full glass rounded-2xl p-4 text-right shadow-sm ring-1 ring-slate-100 hover:ring-2"
                >
                  <div className="font-semibold text-slate-800">{s.name}</div>
                  <div className="text-xs text-slate-400">
                    {[s.city, s.educationStage, `סמל ${s.symbol}`].filter(Boolean).join(' · ')}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {query.length >= 2 && !isSearching && results.length === 0 && (
            <p className="px-1 text-sm text-slate-400">לא נמצאו בתי ספר תואמים.</p>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-3">
          <div>
            <label className="text-base font-bold text-slate-700">הדת/דתות שלך</label>
            <p className="text-sm text-slate-400">אפשר לבחור יותר מאחת (משפחות מעורבות).</p>
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
                  className="flex items-center justify-between glass rounded-2xl p-4 text-right shadow-sm ring-1 ring-slate-100"
                  style={selected ? { boxShadow: '0 0 0 2px var(--theme)' } : undefined}
                >
                  <span className="font-semibold text-slate-800">{r.name}</span>
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                    style={{ backgroundColor: selected ? 'var(--theme)' : '#e2e8f0' }}
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
            <label className="text-base font-bold text-slate-700">תאריך סיום השנה</label>
            <p className="text-sm text-slate-400">נגזר אוטומטית משלב החינוך — אפשר לשנות.</p>
          </div>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="glass rounded-2xl p-4 shadow-sm outline-none ring-1 ring-slate-200 focus:ring-2"
          />
          {/* מספר ימי לימוד בשבוע */}
          <div>
            <label className="text-base font-bold text-slate-700">שבוע הלימודים בבית הספר</label>
            <div className="mt-2 flex gap-2">
              {([5, 6] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => {
                    setSchoolWeek(w);
                    if (w === 5 && dayOff === 5) setDayOff(null);
                  }}
                  aria-pressed={schoolWeek === w}
                  className="flex-1 rounded-2xl py-3 text-sm font-bold"
                  style={
                    schoolWeek === w
                      ? { background: 'var(--theme)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.6)', color: '#475569' }
                  }
                >
                  {w === 5 ? '5 ימים (א׳–ה׳)' : '6 ימים (א׳–ו׳)'}
                </button>
              ))}
            </div>
          </div>

          {/* יום חופש שבועי קבוע */}
          <div>
            <label className="text-base font-bold text-slate-700">יום חופש שבועי קבוע</label>
            <p className="text-sm text-slate-400">אם יש לך יום קבוע בלי הוראה — נוריד אותו מהספירה.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { v: null as number | null, label: 'אין' },
                { v: 0, label: 'א׳' },
                { v: 1, label: 'ב׳' },
                { v: 2, label: 'ג׳' },
                { v: 3, label: 'ד׳' },
                { v: 4, label: 'ה׳' },
                ...(schoolWeek === 6 ? [{ v: 5, label: 'ו׳' }] : []),
              ].map((opt) => (
                <button
                  key={String(opt.v)}
                  type="button"
                  onClick={() => setDayOff(opt.v)}
                  aria-pressed={dayOff === opt.v}
                  className="rounded-full px-4 py-2 text-sm font-semibold"
                  style={
                    dayOff === opt.v
                      ? { background: 'var(--theme)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.6)', color: '#475569' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 text-sm text-slate-500 shadow-sm">
            <div>בית ספר: <span className="font-semibold text-slate-700">{school?.name}</span></div>
            <div>
              דתות:{' '}
              <span className="font-semibold text-slate-700">
                {RELIGIONS.filter((r) => religionIds.includes(r.id)).map((r) => r.name).join(', ')}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500"
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
          className="h-1.5 flex-1 rounded-full"
          style={{ backgroundColor: n <= step ? 'var(--theme)' : '#e2e8f0' }}
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
        className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500"
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
