"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { DbConnection } from "../generated";

// Default to local SpacetimeDB instance
const SPACETIMEDB_URI = process.env.NEXT_PUBLIC_SPACETIMEDB_URI || "ws://localhost:3999";

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
  // Store loadPlayerId in a ref so the interval can call the latest version
  const loadPlayerIdRef = useRef<() => void>(() => {});

  useEffect(() => {
    let connection: DbConnection | null = null;

    try {
      connection = DbConnection.builder()
        .withUri(SPACETIMEDB_URI)
        .withDatabaseName("ai-monsters")
        .onConnect(() => {
          console.log("Connected to SpacetimeDB");
          setConnected(true);
          setError(null);
        })
        .onConnectError(() => {
          console.error("SpacetimeDB connect error");
          setError("Failed to connect to SpacetimeDB");
          setConnected(false);
        })
        .onDisconnect(() => {
          console.log("Disconnected from SpacetimeDB");
          setConnected(false);
          setPlayerId(null);
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

  // Robust player ID detection: poll for identity after connection
  // client_connected fires on connect, but subscription timing is unreliable
  loadPlayerIdRef.current = () => {
    if (!conn || !connected) return;
    const callerIdentity = conn.identity;
    if (!callerIdentity) return;

    // Try my_player view first (returns Option<PlayerRow> keyed by sender identity)
    const myPlayers = Array.from(conn.db.my_player.iter());
    if (myPlayers.length > 0) {
      if (playerId !== myPlayers[0].id) {
        console.log("Setting playerId from my_player view:", Number(myPlayers[0].id));
        setPlayerId(myPlayers[0].id);
      }
      return;
    }

    // Fallback: look up player_identities by caller identity
    const identities = conn.db.player_identities;
    for (const row of identities.iter()) {
      if (callerIdentity.equals(row.identity)) {
        if (playerId !== row.playerId) {
          console.log("Setting playerId from identities table:", Number(row.playerId));
          setPlayerId(row.playerId);
        }
        return;
      }
    }
  };

  useEffect(() => {
    if (!conn || !connected) return;

    // Load immediately (client_connected may have already fired)
    loadPlayerIdRef.current();

    // Also subscribe so we catch it when client_connected does fire
    let subHandle: { unsubscribe(): void } | null = null;
    try {
      subHandle = conn.subscriptionBuilder()
        .onApplied(() => {
          loadPlayerIdRef.current();
        })
        .subscribe([
          "SELECT * FROM my_player",
          "SELECT * FROM player_identities"
        ]) as { unsubscribe(): void };
    } catch (e) {
      console.error("Failed to subscribe to player identity:", e);
    }

    // Fallback: poll every 500ms for up to 10 seconds
    const pollInterval = setInterval(() => {
      loadPlayerIdRef.current();
    }, 500);
    const pollTimeout = setTimeout(() => {
      clearInterval(pollInterval);
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(pollTimeout);
      if (subHandle) {
        try { subHandle.unsubscribe(); } catch (_) { /* ignore */ }
      }
    };
  }, [conn, connected]);

  return (
    <SpacetimeDBContext.Provider value={{ conn, connected, error, playerId }}>
      {children}
    </SpacetimeDBContext.Provider>
  );
}
