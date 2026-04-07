'use client';

import { useSpacetimeDB } from '@/lib/spacetimedb';
import { GameCard } from '@/components/game/GameCard';
import { useState } from 'react';

export default function DailyCardGenerator() {
  const { conn, connected, playerId } = useSpacetimeDB();
  const [generating, setGenerating] = useState(false);
  const [dailyCard, setDailyCard] = useState<any>(null);

  const handleGenerate = async () => {
    if (!conn || !playerId) return;
    setGenerating(true);
    
    try {
      // Simulate API call to generate daily card
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const db = conn.db as Record<string, { iter(): Iterable<any> }>;
      const cardsTable = db.cards;
      
      if (cardsTable) {
        for (const card of cardsTable.iter()) {
          setDailyCard({
            id: Number(card.id),
            name: card.name,
            description: card.description,
            attack: card.attack,
            defense: card.defense,
            range: card.range,
            rarity: card.rarity as any,
            card_type: card.card_type as any,
            image_url: card.image_url,
          });
          break;
        }
      }
    } catch (err) {
      console.error('Failed to generate daily card:', err);
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
              'Claim Today\'s Card'
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
