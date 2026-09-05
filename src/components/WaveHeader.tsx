'use client';
import React, { useState } from 'react';

/**
 * באנר עליון בסגנון Stitch: נוף חופשה מתחלף (טבע בלבד, ללא דמויות)
 * + אפקט גלים אורגני מונפש. עיצוב §9 — סגנון רקע "נוף".
 */
export const vacationSceneries = [
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    label: '☀️ חוף טרופי, מים צלולים ושלווה',
  },
  {
    url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    label: '🏔️ אגם אלפיני, אוויר הרים צלול ורוגע',
  },
  {
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    label: '🌺 מרפסת ים-תיכונית מול שקיעה כחולה',
  },
];

export const WaveHeader: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const nextDestination = () => {
    setCurrentIdx((prev) => (prev + 1) % vacationSceneries.length);
  };

  const scene = vacationSceneries[currentIdx] ?? vacationSceneries[0]!;

  return (
    <div className="relative h-72 w-full select-none overflow-hidden">
      {/* תמונת רקע נוף עם מעבר חלק */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scene.url}
        alt="נוף חופשה"
        className="absolute inset-0 h-full w-full object-cover brightness-95 transition-all duration-700"
      />

      {/* שכבת גרדיאנט להדגשת תוכן */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#f8f9ff]/90 dark:to-[#131722]" />

      {/* שורת הדר עליונה */}
      <div className="absolute inset-x-4 top-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-white/85 px-3.5 py-1.5 shadow-sm backdrop-blur-md dark:bg-slate-900/80">
          <span className="text-xl">🍹</span>
          <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
            כמה נשאר לי?
          </span>
        </div>

        <button
          onClick={nextDestination}
          className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white active:scale-95 dark:bg-slate-900/85 dark:text-slate-200"
        >
          <span>🎲</span>
          <span>שנה יעד</span>
        </button>
      </div>

      {/* תגית שם היעד */}
      <div className="absolute bottom-10 right-4 z-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {scene.label}
        </span>
      </div>

      {/* אפקט גלים אורגניים נעים (Organic SVG Waves) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 overflow-hidden leading-none">
        <svg
          className="animate-wave h-full w-[200%] fill-current text-[#f8f9ff] opacity-95 dark:text-[#131722]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
};
