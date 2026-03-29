use spacetime_db::{error, prelude::*};

// Define the database schema with tables
#[spacetime_db::table]
struct Players {
    pub id: u64,
    pub name: String,
    pub email: String,
    pub created_at: u64,
}

#[spacetime_db::table]
struct Cards {
    pub id: u64,
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub attack: u32,
    pub defense: u32,
    pub range: u32,
    pub rarity: String,
    pub card_type: String,
    pub created_at: u64,
}

#[spacetime_db::table]
struct Decks {
    pub id: u64,
    pub player_id: u64,
    pub card_ids: Vec<u64>,
    pub created_at: u64,
}

#[spacetime_db::table]
struct Matches {
    pub id: u64,
    pub player1_id: u64,
    pub player2_id: u64,
    pub winner_id: Option<u64>,
    pub started_at: u64,
    pub ended_at: Option<u64>,
}

#[spacetime_db::table]
struct BoardState {
    pub match_id: u64,
    pub player_id: u64,
    pub card_id: u64,
    pub position_x: u32,
    pub position_y: u32,
    pub is_face_up: bool,
    pub is_attack_mode: bool,
}

// Reducers for game actions
#[spacetime_db::reducer]
fn create_player(name: String, email: String) -> Result<(), error::Error> {
    let id = next_id();
    let now = current_timestamp();
    
    Players::insert(Players {
        id,
        name,
        email,
        created_at: now,
    })?;
    
    Ok(())
}

#[spacetime_db::reducer]
fn generate_card() -> Result<(), error::Error> {
    let id = next_id();
    let now = current_timestamp();
    
    // TODO: Implement actual card generation logic
    // For now, create a placeholder card
    Cards::insert(Cards {
        id,
        name: "Test Card".to_string(),
        description: "A test card".to_string(),
        image_url: "".to_string(),
        attack: 10,
        defense: 10,
        range: 1,
        rarity: "Common".to_string(),
        card_type: "Unit".to_string(),
        created_at: now,
    })?;
    
    Ok(())
}

// Main module export
#[spacetime_db::module]
pub mod ai_monsters {
    use super::*;

    // Export tables and reducers
    pub use Players;
    pub use Cards;
    pub use Decks;
    pub use Matches;
    pub use BoardState;
    pub use create_player;
    pub use generate_card;
}