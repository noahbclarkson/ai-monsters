'use client';

import { useSpacetimeDB } from '@/lib/spacetimedb';
import { useDailyCards } from '@/lib/useDailyCards';
import { GameCard } from './game/GameCard';

const RARITY_COLORS: Record<string, { border: string; glow: string; badge: string; gradient: string }> = {
  Common: {
    border: 'rgba(107,114,128,0.6)',
    glow: 'rgba(107,114,128,0.25)',
    badge: 'rgba(107,114,128,0.2)',
    gradient: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
  },
  Rare: {
    border: 'rgba(59,130,246,0.8)',
    glow: 'rgba(59,130,246,0.4)',
    badge: 'rgba(59,130,246,0.2)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  Epic: {
    border: 'rgba(168,85,247,0.9)',
    glow: 'rgba(168,85,247,0.5)',
    badge: 'rgba(168,85,247,0.2)',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
  },
  Legendary: {
    border: 'rgba(245,158,11,1)',
    glow: 'rgba(245,158,11,0.65)',
    badge: 'rgba(245,158,11,0.2)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
};

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  Unit: { icon: 'S', color: '#ef4444' },
  Building: { icon: 'B', color: '#6366f1' },
  Spell: { icon: 'X', color: '#22d3ee' },
};

export default function DailyCardGenerator() {
  const { connected, error: dbError } = useSpacetimeDB();
  const {
    dailyCards,
    hasClaimed,
    isGenerating,
    isEnhancing,
    loading,
    error: hookError,
    claimDailyCard,
  } = useDailyCards();

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const error = hookError ?? dbError;

  const rarityConfig = dailyCards.length > 0
    ? RARITY_COLORS[dailyCards[0].rarity] || RARITY_COLORS.Common
    : null;
  const typeConfig = dailyCards.length > 0
    ? TYPE_CONFIG[dailyCards[0].cardType] || TYPE_CONFIG.Unit
    : null;

  if (!connected && !loading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
          Not Connected
        </h3>
        <p className="text-sm text-white/50">Connect to SpacetimeDB to claim your daily card.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          {/* Calendar icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
            Daily Card
          </h2>
        </div>
        <p className="text-sm text-white/50">{dateStr}</p>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Already claimed */}
      {hasClaimed && dailyCards.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <p className="text-green-400 font-semibold text-sm">Card Claimed Today</p>
            <p className="text-white/50 text-xs">Come back tomorrow for a new card.</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <div className="spinner spinner-lg mx-auto mb-4" />
          <p className="text-white/50 text-sm">Loading daily card...</p>
        </div>
      ) : dailyCards.length > 0 ? (
        <div className="space-y-5">
          {/* Daily reward header */}
          <div className="text-center">
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
              style={{ background: rarityConfig?.badge, color: rarityConfig?.border }}
            >
              {dailyCards[0].rarity} — Daily Reward
            </div>
          </div>

          {/* Cards */}
          <div className="flex justify-center gap-4 flex-wrap">
            {dailyCards.map((card) => (
              <div key={String(card.id)} className="w-44">
                <GameCard
                  name={card.name}
                  description={card.description}
                  attack={card.attack}
                  defense={card.defense}
                  range={card.range}
                  rarity={card.rarity}
                  type={card.cardType}
                  imageUrl={card.imageUrl}
                  size="md"
                />
              </div>
            ))}
          </div>

          {/* Enhancing indicator */}
          {isEnhancing && (
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="spinner spinner-sm" style={{ borderColor: 'rgba(168,85,247,0.3)', borderTopColor: '#a855f7' }} />
              <div>
                <p className="text-purple-400 font-semibold text-sm">AI Crafting</p>
                <p className="text-white/40 text-xs">Generating artwork and descriptions...</p>
              </div>
            </div>
          )}

          {/* Card details */}
          <div className="glass-card rounded-xl p-4">
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Card Details</h4>
            <div className="space-y-2">
              {dailyCards.map((card) => (
                <div key={String(card.id)} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                      style={{ background: rarityConfig?.gradient }}
                    >
                      {typeConfig?.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{card.name}</p>
                      <p className="text-white/40 text-xs">{card.cardType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-red-400">ATK {card.attack}</span>
                    <span className="text-blue-400">DEF {card.defense}</span>
                    <span className="text-green-400">RNG {card.range}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {dailyCards[0].description && (
            <div className="glass-card rounded-xl p-4">
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Lore</h4>
              <p className="text-white/70 text-sm leading-relaxed">{dailyCards[0].description}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          {/* Empty state */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            Claim Your Daily Card
          </h3>
          <p className="text-white/50 text-sm mb-6 max-w-xs mx-auto">
            One unique AI-generated card awaits you. Every day brings a new creature to add to your collection.
          </p>
          <button
            onClick={claimDailyCard}
            disabled={isGenerating || hasClaimed || !connected}
            className="btn btn-primary py-3 px-8"
          >
            {isGenerating ? (
              <>
                <div className="spinner spinner-sm" />
                Generating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Claim Daily Card
              </>
            )}
          </button>
        </div>
      )}

      {/* How it works */}
      <div className="mt-6 pt-6 border-t border-white/5">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">How it works</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '24/7', label: 'New card daily' },
            { icon: '5', label: 'Variants per day' },
            { icon: 'AI', label: 'Unique artwork' },
            { icon: '∞', label: 'Collection grows' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-white/3">
              <span className="text-xs font-bold text-purple-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.icon}</span>
              <span className="text-xs text-white/50">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
