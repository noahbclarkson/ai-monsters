// All public type definitions for the AI Monsters SpacetimeDB module

// Type aliases for better organization
pub type PlayerId = u64;
pub type CardId = u64;
pub type DeckId = u64;
pub type MatchId = u64;
pub type PackId = u64;

// Enums for typed values
#[derive(Debug, Clone, Serialize, Deserialize, spacetime_db::types::Value)]
pub enum Rarity {
    Common = 1,
    Rare = 2,
    Epic = 3,
    Legendary = 4,
}

#[derive(Debug, Clone, Serialize, Deserialize, spacetime_db::types::Value)]
pub enum CardType {
    Unit = 1,
    Building = 2,
    Spell = 3,
}

#[derive(Debug, Clone, Serialize, Deserialize, spacetime_db::types::Value)]
pub enum DeckSize {
    Standard = 30,
    Large = 50,
    Tournament = 100,
}

#[derive(Debug, Clone, Serialize, Deserialize, spacetime_db::types::Value)]
pub enum MatchStatus {
    Waiting = 1,
    Active = 2,
    Completed = 3,
    Abandoned = 4,
}

#[derive(Debug, Clone, Serialize, Deserialize, spacetime_db::types::Value)]
pub enum MatchPhase {
    Placement = 1,
    Action = 2,
    Combat = 3,
}