'use client';
import React, { useState } from 'react';

/** ניהול ובחירת חגים מרובי דתות — עיצוב Stitch. */
export interface SectorOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: string;
}

export const availableSectors: SectorOption[] = [
  {
    id: 'jewish',
    name: 'חגים יהודיים',
    badge: 'עב',
    description: 'ממלכתי, ממ"ד וחרדי • ראש השנה, פסח, סוכות וצומות',
    icon: '✡️',
  },
  {
    id: 'christian',
    name: 'חגים נוצריים',
    badge: '✝️',
    description: 'קתולי, אורתודוקסי, ארמי ופרוטסטנטי • מולד, פסחא וראש השנה',
    icon: '✝️',
  },
  {
    id: 'muslim',
    name: 'חגים מוסלמיים (مُسلِم)',
    badge: '☪️',
    description: "עיד אל-פיטר, עיד אל-אדחא, פתיחת הרמדאן וראש השנה ההיג'רי",
    icon: '☪️',
  },
  {
    id: 'druze',
    name: 'חגים דרוזיים (موحدون)',
    badge: '⭐',
    description: 'זיארת נבי שועייב, חג הקורבן ומועדי העדה הדרוזית',
    icon: '⭐',
  },
  {
    id: 'circassian',
    name: "מורשת צ'רקסית",
    badge: 'Ады',
    description: 'יום הזיכרון ומועדים מסורתיים',
    icon: '🏛️',
  },
  {
    id: 'ethiopian',
    name: 'מורשת אתיופית',
    badge: 'አማ',
    description: 'חג הסיגד ולוח ממלכתי מותאם',
    icon: '✨',
  },
];

interface Props {
  /** בחירה התחלתית — נזרעת מהדתות האמיתיות של המורה. */
  initialSelected?: string[];
}

export const MultiSectorHolidays: React.FC<Props> = ({
  initialSelected = ['jewish', 'christian'],
}) => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>(initialSelected);

  const toggleSector = (id: string) => {
    setSelectedSectors((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            סנכרון חגים רב-דתי ומגזרי
          </h3>
          <p className="text-xs text-slate-400">
            בחירה בו-זמנית למשפחות רב-תרבותיות ומורים בקהילות משולבות
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          {selectedSectors.length} נבחרו
        </span>
      </div>

      <div className="space-y-2">
        {availableSectors.map((sector) => {
          const active = selectedSectors.includes(sector.id);
          return (
            <div
              key={sector.id}
              onClick={() => toggleSector(sector.id)}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 transition-all ${
                active
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                  : 'border-slate-100 hover:border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => {}}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white">
                    {sector.name}
                  </div>
                  <div className="text-[11px] text-slate-400">{sector.description}</div>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/10 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {sector.badge}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
