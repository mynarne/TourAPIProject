---
name: Heritage Pulse
colors:
  surface: '#f7f9ff'
  surface-dim: '#d1dbe8'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4ff'
  surface-container: '#e4effd'
  surface-container-high: '#dfe9f7'
  surface-container-highest: '#d9e3f1'
  on-surface: '#121d26'
  on-surface-variant: '#43474d'
  inverse-surface: '#27313c'
  inverse-on-surface: '#e8f2ff'
  outline: '#73777e'
  outline-variant: '#c3c7ce'
  surface-tint: '#46617d'
  primary: '#001b31'
  on-primary: '#ffffff'
  primary-container: '#12304a'
  on-primary-container: '#7d98b7'
  inverse-primary: '#adc9ea'
  secondary: '#8d4e26'
  on-secondary: '#ffffff'
  secondary-container: '#feab7b'
  on-secondary-container: '#783d17'
  tertiary: '#1b1a15'
  on-tertiary: '#ffffff'
  tertiary-container: '#302e29'
  on-tertiary-container: '#99958e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cfe5ff'
  primary-fixed-dim: '#adc9ea'
  on-primary-fixed: '#001d34'
  on-primary-fixed-variant: '#2d4964'
  secondary-fixed: '#ffdbc9'
  secondary-fixed-dim: '#ffb68d'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#703711'
  tertiary-fixed: '#e7e2da'
  tertiary-fixed-dim: '#cac6be'
  on-tertiary-fixed: '#1d1c17'
  on-tertiary-fixed-variant: '#494741'
  background: '#f7f9ff'
  on-background: '#121d26'
  surface-variant: '#d9e3f1'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  section-gap: 40px
---

## Brand & Style

The design system is built around the identity of a "Suwon Local Guide"—balancing the historic weight of the Hwaseong Fortress with the vibrancy of a modern urban destination. The aesthetic is a fusion of **Corporate Modern** reliability and **Minimalist** clarity, ensuring that navigating a foreign city feels intuitive and calm.

The visual narrative draws inspiration from the tactile quality of traditional Korean paper (Hanji) and the structural integrity of stone masonry. The experience should evoke a sense of "quiet confidence," providing travelers with high-utility information without visual clutter. The interface prioritizes mobile-first interactions, using generous whitespace and high-quality photography to bridge the gap between digital guidance and physical exploration.

## Colors

The palette is rooted in the physical environment of Suwon. 

- **Primary (Deep Suwon Navy):** Used for navigation bars, primary actions, and branding elements to establish authority and trust.
- **Secondary (Haenggung Sunset Orange):** Reserved for highlights, active states, "Save" icons, and points of interest that require the user’s immediate attention.
- **Background (Warm Stone Beige):** This serves as the canvas for the entire application, reducing eye strain during outdoor use and providing a sophisticated, organic feel.
- **Surface (Clean White):** Used for interactive cards, modals, and input fields to create a clear "layer" above the background.
- **Typography:** Charcoal Black (#1F2933) is used for maximum legibility in body text, while Muted Gray (#6B7280) handles metadata and secondary labels.

## Typography

This design system utilizes **Plus Jakarta Sans** for display and headings to provide a friendly, modern, and welcoming character. For the core functional text, it relies on **Noto Sans**, ensuring seamless multilingual support across Korean, Japanese, and Chinese characters without losing vertical alignment or legibility.

- **Headlines:** Use Plus Jakarta Sans with tighter letter spacing for a punchy, editorial look.
- **Body Text:** Noto Sans is configured with a generous line-height to assist with readability while walking.
- **Multilingual Handling:** For non-Latin scripts, ensure the font-weight is optically balanced (e.g., Noto Sans KR Medium often pairs better with Latin Semi-Bold).

## Layout & Spacing

The design system follows a **fluid grid** model optimized for mobile devices. On mobile (under 600px), use a single-column layout with 20px side margins to ensure thumbs can easily reach content. For tablet and desktop, the layout transitions to a 12-column grid with a maximum content width of 1140px.

Spacing is based on an 8px modular scale. Component internal padding should favor the larger side of the scale to maintain a "breathable" and premium travel-app feel. Vertical stacks use 16px (md) for related items and 24px (lg) for distinct sections.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Ambient Shadows**. Instead of harsh blacks, shadows use a tinted navy base (#12304A) at very low opacity (8-12%) to keep the UI feeling integrated with the brand colors.

- **Level 0 (Base):** Warm Stone Beige background.
- **Level 1 (Cards/Surface):** Clean White surface with a 4px blur, 2px Y-offset shadow.
- **Level 2 (Active/Floating):** Clean White surface with a 12px blur, 6px Y-offset shadow (used for floating action buttons and navigation bars).
- **Interactive Elements:** Use a subtle 1px inner stroke in a light gray (#E5E7EB) on cards to define boundaries against the beige background without relying solely on shadows.

## Shapes

The shape language is "Soft-Modern." It avoids the clinical feel of sharp corners while steering clear of overly bubbly, "toy-like" roundness.

- **Primary Containers:** Cards and major panels use an 18px radius (`rounded-xl` in this system).
- **Interactive Components:** Buttons and input fields use a 14px radius to feel ergonomic for finger taps.
- **Small Elements:** Chips, tags, and small badges use a 8px radius or full pill-shape depending on the density of the information.

## Components

### Buttons
- **Primary:** Deep Suwon Navy background, White text. High-contrast, 14px rounded corners.
- **Secondary:** Transparent background, Deep Suwon Navy border (1.5px), Navy text.
- **Tertiary/Ghost:** Sunset Orange text, no background. Used for "See more" or "View Map" links.

### Cards (Travel Stills)
- Content should be housed in 18px rounded white cards.
- Images should have a 16px top-radius, leaving a 2px "frame" of white at the bottom for titles and meta-data.

### Inputs & Search
- Search bars are the most prominent tool. Use a 14px radius, White background, and a subtle icon in Deep Suwon Navy. 
- Use "Warm Stone Beige" as a focus-state border color to indicate the field is active.

### Chips & Tags
- Used for categories (e.g., "Temple," "Cafe," "Accessible"). 
- Use a light tint of Sunset Orange (#FDF2EB) with Sunset Orange text for high-visibility categories.

### Bottom Navigation
- Fixed at the bottom for mobile. Uses a heavy blur (Glassmorphism effect) over the Warm Stone Beige to show content passing underneath.
- Active state indicated by Sunset Orange icons.

### Icons
- Use **Linear icons** (2px stroke weight). Avoid filled icons unless it is the "Active" state of the bottom navigation.