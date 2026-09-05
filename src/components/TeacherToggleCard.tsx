'use client';
import React, { useState } from 'react';
import { TeacherToggle } from './TeacherToggle';

/**
 * עטיפת לקוח למתג המורה: מחזיקה את המצב ומציגה את האווטאר של הדמות הפעילה.
 * אלמנט עיצוב מתוך מוקאפ Stitch (תצוגה מקדימה של הדמות).
 */
const AVATARS: Record<'michal' | 'daniel', { name: string; url: string }> = {
  daniel: {
    name: 'דניאל',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  michal: {
    name: 'מיכל',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
};

export const TeacherToggleCard: React.FC = () => {
  const [active, setActive] = useState<'michal' | 'daniel'>('michal');
  const avatar = AVATARS[active];

  return (
    <div className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatar.url}
        alt={avatar.name}
        className="h-12 w-12 flex-shrink-0 rounded-2xl object-cover ring-2 ring-emerald-500/30"
      />
      <div className="flex-1">
        <TeacherToggle activeTeacher={active} onToggle={setActive} />
      </div>
    </div>
  );
};
