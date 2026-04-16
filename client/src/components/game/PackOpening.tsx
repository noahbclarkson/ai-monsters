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
  const [packHovered, setPackHovered] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const { conn, connected, playerId } = useSpacetimeDB();
  const { generateCard } = useCards();

  const handleOpenPack = useCallback(async () => {
    if (!conn || !playerId) return;
    setOpening(true);
    setOpeningProgress('Summoning cards from the void...');

    try {
      // Generate 5 cards with realistic rarity distribution
      const generatedCards: CardInfo[] = [];

      // Shuffle suffixes once per pack so every pack produces different name patterns
      const baseSuffixes = ['Prime', 'Alpha', 'Void', 'Storm', 'Doom'];
      const shuffledSuffixes = [...baseSuffixes].sort(() => Math.random() - 0.5);

      for (let i = 0; i < 5; i++) {
        const rarity = PACK_RARITIES[i];
        const cardType = CARD_TYPES[i] as 'Unit' | 'Building' | 'Spell';
        const suffix = shuffledSuffixes[i];
        const baseName = NOUNS[Math.floor(Math.random() * NOUNS.length)];
        // Occasionally give a rare/epic card an extra epithet for variety
        const epithet = rarity === 'Legendary'
          ? [' of the Eternal', ' the Undying', ', Doom Bringer'][Math.floor(Math.random() * 3)]
          : rarity === 'Epic'
          ? [' of Power', ' the Fierce', ', Warbringer'][Math.floor(Math.random() * 3)]
          : '';
        const uniqueName = `${baseName} ${suffix}${epithet}`;

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

        // Save to SpacetimeDB with AI content directly — no separate update_card_media call needed
        await generateCard(uniqueName, rarity, cardType, aiDescription, aiImageUrl);

        // Read back the card we just created (card with highest id = most recent)
        const db = conn.db as Record<string, { iter(): Iterable<{ id: bigint; [key: string]: any }> }>;
        const cardsTable = db.cards;
        let lastCard: CardInfo | null = null;
        let maxId = BigInt(0);
        if (cardsTable) {
          for (const card of cardsTable.iter()) {
            if (card.id > maxId) {
              maxId = card.id;
              lastCard = {
                id: Number(card.id),
                name: card.name,
                // description and image_url are now saved directly by generateCard
                description: aiDescription || '',
                attack: card.attack,
                defense: card.defense,
                range: card.range,
                rarity: card.rarity as CardInfo['rarity'],
                card_type: card.cardType || card.card_type || 'Unit',
                image_url: aiImageUrl || '',
              };
            }
          }
        }

        if (lastCard) {
          generatedCards.push(lastCard);
        }
      }

      setOpenedCards(generatedCards);
      setShowCards(true);
      setRevealedCount(0);
      // Stagger card reveals — flip each one front-to-back with 180ms between cards
      for (let i = 0; i < generatedCards.length; i++) {
        setTimeout(() => {
          setRevealedCount(i + 1);
        }, 300 + i * 180);
      }

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
            {/* Pack container with glow and float */}
            <div className="relative inline-block">
              {/* Outer glow ring */}
              <div 
                className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none ${
                  packHovered || opening 
                    ? 'opacity-60 scale-105' 
                    : 'opacity-0'
                }`}
                style={{ 
                  background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.5) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                  transform: 'scale(1.2)',
                }}
              />

              {/* Floating pack */}
              <div 
                className={`relative transition-all duration-300 ${
                  opening 
                    ? 'scale-110 drop-shadow-[0_0_50px_rgba(139,92,246,0.8)]' 
                    : packHovered 
                    ? 'scale-110 -translate-y-2 drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]' 
                    : 'hover:scale-105 animate-float'
                }`}
                onClick={!opening ? handleOpenPack : undefined}
                onMouseEnter={() => setPackHovered(true)}
                onMouseLeave={() => setPackHovered(false)}
              >
          {/* Pack box */}
                <div 
                  className={`w-48 h-64 mx-auto rounded-xl border-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden relative ${
                    opening ? 'animate-pulse' : ''
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #1a1a3e 0%, #2d1b5e 30%, #1a1a3e 50%, #2d1b5e 70%, #1a1a3e 100%)',
                    borderColor: 'rgba(139,92,246,0.6)',
                    boxShadow: packHovered || opening
                      ? '0 0 0 2px rgba(139,92,246,0.4), 0 0 40px rgba(139,92,246,0.5), inset 0 0 30px rgba(139,92,246,0.1)'
                      : '0 0 0 1px rgba(139,92,246,0.3), inset 0 0 20px rgba(139,92,246,0.05)',
                    transform: packHovered && !opening ? 'scale(1.02)' : undefined,
                  }}
                >
                  {/* Holographic shimmer overlay */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl opacity-0" data-shimmer="true">
                    <div 
                      className={`absolute inset-0 transition-all duration-700 ${
                        packHovered && !opening ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        background: 'linear-gradient(105deg, transparent 20%, rgba(139,92,246,0.15) 35%, rgba(168,85,247,0.2) 45%, rgba(59,130,246,0.15) 55%, transparent 70%)',
                        backgroundSize: '200% 200%',
                        animation: packHovered ? 'holoShimmer 2s ease infinite' : 'none',
                      }}
                    />
                  </div>
                  {/* Inner glow border */}
                  <div 
                    className="absolute inset-1 rounded-lg pointer-events-none"
                    style={{ border: '1px solid rgba(139,92,246,0.25)' }}
                  />
                  {/* Decorative corner brackets */}
                  <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 rounded-tl" style={{ borderColor: 'rgba(139,92,246,0.5)' }} />
                  <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 rounded-tr" style={{ borderColor: 'rgba(139,92,246,0.5)' }} />
                  <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 rounded-bl" style={{ borderColor: 'rgba(139,92,246,0.5)' }} />
                  <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 rounded-br" style={{ borderColor: 'rgba(139,92,246,0.5)' }} />
                  {/* Gift icon with glow */}
                  <div 
                    className="relative z-10 p-4 rounded-xl"
                    style={{ background: 'rgba(139,92,246,0.1)', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
                  >
                    <Gift size={48} className="text-purple-300 drop-shadow-lg" strokeWidth={1.2} />
                  </div>
                  {/* Pack label */}
                  <div className="relative z-10 mt-3 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-300/60">Standard</p>
                    <p className="text-sm font-semibold text-purple-200/80">5 Cards</p>
                  </div>
                </div>

                {/* Sparkle particles on hover */}
                {packHovered && !opening && (
                  <>
                    <div className="absolute -top-2 -left-2 w-3 h-3 rounded-full bg-purple-400 animate-ping opacity-60" />
                    <div className="absolute -top-1 right-4 w-2 h-2 rounded-full bg-yellow-400 animate-ping opacity-80" style={{ animationDelay: '200ms' }} />
                    <div className="absolute bottom-4 -right-3 w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping opacity-70" style={{ animationDelay: '400ms' }} />
                    <div className="absolute top-6 -left-4 w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping opacity-60" style={{ animationDelay: '600ms' }} />
                  </>
                )}
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
              className="btn btn-primary py-4 px-12 text-xl shadow-xl shadow-purple-500/20 flex items-center justify-center mx-auto"
            >
              {opening ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />
                  <span>Opening Pack...</span>
                </>
              ) : (
                <>
                  <Gift size={18} strokeWidth={1.8} />
                  Open Standard Pack
                </>
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
              {openedCards.map((card, index) => {
                const isRevealed = index < revealedCount;
                return (
                  <div 
                    key={`${card.id}-${index}`} 
                    className="transition-all duration-500"
                    style={{ 
                      opacity: isRevealed ? 1 : 0,
                      transform: isRevealed ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.9)',
                      transitionDelay: `${index * 30}ms`,
                    }}
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
                      isFlipped={!isRevealed}
                      showBack={true}
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => {
                  setShowCards(false);
                  setOpenedCards([]);
                  setRevealedCount(0);
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
