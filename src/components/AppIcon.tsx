/**
 * אייקון האפליקציה בסגנון Stitch (§3.א): קוביית אמרלד זכוכיתית עם
 * לוח שנה שולחני, שמש קיצית ומשקפי שמש מוזהבים. SVG מוטמע — ללא קובץ
 * חיצוני, offline-friendly (§3.4). צבע האמרלד קבוע (מיתוג), לא ערכת המורה.
 */
export function AppIcon({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      role="img"
      aria-label="כמה נשאר לי?"
    >
      <defs>
        <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* קוביית אמרלד זכוכיתית */}
      <rect x="2" y="2" width="76" height="76" rx="24" fill="url(#tile)" />
      <rect x="2" y="2" width="76" height="34" rx="24" fill="#ffffff" opacity="0.14" />

      {/* שמש קיצית */}
      <g stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round">
        <line x1="23" y1="11" x2="23" y2="16" />
        <line x1="14" y1="20" x2="18" y2="22.5" />
        <line x1="32" y1="20" x2="28" y2="22.5" />
      </g>
      <circle cx="23" cy="23" r="6.5" fill="#fde68a" stroke="#fbbf24" strokeWidth="2" />

      {/* לוח שנה שולחני */}
      <rect x="16" y="31" width="48" height="33" rx="8" fill="#ffffff" />
      <rect x="16" y="31" width="48" height="11" rx="8" fill="#e2e8f0" />
      <rect x="26" y="27" width="3.5" height="9" rx="1.75" fill="#334155" />
      <rect x="50.5" y="27" width="3.5" height="9" rx="1.75" fill="#334155" />

      {/* משקפי שמש מוזהבים על הלוח */}
      <g>
        <circle cx="33" cy="53" r="6.5" fill="#1f2937" stroke="#f59e0b" strokeWidth="2.5" />
        <circle cx="47" cy="53" r="6.5" fill="#1f2937" stroke="#f59e0b" strokeWidth="2.5" />
        <path d="M39 51.5 Q40 49.5 41 51.5" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <line x1="26.5" y1="50.5" x2="22" y2="49" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="53.5" y1="50.5" x2="58" y2="49" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
