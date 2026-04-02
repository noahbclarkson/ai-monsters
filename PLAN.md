# AI Monsters - Project Plan

## Current State: 2026-04-01 evening. Client identity wiring complete (196a44a). playerId exposed via useSpacetimeDB(). Server and client build clean. Git push working.

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

**1. client_connected not called from client** -- RESOLVED (196a44a)
- Server-side: client_connected lifecycle reducer auto-runs on first connect (no client call needed)
- Client-side: SpacetimeDBProvider subscribes to my_player + player_identities on connect
- playerId exposed via useSpacetimeDB().playerId
- usePlayerIdentity hook available as convenience wrapper

**2. Subscription cross join inefficiency**
- `SELECT * FROM game_matches, players` is a cross join
- useGame subscribes to all game_matches (no filter by match ID)
- Should use proper filters or separate table subscriptions

**3. No #[reducer(init)]**
- No database initialization on module start

**4. Board state ownership not validated** -- RESOLVED (fdc6ee5)
- place_card checks player's hand but not if player is in the match
- No validation that player1_id or player2_id in match matches the caller's identity

**5. AI/Art pipeline**
- Card descriptions are templates, not AI-generated
- Image URLs are placeholder paths

**6. Testing**
- 2 unit tests in daily_cards.rs only
- No integration tests
- No WASM build test

### Backlog (ordered by priority)
1. ~~Add SpacetimeDB SDK to client, generate bindings, create connection provider~~ DONE
2. ~~Wire CollectionGallery to SpacetimeDB~~ DONE
3. ~~Fix views or remove them~~ DONE (implemented my_player view)
4. ~~Implement win condition (check_win function + wire to end_turn/attack_card)~~ DONE
5. ~~Wire game UI to SpacetimeDB (useMatches hook, useGame hook, wire board actions)~~ DONE
6. ~~Fix win condition to check hand + board cards~~ DONE
7. ~~Wire client to call client_connected on connect, subscribe to my_player_id to get own player_id~~ DONE (196a44a)
8. ~~Fix subscription queries (cross join -> filtered, subscribe to specific match_id)~~ DONE (2ef1646)
9. ~~Add player_id ownership validation in match reducers~~ DONE (fdc6ee5)
10. Add #[reducer(init)] for database initialization
11. Test full game loop end-to-end
12. WASM build test
13. Replace simulated AI descriptions with real AI calls (client-side)
14. Integration tests
