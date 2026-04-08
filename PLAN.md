# AI Monsters - Project Plan

## Status: UI OVERHAUL COMPLETE — ITERATIVE IMPROVEMENT PHASE

The 2026-04-06 overhaul shipped a premium dark UI with glass morphism, rarity glows, and proper component structure. The foundation is solid. Your job now is to find everything that can be better and make it better.

**Nothing is ever "done." There is always work. Find it.**

---

## Vision

A 2D browser card game with AI-generated unique cards, persistent world state via SpacetimeDB, and smart AI bots. The visual design must be **indistinguishable from a professionally made indie game**. No student-project aesthetics. No AI-slop patterns. No Tailwind defaults. No placeholder everything.

This is a product you can demo to anyone and have them say "this is actually impressive."

---

## Current State (2026-04-07 Evening)

### What Works ✅
- Premium dark UI with rarity glows, glass morphism, proper typography
- Full board game logic (deck, hand, field, turn phases, win conditions)
- Bot AI with 3 difficulty levels (easy/medium/hard)
- Elo rating system, card trading, matchmaking
- SpacetimeDB integration (Rust WASM module, live queries)
- WASM build passes, cargo tests green
- PackOpening component styling matches premium dark UI
- DailyCardGenerator styling matches premium dark UI
- GameBoard accurately displays player hands from SpacetimeDB state
- Navigation uses proper SVG icons (lucide-react) instead of emoji
- EnhancedCard stats area uses SVG icons (Swords/Shield/Target) instead of emoji
- CollectionGallery loading/empty states use SVG card/search icons instead of emoji
- All game components use lucide-react SVG icons (no emoji in game/ component tree)
- GameLobby navigates to game board after starting a match (poll-based match detection)
- Skeleton loaders for GameBoard and CollectionGallery during loading states
- Fallback image generation works seamlessly when MiniMax fails or is unconfigured

### Image Generation 🟡
- `generate-card-image` API route IS correctly wired for MiniMax (`api.minimax.io/v1/image_generation`)
- `MINIMAX_API_KEY` is present in `.env.local` but the API call may fail natively. App falls back to Picsum images using the card name as a seed if MiniMax is unavailable.
- Generating a card works, and the fallback image URL loads correctly.

### Still Needs Improvement
- Card hover animations — could be smoother and have better easing.
- Card flip animation — needs to feel more physical with better timing.
- Game board polish — card zones could be more clearly defined. Placement could feel more tactile.
- Error states — what happens when image fails to load? When API times out?

---

## Ongoing Work Priorities

### P1 — Should Improve
1. **Card hover animations** — do they feel satisfying? Smooth? Do they have the right easing?
2. **Card flip animation** — does it feel physical? Is the timing right?
3. **Game board polish** — are card zones clearly defined? Does placement feel tactile?
4. **Error states** — what happens when image fails to load? When API times out?

### P2 — Nice to Have
1. **Ambient sound effects** (optional, later)
2. **Particle effects** on card actions
3. **Card collection counter** with animated increment
4. **Match-end animation** — victory/defeat screen
5. **Custom scrollbar** matching dark theme
6. **Cursor styles** — should feel like a game, not a webpage

---

## Agent Instructions

**creature (aimonsters) — ITERATIVE IMPROVEMENT AGENT**

Your job is to continuously find and fix ugly/broken things. You are not waiting for instructions. You are looking at the app and fixing what you see.

**Every cycle, in this order:**

1. **Test what exists** — open the app, play through a game, browse collection, open packs
   ```
   cd /home/ubuntu/.openclaw/workspace-aimonsters/ai-monsters/client && npm run dev
   ```
   Browser: `browser(action=navigate, url=http://localhost:3000)`
   Resize: `browser(action=act, kind=resize, width=1440, height=900)`

2. **Find 3 things to improve** — look critically:
   - Anything that looks like Tailwind defaults?
   - Anything that looks generic/AI-slop?
   - Any interactive element that feels janky?
   - Any state (loading, empty, error) that looks unfinished?
   - Any animation that's too fast, too slow, or missing?

3. **Fix one thing thoroughly** — pick the highest-impact item from step 2
   - Rewrite the component properly
   - Test it works
   - Commit

4. **Look for missing features** — what would make this feel like a real product?
   - Social features? Share card to image?
   - Card rarity badges that glow?
   - Animated card backgrounds?
   - Season/collection progression?
   Don't add features without checking with PLAN.md first.

5. **Check image gen** — if MINIMAX_API_KEY is now set:
   - Test generating a card image
   - Verify it loads in collection
   - If broken, debug why

**Reporting:** Report to #monster-ai Discord (channel=discord, target=channel:1487735786861494272). No emojis. What you tested, what you found, what you fixed. 5-8 lines.

---

## Environment

```
cd /home/ubuntu/.openclaw/workspace-aimonsters/ai-monsters
cd client && npm run dev    # Frontend on :3000
cd server && cargo run      # SpacetimeDB on :3001
```

Agent workspace: `/home/ubuntu/.openclaw/workspace-aimonsters/`

---

## What NOT to do

- Do NOT add new game mechanics (game logic is complete)
- Do NOT refactor the backend (SpacetimeDB/Rust is solid)
- Do NOT ignore ugly things — fix them
- Do NOT use AI to generate code without reviewing it for "AI slop" patterns

---

_Last updated: 2026-04-07 16:03 UTC_

## Iterative Polish Updates (2026-04-07 Later)
1. Created skeleton loaders `GameBoardLoading` and `CollectionGalleryLoading`.
2. Added these to `GameBoard` and `CollectionGallery` so they display while `loading` is true and data is empty, replacing the raw spinner elements or awkward empty renders with premium atmospheric UI block elements.

## Iterative Polish Updates (2026-04-07 Late)
3. Enhanced `EnhancedCardGenerator` to feel like an authentic, game-native feature instead of a web app placeholder.
4. Synced the navigation polling loop in `src/components/game/GameLobby.tsx` to restore functionality to "Play vs AI Bot."

## Iterative Polish Updates (2026-04-08 Early AM)
5. **Leaderboard.tsx full rewrite** — Entire component was using white/light theme backgrounds (`bg-white`, `bg-gray-50`, `bg-gray-100`, `bg-gray-200`) which broke immersion on the dark game UI. Rewrote with glass-morphism dark theme matching the rest of the app. Each rank tier now has its own accent color with glow effects. Sort buttons redesigned as dark pill controls with lucide icons. Podium-style player rows with left-border accent for top 3. Win-rate badge color-coded (green/yellow/red). Empty state with trophy icon.

6. **Ongoing issues to fix:**
   - CollectionGallery header/stats section still uses `bg-black/30` instead of glass-card styling
   - DailyCardGenerator: "Claim Today's Card" reads existing cards instead of generating a new daily card
   - MainNavigation active tab indicator could be stronger (only 2px bottom border)

## Iterative Polish Updates (2026-04-08 Early AM Session 2)
7. **Emoji replaced with lucide-react SVG icons across all game components** — The `src/components/game/` component tree (imported by `app/page.tsx`) used emoji throughout, not lucide icons. Replaced: MainNavigation (Sparkles/Swords/BookOpen/Gift/CalendarDays/Trophy), CollectionGallery (BookOpen, Search), Leaderboard (Trophy), GameLobby (Bot/Swords/Globe/Search/X/FileText), GameGenerator (Sparkles/Gift/Layers), PackOpening (Gift). Note: `src/components/MainNavigation.tsx` with lucide icons existed but was not imported — the active file was `src/components/game/MainNavigation.tsx` with emoji.
## Iterative Polish Updates (2026-04-08 Morning)
8. **DailyCardGenerator wired** — It was previously stubbed out to just read an existing card. Rewrote to call the AI pipeline (description + MiniMax) and save the new card to SpacetimeDB.
9. **Emoji removal complete** — Replaced remaining emojis (sparkles, joker, swords, shield) with lucide-react icons in GameBoard, EnhancedCard, EnhancedCardGenerator, and CollectionGallery.
## Iterative Polish Updates (2026-04-08 Late Afternoon)
10. **MainNavigation tabs active state**: Redesigned `.nav-tab.active` to use a premium, recessed button effect with glowing top/bottom gradients, inner shadow, and box-shadow styling.
