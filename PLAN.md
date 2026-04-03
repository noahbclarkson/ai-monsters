# AI Monsters - Project Plan

## Current State: 2026-04-03 06:04 UTC. All builds pass. Git head: 6cddd47.

### Build Status
- cargo check: PASS
- cargo clippy -- -D warnings: PASS
- cargo test: 15 PASS
- cargo build --target wasm32-unknown-unknown --release: PASS
- npm run build: PASS (Next.js 16.2.1, Turbopack)
- e2e game loop test: PASS (client/test/e2e-game-loop.ts)

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
- Cards are globally shared (no per-match deck ownership enforcement)

**Client (Next.js):**
- All hooks wired to SpacetimeDB (useMatches, useGame, useCards, my_player)
- AI text pipeline: OpenAI ChatGPT-4o-mini via /api/generate-description
- AI image pipeline: MiniMax image-01 via /api/generate-card-image
- Requires: OPENAI_API_KEY and MINIMAX_API_KEY in client/.env.local

**Git:** Push working. Head: 6cddd47 (up to date with origin/main).

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

**2. Matchmaking not wired** (matchmaking.rs exists but no reducer)
- No queue system to match players together
- Players must coordinate offline to start a match

**3. No integration tests beyond e2e-game-loop.ts**
- Only tests one-player scenario (place, attack, turn switch)

### Backlog (ordered by priority)
1. ~~Wire bot_ai.rs to reducers~~ DONE (6cddd47)
2. Wire matchmaking.rs to reducers (add player queue + match pairing)
3. Client-side bot integration (detect bot turn, call run_bot_turn)
4. Add integration test for two-player match
5. ~~Card range clamp~~ DONE (90ba0ad)
5. ~~End-to-end game loop test~~ DONE (58c683c)
6. ~~Rate limiting on AI endpoints~~ DONE (abbd2a0)
7. ~~WASM timestamp panic fix~~ DONE (eb7cc4f)
8. ~~AI pipeline wiring~~ DONE (8db2414/dc98fc9)
9. ~~WASM build verification~~ DONE (dc98fc9)
10. ~~All prior items~~ DONE

### Architecture Notes
- SpacetimeDB local: port 3001 (port 3000 occupied by Skilt)
- Card IDs use ctx.timestamp (microseconds) -- ctx.timestamp constant in loops use card_id
- generate_card reducer accepts optional ai_description and ai_image_url
- update_card_media reducer for post-creation AI content updates
- client/test/e2e-game-loop.ts requires SpacetimeDB Docker running
