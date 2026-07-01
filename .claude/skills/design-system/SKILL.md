---
name: design-system
description: >
  Magic Academy game-UI design system for the Personal OS app. Use this skill
  whenever building, restyling, or reviewing any screen, component, or visual
  element so the candy/jelly mobile-game aesthetic stays consistent. Covers the
  recognized design language, the full design-token reference (colors, typography,
  radius, gradients, glow/3D shadows, motion), and component usage guidelines.
---

# Magic Academy Design System

A warm, candy-coated **casual mobile-game** UI language for the Personal OS app.
The look is inspired by witch/magic-academy mobile games: a dreamy purple sky
behind cream "parchment" surfaces, chunky 3D jelly buttons with glossy sheens,
HUD currency pills, star ratings, and bouncy spring micro-interactions.

> **Golden rule:** Never introduce raw hex, ad-hoc shadows, or one-off font
> strings in a component. Always pull from `src/theme/*` tokens and the
> reusable `@/components/game` kit. If a token is missing, add it to the theme —
> do not inline it.

---

## 1. Recognized Design Characteristics

| Trait                             | How it shows up                                                                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dreamy purple backdrop**        | App-level purple sky (`appBg`) rendered by `SkiaBackground` with soft floating blurred orbs.                                                              |
| **Warm cream surfaces**           | Screens sit on `screenBg` cream parchment; panels are white/`cardAlt` with warm borders.                                                                  |
| **Chunky 3D jelly buttons**       | Every primary button is a 3-layer slab: a darker `deep` **base** wall, a gradient **cap** that presses DOWN into the base, and a top **gloss** highlight. |
| **High-saturation candy palette** | Pure greens, purples, teals, golds — always paired with a darker `*Deep` for the 3D base/border.                                                          |
| **Glossy sheen**                  | A white→transparent `gradients.gloss` overlay across the top half of buttons/panels for the "wet candy" look.                                             |
| **Soft emboss text**              | Headings use rounded Baloo 2 with a soft brown drop shadow (`textShadow.emboss`); button labels use a hard dark shadow (`textShadow.button`).             |
| **HUD game furniture**            | Currency pills (coins/gems/xp), level badges, star ratings, energy orb.                                                                                   |
| **Bouncy micro-interactions**     | Spring press/release (`withSpring`), light haptics on press-in, staggered card entrance via `AnimatedCard`.                                               |
| **Generous rounding**             | Pills and chunky corners everywhere (`radius` scale, `radius.pill` for HUD/inputs).                                                                       |

---

## 2. Design Tokens

All tokens live in `src/theme/`. Import via the `@/theme/*` alias.

### 2.1 Colors — `src/theme/colors.ts`

**Surfaces & text**
| Token | Value | Use |
|-------|-------|-----|
| `colors.appBg` | `#7C4DFF` | App-level purple sky (Skia backdrop) |
| `colors.screenBg` | `#FBEFD8` | Cream screen background |
| `colors.card` | `#FFFFFF` | Default panel/card |
| `colors.cardAlt` | `#FFF6E6` | Alt/inset panel (quick-capture, subtle rows) |
| `colors.track` | `#EAD9B8` | Inactive track, undone borders |
| `colors.border` | `#E7C690` | Warm hairline border |
| `colors.text` | `#4A2E12` | Primary text (warm brown) |
| `colors.muted` | `#A6814E` | Secondary text |
| `colors.textOnDark` / `colors.white` | `#FFFFFF` | Text on colored/dark surfaces |
| `colors.tabInactive` | `#C9A876` | Inactive tab icon/label |
| `colors.black` | `#2A1A0A` | Deepest warm shade |

**Accents** — each pairs a bright face with a darker `*Deep` for the 3D base/border:

| Accent | Face      | Deep      |
| ------ | --------- | --------- |
| purple | `#7C5BE6` | `#5B3FC4` |
| teal   | `#3FD4E8` | `#1FA9BE` |
| green  | `#6FD03A` | `#4DA61F` |
| orange | `#FFA726` | `#E07E12` |
| yellow | `#FFD23F` | `#E0A800` |
| red    | `#FF5A6E` | `#D63A52` |
| blue   | `#5B8DEF` | `#3D6BC4` |
| pink   | `#FF7EB6` | `#E0568F` |

> When using an accent for a 3D element, always use its `*Deep` partner for the
> base slab / border. Never invent a darker shade by eye.

**Color helpers**

- `tint(hex, alpha = '1A')` → `${hex}${alpha}` for soft fills/badges (e.g. priority badge background).
- `glow(hex, opacity = 0.45, radius = 18)` → returns a `shadow*` style object for a colored glow halo.
- `base3D(deepHex, height = 5)` → returns the **hard zero-blur** shadow that creates the 3D slab wall: `{ shadowColor: deepHex, shadowOffset: { width: 0, height }, shadowOpacity: 1, shadowRadius: 0, elevation: height + 2 }`. Use this for any pressable that should look like a physical jelly slab.

### 2.2 Radius — `colors.radius`

`{ sm: 12, md: 18, lg: 24, xl: 30, pill: 999 }`

- `sm/md` → small chips, badges, inset rows.
- `md/lg` → cards & panels.
- `xl` → hero panels.
- `pill` → HUD chips, text inputs, round icon buttons.

### 2.3 Gradients — `colors.gradients`

Two-stop arrays consumed by `expo-linear-gradient`:
`backdrop`, `warm`, `green` `['#8FE34A','#5BC02E']`, `purple` `['#9B7BFF','#7C5BE6']`,
`gold` `['#FFE27A','#FFB23F']`, `gem` `['#7DE9F7','#3FD4E8']`, `red` `['#FF8A9B','#FF5A6E']`,
`gloss` `['rgba(255,255,255,0.55)','rgba(255,255,255,0.0)']`, `spend`.

- Use a domain/accent gradient for the **cap** of a button.
- Always layer `gloss` over the **top half** of a glossy surface (top→bottom).

### 2.4 Shadows / elevation — `colors.elevation`

- `elevation.card` → soft resting shadow for cards.
- `elevation.panel` → `{ shadowColor:'#5A3A12', shadowOffset:{width:0,height:6}, shadowOpacity:0.18, shadowRadius:14, elevation:5 }` for raised panels.
- For the **3D pressable wall**, prefer `base3D(...)` over `elevation.*`.

### 2.5 Typography — `src/theme/typography.ts`

`fonts` keys (use the family string as `fontFamily`):

| Key                                           | Family                        | Use                                           |
| --------------------------------------------- | ----------------------------- | --------------------------------------------- |
| `regular` / `medium` / `semibold` / `bold`    | IBM Plex Sans 400/500/600/700 | Body, labels, data                            |
| `monoRegular` / `monoMedium` / `monoSemibold` | IBM Plex Mono                 | Numbers, code-like values                     |
| `display`                                     | `Baloo2_600SemiBold`          | **Default headings / titles / chunky labels** |
| `displayMedium`                               | `Baloo2_500Medium`            | Soft greetings/subtitles                      |
| `displayBold`                                 | `Baloo2_700Bold`              | Section titles, button labels                 |
| `displayExtra`                                | `Baloo2_800ExtraBold`         | Hero name, big numbers                        |

> ⚠️ There is **no** `displaySemibold` key. The semibold rounded face is just
> `display`. Do not reference non-existent keys.

`textShadow` presets:

- `textShadow.emboss` → soft brown drop (`rgba(122,74,18,0.25)`) for Baloo headings on light surfaces.
- `textShadow.button` → hard dark drop (`rgba(0,0,0,0.22)`) for white labels on colored buttons.

### 2.6 Motion — `src/theme/motion.ts` + reanimated

- Press in: `withSpring` snappy (cap translates down by `lift`).
- Release: `withSpring` bouncy (overshoot for jelly bounce).
- Entrance: `AnimatedCard` staggers children by `index` (fade + rise).
- Haptics: `Haptics.impactAsync(Light)` on press-in for tactile elements; `selection` for subtle taps.
- Keep the **3D lift constant** (`LIFT`/`lift`) equal to the `base3D` height so the cap fully collapses into the base on press.

---

## 3. Component Guidelines — `@/components/game`

Barrel: `import { GameButton, GameIconButton, GamePanel, CurrencyChip, StarRating } from '@/components/game';`

### GameButton

Chunky 3-layer jelly button (base + gradient cap + gloss).

```tsx
<GameButton label="Start quest" variant="green" size="md" icon="rocket-launch" onPress={...} />
```

- `variant`: `green | purple | gold | gem | red | blue` (drives cap gradient + `deep` base).
- `size`: `sm` (h40) | `md` (h52) | `lg` (h62).
- `icon?` MaterialCommunityIcons name; `children?` overrides default label content; `fullWidth?`; `haptic?`.
- Label uses `displayBold` + `textShadow.button`. Do **not** wrap in another shadow container.

### GameIconButton

Square glossy 3D icon button.

```tsx
<GameIconButton icon='bell-outline' variant='gold' size={44} />
```

- `variant` same set as GameButton; `size` (default 46); `iconSize?`; `haptic?`.
- For HUD actions (notifications, add) — keep `size` 44–48.

### GamePanel

Cream/white raised container with optional title + header action.

```tsx
<GamePanel title="Today's quests" headerRight={<CountChip n={3} />}>...</GamePanel>
<GamePanel alt>...</GamePanel>      // inset cardAlt variant
<GamePanel flush>...</GamePanel>    // no inner padding (for horizontal scrollers)
```

- `title` renders a `displayBold` heading with `emboss`.
- Use `alt` for secondary/inset blocks (e.g. quick-capture), `flush` when the child manages its own padding (e.g. a horizontal habit scroller).

### CurrencyChip

HUD resource pill.

```tsx
<CurrencyChip kind="coins" value={score} />
<CurrencyChip kind="gems" value={done} onAdd={...} />
```

- `kind`: `coins | gems | xp` (icon + gradient); `value`; optional `onAdd` shows a `+` mint button.

### StarRating

```tsx
<StarRating filled={starsFilled} count={3} size={20} />
```

- `filled` stars get a gold glow; empties are muted outlines.
- Derive `filled` from a score: `Math.min(count, Math.max(0, Math.round(score / step)))`.

### Supporting building blocks (already game-styled)

- `AnimatedCard` — staggered entrance wrapper (`index` prop).
- `PressableScale` — generic spring-scale press with `haptic`.
- `EnergyOrb` (Skia) — hero stat ring.
- `HabitPill` — 3D jelly habit tile (base + cap + gloss, spring press).
- `TaskCard` — game card: round check, white border, `display` title, pill badge.

---

## 4. Recipes (copy these patterns)

**A 3D pressable slab**

```tsx
// base wall
<View style={[styles.base, base3D(colors.greenDeep, LIFT)]} />
// cap (animated translateY: press.value * LIFT), gradient + gloss on top half
<Animated.View style={[styles.cap, capStyle]}>
  <LinearGradient colors={colors.gradients.green} .../>
  <LinearGradient colors={colors.gradients.gloss} .../>  {/* top half only */}
</Animated.View>
```

**Heading on a light panel**

```tsx
<Text style={{ fontFamily: fonts.displayBold, color: colors.text, ...textShadow.emboss }}>
```

**White label on a colored button**

```tsx
<Text style={{ fontFamily: fonts.displayBold, color: colors.white, ...textShadow.button }}>
```

**Pill input**

```tsx
borderRadius: radius.pill, borderWidth: 2, borderColor: colors.track, backgroundColor: colors.white
```

---

## 5. Consistency Checklist (run before finishing any UI change)

- [ ] No raw hex / inline shadow / literal font string — all from `@/theme/*`.
- [ ] Primary actions use `GameButton`; icon actions use `GameIconButton`.
- [ ] Containers use `GamePanel` (with `alt`/`flush` where appropriate).
- [ ] Accents always paired with their `*Deep` for 3D base/border.
- [ ] Gloss overlay sits on the **top half** of glossy surfaces only.
- [ ] Headings: Baloo `display*` + `emboss`; button labels: `displayBold` + `button` shadow.
- [ ] Pressables spring + light haptic; cap lift equals base height.
- [ ] Corners use the `radius` scale; HUD/inputs use `radius.pill`.
- [ ] Run `npm run typecheck` — zero TS errors.

---

## 6. Extending the system

1. **New accent** → add `xxx` + `xxxDeep` to `colors`, a matching `gradients.xxx`, and a `GameButton`/`GameIconButton` variant spec.
2. **New component** → build it from base3D + gradient cap + gloss, export from `src/components/game/index.ts`, and document its props in §3.
3. **New token** → add to the correct `src/theme/*` file first, then consume; never inline.
4. Keep this file the **single source of truth** — update §2/§3 whenever tokens or component APIs change.
