---
name: Organic Minimalism
colors:
  surface: '#efffd9'
  surface-dim: '#cfe0b8'
  surface-bright: '#efffd9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e8fad1'
  surface-container: '#e2f4cb'
  surface-container-high: '#ddeec6'
  surface-container-highest: '#d7e9c0'
  on-surface: '#121f06'
  on-surface-variant: '#44483d'
  inverse-surface: '#273419'
  inverse-on-surface: '#e5f7ce'
  outline: '#74796c'
  outline-variant: '#c4c8b9'
  surface-tint: '#4a672b'
  primary: '#375219'
  on-primary: '#ffffff'
  primary-container: '#4e6b2f'
  on-primary-container: '#c8eaa0'
  inverse-primary: '#afd189'
  secondary: '#546527'
  on-secondary: '#ffffff'
  secondary-container: '#d4e89c'
  on-secondary-container: '#58692b'
  tertiary: '#4b4e19'
  on-tertiary: '#ffffff'
  tertiary-container: '#63662e'
  on-tertiary-container: '#e1e49f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cbeea3'
  primary-fixed-dim: '#afd189'
  on-primary-fixed: '#0f2000'
  on-primary-fixed-variant: '#334e15'
  secondary-fixed: '#d7eb9f'
  secondary-fixed-dim: '#bbcf85'
  on-secondary-fixed: '#161f00'
  on-secondary-fixed-variant: '#3d4c11'
  tertiary-fixed: '#e4e7a2'
  tertiary-fixed-dim: '#c8cb88'
  on-tertiary-fixed: '#1b1d00'
  on-tertiary-fixed-variant: '#474a15'
  background: '#efffd9'
  on-background: '#121f06'
  surface-variant: '#d7e9c0'
  surface-cream: '#D9DFB0'
  canvas-white: '#FBFAF9'
  success-green: '#34C759'
  action-blue: '#3784F4'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 40px
---

## Brand & Style

This design system is built on the philosophy of **Organic Minimalism**. It prioritizes the vibrancy of fresh ingredients and food photography by surrounding them with high-quality typography and generous whitespace. The brand personality is dependable yet warm, moving away from the coldness of traditional SaaS and toward a tactile, "farm-to-table" digital experience.

The visual language draws inspiration from the modern editorial aesthetic: high-contrast text, intentional breathing room, and a sophisticated, earth-toned palette. It targets health-conscious families and home cooks who value clarity and a stress-free planning experience.

## Colors

The palette is derived from natural, botanical tones. 
- **Primary Olive (#4E6B2F)** is used for high-level branding, primary actions, and active states.
- **Dark Olive (#2C3A1E)** serves as the primary text color and the foundation for dark-mode backgrounds, providing better readability than pure black.
- **Cream Green (#D9DFB0)** is the essential "Surface" color, used for cards and containers to create a soft, paper-like feel that avoids the harshness of pure white.
- **Canvas White (#FBFAF9)** acts as the global background to maintain the "clean" aesthetic requested.

## Typography

This design system utilizes a pairing of **Plus Jakarta Sans** for headlines and **Inter** for functional text. 

Plus Jakarta Sans provides a friendly, slightly rounded geometric feel that aligns with the "organic" brand pillars. Inter is used for body copy and labels to ensure maximum legibility at smaller sizes, particularly in ingredient lists and grocery checklists. 

High-level headings should use tighter letter spacing and bold weights to establish a strong visual anchor. Body copy maintains a generous line height (1.5x or higher) to support the "airy" feel of the interface.

## Layout & Spacing

The layout follows a **fluid grid** model with a focus on "generous whitespace." 

- **Desktop:** A 12-column grid with 24px gutters. Content is centered with a max-width of 1280px.
- **Tablet:** An 8-column grid with 24px gutters.
- **Mobile:** A 4-column grid with 20px side margins.

Spacing follows an 8px linear scale. Large-format sections (like Recipe Detail headers) should use expanded vertical padding (80px–120px) to lean into the minimalist editorial style. Avoid cluttering the screen; every element must have room to breathe.

## Elevation & Depth

Depth is achieved through **Tonal Layering** combined with **Ambient Shadows**. Instead of traditional gray shadows, we use a very low-opacity tint of the Primary Olive or Dark Olive to maintain the organic feel.

1.  **Level 0 (Background):** Canvas White (#FBFAF9).
2.  **Level 1 (Cards/Surface):** Cream Green (#D9DFB0) or White with a 1px Light Sage (#A6A96A) border.
3.  **Level 2 (Interaction):** Soft, diffused shadows (Blur: 20px, Y: 8px, Opacity: 4% of #2C3A1E). Used for active meal cards or floating action buttons.

Avoid heavy blacks or harsh gradients. Use backdrop blurs (Glassmorphism) sparingly for overlays to maintain focus on the underlying food imagery.

## Shapes

The design system uses a **Rounded** shape language to evoke softness and approachability. 

While the base unit is `0.5rem` (rounded), most card containers and interactive "Meal Blocks" should utilize `rounded-2xl` (1rem) or `rounded-3xl` (1.5rem) to achieve the specific soft look requested. This extreme roundedness helps food photography feel integrated and "huggable" within the UI. Buttons should always use the pill-shaped (full rounded) treatment to distinguish them clearly from card elements.

## Components

### Buttons
- **Primary:** Filled with Olive Green (#4E6B2F), White text, Pill-shaped.
- **Secondary:** Outlined with Medium Sage (#7A8C4A), Pill-shaped.
- **Ghost:** Dark Olive text, no background, used for low-priority actions.

### Cards (Meal Plan / Recipes)
Cards are the core of the app. Use `rounded-3xl` corners. The image should occupy the top 60% of the card or be used as a full-bleed background with a text scrim. Use the Surface/Card color (#D9DFB0) for the content area to separate it from the main canvas.

### Input Fields
Inputs use a subtle Light Sage (#A6A96A) border and a white background. On focus, the border thickens and changes to Primary Olive. Labels are always positioned above the field using `label-md`.

### Chips & Tags
Used for dietary restrictions (e.g., "Vegan," "Gluten-Free"). These use the Tertiary Light Sage (#A6A96A) background with Dark Olive text. Corners are fully rounded (pill).

### Checkboxes & Radio Buttons
When checked, these fill with Primary Olive. They should be slightly larger than standard (20px) to ensure they are easy to tap in a kitchen environment.

### Progress Indicators
For "Weekly Progress," use a thick, rounded bar with a Cream Green track and an Olive Green indicator.