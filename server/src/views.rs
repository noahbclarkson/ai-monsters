use spacetime_db::db::{View, Red};
use crate::{
    tables::*,
};

// Player views
#[views]
pub fn get_player(red: &Red, player_id: PlayerId) -> Option<Player> {
    players_table().get(red, player_id)
}

#[views]
pub fn get_all_players(red: &Red) -> Vec<Player> {
    players_table()
        .iter(red)
        .map(|(_, player)| player.clone())
        .collect()
}

#[views]
pub fn get_players_by_rating(red: &Red, limit: Option<usize>) -> Vec<Player> {
    let mut players = players_table()
        .iter(red)
        .map(|(_, player)| player.clone())
        .collect::<Vec<_>>();
    
    players.sort_by(|a, b| b.rating.cmp(&a.rating));
    
    if let Some(lim) = limit {
        players.truncate(lim);
    }
    
    players
}

// Card views
#[views]
pub fn get_card(red: &Red, card_id: CardId) -> Option<Card> {
    cards_table().get(red, card_id)
}

#[views]
pub fn get_all_cards(red: &Red) -> Vec<Card> {
    cards_table()
        .iter(red)
        .map(|(_, card)| card.clone())
        .collect()
}

#[views]
pub fn get_cards_by_rarity(red: &Red, rarity: Rarity) -> Vec<Card> {
    cards_table()
        .iter(red)
        .filter(|(_, card)| card.rarity == rarity)
        .map(|(_, card)| card.clone())
        .collect()
}

#[views]
pub fn get_cards_by_type(red: &Red, card_type: CardType) -> Vec<Card> {
    cards_table()
        .iter(red)
        .filter(|(_, card)| card.card_type == card_type)
        .map(|(_, card)| card.clone())
        .collect()
}

#[views]
pub fn get_cards_by_player(red: &Red, player_id: PlayerId) -> Vec<Card> {
    // Get all decks for this player
    let deck_cards = decks_table()
        .iter(red)
        .filter(|(_, deck)| deck.player_id == player_id)
        .flat_map(|(_, deck)| deck.cards.clone())
        .collect::<Vec<_>>();
    
    // Get card details
    let mut cards = Vec::new();
    for card_id in &deck_cards {
        if let Some(card) = cards_table().get(red, *card_id) {
            cards.push(card.clone());
        }
    }
    
    cards
}

#[views]
pub fn get_recent_cards(red: &Red, limit: Option<usize>) -> Vec<Card> {
    let mut cards = cards_table()
        .iter(red)
        .map(|(_, card)| card.clone())
        .collect::<Vec<_>>();
    
    // Sort by creation date (newest first)
    cards.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    
    if let Some(lim) = limit {
        cards.truncate(lim);
    }
    
    cards
}

#[views]
pub fn get_random_cards(red: &Red, count: usize) -> Vec<Card> {
    let all_cards = cards_table()
        .iter(red)
        .map(|(_, card)| card.clone())
        .collect::<Vec<_>>();
    
    if all_cards.is_empty() {
        return Vec::new();
    }
    
    use rand::seq::SliceRandom;
    let mut rng = rand::thread_rng();
    let mut selected = Vec::new();
    
    // Handle case where we want more cards than available
    let max_count = count.min(all_cards.len());
    
    // Simple random selection (could be improved with weighted random)
    let mut available = all_cards.clone();
    for _ in 0..max_count {
        if let Some(index) = available.choose(&mut rng) {
            selected.push(index.clone());
            // Remove to avoid duplicates
            available.retain(|c| c.id != index.id);
        }
    }
    
    selected
}

// Deck views
#[views]
pub fn get_deck(red: &Red, deck_id: DeckId) -> Option<Deck> {
    decks_table().get(red, deck_id)
}

#[views]
pub fn get_decks_by_player(red: &Red, player_id: PlayerId) -> Vec<Deck> {
    decks_table()
        .iter(red)
        .filter(|(_, deck)| deck.player_id == player_id)
        .map(|(_, deck)| deck.clone())
        .collect()
}

#[views]
pub fn get_deck_cards(red: &Red, deck_id: DeckId) -> Vec<Card> {
    let deck = decks_table().get(red, deck_id)?;
    
    let mut cards = Vec::new();
    for card_id in &deck.cards {
        if let Some(card) = cards_table().get(red, *card_id) {
            cards.push(card.clone());
        }
    }
    
    cards
}

// Match views
#[views]
pub fn get_match(red: &Red, match_id: MatchId) -> Option<Match> {
    matches_table().get(red, match_id)
}

#[views]
pub fn get_active_matches(red: &Red) -> Vec<Match> {
    matches_table()
        .iter(red)
        .filter(|(_, match_data)| match_data.status == MatchStatus::Active)
        .map(|(_, match_data)| match_data.clone())
        .collect()
}

#[views]
pub fn get_matches_by_player(red: &Red, player_id: PlayerId) -> Vec<Match> {
    matches_table()
        .iter(red)
        .filter(|(_, match_data)| 
            match_data.player1_id == player_id || match_data.player2_id == player_id
        )
        .map(|(_, match_data)| match_data.clone())
        .collect()
}

// Pack views
#[views]
pub fn get_pack(red: &Red, pack_id: PackId) -> Option<CardPack> {
    card_packs_table().get(red, pack_id)
}

#[views]
pub fn get_unopened_packs(red: &Red, player_id: PlayerId) -> Vec<CardPack> {
    card_packs_table()
        .iter(red)
        .filter(|(_, pack)| {
            pack.opened_by_player_id == Some(player_id) && pack.opened_at.is_none()
        })
        .map(|(_, pack)| pack.clone())
        .collect()
}

// Statistics views
#[views]
pub fn get_card_statistics(red: &Red) -> CardStats {
    let all_cards = cards_table()
        .iter(red)
        .map(|(_, card)| card.clone())
        .collect::<Vec<_>>();
    
    if all_cards.is_empty() {
        return CardStats {
            total_cards: 0,
            by_rarity: std::collections::HashMap::new(),
            by_type: std::collections::HashMap::new(),
            average_attack: 0.0,
            average_defense: 0.0,
            average_range: 0.0,
        };
    }
    
    let mut by_rarity = std::collections::HashMap::new();
    let mut by_type = std::collections::HashMap::new();
    
    let mut total_attack = 0;
    let mut total_defense = 0;
    let mut total_range = 0;
    
    for card in &all_cards {
        // Count by rarity
        *by_rarity.entry(card.rarity.clone()).or_insert(0) += 1;
        
        // Count by type
        *by_type.entry(card.card_type.clone()).or_insert(0) += 1;
        
        total_attack += card.attack;
        total_defense += card.defense;
        total_range += card.range;
    }
    
    CardStats {
        total_cards: all_cards.len(),
        by_rarity,
        by_type,
        average_attack: total_attack as f64 / all_cards.len() as f64,
        average_defense: total_defense as f64 / all_cards.len() as f64,
        average_range: total_range as f64 / all_cards.len() as f64,
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CardStats {
    pub total_cards: usize,
    pub by_rarity: std::collections::HashMap<Rarity, usize>,
    pub by_type: std::collections::HashMap<CardType, usize>,
    pub average_attack: f64,
    pub average_defense: f64,
    pub average_range: f64,
}

// Utility views
#[views]
pub fn get_player_rating_leaderboard(red: &Red, limit: Option<usize>) -> Vec<Player> {
    get_players_by_rating(red, limit)
}

#[views]
pub fn get_most_used_cards(red: &Red, limit: Option<usize>) -> Vec<Card> {
    let mut cards = cards_table()
        .iter(red)
        .map(|(_, card)| card.clone())
        .collect::<Vec<_>>();
    
    // Sort by usage count (most used first)
    cards.sort_by(|a, b| b.last_used_count.cmp(&a.last_used_count));
    
    if let Some(lim) = limit {
        cards.truncate(lim);
    }
    
    cards
}