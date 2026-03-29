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

// Current timestamp helper
fn current_timestamp() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}