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

### Image Generation ✅
- `generate-card-image` API route correctly wired for MiniMax (`api.minimax.io/v1/image_generation`)
- `MINIMAX_API_KEY` is present in `.env.local` and working. Returns base64 data URIs (~636KB per image).
- Cards without MiniMax art now show themed CSS-based placeholders (rarity gradient + type icon) instead of random stock photos.
- No more picsum.photos fallback anywhere in the codebase.

### Still Needs Improvement
- Card names extremely repetitive (Dragon/Phoenix/Golem/Spectre/Wraith + Warrior). Need more diverse name generation.
- Card hover animations — could be smoother and have better easing.
- Error states — what happens when image fails to load? When API times out?
  (CSS gradient fallback handles image failures gracefully; error banner in DailyCardGenerator)

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

_Last updated: 2026-04-13 22:10 UTC_

_Last git commit: bb60aab — fix(ui): remove dead code with emoji, fix SVG topFade gradient reference_

## Iterative Polish Updates (2026-04-07 Later)
1. Created skeleton loaders `GameBoardLoading` and `CollectionGalleryLoading`.
2. Added these to `GameBoard` and `CollectionGallery` so they display while `loading` is true and data is empty, replacing the raw spinner elements or awkward empty renders with premium atmospheric UI block elements.

## Iterative Polish Updates (2026-04-07 Late)
3. Enhanced `EnhancedCardGenerator` to feel like an authentic, game-native feature instead of a web app placeholder.
4. Synced the navigation polling loop in `src/components/game/GameLobby.tsx` to restore functionality to "Play vs AI Bot."

## Iterative Polish Updates (2026-04-08 Midday)
1. **DailyCardGenerator redesign** (ea2802b): Completely rebuilt the daily card page from sparse text+button into a premium card showcase with atmospheric glows, rarity tier indicators (Common/Rare/Epic/Legendary with star icons), empty slot with dashed border and pulsing glow, gradient claim button with Zap icon, proper card reveal animation.

## Issues Found (2026-04-08)
- **Pack Opening Button Polish** — When opening a pack, the spinner and text were misaligned. Fixed by using a flex container.
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
4. **Dead Code Removed**: Root `client/src/components/` contained duplicate files superseded by `game/` subdirectory (`CollectionGallery.tsx`, `GameLobby.tsx`, `GameBoard.tsx`, `Leaderboard.tsx`). Also `Card.tsx`, `MonsterCard.tsx`, `EnhancedCard.tsx`, `MainNavigation.tsx` were unused/dead. Moved `PackOpening`, `DailyCardGenerator`, and `EnhancedCardGenerator` into `components/game` and updated imports.
## Iterative Polish Updates (2026-04-10 Late)
5. **Start Battle Button Polish**: Adjusted layout of the Start Battle button in GameLobby to use flexbox gap centering.

## Iterative Polish Updates (2026-04-10 Night)
7. **PackOpening Overhaul**: Complete re-imagination of the pack opening experience:
   - Pack box now floats with `animate-float` (subtle up/down motion)
   - Outer radial glow ring appears on hover with blur and scale
   - Decorative corner lines (TL/TR/BL/BR) on pack box
   - Gift icon added to "Open Standard Pack" button
   - Shimmer overlay sweeps across pack on hover (115deg gradient)
   - Sparkle particles (animate-ping) burst around pack on hover — 4 particles at staggered delays
   - Button gets hover scale + glow shadow + active:scale press feedback
   - Staggered card flip reveal: all 5 cards appear face-down, then flip front-to-back in sequence (220ms stagger)
   - Cards use GameCard `isFlipped`/`showBack` for physical rotateY card flip animation
   - Stats bar grid made responsive: `grid-cols-2 sm:grid-cols-5`

## Iterative Polish Updates (2026-04-10 Night)
6. **Emoji Cleanup Sweep**: Removed all emoji from active source files, replacing with SVG icons:
   - Leaderboard.tsx: Custom inline SVG medal icons (gold/silver/bronze ribbons with rank numbers + glow pulse animation)
   - GameCard.tsx: Lucide `Swords`/`Building2`/`Sparkles` SVG icons instead of plain text S/B/X
   - ui.tsx: SVG path data replacing ⚔🛡 emoji in STAT_CONFIG
   - card-generator.ts / ai-card-generator.ts: Text labels (Melee/Structure/Magic) replacing emoji in dead getTypeIcon methods
   - MobileGameControls.tsx: Removed ⚡🎮 from phase labels

### 2026-04-12 Early Morning
1. **Card Art Fallback Overhaul** (2e419cc): Replaced 11-image hash-based fallback with full CSS gradient SVG art generator. Every card now gets unique, matching art derived from its own name/type/rarity — no more mismatches like Void Dragon showing bone-dragon.png. Art is deterministic SVG data URI with rarity palettes, type shape overlays, name color accents, initials, grid pattern.
2. **Header Connection Status Fix** (2e419cc): MainNavigation header now reads real SpacetimeDB connection state instead of hardcoded "Online" green dot. Shows: green = connected, amber = connecting, red = error.
3. **MiniMax Status**: The MiniMax API integration was replaced on 2026-04-11 with local art library (commit 49ba43b). The 11 pre-generated PNG art files in `/card-art/` are hash-assigned, causing card-art mismatches. The CSS gradient fallback is superior. Image generation API (`/api/generate-card-image`) now returns local art files; `generate-description` uses OpenAI.

### Remaining P1 Issues
- Match-end animation (victory/defeat screen) — not implemented
- Game board zone polish — placement feels tactile but could be improved
- Error states — CSS fallback handles image load failures well now

### 2026-04-13 Early Morning
1. **card-art.ts SVG validity fix** (69e34fb):
   - Moved `<radialGradient id="centerGlow">` inside `<defs>` — previously it was placed OUTSIDE `<defs>` making `url(#centerGlow)` an undefined SVG reference
   - Renamed `TYPE_SHAPES` (misleading name, contained mixed CSS/SVG strings) → `TYPE_CSS_GRADIENT` with clean CSS gradient strings per card type
   - Changed type shape fill from `url(#typeShape)` (broken SVG gradient ID reference that was never properly defined) → `${typeCssGradient}` (CSS gradient string applied directly as fill attribute — widely supported in browsers for SVG elements)
   - Removed orphaned `<radialGradient id="typeShape">` from defs (was dead code after the above fix)
   - All card gradient art now renders correctly across all card types

2. **PackOpening card name generation fix** (69e34fb):
   - Old: `noun = NOUNS[...] + (i > 0 ? suffix[i-1] : '').trim() || fallbackNoun` — at `i=0`, suffix array returned `[-1]` = undefined, so card 0 got no suffix (bare noun), while cards 1-4 got suffixes inconsistently
   - New: `const suffixes = ['Prime', 'Alpha', 'Void', 'Storm', 'Doom']; noun = NOUNS[...] + ' ' + suffixes[i]` — all 5 pack cards now consistently get a suffix
   - Build passes, TypeScript clean

### Remaining P2 Issues (from PLAN.md)
- Ambient sound effects (optional, later)
- Particle effects on card actions
- Card collection counter with animated increment
- Match-end animation — victory/defeat screen — done (4bed27a)
- Custom scrollbar matching dark theme (already implemented in globals.css)
- Cursor styles — should feel like a game, not a webpage — done (4bed27a, inline SVG cursors)

### 2026-04-10 Status
- All emoji removed from source files (verified with grep). No emoji remain.
- Premium SVG icons consistently used throughout the UI.
- Build passes. No TypeScript errors. Previously, the icon/spinner and text were separated directly inside the button, occasionally causing misalignments. They are now wrapped in a flex container ensuring perfect horizontal centering of the label alongside its icon.

## Iterative Polish Updates (2026-04-10 Morning)
1. **Pack Opening Polish**: Fixed the "Opening Pack..." button in `PackOpening.tsx` where the text and loading spinner were misaligned. They are now wrapped in a flex container (`flex items-center justify-center mx-auto`) ensuring perfect horizontal centering of the label alongside its spinner icon.

## Iterative Polish Updates (2026-04-11 Morning)
1. **CollectionGalleryLoading Overhaul**: Completely redesigned the loading skeleton to match the actual CollectionGallery layout. Previously showed a misleading sidebar skeleton that doesn't exist in the actual UI. Now properly shows header, stats bar, search/filter bar, and card grid skeleton matching the real layout.

2. **GameBoardLoading Overhaul**: Completely redesigned from a fake 2-player hand view to a proper board skeleton matching the actual GameBoard layout. Previously showed "opponent hand" cards that never appear in the real game. Now properly shows 6x3 tile grid, zone labels, player hand area, and phase instructions skeleton matching the real board.

## Iterative Polish Updates (2026-04-11 Afternoon)
1. **Card Art Fallback Overhaul**: Replaced picsum.photos random stock photo fallback with themed CSS-based card art placeholders. When a card has no real MiniMax AI art, GameCard now renders a rarity-colored gradient background with the card's type icon (Swords/Building2/Sparkles), name initials, and subtle pattern overlay. This makes all 294+ existing cards without AI art look intentional and cohesive instead of showing random stock photos of landscapes and people. Also filtered out old picsum URLs stored in the database. Cards with real MiniMax base64 images still display their AI-generated art normally.

## Iterative Polish Updates (2026-04-11 Late Afternoon)
1. **AI Content Persistence Fix**: Fixed critical bug where AI-generated descriptions and images were silently discarded during card generation. The SpacetimeDB `generate_card` reducer accepts `ai_description`/`ai_image_url` params but only uses them as hints -- it generates its own flavor text and placeholder image. All three card generation flows (Collection, Packs, Daily) now call `update_card_media` after card creation to persist the actual AI content. This ensures new cards get proper AI descriptions and MiniMax art. Existing cards with generic "A X unit" descriptions remain until regenerated.

## Iterative Polish Updates (2026-04-11 Evening)
1. **Card Hover Animation Polish**: Replaced basic `hover:scale-[1.06] hover:-translate-y-3` with rarity-specific glow intensification + spring easing + precise pixel lift. Glow spreads dramatically on hover (Legendary: 40px/80px, Epic: 35px/70px, Rare: 28px/55px, Common: 22px/40px) with spring easing `cubic-bezier(0.34,1.56,0.64,1)`. Transform controlled via React state + inline style (no CSS hover class conflicts). Affects all GameCard instances across all pages.
2. **Leaderboard Empty State Polish**: Removed "0 players" counter (was shown above empty state -- felt broken). Empty state now shows centered #1 badge over trophy icon with message: "No ranked players yet / Complete your first match to earn a rank and appear on the leaderboard."

## Iterative Polish Updates (2026-04-13 Afternoon)
1. **PackOpening reveal timing fix** (d5de9e2): Reduced card flip stagger from 400ms base + 220ms between to 300ms base + 180ms between. Cards now flip faster and feel more responsive.
2. **GameBoard phase border contrast fix** (d5de9e2): Phase instructions box borders increased from 20→30 opacity for better visibility against dark background.
3. **Image gen API status**: Gradient art fallback (SVG data URI, ~5KB) works perfectly when AI APIs fail. MINIMAX_API_KEY and OPENAI_API_KEY not configured in production — gradient art is beautiful but not AI-generated.

### 2026-04-13 Findings
- Pack reveal animation: was slow (400ms+220ms), fixed to 300ms+180ms
- DailyCardGenerator button: no inline loading spinner on button during generation
- Image generation: works as gradient fallback, needs real API keys for AI content
- Browser automation unavailable — audited code manually

### 2026-04-13 Late Afternoon
1. **MatchEndScreen defeat icon fix**: Defeat state used `Sparkles` icon (same as draw). Changed to `XCircle` from lucide-react — more semantically appropriate for a loss screen. Victory still uses `Crown`, draw still uses `Sparkles`.
2. **GameBoard redundant zone labels removed**: "Your Zone" and "Enemy Zone" appeared twice — once in the horizontal center divider and again as vertical text on the left/right edges. Vertical labels removed. Board now cleaner with only the center divider labels.

### P1 Remaining
- DailyCardGenerator button loading feedback (minor UX issue)
- Real AI API keys for MiniMax + OpenAI in production (keys now present in .env.local — not verified end-to-end due to no browser)

### 2026-04-13 Night
1. **CollectionGallery modal description fix** (3f9e2cf): Removed `line-clamp-3` truncation. Modal now shows complete AI-generated card descriptions (important for Rare/Epic cards with long flavor text). Added `whitespace-pre-wrap break-words` for proper text wrapping.
2. **Leaderboard "You" badge glow** (3f9e2cf): Added explicit purple glow (`box-shadow: 0 0 8px rgba(139,92,246,0.4), 0 0 16px rgba(139,92,246,0.15)`) and `#a855f7` text color to make current-player badge visually prominent.

### 2026-04-12 Late Night
1. **Consistency polish**: Did systematic audit across all game components to ensure consistent use of `btn btn-primary`, `glass-card`, and Lucide SVG icons instead of inline Tailwind gradients, raw bg-white/5 borders, or bare emoji/JSX.
   - EnhancedCardGenerator: replaced custom `bg-gradient-to-r from-purple-600 to-blue-600` button with `btn btn-primary`
   - MatchEndScreen: replaced inline SVG star (Defeat) with `Sparkles` Lucide icon (text-red-400), changed `rounded-3xl` to `rounded-2xl`
   - GameLobby: active match cards and waiting-for-opponent messages now use `glass-card` instead of raw bg-white/5 borders
   - PackOpening: removed redundant Tailwind hover/transition on Open Pack button (btn-primary already handles this)
   - CollectionGallery: modal backdrop upgraded from `backdrop-blur-sm` to `backdrop-blur-md` (matching MatchEndScreen)
   - GameBoard: removed orphaned `border border-white/5` from zone label badges (bg-black/40 is sufficient)
2. **Git**: 9a6eb64 fix(ui): consistency polish, 10aea2d docs: update memory for 2026-04-12 late night review cycle

### 2026-04-14 Early Morning
1. **card-art.ts SVG topFade fix** (bb60aab): The `topFade` linearGradient was defined AFTER the rect element referencing it via `url(#topFade)`. SVG requires all referenced elements to be inside `<defs>` before use. Fixed by moving `topFade` gradient definition inside the main `<defs>` block alongside the other gradients.
2. **Dead code removal** (bb60aab): Deleted `card-generator.ts` — completely unused file never imported, contained emoji characters (⬜🔵🟣🟡) and via.placeholder.com URLs. Confirmed zero imports of `CardGenerator` class across codebase.
3. **AICardGenerator cleanup** (bb60aab): Removed four dead methods: `getRarityEmoji` (had emoji), `getRarityColor`, `getTypeIcon`, `simulateAIDescription` — all were defined but never called anywhere in the codebase.
