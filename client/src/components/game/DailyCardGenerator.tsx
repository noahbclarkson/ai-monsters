'use client';

import { useSpacetimeDB } from '@/lib/spacetimedb';
import { useCards } from '@/lib/useCards';
import { GameCard } from '@/components/game/GameCard';
import { useState } from 'react';
import { AICardGenerator } from '@/lib/ai-card-generator';
import { Sparkles, Gift, Clock, Star, Zap } from 'lucide-react';

const RARITY_TIERS = [
  { label: 'Common', color: '#6b7280', glow: 'rgba(107,114,128,0.3)' },
  { label: 'Rare', color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
  { label: 'Epic', color: '#a855f7', glow: 'rgba(168,85,247,0.5)' },
  { label: 'Legendary', color: '#f59e0b', glow: 'rgba(245,158,11,0.6)' },
];

export default function DailyCardGenerator() {
  const { conn, connected, playerId } = useSpacetimeDB();
  const { generateCard } = useCards();
  const [generating, setGenerating] = useState(false);
  const [dailyCard, setDailyCard] = useState<any>(null);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!conn) return;

    if (!playerId) {
      setError('Not connected to server. Please wait and try again.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const noun = AICardGenerator.generateRandomNoun();
      const rarity = AICardGenerator.determineRarity();
      const cardType = AICardGenerator.getRandomCardType();

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

      await generateCard(noun, rarity, cardType, '', '');

      await new Promise(resolve => setTimeout(resolve, 1200));

      const db = conn.db as Record<string, { iter(): Iterable<{ id: bigint; [key: string]: any }> }>;
      const cardsTable = db.cards;
      let lastCard: any = null;
      let maxId = BigInt(0);

      if (cardsTable) {
        for (const card of cardsTable.iter()) {
          if (card.id > maxId) {
            maxId = card.id;
            lastCard = {
              id: Number(card.id || card.cardId),
              name: card.name,
              description: card.description,
              attack: card.attack,
              defense: card.defense,
              range: card.range,
              rarity: card.rarity,
              card_type: card.cardType || card.card_type,
              image_url: card.imageUrl || card.image_url,
            };
          }
        }
      }

      // Update the card with actual AI content (description + image)
      if (lastCard && (aiDescription || aiImageUrl)) {
        (conn.reducers as any).update_card_media({
          cardId: Number(lastCard.id),
          description: aiDescription,
          imageUrl: aiImageUrl,
        });
        if (aiDescription) lastCard.description = aiDescription;
        if (aiImageUrl) lastCard.image_url = aiImageUrl;
      }

      setDailyCard(lastCard);
      setRevealed(false);
      setTimeout(() => setRevealed(true), 100);
    } catch (err) {
      console.error('Failed to generate daily card:', err);
      setError('Failed to generate daily card. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!connected) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-yellow-400 text-sm">Connecting to server...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero section */}
      <div className="text-center mb-10 relative">
        {/* Ambient glows */}
        <div className="glow-orb glow-orb-purple w-80 h-80 -top-10 left-1/2 -translate-x-1/2 opacity-30 absolute pointer-events-none" />
        <div className="glow-orb glow-orb-amber w-48 h-48 top-5 -right-10 opacity-20 absolute pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Gift size={12} className="text-amber-400" strokeWidth={2} />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Free Daily Reward</span>
          </div>

          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}
          >
            Daily Free Card
          </h2>
          <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">
            Log in every day and claim a unique AI-generated card. Each day brings a new monster!
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Card showcase area */}
      <div className="relative flex flex-col items-center">

        {/* Showcase frame */}
        {!dailyCard ? (
          /* Pre-claim: empty showcase with pulsing glow */
          <div className="relative mb-8">
            {/* Glow pulse */}
            <div className="absolute inset-0 rounded-2xl animate-pulse opacity-30 blur-xl"
              style={{ background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.5) 0%, transparent 70%)' }}
            />

            {/* Empty card slot */}
            <div className="relative w-52 h-72 rounded-2xl border-2 border-dashed border-white/10 bg-white/3 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Sparkles size={28} className="text-white/20" strokeWidth={1.5} />
              </div>
              <p className="text-white/30 text-sm font-medium">Card hidden</p>
            </div>

            {/* Corner decorations */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-purple-500/40 rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-purple-500/40 rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-purple-500/40 rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-purple-500/40 rounded-br-lg" />
          </div>
        ) : revealed ? (
          /* Revealed: actual card */
          <div className="mb-8 animate-in fade-in zoom-in duration-500"
            style={{ animationFillMode: 'both' }}>
            <div className="relative">
              {/* Card glow */}
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-40"
                style={{
                  background: dailyCard.rarity === 'Legendary'
                    ? 'radial-gradient(ellipse, rgba(245,158,11,0.6) 0%, transparent 70%)'
                    : dailyCard.rarity === 'Epic'
                    ? 'radial-gradient(ellipse, rgba(168,85,247,0.6) 0%, transparent 70%)'
                    : dailyCard.rarity === 'Rare'
                    ? 'radial-gradient(ellipse, rgba(59,130,246,0.5) 0%, transparent 70%)'
                    : 'radial-gradient(ellipse, rgba(107,114,128,0.4) 0%, transparent 70%)'
                }}
              />
              <GameCard
                name={dailyCard.name}
                description={dailyCard.description}
                attack={dailyCard.attack}
                defense={dailyCard.defense}
                range={dailyCard.range}
                rarity={dailyCard.rarity}
                type={dailyCard.card_type}
                imageUrl={dailyCard.image_url}
                size="md"
              />
            </div>
          </div>
        ) : (
          /* Generating: shimmer slot */
          <div className="mb-8 w-52 h-72 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <div className="spinner spinner-md" />
          </div>
        )}

        {/* Rarity tiers indicator */}
        {!dailyCard && (
          <div className="mb-8 w-full max-w-xs">
            <div className="flex items-center justify-between mb-2">
              {RARITY_TIERS.map((tier, i) => (
                <div key={tier.label} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: `${tier.glow}`,
                      border: `1.5px solid ${tier.color}60`,
                      color: tier.color,
                    }}
                  >
                    <Star size={12} strokeWidth={2} fill={tier.color} />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: tier.color }}>{tier.label}</span>
                </div>
              ))}
            </div>
            <div className="relative h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {/* Animated shimmer along the bar */}
              <div className="absolute inset-y-0 left-0 w-1/2 rounded-full animate-pulse"
                style={{ background: 'linear-gradient(90deg, rgba(168,85,247,0.8), rgba(245,158,11,0.8))' }}
              />
            </div>
            <p className="text-center text-white/25 text-xs mt-2">Each claim brings a random rarity</p>
          </div>
        )}

        {/* Claim button */}
        {!dailyCard && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="group relative mb-4"
          >
            {/* Glow layer behind button */}
            <div className="absolute -inset-1 rounded-2xl opacity-40 group-hover:opacity-70 blur-sm transition-opacity duration-500"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)' }}
            />

            <div className="relative btn btn-primary py-4 px-12 text-lg flex items-center gap-3">
              {generating ? (
                <>
                  <div className="spinner spinner-sm" />
                  <span>Generating your card...</span>
                </>
              ) : (
                <>
                  <Zap size={18} strokeWidth={2} className="text-amber-300" />
                  <span>Claim Today&apos;s Card</span>
                </>
              )}
            </div>
          </button>
        )}

        {/* Success state */}
        {dailyCard && revealed && (
          <div className="text-center animate-in fade-in duration-700 delay-200" style={{ animationFillMode: 'both' }}>
            <div className="flex items-center gap-2 justify-center mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-400 text-sm font-medium">Card added to your collection!</span>
            </div>
            <button
              onClick={() => { setDailyCard(null); setRevealed(false); }}
              className="btn btn-ghost text-sm"
            >
              Claim Another (uses AI quota)
            </button>
          </div>
        )}

        {/* Footer note */}
        {!dailyCard && (
          <p className="text-white/25 text-xs mt-2 flex items-center gap-1 justify-center">
            <Clock size={10} strokeWidth={2} />
            New card available every day
          </p>
        )}
      </div>
    </div>
  );
}
