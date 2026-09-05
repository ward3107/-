'use client';

import { useEffect, useState } from 'react';

/**
 * מתג מצב תצוגה בהיר/כהה. שומר את הבחירה ב-localStorage ומחיל מיד
 * על ה-<html> (הכיתה `dark`). מצב ההתחלה נקבע ע"י סקריפט ב-layout כדי
 * למנוע הבהוב בטעינה.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      /* אחסון חסום — נתעלם */
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
      className={
        className ??
        'grid h-9 w-9 place-items-center rounded-full bg-white/85 text-base shadow-sm backdrop-blur-md transition-transform active:scale-90 dark:bg-slate-800/80'
      }
    >
      <span aria-hidden>{dark ? '☀️' : '🌙'}</span>
    </button>
  );
}
