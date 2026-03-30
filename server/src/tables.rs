use spacetimedb::table;

// Re-export types from lib for use in other SpacetimeDB modules
pub use crate::{
    PlayerId, CardId, DeckId, MatchId, PackId,
};

// SpacetimeDB table definitions
// These use the #[table] attribute macro which generates table handles
// accessible via ctx.db.{table_name}()

#[table(name = players, public)]
pub struct PlayerRow {
    #[primary_key]
    pub id: u64,
    #[unique]
    pub name: String,
    pub email: String,
    pub created_at: i64,
    pub rating: i32,
}

#[table(name = cards, public)]
pub struct CardRow {
    #[primary_key]
    pub id: u64,
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub attack: i32,
    pub defense: i32,
    pub range: i32,
    pub rarity: String,  // Stored as string for SpacetimeDB compatibility
    pub card_type: String,
    pub seed_noun: String,
    pub created_at: i64,
    pub last_used_count: i32,
}

#[table(name = decks, public)]
pub struct DeckRow {
    #[primary_key]
    pub id: u64,
    pub player_id: u64,
    pub name: String,
    pub card_ids_json: String,  // JSON-serialized Vec<u64> for SpacetimeDB compatibility
    pub created_at: i64,
    pub updated_at: i64,
}

#[table(name = matches, public)]
pub struct MatchRow {
    #[primary_key]
    pub id: u64,
    pub player1_id: u64,
    pub player2_id: u64,
    pub board_state_json: String,  // JSON-serialized BoardState
    pub current_turn: u64,
    pub status: String,  // "Waiting", "Active", "Completed", "Abandoned"
    pub winner_id: u64,  // 0 = no winner yet
    pub created_at: i64,
    pub updated_at: i64,
}

#[table(name = card_packs, public)]
pub struct CardPackRow {
    #[primary_key]
    pub id: u64,
    pub card_ids_json: String,  // JSON-serialized Vec<u64>
    pub opened_at: i64,  // 0 = not opened
    pub opened_by_player_id: u64,  // 0 = not opened
}

// Helper functions for generating IDs
pub fn generate_id() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

pub fn current_timestamp() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}
