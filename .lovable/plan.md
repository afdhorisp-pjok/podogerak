

# SLB Accessibility Mode

## Overview

Add a dedicated "Mode SLB" (Siswa Luar Biasa / Special Needs Student) to the app. When enabled, the entire UI adapts for users with motor, cognitive, or sensory challenges: larger touch targets, high-contrast colors, simplified text, audio narration, pictogram-based exercise steps, and alternate input controls.

All changes are additive -- existing components are wrapped with conditional styling via a React context, not rewritten.

---

## Architecture

### SLB Context Provider

Create `src/contexts/SLBContext.tsx` -- a React context holding all accessibility preferences:

- `slbEnabled` (boolean) -- master toggle
- `textScale` (number, 1.0-2.0) -- font size multiplier
- `speechRate` (number, 0.5-2.0) -- TTS speech rate
- `highContrast` (boolean) -- high-contrast theme
- `reduceMotion` (boolean) -- disable animations
- `narrationEnabled` (boolean) -- auto-play audio narration

All preferences persisted in `localStorage` under key `podogerak_slb_settings`.

The provider wraps the app in `App.tsx` and applies a CSS class `slb-mode` to `<body>` when enabled (plus `slb-high-contrast` and `slb-reduce-motion` as needed).

---

## CSS Layer: SLB Overrides

Add a dedicated section in `src/index.css`:

- `.slb-mode` class on body applies:
  - `font-size` scaled by the `textScale` value (via CSS custom property `--slb-text-scale`)
  - Single-column layout: max-width constrained, grid columns forced to 1
  - All buttons get `min-height: 44px; min-width: 44px`
  - Focus indicators made thicker and more visible (3px outline)
- `.slb-high-contrast` applies:
  - Background: pure white (`#fff`) / dark mode: pure black (`#000`)
  - Text: pure black / white
  - Borders: solid 2px black/white
  - Primary buttons: high-saturation orange with thick border
- `.slb-reduce-motion` applies:
  - `animation: none !important; transition: none !important` via `prefers-reduced-motion` override

---

## New Files

### 1. `src/contexts/SLBContext.tsx`
React context + provider with all SLB settings, localStorage persistence, and body class management.

### 2. `src/components/SLBToggle.tsx`
A simple toggle button/switch labeled "Mode: SLB" with an accessibility icon. Used on LoginForm and Dashboard header.

### 3. `src/components/AccessibilitySettings.tsx`
Full settings page with:
- Text size slider (1x to 2x, using Radix Slider)
- Speech rate slider (0.5x to 2x)
- High contrast toggle (Switch)
- Reduce motion toggle (Switch)
- Narration auto-play toggle (Switch)
- Preview area showing sample text at current scale
- "Reset ke Default" button

### 4. `src/components/PictogramSteps.tsx`
For each exercise during a session, display a horizontal scrollable row of pictogram cards showing the exercise steps. Each card has:
- A large emoji/icon (the exercise illustration)
- A short 1-2 word label
- Current step highlighted with a colored border
- Cards are min 80px wide for easy touch

Data derived from the exercise's `child_instruction` split into simple steps.

### 5. `src/lib/NarrationService.ts`
Uses the browser's built-in `SpeechSynthesis` API (no external API needed):
- `speak(text, rate)` -- queues text for narration
- `stop()` -- cancels current speech
- `isSpeaking()` -- check status
- Respects `narrationEnabled` and `speechRate` from SLB context
- Auto-narrates: exercise name, child instruction, countdown numbers, completion messages

### 6. `src/components/SLBSessionControls.tsx`
Alternate input controls shown during SessionRunner when SLB mode is active:
- Two large buttons at the bottom: "Lanjut" (Next/OK) and "Selesai" (Done) -- min 64px height, full-width stacked
- A "Guru Override" (Teacher Override) button -- distinct color (secondary), allows teacher to skip/complete exercise
- Replaces the default Pause/Skip controls in SLB mode

### 7. `public/a11y-checklist.md`
Markdown file documenting:
- Keyboard/tab order for each screen
- ARIA attributes used (`role`, `aria-label`, `aria-live`, `aria-current`)
- Focus management strategy
- Screen reader compatibility notes
- Touch target compliance (WCAG 2.1 AA: 44x44px minimum)

---

## Modifications to Existing Files

### `src/App.tsx`
Wrap the app with `<SLBProvider>` around the existing tree.

### `src/index.css`
Add the `.slb-mode`, `.slb-high-contrast`, `.slb-reduce-motion` CSS classes at the end of the file.

### `src/components/LoginForm.tsx`
Add `<SLBToggle />` in the header area (below the PodoGerak logo). When SLB mode is active, form inputs and buttons get larger sizing automatically via CSS.

### `src/components/Dashboard.tsx`
- Add `<SLBToggle />` next to the notification bell in the header
- Add "Aksesibilitas" button in the quick actions grid, opening `<AccessibilitySettings />`
- When SLB mode is on, the quick actions grid becomes single-column with larger buttons
- Button labels simplified to single verbs: "Panduan", "Edukasi", "Nilai", "Laporan", "Riwayat" (mostly already short)

### `src/components/SessionRunner.tsx`
- Import and use `useSLB()` context
- When SLB is enabled:
  - Show `<PictogramSteps>` component with current exercise steps
  - Show `<SLBSessionControls>` instead of default Pause/Skip buttons
  - Auto-narrate exercise name and child instruction via `NarrationService`
  - Narrate countdown numbers ("3... 2... 1... Mulai!")
  - Narrate completion messages
- All text uses `aria-live="polite"` for screen reader announcements

---

## Audio Narration Flow

Uses browser-native `window.speechSynthesis` (Web Speech API) -- no API key required, works offline:

1. **Parent Prep phase**: Narrate exercise name + parent instruction
2. **Countdown phase**: Narrate "3... 2... 1... Mulai!"
3. **Exercise phase**: Narrate child instruction
4. **Exercise Complete**: Narrate "Bagus! Gerakan selesai"
5. **Session Complete**: Narrate "Sesi selesai! Hebat sekali!"

Mute button already exists in SessionRunner header -- it will also control narration when SLB is active.

---

## ARIA and Keyboard Accessibility

- All interactive elements have `aria-label` attributes
- Exercise timer uses `aria-live="assertive"` for countdown
- Progress indicators use `role="progressbar"` with `aria-valuenow`
- Tab order follows visual layout (top-to-bottom, left-to-right)
- Focus trapped within modals/session screens
- Skip-to-content link at top of page when SLB is active
- All buttons have visible focus indicators (3px ring)

---

## Implementation Order

1. Create `SLBContext.tsx` + provider
2. Create `NarrationService.ts`
3. Add SLB CSS overrides to `index.css`
4. Create `SLBToggle.tsx`
5. Create `AccessibilitySettings.tsx`
6. Create `PictogramSteps.tsx`
7. Create `SLBSessionControls.tsx`
8. Update `App.tsx` (wrap with SLBProvider)
9. Update `LoginForm.tsx` (add SLB toggle)
10. Update `Dashboard.tsx` (add toggle + accessibility button)
11. Update `SessionRunner.tsx` (narration + pictograms + alternate controls)
12. Create `public/a11y-checklist.md`

