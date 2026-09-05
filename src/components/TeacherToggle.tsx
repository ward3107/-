'use client';
import React from 'react';

/** מתג מעבר מהיר בין מורה גבר (דניאל) למורה אישה (מיכל) — עיצוב Stitch. */
interface Props {
  activeTeacher: 'michal' | 'daniel';
  onToggle: (teacher: 'michal' | 'daniel') => void;
}

export const TeacherToggle: React.FC<Props> = ({ activeTeacher, onToggle }) => {
  return (
    <div className="flex items-center rounded-2xl bg-slate-200/80 p-1 shadow-inner dark:bg-slate-800/80">
      <button
        onClick={() => onToggle('daniel')}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition-all ${
          activeTeacher === 'daniel'
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
        }`}
      >
        <span>👨‍🏫</span>
        <span>דניאל (מורה)</span>
      </button>

      <button
        onClick={() => onToggle('michal')}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition-all ${
          activeTeacher === 'michal'
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
        }`}
      >
        <span>👩‍🏫</span>
        <span>מיכל (מורה)</span>
      </button>
    </div>
  );
};
