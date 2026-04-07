# AI Monsters - Project Plan

## Status: UI OVERHAUL COMPLETE — ITERATIVE IMPROVEMENT PHASE

The 2026-04-06 overhaul shipped a premium dark UI with glass morphism, rarity glows, and proper component structure. The foundation is solid. Your job now is to find everything that can be better and make it better.

**Nothing is ever "done." There is always work. Find it.**

---

## Vision

A 2D browser card game with AI-generated unique cards, persistent world state via SpacetimeDB, and smart AI bots. The visual design must be **indistinguishable from a professionally made indie game**. No student-project aesthetics. No AI-slop patterns. No Tailwind defaults. No placeholder everything.

This is a product you can demo to anyone and have them say "this is actually impressive."

---

## Current State (2026-04-07 Afternoon)

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
- Fallback image generation works seamlessly when MiniMax fails or is unconfigured

### Image Generation 🟡
- `generate-card-image` API route IS correctly wired for MiniMax (`api.minimax.io/v1/image_generation`)
- `MINIMAX_API_KEY` is present in `.env.local` but the API call may fail natively. App falls back to Picsum images using the card name as a seed if MiniMax is unavailable.
- Generating a card works, and the fallback image URL loads correctly.

### Still Needs Improvement
- Card hover animations — they are okay, but could be smoother and have better easing.
- Card flip animation — needs to feel more physical with better timing.
- Game board polish — card zones could be more clearly defined. Placement could feel more tactile.
- Loading states — async operations like Pack Opening have basic spinners, but could use skeleton loaders.
- Empty states — empty collection, empty deck, empty lobby need atmospheric touches.
- Error states — what happens when API times out?
- Mobile testing — verify resize to 375x812.

---

## Ongoing Work Priorities

### P1 — Should Improve
1. **Card hover animations** — do they feel satisfying? Smooth? Do they have the right easing?
2. **Card flip animation** — does it feel physical? Is the timing right?
3. **Game board polish** — are card zones clearly defined? Does placement feel tactile?
4. **Loading states** — every async operation needs a skeleton/spinner
5. **Empty states** — empty collection, empty deck, empty lobby — are they atmospheric or just blank?
6. **Error states** — what happens when image fails to load? When API times out?
7. **Mobile testing** — resize to 375x812, screenshot, fix what breaks

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
