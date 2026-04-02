# AI Monsters - Project Plan

## Current State: 2026-04-02 15:30 UTC. All builds pass. 15 unit tests PASS. Git head: dc98fc9.

### Honest Assessment

**Server (Rust + SpacetimeDB 2.1.0):**
- cargo check: PASS
- cargo clippy: PASS
- SpacetimeDB version: 2.1.0
- WASM build: VERIFIED (spacetime generate compiles to WASM successfully)
- Tables: players, cards, decks, game_matches, card_packs, player_hands, player_identities
- Reducers: client_connected, create_player, generate_card, update_card_media (NEW), create_deck, create_match, init_match_hands, add_card_to_hand, end_turn, generate_daily_cards, place_card, attack_card, flip_card, switch_card_mode, move_card
- generate_card now accepts optional ai_description and ai_image_url params
- update_card_media reducer enables post-creation AI content updates
- Win condition: check_win() checks board tiles AND hand counts
- Ownership validation on all board action reducers
- #[reducer(init)] present
- Still missing: real AI API calls in generate-description route, end-to-end game loop test

**Client (Next.js):**
- npm run build: PASS
- SpacetimeDB SDK 2.1.0 installed
- useMatches, useGame, useCards hooks wired to SpacetimeDB
- GameLobby and GameBoard wired to SpacetimeDB reducers
- Subscription query `SELECT * FROM game_matches, players` is a cross join (inefficient)
- **client_connected reducer NOT called on connect** -- identity auto-created on server but client never triggers it

**Git:** Push working. Head: 196a44a.

### What's actually done
- Rust server compiles with SpacetimeDB tables and reducers (cargo check + clippy: PASS)
- WASM build VERIFIED: `spacetime generate` compiles to WASM successfully (dc98fc9)
- Board game logic (place, attack, flip, move, switch mode) wired through reducers with ownership validation
- Win condition: check_win() checks hand + board cards, wired to place_card + attack_card + end_turn
- player_hands table tracks cards in hand per player per match
- player_identities table + client_connected lifecycle reducer
- my_player and my_player_id views for identity lookup
- generate_card accepts optional ai_description and ai_image_url params (dc98fc9)
- update_card_media reducer for post-creation AI content updates (dc98fc9)
- Next.js client: useMatches + useGame + useCards hooks, GameLobby + GameBoard wired to SpacetimeDB
- TypeScript bindings regenerated with all reducer changes
- 15 unit tests PASS (check_win, BoardState, BoardTile, daily_cards)

### What's broken or missing (priority order)

**1. End-to-end game loop test**
- 15 unit tests for game logic but no integration test
- Need: create_match -> init_match_hands -> place_card -> attack_card -> end_turn -> win detection
- Would require running SpacetimeDB instance

**2. AI/Art pipeline**
- Card descriptions are templates, not AI-generated
- /api/generate-description uses template-based simulation, not real AI
- Image URLs are placeholder paths
- update_card_media reducer exists but nothing calls it yet
- generate_card accepts ai_description/ai_image_url but client doesn't provide them
- MiniMax image-01 available via image_generate tool but not wired to client

**3. Dead code in lib.rs**
- SimpleRng struct, RNG thread_local, random_f32(): only random_range() is actually used
- ~20 lines. Not blocking anything but should clean up.

**4. Client-side AI integration**
- ai-card-generator.ts has the structure but generateCardImage just returns placeholder paths
- generateAIDescription calls /api/generate-description which uses templates
- Need: real AI API call for descriptions + MiniMax image generation call

### Backlog (ordered by priority)
1. End-to-end game loop test (requires SpacetimeDB Docker)
2. Wire real AI to /api/generate-description (replace templates with actual AI model call)
3. Wire MiniMax image generation to card creation flow
4. Client calls update_card_media after AI generation completes
5. Remove dead code from lib.rs (SimpleRng, random_f32, ~20 lines)
6. ~~WASM build test~~ DONE (dc98fc9: spacetime generate compiles to WASM)
7. ~~Add update_card_media reducer~~ DONE (dc98fc9)
8. ~~Enhance generate_card with AI params~~ DONE (dc98fc9)
9. ~~Add SpacetimeDB SDK to client, generate bindings~~ DONE
10. ~~Wire CollectionGallery to SpacetimeDB~~ DONE
11. ~~Implement win condition~~ DONE
12. ~~Wire game UI to SpacetimeDB~~ DONE
13. ~~Identity management (client_connected + player_identities)~~ DONE
14. ~~Fix subscription cross join~~ DONE
15. ~~Player ownership validation on board reducers~~ DONE
16. ~~#[reducer(init)] for database initialization~~ DONE
17. ~~Remove dead GameState code~~ DONE
18. ~~Unit tests for game logic~~ DONE
