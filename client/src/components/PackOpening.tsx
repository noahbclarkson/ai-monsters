'use client';

import { useState, useEffect, useCallback } from 'react';
import { EnhancedCard } from './EnhancedCard';
import { CardGenerator } from '@/lib/card-generator';

interface Pack {
  cards: any[];
  generated_at: number;
}

interface PackOpeningProps {
  pack?: Pack;
  onPackComplete?: () => void;
}

interface CardRevealState {
  index: number;
  isRevealed: boolean;
  isAnimating: boolean;
}

const QUALITY_CONFIG: Record<string, { label: string; border: string; glow: string; badgeBg: string; badgeText: string; glowClass: string }> = {
  Standard: {
    label: 'Standard',
    border: 'rgba(107,114,128,0.5)',
    glow: 'rgba(107,114,128,0.2)',
    badgeBg: 'rgba(107,114,128,0.15)',
    badgeText: '#6b7280',
    glowClass: 'glow-standard',
  },
  Rare: {
    label: 'Rare',
    border: 'rgba(59,130,246,0.7)',
    glow: 'rgba(59,130,246,0.3)',
    badgeBg: 'rgba(59,130,246,0.15)',
    badgeText: '#3b82f6',
    glowClass: 'glow-rare',
  },
  Epic: {
    label: 'Epic',
    border: 'rgba(168,85,247,0.8)',
    glow: 'rgba(168,85,247,0.4)',
    badgeBg: 'rgba(168,85,247,0.15)',
    badgeText: '#a855f7',
    glowClass: 'glow-epic',
  },
  Mythic: {
    label: 'Mythic',
    border: 'rgba(245,158,11,0.9)',
    glow: 'rgba(245,158,11,0.5)',
    badgeBg: 'rgba(245,158,11,0.15)',
    badgeText: '#f59e0b',
    glowClass: 'glow-mythic',
  },
};

export function PackOpening({ pack, onPackComplete }: PackOpeningProps) {
  const [cards, setCards] = useState<any[]>([]);
  const [revealStates, setRevealStates] = useState<CardRevealState[]>(
    Array(7).fill(null).map((_, i) => ({ index: i, isRevealed: false, isAnimating: false }))
  );
  const [currentRevealing, setCurrentRevealing] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [packQuality, setPackQuality] = useState<string>('Standard');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (pack) {
      setCards(pack.cards);
      determinePackQuality(pack.cards);
    } else {
      generateNewPack();
    }
  }, [pack]);

  const determinePackQuality = (packCards: any[]) => {
    const legendaryCount = packCards.filter(card => card.rarity === 'Legendary').length;
    const epicCount = packCards.filter(card => card.rarity === 'Epic').length;

    let quality = 'Standard';
    if (legendaryCount >= 2 || epicCount >= 4) {
      quality = 'Mythic';
    } else if (legendaryCount >= 1 || epicCount >= 2) {
      quality = 'Epic';
    } else if (epicCount >= 1 || packCards.filter(card => card.rarity === 'Rare').length >= 3) {
      quality = 'Rare';
    }

    setPackQuality(quality);

    // Spawn particles for high-quality packs
    if (quality === 'Mythic' || quality === 'Epic') {
      spawnParticles(quality);
    }
  };

  const spawnParticles = (quality: string) => {
    const colors = quality === 'Mythic'
      ? ['#f59e0b', '#ef4444', '#a855f7', '#fbbf24', '#f97316']
      : ['#a855f7', '#8b5cf6', '#c084fc', '#9333ea', '#7c3aed'];
    const newParticles = [];
    for (let i = 0; i < 24; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(newParticles);
  };

  const generateNewPack = useCallback(async () => {
    setIsGenerating(true);
    try {
      const newPack = await CardGenerator.generatePack();
      setCards(newPack.cards);
      determinePackQuality(newPack.cards);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const revealNextCard = useCallback(() => {
    if (currentRevealing >= 7) {
      setIsComplete(true);
      if (onPackComplete) onPackComplete();
      return;
    }

    setRevealStates(prev =>
      prev.map((state, i) =>
        i === currentRevealing
          ? { ...state, isAnimating: true }
          : state
      )
    );

    setTimeout(() => {
      setRevealStates(prev =>
        prev.map((state, i) =>
          i === currentRevealing
            ? { ...state, isRevealed: true, isAnimating: false }
            : state
        )
      );
      setCurrentRevealing(prev => prev + 1);
    }, 600);
  }, [currentRevealing, onPackComplete]);

  const revealAll = useCallback(() => {
    // Rapid-fire reveal each card with staggered timing
    let delay = 0;
    for (let i = currentRevealing; i < 7; i++) {
      setTimeout(() => {
        setRevealStates(prev =>
          prev.map((state, j) =>
            j === i
              ? { ...state, isAnimating: true }
              : state
          )
        );
        setTimeout(() => {
          setRevealStates(prev =>
            prev.map((state, j) =>
              j === i
                ? { ...state, isRevealed: true, isAnimating: false }
                : state
            )
          );
        }, 500);
      }, delay);
      delay += 200;
    }
    setTimeout(() => {
      setCurrentRevealing(7);
      setIsComplete(true);
      if (onPackComplete) onPackComplete();
    }, delay + 600);
  }, [currentRevealing, onPackComplete]);

  const resetPack = () => {
    setRevealStates(Array(7).fill(null).map((_, i) => ({ index: i, isRevealed: false, isAnimating: false })));
    setCurrentRevealing(0);
    setIsComplete(false);
    setParticles([]);
  };

  const handleOpenAnother = async () => {
    resetPack();
    await generateNewPack();
  };

  const quality = QUALITY_CONFIG[packQuality] || QUALITY_CONFIG.Standard;
  const revealedCount = revealStates.filter(s => s.isRevealed).length;
  const legendaryCount = cards.filter(c => c.rarity === 'Legendary').length;
  const epicCount = cards.filter(c => c.rarity === 'Epic').length;
  const rareCount = cards.filter(c => c.rarity === 'Rare').length;

  return (
    <main className="min-h-screen bg-atmospheric py-8 px-4">
      {/* Ambient glows */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${quality.glow} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="fixed w-1 h-1 rounded-full pointer-events-none animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animationDuration: `${3 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-4"
            style={{
              background: quality.badgeBg,
              border: `1px solid ${quality.border}`,
              boxShadow: `0 0 20px ${quality.glow}`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: quality.badgeText, boxShadow: `0 0 8px ${quality.badgeText}` }}
            />
            <span
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: quality.badgeText, fontFamily: 'Cinzel, serif' }}
            >
              {quality.label} Pack
            </span>
          </div>
          <p className="text-white/50 text-sm">
            {isComplete
              ? `${cards.length} cards revealed`
              : revealedCount === 0
                ? 'Reveal your AI-generated cards'
                : `Card ${revealedCount + 1} of ${cards.length}`}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-7 gap-3 mb-8">
          {cards.map((card, index) => {
            const state = revealStates[index];
            const isRevealed = state?.isRevealed ?? false;
            const isAnimating = state?.isAnimating ?? false;
            const isUpcoming = !isRevealed && !isAnimating && index > currentRevealing;

            return (
              <div
                key={card.id ?? index}
                className="relative"
                style={{ height: '160px' }}
              >
                {/* Unrevealed card back */}
                {!isRevealed && (
                  <div
                    className={`
                      w-full h-full rounded-xl flex flex-col items-center justify-center
                      cursor-pointer transition-all duration-200
                      hover:scale-105 active:scale-95
                      ${isAnimating ? 'scale-110' : ''}
                    `}
                    style={{
                      background: 'linear-gradient(135deg, #1a1a30 0%, #12121f 100%)',
                      border: `1px solid ${quality.border}`,
                      boxShadow: `0 0 16px ${quality.glow}, 0 4px 16px rgba(0,0,0,0.5)`,
                    }}
                    onClick={!isComplete ? revealNextCard : undefined}
                  >
                    {/* Geometric card back pattern */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl opacity-20">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id={`pack-grid-${index}`} width="16" height="16" patternUnits="userSpaceOnUse">
                            <path d="M 16 0 L 0 0 0 16" fill="none" stroke={quality.badgeText} strokeWidth="0.5" opacity="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#pack-grid-${index})`} />
                      </svg>
                    </div>

                    {/* Corner ornament */}
                    <div
                      className="absolute top-2 left-2 w-4 h-4"
                      style={{ borderTop: `2px solid ${quality.border}`, borderLeft: `2px solid ${quality.border}` }}
                    />
                    <div
                      className="absolute bottom-2 right-2 w-4 h-4"
                      style={{ borderBottom: `2px solid ${quality.border}`, borderRight: `2px solid ${quality.border}` }}
                    />

                    {/* Card number */}
                    <div className="relative z-10 text-center">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{
                          fontFamily: 'Cinzel, serif',
                          color: quality.border,
                          opacity: 0.7,
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="text-xs uppercase tracking-widest" style={{ color: quality.border, opacity: 0.5 }}>
                        Tap to reveal
                      </div>
                    </div>
                  </div>
                )}

                {/* Revealed card */}
                {isRevealed && (
                  <div
                    className={`
                      w-full h-full rounded-xl overflow-hidden
                      transition-all duration-500
                      ${isAnimating ? 'scale-105 rotate-1' : 'scale-100'}
                    `}
                    style={{
                      boxShadow: card.rarity === 'Legendary'
                        ? '0 0 24px rgba(245,158,11,0.5), 0 4px 16px rgba(0,0,0,0.5)'
                        : card.rarity === 'Epic'
                          ? '0 0 20px rgba(168,85,247,0.4), 0 4px 16px rgba(0,0,0,0.5)'
                          : card.rarity === 'Rare'
                            ? '0 0 16px rgba(59,130,246,0.3), 0 4px 16px rgba(0,0,0,0.5)'
                            : '0 4px 16px rgba(0,0,0,0.5)',
                    }}
                  >
                    <EnhancedCard
                      name={card.name}
                      description={card.description}
                      attack={card.attack}
                      defense={card.defense}
                      range={card.range}
                      rarity={card.rarity}
                      type={card.type}
                      imageUrl={card.image_url}
                      isSelected={false}
                    />
                  </div>
                )}

                {/* Animating glow */}
                {isAnimating && (
                  <div
                    className="absolute inset-0 rounded-xl animate-pulse pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${quality.badgeText}33, transparent)`,
                      boxShadow: `0 0 30px ${quality.glow}`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="glass-card rounded-2xl p-6">
          {!isComplete ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={revealNextCard}
                disabled={currentRevealing >= 7 || isGenerating}
                className="btn btn-success py-3.5 px-8 text-base flex-1 sm:flex-none"
              >
                {isGenerating ? (
                  <>
                    <div className="spinner spinner-sm" />
                    Generating...
                  </>
                ) : currentRevealing >= 7 ? (
                  'All Revealed'
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    Reveal Card {currentRevealing + 1}
                  </>
                )}
              </button>

              {revealedCount < 7 && (
                <button
                  onClick={revealAll}
                  disabled={isGenerating || currentRevealing >= 7}
                  className="btn btn-primary py-3.5 px-8 text-base flex-1 sm:flex-none"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Reveal All at Once
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Completion message */}
              <div className="text-center">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2"
                  style={{ background: quality.badgeBg, border: `1px solid ${quality.border}` }}
                >
                  <span style={{ color: quality.badgeText, fontFamily: 'Cinzel, serif', fontWeight: 700 }}>
                    {packQuality} Pack Complete
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total', value: cards.length, color: '#8888a8' },
                  { label: 'Legendary', value: legendaryCount, color: '#f59e0b' },
                  { label: 'Epic', value: epicCount, color: '#a855f7' },
                  { label: 'Rare', value: rareCount, color: '#3b82f6' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-3 text-center"
                    style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}40` }}
                  >
                    <div
                      className="text-2xl font-bold"
                      style={{ color: stat.color, fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="flex justify-center">
                <button
                  onClick={handleOpenAnother}
                  disabled={isGenerating}
                  className="btn btn-primary py-3.5 px-10 text-base"
                >
                  {isGenerating ? (
                    <>
                      <div className="spinner spinner-sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Open Another Pack
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
