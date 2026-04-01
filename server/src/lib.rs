use serde::{Deserialize, Serialize};

pub mod bot_ai;
pub mod daily_cards;
pub mod matchmaking;
pub mod tables;
pub mod reducers;
pub mod procedures;
pub mod views; // kept for future use, currently empty
pub mod types;

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
pub enum DeckSize {
    Standard = 30,
    Large = 50,
    Tournament = 100,
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

// Data structures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: PlayerId,
    pub name: String,
    pub email: String,
    pub created_at: i64,
    pub rating: i32,
}

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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Deck {
    pub id: DeckId,
    pub player_id: PlayerId,
    pub name: String,
    pub cards: Vec<CardId>,
    pub created_at: i64,
    pub updated_at: i64,
}

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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardPack {
    pub id: PackId,
    pub cards: Vec<CardId>,
    pub opened_at: Option<i64>,
    pub opened_by_player_id: Option<PlayerId>,
}

// Game state
pub struct GameState {
    pub players: std::collections::HashMap<PlayerId, Player>,
    pub cards: std::collections::HashMap<CardId, Card>,
    pub decks: std::collections::HashMap<DeckId, Deck>,
    pub matches: std::collections::HashMap<MatchId, Match>,
    pub card_packs: std::collections::HashMap<PackId, CardPack>,
    pub bots: std::collections::HashMap<PlayerId, BotPlayer>,
    pub matchmaking_queue: MatchmakingQueue,
    pub player_progress: std::collections::HashMap<PlayerId, PlayerProgress>,
}

impl Default for GameState {
    fn default() -> Self {
        Self::new()
    }
}

impl GameState {
    pub fn new() -> Self {
        Self {
            players: std::collections::HashMap::new(),
            cards: std::collections::HashMap::new(),
            decks: std::collections::HashMap::new(),
            matches: std::collections::HashMap::new(),
            card_packs: std::collections::HashMap::new(),
            bots: std::collections::HashMap::new(),
            matchmaking_queue: MatchmakingQueue::new(),
            player_progress: std::collections::HashMap::new(),
        }
    }

    pub fn current_timestamp(&self) -> i64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64
    }

    pub fn generate_id(&mut self) -> u64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64
    }

    pub fn create_player(&mut self, name: String, email: String) -> PlayerId {
        let id = self.generate_id();
        self.players.insert(id, Player {
            id,
            name,
            email,
            created_at: self.current_timestamp(),
            rating: 1000,
        });
        id
    }

    pub fn generate_card(&mut self, seed_noun: String, rarity: Option<Rarity>, card_type: Option<CardType>) -> CardId {
        let id = self.generate_id();
        let rarity = rarity.unwrap_or(Rarity::Common);
        let card_type = card_type.unwrap_or(CardType::Unit);
        let (attack, defense, range) = self.generate_card_stats(&rarity, &card_type);
        
        self.cards.insert(id, Card {
            id,
            name: format!("{} {}", capitalize(&seed_noun), card_type_suffix(&card_type)),
            description: format!("A {} {}", seed_noun, card_type_name(&card_type)),
            image_url: format!("/placeholder/{}.png", id),
            attack, defense, range,
            rarity,
            card_type,
            seed_noun,
            created_at: self.current_timestamp(),
            last_used_count: 0,
        });
        id
    }

    pub fn generate_card_pack(&mut self, _player_id: PlayerId, size: DeckSize) -> PackId {
        let pack_id = self.generate_id();
        let card_count = match size {
            DeckSize::Standard => 7,
            DeckSize::Large => 15,
            DeckSize::Tournament => 25,
        };
        let seed_nouns = [
            "Dragon", "Wizard", "Knight", "Unicorn", "Phoenix", "Goblin", "Elf",
            "Troll", "Fairy", "Demon", "Angel", "Golem", "Sphinx", "Griffin",
            "Lizard", "Snake", "Bird", "Bear", "Wolf", "Eagle", "Shark", "Whale",
            "Tiger", "Lion", "Rabbit", "Mouse", "Spider", "Ant", "Bee",
        ];
        let mut cards = Vec::new();
        for _ in 0..card_count {
            let noun = seed_nouns[random_range(seed_nouns.len())];
            let rarity = match random_range(100) {
                r if r < 70 => Rarity::Common,
                r if r < 90 => Rarity::Rare,
                r if r < 98 => Rarity::Epic,
                _ => Rarity::Legendary,
            };
            cards.push(self.generate_card(noun.to_string(), Some(rarity), None));
        }
        self.card_packs.insert(pack_id, CardPack {
            id: pack_id, cards, opened_at: None, opened_by_player_id: None,
        });
        pack_id
    }

    fn generate_card_stats(&self, rarity: &Rarity, card_type: &CardType) -> (i32, i32, i32) {
        let (ba, bd, br) = match rarity {
            Rarity::Common => (3, 3, 1),
            Rarity::Rare => (5, 5, 2),
            Rarity::Epic => (8, 8, 3),
            Rarity::Legendary => (12, 12, 4),
        };
        match card_type {
            CardType::Unit => (ba + random_range(3) as i32, bd + random_range(2) as i32, br + random_range(1) as i32),
            CardType::Building => (0, bd + random_range(5) as i32, 1),
            CardType::Spell => (ba + random_range(2) as i32, bd + random_range(2) as i32, br + random_range(3) as i32),
        }
    }
}

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + c.as_str().to_lowercase().as_str(),
    }
}

fn card_type_suffix(ct: &CardType) -> &'static str {
    match ct { CardType::Unit => "Warrior", CardType::Building => "Tower", CardType::Spell => "Magic" }
}

fn card_type_name(ct: &CardType) -> &'static str {
    match ct { CardType::Unit => "Unit", CardType::Building => "Building", CardType::Spell => "Spell" }
}

/// Returns the ID of the player who has won, if any.
/// Win condition: a player wins when their opponent has zero cards on the board.
pub fn check_win(board: &BoardState, player1_id: PlayerId, player2_id: PlayerId) -> Option<PlayerId> {
    let p1_has_cards = board.tiles.iter().flatten().any(|t| t.as_ref().is_some_and(|tile| tile.owner_player_id == Some(player1_id)));
    let p2_has_cards = board.tiles.iter().flatten().any(|t| t.as_ref().is_some_and(|tile| tile.owner_player_id == Some(player2_id)));

    if !p1_has_cards && p2_has_cards {
        return Some(player2_id);
    }
    if !p2_has_cards && p1_has_cards {
        return Some(player1_id);
    }
    None
}
