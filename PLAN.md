# AI Monsters - Project Plan

## Current State: 2026-04-03 02:01 UTC. All builds pass. Git head: 58c683c.

### Critical Bug Fixed: WASM Timestamp Panic
- `current_timestamp()` and `generate_id()` used `SystemTime::now()` which panics in WASM
- Fixed: both now use `ctx.timestamp` (SpacetimeDB WASM-compatible)
- `init_match_hands` bug: ctx.timestamp is constant within one call, producing duplicate IDs
- Fixed: uses card_id as hand entry id (each card is unique)
- Verified via CLI: create_player, generate_card, create_match, init_match_hands, add_card_to_hand all work
- Full game loop (place_card, attack_card) requires SDK-based test due to ctx.sender() identity validation

### Honest Assessment

**Server (Rust + SpacetimeDB 2.1.0):**
- cargo check: PASS
- cargo clippy: PASS
- SpacetimeDB version: 2.1.0
- WASM build: VERIFIED (spacetime generate compiles to WASM successfully)
- Tables: players, cards, decks, game_matches, card_packs, player_hands, player_identities
- Reducers: client_connected, create_player, generate_card, update_card_media, create_deck, create_match, init_match_hands, add_card_to_hand, end_turn, generate_daily_cards, place_card, attack_card, flip_card, switch_card_mode, move_card
- Win condition: check_win() checks board tiles AND hand counts
- Ownership validation on all board action reducers
- #[reducer(init)] present
- generate_card accepts optional ai_description and ai_image_url params
- AI text pipeline: /api/generate-description calls OpenAI ChatGPT-4o-mini (64177f5)
- AI image pipeline: /api/generate-card-image calls MiniMax image-01 API (64177f5)
- CollectionGallery wires AI endpoints before calling generate_card reducer (64177f5)
- Still missing: user must add API keys to .env.local
- E2E game loop test: PASSING (client/test/e2e-game-loop.ts)

**Client (Next.js):**
- npm run build: PASS (Next.js 16.2.1, Turbopack)
- SpacetimeDB SDK 2.1.0 installed
- useMatches, useGame, useCards hooks wired to SpacetimeDB
- GameLobby and GameBoard wired to SpacetimeDB reducers
- my_player subscription on connect, playerId exposed via SpacetimeDBProvider context (196a44a)
- CollectionGallery wired to SpacetimeDB via useCards hook
- AI text: OpenAI ChatGPT-4o-mini via /api/generate-description (64177f5)
- AI art: MiniMax image-01 via /api/generate-card-image (64177f5)
- Card creation flow: CollectionGallery -> AI endpoints -> SpacetimeDB generate_card with AI content
- update_card_media reducer available for post-creation AI updates (dc98fc9)
- Requires: OPENAI_API_KEY and MINIMAX_API_KEY in client/.env.local
- Still missing: (none - all core features wired)

**Git:** Push working. Head: 58c683c.

### SpacetimeDB config note
- Local SpacetimeDB runs on port 3001 (port 3000 occupied by Skilt)
- `spacetime publish --server local ai-monsters-test` to publish
- Generated bindings use camelCase accessor names (generateCard, placeCard, etc.)
- Cards table has NO owner_id column (cards are not owned by players)

### What's actually done
- Rust server compiles with SpacetimeDB tables and reducers (cargo check + clippy: PASS)
- WASM build VERIFIED: `spacetime generate` compiles to WASM successfully (dc98fc9)
- Board game logic (place, attack, flip, move, switch mode) wired through reducers with ownership validation
- Win condition: check_win() checks hand + board cards, wired to place_card + attack_card + end_turn
- player_hands table tracks cards in hand per player per match
- player_identities table + client_connected lifecycle reducer
- my_player and my_player_id views for identity lookup
- Client identity wiring: my_player subscription on connect, playerId in context (196a44a)
- generate_card accepts optional ai_description and ai_image_url params (dc98fc9)
- update_card_media reducer for post-creation AI content updates (dc98fc9)
- AI text pipeline wired: /api/generate-description calls OpenAI (64177f5)
- AI image pipeline wired: /api/generate-card-image calls MiniMax image-01 (64177f5)
- CollectionGallery wires AI endpoints before SpacetimeDB card creation (64177f5)
- Next.js client: useMatches + useGame + useCards hooks, GameLobby + GameBoard wired to SpacetimeDB
- TypeScript bindings regenerated with all reducer changes
- 15 unit tests PASS (check_win, BoardState, BoardTile, daily_cards)
- WASM timestamp bug FIXED: current_timestamp() and generate_id() now use ctx.timestamp instead of SystemTime::now()
- init_match_hands FIXED: uses card_id as hand entry id (was generating duplicate IDs within one call)
- e2e-game-loop.mjs test script added (client/test/) - requires SpacetimeDB client SDK to run game actions

### What's broken or missing (priority order)

**1. Card range stat is random (sometimes negative)**
- attack_card uses Manhattan distance + card.range to check range
- Cards generated with random range values including negatives, making attacks unpredictable
- Need to clamp range to 1-3 or use sensible defaults

**2. Cards table has no owner_id**
- Cards are not owned by any player -- any player can use any card
- Need owner_id field on CardRow or a separate ownership table

**3. AI pipeline needs API keys**
- /api/generate-description requires OPENAI_API_KEY in client/.env.local
- /api/generate-card-image requires MINIMAX_API_KEY in client/.env.local
- MiniMax falls back to picsum.photos if no API key

~~4. End-to-end game loop test~~ DONE (58c683c)
- client/test/e2e-game-loop.ts passes against local SpacetimeDB
- Tests: connect, card gen, match create, hand init, place, turn switch, attack

~~5. No rate limiting on AI endpoints~~ DONE (abbd2a0)

### Backlog (ordered by priority)
1. Fix card range stat (clamp to sensible values)
2. Add owner_id to cards table
3. ~~End-to-end game loop test~~ DONE (58c683c)
2. ~~Add rate limiting to /api/generate-description and /api/generate-card-image~~ DONE (abbd2a0)
3. ~~Wire real AI model to /api/generate-description~~ DONE (64177f5)
4. ~~Wire MiniMax image generation to card creation flow~~ DONE (64177f5)
5. ~~Client calls update_card_media after AI generation completes~~ DONE (64177f5)
6. ~~WASM build test~~ DONE (acf504f)
7. ~~Add update_card_media reducer~~ DONE (dc98fc9)
8. ~~Enhance generate_card with AI params~~ DONE (dc98fc9)
9. ~~Add SpacetimeDB SDK to client, generate bindings~~ DONE
10. ~~Wire CollectionGallery to SpacetimeDB~~ DONE
11. ~~Implement win condition~~ DONE
12. ~~Wire game UI to SpacetimeDB~~ DONE
13. ~~Identity management (client_connected + player_identities)~~ DONE
14. ~~Fix subscription cross join~~ DONE (two separate subscriptions)
15. ~~Player ownership validation on board reducers~~ DONE
16. ~~#[reducer(init)] for database initialization~~ DONE
17. ~~Remove dead GameState code~~ DONE
18. ~~Unit tests for game logic~~ DONE (17 tests)
19. ~~Wire client identity (my_player subscription on connect)~~ DONE (196a44a)
20. ~~Wire AI text + image endpoints into card creation flow~~ DONE (8db2414)
21. ~~Fix WASM timestamp panic (current_timestamp + generate_id)~~ DONE (eb7cc4f)
22. ~~Fix init_match_hands duplicate ID bug~~ DONE (eb7cc4f)
23. ~~Remove dead random_f32() from lib.rs~~ DONE (eb7cc4f)
