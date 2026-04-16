'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSpacetimeDB } from './spacetimedb';
import { DbCard } from './useCards';

export interface DailyCard extends DbCard {
  date: string;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getDayStartTimestamp(): number {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(dayStart.getTime() / 1000);
}

export function useDailyCards() {
  const { conn, connected } = useSpacetimeDB();
  const [dailyCards, setDailyCards] = useState<DailyCard[]>([]);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previouslySeenIds = useRef(new Set<string>());

  const todayDate = getTodayDate();
  const dayStartTimestamp = getDayStartTimestamp();

  const fetchDailyCards = useCallback(() => {
    if (!conn) return;
    try {
      // eslint-disable-next-line @typescript-eslint/noallelic/no-explicit-any
      const db = conn.db as any;
      const cardsTable = db.cards as { iter(): Iterable<DbCard> } | undefined;
      if (!cardsTable) return;

      const todayCards: DailyCard[] = [];
      for (const row of cardsTable.iter()) {
        const card = row as unknown as DbCard;
        const createdAtSec = typeof card.createdAt === 'bigint'
          ? Number(card.createdAt)
          : typeof card.createdAt === 'number' ? card.createdAt : 0;

        if (createdAtSec >= dayStartTimestamp) {
          todayCards.push({
            ...card,
            date: todayDate,
          });
        }
      }
      todayCards.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      setDailyCards(todayCards);
      setLoading(false);
    } catch (e) {
      setError(`Failed to read daily cards: ${e}`);
      setLoading(false);
    }
  }, [conn, dayStartTimestamp, todayDate]);

  useEffect(() => {
    if (!conn || !connected) return;

    // Check localStorage for today's claim status
    const claimed = localStorage.getItem(`ai-monsters-daily-${todayDate}`);
    setHasClaimed(claimed === 'claimed');

    let handle: { unsubscribe(): void } | null = null;

    try {
      handle = conn
        .subscriptionBuilder()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .onApplied((_ctx: any) => {
          fetchDailyCards();
        })
        .subscribe('SELECT * FROM cards') as { unsubscribe(): void };
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
  }, [conn, connected, fetchDailyCards, todayDate]);

  // Track seen card IDs to detect new cards from generate_daily_cards
  useEffect(() => {
    dailyCards.forEach((c) => {
      previouslySeenIds.current.add(String(c.id));
    });
  }, [dailyCards]);

  const enhanceCard = useCallback(async (cardId: bigint, name: string, rarity: string, cardType: string) => {
    if (!conn) return;

    try {
      // Generate AI description
      const descRes = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noun: name, rarity, cardType }),
      });

      let description = '';
      if (descRes.ok) {
        const descData = await descRes.json();
        description = descData.description || '';
      }

      // Generate AI image using OpenClaw image_generate tool
      // Since we're in a React hook (client), we call the image API route instead
      let imageUrl = '';
      try {
        const imgRes = await fetch('/api/generate-card-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noun: name, cardType, rarity }),
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          imageUrl = imgData.imageUrl || imgData.url || '';
        }
      } catch {
        // Image generation failed, leave empty
      }

      // Update card in SpacetimeDB
      const cardIdNum = typeof cardId === 'bigint' ? Number(cardId) : cardId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (conn.reducers as any).update_card_media({
        cardId: cardIdNum,
        description,
        imageUrl,
      });
    } catch (e) {
      console.error('Failed to enhance card:', cardId, e);
    }
  }, [conn]);

  const claimDailyCard = useCallback(async () => {
    if (!conn || hasClaimed) return;
    setIsGenerating(true);
    setError(null);

    try {
      // Record IDs before calling generate_daily_cards
      const idsBefore = new Set<string>();
      const db = conn.db as any;
      const cardsTable = db.cards as { iter(): Iterable<DbCard> } | undefined;
      if (cardsTable) {
        for (const row of cardsTable.iter()) {
          idsBefore.add(String((row as unknown as DbCard).id));
        }
      }

      // Call generate_daily_cards reducer (no args)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (conn.reducers as any).generateDailyCards();

      // Wait briefly for reducer to complete and subscription to fire
      await new Promise((r) => setTimeout(r, 1500));
      await fetchDailyCards();

      // Find new cards (cards created during this call)
      const newCards = dailyCards.filter(
        (c) => !idsBefore.has(String(c.id)) && !previouslySeenIds.current.has(String(c.id))
      );

      // Enhance new cards with AI
      if (newCards.length > 0) {
        setIsEnhancing(true);
        for (const card of newCards) {
          await enhanceCard(card.id, card.name, card.rarity, card.cardType);
        }
        setIsEnhancing(false);
      }

      setHasClaimed(true);
      localStorage.setItem(`ai-monsters-daily-${todayDate}`, 'claimed');

      // Re-fetch after enhancement
      await new Promise((r) => setTimeout(r, 500));
      await fetchDailyCards();
    } catch (e) {
      setError(`Failed to generate daily cards: ${e}`);
    } finally {
      setIsGenerating(false);
    }
  }, [conn, hasClaimed, dailyCards, enhanceCard, fetchDailyCards, todayDate]);

  return {
    dailyCards,
    hasClaimed,
    isGenerating,
    isEnhancing,
    loading,
    error,
    claimDailyCard,
  };
}
