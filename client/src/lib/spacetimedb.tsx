"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DbConnection } from "../generated";

// Default to local SpacetimeDB instance
const SPACETIMEDB_URI = process.env.NEXT_PUBLIC_SPACETIMEDB_URI || "ws://localhost:3000";

type DbConn = DbConnection | null;

interface SpacetimeDBContextType {
  conn: DbConn;
  connected: boolean;
  error: string | null;
}

const SpacetimeDBContext = createContext<SpacetimeDBContextType>({
  conn: null,
  connected: false,
  error: null,
});

export function useSpacetimeDB() {
  return useContext(SpacetimeDBContext);
}

export function SpacetimeDBProvider({ children }: { children: React.ReactNode }) {
  const [conn, setConn] = useState<DbConn>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        .onConnectError((ctx) => {
          console.error("SpacetimeDB connect error");
          setError("Failed to connect to SpacetimeDB");
          setConnected(false);
        })
        .onDisconnect((ctx) => {
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

  return (
    <SpacetimeDBContext.Provider value={{ conn, connected, error }}>
      {children}
    </SpacetimeDBContext.Provider>
  );
}
