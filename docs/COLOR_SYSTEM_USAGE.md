# Color System Usage Guide

**Source of Truth**: `packages/shared/src/lib/colors.constants.ts`

This guide explains how to use the centralized color system across admin & front apps, starting with the sidebar refactoring.

---

## Quick Start

### Import Colors in Components

```typescript
import {
  COLORS,
  SEMANTIC_TOKENS_LIGHT,
  SEMANTIC_TOKENS_DARK,
  SIDEBAR_COLOR_SCHEMES,
  getSemanticColor,
  getSidebarColorScheme,
} from '@thaiakha/shared';
```

---

## 1️⃣ Using Colors in Tailwind Classes

For **most cases**, use Tailwind classes with color tokens:

```typescript
// ✅ Good: Use Tailwind class names
<div className="bg-cherry-500 text-white">
  Primary CTA Button
</div>

<div className="text-lime-700 hover:text-lime-600">
  Admin Action Text
</div>
```

Tailwind config automatically includes cherry, lime, orange, blue colors from the shared COLOR_SYSTEM.md.

---

## 2️⃣ Using Colors in JavaScript (Non-Tailwind)

When you need **hex values** (canvas, SVG, inline styles, external libraries):

```typescript
import { COLORS } from '@thaiakha/shared';

// Button styling via inline style
<button style={{ backgroundColor: COLORS.cherry[500], color: '#fff' }}>
  Book Now
</button>

// SVG fill
<rect fill={COLORS.lime[700]} />

// Chart library
<LineChart stroke={COLORS.blue[500]} />
```

---

## 3️⃣ Semantic Tokens (Recommended)

Use semantic tokens for **text, backgrounds, borders** to automatically support light/dark mode:

```typescript
import { SEMANTIC_TOKENS_LIGHT, SEMANTIC_TOKENS_DARK } from '@thaiakha/shared';

// In a dark-mode aware component
<div style={{
  backgroundColor: isDarkMode
    ? SEMANTIC_TOKENS_DARK.background
    : SEMANTIC_TOKENS_LIGHT.background,
  color: isDarkMode
    ? SEMANTIC_TOKENS_DARK.textBody
    : SEMANTIC_TOKENS_LIGHT.textBody,
}}>
  Smart Text
</div>

// Or use the helper function
import { getSemanticColor } from '@thaiakha/shared';

const bgColor = getSemanticColor('background', isDarkMode);
const textColor = getSemanticColor('textBody', isDarkMode);
```

---

## 4️⃣ Sidebar NavItem Colors

The sidebar uses **color schemes** to support different app branding:

### For Admin App (🔴 Cherry Red)

```typescript
import { SidebarNavItem } from '@thaiakha/shared';

<SidebarNavItem
  icon="Dashboard"
  label="Dashboard"
  isActive={true}
  onClick={handleClick}
  isOpen={true}
  isDarkMode={false}
  accentColor="brand"  // 🔴 RED (Admin)
/>
```

### For Front App (🟢 Lime Green)

```typescript
import { SidebarNavItem } from '@thaiakha/shared';

<SidebarNavItem
  icon="Home"
  label="Home"
  isActive={true}
  onClick={handleClick}
  isOpen={true}
  isDarkMode={false}
  accentColor="action"  // 🟢 GREEN (Front)
/>
```

### Sidebar Color Schemes

```typescript
import { SIDEBAR_COLOR_SCHEMES } from '@thaiakha/shared';

// Admin scheme (cherry red)
const adminColors = SIDEBAR_COLOR_SCHEMES.brand;
// {
//   activeBg: 'bg-cherry-50 dark:bg-cherry-500/[0.12]',
//   activeText: 'text-cherry-500 dark:text-cherry-400',
//   activeIcon: 'text-cherry-500 dark:text-cherry-400',
//   badgeBg: 'bg-cherry-500',
//   indicator: 'bg-cherry-500',
// }

// Front scheme (lime green)
const frontColors = SIDEBAR_COLOR_SCHEMES.action;
// {
//   activeBg: 'bg-lime-100 dark:bg-lime-500/[0.12]',
//   activeText: 'text-lime-700 dark:text-lime-400',
//   activeIcon: 'text-lime-700 dark:text-lime-400',
//   badgeBg: 'bg-lime-700',
//   indicator: 'bg-lime-700',
// }
```

---

## 5️⃣ Button Styling

Follow the CTA hierarchy from COLOR_SYSTEM.md:

```typescript
import { COLORS } from '@thaiakha/shared';

// 1️⃣ Primary CTA (Cherry in Front, Lime in Admin)
<button className="bg-cherry-500 hover:bg-cherry-600 text-white">
  Front: Book Now
</button>

<button className="bg-lime-500 hover:bg-lime-600 text-gray-900">
  Admin: Save Changes
</button>

// 2️⃣ Secondary CTA (Orange in Front)
<button className="bg-orange-500 hover:bg-orange-600 text-white">
  Front: Buy Now
</button>

// 3️⃣ Info/Navigation (Blue)
<button className="bg-blue-500 hover:bg-blue-600 text-white">
  More Info
</button>

// 4️⃣ Neutral/Secondary
<button className="bg-gray-200 hover:bg-gray-300 text-gray-900">
  Cancel
</button>
```

---

## 6️⃣ Adding Glow Shadows

Use predefined glow effects on interactive elements:

```typescript
import { GLOW_SHADOWS } from '@thaiakha/shared';

<button
  className="bg-cherry-500 text-white"
  style={{
    boxShadow: GLOW_SHADOWS.cherry,  // Soft glow
  }}
>
  Hover Me
</button>

<button
  className="bg-lime-500 text-gray-900"
  style={{
    boxShadow: GLOW_SHADOWS.lime,
  }}
>
  Admin Button
</button>

// Heavy glow on hover
<button
  onMouseEnter={(e) => e.target.style.boxShadow = GLOW_SHADOWS.cherryHeavy}
  onMouseLeave={(e) => e.target.style.boxShadow = GLOW_SHADOWS.cherry}
>
  Hover for Heavy Glow
</button>
```

---

## 7️⃣ Gradients

Use predefined gradients:

```typescript
import { GRADIENTS } from '@thaiakha/shared';

// Sunset gradient (Cherry + Orange)
<div style={{ background: GRADIENTS.sunset }}>
  Hero Section
</div>

// Night Blue gradient (Blue + Purple)
<div style={{ background: GRADIENTS.nightBlue }}>
  Background
</div>

// Quiz Chat gradient (Purple + Magenta)
<div style={{ background: GRADIENTS.quizChat }}>
  Chat UI
</div>
```

---

## 8️⃣ System UI Colors

Use system colors for **functional UI** (errors, warnings, success):

```typescript
import { COLORS } from '@thaiakha/shared';

// Error message
<div className="bg-red-100 text-red-700">
  {COLORS.system.error} Error occurred
</div>

// Success badge
<span className="bg-green-100 text-green-700">
  {COLORS.system.success} Saved
</span>

// Warning alert
<div className="bg-amber-100 text-amber-700">
  {COLORS.system.warning} Please review
</div>

// Info notification
<div className="bg-blue-100 text-blue-700">
  {COLORS.system.info} New update available
</div>
```

**Important**:
- Use `sys-warning` (#F59E0B - amber), NOT orange
- Orange is reserved for secondary CTA buttons only

---

## 🎯 Refactoring Workflow

When updating components to use the color system:

### Before (Hardcoded)
```typescript
<div className="text-[#E54063] bg-[#FBDDE4]">
  Active Menu Item
</div>
```

### After (Using COLORS)
```typescript
import { COLORS } from '@thaiakha/shared';

<div style={{
  color: COLORS.cherry[500],
  backgroundColor: COLORS.cherry[100],
}}>
  Active Menu Item
</div>
```

Or better, use Tailwind:
```typescript
<div className="text-cherry-500 bg-cherry-100">
  Active Menu Item
</div>
```

---

## 📋 Checklist for Components

When implementing a new component:

- [ ] Import needed colors from `@thaiakha/shared`
- [ ] Use Tailwind classes when possible (`bg-cherry-500`)
- [ ] Use semantic tokens for text (`text-body`, `text-title`)
- [ ] Use hex values only for non-Tailwind cases (canvas, SVG, libs)
- [ ] Follow CTA hierarchy (cherry > orange > lime > blue)
- [ ] Test in both light & dark mode
- [ ] Add glow shadows to interactive elements
- [ ] Verify WCAG contrast ratios (see COLOR_SYSTEM.md)

---

## 🔄 Sidebar Refactoring Progress

**Phase 1: Sidebar Menu ✅ IN PROGRESS**
- [x] Create `colors.constants.ts` in shared
- [x] Export from shared/index.ts
- [ ] Update admin AppSidebar to use `accentColor="brand"`
- [ ] Update front Sidebar to use `accentColor="action"`
- [ ] Update front SidebarMobile to use `accentColor="action"`
- [ ] Test desktop & mobile

**Phase 2: Other Components (Future)**
- [ ] Buttons (primary, secondary, info)
- [ ] Forms (inputs, labels, validation)
- [ ] Cards & Modals
- [ ] Badges & Tags
- [ ] Navigation (breadcrumbs, tabs)

---

## 📚 Reference

- **Color System Spec**: `docs/COLOR_SYSTEM.md`
- **Color Constants**: `packages/shared/src/lib/colors.constants.ts`
- **Sidebar Component**: `packages/shared/src/components/sidebar/NavItem.tsx`

---

**Last Updated**: March 15, 2026
**Maintained by**: Design System Team
