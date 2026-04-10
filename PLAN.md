# AI Monsters - Project Plan

## Status: UI OVERHAUL COMPLETE — ITERATIVE IMPROVEMENT PHASE

The 2026-04-06 overhaul shipped a premium dark UI with glass morphism, rarity glows, and proper component structure. The foundation is solid. Your job now is to find everything that can be better and make it better.

**Nothing is ever "done." There is always work. Find it.**

---

## Vision

A 2D browser card game with AI-generated unique cards, persistent world state via SpacetimeDB, and smart AI bots. The visual design must be **indistinguishable from a professionally made indie game**. No student-project aesthetics. No AI-slop patterns. No Tailwind defaults. No placeholder everything.

This is a product you can demo to anyone and have them say "this is actually impressive."

---

## Current State (2026-04-09 Evening)

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
- All emoji fully replaced with Lucide SVG icons across all active UI components
- GameLobby navigates to game board after starting a match (poll-based match detection)
- Skeleton loaders for GameBoard and CollectionGallery during loading states
- Fallback image generation works seamlessly when MiniMax fails or is unconfigured

### Image Generation 🟡
- `generate-card-image` API route IS correctly wired for MiniMax (`api.minimax.io/v1/image_generation`)
- `MINIMAX_API_KEY` is present in `.env.local` but the API call may fail natively. App falls back to Picsum images using the card name as a seed if MiniMax is unavailable.
- Generating a card works, and the fallback image URL loads correctly.

### Still Needs Improvement
- Card hover animations — could be smoother and have better easing.
- Card flip animation — was broken (rotate-y-180 Tailwind class doesn't exist), fixed with inline styles
- Game board polish — card zones could be more clearly defined. Placement could feel more tactile.
- Error states — what happens when image fails to load? When API times out?

---

## Ongoing Work Priorities

### P1 — Should Improve
1. **Card hover animations** — do they feel satisfying? Smooth? Do they have the right easing?
2. **Card flip animation** — fixed (was broken), verify flip feels physical
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

## Iterative Polish Updates (2026-04-08 Midday)
1. **DailyCardGenerator redesign** (ea2802b): Completely rebuilt the daily card page from sparse text+button into a premium card showcase with atmospheric glows, rarity tier indicators (Common/Rare/Epic/Legendary with star icons), empty slot with dashed border and pulsing glow, gradient claim button with Zap icon, proper card reveal animation.

## Issues Found (2026-04-08)
1. **Start Battle silently fails** — when playerId is null (client_connected hasn't fired), handlePlayVsBot returns early with no user feedback. Needs: error toast or visible disabled state.
2. **AI APIs failing** — Both MiniMax (1004 login fail) and OpenAI (401) return auth errors. App falls back gracefully to picsum.photos images and template descriptions.
3. **GameGenerator doesn't save to DB** — generates cards client-side only, never calls generateCard reducer.
## Iterative Polish Updates (2026-04-08 Afternoon)
10. **CollectionGallery backgrounds fixed** — Replaced `bg-black/30` with `glass-card` classes to match the global premium theme.
11. **EnhancedCard fully migrated** — Removed the `rarityEmoji` and `typeIcon` fallback from `CardGenerator`. Replaced with `Circle`, `Swords`, `TowerControl`, and `Wand2` from lucide-react with dynamic coloring for true SVG-based vector aesthetics without generic text emojis.

## Iterative Polish Updates (2026-04-08 Late Night)
1. **SpacetimeDB Identity Fix**: Fixed a critical bug in `spacetimedb.tsx` where the `playerId` was not being updated from the `my_player` or `player_identities` tables upon connection, causing the entire game lobby and matchmaking system to fail silently because the client didn't know who it was. The game is now playable again.
2. **MiniMax Image Generation Integration Fix**: The MiniMax API updated its response format for `image-01` to return `base64_images` instead of URLs. We updated `/api/generate-card-image/route.ts` to parse this base64 payload and return it directly to the frontend as a `data:image/jpeg;base64,...` URI, completely bypassing the need for a complex OSS bucket CORS proxy. Image generation now works seamlessly with the provided API key.
3. **GameBoard Card Rendering Fix**: Fixed a bug where the game board was rendering hardcoded dummy `Card` components with 0 stats instead of the actual cards placed on the tiles. The board now correctly cross-references `tile.card_id` with `useCards()` to display the real generated cards with their stats and artwork during gameplay.
## Iterative Polish Updates (2026-04-09 Morning)
1. **GameLobby Start Battle Fix**: Updated `handlePlayVsBot` in GameLobby.tsx. Previously, if `playerId` was missing because the connection hadn't fully resolved the identity, the button would just silently return and do nothing. It now properly errors out, letting us know the identity needs resolving before starting the match.
## Iterative Polish Updates (2026-04-09 Afternoon)
1. **GameBoard Empty Tile Hover Polish**: Added a subtle, premium hover animation to empty board tiles. The previously static minimal cross now sits within a faintly glowing rounded container that softly expands and brightens on hover, improving tactile feedback when placing cards without cluttering the UI.

## Iterative Polish Updates (2026-04-10)
1. **GameBoard Zone Labels Fix**: Removed broken zone labels that were rendered inside individual tile divs with `absolute -top-6` (invisible due to overflow clipping). Enemy Zone label also used `x===3` which only covered row 3 instead of full enemy zone (rows 3-5). Replaced with a proper zone divider featuring centered zone name badges ("Your Zone" in green, "Enemy Zone" in red) with gradient separator lines, plus vertical side labels with gradient bars.
2. **GameLobby Hero Polish**: Added gradient text effect to "AI Monsters Arena" heading (purple-to-blue with drop shadow glow). Added `animate-float` for subtle floating motion. Added decorative divider (gradient lines with centered dot) below subtitle.
3. **Difficulty Selector Polish**: Added `glow` property to `DIFFICULTY_COLORS` config. Selected difficulty buttons now have a `box-shadow` glow matching their color, plus an inner radial glow layer for depth.
4. **Dead Code Identified**: Root `client/src/components/` contains duplicate files superseded by `game/` subdirectory (`CollectionGallery.tsx`, `GameLobby.tsx`, `GameBoard.tsx`, `Leaderboard.tsx`). Also `Card.tsx`, `MonsterCard.tsx`, `EnhancedCard.tsx` are unused/dead. Only `EnhancedCardGenerator.tsx` and `DailyCardGenerator.tsx` at root level are active (imported by MainNavigation).
## Iterative Polish Updates (2026-04-10 Late)
5. **Start Battle Button Polish**: Adjusted layout of the Start Battle button in GameLobby to use flexbox gap centering. Previously, the icon/spinner and text were separated directly inside the button, occasionally causing misalignments. They are now wrapped in a flex container ensuring perfect horizontal centering of the label alongside its icon.
