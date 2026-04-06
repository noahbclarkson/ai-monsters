# AI Monsters - UI Design Document

## Overview
Complete visual overhaul of AI Monsters into a polished indie card game that could ship on Steam or itch.io.

**Guiding principle:** This should feel like a game you'd pay $15 for on itch.io, not a CS student prototype.

---

## Design Philosophy

### Aesthetic Direction
**Dark fantasy with luminous accents** -- deep, rich backgrounds that feel like a tavern at midnight. Cards glow with rarity. The UI recedes; the cards are the stars.

Reference points: Slay the Spire's polish, Shadowverse's visual drama,Inscryption's atmosphere.

### Color System

```
Background Deep:     #0a0b0f  (near-black with blue tint)
Background Surface:  #12141a  (card surfaces, panels)
Background Elevated: #1a1d27  (modals, hover states)
Border Subtle:       #2a2d3a  (dividers, card borders)
Border Glow:         #3d4050  (hover states)

Text Primary:        #f0f0f5  (headings, important text)
Text Secondary:      #8b8d9a  (descriptions, labels)
Text Muted:          #5a5c6a  (timestamps, hints)

Rarity Common:       #9ca3af  (gray - subtle, no glow)
Rarity Rare:         #3b82f6  (blue - soft glow)
Rarity Epic:         #a855f7  (purple - stronger glow)
Rarity Legendary:    #f59e0b  (amber/gold - intense glow + particles)

Type Unit:           #ef4444  (red accent)
Type Building:       #6366f1  (indigo accent)
Type Spell:          #22d3ee  (cyan accent)

Stat Attack:         #f87171  (coral red)
Stat Defense:        #60a5fa  (sky blue)
Stat Range:          #4ade80  (green)

UI Accent:           #8b5cf6  (violet - buttons, links)
UI Success:          #10b981  (emerald - confirmations)
UI Warning:          #f59e0b  (amber - warnings)
UI Danger:           #ef4444  (red - destructive)
```

### Typography

**Font Stack:**
- Headings: `"Cinzel", Georgia, serif` -- regal, fantasy feel
- Body/UI: `"Inter", system-ui, sans-serif` -- clean, readable
- Stats/Numbers: `"JetBrains Mono", monospace` -- precise, technical

**Scale:**
- Hero: 3rem/48px, weight 700
- H1: 2rem/32px, weight 700
- H2: 1.5rem/24px, weight 600
- H3: 1.25rem/20px, weight 600
- Body: 1rem/16px, weight 400
- Small: 0.875rem/14px, weight 400
- Tiny: 0.75rem/12px, weight 500 (labels, badges)

### Spacing System
8px base grid: 4, 8, 12, 16, 24, 32, 48, 64, 96px

### Border Radius
- Cards: 12px
- Buttons: 8px
- Badges: 6px
- Inputs: 8px
- Modals: 16px

### Shadows
```
shadow-card:       0 4px 20px rgba(0,0,0,0.4)
shadow-card-hover: 0 8px 40px rgba(0,0,0,0.6)
shadow-glow-common: 0 0 20px rgba(156,163,175,0.2)
shadow-glow-rare:  0 0 25px rgba(59,130,246,0.4)
shadow-glow-epic:  0 0 30px rgba(168,85,247,0.5)
shadow-glow-legendary: 0 0 40px rgba(245,158,11,0.6)
```

### Motion Philosophy

**Principle:** Motion should feel physical. Cards have weight. Transitions have momentum.

- Card hover: scale(1.03) + shadow lift, 200ms ease-out
- Card selection: scale(1.05) + ring glow pulse, 150ms
- Card flip: 3D rotateY, 400ms cubic-bezier(0.4, 0, 0.2, 1)
- Page transitions: fade + slight upward translate, 300ms
- Button press: scale(0.97), 100ms
- Stagger animations: 50ms delay between items
- Shimmer on Legendary: continuous subtle sweep animation

### Rarity Visual Treatment

**Common:**
- Border: #9ca3af at 30% opacity
- No glow
- Plain card back pattern

**Rare:**
- Border: #3b82f6 at 60% opacity
- Soft blue outer glow (shadow-glow-rare)
- Subtle shimmer on hover

**Epic:**
- Border: #a855f7 at 80% opacity
- Purple outer glow
- Shimmer effect visible on card
- Corner decorations

**Legendary:**
- Border: #f59e0b at 100%, animated glow pulse
- Intense amber glow
- Particle/sparkle effect
- Golden card back with emblem
- Corner filigree

---

## Layout System

### Overall Structure
```
App Shell
├── Header (fixed, 64px)
│   ├── Logo + Title (left)
│   ├── Nav tabs (center)
│   └── Status indicators (right)
├── Main content (calc(100vh - 64px), scrollable)
└── Mobile bottom nav (fixed, 64px on mobile only)
```

### Card Grid
- Collection: 4 cols @ 1440px, 3 cols @ 1024px, 2 cols @ 640px, 1 col @ 375px
- Card aspect ratio: 2:3 (portrait)
- Card max-width: 280px
- Grid gap: 24px

### Game Board Layout
```
┌─────────────────────────────────────────────┐
│  Game Header (turn info, phase, end turn)   │
├─────────────────────────────────────────────┤
│           Opponent's Hand (face-down)       │
├─────────────────────────────────────────────┤
│  ┌─────┬─────┬─────┐                        │
│  │     │     │     │  <- Opponent's rows    │
│  ├─────┼─────┼─────┤                        │
│  │     │     │     │  <- Battlefield        │
│  ├─────┼─────┼─────┤                        │
│  │     │     │     │  <- Your rows          │
│  └─────┴─────┴─────┘                        │
├─────────────────────────────────────────────┤
│           Your Hand (selectable cards)      │
└─────────────────────────────────────────────┘
```

---

## Component Library

### Card Component
**States:**
- Default: rarity border, subtle shadow
- Hover: scale 1.03, shadow lift, glow intensifies
- Selected: scale 1.05, animated ring in rarity color
- Disabled: 50% opacity, no hover effects
- Face-down: card back with pattern, slight inner glow

**Structure:**
```
Card
├── Card Header (name, type icon, rarity badge)
├── Card Art (image with overlay gradient)
├── Card Stats (ATK/DEF/RNG in stat-colored boxes)
└── Card Footer (description, card ID)
```

### Button Component
**Variants:** primary, secondary, ghost, danger
**Sizes:** sm (32px), md (40px), lg (48px)
**States:** default, hover, active (pressed), disabled, loading

### Badge Component
Rarity badge with color + label. Small, pill-shaped.

### Stat Box Component
Individual stat display (ATK/DEF/RNG) with:
- Icon
- Value in mono font
- Background in stat color

### Panel Component
Surface container with:
- Optional header
- Rounded corners (12px)
- Subtle border
- Background surface color
- Padding 24px

### Modal Component
- Backdrop blur
- Centered content
- Max-width 600px
- Slide-up entrance animation

---

## Screen-by-Screen Design

### 1. Card Generator Screen
- Hero section with title "Forge Your Army"
- Subtitle about AI-generated cards
- Two action buttons: "Generate Card" and "Open Pack (7)"
- Card grid below
- Stats bar showing collection counts

### 2. Game Arena / Lobby Screen
- Mode selection cards:
  - "Practice vs AI" with difficulty selector
  - "Find Match" for multiplayer
- Active matches list
- Each match as a card showing opponent name + status

### 3. Game Board Screen
- Full battlefield visualization
- Player hands at bottom
- Opponent's hand (face-down cards) at top
- 3x6 board grid (3 columns x 6 rows)
- Turn/phase indicator prominently displayed
- End turn button (large, satisfying)

### 4. Collection Screen
- Filter bar (search, rarity, type, sort)
- Stats row at top
- Grid of cards with hover effects
- Click opens detail modal with full card view

### 5. Pack Opening Screen
- Dramatic pack opening animation
- Cards fan out with stagger
- Click to flip each card
- "Add to Collection" when done

### 6. Daily Card Screen
- Countdown to next card
- Today's free card prominently displayed
- Claim button with progress indicator

### 7. Leaderboard Screen
- Top 10 players with rank badges
- Current player highlighted
- Stats: rating, wins, win rate

---

## Technical Implementation Notes

### Image Generation Fix
- Remove all `window.ai.generateImage()` calls
- Wire through `/api/generate-card-image` API route
- API route calls OpenClaw `image_generate` tool
- Cache image URLs in SpacetimeDB

### Custom Tailwind Extension
Extend theme with:
- All colors from color system above
- Custom fonts (Cinzel, Inter, JetBrains Mono)
- Custom shadows for glow effects
- Custom animations (shimmer, pulse-glow, float)

### Performance Considerations
- Use `next/image` for card art (automatic optimization)
- Lazy load collection cards below fold
- Preload critical fonts
- Use CSS transforms for animations (GPU-accelerated)
