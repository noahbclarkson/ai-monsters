use spacetime_db::db::Red;
use crate::{
    tables::*,
};
use rand::Rng;

// Player management reducers
#[reducer]
pub fn create_player(red: &mut Red, name: String, email: String) -> PlayerId {
    let player_id = generate_player_id();
    let player = Player {
        id: player_id,
        name,
        email,
        created_at: current_timestamp(),
        rating: 1000, // Starting rating
        deck_size_preference: DeckSize::Standard,
    };
    
    players_table().insert(red, player_id, player);
    player_id
}

// Card generation reducers
#[reducer]
pub fn generate_card(red: &mut Red, seed_noun: String, rarity: Option<Rarity>, card_type: Option<CardType>) -> CardId {
    let card_id = generate_card_id();
    
    // Determine rarity (default: Common)
    let rarity = rarity.unwrap_or(Rarity::Common);
    
    // Determine card type (weighted distribution)
    let card_type = match card_type {
        Some(t) => t,
        None => {
            let mut rng = rand::thread_rng();
            let roll: f32 = rng.gen();
            match roll {
                r if r < 0.85 => CardType::Unit, // 85% units
                r if r < 0.95 => CardType::Building, // 10% buildings  
                _ => CardType::Spell, // 5% spells
            }
        }
    };
    
    // Generate stats based on rarity
    let (attack, defense, range) = generate_card_stats(rarity, card_type);
    
    // Create basic card (will need to be enhanced with AI descriptions)
    let card = Card {
        id: card_id,
        name: format!("{} {}", capitalize(&seed_noun), card_type_suffix(card_type)),
        description: format!("A {} {}", seed_noun, card_type_name(card_type)),
        image_url: format!("/placeholder/{}.png", card_id), // TODO: Generate via MiniMax
        attack,
        defense,
        range,
        rarity,
        card_type,
        seed_noun,
        created_at: current_timestamp(),
        last_used_count: 0,
    };
    
    cards_table().insert(red, card_id, card);
    card_id
}

// Generate a full pack of cards
#[reducer]
pub fn generate_card_pack(red: &mut Red, player_id: PlayerId, size: DeckSize) -> PackId {
    let pack_id = generate_card_id();
    let mut cards = Vec::new();
    
    // Number of cards based on pack size
    let card_count = match size {
        DeckSize::Standard => 7, // Tutorial pack
        DeckSize::Large => 15,  // Small pack
        DeckSize::Tournament => 25, // Large pack
    };
    
    // Generate random cards
    let mut rng = rand::thread_rng();
    for _ in 0..card_count {
        let seed_nouns = [
            "Dragon", "Wizard", "Knight", "Unicorn", "Phoenix", "Goblin", "Elf",
            "Troll", "Fairy", "Demon", "Angel", "Golem", "Sphinx", "Griffin",
            "Lizard", "Snake", "Bird", "Bear", "Wolf", "Eagle", "Shark", "Whale",
            "Tiger", "Lion", "Rabbit", "Mouse", "Spider", "Ant", "Bee"
        ];
        
        let seed_noun = seed_nouns[rng.gen_range(0..seed_nouns.len())];
        let rarity = match rng.gen_range(0..100) {
            r if r < 70 => Rarity::Common,
            r if r < 90 => Rarity::Rare,
            r if r < 98 => Rarity::Epic,
            _ => Rarity::Legendary,
        };
        
        let card_id = generate_card(red, seed_noun.to_string(), Some(rarity), None);
        cards.push(card_id);
    }
    
    let pack = CardPack {
        id: pack_id,
        cards,
        opened_at: None,
        opened_by_player_id: None,
    };
    
    card_packs_table().insert(red, pack_id, pack);
    pack_id
}

// Deck management
#[reducer]
pub fn create_deck(red: &mut Red, player_id: PlayerId, name: String) -> DeckId {
    let deck_id = generate_card_id();
    let deck = Deck {
        id: deck_id,
        player_id,
        name,
        cards: Vec::new(),
        created_at: current_timestamp(),
        updated_at: current_timestamp(),
    };
    
    decks_table().insert(red, deck_id, deck);
    deck_id
}

#[reducer]
pub fn add_card_to_deck(red: &mut Red, deck_id: DeckId, card_id: CardId) -> Result<(), String> {
    let mut deck = decks_table().get(red, deck_id)
        .ok_or("Deck not found")?;
    
    // Check if card already exists in deck
    if deck.cards.contains(&card_id) {
        return Err("Card already in deck".to_string());
    }
    
    // Check deck size limits
    if deck.cards.len() >= 100 {
        return Err("Deck is full".to_string());
    }
    
    deck.cards.push(card_id);
    deck.updated_at = current_timestamp();
    decks_table().insert(red, deck_id, deck);
    
    Ok(())
}

// Match management
#[reducer]
pub fn create_match(red: &mut Red, player1_id: PlayerId, player2_id: PlayerId) -> MatchId {
    let match_id = generate_card_id();
    let match_data = Match {
        id: match_id,
        player1_id,
        player2_id,
        board_state: create_empty_board(),
        current_turn: player1_id,
        status: MatchStatus::Active,
        winner_id: None,
        created_at: current_timestamp(),
        updated_at: current_timestamp(),
    };
    
    matches_table().insert(red, match_id, match_data);
    match_id
}

// Helper functions
fn current_timestamp() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

fn generate_card_stats(rarity: Rarity, card_type: CardType) -> (i32, i32, i32) {
    let mut rng = rand::thread_rng();
    
    // Base stats ranges based on rarity
    let (base_attack, base_defense, base_range) = match rarity {
        Rarity::Common => (3, 3, 1),
        Rarity::Rare => (5, 5, 2),
        Rarity::Epic => (8, 8, 3),
        Rarity::Legendary => (12, 12, 4),
    };
    
    // Card type adjustments
    let (attack, defense, range) = match card_type {
        CardType::Unit => {
            // Units focus on attack, some defense
            (
                base_attack + rng.gen_range(0..3),
                base_defense + rng.gen_range(0..2),
                base_range + rng.gen_range(0..1),
            )
        },
        CardType::Building => {
            // Buildings focus on defense, no attack
            (
                0, // Buildings can't attack
                base_defense + rng.gen_range(0..5),
                1, // Buildings have range 1
            )
        },
        CardType::Spell => {
            // Spells have balanced stats, high range
            (
                base_attack + rng.gen_range(0..2),
                base_defense + rng.gen_range(0..2),
                base_range + rng.gen_range(1..3),
            )
        },
    };
    
    (attack, defense, range)
}

fn create_empty_board() -> BoardState {
    BoardState {
        tiles: [[None; 3]; 6],
        turn_number: 1,
        phase: MatchPhase::Placement,
    }
}

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + c.as_str().to_lowercase().as_str(),
    }
}

fn card_type_suffix(card_type: CardType) -> &'static str {
    match card_type {
        CardType::Unit => "Warrior",
        CardType::Building => "Tower",
        CardType::Spell => "Magic",
    }
}

fn card_type_name(card_type: CardType) -> &'static str {
    match card_type {
        CardType::Unit => "Unit",
        CardType::Building => "Building",
        CardType::Spell => "Spell",
    }
}