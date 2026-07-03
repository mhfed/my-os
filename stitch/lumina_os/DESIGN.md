---
name: Lumina OS
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#d7ffc5'
  on-secondary: '#053900'
  secondary-container: '#2ff801'
  on-secondary-container: '#0f6d00'
  tertiary: '#fff3f4'
  on-tertiary: '#66002c'
  tertiary-container: '#ffccd6'
  on-tertiary-container: '#bb0058'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#79ff5b'
  secondary-fixed-dim: '#2ae500'
  on-secondary-fixed: '#022100'
  on-secondary-fixed-variant: '#095300'
  tertiary-fixed: '#ffd9e0'
  tertiary-fixed-dim: '#ffb1c3'
  on-tertiary-fixed: '#3f0019'
  on-tertiary-fixed-variant: '#8f0041'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  currency-display:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-x: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system establishes a "Personal OS" that transforms life management into an immersive, game-like experience. The brand personality is **playful, motivating, and high-energy**, moving away from clinical productivity tools toward a vibrant, rewarding interface.

The aesthetic combines **Dark Minimalism** with **Glassmorphism** and **Tactile** gaming elements. It utilizes deep charcoal foundations to let vibrant "power-up" colors and glowing neon accents pop, creating a sense of depth and focus. Every interaction should feel like a micro-reward, using "squishy" physics and glowing orbs to signify progress and life-status updates.

**Key Visual Drivers:**
- **Gamified Feedback:** Progress is visualized through rings, flames, and glowing orbs.
- **Vibrant Immersivity:** Rich blacks provide a canvas for neon-lit interactive elements.
- **Soft Geometry:** Large radii and chunky icons remove the "seriousness" of traditional OS environments.

## Colors

The palette is anchored in **Deep Charcoal (#121212)** to maintain high contrast with vibrant functional colors. The color system uses meaningful associations to categorize life-management tasks:

- **Electric Blue (Primary):** System actions, navigation, and core OS functions.
- **Neon Green (Secondary):** Habits, growth, and positive streaks.
- **Hot Pink (Tertiary):** Health, fitness, and vitality metrics.
- **Gold (Accent):** Rewards, goals, and high-level achievements.

**Color Application:**
- Use **Glow / Bloom** effects for active states, applying a 15-20px blur of the primary or secondary color behind key icons.
- Backgrounds should remain near-black to ensure the ₫ (Vietnamese đồng) currency values and text labels are hyper-legible.

## Typography

This design system uses a dual-font approach to balance playfulness with local language legibility. 

- **Quicksand** is used for headlines, labels, and currency. Its rounded terminals reinforce the friendly, game-like aesthetic.
- **Be Vietnam Pro** is used for body text and descriptions. It provides superior support for Vietnamese diacritics and tone marks, ensuring that long-form notes and task descriptions remain professional and highly readable.

**Currency Formatting:**
Display the Vietnamese đồng symbol (₫) following the amount with a non-breaking space (e.g., **500.000 ₫**). Use bold weights for currency to emphasize "wealth" within the Personal OS.

## Layout & Spacing

This design system follows a **Fixed Mobile Grid** optimized for single-handed iOS usage. 

- **Grid Model:** 4-column layout with 20px outer margins and 16px gutters.
- **Vertical Rhythm:** Built on a 4px baseline. Most components (cards, buttons) should use 16px or 24px internal padding to feel spacious and tactile.
- **Interactive Zones:** All tap targets must be a minimum of 44x44pt. Use generous bottom margins for "Floating Action Orbs" to avoid interference with the iOS Home Indicator.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Luminescent Blurs** rather than traditional drop shadows.

- **Level 0 (Background):** Deep Charcoal (#121212).
- **Level 1 (Cards):** Surface Dark (#1A1A1A) with a 1px subtle inner border (10% white) to define edges.
- **Level 2 (Popovers):** Surface Card (#242424) with a backdrop blur (20px) to create a frosted glass effect over the background orbs.
- **Glows:** Active elements (like a burning habit streak) should emit a soft outer glow using the specific accent color (e.g., Neon Green) at 30% opacity with a 15px spread.

## Shapes

The shape language is defined by **Extreme Roundedness (Pill-shaped)**. This softens the technical nature of an "OS" and makes the UI feel like a handheld gaming console.

- **Primary Cards:** 24px to 32px corner radius.
- **Buttons & Chips:** Fully rounded (capsule style).
- **Progress Rings:** Use thick strokes (8px+) with rounded caps for a "chunky" and satisfying visual weight.
- **Icons:** Use "Soft" or "Duotone" styles with rounded terminals to match the typography.

## Components

- **The Power Orb (FAB):** A central, floating circular button with a multi-color gradient (Electric Blue to Neon Green). On tap, it expands with a spring animation.
- **Currency Chips:** Dark pill-shaped containers with a Gold (#FFD700) border and glowing ₫ text.
- **Streak Flames:** Animated SVG components that change color from orange to Hot Pink as the streak count increases.
- **Progress Rings:** Multi-layered concentric rings. The "track" is a dark grey (10% opacity white), and the "fill" is a vibrant gradient.
- **Habit Cards:** Large cards (32px radius) containing a chunky icon, a progress ring, and a "Complete" button that uses a tactile haptic pulse on press.
- **Inputs:** Dark, recessed fields with a 2px Neon Blue border that glows when focused. Placeholder text should be 40% opacity white.
- **Lists:** Use "In-set" lists with rounded corners, where each list item is separated by a subtle 1px divider that doesn't touch the edges of the card.