/**
 * 5 צבעי הבסיס של ערכת הנושא (CLAUDE.md §9).
 * המורה בוחר אחד; הערך נשמר ב-teachers.theme_color ומוזרק כ-CSS variable.
 */
export const THEME_COLORS = {
  emerald: '#10b981',
  sky: '#0ea5e9',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
} as const;

export type ThemeColor = keyof typeof THEME_COLORS;

export const DEFAULT_THEME: ThemeColor = 'emerald';

/** מחזיר את ערך ה-hex של ערכת הנושא, עם נפילה לברירת המחדל. */
export function themeColorValue(code: string | null | undefined): string {
  if (code && code in THEME_COLORS) {
    return THEME_COLORS[code as ThemeColor];
  }
  return THEME_COLORS[DEFAULT_THEME];
}
