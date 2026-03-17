# Mobile Scroll Fix Implementation Plan

The goal is to allow the mobile Chrome browser to collapse its address and navigation bars during scrolling, which is currently blocked by the "internal scroll" layout in [App.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/App.tsx).

## Proposed Changes

### [front] (packages/front)

#### [MODIFY] [App.tsx](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/App.tsx)
- Change the root container from a fixed height `h-[calc(...)]` with `overflow-hidden` to a more flexible model on mobile.
- Use `min-h-dvh` (Dynamic Viewport Height) to ensure the background covers the entire screen as browser bars move.
- Remove `overflow-hidden` from the wrapper on mobile to allow root-level scrolling.
- Remove `h-full` and `overflow-y-auto` from the `<main>` tag on mobile so the scroll bubbles up to the window.

#### [MODIFY] [index.css](file:///Users/svevomondino/Desktop/thaiakha-cherry-2026/packages/front/src/styles/index.css)
- Remove `overscroll-behavior-y: none;` from the `body` as it can sometimes interfere with native scroll-to-refresh or browser bar behaviors on certain Android devices.
- Ensure `html` and `body` have `min-height: 100%`.

## Verification Plan

### Manual Verification
- Since I cannot test on a physical mobile device, I will verify the CSS logic:
  - Check that on mobile breakpoints, the outer container no longer has `overflow: hidden`.
  - Check that the `main` element no longer has a fixed height and `overflow: auto` on mobile.
- **Action for User**: I will ask the user to test the "live" version once deployed or locally in Chrome DevTools using mobile emulation.
