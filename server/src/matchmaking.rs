use serde::{Deserialize, Serialize};

use crate::*;

// ============================================================
// Matchmaking Queue
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchmakingEntry {
    pub player_id: PlayerId,
    pub rating: i32,
    pub queued_at: i64,
    pub preferred_opponent: OpponentPreference,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum OpponentPreference {
    Bot(BotDifficulty),
    Human,
    Any,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MatchmakingQueue {
    pub entries: Vec<MatchmakingEntry>,
}

impl MatchmakingQueue {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn enqueue(&mut self, entry: MatchmakingEntry) {
        self.entries.retain(|e| e.player_id != entry.player_id);
        self.entries.push(entry);
    }

    pub fn dequeue(&mut self, player_id: PlayerId) {
        self.entries.retain(|e| e.player_id != player_id);
    }

    /// Find a human opponent within ±200 rating
    pub fn find_match(&mut self, player_id: PlayerId) -> Option<MatchmakingEntry> {
        let my_entry = self.entries.iter().find(|e| e.player_id == player_id)?;
        let my_rating = my_entry.rating;

        let mut best: Option<(usize, i32)> = None;
        for (i, entry) in self.entries.iter().enumerate() {
            if entry.player_id == player_id { continue; }
            if matches!(entry.preferred_opponent, OpponentPreference::Bot(_)) { continue; }
            let diff = (entry.rating - my_rating).abs();
            if diff <= 200
                && best.is_none_or(|(_, bd)| diff < bd) {
                    best = Some((i, diff));
            }
        }

        best.map(|(idx, _)| self.entries.remove(idx))
    }
}

// ============================================================
// Elo Rating System
// ============================================================

/// Calculate new Elo ratings. Returns (new_winner_rating, new_loser_rating).
pub fn calculate_elo(winner_rating: i32, loser_rating: i32, k_factor: i32) -> (i32, i32) {
    let expected_winner = 1.0 / (1.0 + 10f32.powf((loser_rating - winner_rating) as f32 / 400.0));
    let expected_loser = 1.0 - expected_winner;

    let w = winner_rating + (k_factor as f32 * (1.0 - expected_winner)) as i32;
    let l = loser_rating + (k_factor as f32 * (0.0 - expected_loser)) as i32;

    (w.max(100), l.max(100))
}

pub fn get_k_factor(games_played: i32, rating: i32) -> i32 {
    if games_played < 30 { 40 }
    else if rating < 2400 { 20 }
    else { 10 }
}


// ============================================================
// Player Progression
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerProgress {
    pub player_id: PlayerId,
    pub level: i32,
    pub xp: i32,
    pub xp_to_next_level: i32,
    pub total_wins: i32,
    pub total_losses: i32,
    pub cards_collected: i32,
    pub matches_played: i32,
}

impl PlayerProgress {
    pub fn new(player_id: PlayerId) -> Self {
        Self {
            player_id,
            level: 1,
            xp: 0,
            xp_to_next_level: 100,
            total_wins: 0,
            total_losses: 0,
            cards_collected: 0,
            matches_played: 0,
        }
    }

    /// Add XP, level up if needed. Returns true if leveled up.
    pub fn add_xp(&mut self, amount: i32) -> bool {
        self.xp += amount;
        let mut leveled = false;
        while self.xp >= self.xp_to_next_level {
            self.xp -= self.xp_to_next_level;
            self.level += 1;
            self.xp_to_next_level = (100.0 * 1.2f32.powi(self.level - 1)) as i32;
            leveled = true;
        }
        leveled
    }
}

pub fn get_rank_title(level: i32) -> &'static str {
    match level {
        1..=5 => "Novice Monster Tamer",
        6..=10 => "Apprentice Tamer",
        11..=20 => "Monster Trainer",
        21..=30 => "Skilled Trainer",
        31..=50 => "Monster Master",
        51..=75 => "Elite Tamer",
        76..=100 => "Legendary Tamer",
        _ => "Mythic Tamer",
    }
}

pub fn get_rating_tier(rating: i32) -> &'static str {
    match rating {
        0..=799 => "Bronze",
        800..=999 => "Silver",
        1000..=1199 => "Gold",
        1200..=1399 => "Platinum",
        1400..=1599 => "Diamond",
        1600..=1899 => "Master",
        _ => "Grandmaster",
    }
}
