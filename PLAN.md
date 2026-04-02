# AI Monsters - Project Plan

## Current State: 2026-04-02 12:32 UTC. All builds pass. 17 unit tests PASS. Git head: efc25af (efc25af = Update PLAN: mark WASM test done, game logic tests done). WASM build VERIFICATION FAILED: wasm-pack not installed, wasm32-wasip1 target fails to compile (zerocopy/typenum/serde_core errors). Dead code remains in lib.rs: Rarity, CardType, MatchStatus enums (~15 lines), SimpleRng/RNG/random_f32 (~20 lines). PLAN Current State section was stale (343ac56 vs actual efc25af).

### Honest Assessment (2026-04-01 evening)

**Server (Rust + SpacetimeDB 2.1.0):**
- cargo check: PASS
- cargo clippy: PASS
- Tables: players, cards, decks, game_matches, card_packs, player_hands, player_identities
- Reducers: client_connected, create_player, generate_card, create_deck, create_match, init_match_hands, add_card_to_hand, end_turn, generate_daily_cards, place_card, attack_card, flip_card, switch_card_mode, move_card
- Views: my_player, my_player_id (newly implemented in db7c8ac)
- Win condition: check_win() checks board tiles AND hand counts, wired to place_card + attack_card + end_turn
- Still missing: #[reducer(init)] for database initialization

**Client (Next.js):**
- npm run build: PASS
- SpacetimeDB SDK 2.1.0 installed
- useMatches, useGame, useCards hooks wired to SpacetimeDB
- GameLobby and GameBoard wired to SpacetimeDB reducers
- Subscription query `SELECT * FROM game_matches, players` is a cross join (inefficient)
- **client_connected reducer NOT called on connect** -- identity auto-created on server but client never triggers it

**Git:** Push working. Head: 196a44a.

### What's actually done
- Rust server compiles with SpacetimeDB tables and reducers
- Board game logic (place, attack, flip, move, switch mode) wired through reducers
- Win condition implemented: check_win() checks hand + board, wired to place_card + attack_card + end_turn
- player_hands table tracks cards in hand per player per match
- player_identities table + client_connected reducer (server-side only, db7c8ac)
- my_player and my_player_id views for identity lookup
- Next.js client: useMatches + useGame + useCards hooks, GameLobby + GameBoard wired to SpacetimeDB
- CollectionGallery wired to SpacetimeDB via useCards hook
- Card stat generation with rarity-based scaling

### What's broken or missing (priority order)

**0. Dead code in lib.rs (STILL PRESENT)**
- Rarity, CardType, MatchStatus enums: defined but never used outside lib.rs (string literals used in generate_card_stats instead)
- SimpleRng struct, RNG thread_local, random_f32(): defined but only random_range() is used
- Tests in lib.rs for Rarity/CardType enums: testing dead code
- ~35 lines total. Previous 57e97da cleanup removed GameState (~720 lines) but missed these smaller items.

**1. client_connected not called from client** -- RESOLVED (196a44a)
- Server-side: client_connected lifecycle reducer auto-runs on first connect (no client call needed)
- Client-side: SpacetimeDBProvider subscribes to my_player + player_identities on connect
- playerId exposed via useSpacetimeDB().playerId
- usePlayerIdentity hook available as convenience wrapper

**3. Subscription cross join inefficiency**
- `SELECT * FROM game_matches, players` is a cross join
- useGame subscribes to all game_matches (no filter by match ID)
- Should use proper filters or separate table subscriptions

**2. WASM build never verified**
- PLAN claimed WASM build PASS but wasm-pack is not installed on VPS
- wasm32-wasip1 target fails to compile (zerocopy/typenum/serde_core dependency errors)
- Needs: install wasm-pack + wasm32-wasip1 target, then cargo build --target wasm32-wasip1

**3. No #[reducer(init)]** -- RESOLVED (343ac56)

**4. Board state ownership not validated** -- RESOLVED (fdc6ee5)
- place_card checks player's hand but not if player is in the match
- No validation that player1_id or player2_id in match matches the caller's identity

**5. AI/Art pipeline**
- Card descriptions are templates, not AI-generated
- Image URLs are placeholder paths

**6. End-to-end game loop test**
- 17 unit tests PASS for game logic (check_win, BoardState, BoardTile)
- Full e2e still missing: create_match -> init_match_hands -> place_card -> attack_card -> end_turn -> win detection
- Would require SpacetimeDB Docker running

### Backlog (ordered by priority)
1. Remove remaining dead code from lib.rs: Rarity, CardType, MatchStatus enums, SimpleRng/RNG/random_f32 (~35 lines)
2. WASM build test: install wasm-pack + wasm32-wasip1 target, verify cargo build --target wasm32-wasip1 passes
3. Test full game loop end-to-end (create_match -> init_match_hands -> place_card -> attack_card -> end_turn -> win detection)
4. Wire AI card descriptions to SpacetimeDB card creation (replace template strings in /api/generate-description with real AI calls)
5. Replace placeholder card image URLs with AI-generated images (MiniMax image-01)
6. ~~Add SpacetimeDB SDK to client, generate bindings, create connection provider~~ DONE
7. ~~Wire CollectionGallery to SpacetimeDB~~ DONE
8. ~~Fix views or remove them~~ DONE (implemented my_player view)
9. ~~Implement win condition (check_win function + wire to end_turn/attack_card)~~ DONE
10. ~~Wire game UI to SpacetimeDB (useMatches hook, useGame hook, wire board actions)~~ DONE
11. ~~Fix win condition to check hand + board cards~~ DONE
12. ~~Wire client to call client_connected on connect, subscribe to my_player_id to get own player_id~~ DONE (196a44a)
13. ~~Fix subscription queries (cross join -> filtered, subscribe to specific match_id)~~ DONE (2ef1646)
14. ~~Add player_id ownership validation in match reducers~~ DONE (fdc6ee5)
15. ~~Add #[reducer(init)] for database initialization~~ DONE (343ac56)
16. ~~Remove dead code from lib.rs (GameState impl, unused structs/enums/helpers)~~ DONE (57e97da) - removed ~720 lines
17. ~~17 unit tests for game logic~~ DONE (33fabca)
