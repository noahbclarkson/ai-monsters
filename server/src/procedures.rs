// Procedures require the `unstable` feature in spacetimedb 1.12.
// For now, game logic that was previously in procedures has been moved to reducers.
// When the unstable feature is enabled, async procedures for AI card generation
// and MiniMax image generation can be added here.
//
// TODO: Enable spacetimedb `unstable` feature and implement:
// - generate_ai_card: Generate card with AI description and MiniMax art
// - generate_ai_pack: Generate a full pack with AI-enhanced cards
// - open_pack: Open a card pack and award cards to a player
// - get_match_state: Get full match state with board for client rendering
