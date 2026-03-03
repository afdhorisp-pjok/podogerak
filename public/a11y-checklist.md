# PodoGerak Accessibility (a11y) Checklist

## Touch Target Compliance (WCAG 2.1 AA)
- All interactive elements: min 44×44px
- SLB mode buttons: min 64px height
- Spacing between targets: min 8px

## Keyboard / Tab Order
### Login Screen
1. SLB Toggle
2. Email input
3. Password input
4. Submit button
5. Mode switch links (Login/Register/Forgot)

### Dashboard
1. SLB Toggle (header)
2. Notification Bell
3. Logout button
4. Start Session button
5. Quick Action buttons (Panduan, Edukasi, Penilaian, Laporan, Riwayat, Aksesibilitas)
6. Research Mode toggle

### Session Runner
1. Close (X) button
2. Music toggle
3. Sound toggle
4. Main action button (Mulai / Lanjut / Selesai)
5. SLB Controls: Lanjut, Selesai, Guru Override
6. Pictogram step cards

### Accessibility Settings
1. Back button
2. Text size slider
3. Speech rate slider
4. High contrast switch
5. Reduce motion switch
6. Narration switch
7. Reset button

## ARIA Attributes Used
- `role="progressbar"` with `aria-valuenow` on Progress component
- `role="list"` and `role="listitem"` on PictogramSteps
- `aria-current="step"` on active pictogram card
- `aria-label` on all icon-only buttons
- `aria-live="polite"` on exercise instructions and status messages
- `aria-live="assertive"` on countdown timer

## Focus Management
- Focus trapped within session runner (full-screen overlay)
- Focus trapped within modals (Dialog component)
- Visible focus ring: 3px outline in SLB mode
- Skip-to-content considerations: main content landmark

## Screen Reader Notes
- Exercise name and instructions announced via `aria-live`
- Phase transitions announced (countdown, exercise start, complete)
- Progress updates announced via progressbar role
- Notification count announced on bell icon

## High Contrast Mode
- Background: pure white / dark: pure black
- Text: pure black / dark: pure white
- Borders: 2px solid
- Primary buttons: high-saturation with thick border

## Reduce Motion
- All CSS animations disabled
- All CSS transitions disabled
- Countdown visual effect simplified
