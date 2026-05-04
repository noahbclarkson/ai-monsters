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

  const todayDate = getTodayDate();
  const dayStartTimestamp = getDayStartTimestamp();

  const fetchDailyCards = useCallback(() => {
    if (!conn) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // Generate AI image using the image API route
      let imageUrl = '';
      try {
        const imgRes = await fetch('/api/generate-card-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noun: name, cardType, rarity }),
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          imageUrl = imgData.image_url || imgData.url || '';
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = conn.db as any;
      const cardsTable = db.cards as { iter(): Iterable<DbCard> } | undefined;

      // Record IDs before calling generate_daily_cards
      const idsBefore = new Set<string>();
      if (cardsTable) {
        for (const row of cardsTable.iter()) {
          idsBefore.add(String((row as unknown as DbCard).id));
        }
      }

      // Call generate_daily_cards reducer (no args)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (conn.reducers as any).generateDailyCards();

      // Wait for reducer to complete and subscription to fire
      await new Promise((r) => setTimeout(r, 1500));
      await fetchDailyCards();

      // Re-read cards directly from the DB to find the newly created ones.
      // We cannot use the `dailyCards` state variable here — it was captured at
      // callback creation time (stale closure) and is not updated until the
      // next render cycle completes after setIsGenerating/setIsEnhancing.
      const currentIds = new Set<string>();
      if (cardsTable) {
        for (const row of cardsTable.iter()) {
          currentIds.add(String((row as unknown as DbCard).id));
        }
      }
      const newCardIds = [...currentIds].filter((id) => !idsBefore.has(id));

      // After calling generate_daily_cards, enhance each new card with AI content.
      // Note: generate_daily_cards uses empty AI content (String::new()) since it
      // cannot call external AI APIs from within a SpacetimeDB reducer.
      // The enhanceCard call here patches AI content onto cards after creation.
      if (newCardIds.length > 0) {
        setIsEnhancing(true);
        for (const cardIdStr of newCardIds) {
          const cardId = BigInt(cardIdStr);
          // Look up the card's metadata directly from the table
          let cardMeta: { name: string; rarity: string; cardType: string } | null = null;
          if (cardsTable) {
            for (const row of cardsTable.iter()) {
              if (String((row as unknown as DbCard).id) === cardIdStr) {
                const c = row as unknown as DbCard;
                cardMeta = { name: c.name, rarity: c.rarity, cardType: c.cardType };
                break;
              }
            }
          }
          if (cardMeta) {
            await enhanceCard(cardId, cardMeta.name, cardMeta.rarity, cardMeta.cardType);
          }
        }
        setIsEnhancing(false);
      }

      setHasClaimed(true);
      localStorage.setItem(`ai-monsters-daily-${todayDate}`, 'claimed');

      // Re-fetch after enhancement to pick up the updated description/image_url
      await new Promise((r) => setTimeout(r, 500));
      await fetchDailyCards();
    } catch (e) {
      setError(`Failed to generate daily cards: ${e}`);
    } finally {
      setIsGenerating(false);
    }
  }, [conn, hasClaimed, enhanceCard, fetchDailyCards, todayDate]);

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
