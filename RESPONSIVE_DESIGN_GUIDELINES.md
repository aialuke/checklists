# Mobile Responsive Design Guidelines

## Overview
This document outlines the mobile-first responsive design patterns implemented in the JB Checklists application.

## Key Technologies

### 1. Container Queries (@tailwindcss/container-queries)
- **Version**: 0.1.1
- **Purpose**: Enable component-level responsive design based on parent container width
- **Browser Support**: Chrome 105+, Firefox 110+, Safari 16+

### 2. Fluid Typography
Custom clamp-based font sizes that scale smoothly between breakpoints:
```css
fluid-sm: clamp(0.875rem, 2.5vw, 1rem)
fluid-base: clamp(1rem, 3vw, 1.125rem)
fluid-lg: clamp(1.125rem, 3.5vw, 1.25rem)
fluid-xl: clamp(1.25rem, 4vw, 1.5rem)
fluid-2xl: clamp(1.5rem, 5vw, 2.25rem)
fluid-3xl: clamp(1.875rem, 6vw, 3rem)
```

## Responsive Patterns

### 1. Container-Aware Components

#### Button Component
```tsx
// Size-based responsive text scaling
'text-sm @md:text-base @lg:text-lg': size === 'sm'
'text-base @md:text-lg @lg:text-xl': size === 'md'
'text-lg @md:text-xl @lg:text-2xl': size === 'lg'
```

#### Card Component
```tsx
// Container-responsive title
'text-base @sm:text-lg @md:text-xl'
```

### 2. Mobile-First Text Scaling

#### Page Headers
All page headers use responsive scaling:
```tsx
'text-xl md:text-2xl lg:text-3xl'
```

#### Form Labels
Enhanced readability on mobile:
```tsx
'text-sm md:text-base'
```

### 3. Grid Layouts

#### Container-Based Grids
```tsx
'@container grid grid-cols-1 gap-6 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4'
```

## Critical Safelist Classes

The following dynamic classes must be maintained in `tailwind.config.ts` safelist:
- Status badges: `bg-green-100`, `text-green-800`, `bg-yellow-100`, `text-yellow-800`, `bg-gray-100`, `text-gray-800`
- Task states: `border-green-200`, `bg-green-50`, `bg-gray-200`, `text-gray-400`
- Text modifiers: `text-gray-500`, `line-through`, `text-gray-900`, `text-white`
- Container queries: `@sm:grid-cols-2`, `@md:grid-cols-3`, `@lg:grid-cols-4`, `@sm:text-lg`, `@md:text-xl`, `@lg:text-2xl`

## Implementation Checklist

When adding new components:

1. **Use Container Queries** for component-level responsiveness
2. **Apply Mobile-First** text sizing (start small, scale up)
3. **Maintain Touch Targets** of minimum 44px height
4. **Test Container Contexts** (sidebars, modals, cards)
5. **Add Dynamic Classes** to safelist if using template literals
6. **Verify PWA Compatibility** with service worker caching

## Testing Requirements

1. **Device Testing**
   - Mobile: 320px - 768px
   - Tablet: 768px - 1024px
   - Desktop: 1024px+

2. **Container Testing**
   - Test components in various parent container widths
   - Verify text remains readable at all sizes
   - Ensure touch targets meet accessibility standards

3. **Build Verification**
   - Run `npm run build` to verify CSS purging doesn't remove dynamic classes
   - Check bundle size with `ANALYZE=true npm run build`
   - Test PWA functionality in production build

## Browser Compatibility

- Container Queries require:
  - Chrome/Edge 105+
  - Firefox 110+
  - Safari 16+
- Fallback to viewport queries for older browsers
- All modern mobile browsers fully supported