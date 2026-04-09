'use client';

import { useState, useCallback } from 'react';
import { Gift } from 'lucide-react';
import { useSpacetimeDB } from '@/lib/spacetimedb';
import { GameCard } from '@/components/game/GameCard';
import { useCards } from '@/lib/useCards';

interface CardInfo {
  id: number;
  name: string;
  description: string;
  attack: number;
  defense: number;
  range: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  card_type: string;
  image_url: string;
}

// Rarity distribution for a standard pack: 2 Common, 2 Rare, 1 Epic
// Legendary has a small chance to upgrade one of the Rare slots
const PACK_RARITIES: Array<'Common' | 'Rare' | 'Epic' | 'Legendary'> = [
  'Common', 'Common', 'Rare', 'Rare', 'Epic',
];

const CARD_TYPES = ['Unit', 'Unit', 'Unit', 'Building', 'Spell'];

const NOUNS = [
  'Dragon', 'Phoenix', 'Golem', 'Spectre', 'Wraith',
  'Knight', 'Wizard', 'Archer', 'Beast', 'Spirit',
  'Frost', 'Flame', 'Shadow', 'Light', 'Storm',
];

export function PackOpening() {
  const [openedCards, setOpenedCards] = useState<CardInfo[]>([]);
  const [opening, setOpening] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [openingProgress, setOpeningProgress] = useState('');
  const { conn, connected, playerId } = useSpacetimeDB();
  const { generateCard } = useCards();

  const handleOpenPack = useCallback(async () => {
    if (!conn || !playerId) return;
    setOpening(true);
    setOpeningProgress('Summoning cards from the void...');

    try {
      // Generate 5 cards with realistic rarity distribution
      const generatedCards: CardInfo[] = [];

      for (let i = 0; i < 5; i++) {
        const rarity = PACK_RARITIES[i];
        const cardType = CARD_TYPES[i] as 'Unit' | 'Building' | 'Spell';
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)] + (i > 0 ? ` ${['Alpha', 'Prime', 'Void', 'Storm', 'Doom'][i - 1] || ''}` : '').trim() || NOUNS[Math.floor(Math.random() * NOUNS.length)];
        const uniqueName = `${noun}${rarity === 'Legendary' ? ' of the Eternal' : rarity === 'Epic' ? ' of Power' : ''}`;

        setOpeningProgress(`Generating ${uniqueName}...`);

        // Call AI description endpoint
        let aiDescription = '';
        try {
          const descRes = await fetch('/api/generate-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: '', noun: uniqueName, rarity, cardType }),
          });
          if (descRes.ok) {
            const descData = await descRes.json();
            aiDescription = descData.description || '';
          }
        } catch {
          aiDescription = '';
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
            aiImageUrl = imgData.image_url || '';
          }
        } catch {
          aiImageUrl = '';
        }

        // Save to SpacetimeDB
        await generateCard(uniqueName, rarity, cardType, aiDescription, aiImageUrl);

        // Read back the card we just created (last card in table)
        const db = conn.db as Record<string, { iter(): Iterable<any> }>;
        const cardsTable = db.cards;
        let lastCard: CardInfo | null = null;
        if (cardsTable) {
          for (const card of cardsTable.iter()) {
            lastCard = {
              id: Number(card.id),
              name: card.name,
              description: card.description,
              attack: card.attack,
              defense: card.defense,
              range: card.range,
              rarity: card.rarity as CardInfo['rarity'],
              card_type: card.cardType || card.card_type || 'Unit',
              image_url: card.imageUrl || card.image_url || '',
            };
          }
        }

        if (lastCard) {
          generatedCards.push(lastCard);
        }
      }

      setOpenedCards(generatedCards);
      setTimeout(() => setShowCards(true), 300);

    } catch (err) {
      console.error('Failed to open pack:', err);
    } finally {
      setOpening(false);
      setOpeningProgress('');
    }
  }, [conn, playerId, generateCard]);

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
              <div 
                className={`w-48 h-64 mx-auto bg-gradient-to-br from-purple-600 to-indigo-800 rounded-xl border-4 border-white/20 shadow-2xl flex items-center justify-center cursor-pointer transition-all ${opening ? 'animate-pulse' : ''}`}
                onClick={!opening ? handleOpenPack : undefined}
              >
                <Gift size={56} className="text-white drop-shadow-lg" strokeWidth={1.2} />
              </div>
            </div>

            {/* Opening progress */}
            {opening && openingProgress && (
              <div className="mt-4">
                <p className="text-purple-300 text-sm animate-pulse">{openingProgress}</p>
              </div>
            )}
            
            <button
              onClick={handleOpenPack}
              disabled={opening}
              className="btn btn-primary py-4 px-12 text-xl shadow-xl shadow-purple-500/20"
            >
              {opening ? (
                <>
                  <div className="spinner spinner-sm mr-3" />
                  Opening Pack...
                </>
              ) : (
                'Open Standard Pack'
              )}
            </button>
            <p className="text-white/40 text-sm">Contains 5 AI-generated cards (2 Common, 2 Rare, 1 Epic)</p>
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

export default PackOpening;
