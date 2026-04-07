'use client';

import { useState, useMemo } from 'react';

interface GameCardProps {
  id?: number;
  name: string;
  description: string;
  attack: number;
  defense: number;
  range: number;
  rarity: string;
  type: string;
  imageUrl?: string;
  isFlipped?: boolean;
  isSelected?: boolean;
  isAttacking?: boolean;
  isDefending?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showBack?: boolean;
}

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

const STAT_COLORS = {
  attack: { bg: 'rgba(248,113,113,0.15)', text: '#f87171', label: 'ATK' },
  defense: { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa', label: 'DEF' },
  range: { bg: 'rgba(74,222,128,0.15)', text: '#4ade80', label: 'RNG' },
};

export function GameCard({
  name,
  description,
  attack,
  defense,
  range,
  rarity,
  type,
  imageUrl,
  isFlipped = false,
  isSelected = false,
  isAttacking = false,
  isDefending = false,
  onClick,
  size = 'md',
  showBack = false,
}: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const rarityConfig = useMemo(() => RARITY_COLORS[rarity] || RARITY_COLORS.Common, [rarity]);
  const typeConfig = useMemo(() => TYPE_CONFIG[type] || TYPE_CONFIG.Unit, [type]);

  const sizeClasses = {
    sm: { card: 'h-48', art: 'h-20', text: 'text-xs', padding: 'p-2' },
    md: { card: 'h-80', art: 'h-36', text: 'text-sm', padding: 'p-3' },
    lg: { card: 'h-96', art: 'h-48', text: 'text-base', padding: 'p-4' },
  };

  const sc = sizeClasses[size];

  const cardStyle: React.CSSProperties = {
    '--rarity-border': rarityConfig.border,
    '--rarity-glow': rarityConfig.glow,
    '--rarity-gradient': rarityConfig.gradient,
  } as React.CSSProperties;

  // Use a reliable placeholder if imageUrl is missing or broken
  const displayImageUrl = imageUrl && !imageError && !imageUrl.startsWith('/placeholder/') 
    ? imageUrl 
    : `https://picsum.photos/seed/${name.replace(/\s+/g, '')}/832/1248`;

  return (
    <div
      className={`
        relative ${sc.card} rounded-xl overflow-hidden cursor-pointer
        transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
        ${isSelected ? 'scale-105 z-10 shadow-2xl' : 'hover:scale-[1.04] hover:-translate-y-2 hover:shadow-2xl'}
        ${isAttacking ? 'animate-pulse-ring' : ''}
        ${isDefending ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
      `}
      style={{
        boxShadow: `
          0 0 0 1.5px ${rarityConfig.border},
          0 0 20px ${rarityConfig.glow},
          0 8px 32px rgba(0,0,0,0.5)
        `,
        ...cardStyle,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Card Back */}
      {showBack && isFlipped && (
        <div className="absolute inset-0 bg-card-back flex flex-col items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="relative z-10 text-center">
            <div 
              className="w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center"
              style={{ background: rarityConfig.gradient }}
            >
              <span className="text-white font-bold text-lg">AM</span>
            </div>
            <p className="text-xs text-white/40 uppercase tracking-widest">AI Monsters</p>
          </div>
        </div>
      )}

      {/* Card Front */}
      {!isFlipped && (
        <div className="absolute inset-0 flex flex-col" style={{ background: 'var(--bg-card, #1a1a2e)' }}>
          <div 
            className={`${sc.padding} flex items-center justify-between`}
            style={{ background: rarityConfig.gradient }}
          >
            <h3 className={`${sc.text} font-bold text-white truncate drop-shadow-lg`} style={{ fontFamily: 'Cinzel, serif' }}>
              {name}
            </h3>
            <div 
              className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs ml-2"
              style={{ background: `${typeConfig.color}33`, color: typeConfig.color }}
              title={type}
            >
              {typeConfig.icon}
            </div>
          </div>

          <div className={`relative ${sc.art} overflow-hidden`}>
            <img
              src={displayImageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div 
              className="absolute inset-0 opacity-20"
              style={{ background: `linear-gradient(180deg, transparent 50%, ${rarityConfig.border} 100%)` }}
            />
            
            {isHovering && (rarity === 'Epic' || rarity === 'Legendary') && (
              <div 
                className="absolute inset-0 pointer-events-none animate-shimmer"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)`,
                  backgroundSize: '200% 100%',
                }}
              />
            )}
          </div>

          <div className={`${sc.padding} flex items-center justify-around gap-1`} style={{ background: 'rgba(0,0,0,0.3)' }}>
            {[
              { key: 'attack', value: attack },
              { key: 'defense', value: defense },
              { key: 'range', value: range },
            ].map(({ key, value }) => {
              const stat = STAT_COLORS[key as keyof typeof STAT_COLORS];
              return (
                <div
                  key={key}
                  className="flex-1 flex flex-col items-center py-1 rounded"
                  style={{ background: stat.bg }}
                >
                  <span className="text-xs opacity-60" style={{ color: stat.text }}>{stat.label}</span>
                  <span className={`font-bold ${sc.text}`} style={{ color: stat.text, fontFamily: 'JetBrains Mono, monospace' }}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>

          <div className={`flex-1 ${sc.padding} overflow-hidden`} style={{ background: 'var(--bg-card, #1a1a2e)' }}>
            <p className={`${sc.text} text-white/60 leading-relaxed line-clamp-3`}>
              {description}
            </p>
          </div>

          <div className={`absolute bottom-2 right-2 ${sc.padding} rounded`} style={{ background: rarityConfig.badge }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: rarityConfig.border }}>
              {rarity}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameCard;
