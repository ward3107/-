'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'בית', icon: '🏠' },
  { href: '/calendar', label: 'לוח', icon: '🗓️' },
  { href: '/profile', label: 'פרופיל', icon: '👤' },
];

/** סרגל ניווט תחתון צף בסגנון iOS. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <ul className="glass flex w-full max-w-xs items-center justify-around rounded-full px-2 py-1.5">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                className="flex flex-col items-center gap-0.5 rounded-full px-5 py-1.5 text-[11px] font-semibold transition-colors"
                style={
                  active
                    ? { color: '#fff', background: 'var(--theme)' }
                    : { color: '#64748b' }
                }
              >
                <span aria-hidden className="text-base">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
