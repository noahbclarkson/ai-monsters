use serde::{Deserialize, Serialize};

pub mod bot_ai;
pub mod daily_cards;
pub mod matchmaking;
pub mod tables;
pub mod reducers;
pub mod procedures;
pub mod views; // kept for future use, currently empty

pub use bot_ai::*;
pub use matchmaking::*;

// Simple pseudo-random number generator for WebAssembly compatibility
struct SimpleRng {
    seed: u64,
}

impl SimpleRng {
    fn new() -> Self {
        SimpleRng { seed: 0xdeadbeef12345678 }
    }
    
    fn next_f32(&mut self) -> f32 {
        self.seed = self.seed.wrapping_mul(0x5deece66d) + 1;
        (self.seed >> 16) as f32 / (1u64 << 16) as f32
    }
    
    fn next_range(&mut self, max: usize) -> usize {
        (self.next_f32() * max as f32) as usize
    }
}

thread_local! {
    static RNG: std::cell::RefCell<SimpleRng> = std::cell::RefCell::new(SimpleRng::new());
}

pub fn random_f32() -> f32 {
    RNG.with(|rng| rng.borrow_mut().next_f32())
}

pub fn random_range(max: usize) -> usize {
    RNG.with(|rng| rng.borrow_mut().next_range(max))
}

// Type aliases
pub type PlayerId = u64;
pub type CardId = u64;
pub type DeckId = u64;
pub type MatchId = u64;
pub type PackId = u64;

// Enums
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum Rarity {
    Common = 1,
    Rare = 2,
    Epic = 3,
    Legendary = 4,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum CardType {
    Unit = 1,
    Building = 2,
    Spell = 3,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum MatchStatus {
    Waiting = 1,
    Active = 2,
    Completed = 3,
    Abandoned = 4,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum MatchPhase {
    Placement = 1,
    Action = 2,
    Combat = 3,
}

// Board state structures (used in game_matches.board_state_json)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoardState {
    pub tiles: [[Option<BoardTile>; 3]; 6],
    pub turn_number: i32,
    pub phase: MatchPhase,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct BoardTile {
    pub card_id: Option<CardId>,
    pub is_face_up: bool,
    pub is_attack_mode: bool,
    pub owner_player_id: Option<PlayerId>,
}

/// Returns the ID of the player who has won, if any.
/// Win condition: a player wins when their opponent has zero cards on the board AND zero cards in hand.
pub fn check_win(board: &BoardState, player1_id: PlayerId, player2_id: PlayerId, p1_hand_count: usize, p2_hand_count: usize) -> Option<PlayerId> {
    let p1_board_cards = board.tiles.iter().flatten().filter(|t| t.as_ref().is_some_and(|tile| tile.owner_player_id == Some(player1_id))).count();
    let p2_board_cards = board.tiles.iter().flatten().filter(|t| t.as_ref().is_some_and(|tile| tile.owner_player_id == Some(player2_id))).count();

    let p1_total = p1_board_cards + p1_hand_count;
    let p2_total = p2_board_cards + p2_hand_count;

    if p1_total == 0 && p2_total > 0 {
        return Some(player2_id);
    }
    if p2_total == 0 && p1_total > 0 {
        return Some(player1_id);
    }
    None
}
