import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'כמה נשאר לי?',
  description: 'ספירה לאחור בימי לימוד עד סוף שנת הלימודים — למורים בישראל.',
  applicationName: 'כמה נשאר לי?',
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // עברית בלבד, RTL (CLAUDE.md §1).
  return (
    <html lang="he" dir="rtl">
      <body className="font-sans">{children}</body>
    </html>
  );
}
