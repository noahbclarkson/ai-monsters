use spacetimedb::{reducer, ReducerContext, Table};
use crate::tables::*;
use serde_json;

// Player management reducers

// Lifecycle reducer: runs when a client first connects to SpacetimeDB.
// Looks up the caller's SpacetimeDB identity in player_identities.
// If not found, creates a new player and records the identity mapping.
#[reducer(client_connected)]
pub fn client_connected(ctx: &ReducerContext) -> Result<(), String> {
    let identity = ctx.sender();

    // Check if this identity is already linked to a player
    if ctx.db.player_identities().identity().find(identity).is_some() {
        // Already registered, nothing to do
        return Ok(());
    }

    // Create a new player with an auto-generated name
    let player_id = generate_id();
    let auto_name = format!("Player_{}", &identity.to_hex()[..8]);

    let player = PlayerRow {
        id: player_id,
        name: auto_name.clone(),
        email: format!("{}@local", identity.to_hex()),
        created_at: current_timestamp(),
        rating: 1000,
    };
    ctx.db.players().insert(player);

    // Record the identity -> player mapping
    let identity_row = PlayerIdentityRow {
        identity,
        player_id,
    };
    ctx.db.player_identities().insert(identity_row);

    Ok(())
}

#[reducer]
pub fn create_player(ctx: &ReducerContext, name: String, email: String) -> Result<(), String> {
    let player_id = generate_id();
    let player = PlayerRow {
        id: player_id,
        name,
        email,
        created_at: current_timestamp(),
        rating: 1000,
    };
    ctx.db.players().insert(player);
    Ok(())
}

// Card generation reducer
#[reducer]
pub fn generate_card(ctx: &ReducerContext, seed_noun: String, rarity: String, card_type: String) -> Result<(), String> {
    let card_id = generate_id();
    let rarity_str = if rarity.is_empty() { "Common".to_string() } else { rarity };
    let card_type_str = if card_type.is_empty() { "Unit".to_string() } else { card_type };

    let (attack, defense, range) = generate_card_stats(&rarity_str, &card_type_str);
    let type_suffix = match card_type_str.as_str() {
        "Unit" => "Warrior",
        "Building" => "Tower",
        "Spell" => "Magic",
        _ => "Warrior",
    };

    let card = CardRow {
        id: card_id,
        name: format!("{} {}", capitalize(&seed_noun), type_suffix),
        description: format!("A {} {}", seed_noun, card_type_str.to_lowercase()),
        image_url: format!("/placeholder/{}.png", card_id),
        attack,
        defense,
        range,
        rarity: rarity_str,
        card_type: card_type_str,
        seed_noun,
        created_at: current_timestamp(),
        last_used_count: 0,
    };

    ctx.db.cards().insert(card);
    Ok(())
}

// Create a deck
#[reducer]
pub fn create_deck(ctx: &ReducerContext, player_id: u64, name: String) -> Result<(), String> {
    let deck_id = generate_id();
    let deck = DeckRow {
        id: deck_id,
        player_id,
        name,
        card_ids_json: "[]".to_string(),
        created_at: current_timestamp(),
        updated_at: current_timestamp(),
    };
    ctx.db.decks().insert(deck);
    Ok(())
}

// Create a match
#[reducer]
pub fn create_match(ctx: &ReducerContext, player1_id: u64, player2_id: u64) -> Result<(), String> {
    let match_id = generate_id();
    let empty_board = crate::BoardState {
        tiles: [[None; 3]; 6],
        turn_number: 1,
        phase: crate::MatchPhase::Placement,
    };
    let board_json = serde_json::to_string(&empty_board).map_err(|e| e.to_string())?;

    let match_row = MatchRow {
        id: match_id,
        player1_id,
        player2_id,
        board_state_json: board_json,
        current_turn: player1_id,
        status: "Active".to_string(),
        winner_id: 0,
        created_at: current_timestamp(),
        updated_at: current_timestamp(),
    };
    ctx.db.game_matches().insert(match_row);
    Ok(())
}

// Initialize hands for both players at match start.
// Takes the match_id, player1_id + their card_ids, player2_id + their card_ids.
#[reducer]
pub fn init_match_hands(ctx: &ReducerContext, match_id: u64, player1_id: u64, player1_card_ids: Vec<u64>, player2_id: u64, player2_card_ids: Vec<u64>) -> Result<(), String> {
    for card_id in player1_card_ids {
        ctx.db.player_hands().insert(PlayerHandRow {
            id: generate_id(),
            match_id,
            card_id,
            player_id: player1_id,
        });
    }
    for card_id in player2_card_ids {
        ctx.db.player_hands().insert(PlayerHandRow {
            id: generate_id(),
            match_id,
            card_id,
            player_id: player2_id,
        });
    }
    Ok(())
}

// Add a card to a player's hand (e.g., for drawing cards during the game)
#[reducer]
pub fn add_card_to_hand(ctx: &ReducerContext, match_id: u64, player_id: u64, card_id: u64) -> Result<(), String> {
    ctx.db.player_hands().insert(PlayerHandRow {
        id: generate_id(),
        match_id,
        card_id,
        player_id,
    });
    Ok(())
}

// Board game reducers - MISSING FROM CURRENT IMPLEMENTATION

// Place a card on the board
#[reducer]
pub fn place_card(ctx: &ReducerContext, match_id: u64, card_id: u64, player_id: u64, row: u32, col: u32) -> Result<(), String> {
    if row >= 6 || col >= 3 {
        return Err("Invalid board position".to_string());
    }

    let match_row = ctx.db.game_matches().id().find(match_id)
        .ok_or("Match not found")?;

    // Check if it's the player's turn
    if match_row.current_turn != player_id {
        return Err("Not your turn".to_string());
    }

    // Verify the card is in the player's hand
    let hand_entry = ctx.db.player_hands().iter()
        .find(|row| row.match_id == match_id && row.card_id == card_id && row.player_id == player_id);
    let hand_id = match hand_entry {
        Some(h) => h.id,
        None => return Err("Card not in your hand".to_string()),
    };

    // Parse board state
    let mut board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;

    // Check if the tile is empty
    if board.tiles[row as usize][col as usize].is_some() {
        return Err("Tile already occupied".to_string());
    }

    // Create board tile for the card
    let tile = crate::BoardTile {
        card_id: Some(card_id),
        is_face_up: true, // Cards are placed face-up during placement phase
        is_attack_mode: true, // Default to attack mode
        owner_player_id: Some(player_id),
    };

    // Place the card on the board
    board.tiles[row as usize][col as usize] = Some(tile);

    // Remove card from hand using primary key
    ctx.db.player_hands().id().delete(hand_id);

    // Count remaining hand cards for win check
    let p1_hand = ctx.db.player_hands().iter()
        .filter(|row| row.match_id == match_id && row.player_id == match_row.player1_id)
        .count();
    let p2_hand = ctx.db.player_hands().iter()
        .filter(|row| row.match_id == match_id && row.player_id == match_row.player2_id)
        .count();

    // Check for winner
    let winner = crate::check_win(&board, match_row.player1_id, match_row.player2_id, p1_hand, p2_hand);

    // Update match with new board state
    let board_json = serde_json::to_string(&board).map_err(|e| e.to_string())?;

    ctx.db.game_matches().id().update(MatchRow {
        id: match_id,
        player1_id: match_row.player1_id,
        player2_id: match_row.player2_id,
        board_state_json: board_json,
        current_turn: match_row.current_turn,
        status: if winner.is_some() { "Completed".to_string() } else { match_row.status.clone() },
        winner_id: winner.unwrap_or(match_row.winner_id),
        created_at: match_row.created_at,
        updated_at: current_timestamp(),
    });

    Ok(())
}

// Attack another card
#[reducer]
pub fn attack_card(ctx: &ReducerContext, match_id: u64, attacker_row: u32, attacker_col: u32, defender_row: u32, defender_col: u32) -> Result<(), String> {
    // Validate positions
    if attacker_row >= 6 || attacker_col >= 3 || defender_row >= 6 || defender_col >= 3 {
        return Err("Invalid board position".to_string());
    }

    let match_row = ctx.db.game_matches().id().find(match_id)
        .ok_or("Match not found")?;

    if match_row.status == "Completed" {
        return Err("Match is already over".to_string());
    }

    // Parse board state
    let mut board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;

    // Get attacker and defender tiles
    let attacker_tile = board.tiles[attacker_row as usize][attacker_col as usize].ok_or("No attacker card at position")?;
    let defender_tile = board.tiles[defender_row as usize][defender_col as usize].ok_or("No defender card at position")?;

    // Check if attacker is in attack mode
    if !attacker_tile.is_attack_mode {
        return Err("Attacker is not in attack mode".to_string());
    }

    // Get attacker and defender cards
    let attacker_card = ctx.db.cards().id().find(attacker_tile.card_id.unwrap())
        .ok_or("Attacker card not found")?;
    let defender_card = ctx.db.cards().id().find(defender_tile.card_id.unwrap())
        .ok_or("Defender card not found")?;

    // Calculate range
    let distance = (attacker_row as i32 - defender_row as i32).abs() + 
                    (attacker_col as i32 - defender_col as i32).abs();
    
    if distance > attacker_card.range {
        return Err("Target is out of range".to_string());
    }

    // Resolve combat
    let attacker_wins = attacker_card.attack > defender_card.defense;
    
    // Remove the defeated card
    if attacker_wins {
        board.tiles[defender_row as usize][defender_col as usize] = None;
    } else {
        board.tiles[attacker_row as usize][attacker_col as usize] = None;
    }

    // Count hand cards for win check
    let p1_hand = ctx.db.player_hands().iter()
        .filter(|row| row.match_id == match_id && row.player_id == match_row.player1_id)
        .count();
    let p2_hand = ctx.db.player_hands().iter()
        .filter(|row| row.match_id == match_id && row.player_id == match_row.player2_id)
        .count();

    // Check for a winner
    let winner = crate::check_win(&board, match_row.player1_id, match_row.player2_id, p1_hand, p2_hand);

    // Update match with new board state
    let board_json = serde_json::to_string(&board).map_err(|e| e.to_string())?;

    ctx.db.game_matches().id().update(MatchRow {
        id: match_id,
        player1_id: match_row.player1_id,
        player2_id: match_row.player2_id,
        board_state_json: board_json,
        current_turn: match_row.current_turn,
        status: if winner.is_some() { "Completed".to_string() } else { match_row.status.clone() },
        winner_id: winner.unwrap_or(match_row.winner_id),
        created_at: match_row.created_at,
        updated_at: current_timestamp(),
    });

    Ok(())
}

// Flip a card face up/down
#[reducer]
pub fn flip_card(ctx: &ReducerContext, match_id: u64, row: u32, col: u32) -> Result<(), String> {
    if row >= 6 || col >= 3 {
        return Err("Invalid board position".to_string());
    }

    let match_row = ctx.db.game_matches().id().find(match_id)
        .ok_or("Match not found")?;

    let mut board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;

    let mut tile = board.tiles[row as usize][col as usize].ok_or("No card at position")?;
    
    tile.is_face_up = !tile.is_face_up;
    board.tiles[row as usize][col as usize] = Some(tile);

    let board_json = serde_json::to_string(&board).map_err(|e| e.to_string())?;

    ctx.db.game_matches().id().update(MatchRow {
        id: match_id,
        player1_id: match_row.player1_id,
        player2_id: match_row.player2_id,
        board_state_json: board_json,
        current_turn: match_row.current_turn,
        status: match_row.status,
        winner_id: match_row.winner_id,
        created_at: match_row.created_at,
        updated_at: current_timestamp(),
    });

    Ok(())
}

// Switch card between attack/defense mode
#[reducer]
pub fn switch_card_mode(ctx: &ReducerContext, match_id: u64, row: u32, col: u32) -> Result<(), String> {
    if row >= 6 || col >= 3 {
        return Err("Invalid board position".to_string());
    }

    let match_row = ctx.db.game_matches().id().find(match_id)
        .ok_or("Match not found")?;

    let mut board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;

    let mut tile = board.tiles[row as usize][col as usize].ok_or("No card at position")?;
    
    tile.is_attack_mode = !tile.is_attack_mode;
    board.tiles[row as usize][col as usize] = Some(tile);

    let board_json = serde_json::to_string(&board).map_err(|e| e.to_string())?;

    ctx.db.game_matches().id().update(MatchRow {
        id: match_id,
        player1_id: match_row.player1_id,
        player2_id: match_row.player2_id,
        board_state_json: board_json,
        current_turn: match_row.current_turn,
        status: match_row.status,
        winner_id: match_row.winner_id,
        created_at: match_row.created_at,
        updated_at: current_timestamp(),
    });

    Ok(())
}

// Move a card to a different position
#[reducer]
pub fn move_card(ctx: &ReducerContext, match_id: u64, from_row: u32, from_col: u32, to_row: u32, to_col: u32) -> Result<(), String> {
    if from_row >= 6 || from_col >= 3 || to_row >= 6 || to_col >= 3 {
        return Err("Invalid board position".to_string());
    }

    let match_row = ctx.db.game_matches().id().find(match_id)
        .ok_or("Match not found")?;

    let mut board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;

    let tile = board.tiles[from_row as usize][from_col as usize].ok_or("No card at source position")?;
    
    // Check if destination is empty
    if board.tiles[to_row as usize][to_col as usize].is_some() {
        return Err("Destination tile is occupied".to_string());
    }

    // Move the tile
    board.tiles[from_row as usize][from_col as usize] = None;
    board.tiles[to_row as usize][to_col as usize] = Some(tile);

    let board_json = serde_json::to_string(&board).map_err(|e| e.to_string())?;

    ctx.db.game_matches().id().update(MatchRow {
        id: match_id,
        player1_id: match_row.player1_id,
        player2_id: match_row.player2_id,
        board_state_json: board_json,
        current_turn: match_row.current_turn,
        status: match_row.status,
        winner_id: match_row.winner_id,
        created_at: match_row.created_at,
        updated_at: current_timestamp(),
    });

    Ok(())
}

// End turn
#[reducer]
pub fn end_turn(ctx: &ReducerContext, match_id: u64) -> Result<(), String> {
    let match_row = ctx.db.game_matches().id().find(match_id)
        .ok_or("Match not found")?;

    if match_row.status == "Completed" {
        return Err("Match is already over".to_string());
    }

    let next_turn = if match_row.current_turn == match_row.player1_id {
        match_row.player2_id
    } else {
        match_row.player1_id
    };

    let mut board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;
    board.turn_number += 1;
    board.phase = match board.phase {
        crate::MatchPhase::Placement => crate::MatchPhase::Action,
        crate::MatchPhase::Action => crate::MatchPhase::Combat,
        crate::MatchPhase::Combat => crate::MatchPhase::Placement,
    };

    // Count hand cards for win check
    let p1_hand = ctx.db.player_hands().iter()
        .filter(|row| row.match_id == match_id && row.player_id == match_row.player1_id)
        .count();
    let p2_hand = ctx.db.player_hands().iter()
        .filter(|row| row.match_id == match_id && row.player_id == match_row.player2_id)
        .count();

    // Check for winner: if the player whose turn it just became has no cards, opponent wins
    let winner = crate::check_win(&board, match_row.player1_id, match_row.player2_id, p1_hand, p2_hand);

    let board_json = serde_json::to_string(&board).map_err(|e| e.to_string())?;

    ctx.db.game_matches().id().update(MatchRow {
        id: match_id,
        player1_id: match_row.player1_id,
        player2_id: match_row.player2_id,
        board_state_json: board_json,
        current_turn: next_turn,
        status: if winner.is_some() { "Completed".to_string() } else { match_row.status.clone() },
        winner_id: winner.unwrap_or(match_row.winner_id),
        created_at: match_row.created_at,
        updated_at: current_timestamp(),
    });

    Ok(())
}

// Generate daily cards
#[reducer]
pub fn generate_daily_cards(ctx: &ReducerContext) -> Result<(), String> {
    let seed_nouns = ["Sun", "Moon", "Star", "Fire", "Water", "Earth"];
    let rarities = ["Common", "Rare", "Epic", "Legendary"];
    let card_types = ["Unit", "Building", "Spell"];

    for (i, noun) in seed_nouns.iter().enumerate() {
        let rarity = rarities[i % rarities.len()];
        let ct = card_types[i % card_types.len()];
        generate_card(ctx, noun.to_string(), rarity.to_string(), ct.to_string())?;
    }
    Ok(())
}

// Helper functions
fn generate_id() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64
}

fn current_timestamp() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64
}

// Helper: generate card stats based on rarity and type
fn generate_card_stats(rarity: &str, card_type: &str) -> (i32, i32, i32) {
    let (ba, bd, br) = match rarity {
        "Common" => (3, 3, 1),
        "Rare" => (5, 5, 2),
        "Epic" => (8, 8, 3),
        "Legendary" => (12, 12, 4),
        _ => (3, 3, 1),
    };
    let variance = |base: i32, max: i32| -> i32 {
        base + (crate::random_range(max as usize) as i32)
    };
    match card_type {
        "Unit" => (variance(ba, 3), variance(bd, 2), variance(br, 1)),
        "Building" => (0, variance(bd, 5), 1),
        "Spell" => (variance(ba, 2), variance(bd, 2), variance(br, 3)),
        _ => (variance(ba, 3), variance(bd, 2), variance(br, 1)),
    }
}

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + c.as_str().to_lowercase().as_str(),
    }
}
