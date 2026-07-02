---
name: design-system
description: >
  Sunny Farm Glass v2 — premium farm-game UI design system for Personal OS.
  Use this skill whenever building, restyling, or reviewing any screen to keep
  the warm, rustic farm-game aesthetic consistent. Covers the farm landscape
  Skia background system, wood/fabric/stone material tokens, 3D gem/stone
  buttons, and domain-colored scenes.
---

# Sunny Farm Glass v2 Design System

A warm, premium **casual farm-game** UI language for the Personal OS app.
The look is inspired by living farm worlds (Stardew Valley, Harvest Moon):
rolling green hills under golden sunlight, with UI crafted from natural
materials — warm wood, burlap fabric, stone, and coloured gemstone buttons.

> **Golden rule:** Never introduce raw hex, ad-hoc shadows, or one-off font
> strings in a component. Always pull from `src/theme/*` tokens and the
> reusable `@/components/game` kit. If a token is missing, add it to the theme —
> do not inline it.

---

## 1. Recognized Design Characteristics

| Trait | How it shows up |
|---|---|
| **Animated farm landscape** | Every screen sits on a layered Skia background: sky gradient → drifting clouds → rolling hills → tree silhouettes → foreground decor + ambient particles (fireflies, sparkles, leaves, petals). Each domain gets its own "time of day". |
| **Wood & burlap surfaces** | GamePanel uses warm wood-grain backgrounds with rivet deco or burlap fabric for alt panels. Stone variant for inset/sunken areas. |
| **3D gem/stone buttons** | GameButton stays 3-layer (base + gradient cap + gloss) but materials vary: `gem` (translucent jewel), `stone` (matte rock), `wood` (warm grain), `metal` (cold sheen). |
| **Domain-colored scenes** | Each feature maps to a farm time-of-day — Finance = golden sunrise, Health = rose dawn, Tasks = clear midday, Habits = orange sunset, Goals = green meadow, etc. |
| **Glossy sheen** | A white→transparent `gradients.gloss` overlay across the top half of buttons/panels for the "wet candy" look. |
| **Soft emboss text** | Headings use rounded Baloo 2 with a soft brown drop shadow (`textShadow.emboss`); button labels use a hard dark shadow (`textShadow.button`). |
| **HUD game furniture** | Currency pills (coins/gems/xp/savings), level badges, star ratings, animated particle effects. |
| **Bouncy micro-interactions** | Spring press/release (`withSpring`), light haptics on press-in, staggered card entrance via `AnimatedCard`. |
| **Generous rounding** | Pills and chunky corners everywhere (`radius` scale, `radius.pill` for HUD/inputs). |

---

## 2. Design Tokens

All tokens live in `src/theme/`. Import via the `@/theme/*` alias.

### 2.1 Colors — `src/theme/colors.ts`

**Surfaces & text**

| Token | Value | Use |
|---|---|---|
| `colors.appBg` | `#5EC4F0` | Farm sky blue (outermost backdrop) |
| `colors.screenBg` | `#D8F1FF` | Light sky fallback behind the Skia scene |
| `colors.card` | `#FFFFFFB8` | Translucent white glass panel (~72%) |
| `colors.cardAlt` | `#EFFBFFA6` | Tinted alt glass (~65%) |
| `colors.track` | `#FFFFFF7A` | Translucent inset well / progress track |
| `colors.border` | `#FFFFFFE0` | Bright glass rim |
| `colors.text` | `#3E2C15` | Warm farm-brown primary text |
| `colors.textOnDark` | `#FFFFFF` | Text on coloured/3D buttons |
| `colors.muted` | `#8A7150` | Secondary text (hay brown) |
| `colors.tabInactive` | `#7E97AA` | Inactive tab tint (hazy sky) |

**Accents** — each pairs a bright face with a darker `*Deep` for the 3D base/border:

| Accent | Face | Deep | Domain |
|---|---|---|---|
| purple | `#9C5FE8` | `#7239BC` | Today, Inbox |
| gold | `#FFD700` | `#B8860B` | **Finance** |
| teal | `#2FC6E4` | `#1795B4` | — |
| green | `#58C832` | `#3B9414` | Goals |
| orange | `#FF9330` | `#D66B0E` | Habits |
| yellow | `#FFC933` | `#E09E00` | Notes |
| red | `#FF5D55` | `#D63A34` | Health |
| blue | `#3D9BFF` | `#1F6FD6` | Tasks |
| pink | `#FF7FC3` | `#E0509A` | Journal |

Additional gold palette tokens: `colors.amber` (`#FF8C00`), `colors.copper` (`#CD7F32`), `colors.goldSoft` (`#FFF3C4`).

**Gradients** — `src/theme/colors.ts` `gradients` object:

| Token | Stops | Use |
|---|---|---|
| `backdrop` | `#A9E4FF → #5EC4F0` | Screen backdrop |
| `warm` | `#FFFFFF → #EAF7FF` | Soft interior |
| `green` | `#8BE05C → #58C832` | CTA success |
| `purple` | `#BE8CFF → #9C5FE8` | Today, Inbox |
| `gold` | `#FFDE6B → #FF9330` | Finance **new** |
| `gem` | `#7BE3F5 → #2FC6E4` | Legacy teal |
| `red` | `#FF938D → #FF5D55` | Health |
| `blue` | `#7FC0FF → #3D9BFF` | Tasks |
| `pink` | `#FFA9D6 → #FF7FC3` | Journal |
| `gloss` | `rgba(255,255,255,0.62) → transparent` | Top sheen |
| `spend` | `#58C832 → #2FC6E4` | Progress bars |

**Color helpers**: `tint(hex, alpha = '1A')`, `glassy(hex, alpha = 'E0')`, `resolveAccent(hex)`, `gradientFor(face)`, `glow(hex, opacity, radius)`, `base3D(deepHex, height)`.

### 2.2 Typography — `src/theme/typography.ts`

Same Baloo 2 stack. Heading shadows warm up: `textShadow.emboss` uses `colors.text` brown.

### 2.3 Motion — `src/theme/motion.ts`

Same spring/timing tokens. Add `timing.ambient: { duration: 12000, easing: Easing.linear }` for slow cloud/particle loops (optional; values can be inlined too).

### 2.4 Spacing & Radius — `src/theme/colors.ts`

`radius.scale`: sm 12, md 18, lg 24, xl 30, pill 999.

---

## 3. Component Library

Reusable game UI kit at `@/components/game`. Barrel: `import { GameButton, GameIconButton, GamePanel, CurrencyChip, StarRating } from '@/components/game';`

### GameButton

Chunky 3-layer button: base wall (coloured 3D shadow) + gradient cap + top gloss.

```tsx
<GameButton label="Start quest" variant="green" size="md" material="gem" onPress={...} />
```

- `variant`: `green | purple | gold | gem | red | blue` (drives cap gradient + `deep` base).
- `material`: `'gem'` (default, translucent jewel) | `'stone'` (matte rock) | `'wood'` (warm grain) | `'metal'` (cold sheen).
- `size`: `sm` (h40) | `md` (h52) | `lg` (h62).
- `icon?` MaterialCommunityIcons name; `children?` overrides default label content; `fullWidth?`; `haptic?`.

### GameIconButton

Square 3D icon button with same materials.

```tsx
<GameIconButton icon='bell-outline' variant='gold' material='gem' size={44} />
```

### IconBadge

Glossy 3D "clay chip" for a single icon — deep base wall, gradient cap, top gloss + spot highlight, white glyph.

```tsx
<IconBadge icon='piggy-bank' color={colors.gold} size={38} />
```

`color` resolves via `resolveAccent` to the nearest theme pairing — never pass a raw deep shade.

### GamePanel

Material-themed raised container: wood, fabric, or stone.

```tsx
<GamePanel title="Today's quests" variant="wood" headerRight={<CountChip n={3} />}>...</GamePanel>
<GamePanel variant="fabric" alt>...</GamePanel>      // lighter woven look
<GamePanel variant="stone" flush>...</GamePanel>     // inset / no padding
```

- `variant`: `'wood'` (default) — warm brown, wood-grain texture, rivet decorations
- `'fabric'` — beige/twill background, stitched border effect
- `'stone'` — gray chiseled stone, subtle shadow

### CurrencyChip

HUD resource pill.

```tsx
<CurrencyChip kind="coins" value={score} />
<CurrencyChip kind="savings" value={totalSavings} onAdd={...} />
```

- `kind`: `coins` (gold, coin icon) | `gems` (teal, diamond) | `xp` (purple, star) | `savings` (gold/amber, treasure chest icon **new**).
- `savings` kind uses gold gradient + chest icon

### StarRating

```tsx
<StarRating filled={starsFilled} count={3} size={20} />
```

### FarmBackground (Skia)

Domain-colored animated farm landscape. Replace old `SkiaBackground`.

```tsx
import { FarmBackground } from '@/components/skia';
// ...
<FarmBackground domain='finance' />
```

Renders per-domain scene: sky gradient → clouds → hills → trees → ambient particles. See `src/components/skia/farm/`.

### Supporting building blocks

- `AnimatedCard` — staggered entrance wrapper
- `PressableScale` — generic spring-scale press with haptic
- `AmbientParticles` — domain-specific: fireflies, sparkles, leaves, petals
- `CloudLayer`, `HillLayer`, `TreeLayer`, `SunMoon` — individual Skia scene layers

---

## 4. Farm Background Scenes (per domain)

| Domain | Scene | Sky | Sun | Particles |
|---|---|---|---|---|
| `today` | Sunset over hills | Purple→pale blue | Purple glow | Fireflies |
| `tasks` | Clear midday | Blue→pale | Golden | None |
| `finance` | Golden sunrise | Gold→amber→blue | Radiant gold | Coin sparkles |
| `health` | Rose dawn | Pink→rose→blue | Rose | Cherry petals |
| `habits` | Orange sunset | Orange→peach→blue | Amber | Autumn leaves |
| `goals` | Green meadow | Green→pale blue | Golden | Fireflies |
| `journal` | Pink dawn | Pink→cream→blue | Blush pink | Cherry petals |
| `notes` | Golden noon | Yellow→gold→blue | Bright gold | Autumn leaves |
| `inbox` | Twilight | Lavender→purple→blue | Purple | Fireflies |

Each scene renders 6-8 Skia layers with animated elements (clouds drifting, sun moving, particles floating). Respects `useReducedMotion()`.

---

## 5. Recipes (copy these patterns)

**Domain-colored farm background**

```tsx
<View style={{ flex: 1 }}>
  <FarmBackground domain='finance' />
  <ScrollView>...your content...</ScrollView>
</View>
```

**Wood panel with title**

```tsx
<GamePanel title="Recent Transactions" variant='wood'>
  {/* content */}
</GamePanel>
```

**Gold CTA gem button**

```tsx
<GameButton label="Add Transaction" variant='gold' material='gem' onPress={...} />
```

**Savings currency chip**

```tsx
<CurrencyChip kind='savings' value={formatCompactVND(totalSavings)} />
```

**Ambient particles on a scene**

```tsx
<AmbientParticles kind='sparkles' count={12} color={colors.gold} />
```

---

## 6. Consistency Checklist (run before finishing any UI change)

- [ ] No raw hex / inline shadow / literal font string — all from `@/theme/*`.
- [ ] Primary actions use `GameButton`; icon actions use `GameIconButton`.
- [ ] Containers use `GamePanel` (with `variant`/`alt`/`flush` where appropriate).
- [ ] Accents always paired with their `*Deep` for 3D base/border.
- [ ] Gloss overlay sits on the **top half** of glossy surfaces only.
- [ ] Background uses `FarmBackground` instead of old `SkiaBackground`.
- [ ] Headings: Baloo `display*` + `emboss`; button labels: `displayBold` + `button` shadow.
- [ ] Pressables spring + light haptic; cap lift equals base height.
- [ ] Corners use the `radius` scale; HUD/inputs use `radius.pill`.
- [ ] Run `npm run typecheck` — zero TS errors.

---

## 7. Extending the system

1. **New accent** → add `xxx` + `xxxDeep` to `colors`, a matching `gradients.xxx`, scene config in `FarmBackground`, and a `GameButton` variant.
2. **New material** → add to `GameButton`/`GameIconButton` material union. Create gradient/texture pattern for it.
3. **New scene domain** → add scene config in `src/components/skia/farm/FarmBackground.tsx` scene map.
4. **New component** → build from base3D + gradient cap + gloss, export from `src/components/game/index.ts`, and document its props in §3.
5. Keep this file the **single source of truth** — update §2/§3 whenever tokens or component APIs change.
