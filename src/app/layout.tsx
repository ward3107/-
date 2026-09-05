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

// מונע הבהוב: קובע את מצב התצוגה לפני ה-render לפי localStorage / העדפת מערכת.
const THEME_INIT = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // עברית בלבד, RTL (CLAUDE.md §1).
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="font-sans">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
      </body>
    </html>
  );
}
