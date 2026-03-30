// SpacetimeDB views have read-only access to the database via ViewHandle.
// ViewHandle does not expose iter() -- only indexed lookups.
// To enable proper views, add #[index(btree)] annotations to table fields
// and use the generated index accessors.
//
// For now, all data access happens through reducers (which have full Table access)
// and client-side subscriptions (which SpacetimeDB handles automatically for public tables).
//
// TODO: Add btree indexes to tables and implement views for:
// - get_cards_by_rarity (needs index on CardRow.rarity)
// - get_cards_by_type (needs index on CardRow.card_type)
// - get_decks_by_player (needs index on DeckRow.player_id)
// - get_matches_by_player (needs index on MatchRow.player1_id, player2_id)
// - get_active_matches (needs index on MatchRow.status)
