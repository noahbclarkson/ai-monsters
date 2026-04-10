use spacetimedb::{reducer, ReducerContext, Table};
use crate::tables::*;
use crate::BotAction;
use serde_json;

// Database initialization reducer -- runs once when the module is first deployed.
#[reducer(init)]
pub fn init(_ctx: &ReducerContext) -> Result<(), String> {
    Ok(())
}

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
    let player_id = generate_id(ctx);
    let auto_name = format!("Player_{}", &identity.to_hex()[..8]);

    let player = PlayerRow {
        id: player_id,
        name: auto_name.clone(),
        email: format!("{}@local", identity.to_hex()),
        created_at: current_timestamp(ctx),
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
    let player_id = generate_id(ctx);
    let player = PlayerRow {
        id: player_id,
        name,
        email,
        created_at: current_timestamp(ctx),
        rating: 1000,
    };
    ctx.db.players().insert(player);
    Ok(())
}

fn generate_flavor_description(noun: &str, card_type: &str, rarity: &str, seed: u64) -> String {
    let idx = (seed % 100) as usize;

    let openings_units = [
        "Forged in the fires of countless battles",
        "Born of ancient lineage and tempered by war",
        "Rising from the shadows with relentless fury",
        "A formidable presence on any battlefield",
        "Honed by centuries of relentless conflict",
        "Carrying the weight of an ancient legacy",
        "Shaped by the crucible of endless war",
        "Unleashed from the depths of a forgotten realm",
        "Steeled by trials that would break lesser beings",
        "Driven by an unquenchable thirst for glory",
    ];

    let openings_buildings = [
        "Rising from the earth like a monument to defiance",
        "An imposing citadel whose defenses have repelled countless invasions",
        "Built upon the bones of fallen empires",
        "A fortress that has never known surrender",
        "Constructed with mastery beyond mortal understanding",
        "Standing sentinel over the battlefield",
        "Its walls whisper tales of ancient victories",
        "A bastion of power that dominates the horizon",
        "Carved from living stone by forgotten artisans",
        "Defying siege and storm for a thousand years",
    ];

    let openings_spells = [
        "The air crackles with arcane energy when this incantation is invoked",
        "A surge of raw magical force that reshapes reality itself",
        "Woven from the fabric of pure mana",
        "Reality bends and fractures under its power",
        "An ancient enchantment that echoes through the ages",
        "Channeling forces from beyond the mortal veil",
        "A devastating weave of elemental fury",
        "Its words of power have been passed down through millennia",
        "The ground trembles as this spell takes hold",
        "Light and shadow converge in a catastrophic burst",
    ];

    let qualities: [&str; 10] = [
        "tenacious",
        "formidable",
        "relentless",
        "cunning",
        "battle-tested",
        "unyielding",
        "fearsome",
        "indomitable",
        "seasoned",
        "unstoppable",
    ];

    let unit_endings = [
        "fights with unwavering resolve. Allies rally behind them; enemies flee before them.",
        "carries the hopes of their people into every engagement. Their skill is unmatched among their kin.",
        "whose reputation precedes them into every battle. Their presence on the field shifts the tide of combat.",
        "commands respect from friend and foe alike. Few dare to challenge them directly.",
        "stands ready to face any threat. Their conviction is their greatest weapon.",
        "has survived trials that would end lesser warriors. Each scar tells a story of victory.",
        "moves with purpose and strikes with lethal precision. Nothing can sway them from their path.",
        "embodies the warrior spirit of their kind. To face them is to face oblivion.",
        "knows no fear and shows no mercy. Their blade speaks louder than any words.",
        "strikes like a thunderbolt, leaving devastation in their wake.",
    ];

    let building_endings = [
        "commands the battlefield. Those who siege it pay dearly.",
        "stands as a monument to engineering mastery. Its walls have never fallen.",
        "provides shelter and strength to all who dwell within.",
        "dominates the surrounding terrain with unassailable fortifications.",
        "houses garrisons that never sleep and defenses that never falter.",
        "serves as both shield and sword, projecting power across the field.",
        "has withstood every assault thrown against it. It will not fall today.",
        "channels ancient protective wards that bolster nearby allies.",
        "looms over the battlefield, a symbol of enduring might.",
        "harbors secrets that turn the tide of war for those who control it.",
    ];

    let spell_endings = [
        "Reality itself bends to the caster's will.",
        "Its effects echo long after the spell is cast.",
        "Leaving destruction and awe in equal measure.",
        "Reshaping the battlefield in a single devastating moment.",
        "Few who witness its power live to describe it.",
        "The battlefield will never be the same after its casting.",
        "Even the most battle-hardened warriors falter at its invocation.",
        "The mana required is immense, but the result is catastrophic.",
        "Legends say this spell once leveled an entire kingdom.",
        "Its incantation sends shivers through the fabric of existence.",
    ];

    let rarity_prefix = match rarity {
        "Epic" => "this fearsome, ",
        "Legendary" => "this legendary, ",
        _ => "this ",
    };

    let (openings, endings, type_label): (&[&str], &[&str], &str) = match card_type {
        "Building" | "Tower" => (&openings_buildings, &building_endings, "fortress"),
        "Spell" | "Magic" => (&openings_spells, &spell_endings, "enchantment"),
        _ => (&openings_units, &unit_endings, "warrior"),
    };

    let opening = openings[idx % openings.len()];
    let quality = qualities[idx % qualities.len()];
    let ending = endings[(idx * 3 + 7) % endings.len()];

    format!(
        "{}, {} {} {} {} {}",
        opening,
        rarity_prefix,
        quality,
        noun,
        type_label,
        ending
    )
}

// Card generation reducer
#[reducer]
pub fn generate_card(ctx: &ReducerContext, seed_noun: String, rarity: String, card_type: String, ai_description: String, ai_image_url: String) -> Result<(), String> {
    let card_id = generate_id(ctx);
    let rarity_str = if rarity.is_empty() { "Common".to_string() } else { rarity.clone() };
    let card_type_str = if card_type.is_empty() { "Unit".to_string() } else { card_type };

    let (attack, defense, range) = generate_card_stats(&rarity_str, &card_type_str);
    let type_suffix = match card_type_str.as_str() {
        "Unit" => "Warrior",
        "Building" => "Tower",
        "Spell" => "Magic",
        _ => "Warrior",
    };

    let description = if ai_description.is_empty() {
        generate_flavor_description(&seed_noun, &card_type_str, &rarity_str, ctx.timestamp.to_micros_since_unix_epoch() as u64)
    } else {
        ai_description
    };
    let image_url = if ai_image_url.is_empty() {
        format!("/placeholder/{}.png", card_id)
    } else {
        ai_image_url
    };

    let card = CardRow {
        id: card_id,
        name: format!("{} {}", capitalize(&seed_noun), type_suffix),
        description,
        image_url,
        attack,
        defense,
        range,
        rarity: rarity_str,
        card_type: card_type_str,
        seed_noun,
        created_at: current_timestamp(ctx),
        last_used_count: 0,
    };

    ctx.db.cards().insert(card);
    Ok(())
}

/// Update a card's description and/or image URL.
/// Used by the AI/Art pipeline to set AI-generated content after card creation.
/// Pass empty string to leave a field unchanged.
#[reducer]
pub fn update_card_media(ctx: &ReducerContext, card_id: u64, description: String, image_url: String) -> Result<(), String> {
    let mut card = ctx.db.cards().id().find(card_id)
        .ok_or_else(|| format!("Card {} not found", card_id))?;

    if !description.is_empty() {
        card.description = description;
    }
    if !image_url.is_empty() {
        card.image_url = image_url;
    }

    ctx.db.cards().id().update(card);
    Ok(())
}

// Create a deck
#[reducer]
pub fn create_deck(ctx: &ReducerContext, player_id: u64, name: String) -> Result<(), String> {
    let deck_id = generate_id(ctx);
    let deck = DeckRow {
        id: deck_id,
        player_id,
        name,
        card_ids_json: "[]".to_string(),
        created_at: current_timestamp(ctx),
        updated_at: current_timestamp(ctx),
    };
    ctx.db.decks().insert(deck);
    Ok(())
}

// Create a match
#[reducer]
pub fn create_match(ctx: &ReducerContext, player1_id: u64, player2_id: u64) -> Result<(), String> {
    let match_id = generate_id(ctx);
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
        created_at: current_timestamp(ctx),
        updated_at: current_timestamp(ctx),
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
            id: card_id,
            match_id,
            card_id,
            player_id: player1_id,
        });
    }
    for card_id in player2_card_ids {
        ctx.db.player_hands().insert(PlayerHandRow {
            id: card_id,
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
        id: generate_id(ctx),
        match_id,
        card_id,
        player_id,
    });
    Ok(())
}

// Board game reducers - MISSING FROM CURRENT IMPLEMENTATION

// Helper: validate that a player is a participant in a match.
// Returns the match row if valid, Err string otherwise.
fn validate_player_in_match(ctx: &ReducerContext, match_id: u64, player_id: u64) -> Result<MatchRow, String> {
    let m = ctx.db.game_matches().id().find(match_id).ok_or("Match not found")?;
    if m.player1_id != player_id && m.player2_id != player_id {
        return Err("You are not a participant in this match".to_string());
    }
    Ok(m)
}

// Place a card on the board
#[reducer]
pub fn place_card(ctx: &ReducerContext, match_id: u64, card_id: u64, player_id: u64, row: u32, col: u32) -> Result<(), String> {
    if row >= 6 || col >= 3 {
        return Err("Invalid board position".to_string());
    }

    // Validate caller identity
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender()).ok_or("Caller identity not found")?;
    if caller_record.player_id != player_id {
        return Err("Player ID does not match your identity".to_string());
    }

    let match_row = validate_player_in_match(ctx, match_id, player_id)?;

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
        updated_at: current_timestamp(ctx),
    });

    Ok(())
}

// Attack another card
#[reducer]
pub fn attack_card(ctx: &ReducerContext, match_id: u64, player_id: u64, attacker_row: u32, attacker_col: u32, defender_row: u32, defender_col: u32) -> Result<(), String> {
    // Validate positions
    if attacker_row >= 6 || attacker_col >= 3 || defender_row >= 6 || defender_col >= 3 {
        return Err("Invalid board position".to_string());
    }

    // Validate caller identity
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender()).ok_or("Caller identity not found")?;
    if caller_record.player_id != player_id {
        return Err("Player ID does not match your identity".to_string());
    }

    let match_row = validate_player_in_match(ctx, match_id, player_id)?;

    if match_row.status == "Completed" {
        return Err("Match is already over".to_string());
    }

    // Check it's the attacker's turn
    if match_row.current_turn != player_id {
        return Err("Not your turn".to_string());
    }

    // Parse board state
    let mut board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;

    // Get attacker and defender tiles
    let attacker_tile = board.tiles[attacker_row as usize][attacker_col as usize].ok_or("No attacker card at position")?;
    let defender_tile = board.tiles[defender_row as usize][defender_col as usize].ok_or("No defender card at position")?;

    // Verify attacker belongs to the calling player
    if attacker_tile.owner_player_id != Some(player_id) {
        return Err("You do not own the attacker card".to_string());
    }

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
        updated_at: current_timestamp(ctx),
    });

    Ok(())
}

// Flip a card face up/down
#[reducer]
pub fn flip_card(ctx: &ReducerContext, match_id: u64, player_id: u64, row: u32, col: u32) -> Result<(), String> {
    if row >= 6 || col >= 3 {
        return Err("Invalid board position".to_string());
    }

    // Validate caller identity
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender()).ok_or("Caller identity not found")?;
    if caller_record.player_id != player_id {
        return Err("Player ID does not match your identity".to_string());
    }

    let match_row = validate_player_in_match(ctx, match_id, player_id)?;

    let mut board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;

    let mut tile = board.tiles[row as usize][col as usize].ok_or("No card at position")?;

    // Verify caller owns the tile
    if tile.owner_player_id != Some(player_id) {
        return Err("You do not own this card".to_string());
    }
    
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
        updated_at: current_timestamp(ctx),
    });

    Ok(())
}

// Switch card between attack/defense mode
#[reducer]
pub fn switch_card_mode(ctx: &ReducerContext, match_id: u64, player_id: u64, row: u32, col: u32) -> Result<(), String> {
    if row >= 6 || col >= 3 {
        return Err("Invalid board position".to_string());
    }

    // Validate caller identity
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender()).ok_or("Caller identity not found")?;
    if caller_record.player_id != player_id {
        return Err("Player ID does not match your identity".to_string());
    }

    let match_row = validate_player_in_match(ctx, match_id, player_id)?;

    let mut board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;

    let mut tile = board.tiles[row as usize][col as usize].ok_or("No card at position")?;

    // Verify caller owns the tile
    if tile.owner_player_id != Some(player_id) {
        return Err("You do not own this card".to_string());
    }

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
        updated_at: current_timestamp(ctx),
    });

    Ok(())
}

// Move a card to a different position
#[reducer]
pub fn move_card(ctx: &ReducerContext, match_id: u64, player_id: u64, from_row: u32, from_col: u32, to_row: u32, to_col: u32) -> Result<(), String> {
    if from_row >= 6 || from_col >= 3 || to_row >= 6 || to_col >= 3 {
        return Err("Invalid board position".to_string());
    }

    // Validate caller identity
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender()).ok_or("Caller identity not found")?;
    if caller_record.player_id != player_id {
        return Err("Player ID does not match your identity".to_string());
    }

    let match_row = validate_player_in_match(ctx, match_id, player_id)?;

    let mut board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;

    let tile = board.tiles[from_row as usize][from_col as usize].ok_or("No card at source position")?;

    // Verify caller owns the tile
    if tile.owner_player_id != Some(player_id) {
        return Err("You do not own this card".to_string());
    }
    
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
        updated_at: current_timestamp(ctx),
    });

    Ok(())
}

// End turn
#[reducer]
pub fn end_turn(ctx: &ReducerContext, match_id: u64, player_id: u64) -> Result<(), String> {
    // Validate caller identity
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender()).ok_or("Caller identity not found")?;
    if caller_record.player_id != player_id {
        return Err("Player ID does not match your identity".to_string());
    }

    let match_row = validate_player_in_match(ctx, match_id, player_id)?;

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
        updated_at: current_timestamp(ctx),
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
        generate_card(ctx, noun.to_string(), rarity.to_string(), ct.to_string(), String::new(), String::new())?;
    }
    Ok(())
}

// ============================================================
// Bot AI - Single-player mode
// ============================================================

/// Start a single-player match against a bot.
/// Creates a bot player, creates the match, generates cards for both sides,
/// and initializes hands. The human player is always player1 (goes first).
#[reducer]
pub fn start_single_player_match(
    ctx: &ReducerContext,
    difficulty: String,
    player_card_ids: Vec<u64>,
) -> Result<(), String> {
    // Validate caller
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender())
        .ok_or("Caller identity not found")?;
    let human_player_id = caller_record.player_id;

    // Validate difficulty
    let diff = match difficulty.as_str() {
        "Easy" | "Medium" | "Hard" => difficulty.clone(),
        _ => return Err("Invalid difficulty. Use Easy, Medium, or Hard.".to_string()),
    };

    // Create bot player row
    let bot_player_id = generate_id(ctx);
    let bot_name = format!("Bot_{}", &diff);
    ctx.db.players().insert(PlayerRow {
        id: bot_player_id,
        name: bot_name.clone(),
        email: format!("bot_{}@ai", bot_player_id),
        created_at: current_timestamp(ctx),
        rating: match diff.as_str() {
            "Easy" => 800,
            "Medium" => 1200,
            "Hard" => 1600,
            _ => 1000,
        },
    });
    ctx.db.bot_players().insert(BotPlayerRow {
        player_id: bot_player_id,
        name: bot_name,
        difficulty: diff.clone(),
    });

    // Generate cards for the bot (5 cards)
    let bot_card_names = ["Shadow", "Fang", "Claw", "Storm", "Venom"];
    let bot_rarities = ["Common", "Common", "Rare", "Rare", "Epic"];
    let mut bot_card_ids: Vec<u64> = Vec::new();
    for (i, noun) in bot_card_names.iter().enumerate() {
        let card_id = generate_id(ctx) + (i as u64 + 1); // offset to avoid collision
        let (attack, defense, range) = generate_card_stats(bot_rarities[i], "Unit");
        ctx.db.cards().insert(CardRow {
            id: card_id,
            name: format!("{} Warrior", capitalize(noun)),
            description: format!("A {} {} monster", noun.to_lowercase(), diff.as_str().to_lowercase()),
            image_url: format!("/placeholder/bot_{}.png", card_id),
            attack,
            defense,
            range,
            rarity: bot_rarities[i].to_string(),
            card_type: "Unit".to_string(),
            seed_noun: noun.to_string(),
            created_at: current_timestamp(ctx),
            last_used_count: 0,
        });
        bot_card_ids.push(card_id);
    }

    // Create the match
    let match_id = generate_id(ctx);
    let empty_board = crate::BoardState {
        tiles: [[None; 3]; 6],
        turn_number: 1,
        phase: crate::MatchPhase::Placement,
    };
    let board_json = serde_json::to_string(&empty_board).map_err(|e| e.to_string())?;

    ctx.db.game_matches().insert(MatchRow {
        id: match_id,
        player1_id: human_player_id,
        player2_id: bot_player_id,
        board_state_json: board_json,
        current_turn: human_player_id, // human goes first
        status: "Active".to_string(),
        winner_id: 0,
        created_at: current_timestamp(ctx),
        updated_at: current_timestamp(ctx),
    });

    // Initialize hands
    for card_id in &player_card_ids {
        ctx.db.player_hands().insert(PlayerHandRow {
            id: *card_id,
            match_id,
            card_id: *card_id,
            player_id: human_player_id,
        });
    }
    for card_id in &bot_card_ids {
        ctx.db.player_hands().insert(PlayerHandRow {
            id: *card_id,
            match_id,
            card_id: *card_id,
            player_id: bot_player_id,
        });
    }

    Ok(())
}

/// Execute the bot's turn. Called by the client when it detects it's the bot's turn.
/// Computes the best action based on difficulty and executes it directly.
#[reducer]
pub fn run_bot_turn(ctx: &ReducerContext, match_id: u64) -> Result<(), String> {
    let match_row = ctx.db.game_matches().id().find(match_id)
        .ok_or("Match not found")?;

    if match_row.status == "Completed" {
        return Err("Match is already over".to_string());
    }

    // Verify it's actually a bot match and it's the bot's turn
    let bot_record = ctx.db.bot_players().player_id().find(match_row.current_turn)
        .ok_or("It is not the bot's turn or this is not a bot match")?;

    let bot_player_id = bot_record.player_id;
    let board: crate::BoardState = serde_json::from_str(&match_row.board_state_json)
        .map_err(|e| e.to_string())?;

    // Count bot hand cards
    let bot_hand_cards: Vec<u64> = ctx.db.player_hands().iter()
        .filter(|row| row.match_id == match_id && row.player_id == bot_player_id)
        .map(|row| row.card_id)
        .collect();

    let human_player_id = if match_row.player1_id == bot_player_id {
        match_row.player2_id
    } else {
        match_row.player1_id
    };

    // Decide action based on difficulty
    let action = compute_bot_action(&bot_record.difficulty, &board, &bot_hand_cards, bot_player_id, human_player_id);

    // Build lightweight match context
    let mcx = MatchCtx {
        match_id,
        p1_id: match_row.player1_id,
        p2_id: match_row.player2_id,
        board_json: match_row.board_state_json.clone(),
        status: match_row.status.clone(),
        winner_id: match_row.winner_id,
        created_at: match_row.created_at,
        bot_player_id,
    };

    match action {
        BotAction::PlaceCard { card_id, x, y, face_up, attack_mode } => {
            execute_bot_place(ctx, &mcx, card_id, x, y, face_up, attack_mode)?;
        }
        BotAction::AttackCard { attacker_x, attacker_y, defender_x, defender_y } => {
            execute_bot_attack(ctx, &mcx, attacker_x, attacker_y, defender_x, defender_y)?;
        }
        BotAction::EndTurn
        | BotAction::MoveCard { .. }
        | BotAction::FlipCard { .. }
        | BotAction::SwitchMode { .. } => {
            execute_bot_end_turn(ctx, &mcx)?;
        }
    }

    Ok(())
}

/// Compute the best action for the bot given board state and difficulty.
fn compute_bot_action(
    difficulty: &str,
    board: &crate::BoardState,
    hand_cards: &[u64],
    bot_player_id: u64,
    human_player_id: u64,
) -> BotAction {
    match difficulty {
        "Hard" => compute_hard_action(board, hand_cards, bot_player_id, human_player_id),
        "Medium" => compute_medium_action(board, hand_cards, bot_player_id, human_player_id),
        _ => compute_easy_action(board, hand_cards, bot_player_id, human_player_id),
    }
}

/// Easy bot: pick a random valid action.
fn compute_easy_action(
    board: &crate::BoardState,
    hand_cards: &[u64],
    _bot_player_id: u64,
    _human_player_id: u64,
) -> BotAction {
    // Try to place a card randomly
    if !hand_cards.is_empty() {
        let empty_tiles: Vec<(usize, usize)> = (0..6)
            .flat_map(|r| (0..3).map(move |c| (r, c)))
            .filter(|(r, c)| board.tiles[*r][*c].is_none())
            .collect();
        if !empty_tiles.is_empty() {
            let idx = crate::random_range(empty_tiles.len());
            let (x, y) = empty_tiles[idx];
            let card_idx = crate::random_range(hand_cards.len());
            return BotAction::PlaceCard {
                card_id: hand_cards[card_idx],
                x,
                y,
                face_up: true,
                attack_mode: true,
            };
        }
    }
    BotAction::EndTurn
}

/// Medium bot: prefer placing cards near center, attack if favorable.
fn compute_medium_action(
    board: &crate::BoardState,
    hand_cards: &[u64],
    bot_player_id: u64,
    human_player_id: u64,
) -> BotAction {
    // Try to attack first if we have a favorable attack
    if let Some(action) = find_favorable_attack(board, bot_player_id, human_player_id) {
        return action;
    }

    // Place a card, preferring center columns (col 1) and middle rows
    if !hand_cards.is_empty() {
        let empty_tiles: Vec<(usize, usize)> = (0..6)
            .flat_map(|r| (0..3).map(move |c| (r, c)))
            .filter(|(r, c)| board.tiles[*r][*c].is_none())
            .collect();
        if !empty_tiles.is_empty() {
            // Sort by distance to center (row 2-3, col 1)
            let mut sorted = empty_tiles.clone();
            sorted.sort_by_key(|(r, c)| {
                let row_dist = (*r as i32 - 2).abs() + (*r as i32 - 3).abs();
                let col_dist = (*c as i32 - 1).abs();
                row_dist + col_dist
            });
            let (x, y) = sorted[0];
            return BotAction::PlaceCard {
                card_id: hand_cards[0],
                x,
                y,
                face_up: true,
                attack_mode: true,
            };
        }
    }
    BotAction::EndTurn
}

/// Hard bot: evaluate board position and pick optimal play.
fn compute_hard_action(
    board: &crate::BoardState,
    hand_cards: &[u64],
    bot_player_id: u64,
    human_player_id: u64,
) -> BotAction {
    // Priority 1: Attack if favorable
    if let Some(action) = find_favorable_attack(board, bot_player_id, human_player_id) {
        return action;
    }

    // Priority 2: Place a card adjacent to existing friendly cards for defense
    if !hand_cards.is_empty() {
        let empty_tiles: Vec<(usize, usize)> = (0..6)
            .flat_map(|r| (0..3).map(move |c| (r, c)))
            .filter(|(r, c)| board.tiles[*r][*c].is_none())
            .collect();
        if !empty_tiles.is_empty() {
            // Score each tile: prefer tiles adjacent to friendly cards
            let mut best_pos = empty_tiles[0];
            let mut best_score = -1i32;
            for (r, c) in &empty_tiles {
                let mut score = 0i32;
                // Adjacent friendly cards
                for (dr, dc) in &[(-1i32, 0), (1, 0), (0, -1), (0, 1)] {
                    let nr = (*r as i32 + dr) as usize;
                    let nc = (*c as i32 + dc) as usize;
                    if nr < 6 && nc < 3 {
                        if let Some(tile) = &board.tiles[nr][nc] {
                            if tile.owner_player_id == Some(bot_player_id) {
                                score += 2;
                            }
                        }
                    }
                }
                // Prefer center
                score += (3 - (*c as i32 - 1).abs()) + (3 - (*r as i32 - 3).abs().min(3));
                if score > best_score {
                    best_score = score;
                    best_pos = (*r, *c);
                }
            }
            return BotAction::PlaceCard {
                card_id: hand_cards[0],
                x: best_pos.0,
                y: best_pos.1,
                face_up: true,
                attack_mode: true,
            };
        }
    }
    BotAction::EndTurn
}

/// Find a favorable attack: a friendly card in attack mode adjacent to an enemy card.
fn find_favorable_attack(board: &crate::BoardState, bot_player_id: u64, human_player_id: u64) -> Option<BotAction> {
    for r in 0..6 {
        for c in 0..3 {
            if let Some(tile) = &board.tiles[r][c] {
                if tile.owner_player_id == Some(bot_player_id) && tile.is_attack_mode {
                    // Check adjacent tiles for enemy cards
                    for (dr, dc) in &[(-1i32, 0), (1, 0), (0, -1), (0, 1)] {
                        let nr = (r as i32 + dr) as usize;
                        let nc = (c as i32 + dc) as usize;
                        if nr < 6 && nc < 3 {
                            if let Some(target) = &board.tiles[nr][nc] {
                                if target.owner_player_id == Some(human_player_id) {
                                    return Some(BotAction::AttackCard {
                                        attacker_x: r,
                                        attacker_y: c,
                                        defender_x: nr,
                                        defender_y: nc,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    None
}

/// Lightweight match context to avoid passing too many arguments.
struct MatchCtx {
    match_id: u64,
    p1_id: u64,
    p2_id: u64,
    board_json: String,
    status: String,
    winner_id: u64,
    created_at: i64,
    bot_player_id: u64,
}

impl MatchCtx {
    fn human_id(&self) -> u64 {
        if self.p1_id == self.bot_player_id { self.p2_id } else { self.p1_id }
    }

    fn update_match(&self, ctx: &ReducerContext, board: &crate::BoardState, current_turn: u64, winner: Option<u64>) -> Result<(), String> {
        let board_json = serde_json::to_string(board).map_err(|e| e.to_string())?;
        ctx.db.game_matches().id().update(MatchRow {
            id: self.match_id,
            player1_id: self.p1_id,
            player2_id: self.p2_id,
            board_state_json: board_json,
            current_turn,
            status: if winner.is_some() { "Completed".to_string() } else { self.status.clone() },
            winner_id: winner.unwrap_or(self.winner_id),
            created_at: self.created_at,
            updated_at: current_timestamp(ctx),
        });
        Ok(())
    }

    fn count_hands(&self, ctx: &ReducerContext) -> (usize, usize) {
        let p1 = ctx.db.player_hands().iter()
            .filter(|r| r.match_id == self.match_id && r.player_id == self.p1_id).count();
        let p2 = ctx.db.player_hands().iter()
            .filter(|r| r.match_id == self.match_id && r.player_id == self.p2_id).count();
        (p1, p2)
    }

    fn check_winner(&self, ctx: &ReducerContext, board: &crate::BoardState) -> Option<u64> {
        let (p1h, p2h) = self.count_hands(ctx);
        crate::check_win(board, self.p1_id, self.p2_id, p1h, p2h)
    }
}

/// Execute bot placing a card on the board.
fn execute_bot_place(
    ctx: &ReducerContext,
    mcx: &MatchCtx,
    card_id: u64,
    row: usize,
    col: usize,
    face_up: bool,
    attack_mode: bool,
) -> Result<(), String> {
    if row >= 6 || col >= 3 {
        return Err("Invalid board position".to_string());
    }

    let mut board: crate::BoardState = serde_json::from_str(&mcx.board_json)
        .map_err(|e| e.to_string())?;

    if board.tiles[row][col].is_some() {
        return Err("Tile already occupied".to_string());
    }

    // Remove card from bot's hand
    let hand_entry = ctx.db.player_hands().iter()
        .find(|r| r.match_id == mcx.match_id && r.card_id == card_id && r.player_id == mcx.bot_player_id);
    match hand_entry {
        Some(h) => ctx.db.player_hands().id().delete(h.id),
        None => return Err("Card not in bot's hand".to_string()),
    };

    // Place the tile
    board.tiles[row][col] = Some(crate::BoardTile {
        card_id: Some(card_id),
        is_face_up: face_up,
        is_attack_mode: attack_mode,
        owner_player_id: Some(mcx.bot_player_id),
    });

    let winner = mcx.check_winner(ctx, &board);
    mcx.update_match(ctx, &board, mcx.bot_player_id, winner)
}

/// Execute bot attacking a card.
fn execute_bot_attack(
    ctx: &ReducerContext,
    mcx: &MatchCtx,
    attacker_row: usize,
    attacker_col: usize,
    defender_row: usize,
    defender_col: usize,
) -> Result<(), String> {
    let mut board: crate::BoardState = serde_json::from_str(&mcx.board_json)
        .map_err(|e| e.to_string())?;

    let attacker_tile = board.tiles[attacker_row][attacker_col].ok_or("No attacker card")?;
    let _defender_tile = board.tiles[defender_row][defender_col].ok_or("No defender card")?;

    if attacker_tile.owner_player_id != Some(mcx.bot_player_id) {
        return Err("Bot does not own attacker".to_string());
    }
    if !attacker_tile.is_attack_mode {
        return Err("Attacker not in attack mode".to_string());
    }

    // Resolve combat
    let attacker_card = ctx.db.cards().id().find(attacker_tile.card_id.unwrap())
        .ok_or("Attacker card not found")?;
    let defender_card = ctx.db.cards().id().find(_defender_tile.card_id.unwrap())
        .ok_or("Defender card not found")?;

    if attacker_card.attack > defender_card.defense {
        board.tiles[defender_row][defender_col] = None;
    } else {
        board.tiles[attacker_row][attacker_col] = None;
    }

    let winner = mcx.check_winner(ctx, &board);
    mcx.update_match(ctx, &board, mcx.bot_player_id, winner)
}

/// Execute bot ending its turn (switches turn to human).
fn execute_bot_end_turn(
    ctx: &ReducerContext,
    mcx: &MatchCtx,
) -> Result<(), String> {
    let mut board: crate::BoardState = serde_json::from_str(&mcx.board_json)
        .map_err(|e| e.to_string())?;
    board.turn_number += 1;
    board.phase = match board.phase {
        crate::MatchPhase::Placement => crate::MatchPhase::Action,
        crate::MatchPhase::Action => crate::MatchPhase::Combat,
        crate::MatchPhase::Combat => crate::MatchPhase::Placement,
    };

    let winner = mcx.check_winner(ctx, &board);
    mcx.update_match(ctx, &board, mcx.human_id(), winner)
}

// Helper functions
fn generate_id(ctx: &ReducerContext) -> u64 {
    ctx.timestamp.to_micros_since_unix_epoch() as u64
}

fn current_timestamp(ctx: &ReducerContext) -> i64 {
    ctx.timestamp.to_micros_since_unix_epoch() / 1_000_000
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
        let raw = base + (crate::random_range(max as usize) as i32);
        raw.clamp(1, 5)
    };
    let range = |base: i32, max: i32| -> i32 {
        let raw = base + (crate::random_range(max as usize) as i32);
        raw.clamp(1, 3)
    };
    match card_type {
        "Unit" => (variance(ba, 3), variance(bd, 2), range(br, 1)),
        "Building" => (0, variance(bd, 5), 1),
        "Spell" => (variance(ba, 2), variance(bd, 2), range(br, 3)),
        _ => (variance(ba, 3), variance(bd, 2), range(br, 1)),
    }
}

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + c.as_str().to_lowercase().as_str(),
    }
}

// ============================================================
// Matchmaking
// ============================================================

/// Add the caller to the matchmaking queue.
/// preferred_opponent: "Bot", "Human", or "Any"
/// bot_difficulty: required if preferred_opponent is "Bot" ("Easy", "Medium", "Hard")
#[reducer]
pub fn join_matchmaking_queue(
    ctx: &ReducerContext,
    preferred_opponent: String,
    bot_difficulty: Option<String>,
) -> Result<(), String> {
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender())
        .ok_or("Caller identity not found")?;
    let player_id = caller_record.player_id;

    // Validate opponent preference
    if !["Bot", "Human", "Any"].contains(&preferred_opponent.as_str()) {
        return Err("preferred_opponent must be 'Bot', 'Human', or 'Any'".to_string());
    }
    if preferred_opponent == "Bot" {
        if let Some(ref diff) = bot_difficulty {
            if !["Easy", "Medium", "Hard"].contains(&diff.as_str()) {
                return Err("bot_difficulty must be 'Easy', 'Medium', or 'Hard'".to_string());
            }
        } else {
            return Err("bot_difficulty required when preferred_opponent is 'Bot'".to_string());
        }
    }

    // Get player rating from player row
    let player_row = ctx.db.players().id().find(player_id)
        .ok_or("Player not found")?;
    let rating = player_row.rating;

    // Remove any existing entry for this player (idempotent)
    ctx.db.matchmaking_entries().player_id().delete(player_id);

    // Add to queue
    ctx.db.matchmaking_entries().insert(MatchmakingEntryRow {
        player_id,
        rating,
        queued_at: current_timestamp(ctx),
        preferred_opponent: preferred_opponent.clone(),
        bot_difficulty: bot_difficulty.clone(),
    });

    // If bot preference, try to immediately match with a bot
    if preferred_opponent == "Bot" {
        let diff = bot_difficulty.unwrap();
        return start_bot_match(ctx, player_id, rating, &diff);
    }

    Ok(())
}

/// Remove the caller from the matchmaking queue.
#[reducer]
pub fn leave_matchmaking_queue(ctx: &ReducerContext) -> Result<(), String> {
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender())
        .ok_or("Caller identity not found")?;
    ctx.db.matchmaking_entries().player_id().delete(caller_record.player_id);
    Ok(())
}

/// Process the matchmaking queue: find human vs human pairs and create matches.
/// Call this periodically (e.g., every few seconds) to pair queued players.
#[reducer]
pub fn process_matchmaking(ctx: &ReducerContext) -> Result<(), String> {
    let entries: Vec<MatchmakingEntryRow> = ctx.db.matchmaking_entries().iter().collect();
    if entries.is_empty() {
        return Ok(());
    }

    let mut matched: Vec<u64> = Vec::new();

    // Sort by queued_at to process FIFO
    let mut sorted = entries.clone();
    sorted.sort_by_key(|e| e.queued_at);

    for entry in sorted.iter() {
        if matched.contains(&entry.player_id) {
            continue;
        }
        if entry.preferred_opponent == "Bot" {
            continue; // bots handled in join_matchmaking_queue
        }

        // Find a match within ±200 rating
        let remaining: Vec<MatchmakingEntryRow> = sorted.iter()
            .filter(|e| {
                e.player_id != entry.player_id
                && !matched.contains(&e.player_id)
                && e.preferred_opponent != "Bot"
                && (e.preferred_opponent == "Any" || e.preferred_opponent == "Human")
                && (e.rating - entry.rating).abs() <= 200
            })
            .cloned()
            .collect();

        if let Some(opponent) = remaining.first() {
            // Create match between entry.player_id and opponent.player_id
            create_human_match(ctx, entry.player_id, opponent.player_id)?;
            matched.push(entry.player_id);
            matched.push(opponent.player_id);
        }
    }

    Ok(())
}

/// Start a bot match for the given human player.
fn start_bot_match(ctx: &ReducerContext, human_player_id: u64, _human_rating: i32, difficulty: &str) -> Result<(), String> {
    // Create bot player
    let bot_player_id = generate_id(ctx);
    let bot_name = format!("Bot_{}", difficulty);
    ctx.db.players().insert(PlayerRow {
        id: bot_player_id,
        name: bot_name.clone(),
        email: format!("bot_{}@ai", bot_player_id),
        created_at: current_timestamp(ctx),
        rating: match difficulty {
            "Easy" => 800,
            "Medium" => 1200,
            "Hard" => 1600,
            _ => 1000,
        },
    });
    ctx.db.bot_players().insert(BotPlayerRow {
        player_id: bot_player_id,
        name: bot_name,
        difficulty: difficulty.to_string(),
    });

    // Remove player from queue
    ctx.db.matchmaking_entries().player_id().delete(human_player_id);

    // Create match
    let match_id = generate_id(ctx);
    let empty_board = crate::BoardState {
        tiles: [[None; 3]; 6],
        turn_number: 1,
        phase: crate::MatchPhase::Placement,
    };
    let board_json = serde_json::to_string(&empty_board).map_err(|e| e.to_string())?;

    ctx.db.game_matches().insert(MatchRow {
        id: match_id,
        player1_id: human_player_id,
        player2_id: bot_player_id,
        board_state_json: board_json,
        current_turn: human_player_id,
        status: "Active".to_string(),
        winner_id: 0,
        created_at: current_timestamp(ctx),
        updated_at: current_timestamp(ctx),
    });

    // Initialize empty hands (players draw cards via draw_card reducer or client)
    Ok(())
}

/// Create a match between two human players.
fn create_human_match(ctx: &ReducerContext, player1_id: u64, player2_id: u64) -> Result<(), String> {
    // Remove both from queue
    ctx.db.matchmaking_entries().player_id().delete(player1_id);
    ctx.db.matchmaking_entries().player_id().delete(player2_id);

    // Create match
    let match_id = generate_id(ctx);
    let empty_board = crate::BoardState {
        tiles: [[None; 3]; 6],
        turn_number: 1,
        phase: crate::MatchPhase::Placement,
    };
    let board_json = serde_json::to_string(&empty_board).map_err(|e| e.to_string())?;

    ctx.db.game_matches().insert(MatchRow {
        id: match_id,
        player1_id,
        player2_id,
        board_state_json: board_json,
        current_turn: player1_id, // player1 goes first
        status: "Active".to_string(),
        winner_id: 0,
        created_at: current_timestamp(ctx),
        updated_at: current_timestamp(ctx),
    });

    Ok(())
}

/// Draw a card from the player's deck into their hand.
/// Uses ctx.timestamp for the hand entry id (microseconds).
#[reducer]
pub fn draw_card(ctx: &ReducerContext, match_id: u64, player_id: u64, deck_id: u64) -> Result<(), String> {
    // Validate caller identity
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender())
        .ok_or("Caller identity not found")?;
    if caller_record.player_id != player_id {
        return Err("Player ID does not match your identity".to_string());
    }

    // Validate player is in match
    let match_row = validate_player_in_match(ctx, match_id, player_id)?;
    if match_row.status == "Completed" {
        return Err("Match is over".to_string());
    }

    // Get deck and parse card IDs
    let deck = ctx.db.decks().id().find(deck_id)
        .ok_or("Deck not found")?;
    if deck.player_id != player_id {
        return Err("Deck does not belong to you".to_string());
    }

    let card_ids: Vec<u64> = serde_json::from_str(&deck.card_ids_json)
        .map_err(|e| e.to_string())?;

    // Find a card not already in hand
    let hand_card_ids: Vec<u64> = ctx.db.player_hands().iter()
        .filter(|r| r.match_id == match_id && r.player_id == player_id)
        .map(|r| r.card_id)
        .collect();

    let card_to_draw = card_ids.iter()
        .find(|cid| !hand_card_ids.contains(cid));

    if let Some(&card_id) = card_to_draw {
        ctx.db.player_hands().insert(PlayerHandRow {
            id: generate_id(ctx),
            match_id,
            card_id,
            player_id,
        });
    }

    Ok(())
}

/// Elo rating update after a match completes.
/// K=32 for new players (under 1600), K=16 for intermediate, K=8 for veterans.
/// Winner gets ~100 XP, loser gets ~30 XP. Level up every 1000 XP.
#[reducer]
pub fn update_rating(
    ctx: &ReducerContext,
    match_id: u64,
    winner_id: u64,
    loser_id: u64,
) -> Result<(), String> {
    // Validate caller identity is one of the match participants
    let caller_record = ctx.db.player_identities().identity().find(ctx.sender())
        .ok_or("Caller identity not found")?;

    // Get the match and verify it is completed
    let mrow = ctx.db.game_matches().id().find(match_id)
        .ok_or("Match not found")?;
    if mrow.status != "Completed" {
        return Err("Match is not completed yet".to_string());
    }
    if winner_id != mrow.player1_id && winner_id != mrow.player2_id {
        return Err("Winner is not a participant in this match".to_string());
    }
    if loser_id != mrow.player1_id && loser_id != mrow.player2_id {
        return Err("Loser is not a participant in this match".to_string());
    }
    if winner_id == loser_id {
        return Err("Winner and loser must be different".to_string());
    }
    // Caller must be one of the two players in the match
    if caller_record.player_id != winner_id && caller_record.player_id != loser_id {
        return Err("Caller is not a participant in this match".to_string());
    }

    // Fetch current ratings
    let winner_player = ctx.db.players().id().find(winner_id)
        .ok_or("Winner player not found")?;
    let loser_player = ctx.db.players().id().find(loser_id)
        .ok_or("Loser player not found")?;

    let winner_rating = winner_player.rating;
    let loser_rating = loser_player.rating;

    // Elo expected score
    let expected_winner = 1.0 / (1.0 + 10.0_f64.powf((loser_rating as f64 - winner_rating as f64) / 400.0));
    let expected_loser = 1.0 - expected_winner;

    // K-factor based on rating
    fn k_factor(rating: i32) -> f64 {
        if rating < 1600 { 32.0 }
        else if rating < 2000 { 24.0 }
        else { 16.0 }
    }

    let k_w = k_factor(winner_rating);
    let k_l = k_factor(loser_rating);

    let new_winner_rating = (winner_rating as f64 + k_w * (1.0 - expected_winner)).round() as i32;
    let new_loser_rating = (loser_rating as f64 + k_l * (0.0 - expected_loser)).round() as i32;

    // Update player ratings
    ctx.db.players().id().update(PlayerRow {
        id: winner_player.id,
        name: winner_player.name.clone(),
        email: winner_player.email.clone(),
        created_at: winner_player.created_at,
        rating: new_winner_rating,
    });
    ctx.db.players().id().update(PlayerRow {
        id: loser_player.id,
        name: loser_player.name.clone(),
        email: loser_player.email.clone(),
        created_at: loser_player.created_at,
        rating: new_loser_rating,
    });

    // XP rewards
    let xp_win = 100;
    let xp_loss = 30;

    // Get or init winner progress
    let w_progress = ctx.db.player_progress().player_id().find(winner_id);
    if let Some(wp) = w_progress {
        let new_xp = wp.xp + xp_win;
        let (new_level, _new_xp_to_next) = level_for_xp(new_xp, wp.level);
        let level_ups = new_level - wp.level;
        let xp_to_next = if level_ups > 0 { xp_for_level(new_level + 1) - new_xp } else { wp.xp_to_next_level };
        ctx.db.player_progress().player_id().update(PlayerProgressRow {
            player_id: wp.player_id,
            level: new_level,
            xp: new_xp,
            xp_to_next_level: xp_to_next,
            total_wins: wp.total_wins + 1,
            total_losses: wp.total_losses,
            cards_collected: wp.cards_collected,
            matches_played: wp.matches_played + 1,
        });
    } else {
        let level = 1;
        ctx.db.player_progress().insert(PlayerProgressRow {
            player_id: winner_id,
            level,
            xp: xp_win,
            xp_to_next_level: xp_for_level(level + 1) - xp_win,
            total_wins: 1,
            total_losses: 0,
            cards_collected: 0,
            matches_played: 1,
        });
    }

    // Get or init loser progress
    let l_progress = ctx.db.player_progress().player_id().find(loser_id);
    if let Some(lp) = l_progress {
        let new_xp = lp.xp + xp_loss;
        let (new_level, _) = level_for_xp(new_xp, lp.level);
        let xp_to_next = xp_for_level(new_level + 1) - new_xp;
        ctx.db.player_progress().player_id().update(PlayerProgressRow {
            player_id: lp.player_id,
            level: new_level,
            xp: new_xp,
            xp_to_next_level: xp_to_next,
            total_wins: lp.total_wins,
            total_losses: lp.total_losses + 1,
            cards_collected: lp.cards_collected,
            matches_played: lp.matches_played + 1,
        });
    } else {
        let level = 1;
        ctx.db.player_progress().insert(PlayerProgressRow {
            player_id: loser_id,
            level,
            xp: xp_loss,
            xp_to_next_level: xp_for_level(level + 1) - xp_loss,
            total_wins: 0,
            total_losses: 1,
            cards_collected: 0,
            matches_played: 1,
        });
    }

    Ok(())
}

/// XP required to reach a given level (1000 per level).
fn xp_for_level(level: i32) -> i32 {
    level * 1000
}

/// Compute level from total XP, starting from current level.
fn level_for_xp(xp: i32, current_level: i32) -> (i32, i32) {
    let mut level = current_level;
    while xp >= xp_for_level(level + 1) {
        level += 1;
    }
    (level, xp_for_level(level + 1) - xp)
}
