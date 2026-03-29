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
            if diff <= 200 {
                if best.map_or(true, |(_, bd)| diff < bd) {
                    best = Some((i, diff));
                }
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
// Card Reward System
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchRewards {
    pub cards_won: Vec<CardId>,
    pub rating_change: i32,
    pub xp_gained: i32,
}

impl GameState {
    /// Calculate rewards for a completed match
    pub fn calculate_match_rewards(&mut self, winner_id: PlayerId, loser_id: PlayerId, was_bot_match: bool) -> MatchRewards {
        // Generate reward card
        let card_id = self.generate_reward_card(was_bot_match);

        // Elo calculation
        let winner = self.players.get(&winner_id);
        let loser = self.players.get(&loser_id);
        let rating_change = match (winner, loser) {
            (Some(w), Some(l)) => {
                let k = get_k_factor(0, w.rating);
                let (new_w, _) = calculate_elo(w.rating, l.rating, k);
                new_w - w.rating
            }
            _ => 16,
        };

        let xp_gained = if was_bot_match { 25 } else { 50 };

        MatchRewards {
            cards_won: vec![card_id],
            rating_change,
            xp_gained,
        }
    }

    fn generate_reward_card(&mut self, was_bot_match: bool) -> CardId {
        let seed_nouns = [
            "Dragon", "Wizard", "Knight", "Unicorn", "Phoenix", "Goblin", "Elf",
            "Troll", "Fairy", "Demon", "Angel", "Golem", "Sphinx", "Griffin",
            "Kraken", "Hydra", "Chimera", "Basilisk", "Wraith", "Shade",
        ];
        let noun_idx = (self.current_timestamp() as usize) % seed_nouns.len();
        let seed_noun = seed_nouns[noun_idx];

        let rarity = {
            let roll = random_f32();
            if was_bot_match {
                match roll {
                    r if r < 0.65 => Rarity::Common,
                    r if r < 0.88 => Rarity::Rare,
                    r if r < 0.97 => Rarity::Epic,
                    _ => Rarity::Legendary,
                }
            } else {
                match roll {
                    r if r < 0.50 => Rarity::Common,
                    r if r < 0.80 => Rarity::Rare,
                    r if r < 0.95 => Rarity::Epic,
                    _ => Rarity::Legendary,
                }
            }
        };

        self.generate_card(seed_noun.to_string(), Some(rarity), None)
    }

    /// Apply match rewards: update ratings, add cards to winner's deck
    pub fn apply_rewards(&mut self, winner_id: PlayerId, rewards: &MatchRewards) {
        // Update rating
        if let Some(player) = self.players.get_mut(&winner_id) {
            player.rating += rewards.rating_change;
        }

        // Add reward cards to winner's first deck
        let timestamp = self.current_timestamp();
        if let Some(deck_id) = self.decks.iter().find(|(_, d)| d.player_id == winner_id).map(|(id, _)| *id) {
            for &card_id in &rewards.cards_won {
                if let Some(deck) = self.decks.get_mut(&deck_id) {
                    if !deck.cards.contains(&card_id) {
                        deck.cards.push(card_id);
                        deck.updated_at = timestamp;
                    }
                }
            }
        }

        // Update progression
        if let Some(progress) = self.player_progress.get_mut(&winner_id) {
            progress.add_xp(rewards.xp_gained);
            progress.total_wins += 1;
            progress.matches_played += 1;
            progress.cards_collected += rewards.cards_won.len() as i32;
        }
    }

    // ============================================================
    // Usage-Based Stat Scaling
    // ============================================================

    /// Get a card's effective stats accounting for usage-based balance scaling.
    /// Overused cards get nerfed, underused cards get buffed.
    pub fn get_effective_stats(card: &Card) -> (i32, i32) {
        let threshold_high = 50;
        let threshold_low = 5;

        let (atk_scale, def_scale) = if card.last_used_count > threshold_high {
            let overuse = (card.last_used_count - threshold_high) as f32;
            let nerf = 1.0 - (overuse / 500.0).min(0.15);
            (nerf, nerf)
        } else if card.last_used_count < threshold_low {
            let underuse = (threshold_low - card.last_used_count) as f32;
            let buff = 1.0 + (underuse / 50.0).min(0.10);
            (buff, buff)
        } else {
            (1.0, 1.0)
        };

        let atk = ((card.attack as f32 * atk_scale) as i32).max(1);
        let def = ((card.defense as f32 * def_scale) as i32).max(1);
        (atk, def)
    }

    /// Record card usage (call when a card is played in a match)
    pub fn record_card_usage(&mut self, card_id: CardId) {
        if let Some(card) = self.cards.get_mut(&card_id) {
            card.last_used_count += 1;
        }
    }

    // ============================================================
    // Bot Match Creation
    // ============================================================

    /// Create a bot player with an appropriate deck and return the match
    pub fn create_bot_match(&mut self, human_player_id: PlayerId, difficulty: BotDifficulty) -> MatchId {
        let bot_name = match &difficulty {
            BotDifficulty::Easy => "Bot (Easy) 🤖",
            BotDifficulty::Medium => "Bot (Medium) 🤖",
            BotDifficulty::Hard => "Bot (Hard) 🤖",
        };

        let bot_player_id = self.create_player(
            bot_name.to_string(),
            format!("bot-{}@ai-monsters.game", self.current_timestamp()),
        );

        // Create bot deck
        let deck_id = self.create_deck(bot_player_id, format!("{} Deck", bot_name));

        let card_count = match &difficulty {
            BotDifficulty::Easy => 7,
            BotDifficulty::Medium => 10,
            BotDifficulty::Hard => 12,
        };

        let seed_nouns = [
            "Dragon", "Wizard", "Knight", "Goblin", "Elf", "Troll",
            "Fairy", "Demon", "Angel", "Golem", "Sphinx", "Griffin",
            "Wolf", "Eagle", "Shark", "Tiger", "Spider", "Bee",
        ];

        for i in 0..card_count {
            let noun = seed_nouns[i % seed_nouns.len()];
            let rarity = match &difficulty {
                BotDifficulty::Easy => match random_f32() {
                    r if r < 0.80 => Rarity::Common,
                    r if r < 0.95 => Rarity::Rare,
                    _ => Rarity::Epic,
                },
                BotDifficulty::Medium => match random_f32() {
                    r if r < 0.60 => Rarity::Common,
                    r if r < 0.85 => Rarity::Rare,
                    r if r < 0.97 => Rarity::Epic,
                    _ => Rarity::Legendary,
                },
                BotDifficulty::Hard => match random_f32() {
                    r if r < 0.40 => Rarity::Common,
                    r if r < 0.70 => Rarity::Rare,
                    r if r < 0.90 => Rarity::Epic,
                    _ => Rarity::Legendary,
                },
            };

            let card_id = self.generate_card(noun.to_string(), Some(rarity), None);
            if let Some(deck) = self.decks.get_mut(&deck_id) {
                deck.cards.push(card_id);
            }
        }

        // Store bot info
        self.bots.insert(bot_player_id, BotPlayer {
            player_id: bot_player_id,
            difficulty,
            name: bot_name.to_string(),
        });

        // Create match
        self.create_match(human_player_id, bot_player_id)
    }

    /// Get bot action for current turn
    pub fn get_bot_turn(&self, match_id: MatchId) -> Option<BotAction> {
        let match_data = self.matches.get(&match_id)?;
        let bot_id = match_data.player2_id; // Bot is always player 2

        let bot = self.bots.get(&bot_id)?;
        Some(get_bot_action(self, match_data, bot_id, &bot.difficulty))
    }

    /// Convenience: create a deck without needing Red
    fn create_deck(&mut self, player_id: PlayerId, name: String) -> DeckId {
        let deck_id = self.generate_id();
        let deck = Deck {
            id: deck_id,
            player_id,
            name,
            cards: Vec::new(),
            created_at: self.current_timestamp(),
            updated_at: self.current_timestamp(),
        };
        self.decks.insert(deck_id, deck);
        deck_id
    }

    /// Convenience: create a match
    fn create_match(&mut self, player1_id: PlayerId, player2_id: PlayerId) -> MatchId {
        let match_id = self.generate_id();
        let match_data = Match {
            id: match_id,
            player1_id,
            player2_id,
            board_state: BoardState {
                tiles: [[None; 3]; 6],
                turn_number: 1,
                phase: MatchPhase::Placement,
            },
            current_turn: player1_id,
            status: MatchStatus::Active,
            winner_id: None,
            created_at: self.current_timestamp(),
            updated_at: self.current_timestamp(),
        };
        self.matches.insert(match_id, match_data);
        match_id
    }
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
