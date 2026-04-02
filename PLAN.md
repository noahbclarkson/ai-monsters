# AI Monsters - Project Plan

## Current State: 2026-04-02 19:45 UTC. All builds pass. 17 unit tests PASS. Git head: 64177f5.

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
- Still missing: end-to-end game loop test, user must add API keys to .env.local

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
- Still missing: end-to-end game loop test

**Git:** Push working. Head: b4b47cf.

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

### What's broken or missing (priority order)

**1. End-to-end game loop test**
- 15 unit tests for game logic but no integration test
- Need: create_match -> init_match_hands -> place_card -> attack_card -> end_turn -> win detection
- Would require running SpacetimeDB Docker instance

**2. AI/Art pipeline - partially complete**
- /api/generate-description now calls OpenAI ChatGPT-4o-mini (64177f5)
- /api/generate-card-image now calls MiniMax image-01 API (64177f5)
- Requires OPENAI_API_KEY and MINIMAX_API_KEY in client/.env.local
- MiniMax falls back to picsum.photos placeholder if no API key

**3. Dead code in lib.rs**
- SimpleRng struct + RNG thread_local + random_f32() function: only random_range() is used from this block (~20 lines)
- random_f32() is defined but never called anywhere; could be removed

### Backlog (ordered by priority)
1. End-to-end game loop test (requires SpacetimeDB Docker)
2. Remove dead random_f32() from lib.rs (~3 lines)
3. ~~Wire real AI model to /api/generate-description~~ DONE (64177f5)
4. ~~Wire MiniMax image generation to card creation flow~~ DONE (64177f5)
5. ~~Client calls update_card_media after AI generation completes~~ DONE (64177f5)
6. ~~WASM build test~~ DONE (dc98fc9)
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
18. ~~Unit tests for game logic~~ DONE
19. ~~Wire client identity (my_player subscription on connect)~~ DONE (196a44a)
20. ~~Wire AI text + image endpoints into card creation flow~~ DONE (64177f5)
