use serde::{Deserialize, Serialize};

pub mod bot_ai;
pub mod daily_cards;
pub mod matchmaking;
pub mod tables;
pub mod reducers;
pub mod views; // kept for future use, currently empty

pub use bot_ai::*;
pub use matchmaking::*;

// Simple pseudo-random number generator for WebAssembly compatibility
struct SimpleRng {
    seed: u64,
}

impl SimpleRng {
    fn new() -> Self {
        SimpleRng { seed: 0xdeadbeef12345678 }
    }
    
    fn next_range(&mut self, max: usize) -> usize {
        self.seed = self.seed.wrapping_mul(0x5deece66d) + 1;
        ((self.seed >> 16) as f32 / (1u64 << 16) as f32 * max as f32) as usize
    }
}

thread_local! {
    static RNG: std::cell::RefCell<SimpleRng> = std::cell::RefCell::new(SimpleRng::new());
}

pub fn random_range(max: usize) -> usize {
    RNG.with(|rng| rng.borrow_mut().next_range(max))
}

// Type aliases
pub type PlayerId = u64;
pub type CardId = u64;
pub type DeckId = u64;
pub type MatchId = u64;
pub type PackId = u64;

// Enums
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum MatchPhase {
    Placement = 1,
    Action = 2,
    Combat = 3,
}

// Board state structures (used in game_matches.board_state_json)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoardState {
    pub tiles: [[Option<BoardTile>; 3]; 6],
    pub turn_number: i32,
    pub phase: MatchPhase,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct BoardTile {
    pub card_id: Option<CardId>,
    pub is_face_up: bool,
    pub is_attack_mode: bool,
    pub owner_player_id: Option<PlayerId>,
}

/// Returns the ID of the player who has won, if any.
/// Win condition: a player wins when their opponent has zero cards on the board AND zero cards in hand.
pub fn check_win(board: &BoardState, player1_id: PlayerId, player2_id: PlayerId, p1_hand_count: usize, p2_hand_count: usize) -> Option<PlayerId> {
    let p1_board_cards = board.tiles.iter().flatten().filter(|t| t.as_ref().is_some_and(|tile| tile.owner_player_id == Some(player1_id))).count();
    let p2_board_cards = board.tiles.iter().flatten().filter(|t| t.as_ref().is_some_and(|tile| tile.owner_player_id == Some(player2_id))).count();

    let p1_total = p1_board_cards + p1_hand_count;
    let p2_total = p2_board_cards + p2_hand_count;

    if p1_total == 0 && p2_total > 0 {
        return Some(player2_id);
    }
    if p2_total == 0 && p1_total > 0 {
        return Some(player1_id);
    }
    None
}

/// Helper to create an empty board state for testing.
#[cfg(test)]
fn empty_board() -> BoardState {
    BoardState {
        tiles: [[None; 3]; 6],
        turn_number: 1,
        phase: MatchPhase::Placement,
    }
}

/// Helper to create a board with a single card placed for testing.
#[cfg(test)]
fn board_with_card(row: usize, col: usize, owner: PlayerId, card_id: CardId) -> BoardState {
    let mut board = empty_board();
    board.tiles[row][col] = Some(BoardTile {
        card_id: Some(card_id),
        is_face_up: true,
        is_attack_mode: true,
        owner_player_id: Some(owner),
    });
    board
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_win_no_cards_no_winner() {
        let board = empty_board();
        let result = check_win(&board, 1, 2, 0, 0);
        assert_eq!(result, None);
    }

    #[test]
    fn test_check_win_p1_board_card_p2_empty_p1_wins() {
        // P1 has a card on board, P2 has nothing -> P1 wins (opponent eliminated)
        let board = board_with_card(0, 0, 1, 100);
        let result = check_win(&board, 1, 2, 0, 0);
        assert_eq!(result, Some(1));
    }

    #[test]
    fn test_check_win_p1_board_and_hand_p2_empty_p1_wins() {
        // P1 has board cards AND hand cards, P2 has nothing -> P1 wins
        let board = board_with_card(0, 0, 1, 100);
        let result = check_win(&board, 1, 2, 3, 0);
        assert_eq!(result, Some(1));
    }

    #[test]
    fn test_check_win_p2_zero_board_and_hand_p1_wins() {
        // P2 has zero cards (board + hand), P1 has cards -> P1 wins
        let board = board_with_card(0, 0, 1, 100);
        let result = check_win(&board, 1, 2, 5, 0);
        assert_eq!(result, Some(1));
    }

    #[test]
    fn test_check_win_p1_zero_board_and_hand_p2_wins() {
        // P1 has zero cards, P2 has cards -> P2 wins
        let board = board_with_card(0, 0, 2, 100);
        let result = check_win(&board, 1, 2, 0, 3);
        assert_eq!(result, Some(2));
    }

    #[test]
    fn test_check_win_both_have_cards_no_winner() {
        let board = board_with_card(0, 0, 1, 100);
        let board = {
            let mut b = board;
            b.tiles[1][1] = Some(BoardTile {
                card_id: Some(200),
                is_face_up: true,
                is_attack_mode: true,
                owner_player_id: Some(2),
            });
            b
        };
        let result = check_win(&board, 1, 2, 2, 3);
        assert_eq!(result, None);
    }

    #[test]
    fn test_check_win_p1_hand_only_p2_empty_p1_wins() {
        // P1 has cards in hand, P2 has nothing -> P1 wins
        let board = empty_board();
        let result = check_win(&board, 1, 2, 3, 0);
        assert_eq!(result, Some(1));
    }

    #[test]
    fn test_check_win_p2_board_only_p1_empty_p2_wins() {
        // P2 has board card, P1 has nothing -> P2 wins
        let board = board_with_card(0, 0, 2, 100);
        let result = check_win(&board, 1, 2, 0, 0);
        assert_eq!(result, Some(2));
    }

    #[test]
    fn test_board_tile_struct() {
        let tile = BoardTile {
            card_id: Some(42),
            is_face_up: true,
            is_attack_mode: false,
            owner_player_id: Some(1),
        };
        assert_eq!(tile.card_id, Some(42));
        assert!(tile.is_face_up);
        assert!(!tile.is_attack_mode);
        assert_eq!(tile.owner_player_id, Some(1));
    }

    #[test]
    fn test_board_state_serializable() {
        let board = board_with_card(2, 1, 5, 999);
        let json = serde_json::to_string(&board).unwrap();
        let decoded: BoardState = serde_json::from_str(&json).unwrap();
        assert_eq!(board.turn_number, decoded.turn_number);
        assert_eq!(board.phase, decoded.phase);
        assert_eq!(board.tiles[2][1], decoded.tiles[2][1]);
    }

    #[test]
    fn test_empty_board_serialization() {
        let board = empty_board();
        let json = serde_json::to_string(&board).unwrap();
        let decoded: BoardState = serde_json::from_str(&json).unwrap();
        assert_eq!(board.turn_number, decoded.turn_number);
        for row in 0..6 {
            for col in 0..3 {
                assert!(decoded.tiles[row][col].is_none());
            }
        }
    }

    #[test]
    fn test_board_full_of_cards() {
        let mut board = empty_board();
        let mut card_id: CardId = 1;
        for row in 0..6 {
            for col in 0..3 {
                let owner = if card_id % 2 == 1 { 1 } else { 2 };
                board.tiles[row][col] = Some(BoardTile {
                    card_id: Some(card_id),
                    is_face_up: true,
                    is_attack_mode: true,
                    owner_player_id: Some(owner),
                });
                card_id += 1;
            }
        }
        // Full board: 9 cards each player (18 total), no hands
        let result = check_win(&board, 1, 2, 0, 0);
        assert_eq!(result, None); // No winner when both have cards
    }

    #[test]
    fn test_match_phase_enum() {
        assert_eq!(MatchPhase::Placement as i32, 1);
        assert_eq!(MatchPhase::Action as i32, 2);
        assert_eq!(MatchPhase::Combat as i32, 3);
    }

}
