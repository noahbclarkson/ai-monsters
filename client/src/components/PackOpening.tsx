'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gift } from 'lucide-react';
import { useSpacetimeDB } from '@/lib/spacetimedb';
import { GameCard } from '@/components/game/GameCard';

interface CardInfo {
  id: number;
  name: string;
  description: string;
  attack: number;
  defense: number;
  range: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  card_type: 'Unit' | 'Spell' | 'Artifact';
  image_url: string;
}

interface Pack {
  id: number;
  packType: string;
  isOpened: boolean;
  cards: number[];
}

interface PackOpeningProps {
  pack?: Pack;
  onPackComplete?: () => void;
}

export function PackOpening({ pack, onPackComplete }: PackOpeningProps) {
  const [openedCards, setOpenedCards] = useState<CardInfo[]>([]);
  const [opening, setOpening] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const { conn, connected, playerId } = useSpacetimeDB();

  const handleOpenPack = useCallback(async () => {
    if (!conn || !playerId) return;
    setOpening(true);

    try {
      // Simulate API call to open pack
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would call a reducer here
      // For now, we'll fetch random cards from the DB to simulate opening
      const db = conn.db as Record<string, { iter(): Iterable<any> }>;
      const cardsTable = db.cards;
      
      const newCards: CardInfo[] = [];
      if (cardsTable) {
        let count = 0;
        for (const card of cardsTable.iter()) {
          newCards.push({
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
          count++;
          if (count >= 5) break; // 5 cards per pack
        }
      }

      setOpenedCards(newCards);
      setTimeout(() => setShowCards(true), 500);
      
    } catch (err) {
      console.error('Failed to open pack:', err);
    } finally {
      setOpening(false);
    }
  }, [conn, playerId]);

  if (!connected) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <p className="text-yellow-400">Connecting to server to access packs...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 relative">
        <div className="glow-orb glow-orb-purple w-96 h-96 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        
        <h1 
          className="text-5xl font-bold text-white mb-4 relative"
          style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}
        >
          Open Packs
        </h1>
        <p className="text-lg text-white/60 relative">
          Discover new AI-generated cards to add to your collection
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
        {!showCards ? (
          <div className="text-center space-y-8 relative z-10">
            <div className={`relative transition-all duration-1000 ${opening ? 'scale-110 drop-shadow-[0_0_50px_rgba(139,92,246,0.8)]' : 'hover:scale-105'}`}>
              <div className={`w-48 h-64 mx-auto bg-gradient-to-br from-purple-600 to-indigo-800 rounded-xl border-4 border-white/20 shadow-2xl flex items-center justify-center cursor-pointer ${opening ? 'animate-pulse' : ''}`}
                   onClick={!opening ? handleOpenPack : undefined}>
                <Gift size={56} className="text-white drop-shadow-lg" strokeWidth={1.2} />
              </div>
            </div>
            
            <button
              onClick={handleOpenPack}
              disabled={opening}
              className="btn btn-primary py-4 px-12 text-xl shadow-xl shadow-purple-500/20"
            >
              {opening ? (
                <>
                  <div className="spinner spinner-sm mr-3" />
                  Opening...
                </>
              ) : (
                'Open Standard Pack'
              )}
            </button>
            <p className="text-white/40 text-sm">Contains 5 random cards</p>
          </div>
        ) : (
          <div className="w-full animate-in fade-in zoom-in duration-700 relative z-10">
            <h2 className="text-3xl font-bold text-center text-white mb-10" style={{ fontFamily: 'Cinzel, serif' }}>
              You found new cards!
            </h2>
            
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {openedCards.map((card, index) => (
                <div 
                  key={`${card.id}-${index}`} 
                  className="animate-in slide-in-from-bottom-10 fade-in fill-mode-both"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
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
            
            <div className="text-center">
              <button
                onClick={() => {
                  setShowCards(false);
                  setOpenedCards([]);
                  if (onPackComplete) onPackComplete();
                }}
                className="btn btn-ghost py-3 px-8 text-lg"
              >
                Open Another Pack
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
