'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import { useSpacetimeDB } from "./spacetimedb";
import type { DbConnection } from "../generated";

export interface BotPlayerRow {
  playerId: bigint;
  name: string;
  difficulty: string;
}

export interface MatchRow {
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

/**
 * Hook for managing bot matches.
 * - Detects when it's the bot's turn in an active match
 * - Automatically calls run_bot_turn after a short delay
 * - Provides startSinglePlayerMatch helper
 */
export function useBotMatch(matchId: bigint | null) {
  const { conn, connected, playerId } = useSpacetimeDB();
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [isBotTurn, setIsBotTurn] = useState(false);
  const [botRunning, setBotRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ratingUpdatedRef = useRef<Set<string>>(new Set());

  // Fetch match and detect bot turns
  useEffect(() => {
    if (!conn || !connected || !matchId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = conn.db as any;

    const checkBotTurn = () => {
      // Find the match
      let currentMatch: MatchRow | null = null;
      const matchesTable = db.game_matches as { iter(): Iterable<MatchRow> } | undefined;
      if (!matchesTable) return;

      for (const row of matchesTable.iter()) {
        if (row.id === matchId) {
          currentMatch = row as MatchRow;
          break;
        }
      }

      if (!currentMatch || currentMatch.status !== "Active") {
        setIsBotTurn(false);
        return;
      }

      setMatch(currentMatch);

      // Check if current_turn player is a bot
      const botTable = db.bot_players as { iter(): Iterable<BotPlayerRow> } | undefined;
      if (!botTable) return;

      let turnIsBot = false;
      for (const bot of botTable.iter()) {
        if (bot.playerId === currentMatch.currentTurn) {
          turnIsBot = true;
          break;
        }
      }

      setIsBotTurn(turnIsBot);
    };

    checkBotTurn();

    // Poll for changes (SpacetimeDB subscription callbacks are unreliable in current SDK)
    const interval = setInterval(checkBotTurn, 1000);
    return () => clearInterval(interval);
  }, [conn, connected, matchId]);

  // Auto-trigger bot turn with a delay to feel natural
  useEffect(() => {
    if (!isBotTurn || !conn || botRunning || !matchId) return;

    // Clear any existing timer
    if (botTimerRef.current) {
      clearTimeout(botTimerRef.current);
    }

    // Bot "thinks" for 1-2 seconds
    const delay = 1000 + Math.random() * 1000;
    setBotRunning(true);

    botTimerRef.current = setTimeout(async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (conn.reducers as any).runBotTurn({ matchId });
      } catch (e) {
        setError(`Bot turn failed: ${e}`);
      } finally {
        setBotRunning(false);
        setIsBotTurn(false);
      }
    }, delay);

    return () => {
      if (botTimerRef.current) {
        clearTimeout(botTimerRef.current);
      }
    };
  }, [isBotTurn, conn, botRunning, matchId]);

  // Detect match completion and call update_rating
  useEffect(() => {
    if (!match || match.status !== "Completed" || !conn || !playerId) return;

    const matchKey = matchId?.toString();
    if (!matchKey || ratingUpdatedRef.current.has(matchKey)) return;

    // Only the winner should call update_rating to avoid double-calling
    if (match.winnerId !== playerId) return;

    // Determine loser: if player1 is the winner, player2 is the loser (and vice versa)
    const loserId = match.player1Id === match.winnerId ? match.player2Id : match.player1Id;

    ratingUpdatedRef.current.add(matchKey);

    // Call update_rating asynchronously (fire and forget for UI)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (conn.reducers as any).updateRating({ matchId, winnerId: match.winnerId, loserId }).catch((e: unknown) => {
      setError(`Rating update failed: ${e}`);
    });
  }, [match, conn, playerId, matchId]);

  // Start a single player match against a bot
  const startSinglePlayerMatch = useCallback(
    async (difficulty: string, playerCardIds: bigint[]) => {
      if (!conn) throw new Error("Not connected to SpacetimeDB");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (conn.reducers as any).startSinglePlayerMatch({
        difficulty,
        playerCardIds,
      });
    },
    [conn]
  );

  // Join matchmaking queue (prefers Bot for instant match)
  const joinBotQueue = useCallback(
    async (difficulty?: string) => {
      if (!conn) throw new Error("Not connected to SpacetimeDB");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (conn.reducers as any).joinMatchmakingQueue({
        preferredOpponent: "Bot",
        botDifficulty: difficulty ?? "Medium",
      });
    },
    [conn]
  );

  // Join matchmaking queue for human opponent
  const joinHumanQueue = useCallback(async () => {
    if (!conn) throw new Error("Not connected to SpacetimeDB");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (conn.reducers as any).joinMatchmakingQueue({
      preferredOpponent: "Human",
      botDifficulty: null,
    });
  }, [conn]);

  // Leave matchmaking queue
  const leaveQueue = useCallback(async () => {
    if (!conn) throw new Error("Not connected to SpacetimeDB");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (conn.reducers as any).leaveMatchmakingQueue({});
  }, [conn]);

  // Determine if it's the local player's turn
  const isMyTurn = match !== null && playerId !== null && match.currentTurn === playerId && match.status === "Active";

  return {
    match,
    isBotTurn,
    botRunning,
    isMyTurn,
    error,
    startSinglePlayerMatch,
    joinBotQueue,
    joinHumanQueue,
    leaveQueue,
  };
}
