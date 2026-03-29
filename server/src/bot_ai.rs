use serde::{Deserialize, Serialize};

use crate::*;

// ============================================================
// Bot Difficulty
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BotDifficulty {
    Easy,    // Random moves, no strategy
    Medium,  // Basic strategy, prefers good trades
    Hard,    // Optimal play, considers board state
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BotPlayer {
    pub player_id: PlayerId,
    pub difficulty: BotDifficulty,
    pub name: String,
}

// ============================================================
// Bot AI Actions
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BotAction {
    PlaceCard { card_id: CardId, x: usize, y: usize, face_up: bool, attack_mode: bool },
    MoveCard { from_x: usize, from_y: usize, to_x: usize, to_y: usize },
    AttackCard { attacker_x: usize, attacker_y: usize, defender_x: usize, defender_y: usize },
    FlipCard { x: usize, y: usize },
    SwitchMode { x: usize, y: usize },
    EndTurn,
}

#[derive(Debug)]
struct BoardAnalysis {
    bot_cards: Vec<(usize, usize, CardId, bool)>,
    enemy_cards: Vec<(usize, usize, CardId, bool)>,
    empty_tiles: Vec<(usize, usize)>,
    bot_hand: Vec<CardId>,
}

impl BoardAnalysis {
    fn from_state(game_state: &GameState, match_data: &Match, bot_player_id: PlayerId) -> Self {
        let mut bot_cards = Vec::new();
        let mut enemy_cards = Vec::new();
        let mut empty_tiles = Vec::new();

        for x in 0..6 {
            for y in 0..3 {
                match &match_data.board_state.tiles[x][y] {
                    Some(tile) => {
                        if let Some(card_id) = tile.card_id {
                            if tile.owner_player_id == Some(bot_player_id) {
                                bot_cards.push((x, y, card_id, tile.is_attack_mode));
                            } else {
                                enemy_cards.push((x, y, card_id, tile.is_attack_mode));
                            }
                        }
                    }
                    None => empty_tiles.push((x, y)),
                }
            }
        }

        // Get bot's hand (cards from their deck)
        let bot_hand = get_bot_hand(game_state, bot_player_id);

        BoardAnalysis { bot_cards, enemy_cards, empty_tiles, bot_hand }
    }
}

fn get_bot_hand(game_state: &GameState, bot_player_id: PlayerId) -> Vec<CardId> {
    for (_, deck) in &game_state.decks {
        if deck.player_id == bot_player_id {
            return deck.cards.iter().take(5).copied().collect();
        }
    }
    Vec::new()
}

// ============================================================
// Main Bot AI Entry Point
// ============================================================

/// Returns the best action for the bot to take given the current game state
pub fn get_bot_action(game_state: &GameState, match_data: &Match, bot_player_id: PlayerId, difficulty: &BotDifficulty) -> BotAction {
    let analysis = BoardAnalysis::from_state(game_state, match_data, bot_player_id);

    match difficulty {
        BotDifficulty::Easy => easy_bot_action(&analysis, game_state),
        BotDifficulty::Medium => medium_bot_action(&analysis, game_state),
        BotDifficulty::Hard => hard_bot_action(&analysis, game_state, match_data),
    }
}

// ============================================================
// Easy Bot: Random moves
// ============================================================

fn easy_bot_action(analysis: &BoardAnalysis, game_state: &GameState) -> BotAction {
    let roll = random_f32();

    if roll < 0.3 && !analysis.bot_hand.is_empty() && !analysis.empty_tiles.is_empty() {
        let card_idx = random_range(analysis.bot_hand.len());
        let tile_idx = random_range(analysis.empty_tiles.len());
        let (x, y) = analysis.empty_tiles[tile_idx];
        return BotAction::PlaceCard {
            card_id: analysis.bot_hand[card_idx],
            x, y,
            face_up: random_f32() > 0.5,
            attack_mode: random_f32() > 0.5,
        };
    }

    if roll < 0.5 && !analysis.bot_cards.is_empty() && !analysis.enemy_cards.is_empty() {
        let atk_idx = random_range(analysis.bot_cards.len());
        let def_idx = random_range(analysis.enemy_cards.len());
        let (ax, ay, _, _) = analysis.bot_cards[atk_idx];
        let (dx, dy, _, _) = analysis.enemy_cards[def_idx];
        return BotAction::AttackCard {
            attacker_x: ax, attacker_y: ay,
            defender_x: dx, defender_y: dy,
        };
    }

    if roll < 0.7 && !analysis.bot_cards.is_empty() && !analysis.empty_tiles.is_empty() {
        let (fx, fy, _, _) = analysis.bot_cards[random_range(analysis.bot_cards.len())];
        let (tx, ty) = analysis.empty_tiles[random_range(analysis.empty_tiles.len())];
        return BotAction::MoveCard { from_x: fx, from_y: fy, to_x: tx, to_y: ty };
    }

    BotAction::EndTurn
}

// ============================================================
// Medium Bot: Basic strategy
// ============================================================

fn medium_bot_action(analysis: &BoardAnalysis, game_state: &GameState) -> BotAction {
    // 1. Favorable attack
    if let Some(action) = find_best_attack(analysis, game_state, 0.5) {
        return action;
    }

    // 2. Place cards in center
    if !analysis.bot_hand.is_empty() && !analysis.empty_tiles.is_empty() {
        let best_pos = analysis.empty_tiles.iter()
            .min_by_key(|(x, _)| (x.clone() as i32 - 3i32).unsigned_abs())
            .unwrap();
        return BotAction::PlaceCard {
            card_id: analysis.bot_hand[0],
            x: best_pos.0, y: best_pos.1,
            face_up: true,
            attack_mode: true,
        };
    }

    // 3. Move toward enemies
    if !analysis.bot_cards.is_empty() && !analysis.enemy_cards.is_empty() {
        for (bx, by, _, is_attack) in &analysis.bot_cards {
            if *is_attack {
                if let Some((ex, ey, _, _)) = analysis.enemy_cards.first() {
                    let dx = if ex > bx { 1 } else if ex < bx { -1 } else { 0 };
                    let dy = if ey > by { 1 } else if ey < by { -1 } else { 0 };
                    let nx = ((*bx as i32) + dx) as usize;
                    let ny = ((*by as i32) + dy) as usize;
                    if nx < 6 && ny < 3 && analysis.empty_tiles.contains(&(nx, ny)) {
                        return BotAction::MoveCard { from_x: *bx, from_y: *by, to_x: nx, to_y: ny };
                    }
                }
            }
        }
    }

    BotAction::EndTurn
}

// ============================================================
// Hard Bot: Optimal play
// ============================================================

fn hard_bot_action(analysis: &BoardAnalysis, game_state: &GameState, match_data: &Match) -> BotAction {
    // 1. Lethal (win condition)
    if analysis.enemy_cards.len() == 1 {
        if let Some(action) = find_best_attack(analysis, game_state, -100.0) {
            return action;
        }
    }

    // 2. Best value trade
    if let Some(action) = find_best_attack(analysis, game_state, 1.0) {
        return action;
    }

    // 3. Place strongest card near enemy side
    if !analysis.bot_hand.is_empty() && !analysis.empty_tiles.is_empty() {
        let mut best_card_idx = 0;
        let mut best_power = 0i32;
        for (i, &card_id) in analysis.bot_hand.iter().enumerate() {
            if let Some(card) = game_state.cards.get(&card_id) {
                let power = card.attack + card.defense;
                if power > best_power {
                    best_power = power;
                    best_card_idx = i;
                }
            }
        }

        let best_pos = analysis.empty_tiles.iter()
            .max_by_key(|(x, _)| x)
            .unwrap();
        return BotAction::PlaceCard {
            card_id: analysis.bot_hand[best_card_idx],
            x: best_pos.0, y: best_pos.1,
            face_up: true,
            attack_mode: true,
        };
    }

    // 4. Move attack cards toward weakest enemy
    if !analysis.bot_cards.is_empty() && !analysis.enemy_cards.is_empty() {
        let mut best_move: Option<BotAction> = None;
        let mut best_score = i32::MIN;

        for (bx, by, _, is_attack) in &analysis.bot_cards {
            if !is_attack { continue; }
            for (ex, ey, enemy_card_id, _) in &analysis.enemy_cards {
                let dist = chebyshev_dist(*bx, *by, *ex, *ey);
                if dist <= 1 { continue; }

                let dx = if ex > bx { 1 } else if ex < bx { -1 } else { 0 };
                let dy = if ey > by { 1 } else if ey < by { -1 } else { 0 };
                let nx = ((*bx as i32) + dx) as usize;
                let ny = ((*by as i32) + dy) as usize;

                if nx < 6 && ny < 3 && analysis.empty_tiles.contains(&(nx, ny)) {
                    let score = -(dist as i32);
                    if score > best_score {
                        best_score = score;
                        best_move = Some(BotAction::MoveCard {
                            from_x: *bx, from_y: *by, to_x: nx, to_y: ny
                        });
                    }
                }
            }
        }

        if let Some(action) = best_move {
            return action;
        }
    }

    BotAction::EndTurn
}

// ============================================================
// Shared Helpers
// ============================================================

fn find_best_attack(analysis: &BoardAnalysis, game_state: &GameState, min_advantage: f32) -> Option<BotAction> {
    let mut best: Option<BotAction> = None;
    let mut best_score = f32::MIN;

    for (ax, ay, atk_card_id, is_attack) in &analysis.bot_cards {
        if !is_attack { continue; }

        let atk_card = game_state.cards.get(atk_card_id)?;
        let atk_range = atk_card.range as usize;

        for (dx, dy, def_card_id, def_is_attack) in &analysis.enemy_cards {
            let dist = chebyshev_dist(*ax, *ay, *dx, *dy);
            if dist > atk_range { continue; }

            let def_card = game_state.cards.get(def_card_id)?;
            let def_value = if *def_is_attack { def_card.attack } else { def_card.defense };

            let advantage = (atk_card.attack - def_value) as f32;
            if advantage >= min_advantage && advantage > best_score {
                best_score = advantage;
                best = Some(BotAction::AttackCard {
                    attacker_x: *ax, attacker_y: *ay,
                    defender_x: *dx, defender_y: *dy,
                });
            }
        }
    }

    best
}

fn chebyshev_dist(x1: usize, y1: usize, x2: usize, y2: usize) -> usize {
    let dx = (x1 as i32 - x2 as i32).abs();
    let dy = (y1 as i32 - y2 as i32).abs();
    std::cmp::max(dx, dy) as usize
}
