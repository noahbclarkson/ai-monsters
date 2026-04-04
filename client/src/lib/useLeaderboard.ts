"use client";

import { useEffect, useState, useCallback } from "react";
import { useSpacetimeDB } from "./spacetimedb";

export interface LeaderboardPlayer {
  playerId: bigint;
  name: string;
  rating: number;
  level: number;
  wins: number;
  losses: number;
}

export function useLeaderboard(limit = 50) {
  const { conn, connected } = useSpacetimeDB();
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(() => {
    if (!conn) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = conn.db as any;

      // Build player_id -> player map
      const playersMap = new Map<bigint, { name: string; rating: number }>();
      const playersTable = db.players as { iter(): Iterable<{ id: bigint; name: string; rating: number }> } | undefined;
      if (playersTable) {
        for (const row of playersTable.iter()) {
          playersMap.set(row.id, { name: row.name, rating: row.rating });
        }
      }

      // Collect progress rows joined with player data
      const joined: LeaderboardPlayer[] = [];
      const progressTable = db.player_progress as { iter(): Iterable<{
        playerId: bigint;
        level: number;
        totalWins: number;
        totalLosses: number;
      }> } | undefined;
      if (progressTable) {
        for (const row of progressTable.iter()) {
          const player = playersMap.get(row.playerId);
          if (player) {
            joined.push({
              playerId: row.playerId,
              name: player.name,
              rating: player.rating,
              level: row.level,
              wins: row.totalWins,
              losses: row.totalLosses,
            });
          }
        }
      }

      // Sort by rating descending
      joined.sort((a, b) => b.rating - a.rating);
      setLeaderboard(joined.slice(0, limit));
      setLoading(false);
    } catch (e) {
      setError(`Failed to read leaderboard: ${e}`);
      setLoading(false);
    }
  }, [conn, limit]);

  useEffect(() => {
    if (!conn || !connected) return;

    let handle: { unsubscribe(): void } | null = null;

    try {
      handle = conn
        .subscriptionBuilder()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .onApplied((_ctx: any) => {
          fetchLeaderboard();
        })
        .subscribe([
          "SELECT * FROM players",
          "SELECT * FROM player_progress"
        ]) as { unsubscribe(): void };
    } catch (e) {
      setError(`Subscription error: ${e}`);
      setLoading(false);
    }

    return () => {
      if (handle) {
        try {
          handle.unsubscribe();
        } catch (_) { /* ignore cleanup errors */ }
      }
    };
  }, [conn, connected, fetchLeaderboard]);

  return { leaderboard, loading, error };
}
