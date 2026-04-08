'use client';

import { useSpacetimeDB } from '@/lib/spacetimedb';
import { GameCard } from '@/components/game/GameCard';
import { useState } from 'react';
import { AICardGenerator } from '@/lib/ai-card-generator';

export default function DailyCardGenerator() {
  const { conn, connected, playerId } = useSpacetimeDB();
  const [generating, setGenerating] = useState(false);
  const [dailyCard, setDailyCard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!conn || !playerId) return;
    setGenerating(true);
    setError(null);

    try {
      // Pick noun and card type
      const noun = AICardGenerator.generateRandomNoun();
      const rarity = AICardGenerator.determineRarity();
      const cardType = AICardGenerator.getRandomCardType();

      // Call AI endpoints
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

      let aiDescription = AICardGenerator.fallbackDescription(noun, rarity as any, cardType);
      let aiImageUrl = '';

      if (descRes.ok) {
        const descData = await descRes.json();
        if (descData.description) aiDescription = descData.description;
      }

      if (imgRes.ok) {
        const imgData = await imgRes.json();
        if (imgData.image_url) aiImageUrl = imgData.image_url;
      }

      // Save to SpacetimeDB
      const reducers = conn.reducers as Record<string, (opts: unknown) => Promise<void>>;
      await (reducers.generateCard as (opts: {
        seedNoun: string;
        rarity: string;
        cardType: string;
        aiDescription: string;
        aiImageUrl: string;
      }) => Promise<void>)({
        seedNoun: noun,
        rarity,
        cardType,
        aiDescription,
        aiImageUrl,
      });

      // Fetch the newly created card (wait for DB update)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const db = conn.db as Record<string, { iter(): Iterable<any> }>;
      const cardsTable = db.cards;
      let latestCard: any = null;

      if (cardsTable) {
        let lastCard: any = null;
        for (const card of cardsTable.iter()) {
          lastCard = {
            id: Number(card.id),
            name: card.name,
            description: card.description,
            attack: card.attack,
            defense: card.defense,
            range: card.range,
            rarity: card.rarity,
            card_type: card.card_type,
            image_url: card.image_url,
          };
        }
        latestCard = lastCard;
      }

      setDailyCard(latestCard);
    } catch (err) {
      console.error('Failed to generate daily card:', err);
      setError('Failed to generate daily card. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!connected) {
    return (
      <div className="text-center p-8">
        <p className="text-yellow-400">Connecting to server...</p>
      </div>
    );
  }

  return (
    <div className="w-full text-center space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
          Daily Free Card
        </h2>
        <p className="text-white/60">Log in every day for a new AI-generated card!</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!dailyCard ? (
        <div className="py-8">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-primary py-4 px-8 text-lg"
          >
            {generating ? (
              <>
                <div className="spinner spinner-sm mr-3" />
                Generating...
              </>
            ) : (
              "Claim Today's Card"
            )}
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <GameCard
              name={dailyCard.name}
              description={dailyCard.description}
              attack={dailyCard.attack}
              defense={dailyCard.defense}
              range={dailyCard.range}
              rarity={dailyCard.rarity}
              type={dailyCard.card_type}
              imageUrl={dailyCard.image_url}
              size="lg"
            />
          </div>
          <p className="text-white/40 text-sm mb-4">Card added to your collection!</p>
          <button
            onClick={() => setDailyCard(null)}
            className="btn btn-ghost"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
