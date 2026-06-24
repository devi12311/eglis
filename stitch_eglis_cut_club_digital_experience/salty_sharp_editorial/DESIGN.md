---
name: Salty Sharp Editorial
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#484740'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#79776f'
  outline-variant: '#c9c6bd'
  surface-tint: '#605f56'
  primary: '#605f56'
  on-primary: '#ffffff'
  primary-container: '#f2efe4'
  on-primary-container: '#6d6c64'
  inverse-primary: '#c9c7bc'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#6d5b51'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffebe1'
  on-tertiary-container: '#7b685e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2d8'
  primary-fixed-dim: '#c9c7bc'
  on-primary-fixed: '#1c1c15'
  on-primary-fixed-variant: '#48473f'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#f6ded0'
  tertiary-fixed-dim: '#d9c2b5'
  on-tertiary-fixed: '#251911'
  on-tertiary-fixed-variant: '#54433a'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
  caravan-cream: '#F2EFE4'
  deep-walnut: '#43342B'
  burnt-earth: '#C72A00'
  utility-grey: '#E0E0E0'
typography:
  display-xl:
    fontFamily: Chivo
    fontSize: 80px
    fontWeight: '800'
    lineHeight: 88px
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Chivo
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Chivo
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Chivo
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
  subheading:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  button:
    fontFamily: Chivo
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  section-gap: 120px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built for a community-driven, urban barbershop that bridges the gap between raw beach culture and high-end craftsmanship. The personality is energetic yet grounded, avoiding typical coastal clichés in favor of a sophisticated, editorial aesthetic.

The chosen design style is **Minimalism with a Heavy Editorial influence**. It prioritizes massive whitespace, a rigid grid, and bold, oversized typography. By stripping away decorative fluff, the focus remains on high-quality photography and the utility of the reservation experience. This approach creates an "urban-premium" feel—accessible to the community but stylish enough to feel like a boutique experience.

## Colors

The palette is anchored by "Caravan Cream," a warm, textured off-white that provides a more organic and premium feel than pure white. This is contrasted against "Near-Black" and "Deep Walnut" to provide architectural weight and a sense of "urban woodshop" craftsmanship.

"Burnt Earth" (a faded red-orange) is used sparingly and intentionally for primary calls to action—specifically the "Book Now" flow—ensuring it stands out against the neutral, grounded backdrop without feeling aggressive. The "Muted Metallic Grey" serves as a subtle divider or secondary text color to maintain the minimal, industrial vibe.

## Typography

The typography strategy leverages **Chivo** for headlines to mimic the bold, high-impact feel of high-end audio branding. Its heavy weight and tight tracking create a sense of authority and modernity. **Hanken Grotesk** is used for body copy to ensure clean, effortless readability across both mobile and desktop.

A technical layer is added using **JetBrains Mono** for small labels and metadata. This monospaced touch reinforces the "urban/mechanical" aspect of barbering—the precision of the tools and the craft. Large-scale typography is a core design element; headers should often overlap or sit closely to imagery to create a collage-like editorial feel.

## Layout & Spacing

This design system uses a **Fixed Grid** layout for desktop and a **Fluid Grid** for mobile. The rhythm is dictated by a strict 8px baseline, but spacing is generous to maintain the "Minimalist" aesthetic.

- **Desktop:** A 12-column grid with 64px outer margins and 24px gutters. Elements should often span 6 or 12 columns to maintain a bold, centered feel.
- **Mobile:** A 4-column grid with 20px margins. The layout relies on vertical stacking with significant breathing room between sections (using `section-gap`) to avoid a cluttered "app" feel.
- **Philosophy:** Content is often asymmetrical. For example, a headline might be left-aligned while its supporting body text is offset to the right column to create visual tension and interest.

## Elevation & Depth

To maintain the grounded and tactile feel, this design system avoids traditional drop shadows. Instead, depth is achieved through **Tonal Layers** and **Crisp Outlines**.

- **Surface Tiers:** Use "Caravan Cream" as the base layer. Interactive containers (like reservation cards) use a slightly lighter off-white or a subtle 1px border in "Dark Walnut" (at 10% opacity) to define boundaries.
- **Hard Shadows:** If a shadow is absolutely necessary for a floating element (like a mobile "Book Now" bar), use a "Hard Shadow"—a solid 2px offset in Near-Black with no blur, reinforcing the brutalist/editorial influence.
- **Imagery:** Photos should be treated with a slight grain or high-contrast filter to feel "salty" and physical, rather than digitally perfect.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Every UI element—from buttons to input fields to image containers—should have 90-degree corners. This evokes a sense of architectural precision and professional sharpness. The lack of rounded corners differentiates the brand from soft, "tech-heavy" competitors and aligns it with the raw, urban aesthetic of a traditional but modern barbershop.

## Components

- **Buttons:** Primary buttons are solid "Near-Black" with "Caravan Cream" text. They are full-width on mobile and use the `button` typography style. Secondary buttons are "Burnt Earth" with a 1px solid border and no fill, used exclusively for the final "Confirm Reservation" action.
- **Input Fields:** Minimalist design with only a bottom border in "Near-Black" (2px). Labels sit above the line in the `label-caps` (monospaced) style. Focus states change the border color to "Burnt Earth."
- **Cards:** Used for barber profiles or service menus. No shadows. Use a subtle 1px "Deep Walnut" border or a background color shift to distinguish from the page.
- **Chips/Status:** For availability slots, use "Near-Black" outlines. Selected slots fill with "Near-Black" and invert the text.
- **List Items:** High-contrast borders between items. Service names use `headline-lg` (at a smaller scale) and prices use `label-caps`.
- **The "Salty" Divider:** Instead of a simple line, use a thin, repeated monospaced character (e.g., "-----------------") or a very subtle textured grain line to separate sections.