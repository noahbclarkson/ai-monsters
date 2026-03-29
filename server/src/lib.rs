use serde::{Deserialize, Serialize};

// Player information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: PlayerId,
    pub name: String,
    pub email: String,
    pub created_at: i64,
    pub rating: i32,
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

// Type aliases for better organization
pub type PlayerId = u64;
pub type CardId = u64;
pub type DeckId = u64;
pub type MatchId = u64;
pub type PackId = u64;

// Enums for typed values
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

// Card generation requests
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateCardRequest {
    pub seed_noun: String,
    pub rarity: Option<Rarity>,
    pub card_type: Option<CardType>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateCardResponse {
    pub card_id: CardId,
    pub card: Card,
    pub image_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratePackRequest {
    pub player_id: PlayerId,
    pub pack_size: DeckSize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratePackResponse {
    pub pack_id: PackId,
    pub cards: Vec<Card>,
}

// Game state management (simple version for now)
pub struct GameState {
    pub players: std::collections::HashMap<PlayerId, Player>,
    pub cards: std::collections::HashMap<CardId, Card>,
    pub decks: std::collections::HashMap<DeckId, Deck>,
    pub matches: std::collections::HashMap<MatchId, Match>,
    pub card_packs: std::collections::HashMap<PackId, CardPack>,
}

impl GameState {
    pub fn new() -> Self {
        Self {
            players: std::collections::HashMap::new(),
            cards: std::collections::HashMap::new(),
            decks: std::collections::HashMap::new(),
            matches: std::collections::HashMap::new(),
            card_packs: std::collections::HashMap::new(),
        }
    }
    
    pub fn generate_card_id(&mut self) -> CardId {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64
    }
    
    pub fn generate_player_id(&mut self) -> PlayerId {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64
    }
    
    pub fn create_player(&mut self, name: String, email: String) -> PlayerId {
        let player_id = self.generate_player_id();
        let player = Player {
            id: player_id,
            name,
            email,
            created_at: self.current_timestamp(),
            rating: 1000,
        };
        
        self.players.insert(player_id, player);
        player_id
    }
    
    pub fn generate_card(&mut self, seed_noun: String, rarity: Option<Rarity>, card_type: Option<CardType>) -> CardId {
        let card_id = self.generate_card_id();
        
        let rarity = rarity.unwrap_or(Rarity::Common);
        let card_type = card_type.unwrap_or(match rand::random::<f32>() {
            r if r < 0.85 => CardType::Unit,
            r if r < 0.95 => CardType::Building,
            _ => CardType::Spell,
        });
        
        let (attack, defense, range) = self.generate_card_stats(rarity.clone(), card_type.clone());
        
        let card = Card {
            id: card_id,
            name: format!("{} {}", self.capitalize(&seed_noun), self.card_type_suffix(card_type.clone())),
            description: format!("A {} {}", seed_noun, self.card_type_name(card_type.clone())),
            image_url: format!("/placeholder/{}.png", card_id),
            attack,
            defense,
            range,
            rarity: rarity.clone(),
            card_type,
            seed_noun,
            created_at: self.current_timestamp(),
            last_used_count: 0,
        };
        
        self.cards.insert(card_id, card);
        card_id
    }
    
    pub fn generate_card_pack(&mut self, player_id: PlayerId, size: DeckSize) -> PackId {
        let pack_id = self.generate_card_id();
        let mut cards = Vec::new();
        
        let card_count = match size {
            DeckSize::Standard => 7,
            DeckSize::Large => 15,
            DeckSize::Tournament => 25,
        };
        
        let seed_nouns = [
            "Dragon", "Wizard", "Knight", "Unicorn", "Phoenix", "Goblin", "Elf",
            "Troll", "Fairy", "Demon", "Angel", "Golem", "Sphinx", "Griffin",
            "Lizard", "Snake", "Bird", "Bear", "Wolf", "Eagle", "Shark", "Whale",
            "Tiger", "Lion", "Rabbit", "Mouse", "Spider", "Ant", "Bee"
        ];
        
        for _ in 0..card_count {
            let seed_noun = seed_nouns[rand::random::<usize>() % seed_nouns.len()];
            let rarity = match rand::random::<usize>() % 100 {
                r if r < 70 => Rarity::Common,
                r if r < 90 => Rarity::Rare,
                r if r < 98 => Rarity::Epic,
                _ => Rarity::Legendary,
            };
            
            let card_id = self.generate_card(seed_noun.to_string(), Some(rarity), None);
            cards.push(card_id);
        }
        
        let pack = CardPack {
            id: pack_id,
            cards,
            opened_at: None,
            opened_by_player_id: None,
        };
        
        self.card_packs.insert(pack_id, pack);
        pack_id
    }
    
    fn generate_card_stats(&self, rarity: Rarity, card_type: CardType) -> (i32, i32, i32) {
        let (base_attack, base_defense, base_range) = match rarity {
            Rarity::Common => (3, 3, 1),
            Rarity::Rare => (5, 5, 2),
            Rarity::Epic => (8, 8, 3),
            Rarity::Legendary => (12, 12, 4),
        };
        
        let (attack, defense, range) = match card_type {
            CardType::Unit => {
                (
                    base_attack + rand::random::<i32>() % 3,
                    base_defense + rand::random::<i32>() % 2,
                    base_range + rand::random::<i32>() % 1,
                )
            },
            CardType::Building => {
                (
                    0,
                    base_defense + rand::random::<i32>() % 5,
                    1,
                )
            },
            CardType::Spell => {
                (
                    base_attack + rand::random::<i32>() % 2,
                    base_defense + rand::random::<i32>() % 2,
                    base_range + rand::random::<i32>() % 3,
                )
            },
        };
        
        (attack.max(0), defense.max(0), range.max(0))
    }
    
    fn current_timestamp(&self) -> i64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64
    }
    
    fn capitalize(&self, s: &str) -> String {
        let mut c = s.chars();
        match c.next() {
            None => String::new(),
            Some(f) => f.to_uppercase().collect::<String>() + c.as_str().to_lowercase().as_str(),
        }
    }
    
    fn card_type_suffix(&self, card_type: CardType) -> &'static str {
        match card_type {
            CardType::Unit => "Warrior",
            CardType::Building => "Tower",
            CardType::Spell => "Magic",
        }
    }
    
    fn card_type_name(&self, card_type: CardType) -> &'static str {
        match card_type {
            CardType::Unit => "Unit",
            CardType::Building => "Building",
            CardType::Spell => "Spell",
        }
    }
}

// Main demo function
fn main() {
    println!("🎮 AI Monsters Card Generation Demo");
    println!("=================================\n");

    let mut game_state = GameState::new();
    
    // Generate a single card
    println!("🃏 Generating a single card...");
    let single_card_id = game_state.generate_card("Dragon".to_string(), Some(Rarity::Epic), None);
    if let Some(card) = game_state.cards.get(&single_card_id) {
        println!("Generated: {} ({:?})", card.name, card.rarity);
        println!("  💥 Attack: {} 🛡️ Defense: {} 🎯 Range: {}", card.attack, card.defense, card.range);
        println!("  📝 {}", card.description);
    }
    
    // Generate a pack of cards
    println!("\n📦 Generating a pack of 7 cards...");
    let pack_id = game_state.generate_card_pack(1, DeckSize::Standard);
    if let Some(pack) = game_state.card_packs.get(&pack_id) {
        println!("Pack generated with {} cards:", pack.cards.len());
        for (i, &card_id) in pack.cards.iter().enumerate() {
            if let Some(card) = game_state.cards.get(&card_id) {
                println!("  {}. {} ({:?}) - 💥{} 🛡️{} 🎯{}", 
                    i + 1, card.name, card.rarity, card.attack, card.defense, card.range);
            }
        }
    }
    
    // Create a player
    println!("\n👤 Creating a player...");
    let player_id = game_state.create_player("Player 1".to_string(), "player1@example.com".to_string());
    if let Some(player) = game_state.players.get(&player_id) {
        println!("Created player: {} (Rating: {})", player.name, player.rating);
    }
    
    println!("\n✅ Demo completed successfully!");
}