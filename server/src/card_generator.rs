// Simple Card Generator for AI Monsters
// This demonstrates the card generation logic without SpacetimeDB dependencies

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug)]
pub struct Card {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub attack: u32,
    pub defense: u32,
    pub range: u32,
    pub rarity: String,
    pub card_type: String,
    pub created_at: u64,
}

#[derive(Serialize, Deserialize)]
pub struct CardGenerationRequest {
    pub seed_noun: String,
    pub rarity: String,
    pub card_type: String,
}

#[derive(Serialize, Deserialize)]
pub struct CardGenerationResponse {
    pub name: String,
    pub description: String,
    pub attack: u32,
    pub defense: u32,
    pub range: u32,
}

impl Card {
    fn new(id: u32, name: String, description: String, attack: u32, defense: u32, range: u32, rarity: String, card_type: String) -> Self {
        let image_url = format!("https://via.placeholder.com/832x1248/333333/FFFFFF?text={}", name);
        Card {
            id,
            name,
            description,
            image_url,
            attack,
            defense,
            range,
            rarity,
            card_type,
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }
}

pub struct CardGenerator;

impl CardGenerator {
    fn generate_random_noun() -> String {
        let nouns = vec![
            "Dragon", "Wizard", "Knight", "Castle", "Phoenix", "Unicorn", 
            "Goblin", "Troll", "Golem", "Fairy", "Demon", "Angel", 
            "Robot", "Alien", "Cyborg", "Warrior", "Mage", "Archer",
            "Shadow", "Light", "Darkness", "Flame", "Frost", "Lightning",
            "Earth", "Wind", "Water", "Fire", "Spirit", "Monster",
            "Beast", "Creature", "Entity", "Being", "Machine", "Construct"
        ];
        nouns[rand::random::<usize>() % nouns.len()].to_string()
    }

    fn get_rarity_config() -> HashMap<&'static str, (f64, (u32, u32, u32, u32, u32, u32))> {
        let mut config = HashMap::new();
        config.insert("Common", (0.6, (5, 15, 5, 15, 1, 2)));
        config.insert("Rare", (0.25, (10, 25, 10, 25, 2, 3)));
        config.insert("Epic", (0.1, (20, 40, 20, 40, 3, 4)));
        config.insert("Legendary", (0.05, (35, 60, 35, 60, 4, 5)));
        config
    }

    fn get_random_card_type() -> String {
        let rand_val = rand::random::<f64>();
        if rand_val < 0.7 {
            "Unit".to_string()
        } else if rand_val < 0.9 {
            "Building".to_string()
        } else {
            "Spell".to_string()
        }
    }

    pub fn generate_card(id: u32) -> Card {
        // Generate random seed noun and determine rarity
        let noun = Self::generate_random_noun();
        let rarity_roll = rand::random::<f64>();
        
        let (rarity, attack_range, defense_range, range_range) = if rarity_roll < 0.6 {
            ("Common", (5, 15), (5, 15), (1, 2))
        } else if rarity_roll < 0.85 {
            ("Rare", (10, 25), (10, 25), (2, 3))
        } else if rarity_roll < 0.95 {
            ("Epic", (20, 40), (20, 40), (3, 4))
        } else {
            ("Legendary", (35, 60), (35, 60), (4, 5))
        };

        // Determine card type
        let card_type = if rarity_roll < 0.7 {
            "Unit"
        } else if rarity_roll < 0.9 {
            "Building"
        } else {
            "Spell"
        };

        // Generate card stats
        let attack = rand::random::<u32>() % (attack_range.1 - attack_range.0 + 1) + attack_range.0;
        let defense = rand::random::<u32>() % (defense_range.1 - defense_range.0 + 1) + defense_range.0;
        let range = rand::random::<u32>() % (range_range.1 - range_range.0 + 1) + range_range.0;

        // Generate description
        let description = format!("A{} {} with {} power and {} defense", 
            if rarity == "Legendary" { "n epic" } else { " powerful" },
            noun,
            attack,
            defense
        );

        Card::new(
            id,
            noun,
            description,
            attack,
            defense,
            range,
            rarity.to_string(),
            card_type.to_string()
        )
    }

    pub fn generate_card_with_ai(request: CardGenerationRequest) -> CardGenerationResponse {
        // This is a placeholder for AI-based card generation
        // In the future, this will call AI models for descriptions and stats
        let noun = request.seed_noun;
        let rarity = request.rarity;
        
        let (attack_range, defense_range, range_range) = match rarity.as_str() {
            "Common" => ((5, 15), (5, 15), (1, 2)),
            "Rare" => ((10, 25), (10, 25), (2, 3)),
            "Epic" => ((20, 40), (20, 40), (3, 4)),
            "Legendary" => ((35, 60), (35, 60), (4, 5)),
            _ => ((5, 15), (5, 15), (1, 2)),
        };

        let attack = rand::random::<u32>() % (attack_range.1 - attack_range.0 + 1) + attack_range.0;
        let defense = rand::random::<u32>() % (defense_range.1 - defense_range.0 + 1) + defense_range.0;
        let range = rand::random::<u32>() % (range_range.1 - range_range.0 + 1) + range_range.0;

        let description = format!("A{} {} with {} power and {} defense", 
            if rarity == "Legendary" { "n epic" } else { " powerful" },
            noun,
            attack,
            defense
        );

        CardGenerationResponse {
            name: noun,
            description,
            attack,
            defense,
            range,
        }
    }

    pub fn generate_pack() -> Vec<Card> {
        let mut pack = Vec::new();
        for i in 1..=7 {
            pack.push(Self::generate_card(i));
        }
        pack
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_card_generation() {
        let card = CardGenerator::generate_card(1);
        assert!(!card.name.is_empty());
        assert!(!card.description.is_empty());
        assert!(card.attack > 0);
        assert!(card.defense > 0);
        assert!(card.range > 0);
        assert!(["Common", "Rare", "Epic", "Legendary"].contains(&card.rarity.as_str()));
        assert!(["Unit", "Building", "Spell"].contains(&card.card_type.as_str()));
    }

    #[test]
    fn test_pack_generation() {
        let pack = CardGenerator::generate_pack();
        assert_eq!(pack.len(), 7);
        for card in pack {
            assert!(!card.name.is_empty());
            assert!(!card.description.is_empty());
        }
    }
}