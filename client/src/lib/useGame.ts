'use client';

import { useEffect, useState, useCallback } from "react";
import { useSpacetimeDB } from "./spacetimedb";
import type { DbConnection } from "../generated";

export interface BoardTile {
  card_id?: number;
  is_face_up: boolean;
  is_attack_mode: boolean;
  owner_player_id?: number;
}

export interface BoardState {
  tiles: BoardTile[][];
  turn_number: number;
  phase: "Placement" | "Action" | "Combat";
}

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

function parseBoardState(json: string): BoardState {
  try {
    const parsed = JSON.parse(json);
    // The server serializes BoardState as-is; tiles are a 6x3 array
    // Convert from flat-ish representation to our interface
    if (parsed.tiles && Array.isArray(parsed.tiles)) {
      return {
        tiles: parsed.tiles.map((row: unknown[]) =>
          Array.isArray(row) ? row.map((t) => t || {}) : []
        ) as BoardTile[][],
        turn_number: parsed.turn_number ?? 1,
        phase: parsed.phase ?? "Placement",
      };
    }
  } catch {
    /* fall through */
  }
  return {
    tiles: Array(6)
      .fill(null)
      .map(() =>
        Array(3)
          .fill(null)
          .map(() => ({ is_face_up: false, is_attack_mode: false }))
      ),
    turn_number: 1,
    phase: "Placement",
  };
}

export function useGame(matchId: bigint) {
  const { conn, connected } = useSpacetimeDB();
  const [match, setMatch] = useState<DbMatch | null>(null);
  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatch = useCallback(() => {
    if (!conn) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = conn.db as any;
      const matchesTable = db.game_matches as { iter(): Iterable<DbMatch> } | undefined;
      if (!matchesTable) return;
      for (const row of matchesTable.iter()) {
        if (row.id === matchId) {
          setMatch(row as DbMatch);
          setBoardState(parseBoardState(row.boardStateJson || "{}"));
          break;
        }
      }
      setLoading(false);
    } catch (e) {
      setError(`Failed to read match: ${e}`);
      setLoading(false);
    }
  }, [conn, matchId]);

  useEffect(() => {
    if (!conn || !connected) return;

    let handle: { unsubscribe(): void } | null = null;

    try {
      handle = conn
        .subscriptionBuilder()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .onApplied((_ctx: any) => {
          fetchMatch();
        })
        .subscribe("SELECT * FROM game_matches") as { unsubscribe(): void };
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
  }, [conn, connected, fetchMatch]);

  // place_card: place card from hand onto board
  const placeCard = useCallback(
    async (cardId: bigint, playerId: bigint, row: number, col: number) => {
      if (!conn) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (conn.reducers as any).placeCard({
        matchId,
        cardId,
        playerId,
        row,
        col,
      });
    },
    [conn, matchId]
  );

  // attack_card: attacker at (attackerRow, attackerCol) attacks defender at (defenderRow, defenderCol)
  const attackCard = useCallback(
    async (attackerRow: number, attackerCol: number, defenderRow: number, defenderCol: number) => {
      if (!conn) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (conn.reducers as any).attackCard({
        matchId,
        attackerRow,
        attackerCol,
        defenderRow,
        defenderCol,
      });
    },
    [conn, matchId]
  );

  // flip_card: flip card face-up or face-down
  const flipCard = useCallback(
    async (row: number, col: number) => {
      if (!conn) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (conn.reducers as any).flipCard({
        matchId,
        row,
        col,
      });
    },
    [conn, matchId]
  );

  // switch_card_mode: toggle attack/defense mode
  const switchCardMode = useCallback(
    async (row: number, col: number) => {
      if (!conn) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (conn.reducers as any).switchCardMode({
        matchId,
        row,
        col,
      });
    },
    [conn, matchId]
  );

  // move_card: move card from one tile to another
  const moveCard = useCallback(
    async (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      if (!conn) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (conn.reducers as any).moveCard({
        matchId,
        fromRow,
        fromCol,
        toRow,
        toCol,
      });
    },
    [conn, matchId]
  );

  // end_turn
  const endTurn = useCallback(async () => {
    if (!conn) throw new Error("Not connected");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (conn.reducers as any).endTurn({ matchId });
  }, [conn, matchId]);

  return {
    match,
    boardState,
    loading,
    error,
    placeCard,
    attackCard,
    flipCard,
    switchCardMode,
    moveCard,
    endTurn,
  };
}
