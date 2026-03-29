use spacetime_db::db::Red;
use crate::{
    tables::*,
};

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

// Board management reducers
#[reducer]
pub fn place_card(red: &mut Red, match_id: MatchId, card_id: CardId, tile_x: usize, tile_y: usize, is_face_up: bool, is_attack_mode: bool) -> Result<(), String> {
    let mut match_data = matches_table().get(red, match_id)
        .ok_or("Match not found")?;
    
    // Check if it's the correct player's turn
    // TODO: Add player validation
    
    // Validate tile coordinates
    if tile_x >= 6 || tile_y >= 3 {
        return Err("Invalid tile coordinates".to_string());
    }
    
    // Check if tile is empty
    if match_data.board_state.tiles[tile_x][tile_y].is_some() {
        return Err("Tile is already occupied".to_string());
    }
    
    // Get the card to place
    let card = cards_table().get(red, card_id)
        .ok_or("Card not found")?;
    
    // Create board tile
    let board_tile = BoardTile {
        card_id: Some(card_id),
        is_face_up,
        is_attack_mode,
        owner_player_id: Some(match_data.current_turn), // Current player places the card
    };
    
    // Place the card on the board
    match_data.board_state.tiles[tile_x][tile_y] = Some(board_tile);
    match_data.updated_at = current_timestamp();
    
    matches_table().insert(red, match_id, match_data);
    
    Ok(())
}

#[reducer]
pub fn flip_card(red: &mut Red, match_id: MatchId, tile_x: usize, tile_y: usize) -> Result<(), String> {
    let mut match_data = matches_table().get(red, match_id)
        .ok_or("Match not found")?;
    
    // Validate tile coordinates
    if tile_x >= 6 || tile_y >= 3 {
        return Err("Invalid tile coordinates".to_string());
    }
    
    let mut tile = match_data.board_state.tiles[tile_x][tile_y]
        .take()
        .ok_or("No card at this tile")?;
    
    // Flip the card
    tile.is_face_up = !tile.is_face_up;
    
    // Put the tile back
    match_data.board_state.tiles[tile_x][tile_y] = Some(tile);
    match_data.updated_at = current_timestamp();
    
    matches_table().insert(red, match_id, match_data);
    
    Ok(())
}

#[reducer]
pub fn switch_card_mode(red: &mut Red, match_id: MatchId, tile_x: usize, tile_y: usize) -> Result<(), String> {
    let mut match_data = matches_table().get(red, match_id)
        .ok_or("Match not found")?;
    
    // Validate tile coordinates
    if tile_x >= 6 || tile_y >= 3 {
        return Err("Invalid tile coordinates".to_string());
    }
    
    let mut tile = match_data.board_state.tiles[tile_x][tile_y]
        .take()
        .ok_or("No card at this tile")?;
    
    // Switch between attack and defense mode
    tile.is_attack_mode = !tile.is_attack_mode;
    
    // Put the tile back
    match_data.board_state.tiles[tile_x][tile_y] = Some(tile);
    match_data.updated_at = current_timestamp();
    
    matches_table().insert(red, match_id, match_data);
    
    Ok(())
}

#[reducer]
pub fn move_card(red: &mut Red, match_id: MatchId, from_x: usize, from_y: usize, to_x: usize, to_y: usize) -> Result<(), String> {
    let mut match_data = matches_table().get(red, match_id)
        .ok_or("Match not found")?;
    
    // Validate coordinates
    if from_x >= 6 || from_y >= 3 || to_x >= 6 || to_y >= 3 {
        return Err("Invalid tile coordinates".to_string());
    }
    
    let mut from_tile = match_data.board_state.tiles[from_x][from_y]
        .take()
        .ok_or("No card at source tile")?;
    
    let to_tile = match_data.board_state.tiles[to_x][to_y];
    
    // Check if destination is empty
    if to_tile.is_some() {
        return Err("Destination tile is occupied".to_string());
    }
    
    // Check if card is in attack mode (only attack-mode cards can move)
    if !from_tile.is_attack_mode {
        return Err("Only attack-mode cards can move".to_string());
    }
    
    // Move the card
    match_data.board_state.tiles[to_x][to_y] = Some(from_tile);
    match_data.board_state.tiles[from_x][from_y] = None;
    match_data.updated_at = current_timestamp();
    
    matches_table().insert(red, match_id, match_data);
    
    Ok(())
}

#[reducer]
pub fn end_turn(red: &mut Red, match_id: MatchId) -> Result<(), String> {
    let mut match_data = matches_table().get(red, match_id)
        .ok_or("Match not found")?;
    
    // Switch turns
    match_data.current_turn = if match_data.current_turn == match_data.player1_id {
        match_data.player2_id
    } else {
        match_data.player1_id
    };
    
    // Increment turn number
    match_data.board_state.turn_number += 1;
    
    // Update phase (cycle through Placement -> Action -> Combat)
    match_data.board_state.phase = match match_data.board_state.phase {
        MatchPhase::Placement => MatchPhase::Action,
        MatchPhase::Action => MatchPhase::Combat,
        MatchPhase::Combat => MatchPhase::Placement,
    };
    
    match_data.updated_at = current_timestamp();
    matches_table().insert(red, match_id, match_data);
    
    Ok(())
}

#[reducer]
pub fn attack_card(red: &mut Red, match_id: MatchId, attacker_x: usize, attacker_y: usize, defender_x: usize, defender_y: usize) -> Result<(), String> {
    let mut match_data = matches_table().get(red, match_id)
        .ok_or("Match not found")?;
    
    // Validate coordinates
    if attacker_x >= 6 || attacker_y >= 3 || defender_x >= 6 || defender_y >= 3 {
        return Err("Invalid tile coordinates".to_string());
    }
    
    let attacker_tile = match_data.board_state.tiles[attacker_x][attacker_y]
        .as_ref()
        .ok_or("No attacker card")?;
    
    let defender_tile = match_data.board_state.tiles[defender_x][defender_y]
        .as_ref()
        .ok_or("No defender card")?;
    
    // Get attacker and defender cards
    let attacker_card = cards_table().get(red, attacker_tile.card_id.unwrap())
        .ok_or("Attacker card not found")?;
    
    let defender_card = cards_table().get(red, defender_tile.card_id.unwrap())
        .ok_or("Defender card not found")?;
    
    // Check if attacker is in attack mode
    if !attacker_tile.is_attack_mode {
        return Err("Attacker must be in attack mode".to_string());
    }
    
    // Calculate damage based on range and positions
    let distance = calculate_distance(attacker_x, attacker_y, defender_x, defender_y);
    let range = attacker_tile.card_id.map_or(1, |card_id| {
        cards_table().get(red, card_id).map_or(1, |card| card.range)
    });
    
    if distance > range {
        return Err("Target is out of range".to_string());
    }
    
    // Calculate attack power
    let attack_power = attacker_card.attack;
    let defense_power = if defender_tile.is_attack_mode {
        defender_card.attack
    } else {
        defender_card.defense
    };
    
    // Determine result
    let attacker_wins = attack_power > defense_power;
    
    // Remove the losing card
    if attacker_wins {
        // Defender is destroyed
        match_data.board_state.tiles[defender_x][defender_y] = None;
        
        // Check for win condition
        if check_win_condition(&mut match_data, red) {
            match_data.status = MatchStatus::Completed;
            match_data.winner_id = Some(attacker_tile.owner_player_id.unwrap());
        }
    } else {
        // Attacker is destroyed
        match_data.board_state.tiles[attacker_x][attacker_y] = None;
        
        // Check for win condition
        if check_win_condition(&mut match_data, red) {
            match_data.status = MatchStatus::Completed;
            match_data.winner_id = Some(defender_tile.owner_player_id.unwrap());
        }
    }
    
    match_data.updated_at = current_timestamp();
    matches_table().insert(red, match_id, match_data);
    
    Ok(())
}

// Helper functions
fn calculate_distance(x1: usize, y1: usize, x2: usize, y2: usize) -> usize {
    let dx = (x1 as i32 - x2 as i32).abs();
    let dy = (y1 as i32 - y2 as i32).abs();
    std::cmp::max(dx, dy) as usize
}

fn check_win_condition(match_data: &mut Match, red: &mut Red) -> bool {
    // Count cards for each player
    let mut player1_cards = 0;
    let mut player2_cards = 0;
    
    for row in match_data.board_state.tiles.iter() {
        for tile in row.iter() {
            if let Some(tile) = tile {
                if tile.owner_player_id == Some(match_data.player1_id) {
                    player1_cards += 1;
                } else if tile.owner_player_id == Some(match_data.player2_id) {
                    player2_cards += 1;
                }
            }
        }
    }
    
    // Game ends when a player has no cards left
    player1_cards == 0 || player2_cards == 0
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
                base_attack + random_range(3) as i32,
                base_defense + random_range(2) as i32,
                base_range + random_range(1) as i32,
            )
        },
        CardType::Building => {
            // Buildings focus on defense, no attack
            (
                0, // Buildings can't attack
                base_defense + random_range(5) as i32,
                1, // Buildings have range 1
            )
        },
        CardType::Spell => {
            // Spells have balanced stats, high range
            (
                base_attack + random_range(2) as i32,
                base_defense + random_range(2) as i32,
                base_range + random_range(3) as i32,
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

// Daily card generation reducer
#[reducer]
pub fn generate_daily_cards(red: &mut Red) {
    // This would need to be called by a cron job
    // For now, it's a placeholder that generates cards
    // In a real implementation, this would use the daily_cards module
    let seed_nouns = ["Sun", "Moon", "Star", "Fire", "Water", "Earth"];
    let mut rng = rand::thread_rng();
    
    for noun in seed_nouns {
        let rarity = match rng.gen_range(0..4) {
            0 => Rarity::Common,
            1 => Rarity::Rare,
            2 => Rarity::Epic,
            _ => Rarity::Legendary,
        };
        
        let card_type = match rng.gen_range(0..3) {
            0 => CardType::Unit,
            1 => CardType::Building,
            2 => CardType::Spell,
            _ => CardType::Unit,
        };
        
        generate_card(red, noun.to_string(), Some(rarity), Some(card_type));
    }
}