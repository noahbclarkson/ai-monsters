# AI Monsters - Project Plan

## Current State: 2026-04-04 07:40 UTC. All builds pass. Project feature-complete. Git head: afd1c8c.

### Build Status
- cargo check: PASS
- cargo check: PASS
- cargo clippy -- -D warnings: PASS
- cargo build --target wasm32-unknown-unknown --release: PASS
- npm run build: PASS (Next.js 16.2.1, Turbopack)
- Git head: afd1c8c

### Honest Assessment

**Server (Rust + SpacetimeDB 2.1.0):**
- All tables and reducers implemented with ownership validation
- Win condition (check_win) checks board + hand cards
- WASM-compatible (ctx.timestamp, no SystemTime::now())
- AI pipeline wired: generate_card accepts ai_description + ai_image_url
- Rate limiting on AI endpoints (10 req/min description, 5 req/min image)
- Bot AI wired to reducers via start_single_player_match and run_bot_turn
- bot_players table tracks bot identity and difficulty
- Three AI levels: Easy (random), Medium (center-preferring), Hard (positional)
- MatchCtx helper struct for bot action execution
- update_rating reducer for Elo + XP/progression on match complete
- update_rating wired to client (useBotMatch detects Completed match, calls reducer)
- Cards are globally shared (no per-match deck ownership enforcement)

**Client (Next.js):**
- All hooks wired to SpacetimeDB (useMatches, useGame, useCards, my_player)
- AI text pipeline: OpenAI ChatGPT-4o-mini via /api/generate-description
- AI image pipeline: MiniMax image-01 via /api/generate-card-image
- Requires: OPENAI_API_KEY and MINIMAX_API_KEY in client/.env.local

**Git:** Push working. Head: 7716411.

### What's actually done
- Rust server compiles clean (cargo check + clippy: PASS)
- WASM build verified (release, wasm32-unknown-unknown)
- 15 unit tests passing
- Board game logic with full ownership validation
- Win condition checks hand + board cards, wired to place/attack/end_turn
- player_hands table tracks cards in hand per match
- player_identities + client_connected + my_player identity system
- AI text + image pipelines wired to card creation flow
- Rate limiting on AI endpoints
- e2e game loop test passing
- SpacetimeDB local on port 3001

### What's broken or missing

**1. Bot AI wired** (6cddd47)
- start_single_player_match creates bot player, match, hands
- run_bot_turn computes and executes bot actions by difficulty
- game_matches uses current_turn + bot_players table for bot turn detection

**2. Matchmaking wired** (65d5c2c)
- matchmaking_entries table persists queue entries
- player_progress table for Elo/progression tracking
- join_matchmaking_queue reducer (prefers Bot/Human/Any; bot immediately starts match)
- leave_matchmaking_queue reducer
- process_matchmaking reducer (pairs human vs human within ±200 rating)
- draw_card reducer to move cards from deck to hand
- Bot matches: join_matchmaking_queue -> start_bot_match immediately
- Human matches: process_matchmaking periodically pairs queued players

**3. Dead code cleanup (low priority)** -- DONE (already cleaned up in prior sessions)

### Backlog (ordered by priority)
1. ~~Add integration test for two-player match~~ DONE (0ce5fc4, verified afd1c8c)
2. ~~Regenerate SpacetimeDB bindings from live instance~~ DONE (afd1c8c)
3. ~~Wire update_rating to client~~ DONE (6679060)
4. ~~Elo/progression update after match completion~~ DONE (0bf2083)
5. ~~Wire bot_ai.rs to reducers~~ DONE (6cddd47)
6. ~~Wire matchmaking.rs to reducers~~ DONE (65d5c2c)
7. ~~Client-side bot integration~~ DONE (9d8e549)
8. ~~Card range clamp~~ DONE (90ba0ad)
9. ~~End-to-end game loop test~~ DONE (58c683c)
10. ~~Rate limiting on AI endpoints~~ DONE (abbd2a0)
11. ~~WASM timestamp panic fix~~ DONE (eb7cc4f)
12. ~~AI pipeline wiring~~ DONE (8db2414/dc98fc9)
13. ~~WASM build verification~~ DONE (dc98fc9)

### Architecture Notes
- SpacetimeDB local: port 3001 (port 3000 occupied by Skilt)
- Card IDs use ctx.timestamp (microseconds) -- ctx.timestamp constant in loops use card_id
- generate_card reducer accepts optional ai_description and ai_image_url
- update_card_media reducer for post-creation AI content updates
- client/test/e2e-game-loop.ts requires SpacetimeDB Docker running
