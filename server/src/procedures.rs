use spacetime_db::db::{Procedure, Red};
use serde::{Deserialize, Serialize};
use crate::{
    tables::*,
};

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

// Generate a card with AI description and MiniMax art
#[procedure]
pub async fn generate_ai_card(red: &mut Red, req: GenerateCardRequest) -> Result<GenerateCardResponse, String> {
    // Generate basic card
    let card_id = generate_card(red, req.seed_noun.clone(), req.rarity, req.card_type);
    
    // Get the generated card
    let card = cards_table().get(red, card_id)
        .ok_or("Card not found")?;
    
    // Generate enhanced AI description
    let enhanced_description = generate_ai_description(&card).await
        .map_err(|e| format!("Failed to generate AI description: {}", e))?;
    
    // Generate MiniMax image
    let image_url = generate_minimax_image(&card).await
        .map_err(|e| format!("Failed to generate image: {}", e))?;
    
    // Update the card with AI-generated content
    let mut updated_card = card.clone();
    updated_card.description = enhanced_description;
    updated_card.image_url = image_url;
    
    cards_table().insert(red, card_id, updated_card);
    
    Ok(GenerateCardResponse {
        card_id,
        card: updated_card,
        image_url,
    })
}

// Generate a full pack with AI cards
#[procedure]
pub async fn generate_ai_pack(red: &mut Red, req: GeneratePackRequest) -> Result<GeneratePackResponse, String> {
    let pack_id = generate_card_pack(red, req.player_id, req.pack_size);
    
    let pack = card_packs_table().get(red, pack_id)
        .ok_or("Pack not found")?;
    
    let mut cards = Vec::new();
    for card_id in &pack.cards {
        let card = cards_table().get(red, *card_id)
            .ok_or("Card not found")?;
        cards.push(card.clone());
    }
    
    Ok(GeneratePackResponse {
        pack_id,
        cards,
    })
}

// AI text generation for card descriptions
async fn generate_ai_description(card: &Card) -> Result<String, String> {
    // This would integrate with an AI text model (OpenAI, Claude, etc.)
    // For now, return enhanced descriptions based on the seed noun
    
    let seed_noun = &card.seed_noun;
    let card_type = card.card_type;
    let rarity = card.rarity;
    
    let rarity_prefix = match rarity {
        Rarity::Common => "A common",
        Rarity::Rare => "A rare", 
        Rarity::Epic => "An epic",
        Legendary => "A legendary",
    };
    
    let type_name = match card_type {
        CardType::Unit => "warrior",
        CardType::Building => "tower",
        CardType::Spell => "spell",
    };
    
    // Generate description based on seed noun
    let description = match seed_noun.as_str() {
        "Dragon" => format!("{} {} that breathes fire and commands respect in battle.", rarity_prefix, type_name),
        "Wizard" => format!("{} mage with arcane powers and mystical wisdom.", rarity_prefix),
        "Knight" => format!("{} {} clad in shining armor, loyal and brave.", rarity_prefix, type_name),
        "Unicorn" => format!("{} mystical creature with healing magic and pure heart.", rarity_prefix),
        "Phoenix" => format!("{} legendary bird that rises from ashes with rejuvenating powers.", rarity_prefix),
        _ => format!("{} {} {} with {} attack, {} defense, and {} range.", 
            rarity_prefix, seed_noun, type_name, card.attack, card.defense, card.range),
    };
    
    Ok(description)
}

// MiniMax image generation
async fn generate_minimax_image(card: &Card) -> Result<String, String> {
    // This would integrate with the MiniMax API
    // For now, return a placeholder image URL
    
    // Use the OpenClaw image_generate tool in practice
    // format!("/images/{}_{}.png", card.seed_noun, card.card_type)
    
    Ok(format!("/images/{}/{}.png", card.seed_noun, card.card_type))
}

// Open a pack and award cards to a player
#[procedure]
pub async fn open_pack(red: &mut Red, player_id: PlayerId, pack_id: PackId) -> Result<Vec<CardId>, String> {
    let mut pack = card_packs_table().get(red, pack_id)
        .ok_or("Pack not found")?;
    
    // Check if already opened
    if pack.opened_at.is_some() {
        return Err("Pack already opened".to_string());
    }
    
    // Mark as opened
    pack.opened_at = Some(current_timestamp());
    pack.opened_by_player_id = Some(player_id);
    card_packs_table().insert(red, pack_id, pack);
    
    // Add cards to player's deck or collection
    for card_id in &pack.cards {
        // TODO: Add to player's collection or deck
        // For now, just return the card IDs
    }
    
    Ok(pack.cards.clone())
}

// Get player collection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerCollectionResponse {
    pub decks: Vec<Deck>,
    pub available_cards: Vec<Card>,
}

#[procedure]
pub async fn get_player_collection(red: &mut Red, player_id: PlayerId) -> Result<PlayerCollectionResponse, String> {
    // Get all decks for this player
    let decks = decks_table()
        .iter(red)
        .filter(|(_, deck)| deck.player_id == player_id)
        .map(|(_, deck)| deck.clone())
        .collect();
    
    // Get all cards owned by this player (TODO: need ownership tracking)
    let available_cards = vec![]; // Placeholder
    
    Ok(PlayerCollectionResponse {
        decks,
        available_cards,
    })
}

// Board game procedures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaceCardRequest {
    pub match_id: MatchId,
    pub card_id: CardId,
    pub tile_x: usize,
    pub tile_y: usize,
    pub is_face_up: bool,
    pub is_attack_mode: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoveCardRequest {
    pub match_id: MatchId,
    pub from_x: usize,
    pub from_y: usize,
    pub to_x: usize,
    pub to_y: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackCardRequest {
    pub match_id: MatchId,
    pub attacker_x: usize,
    pub attacker_y: usize,
    pub defender_x: usize,
    pub defender_y: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlipCardRequest {
    pub match_id: MatchId,
    pub tile_x: usize,
    pub tile_y: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwitchCardModeRequest {
    pub match_id: MatchId,
    pub tile_x: usize,
    pub tile_y: usize,
}

// Place a card on the board
#[procedure]
pub async fn place_card(red: &mut Red, req: PlaceCardRequest) -> Result<(), String> {
    place_card(red, req.match_id, req.card_id, req.tile_x, req.tile_y, req.is_face_up, req.is_attack_mode)
}

// Move a card on the board
#[procedure]
pub async fn move_card(red: &mut Red, req: MoveCardRequest) -> Result<(), String> {
    move_card(red, req.match_id, req.from_x, req.from_y, req.to_x, req.to_y)
}

// Attack another card
#[procedure]
pub async fn attack_card(red: &mut Red, req: AttackCardRequest) -> Result<(), String> {
    attack_card(red, req.match_id, req.attacker_x, req.attacker_y, req.defender_x, req.defender_y)
}

// Flip a card (face-up/face-down)
#[procedure]
pub async fn flip_card(red: &mut Red, req: FlipCardRequest) -> Result<(), String> {
    flip_card(red, req.match_id, req.tile_x, req.tile_y)
}

// Switch card mode (attack/defense)
#[procedure]
pub async fn switch_card_mode(red: &mut Red, req: SwitchCardModeRequest) -> Result<(), String> {
    switch_card_mode(red, req.match_id, req.tile_x, req.tile_y)
}

// End current turn
#[procedure]
pub async fn end_turn(red: &mut Red, match_id: MatchId) -> Result<(), String> {
    end_turn(red, match_id)
}

// Get full match state with board
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchStateResponse {
    pub match_data: Match,
    pub board_tiles: Vec<Vec<Option<BoardTile>>>,
    pub current_player_cards: Vec<Card>,
}

#[procedure]
pub async fn get_match_state(red: &mut Red, match_id: MatchId) -> Result<MatchStateResponse, String> {
    let match_data = matches_table().get(red, match_id)
        .ok_or("Match not found")?;
    
    // Get all cards for the current player
    let mut current_player_cards = Vec::new();
    
    for row in match_data.board_state.tiles.iter() {
        for tile in row.iter() {
            if let Some(tile) = tile {
                if tile.owner_player_id == Some(match_data.current_turn) {
                    if let Some(card_id) = tile.card_id {
                        if let Some(card) = cards_table().get(red, card_id) {
                            current_player_cards.push(card.clone());
                        }
                    }
                }
            }
        }
    }
    
    Ok(MatchStateResponse {
        match_data: match_data.clone(),
        board_tiles: match_data.board_state.tiles.to_vec(),
        current_player_cards,
    })
}

// Create a new match with starting hands
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateMatchRequest {
    pub player1_id: PlayerId,
    pub player2_id: PlayerId,
    pub use_player_decks: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateMatchResponse {
    pub match_id: MatchId,
    pub player1_hand: Vec<CardId>,
    pub player2_hand: Vec<CardId>,
}

#[procedure]
pub async fn create_match_with_hands(red: &mut Red, req: CreateMatchRequest) -> Result<CreateMatchResponse, String> {
    let match_id = create_match(red, req.player1_id, req.player2_id);
    
    // Generate starting hands for both players
    let player1_hand = generate_starting_hand(red, req.player1_id);
    let player2_hand = generate_starting_hand(red, req.player2_id);
    
    // TODO: Add cards to player hands (need hand tracking system)
    
    Ok(CreateMatchResponse {
        match_id,
        player1_hand,
        player2_hand,
    })
}

// Helper function to generate starting hand
fn generate_starting_hand(red: &mut Red, player_id: PlayerId) -> Vec<CardId> {
    let mut hand = Vec::new();
    
    // Generate 7 cards for starting hand
    let seed_nouns = [
        "Dragon", "Wizard", "Knight", "Unicorn", "Phoenix", "Goblin", "Elf",
        "Troll", "Fairy", "Demon", "Angel", "Golem", "Sphinx", "Griffin"
    ];
    
    for noun in seed_nouns.iter().take(7) {
        let rarity = match (crate::random_range(100)) {
            r if r < 70 => Rarity::Common,
            r if r < 90 => Rarity::Rare,
            r if r < 98 => Rarity::Epic,
            _ => Rarity::Legendary,
        };
        
        let card_id = generate_card(red, noun.to_string(), Some(rarity), None);
        hand.push(card_id);
    }
    
    hand
}

// Current timestamp helper
fn current_timestamp() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

// Daily card generation procedure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyCardGenerationResponse {
    pub cards_generated: Vec<CardId>,
    pub total_cards: usize,
    pub summary: String,
}

#[procedure]
pub async fn generate_daily_cards(red: &mut Red) -> Result<DailyCardGenerationResponse, String> {
    // Get existing cards count
    let existing_card_count = cards_table().len(red);
    
    // Generate daily cards using the daily_cards module
    let seed_nouns = [
        "Sun", "Moon", "Star", "Fire", "Water", "Earth", "Air", "Light", "Dark", 
        "Thunder", "Ice", "Nature", "Time", "Space", "Dream", "Shadow", "Crystal",
        "Flame", "Frost", "Storm", "Mystic", "Celestial", "Ancient", "Divine"
    ];
    
    let mut cards_generated = Vec::new();
    let mut rng = rand::thread_rng();
    
    // Generate one card for each rarity/type combination
    let mut card_index = 0;
    for rarity in [Rarity::Common, Rarity::Rare, Rarity::Epic, Rarity::Legendary] {
        for card_type in [CardType::Unit, CardType::Building, CardType::Spell] {
            if card_index < 12 { // Limit to 12 daily cards
                let noun = seed_nouns[rng.gen_range(0..seed_nouns.len())];
                let card_id = generate_card(red, noun.to_string(), Some(rarity), Some(card_type));
                cards_generated.push(card_id);
                card_index += 1;
            }
        }
    }
    
    // Add some special cards (1-2 additional rare/epic cards)
    let special_count = 1 + rng.gen_range(0..2);
    for _ in 0..special_count {
        let noun = seed_nouns[rng.gen_range(0..seed_nouns.len())];
        let special_rarity = if rng.gen_range(0..100) < 70 { Rarity::Rare } else { Rarity::Epic };
        let card_type = match rng.gen_range(0..3) {
            0 => CardType::Unit,
            1 => CardType::Building,
            2 => CardType::Spell,
            _ => CardType::Unit,
        };
        
        let card_id = generate_card(red, noun.to_string(), Some(special_rarity), Some(card_type));
        cards_generated.push(card_id);
    }
    
    let total_cards = cards_table().len(red);
    let summary = format!("Generated {} new daily cards. Total cards in database: {}", cards_generated.len(), total_cards);
    
    Ok(DailyCardGenerationResponse {
        cards_generated,
        total_cards,
        summary,
    })
}