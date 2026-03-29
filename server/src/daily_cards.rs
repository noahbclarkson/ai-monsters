use serde::{Deserialize, Serialize};
use spacetimedb::{Identity, Procedure, Reducer, Table};
use std::collections::HashMap;

// Table for storing generated daily cards
#[derive(Table, Serialize, Deserialize, Debug, Clone)]
pub struct DailyCards {
    // Map from date string to card ID
    pub cards: HashMap<String, String>,
    // Track which users have claimed cards each day
    pub user_claims: HashMap<String, HashMap<String, bool>>,
}

impl Default for DailyCards {
    fn default() -> Self {
        Self {
            cards: HashMap::new(),
            user_claims: HashMap::new(),
        }
    }
}

// Daily card data
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DailyCardData {
    pub id: String,
    pub name: String,
    pub description: String,
    pub rarity: String,
    pub card_type: String,
    pub attack: u32,
    pub defense: u32,
    pub range: u32,
    pub image_url: String,
    pub date: String,
    pub generated_at: i64,
}

// Reducer for generating daily card
#[derive(Reducer)]
pub enum DailyCardReducer {
    GenerateDailyCard {
        date: String,
        seed: u64,
    },
    ClaimDailyCard {
        user_id: String,
        date: String,
    },
}

impl DailyCardReducer {
    pub fn generate_daily_card(date: String, seed: u64) -> Self {
        Self::GenerateDailyCard { date, seed }
    }

    pub fn claim_daily_card(user_id: String, date: String) -> Self {
        Self::ClaimDailyCard { user_id, date }
    }
}

// Procedure for checking if a user has claimed today's card
#[derive(Procedure)]
pub struct CanClaimDailyCard {
    pub user_id: String,
    pub date: String,
}

impl Procedure for CanClaimDailyCard {
    type Output = bool;
    type Tables = (DailyCards,);

    fn handle(&self, (daily_cards,): Self::Tables) -> Self::Output {
        let claims = daily_cards.user_claims.get(&self.user_id).unwrap_or(&HashMap::new());
        !claims.get(&self.date).unwrap_or(&false)
    }
}

// Procedure for getting today's daily card
#[derive(Procedure)]
pub struct GetDailyCard {
    pub date: String,
}

impl Procedure for GetDailyCard {
    type Output = Option<DailyCardData>;
    type Tables = (DailyCards,);

    fn handle(&self, (daily_cards,): Self::Tables) -> Self::Output {
        let card_id = daily_cards.cards.get(&self.date)?;
        // In a real implementation, you'd fetch the full card data from the Cards table
        // For now, return mock data
        Some(DailyCardData {
            id: card_id.clone(),
            name: "Daily Card Placeholder".to_string(),
            description: "This is a placeholder for the daily card implementation".to_string(),
            rarity: "common".to_string(),
            card_type: "unit".to_string(),
            attack: 10,
            defense: 10,
            range: 1,
            image_url: "placeholder".to_string(),
            date: self.date.clone(),
            generated_at: chrono::Utc::now().timestamp(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_daily_card_creation() {
        let date = "2026-03-29".to_string();
        let seed = 12345u64;
        
        let reducer = DailyCardReducer::generate_daily_card(date.clone(), seed);
        match reducer {
            DailyCardReducer::GenerateDailyCard { date: d, seed: s } => {
                assert_eq!(d, date);
                assert_eq!(s, seed);
            }
            _ => panic!("Wrong reducer type"),
        }
    }

    #[test]
    fn test_claim_daily_card() {
        let user_id = "user123".to_string();
        let date = "2026-03-29".to_string();
        
        let reducer = DailyCardReducer::claim_daily_card(user_id.clone(), date.clone());
        match reducer {
            DailyCardReducer::ClaimDailyCard { user_id: u, date: d } => {
                assert_eq!(u, user_id);
                assert_eq!(d, date);
            }
            _ => panic!("Wrong reducer type"),
        }
    }
}