use spacetimedb::{view, ViewContext};
use crate::tables::*;

// Returns the player row for the caller's SpacetimeDB identity.
// Returns None if the caller has never triggered client_connected.
#[view(accessor = my_player, public)]
pub fn my_player(ctx: &ViewContext) -> Option<PlayerRow> {
    let identity = ctx.sender();
    let identity_row = ctx.db.player_identities().identity().find(identity)?;
    ctx.db.players().id().find(identity_row.player_id)
}
