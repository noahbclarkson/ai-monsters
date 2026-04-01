'use client';

import { useEffect, useState, useCallback } from "react";
import { useSpacetimeDB } from "./spacetimedb";
import type { ErrorContext } from "../generated";

/**
 * Subscribes to the caller's player identity via the my_player view.
 * The server's client_connected lifecycle reducer auto-creates the identity mapping
 * on first connect. This hook waits for that to propagate and exposes the caller's player_id.
 *
 * Note: The SpacetimeDBProvider already wires this up internally.
 * Components can use this hook as an alternative to reading playerId from useSpacetimeDB().
 */
export function usePlayerIdentity() {
  const { conn, connected } = useSpacetimeDB();
  const [playerId, setPlayerId] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIdentity = useCallback(() => {
    if (!conn) return null;

    let handle: { unsubscribe(): void } | null = null;

    const loadFromTables = () => {
      const callerIdentity = conn.identity;
      if (!callerIdentity) return;

      // Try my_player view first (returns Option<PlayerRow> keyed by sender)
      const myPlayers = conn.db.my_player;
      for (const row of myPlayers.iter()) {
        setPlayerId(row.id);
        setLoading(false);
        return;
      }

      // Fallback: look up player_identities by caller identity
      const identities = conn.db.player_identities;
      for (const row of identities.iter()) {
        if (callerIdentity.equals(row.identity)) {
          setPlayerId(row.playerId);
          setLoading(false);
          return;
        }
      }

      // No identity yet - client_connected may not have run yet
      setPlayerId(null);
      setLoading(false);
    };

    try {
      handle = conn.subscriptionBuilder()
        .onApplied(() => {
          loadFromTables();
        })
        .onError((_ctx: ErrorContext) => {
          console.error("Player identity subscription error");
          setLoading(false);
        })
        .subscribe([
          "SELECT * FROM my_player",
          "SELECT * FROM player_identities"
        ]) as { unsubscribe(): void };
    } catch (e) {
      console.error("Failed to subscribe to player identity:", e);
      setLoading(false);
    }

    return () => {
      if (handle) {
        try {
          handle.unsubscribe();
        } catch (_) { /* ignore cleanup errors */ }
      }
    };
  }, [conn]);

  useEffect(() => {
    if (!conn || !connected) return;
    setLoading(true);

    const cleanup = fetchIdentity();
    return () => {
      cleanup?.();
    };
  }, [conn, connected, fetchIdentity]);

  return { playerId, loading };
}
