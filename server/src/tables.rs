use spacetime_db::{db::Table, types::{*, string::*}};
use serde::{Deserialize, Serialize};

// Player information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: PlayerId,
    pub name: String,
    pub email: String,
    pub created_at: i64,
    pub rating: i32,
    pub deck_size_preference: DeckSize,
}

// Unique AI-generated card
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Card {
    pub id: CardId,
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub attack: i32,
    pub defense: i32,
    pub range: i32,
    pub rarity: Rarity,
    pub card_type: CardType,
    pub seed_noun: String,
    pub created_at: i64,
    pub last_used_count: i32,
}

// Player's deck collection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Deck {
    pub id: DeckId,
    pub player_id: PlayerId,
    pub name: String,
    pub cards: Vec<CardId>,
    pub created_at: i64,
    pub updated_at: i64,
}

// Active match/game state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Match {
    pub id: MatchId,
    pub player1_id: PlayerId,
    pub player2_id: PlayerId,
    pub board_state: BoardState,
    pub current_turn: PlayerId,
    pub status: MatchStatus,
    pub winner_id: Option<PlayerId>,
    pub created_at: i64,
    pub updated_at: i64,
}

// 6x3 board state for active matches
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoardState {
    pub tiles: [[Option<BoardTile>; 3]; 6], // 6x3 grid
    pub turn_number: i32,
    pub phase: MatchPhase,
}

// Individual tile on the board
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoardTile {
    pub card_id: Option<CardId>,
    pub is_face_up: bool,
    pub is_attack_mode: bool,
    pub owner_player_id: Option<PlayerId>,
}

// Card pack for new players
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardPack {
    pub id: PackId,
    pub cards: Vec<CardId>,
    pub opened_at: Option<i64>,
    pub opened_by_player_id: Option<PlayerId>,
}

// Re-export all public types
pub use crate::types::*;

// Enums for typed values
#[derive(Debug, Clone, Serialize, Deserialize, spacetime_db::types::Value)]
pub enum Rarity {
    Common = 1,
    Rare = 2,
    Epic = 3,
    Legendary = 4,
}

#[derive(Debug, Clone, Serialize, Deserialize, spacetime_db::types::Value)]
pub enum CardType {
    Unit = 1,
    Building = 2,
    Spell = 3,
}

#[derive(Debug, Clone, Serialize, Deserialize, spacetime_db::types::Value)]
pub enum DeckSize {
    Standard = 30,
    Large = 50,
    Tournament = 100,
}

#[derive(Debug, Clone, Serialize, Deserialize, spacetime_db::types::Value)]
pub enum MatchStatus {
    Waiting = 1,
    Active = 2,
    Completed = 3,
    Abandoned = 4,
}

#[derive(Debug, Clone, Serialize, Deserialize, spacetime_db::types::Value)]
pub enum MatchPhase {
    Placement = 1,
    Action = 2,
    Combat = 3,
}

// Table definitions
#[reducer(table)]
pub fn players_table() -> Table<PlayerId, Player> {
    Table::new("players")
}

#[reducer(table)]
pub fn cards_table() -> Table<CardId, Card> {
    Table::new("cards")
}

#[reducer(table)]
pub fn decks_table() -> Table<DeckId, Deck> {
    Table::new("decks")
}

#[reducer(table)]
pub fn matches_table() -> Table<MatchId, Match> {
    Table::new("matches")
}

#[reducer(table)]
pub fn card_packs_table() -> Table<PackId, CardPack> {
    Table::new("card_packs")
}

// Helper functions for generating IDs
pub fn generate_card_id() -> CardId {
    // Simple ID generation - in production use proper UUID or sequence
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

pub fn generate_player_id() -> PlayerId {
    // Simple ID generation
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}