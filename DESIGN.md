# AI Monsters - UI Design Document
## Created: 2026-04-06

---

## 1. Visual Direction

**Aesthetic:** Dark indie-card-game. Think Gwent meets Slay the Spire — rich, atmospheric, premium.

**Reference games:** Gwent (clean card frames, glowing borders), Legends of Runeterra (smooth animations, rich backgrounds), Monster Train (hover states, rarity glow).

**Not:** Generic AI-generated slop, flat Tailwind defaults, "blue gradient into purple" without texture.

---

## 2. Color Palette

```
--bg-deep:        #0d0d1a   /* deepest background */
--bg-surface:    #141428   /* card/panel surfaces */
--bg-elevated:    #1e1e3a   /* elevated panels, modals */
--bg-card:        #1a1a2e   /* card face background */

--border-subtle:  rgba(255,255,255,0.06)
--border-medium:  rgba(255,255,255,0.12)
--border-bright:  rgba(255,255,255,0.25)

--text-primary:   #f0f0ff
--text-secondary: #9090b0
--text-muted:     #505070

--accent-gold:    #f5c542   /* legendary, highlights */
--accent-blue:    #4a9eff   /* rare, interactive */
--accent-purple:  #a855f7   /* epic, magical */
--accent-green:   #22c55e   /* common, success */
--accent-red:     #ef4444   /* attack, danger */
--accent-cyan:    #06b6d4   /* defense, utility */

/* Rarity border glow */
--glow-common:    rgba(34,197,94,0.3)
--glow-rare:      rgba(74,158,255,0.4)
--glow-epic:      rgba(168,85,247,0.5)
--glow-legendary: rgba(245,197,66,0.6)
```

---

## 3. Typography

- **Display:** "Cinzel" (Google Fonts) — fantasy/medieval headings, card names
- **Body:** "Inter" (existing) — clean readability for stats, descriptions
- **Mono:** "JetBrains Mono" — for numbers, stats, IDs

---

## 4. Rarity System

| Rarity    | Border Color | Glow        | Background Tint | Badge Color |
|-----------|-------------|-------------|-----------------|-------------|
| Common    | #22c55e     | green glow  | none            | green       |
| Rare      | #4a9eff     | blue glow   | blue tint       | blue        |
| Epic      | #a855f7     | purple glow | purple tint     | purple      |
| Legendary | #f5c542     | gold glow   | gold tint       | gold        |

Rarity borders should use `box-shadow: 0 0 0 2px <color>, 0 0 20px <glow>` with a subtle pulse animation for Epic/Legendary.

---

## 5. Component Library

### GameCard
- **States:** face-down (mysterious back pattern), face-up, hovered (lift + scale), selected (ring + lift), attacking (red pulse), defending (blue glow)
- **Animation:** 3D flip on reveal (rotate-y 180deg), hover scale 1.04, selected ring pulse
- **Back design:** Geometric dark pattern with centered AI Monsters logo, rarity-colored border trim
- **Front layout:** Name bar (rarity gradient) → Art (60% of card) → Stats bar (ATK/DEF/RNG with icons) → Description

### GameBoard
- **Layout:** 3×6 grid (3 columns × 6 rows), not 6×3
- **Player 1 zone:** Rows 0-2 (top, closer to them)
- **Player 2 zone:** Rows 3-5 (bottom)
- **Tile states:** empty, occupied (face-up/down), selected, valid-target (subtle glow), hover
- **Visual:** Dark stone/grid texture on board. Cards sit naturally on tiles, not clipped.
- **Side panels:** Player 1 hand (left), Player 2 hand (right), or top/bottom on mobile

### GameLobby
- **Clean single-column layout, not 3-panel grid**
- **Hero section:** Large title, tagline, "Play vs AI" CTA
- **Bot difficulty selector:** styled dropdown
- **Matchmaking queue:** Animated searching indicator
- **Active matches list:** Clean cards with player names + match ID

### CollectionGallery
- **Grid:** 4 columns desktop, 2 mobile — masonry-style card display
- **Filters:** Sticky top bar — rarity, type, sort, search
- **Card hover:** Slight lift + glow intensify
- **Empty state:** Atmospheric "no cards" with generate CTA

### Leaderboard
- **Ranked list with tier badges (Novice → Grandmaster)**
- **Top 3:** Special card-style treatment with medal icons
- **Sortable** by rating/wins/level

---

## 6. Layout System

### Global
- Max-width: 1280px centered
- Padding: 24px desktop, 16px mobile
- Sections separated by 32px gap

### Card Dimensions
- Aspect ratio: 2:3 (832×1248 at base)
- Desktop card height: 280px
- Mobile card height: 180px
- Board tiles: 100×140px desktop, 70×100px mobile

### Navigation
- Horizontal tab bar (icon + label)
- Active tab: bottom border line + slightly brighter background
- Mobile: scrollable horizontally

---

## 7. Animation Philosophy

- **Entrance:** Fade + slide-up (opacity 0→1, translateY 20px→0), 300ms ease-out
- **Card flip:** 3D rotateY, 500ms, cubic-bezier(0.4, 0, 0.2, 1)
- **Card hover:** scale 1.04, translateY -4px, shadow deepens, 200ms
- **Card selection:** ring pulse (box-shadow animation), 150ms
- **Button press:** scale 0.97, 100ms
- **Page transitions:** 200ms fade between tabs
- **Rarity glow:** subtle pulse animation on Epic/Legendary borders (2s infinite)
- **No motion if prefers-reduced-motion**

---

## 8. Image Generation Fix

**Current problem:** `card-generator.ts` references `window.ai` (browser AI APIs) which doesn't exist.

**Fix:**
1. `card-generator.ts` — remove all `window.ai` calls, make image generation pure utility (prompt building + returning placeholder or cached URL)
2. API route `/api/generate-card-image/route.ts` already exists and calls MiniMax image-01
3. `CollectionGallery.tsx` → already calls `/api/generate-card-image` for new card generation
4. Wire card creation flow so new cards get AI images via the existing `/api/generate-card-image` endpoint

---

## 9. Game Flow (Lobby → Match → End)

1. **Lobby** — Hero, "Play vs AI" button with difficulty, or "Find Match" for multiplayer
2. **Matchmaking** — Animated searching state while waiting for pair
3. **In-Game** — Board, hands, turn indicator, phase banner, action buttons
4. **End Screen** — Win/lose overlay with stats, "Play Again" / "Return to Lobby"

---

## 10. Implementation Order

1. **globals.css** — Design tokens (CSS vars), custom scrollbar, base styles
2. **GameCard component** — Core card with all states, flip, hover, rarity glow
3. **GameBoard component** — New 3×6 board with proper tiles, player zones, hand display
4. **GameLobby component** — Clean layout, matchmaking states, bot start flow
5. **CollectionGallery** — Polish grid, filter bar, card hover
6. **Leaderboard** — Tier colors, top-3 treatment
7. **PackOpening** — Polished reveal animation
8. **MainNavigation** — Update styling to match new design
9. **Mobile responsiveness** — Verify all breakpoints

---
