use serde::{Deserialize, Serialize};

// Daily card tracking data (not a SpacetimeDB table -- used in-memory or serialized)
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

// Daily card generation is handled by the generate_daily_cards reducer in reducers.rs.
// This module provides supporting data structures.

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct DailyCardTracker {
    pub last_generation_date: String,
    pub cards_generated_today: u32,
}

impl DailyCardTracker {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn should_generate(&self, today: &str) -> bool {
        self.last_generation_date != today
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_daily_card_tracker() {
        let tracker = DailyCardTracker::new();
        assert!(tracker.should_generate("2026-03-30"));
    }

    #[test]
    fn test_daily_card_data() {
        let card = DailyCardData {
            id: "test-1".to_string(),
            name: "Test Card".to_string(),
            description: "A test card".to_string(),
            rarity: "Common".to_string(),
            card_type: "Unit".to_string(),
            attack: 5,
            defense: 3,
            range: 1,
            image_url: "placeholder".to_string(),
            date: "2026-03-30".to_string(),
            generated_at: 0,
        };
        assert_eq!(card.name, "Test Card");
    }
}
