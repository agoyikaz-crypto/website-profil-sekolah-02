---
name: Academic Heritage
colors:
  surface: '#fafaf2'
  surface-dim: '#dadad3'
  surface-bright: '#fafaf2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4ec'
  surface-container: '#eeeee6'
  surface-container-high: '#e8e9e1'
  surface-container-highest: '#e3e3db'
  on-surface: '#1a1c18'
  on-surface-variant: '#43483d'
  inverse-surface: '#2f312c'
  inverse-on-surface: '#f1f1e9'
  outline: '#74796c'
  outline-variant: '#c4c8ba'
  surface-tint: '#486730'
  primary: '#486730'
  on-primary: '#ffffff'
  primary-container: '#87a96b'
  on-primary-container: '#213d0b'
  inverse-primary: '#aed18f'
  secondary: '#695d46'
  on-secondary: '#ffffff'
  secondary-container: '#efdec1'
  on-secondary-container: '#6d614a'
  tertiary: '#4d6453'
  on-tertiary: '#ffffff'
  tertiary-container: '#8da592'
  on-tertiary-container: '#263b2c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9eea9'
  primary-fixed-dim: '#aed18f'
  on-primary-fixed: '#0b2000'
  on-primary-fixed-variant: '#314e1b'
  secondary-fixed: '#f1e0c3'
  secondary-fixed-dim: '#d5c5a9'
  on-secondary-fixed: '#231a08'
  on-secondary-fixed-variant: '#504530'
  tertiary-fixed: '#d0e9d4'
  tertiary-fixed-dim: '#b4cdb8'
  on-tertiary-fixed: '#0b2013'
  on-tertiary-fixed-variant: '#364c3c'
  background: '#fafaf2'
  on-background: '#1a1c18'
  surface-variant: '#e3e3db'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max-width: 1440px
  columns: '12'
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
  unit: 8px
---

## Brand & Style

The design system is crafted to evoke a sense of academic prestige and serene authority. It balances the traditional values of an educational institution with the modern efficiency of a high-end administrative suite. The aesthetic is rooted in **Organic Minimalism**, utilizing a natural, earthy palette to reduce "dashboard fatigue" and promote a calm, focused working environment.

The target audience—administrators and educators—requires a platform that feels stable and professional. The visual language avoids loud, jarring colors in favor of soft tonal transitions and generous whitespace. The result is a UI that feels less like a complex software tool and more like a curated digital workspace.

## Colors

The palette is built upon a foundation of warmth and growth. 

- **Primary Background:** We utilize *Akaroa Beige* (#D4C4A8) not just as an accent, but as the primary canvas. This reduces the harshness of pure white and establishes a premium, "paper-like" feel.
- **Accents:** *Sage Green* (#87A96B) serves as the primary action color, chosen for its association with growth and balance.
- **Typography:** All primary communication uses *Dark Green* (#1B3022), providing high contrast without the clinical coldness of pure black or grey.

Secondary surfaces should use lighter tints of the primary beige to create a "layered paper" effect rather than using traditional grey scales.

## Typography

This design system employs a classic typographic pairing to establish hierarchy. 

**Playfair Display** is reserved for high-level headings, page titles, and modal headers. Its high-contrast strokes reflect a sophisticated, editorial quality.

**Inter** is the workhorse for all functional elements. Its neutral, highly legible geometric forms ensure that data-heavy tables and administrative forms remain clear and accessible. When using Inter for labels, a slightly tighter letter-spacing and medium weight are preferred to distinguish them from body copy.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for the desktop dashboard to maintain a sense of structured elegance. Content is centered within a 1440px container, ensuring that lines of text do not become excessively long on ultra-wide monitors.

A 12-column grid is used for card-based dashboards. We employ an 8px spacing system, where all margins and paddings are multiples of 8. 

**Reflow Rules:**
- **Desktop:** 12 columns, 48px margins. Cards usually span 3, 4, or 6 columns.
- **Tablet:** 6 columns, 32px margins. Horizontal scrolling is permitted for data tables.
- **Mobile:** 2 columns, 16px margins. All cards stack vertically to 100% width.

## Elevation & Depth

To maintain a minimalist aesthetic, depth is created through **Ambient Shadows** and **Tonal Layers** rather than heavy borders.

1.  **Level 0 (Base):** The Soft Akaroa beige (#D4C4A8) background.
2.  **Level 1 (Cards):** Surface-bright (#F4EFE6) cards with a soft, diffuse shadow: `0px 10px 30px rgba(27, 48, 34, 0.05)`. This creates a subtle lift that feels natural.
3.  **Level 2 (Active/Modals):** Elements that require immediate attention use a more pronounced shadow: `0px 20px 50px rgba(27, 48, 34, 0.08)`.

Transitions between elevations should be smooth, utilizing a 300ms ease-in-out duration to reinforce the premium feel.

## Shapes

The shape language is characterized by **large, friendly rounded corners**. This softness counteracts the formal nature of the typography, making the dashboard feel approachable.

- **Main Cards:** Use a 16px radius.
- **Secondary UI Elements:** Buttons and Input fields use a 12px radius.
- **Icon Containers:** Often utilize a "squircle" or a 12px radius to match the UI elements.
- **Selections:** Highlighting in navigation or lists should use the same 12px roundedness to maintain consistency.

## Components

### Buttons
Primary buttons use a solid **Sage Green** (#87A96B) fill with **Dark Green** (#1B3022) or White text. They feature a 12px border radius and a subtle hover lift. Secondary buttons use a transparent background with a thin Dark Green border.

### Cards
Cards are the fundamental building blocks. They must always have the **Surface-Bright** (#F4EFE6) background and the defined 16px rounded corners. Header sections within cards should be separated by a soft, low-contrast divider (10% Dark Green).

### Input Fields
Inputs are styled with a light beige fill and a 1px border that darkens on focus. The label should always use the **Label-SM** typography style, positioned above the field for maximum legibility.

### Dashboard Stats
Key metrics should use the **Display-MD** serif typography for the value and **Label-LG** sans-serif for the description, emphasizing the importance of the data.

### Additional Elements
- **Navigation Sidebar:** Uses a vertical layout with plenty of breathing room (24px padding between items).
- **Status Chips:** Small, pill-shaped indicators for "Active," "Pending," or "Overdue" using muted semantic colors.