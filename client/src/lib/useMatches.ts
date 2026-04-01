'use client';

import { useEffect, useState, useCallback } from "react";
import { useSpacetimeDB } from "./spacetimedb";
import type { DbConnection } from "../generated";

export interface DbMatch {
  id: bigint;
  player1Id: bigint;
  player2Id: bigint;
  boardStateJson: string;
  currentTurn: bigint;
  status: string;
  winnerId: bigint;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface DbPlayer {
  id: bigint;
  name: string;
  email: string;
  createdAt: bigint;
  rating: number;
}

function parseMatches(db: DbConnection["db"]): DbMatch[] {
  try {
    const matchesTable = db.game_matches as { iter(): Iterable<DbMatch> } | undefined;
    if (!matchesTable) return [];
    const rows: DbMatch[] = [];
    for (const row of matchesTable.iter()) {
      rows.push(row as DbMatch);
    }
    rows.sort((a, b) => Number(b.createdAt - a.createdAt));
    return rows;
  } catch {
    return [];
  }
}

function parsePlayers(db: DbConnection["db"]): DbPlayer[] {
  try {
    const playersTable = db.players as { iter(): Iterable<DbPlayer> } | undefined;
    if (!playersTable) return [];
    const rows: DbPlayer[] = [];
    for (const row of playersTable.iter()) {
      rows.push(row as DbPlayer);
    }
    return rows;
  } catch {
    return [];
  }
}

export function useMatches() {
  const { conn, connected } = useSpacetimeDB();
  const [matches, setMatches] = useState<DbMatch[]>([]);
  const [players, setPlayers] = useState<DbPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    if (!conn) return;
    try {
      const db = conn.db as DbConnection["db"];
      setMatches(parseMatches(db));
      setPlayers(parsePlayers(db));
      setLoading(false);
    } catch (e) {
      setError(`Failed to read data: ${e}`);
      setLoading(false);
    }
  }, [conn]);

  useEffect(() => {
    if (!conn || !connected) return;

    let handle1: { unsubscribe(): void } | null = null;
    let handle2: { unsubscribe(): void } | null = null;

    try {
      handle1 = conn
        .subscriptionBuilder()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .onApplied((_ctx: any) => {
          fetchData();
        })
        .subscribe("SELECT * FROM game_matches") as { unsubscribe(): void };
      handle2 = conn
        .subscriptionBuilder()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .onApplied((_ctx: any) => {
          fetchData();
        })
        .subscribe("SELECT * FROM players") as { unsubscribe(): void };
    } catch (e) {
      setError(`Subscription error: ${e}`);
      setLoading(false);
    }

    return () => {
      if (handle1) {
        try {
          handle1.unsubscribe();
        } catch (_) { /* ignore cleanup errors */ }
      }
      if (handle2) {
        try {
          handle2.unsubscribe();
        } catch (_) { /* ignore cleanup errors */ }
      }
    };
  }, [conn, connected, fetchData]);

  const createMatch = useCallback(
    async (player1Id: bigint, player2Id: bigint) => {
      if (!conn) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (conn.reducers as any).createMatch({
        player1Id,
        player2Id,
      });
    },
    [conn]
  );

  const getPlayerById = useCallback(
    (playerId: bigint): DbPlayer | undefined => {
      return players.find((p) => p.id === playerId);
    },
    [players]
  );

  const getWaitingMatches = useCallback((): DbMatch[] => {
    return matches.filter((m) => m.status === "Waiting");
  }, [matches]);

  const getActiveMatches = useCallback((): DbMatch[] => {
    return matches.filter((m) => m.status === "Active");
  }, [matches]);

  return {
    matches,
    players,
    loading,
    error,
    createMatch,
    getPlayerById,
    getWaitingMatches,
    getActiveMatches,
  };
}
