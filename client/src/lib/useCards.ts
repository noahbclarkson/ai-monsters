"use client";

import { useEffect, useState, useCallback } from "react";
import { useSpacetimeDB } from "./spacetimedb";

export interface DbCard {
  id: bigint;
  name: string;
  description: string;
  imageUrl: string;
  attack: number;
  defense: number;
  range: number;
  rarity: string;
  cardType: string;
  seedNoun: string;
  createdAt: bigint;
  lastUsedCount: number;
}

export function useCards() {
  const { conn, connected } = useSpacetimeDB();
  const [cards, setCards] = useState<DbCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(() => {
    if (!conn) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = conn.db as any;
      const cardsTable = db.cards as { iter(): Iterable<DbCard> } | undefined;
      if (cardsTable) {
        const rows: DbCard[] = [];
        for (const row of cardsTable.iter()) {
          rows.push(row as DbCard);
        }
        rows.sort((a, b) => Number(b.createdAt - a.createdAt));
        setCards(rows);
      }
      setLoading(false);
    } catch (e) {
      setError(`Failed to read cards: ${e}`);
      setLoading(false);
    }
  }, [conn]);

  useEffect(() => {
    if (!conn || !connected) return;

    let handle: { unsubscribe(): void } | null = null;

    try {
      handle = conn
        .subscriptionBuilder()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .onApplied((_ctx: any) => {
          fetchCards();
        })
        .subscribe("SELECT * FROM cards") as { unsubscribe(): void };
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
  }, [conn, connected, fetchCards]);

  const generateCard = useCallback(
    async (seedNoun?: string, rarity?: string, cardType?: string, aiDescription?: string, aiImageUrl?: string) => {
      if (!conn) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (conn.reducers as any).generateCard({
        seedNoun: seedNoun ?? "",
        rarity: rarity ?? "",
        cardType: cardType ?? "",
        aiDescription: aiDescription ?? "",
        aiImageUrl: aiImageUrl ?? "",
      });
    },
    [conn]
  );

  return { cards, loading, error, generateCard, fetchCards };
}
