# AI Monsters - Project Plan

## Current State: 2026-04-05 19:02 UTC. All builds pass. Git head: 4750b53.
- cargo check + clippy: PASS
- npm run build: PASS

### DailyCardGenerator (2b44496) - DONE
- useDailyCards hook: subscribes to cards table, filters today's cards
- claimDailyCard() calls generate_daily_cards reducer then enhances each new card via AI APIs
- DailyCardGenerator.tsx rewired from localStorage to SpacetimeDB persistence
- Shows AI enhancing state while descriptions/images are generated

### Build Status
- cargo check: PASS
- cargo clippy -- -D warnings: PASS
- cargo build --target wasm32-unknown-unknown --release: PASS
- npm run build: PASS (Next.js 16.2.1, Turbopack)
- 15 unit tests passing

### Honest Assessment

**Server (Rust + SpacetimeDB 2.1.0):**
- All tables and reducers implemented with ownership validation
- Win condition (check_win) checks board + hand cards
- WASM-compatible (ctx.timestamp, no SystemTime::now())
- AI pipeline wired: generate_card accepts ai_description + ai_image_url
- Rate limiting on AI endpoints (10 req/min description, 5 req/min image)
- Bot AI wired to reducers via start_single_player_match and run_bot_turn
- update_rating reducer for Elo + XP/progression on match complete
- generate_daily_cards reducer wired to client via useDailyCards hook (2b44496)
- Cards are globally shared (no per-match deck ownership enforcement)

**Client (Next.js):**
- All hooks wired to SpacetimeDB (useMatches, useGame, useCards, useBotMatch, usePlayerIdentity)
- AI text pipeline: OpenAI ChatGPT-4o-mini via /api/generate-description
- AI image pipeline: MiniMax image-01 via /api/generate-card-image
- Leaderboard wired to SpacetimeDB player_progress table (0004919)
- Requires: OPENAI_API_KEY and MINIMAX_API_KEY in client/.env.local

### What's actually done
- Rust server compiles clean (cargo check + clippy: PASS)
- WASM build verified (release, wasm32-unknown-unknown)
- Board game logic with full ownership validation
- Win condition checks hand + board cards, wired to place/attack/end_turn
- player_hands table tracks cards in hand per match
- player_identities + client_connected + my_player identity system
- AI text + image pipelines wired to card creation flow
- DailyCardGenerator wired to SpacetimeDB + AI pipeline (2b44496)
- Rate limiting on AI endpoints
- Bot AI with Easy/Medium/Hard difficulty levels
- Matchmaking queue (human vs human, rating-based pairing)
- Elo/progression system wired to match completion
- Leaderboard shows real player_progress data from SpacetimeDB
- e2e two-player matchmaking test passing

### What's broken or missing (remaining)

**1. DailyCardGenerator.tsx stubbed** -- DONE (2b44496)
- Wires to generate_daily_cards reducer via useDailyCards hook
- AI description + image generation via /api endpoints
- update_card_media reducer updates SpacetimeDB with AI content

### Backlog (ordered by priority)
1. ~~Wire DailyCardGenerator to generate_daily_cards reducer + AI pipeline~~ DONE (2b44496)
2. ~~Add integration test for two-player match~~ DONE (0ce5fc4, verified afd1c8c)
3. ~~Regenerate SpacetimeDB bindings from live instance~~ DONE (afd1c8c)
4. ~~Wire update_rating to client~~ DONE (6679060)
5. ~~Elo/progression update after match completion~~ DONE (0bf2083)
6. ~~Wire bot_ai.rs to reducers~~ DONE (6cddd47)
7. ~~Wire matchmaking.rs to reducers~~ DONE (65d5c2c)
8. ~~Client-side bot integration~~ DONE (9d8e549)
9. ~~Card range clamp~~ DONE (90ba0ad)
10. ~~End-to-end game loop test~~ DONE (58c683c)
11. ~~Rate limiting on AI endpoints~~ DONE (abbd2a0)
12. ~~WASM timestamp panic fix~~ DONE (eb7cc4f)
13. ~~AI pipeline wiring~~ DONE (8db2414/dc98fc9)
14. ~~WASM build verification~~ DONE (dc98fc9)
15. ~~Leaderboard fake data~~ DONE (0004919)
16. ~~DraggableGameBoard dead code~~ DONE (0004919)

### Architecture Notes
- SpacetimeDB local: port 3001 (port 3000 occupied by Skilt)
- Card IDs use ctx.timestamp (microseconds) -- ctx.timestamp constant in loops use card_id
- generate_card reducer accepts optional ai_description and ai_image_url
- update_card_media reducer for post-creation AI content updates
- client/test/e2e-game-loop.ts requires SpacetimeDB Docker running
