use serde::{Deserialize, Serialize};

use crate::{PlayerId, CardId};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BotDifficulty {
    Easy,    // Random moves, no strategy
    Medium,  // Basic strategy, prefers good trades
    Hard,    // Optimal play, considers board state
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BotPlayer {
    pub player_id: PlayerId,
    pub difficulty: BotDifficulty,
    pub name: String,
}

// ============================================================
// Bot AI Actions
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BotAction {
    PlaceCard { card_id: CardId, x: usize, y: usize, face_up: bool, attack_mode: bool },
    MoveCard { from_x: usize, from_y: usize, to_x: usize, to_y: usize },
    AttackCard { attacker_x: usize, attacker_y: usize, defender_x: usize, defender_y: usize },
    FlipCard { x: usize, y: usize },
    SwitchMode { x: usize, y: usize },
    EndTurn,
}
