use spacetimedb::{reducer, ReducerContext, Table};
use crate::tables::*;

// Player management reducers
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
    ctx.db.matches().insert(match_row);
    Ok(())
}

// End turn
#[reducer]
pub fn end_turn(ctx: &ReducerContext, match_id: u64) -> Result<(), String> {
    let match_row = ctx.db.matches().id().find(match_id)
        .ok_or("Match not found")?;

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

    let board_json = serde_json::to_string(&board).map_err(|e| e.to_string())?;

    ctx.db.matches().id().update(MatchRow {
        id: match_id,
        player1_id: match_row.player1_id,
        player2_id: match_row.player2_id,
        board_state_json: board_json,
        current_turn: next_turn,
        status: match_row.status,
        winner_id: match_row.winner_id,
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
