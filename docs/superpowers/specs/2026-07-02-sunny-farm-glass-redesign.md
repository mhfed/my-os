# Sunny Farm Glass — Premium Farm Game UI Redesign

> **Design Language:** Sunny Farm Glass v2
> **Previous:** Magic Academy (retired)
> **App:** Personal OS — Expo + React Native + Expo Router

---

## 1. Design Vision

**"Stardew Valley meets Notion"** — a living, breathing farm world where every
feature is a different "area" of the farm. Warm, rustic, but premium. Each
domain gets its own time-of-day / weather vibe, rendered via layered Skia
backgrounds with animated elements (clouds, hills, trees, grass, sparkles).

### Core pillars

| Pillar | Description |
|---|---|
| **Farm landscape backgrounds** | Domain-specific Skia scenes with sky, hills, trees, clouds, animated flora |
| **Wood & burlap surfaces** | GamePanel flips from glass → wood/fabric/stone material |
| **Stone & gem buttons** | 3D layered buttons keep structure but use stone/gem textures |
| **Treasure hoard Finance** | Gold/amber palette, coin sparkles, chest icons |
| **Ambient micro-animations** | Leaves falling, fireflies, clouds drifting, coin sparkles |

---

## 2. Domain Color Map

Each feature gets a unique "farm time-of-day" scene.

| Feature | Domain | Accent | New? | Background Scene |
|---|---|---|---|---|
| Today | `today` | Purple | ✗ | Sunset over hills, purple clouds, fireflies |
| Tasks | `tasks` | Blue | ✗ | Midday clear sky, white clouds, green hills |
| Finance | `finance` | **Gold/Amber** | ✅ Changed | Golden sunrise, glowing sun, treasure glow, coin sparkles |
| Health | `health` | Red/Pink | ✗ | Rose sunrise, cherry blossoms, warm spring |
| Habits | `habits` | Orange | ✗ | Orange sunset over rice fields |
| Goals | `goals` | Green | ✗ | Expansive green meadow, growing tree |
| Journal | `journal` | Pink | ✗ | Soft pink dawn, cherry petals floating |
| Notes | `notes` | Yellow | ✗ | Golden noon, sun rays through leaves |
| Inbox | `inbox` | Lavender Purple | ✗ | Twilight purple, settling dusk |

---

## 3. Component Material Changes

### GamePanel → Material variants

- **`wood`** (default): Wood texture via Skia paths + dark brown border, rivet decor
- **`fabric`** (alt): Burlap/twill background, stitch border
- **`stone`** (inset): Gray stone, chiseled border
- Props: `variant: 'wood' | 'fabric' | 'stone'`
- Shadow: hard 3D shadow, dark brown/green base color
- Radius: `radius.lg` (24) for wood/fabric, `radius.md` (18) for stone

### GameButton → Stone/Gem + Wood + Metal

- Structure: 3-layer base + gradient cap + gloss remains
- **`gem`**: Colored gemstone, translucent gradient + sparkle highlight
- **`stone`**: Gray/brown stone, matte gradient
- **`wood`**: Brown wood grain, warm gradient
- **`metal`**: Steel/iron, metallic gradient + shine
- Variants per current domain palette

### CurrencyChip → Treasure/Farm resources

- `coins`: Gold gradient, coin icon
- `gems`: Teal gradient, gem icon
- `xp`: Purple gradient, star icon
- New `savings`: Gold/amber gradient, treasure chest icon

### New: Ambient elements

- `FarmBackground` — Skia component rendering layered farm scene per domain
- `FloatingParticle` — leaves, sparkles, fireflies, petals (domain-specific)
- `CloudLayer` — animated drifting clouds
- `HillLayer` — rolling hills silhouette
- `SunMoon` — animated celestial body

---

## 4. Skia Farm Background Architecture

```
FarmBackground (per domain)
├── SkyGradient          (domain sky → light blue)
├── SunMoon              (animated celestial body)
├── CloudLayer           (2-3 paths, drift horizontally)
├── MountainHills        (silhouette paths, light parallax)
├── MidgroundTrees       (tree silhouettes)
├── ForegroundDecor      (grass, fence, flowers — domain-specific)
├── Vignette             (dark edge gradient)
└── AmbientParticles     (domain-specific: sparkles/leaves/fireflies/petals)
```

Performance: Skia Canvas ~30 FPS, respects `useReducedMotion()`. Each layer
uses `needsRenderer={false}` when off-screen.

---

## 5. Finance Theme — "Treasure Hoard"

### Palette

| Token | Hex | Use |
|---|---|---|
| `gold` | `#FFD700` | Primary accent |
| `goldDeep` | `#B8860B` | 3D base, borders |
| `amber` | `#FF8C00` | Warm secondary |
| `copper` | `#CD7F32` | Tertiary/copper |
| `goldSoft` | `#FFF3C4` | Subtle fills/background |

### Skia scene

- Sky: gold → peach → pale blue gradient (sunrise)
- Glowing sun rays (animated radial beams)
- Treasure chest silhouette on hill
- Gold coin sparkles drifting up from bottom
- Autumn leaves falling in gold/amber tones

### UI

- CurrencyChip `savings` variant: chest icon + gold gradient
- All CTA buttons: gold `gem` variant
- FAB: treasure chest icon, gold gloss
- HUD: avatar changes to coin badge

---

## 6. Screen Updates Required

1. **`_layout.tsx`** — Tab bar magic button gold variant, update domain references
2. **`TodayScreen.tsx`** — Use new FarmBackground, domain purple
3. **`TasksScreen.tsx`** — Use FarmBackground, domain blue
4. **`FinanceScreen.tsx`** — ✅ Major: gold palette, treasure theme, new CurrencyChip savings
5. **`HealthScreen.tsx`** — Use FarmBackground, domain red/pink
6. **`HabitsScreen.tsx`** — Use FarmBackground, domain orange
7. **`JournalScreen.tsx`** — Use FarmBackground, domain pink
8. **`NotesScreen.tsx`** — Use FarmBackground, domain yellow
9. **`GoalsScreen.tsx`** — Use FarmBackground, domain green
10. **`InboxScreen.tsx`** — Use FarmBackground, domain lavender
11. **`components/game/`** — Update GamePanel, GameButton, GameIconButton, CurrencyChip
12. **`theme/colors.ts`** — Add gold palette, update finance domain
13. **`theme/typography.ts`** — Maybe adjust text shadows for warmer look
14. **`.claude/skills/design-system/SKILL.md`** — Rewrite for Sunny Farm Glass v2

---

## 7. Non-Goals

- No data model / schema changes
- No new navigation structure
- No new stores
- No new screens beyond the farm visual refresh
- No iOS/Android native code changes

---

## 8. Files Changed

### New files
- `src/components/skia/farm/FarmBackground.tsx` — Main background orchestrator
- `src/components/skia/farm/SkyGradient.tsx` — Domain sky gradient
- `src/components/skia/farm/CloudLayer.tsx` — Animated clouds
- `src/components/skia/farm/HillLayer.tsx` — Rolling hills
- `src/components/skia/farm/SunMoon.tsx` — Celestial body
- `src/components/skia/farm/AmbientParticles.tsx` — Domain particles
- `src/components/skia/farm/TreeLayer.tsx` — Tree silhouettes
- `src/components/skia/farm/index.ts` — Barrel exports

### Modified files
- `src/theme/colors.ts` — Add gold palette, update finance domain
- `src/components/game/GamePanel.tsx` — Add material variants
- `src/components/game/GameButton.tsx` — Add stone/wood/metal/gem variants
- `src/components/game/GameIconButton.tsx` — Add material variants
- `src/components/game/CurrencyChip.tsx` — Add savings kind
- `src/components/game/index.ts` — Export new items
- `src/components/skia/index.ts` — Export farm components
- `src/features/today/TodayScreen.tsx` — Use FarmBackground
- `src/features/tasks/TasksScreen.tsx` — Use FarmBackground
- `src/features/finance/FinanceScreen.tsx` — Gold/treasure refresh
- `src/features/finance/components/` — Adjust Finance-specific components for gold
- `app/(tabs)/_layout.tsx` — Update tab bar center button
- `.claude/skills/design-system/SKILL.md` — Complete rewrite
