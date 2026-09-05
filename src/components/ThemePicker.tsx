'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { THEME_COLORS, themeColorValue } from '@/lib/theme';
import { updateTeacherTheme } from '@/app/actions';

/** בחירת ערכת נושא — מחילה מיידית ושומרת ל-DB. */
export function ThemePicker({ current }: { current: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(current);
  const [, startSave] = useTransition();

  function pick(code: string) {
    setSelected(code);
    // החלה מיידית על כל העמוד
    document.documentElement.style.setProperty('--theme', themeColorValue(code));
    startSave(async () => {
      await updateTeacherTheme(code);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-3">
      {Object.entries(THEME_COLORS).map(([code, hex]) => {
        const active = code === selected;
        return (
          <button
            key={code}
            type="button"
            aria-label={code}
            aria-pressed={active}
            onClick={() => pick(code)}
            className="h-9 w-9 rounded-full transition-transform active:scale-90"
            style={{
              backgroundColor: hex,
              boxShadow: active ? '0 0 0 2px #fff, 0 0 0 4px ' + hex : '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />
        );
      })}
    </div>
  );
}
