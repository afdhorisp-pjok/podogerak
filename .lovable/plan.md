

# Improve Consent Modal Accessibility & Interaction Stability

## Changes (1 file)

### `src/components/ParentConsentModal.tsx`

1. **Focus trap**: Already provided by Radix Dialog. Strengthen by adding `onEscapeKeyDown={(e) => e.preventDefault()}` and `onInteractOutside={(e) => e.preventDefault()}` to block all dismiss paths until consent is granted. Remove the close (X) button by adding `DialogContent` without the default close button — achieved by hiding it via a `[&>button]:hidden` class on DialogContent.

2. **Keyboard accessibility**: Add `aria-describedby` pointing to a `DialogDescription` (required by Radix for screen readers). Add `role="document"` on the scroll container with `tabIndex={0}` so keyboard users can scroll it.

3. **Loading state on agree button**: Already has `isSubmitting` state and shows "Menyimpan..." text. Add a spinner icon (`Loader2` from lucide with `animate-spin`) during submission and explicitly `disabled={!canAgree || isSubmitting}` (redundant but clear). Prevent double-click by checking `isSubmitting` at the top of `handleSubmit`.

4. **Visual disabled/enabled states**: Already has opacity toggle. Add `aria-disabled` attribute for screen readers.

### Specific changes:
- Import `Loader2` from lucide-react and `DialogDescription` from dialog
- Add `onEscapeKeyDown` prevention on `DialogContent`
- Add `[&>button]:hidden` to hide default close X
- Add `DialogDescription` with consent summary for a11y
- Add `tabIndex={0}` and `role="document"` on scroll container
- Guard `handleSubmit` with early return if `isSubmitting`
- Add `Loader2` spinner when submitting
- Add `aria-disabled` to agree button

No other files or database changes needed.

