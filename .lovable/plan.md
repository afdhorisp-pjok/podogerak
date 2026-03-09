

# Fix Consent Modal Scroll Detection

## Root Cause

The `ScrollArea` component (Radix `ScrollAreaPrimitive.Root`) wraps content in an internal `Viewport` element that actually scrolls. The `onScrollCapture` handler is attached to the Root, but `e.currentTarget` points to the Root (which doesn't scroll), so `scrollHeight - scrollTop - clientHeight` never changes -- the button stays permanently disabled.

## Fix

1. **Replace `ScrollArea` with a plain `div` using `overflow-y-auto`** -- this makes the scroll target and event target the same element, so scroll detection works reliably.

2. **Add a 5-second fallback timer** -- if scroll detection fails (e.g. content fits without scrolling), auto-enable the button after 5 seconds.

3. **Add `useEffect` to check if content fits without scrolling** -- if `scrollHeight <= clientHeight`, enable immediately (no scroll needed).

4. **Add console logging** for scroll position, button clicks, and consent save confirmation.

5. **Visual button states** -- disabled button gets explicit `opacity-50 cursor-not-allowed` styling; enabled gets full color.

## Files Changed

| File | Change |
|------|--------|
| `src/components/ParentConsentModal.tsx` | Replace ScrollArea with native scrollable div, add fallback timer, add console logs, fix event handlers |

No database or other file changes needed.

