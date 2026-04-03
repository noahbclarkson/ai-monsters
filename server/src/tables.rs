use spacetimedb::table;

// SpacetimeDB 2.1.0: requires both name (string) and accessor (identifier)

#[table(name = "players", public, accessor = players)]
pub struct PlayerRow {
    #[primary_key]
    pub id: u64,
    #[unique]
    pub name: String,
    #[index(btree)]
    pub email: String,
    #[index(btree)]
    pub created_at: i64,
    #[index(btree)]
    pub rating: i32,
}

#[table(name = "cards", public, accessor = cards)]
pub struct CardRow {
    #[primary_key]
    pub id: u64,
    #[index(btree)]
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub attack: i32,
    pub defense: i32,
    pub range: i32,
    #[index(btree)]
    pub rarity: String,
    #[index(btree)]
    pub card_type: String,
    #[index(btree)]
    pub seed_noun: String,
    #[index(btree)]
    pub created_at: i64,
    #[index(btree)]
    pub last_used_count: i32,
}

#[table(name = "decks", public, accessor = decks)]
pub struct DeckRow {
    #[primary_key]
    pub id: u64,
    #[index(btree)]
    pub player_id: u64,
    #[index(btree)]
    pub name: String,
    pub card_ids_json: String,
    #[index(btree)]
    pub created_at: i64,
    #[index(btree)]
    pub updated_at: i64,
}

// Renamed accessor to game_matches to avoid clash with Rust built-in
#[table(name = "game_matches", public, accessor = game_matches)]
pub struct MatchRow {
    #[primary_key]
    pub id: u64,
    #[index(btree)]
    pub player1_id: u64,
    #[index(btree)]
    pub player2_id: u64,
    pub board_state_json: String,
    pub current_turn: u64,
    #[index(btree)]
    pub status: String,
    pub winner_id: u64,
    #[index(btree)]
    pub created_at: i64,
    #[index(btree)]
    pub updated_at: i64,
}

#[table(name = "card_packs", public, accessor = card_packs)]
pub struct CardPackRow {
    #[primary_key]
    pub id: u64,
    pub card_ids_json: String,
    #[index(btree)]
    pub opened_at: i64,
    #[index(btree)]
    pub opened_by_player_id: u64,
}

// Tracks which cards are in each player's hand during a match.
// A player loses when they have zero cards on the board AND zero cards in hand.
#[table(name = "player_hands", public, accessor = player_hands)]
pub struct PlayerHandRow {
    #[primary_key]
    pub id: u64,
    #[index(btree)]
    pub match_id: u64,
    #[index(btree)]
    pub card_id: u64,
    #[index(btree)]
    pub player_id: u64,
}

// Maps SpacetimeDB identities (128-bit) to our player_id (u64).
// Used by client_connected to link a SpacetimeDB client to a player row.
#[table(name = "player_identities", public, accessor = player_identities)]
pub struct PlayerIdentityRow {
    #[primary_key]
    pub identity: spacetimedb::Identity,
    pub player_id: u64,
}

// Bot players for single-player mode
#[table(name = "bot_players", public, accessor = bot_players)]
pub struct BotPlayerRow {
    #[primary_key]
    pub player_id: u64,
    pub name: String,
    pub difficulty: String, // "Easy", "Medium", "Hard"
}

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
