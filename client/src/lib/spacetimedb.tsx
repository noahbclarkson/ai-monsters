"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { DbConnection, type ErrorContext } from "../generated";

// Default to local SpacetimeDB instance
const SPACETIMEDB_URI = process.env.NEXT_PUBLIC_SPACETIMEDB_URI || "ws://localhost:3000";

type DbConn = DbConnection | null;

interface SpacetimeDBContextType {
  conn: DbConn;
  connected: boolean;
  error: string | null;
  playerId: bigint | null;
}

const SpacetimeDBContext = createContext<SpacetimeDBContextType>({
  conn: null,
  connected: false,
  error: null,
  playerId: null,
});

export function useSpacetimeDB() {
  return useContext(SpacetimeDBContext);
}

export function SpacetimeDBProvider({ children }: { children: React.ReactNode }) {
  const [conn, setConn] = useState<DbConn>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<bigint | null>(null);

  useEffect(() => {
    let connection: DbConnection | null = null;

    try {
      connection = DbConnection.builder()
        .withUri(SPACETIMEDB_URI)
        .withDatabaseName("ai-monsters")
        .onConnect((ctx) => {
          console.log("Connected to SpacetimeDB");
          setConnected(true);
          setError(null);
        })
        .onConnectError((_ctx) => {
          console.error("SpacetimeDB connect error");
          setError("Failed to connect to SpacetimeDB");
          setConnected(false);
        })
        .onDisconnect((_ctx) => {
          console.log("Disconnected from SpacetimeDB");
          setConnected(false);
        })
        .build();

      setConn(connection);
    } catch (e) {
      setError(`SpacetimeDB init error: ${e}`);
      console.error("SpacetimeDB init error:", e);
    }

    return () => {
      // Cleanup handled by SpacetimeDB SDK
    };
  }, []);

  // Subscribe to player identity once connected
  // onApplied fires on every subscription reconnect, handling client_connected propagation
  useEffect(() => {
    if (!conn || !connected) return;

    let subHandle: { unsubscribe(): void } | null = null;

    const loadPlayerId = () => {
      if (!conn) return;
      const callerIdentity = conn.identity;
      if (!callerIdentity) return;

      // Try my_player view first (returns Option<PlayerRow> keyed by sender identity)
      const myPlayers = conn.db.my_player;
      for (const row of myPlayers.iter()) {
        setPlayerId(row.id);
        return;
      }

      // Fallback: look up player_identities by caller identity
      const identities = conn.db.player_identities;
      for (const row of identities.iter()) {
        if (callerIdentity.equals(row.identity)) {
          setPlayerId(row.playerId);
          return;
        }
      }

      // No identity yet - client_connected reducer may not have run
      // onApplied will fire again when subscription reconnects or data changes
    };

    try {
      subHandle = conn.subscriptionBuilder()
        .onApplied((_ctx: unknown) => {
          loadPlayerId();
        })
        .onError((_ctx: ErrorContext) => {
          console.error("Player identity subscription error");
        })
        .subscribe([
          "SELECT * FROM my_player",
          "SELECT * FROM player_identities"
        ]) as { unsubscribe(): void };
    } catch (e) {
      console.error("Failed to subscribe to player identity:", e);
    }

    return () => {
      if (subHandle) {
        try {
          subHandle.unsubscribe();
        } catch (_) { /* ignore cleanup errors */ }
      }
    };
  }, [conn, connected]);

  return (
    <SpacetimeDBContext.Provider value={{ conn, connected, error, playerId }}>
      {children}
    </SpacetimeDBContext.Provider>
  );
}
