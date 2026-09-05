# כמה נשאר לי? — Design Specification (for Figma)

A complete reference for designing the app in Figma so a design maps 1:1 to the built product.
Everything here reflects what's implemented today plus the intended visual system.

---

## 1. Product in one line

A mobile-first PWA for teachers in Israel. After a one-time setup (school + religion(s) +
school-week + free day), it shows a **school-days countdown to the end of the year**, the
teacher's **personal holiday calendar**, and lets them add personal days. Hebrew only, **RTL**.

**Unique value:** it distinguishes *"the school is closed"* (by the school's sector) from
*"I'm personally off but the school is open"* (by the teacher's religion). The big number is the
teacher's **actual remaining work days**.

---

## 2. Frame, grid, layout

- **Design frame:** 390 × 844 (iPhone 13/14). Must also work 360–430 wide.
- **Content column:** centered, **max-width 448px** (`max-w-md`), horizontal padding **16px**.
- **Vertical rhythm:** gap between stacked cards **16px**; inside cards **16–20px** padding.
- **Bottom nav** is a floating pill, fixed; content adds **112px** bottom padding so nothing hides behind it.
- **Direction: RTL.** Everything mirrors — text right-aligned, back/forward chevrons flipped,
  nav order right→left.

---

## 3. Design language

**Style:** iOS-like **frosted glass / minimalist**. Soft, rounded, calm. Depth via translucent
layers and blur — **not** heavy drop-shadows or hard borders.

### 3.1 Background (every screen)
A fixed, non-scrolling gradient tinted by the active **theme color**:
- 3 soft radial glows of the theme color (top-right ~42%, top-left ~26%, bottom ~20% opacity)
- over a light vertical gradient `#f7f8fc → #eaeef6`.
The theme color drives the whole mood; changing it re-tints the background.

### 3.2 Glass card (the core surface)
- Fill: `rgba(255,255,255,0.55)`
- Backdrop blur: **24px**, saturate **160%**
- Border: `1px solid rgba(255,255,255,0.65)`
- Shadow: `0 12px 40px -16px rgba(15,23,42,0.35)` (soft, low)
- Corner radius: **28px** (large cards), **20–22px** (list rows / small cards), **32px** (hero)

### 3.3 Corner radii scale
- Hero card: **32px**
- Standard card: **28px**
- List row / stat / input: **20–22px**
- Pills, buttons, chips, nav: **full / 9999px**

---

## 4. Color tokens

### 4.1 Theme colors (user picks one; default = Emerald)
| Name | Hex |
|---|---|
| Emerald (default) | `#10b981` |
| Sky | `#0ea5e9` |
| Amber | `#f59e0b` |
| Rose | `#f43f5e` |
| Violet | `#8b5cf6` |

The chosen color = accent: the big number, progress fill, primary buttons, active nav item,
selection rings, and the background tint.

### 4.2 Status colors (calendar/list — encode STATUS, never religion)
| Meaning | Hebrew | Hex |
|---|---|---|
| School closed (sector) | בית הספר סגור | `#38bdf8` (sky-blue) |
| My holiday (religion, school open) | חג שלי | `#fbbf24` (amber) |
| Personal day (self-added) | יום אישי | `#c084fc` (purple) |

> Critical rule: exactly **three** status categories. Never color by religion.

### 4.3 Neutrals / text
- Primary text (ink): `#0b1220` / slate-800 `#1f2937`
- Secondary text: slate-500 `#64748b`
- Tertiary / hints: slate-400 `#94a3b8`
- Danger (delete/hide): rose-500 `#f43f5e`
- Base page behind glass: `#eef1f7`

---

## 5. Typography

- **Font:** Heebo (Hebrew), fallback SF Pro / system. Weights used: 400, 500, 600, 700, 800, 900.
- **Scale:**
  | Role | Size | Weight |
  |---|---|---|
  | Hero number | ~88px (5.5rem) | 900 (black) |
  | Screen title (H1) | 24px | 800 |
  | Section heading (H2) | 16px | 800 |
  | Card value (stat) | 30px | 900 |
  | Body | 14px | 400–600 |
  | Label / caption | 12–13px | 500 |
  | Micro (nav, chips) | 11–12px | 600 |
- Numbers use **tabular-nums** so the countdown doesn't jitter.

---

## 6. Global components

### 6.1 Bottom navigation (floating pill)
- Fixed at bottom center, glass pill, max-width ~320px, radius full, padding ~6px.
- 3 items, RTL order: **בית (🏠) · לוח (🗓️) · פרופיל (👤)**.
- Active item: solid theme-color background, white text, rounded-full. Inactive: slate-500, no fill.
- Each item: icon (18px) above a 11px label.

### 6.2 Primary button
- Fill: vertical gradient of theme color; white text; radius full; padding ~14×24;
  soft theme-colored shadow. Press: scale 0.95.

### 6.3 Secondary / ghost button
- White/translucent fill, slate-600 text, 1px slate-200 ring, radius full.

### 6.4 Input / date field
- Glass or white `rgba(255,255,255,0.7)` fill, radius 16–20px, 12–16px padding,
  1px slate-200 ring; focus adds a 2px ring.

### 6.5 Chip / segmented control (onboarding, schedule)
- Pills; selected = theme fill + white; unselected = translucent white + slate-600.

### 6.6 Modal / dialog (Add personal day)
- **Renders as a full-screen overlay via a portal** (must sit above everything, centered on
  desktop, bottom-sheet on mobile). Dimmed backdrop `rgba(0,0,0,0.30)` + slight blur.
- Sheet: glass, radius 28px, padding 20px. Title + fields + two actions (ביטול / הוספה).
- ⚠️ Design note: modals must NOT be nested visually inside a card — they overlay the whole screen.

---

## 7. Screens

### 7.1 Login  (`/login`)
- Centered glass card (radius 36px, ~28px padding) on the gradient.
- Top: rounded-square app icon (80×80, theme fill, emoji 🎒) with theme shadow.
- H1 "כמה נשאר לי?" (30px, 900) + one-line subtitle (slate-500).
- **Google button:** white, radius 16px, full-width, 1px slate-200 ring, real Google "G" logo +
  "התחברות עם Google". Press scale 0.95. Loading → "מתחבר…".
- Footer micro-note about calendar sync.

### 7.2 Onboarding  (`/onboarding`) — 3 steps
Header: H1 "בואו נתחיל" + subtitle + a 3-segment progress bar (filled segments = theme color).

- **Step 1 — School:** search input (name / city / symbol); results as tappable glass rows
  (name bold + "city · stage · סמל 12345"). Selection only, never free text.
- **Step 2 — Religion(s):** multi-select list rows with a check circle (theme when selected).
  "Continue" disabled until ≥1 chosen.
- **Step 3 — Schedule & target:**
  - Target date (auto-derived from stage: elementary 30/6, else 20/6) — editable date field.
  - **School week:** two big segmented buttons — "5 ימים (א׳–ה׳)" / "6 ימים (א׳–ו׳)".
  - **Weekly free day:** chips — אין · א׳ · ב׳ · ג׳ · ד׳ · ה׳ (+ ו׳ if 6-day).
  - Summary card (school + religions). Back / "סיום".

### 7.3 Home  (`/`)
Top → bottom:
1. **Header:** "שנת הלימודים 2026-27" (caption), "שלום, {name}" (H1), school name (slate-500).
2. **Hero card (glass, 32px):** giant number = remaining **work** days (theme color, ~88px),
   label "ימי לימוד נשארו", subtitle "עד {date} · אחרי ניכוי חגים וסופ״ש".
3. **Daily motivation** line (centered, slate-600).
4. **Progress bar card:** "ההתקדמות שלך" + "X% מהשנה מאחוריך"; track slate-900/10, fill = theme gradient.
5. **Two stat cards** (grid 2): "ימים עד הסיום" (calendar days) · "ימי חופשה שנותרו".
6. **Upcoming section:** H2 "הימים הקרובים" + a small primary "+ יום משלי" (opens Add dialog).
   List of glass rows: a colored **status bar** (left, 6×36px) + title + status label + date
   (formatted "5 בספטמבר"). Multi-day vacations show as **one** row. Empty state: centered hint.

### 7.4 Calendar  (`/calendar`)
1. Header H1 "הלוח שלי".
2. **Summary row (3 stat cards):** ימי לימוד · ימי חופש · עד הקיץ.
3. **Month card (glass, 28px):**
   - Row: prev/next chevrons (RTL) + center dual title — Gregorian "ספטמבר 2026" + Hebrew month "תשרי".
   - Weekday header: א ב ג ד ה ו ש.
   - **7-col grid**, cells are square, radius 16px. Cell background = translucent status color
     if the day has an event (blue/amber/purple by dominant status), else translucent white.
     Weekend days: greyed text. Today: theme-colored dot + bold. Selected: 2px theme ring.
   - **Legend** row (3 status dots + labels).
4. **Day detail card** (appears when a day is tapped): date title + "+ יום משלי" (for that date).
   - Lists that day's items. For a **personal day** → "מחיקה". For a **pre-defined holiday** →
     actions: **שינוי שם · שינוי תאריך · הסתרה · שחזור** (per-teacher overrides).

### 7.5 Profile  (`/profile`)
1. Header H1 "הפרופיל שלי" + name.
2. **Details card:** בית ספר · שלב חינוך · תאריך יעד (label right-aligned, value bold).
3. **Schedule card "לוח זמנים":** 5/6-day segmented + weekly-free-day chips (save instantly).
4. **Theme card "ערכת נושא":** 5 color swatches (36px circles); selected has a ring; applies instantly.
5. Note about upcoming edit features.
6. **Logout** button (ghost, centered).

---

## 8. What the numbers mean (so labels are accurate)

- **Hero "ימי לימוד נשארו"** = weekdays in the teacher's school-week (Sun–Thu, or Sun–Fri if 6-day),
  from today to the target date, **minus**: (a) school-closed days by sector, (b) the teacher's
  religion holidays when school is open, (c) the teacher's weekly free day, (d) personal days.
- **"ימים עד הסיום"** = raw calendar days to target.
- **"ימי חופשה שנותרו"** = remaining school-closed days.
- **Progress %** = share of the year's school-days already passed.

---

## 9. States to design (every screen)

- **Loading** (auth/data fetch): a calm glass skeleton (shimmer optional).
- **Not logged in** → redirect to Login.
- **Logged in, no profile** → redirect to Onboarding.
- **Empty:** no upcoming items → friendly hint; no search results → "לא נמצאו בתי ספר".
- **Saving:** buttons show "שומר…" / disabled.
- **Error:** inline, non-blocking message.

---

## 10. Motion & interaction

- Buttons/cells: press **scale 0.95**, ~120ms.
- Progress bar fill: width transition ~500ms ease.
- Modal: fade backdrop + slide-up sheet on mobile, fade-scale on desktop.
- Theme change: background + accents re-tint instantly.

---

## 11. Accessibility & RTL

- Contrast: text on glass must stay ≥ 4.5:1 — keep primary text dark slate.
- Tap targets ≥ 44px.
- Status is never conveyed by color alone — always paired with a text label.
- Full RTL mirroring; Hebrew numerals for weekdays (א׳–ש׳); dates in Hebrew locale.

---

## 12. Screen inventory (for Figma pages/frames)

1. Login
2. Onboarding – Step 1 (school search: empty / typing / results)
3. Onboarding – Step 2 (religions)
4. Onboarding – Step 3 (schedule + target)
5. Home (with data / empty upcoming)
6. Calendar (month / day-selected / holiday-edit actions)
7. Add personal day (modal)
8. Profile
9. Component sheet: buttons, inputs, chips, stat card, list row, nav, glass card, color tokens

---

## 13. Known constraints from the build

- 5 theme colors × the glass system are the current theming surface.
- Holiday/vacation accuracy depends on seeded data; the Jewish-sector calendar uses the official
  Ministry תשפ"ז dates, other sectors are best-effort (design can assume all three status colors appear).
