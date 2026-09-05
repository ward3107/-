import type { Config } from 'tailwindcss';

/**
 * מערכת העיצוב (CLAUDE.md §9):
 *   - סגנון משחקי, רך, "עסיסי". פינות מעוגלות מאוד (20–32px).
 *   - עומק דרך שכבות צבע שקופות, לא גרדיאנטים או צללים כבדים.
 *   - 5 צבעי בסיס לבחירת המורה. הצבעים מקודדים סטטוס, לא דת.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
        // גופן תצוגה (Stitch) — למספרים ולכותרות גדולות.
        display: ['Plus Jakarta Sans', 'var(--font-heebo)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        waveMotion: {
          '0%': { transform: 'translateX(0) scaleY(1)' },
          '50%': { transform: 'translateX(-25%) scaleY(1.1)' },
          '100%': { transform: 'translateX(-50%) scaleY(1)' },
        },
      },
      animation: {
        wave: 'waveMotion 12s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite',
      },
      borderRadius: {
        // פינות מעוגלות מאוד — 20 עד 32px
        soft: '20px',
        card: '28px',
        blob: '32px',
      },
      colors: {
        // 5 צבעי בסיס (theme_color): המורה בוחר אחד.
        theme: {
          emerald: '#10b981',
          sky: '#0ea5e9',
          amber: '#f59e0b',
          rose: '#f43f5e',
          violet: '#8b5cf6',
        },
        // 3 קטגוריות סטטוס בלוח (לא דת!) — CLAUDE.md §9 כלל צבע.
        status: {
          closed: '#38bdf8', // בית הספר סגור
          holiday: '#fbbf24', // חג אישי
          personal: '#c084fc', // יום אישי
        },
      },
    },
  },
  plugins: [],
};

export default config;
