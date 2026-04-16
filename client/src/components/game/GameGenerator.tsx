'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Gift, Layers } from 'lucide-react';
import { GameCard } from './GameCard';
import { AICardGenerator } from '@/lib/ai-card-generator';
import { Card } from '@/types/card';
import { useCards } from '@/lib/useCards';
import { useSpacetimeDB } from '@/lib/spacetimedb';

export function GameGenerator() {
  const [generatedCards, setGeneratedCards] = useState<Card[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [packCount, setPackCount] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const { generateCard: dbGenerateCard } = useCards();
  const { conn } = useSpacetimeDB();

  const generateSingleCard = useCallback(async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const noun = AICardGenerator.generateRandomNoun();
      const rarity = AICardGenerator.determineRarity();
      const cardType = AICardGenerator.getRandomCardType();

      // Generate AI content before saving — image and description both come from AI
      let aiDescription = AICardGenerator.fallbackDescription(noun, rarity as any, cardType);
      let aiImageUrl = '';

      const [descRes, imgRes] = await Promise.all([
        fetch('/api/generate-description', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: '', noun, rarity, cardType }),
        }),
        fetch('/api/generate-card-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noun, cardType, rarity, cardId: Date.now() }),
        }),
      ]);

      if (descRes.ok) {
        const descData = await descRes.json();
        if (descData.description) aiDescription = descData.description;
      }
      if (imgRes.ok) {
        const imgData = await imgRes.json();
        if (imgData.image_url) aiImageUrl = imgData.image_url;
      }

      // Save to SpacetimeDB with AI content directly — no separate update_card_media call needed
      await dbGenerateCard(noun, rarity, cardType, aiDescription, aiImageUrl);

      // Read back the newly created card (highest id = most recent)
      if (conn) {
        const db = conn.db as Record<string, { iter(): Iterable<{ id: bigint; [key: string]: any }> }>;
        let maxId = BigInt(0);
        let lastCard: any = null;
        if (db.cards) {
          for (const row of db.cards.iter()) {
            if (row.id > maxId) {
              maxId = row.id;
              lastCard = row;
            }
          }
        }

        if (lastCard) {
          const newCard: Card = {
            id: Number(lastCard.id),
            name: lastCard.name,
            description: aiDescription || lastCard.description,
            attack: lastCard.attack,
            defense: lastCard.defense,
            range: lastCard.range,
            rarity: lastCard.rarity,
            card_type: lastCard.cardType || 'Unit',
            image_url: aiImageUrl || lastCard.imageUrl || '',
            created_at: Number(lastCard.createdAt) || 0,
          };
          setGeneratedCards(prev => [...prev, newCard]);
        }
      }
    } catch (error) {
      console.error('Error generating card:', error);
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate card.');
    } finally {
      setIsGenerating(false);
    }
  }, [dbGenerateCard, conn]);

  const generatePack = useCallback(async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const packRarities: Array<'Common' | 'Rare' | 'Epic' | 'Legendary'> = [
        'Common', 'Common', 'Rare', 'Rare', 'Epic', 'Rare', 'Legendary',
      ];
      const nouns = [
        'Dragon', 'Phoenix', 'Golem', 'Spectre', 'Wraith',
        'Knight', 'Wizard', 'Archer', 'Beast', 'Spirit',
      ];

      for (let i = 0; i < 7; i++) {
        const rarity = packRarities[i] ?? 'Common';
        const cardType = (i % 3 === 0 ? 'Building' : i % 3 === 1 ? 'Spell' : 'Unit') as 'Unit' | 'Building' | 'Spell';
        const suffix = ['Prime', 'Alpha', 'Void', 'Storm', 'Doom', 'Rune', 'Shard'][i];
        const baseName = nouns[i % nouns.length];
        const uniqueName = `${baseName} ${suffix}`;

        // Call AI description endpoint
        let aiDescription = AICardGenerator.fallbackDescription(uniqueName, rarity, cardType);
        try {
          const descRes = await fetch('/api/generate-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: '', noun: uniqueName, rarity, cardType }),
          });
          if (descRes.ok) {
            const descData = await descRes.json();
            if (descData.description) aiDescription = descData.description;
          }
        } catch {
          // Fall back to template description
        }

        // Call AI image endpoint
        let aiImageUrl = '';
        try {
          const imgRes = await fetch('/api/generate-card-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ noun: uniqueName, cardType, rarity, cardId: Date.now() + i }),
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            if (imgData.image_url) aiImageUrl = imgData.image_url;
          }
        } catch {
          // Image is optional
        }

        await dbGenerateCard(uniqueName, rarity, cardType, aiDescription, aiImageUrl);
      }

      setPackCount(prev => prev + 1);

      // Re-read all cards from SpacetimeDB after batch save
      if (conn) {
        const db = conn.db as Record<string, { iter(): Iterable<{ id: bigint; [key: string]: any }> }>;
        const freshCards: Card[] = [];
        if (db.cards) {
          for (const row of db.cards.iter()) {
            freshCards.push({
              id: Number(row.id),
              name: row.name,
              description: row.description || '',
              attack: row.attack,
              defense: row.defense,
              range: row.range,
              rarity: row.rarity,
              card_type: row.cardType || 'Unit',
              image_url: row.imageUrl || '',
              created_at: Number(row.createdAt) || 0,
            });
          }
        }
        // Show the most recently created cards
        const topCards = freshCards
          .sort((a, b) => b.id - a.id)
          .slice(0, 7);
        setGeneratedCards(prev => [...prev, ...topCards]);
      }
    } catch (error) {
      console.error('Error generating pack:', error);
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate pack.');
    } finally {
      setIsGenerating(false);
    }
  }, [dbGenerateCard, conn]);

  const rarityStats = {
    Common: generatedCards.filter(c => c.rarity === 'Common').length,
    Rare: generatedCards.filter(c => c.rarity === 'Rare').length,
    Epic: generatedCards.filter(c => c.rarity === 'Epic').length,
    Legendary: generatedCards.filter(c => c.rarity === 'Legendary').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          Card Generator
        </h2>
        <p className="text-white/50">
          Create unique AI-powered cards with real artwork and intelligent descriptions
        </p>
      </div>

      {/* Error banner */}
      {generationError && (
        <div className="glass-card rounded-xl p-4 mb-6 border border-red-500/30">
          <p className="text-red-400 text-sm">{generationError}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total', value: generatedCards.length, color: '#8b5cf6' },
          { label: 'Packs', value: packCount, color: '#8b5cf6' },
          { label: 'Legendary', value: rarityStats.Legendary, color: '#f59e0b' },
          { label: 'Epic', value: rarityStats.Epic, color: '#a855f7' },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs text-white/50">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Generate buttons */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={generateSingleCard}
          disabled={isGenerating}
          className="btn btn-primary py-3 px-6"
        >
          {isGenerating ? (
            <>
              <div className="spinner spinner-sm" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} strokeWidth={1.8} />
              Generate Single
            </>
          )}
        </button>

        <button
          onClick={generatePack}
          disabled={isGenerating}
          className="btn btn-success py-3 px-6"
        >
          {isGenerating ? (
            <>
              <div className="spinner spinner-sm" />
              Generating Pack...
            </>
          ) : (
            <>
              <Gift size={16} strokeWidth={1.8} />
              Generate Pack (7)
            </>
          )}
        </button>
      </div>

      {/* Collection */}
      {generatedCards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Layers size={48} className="text-purple-400/40" strokeWidth={1} /></div>
          <p className="empty-state-title">No cards yet</p>
          <p className="empty-state-desc">
            Click a button above to generate your first AI card
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {generatedCards.map((card, index) => (
            <div key={`${card.id}-${index}`} className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
              <GameCard
                name={card.name}
                description={card.description}
                attack={card.attack}
                defense={card.defense}
                range={card.range}
                rarity={card.rarity}
                type={card.card_type}
                imageUrl={card.image_url}
                size="md"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
