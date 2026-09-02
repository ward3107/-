'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'בית', icon: '🏠' },
  { href: '/calendar', label: 'לוח', icon: '🗓️' },
  { href: '/profile', label: 'פרופיל', icon: '👤' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-100 bg-white/90 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-2.5 text-xs"
                style={{ color: active ? 'var(--theme)' : '#94a3b8' }}
              >
                <span aria-hidden className="text-lg">
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
